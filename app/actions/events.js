"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { validateEvent } from "@/lib/validateEvent";
import { generatePlanWithAI } from "@/lib/ai";
import { buildPlan, daysUntil, todayInNewYork } from "@/lib/planMath";
import { findOwnedEvent, isEventId } from "@/lib/events";

const DAILY_AI_LIMIT = 20; // plans per account per 24 hours, to cap AI costs

const GENERIC_AI_ERROR =
  "We couldn’t create your plan just now. Please try again in a minute.";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/plan");
  return user;
}

// Checks and records AI usage. Returns false if the account hit today's limit.
async function useAiAllowance(userId) {
  const rows = await sql`
    SELECT count(*)::int AS n FROM ai_generations
    WHERE user_id = ${userId} AND created_at > now() - interval '24 hours'
  `;
  if (rows[0].n >= DAILY_AI_LIMIT) return false;
  await sql`INSERT INTO ai_generations (user_id) VALUES (${userId})`;
  return true;
}

export async function createEvent(prevState, formData) {
  const user = await requireUser();
  const today = todayInNewYork();

  const values = {
    eventType: formData.get("eventType"),
    eventDate: formData.get("eventDate"),
    guestCount: formData.get("guestCount"),
    budget: formData.get("budget"),
    theme: formData.get("theme"),
  };
  const result = validateEvent(values, { today });
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  if (!(await useAiAllowance(user.id))) {
    return {
      error: "You’ve created a lot of plans today. Please come back tomorrow to make more.",
      values,
    };
  }

  const event = result.data;
  let plan;
  try {
    const aiOutput = await generatePlanWithAI(event, daysUntil(event.eventDate, today));
    plan = buildPlan(aiOutput, event, today);
    if (plan.tasks.length < 5) throw new Error(`AI plan had only ${plan.tasks.length} usable tasks.`);
  } catch (error) {
    console.error("Plan generation failed:", error);
    return { error: GENERIC_AI_ERROR, values };
  }

  const rows = await sql`
    INSERT INTO events (user_id, event_type, event_date, guest_count, budget, theme, plan, is_premium)
    VALUES (${user.id}, ${event.eventType}, ${event.eventDate}, ${event.guestCount},
            ${event.budget}, ${event.theme}, ${JSON.stringify(plan)}::jsonb, ${user.plan === "premium"})
    RETURNING id
  `;

  revalidatePath("/dashboard");
  redirect(`/events/${rows[0].id}`);
}

export async function toggleTask(eventId, taskId, done) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  if (typeof taskId !== "string" || taskId.length > 10 || typeof done !== "boolean") {
    return { ok: false };
  }

  const event = await findOwnedEvent(eventId, user.id);
  if (!event?.plan?.tasks) return { ok: false };

  const tasks = event.plan.tasks.map((task) => (task.id === taskId ? { ...task, done } : task));
  const plan = { ...event.plan, tasks };

  await sql`
    UPDATE events SET plan = ${JSON.stringify(plan)}::jsonb, updated_at = now()
    WHERE id = ${event.id} AND user_id = ${user.id}
  `;
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function regeneratePlan(prevState, formData) {
  const user = await requireUser();
  const event = await findOwnedEvent(formData.get("eventId"), user.id);
  if (!event) return { error: "We couldn’t find that event." };

  if (!(event.is_premium || user.plan === "premium")) {
    return { error: "Regenerating a plan is part of Premium." };
  }
  if (!(await useAiAllowance(user.id))) {
    return { error: "You’ve created a lot of plans today. Please come back tomorrow." };
  }

  const today = todayInNewYork();
  const details = {
    eventType: event.event_type,
    eventDate: event.event_date,
    guestCount: event.guest_count,
    budget: Number(event.budget),
    theme: event.theme,
  };

  try {
    const aiOutput = await generatePlanWithAI(details, daysUntil(details.eventDate, today));
    const plan = buildPlan(aiOutput, details, today);
    if (plan.tasks.length < 5) throw new Error(`AI plan had only ${plan.tasks.length} usable tasks.`);
    await sql`
      UPDATE events SET plan = ${JSON.stringify(plan)}::jsonb, updated_at = now()
      WHERE id = ${event.id} AND user_id = ${user.id}
    `;
  } catch (error) {
    console.error("Plan regeneration failed:", error);
    return { error: GENERIC_AI_ERROR };
  }

  revalidatePath(`/events/${event.id}`);
  revalidatePath("/dashboard");
  return { error: null, regenerated: Date.now() };
}

export async function deleteEvent(formData) {
  const user = await requireUser();
  const eventId = formData.get("eventId");
  if (isEventId(eventId)) {
    await sql`DELETE FROM events WHERE id = ${eventId} AND user_id = ${user.id}`;
  }
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
