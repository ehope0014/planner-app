"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { findOwnedEvent } from "@/lib/events";
import { createCheckoutSession } from "@/lib/stripe";

export async function startCheckout(formData) {
  const eventId = String(formData.get("eventId") ?? "");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/events/${encodeURIComponent(eventId)}`);

  // Only the event's owner can pay to upgrade it
  const event = await findOwnedEvent(eventId, user.id);
  if (!event) redirect("/dashboard");
  if (event.is_premium || user.plan === "premium") redirect(`/events/${event.id}`);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");

  let checkoutUrl;
  try {
    checkoutUrl = await createCheckoutSession({ user, event, origin: `${proto}://${host}` });
  } catch (error) {
    console.error("Could not start checkout:", error);
    redirect(`/events/${event.id}?checkout=error`);
  }
  redirect(checkoutUrl);
}
