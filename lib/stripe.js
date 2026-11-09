import { sql } from "@/lib/db";

// Talks to Stripe from the server only. STRIPE_SECRET_KEY lives in Vercel.
const STRIPE_API = "https://api.stripe.com/v1";
const SESSION_ID_PATTERN = /^cs_(test|live)_[A-Za-z0-9]{10,250}$/;

// $4.99 by default. For the Week 4 live $1 test, set PREMIUM_PRICE_CENTS=100
// in Vercel temporarily, then remove it afterwards.
export function premiumPriceCents() {
  const fromEnv = Number(process.env.PREMIUM_PRICE_CENTS);
  return Number.isInteger(fromEnv) && fromEnv >= 50 ? fromEnv : 499;
}

export function premiumPriceLabel() {
  return (premiumPriceCents() / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

async function stripeRequest(path, { method = "GET", params } = {}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set in Vercel.");

  const response = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params ? new URLSearchParams(params).toString() : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Stripe error (${response.status}): ${data?.error?.message ?? "unknown"}`);
  }
  return data;
}

// Creates a Stripe-hosted checkout page for upgrading one event.
export async function createCheckoutSession({ user, event, origin }) {
  const cents = premiumPriceCents();
  const session = await stripeRequest("/checkout/sessions", {
    method: "POST",
    params: {
      mode: "payment",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(cents),
      "line_items[0][price_data][product_data][name]": `Planora Premium: ${event.event_type}`,
      "line_items[0][price_data][product_data][description]":
        "Dated timeline and unlimited plan regeneration for one event.",
      customer_email: user.email,
      client_reference_id: user.id,
      "metadata[event_id]": event.id,
      "metadata[user_id]": user.id,
      success_url: `${origin}/events/${event.id}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/${event.id}?checkout=cancelled`,
    },
  });

  await sql`
    INSERT INTO purchases (user_id, event_id, stripe_session_id, amount_cents, status)
    VALUES (${user.id}, ${event.id}, ${session.id}, ${cents}, 'pending')
    ON CONFLICT (stripe_session_id) DO NOTHING
  `;
  return session.url;
}

// Asks Stripe directly whether a checkout was paid, and only then unlocks the
// event. The browser can't fake this: the answer comes from Stripe's servers.
export async function confirmCheckout(sessionId, userId, eventId) {
  if (!SESSION_ID_PATTERN.test(String(sessionId))) return false;

  const session = await stripeRequest(`/checkout/sessions/${sessionId}`);
  if (session.status === "expired") {
    // Abandoned checkout: stop rechecking it
    await sql`UPDATE purchases SET status = 'expired' WHERE stripe_session_id = ${sessionId} AND user_id = ${userId}`;
    return false;
  }
  const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  const matches = session.metadata?.user_id === userId && session.metadata?.event_id === eventId;
  if (!paid || !matches) return false;

  await sql`
    UPDATE purchases SET status = 'paid', paid_at = now()
    WHERE stripe_session_id = ${sessionId} AND user_id = ${userId}
  `;
  await sql`
    UPDATE events SET is_premium = true, updated_at = now()
    WHERE id = ${eventId} AND user_id = ${userId}
  `;
  return true;
}

// Safety net: if someone paid but closed the tab before returning, their
// event is unlocked the next time they open it.
export async function confirmPendingPurchases(userId, eventId) {
  const pending = await sql`
    SELECT stripe_session_id FROM purchases
    WHERE user_id = ${userId} AND event_id = ${eventId} AND status = 'pending'
      AND created_at > now() - interval '3 days'
    ORDER BY created_at DESC
    LIMIT 3
  `;
  for (const row of pending) {
    try {
      if (await confirmCheckout(row.stripe_session_id, userId, eventId)) return true;
    } catch (error) {
      console.error("Could not check pending purchase:", error);
    }
  }
  return false;
}
