"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { validateEvent } from "@/lib/validateEvent";
import { randomUUID } from "node:crypto";
import { generatePlanWithAI, suggestVenuesWithAI } from "@/lib/ai";
import {
  MAX_TASKS,
  buildCustomTask,
  buildPlan,
  cleanLocation,
  cleanVenues,
  daysUntil,
  todayInNewYork,
} from "@/lib/planMath";
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

const TASK_ID_PATTERN = /^[a-z0-9]{1,10}$/i;

export async function toggleTask(eventId, taskId, done) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  if (typeof taskId !== "string" || !TASK_ID_PATTERN.test(taskId) || typeof done !== "boolean") {
    return { ok: false };
  }

  const event = await findOwnedEvent(eventId, user.id);
  if (!event?.plan?.tasks) return { ok: false };

  // Changes just this one task inside the database, so two quick clicks
  // (or adding a task at the same time) can't overwrite each other
  await sql`
    UPDATE events
    SET plan = jsonb_set(plan, '{tasks}', COALESCE((
          SELECT jsonb_agg(
                   CASE WHEN t->>'id' = ${taskId}
                        THEN jsonb_set(t, '{done}', to_jsonb(${done}::boolean))
                        ELSE t END
                   ORDER BY pos)
          FROM jsonb_array_elements(plan->'tasks') WITH ORDINALITY AS list(t, pos)
        ), '[]'::jsonb)),
        updated_at = now()
    WHERE id = ${event.id} AND user_id = ${user.id} AND jsonb_typeof(plan->'tasks') = 'array'
  `;
  revalidatePath("/dashboard");
  return { ok: true };
}

// Adds a task the host typed in to their own plan
export async function addTask(eventId, input) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in again." };

  const event = await findOwnedEvent(eventId, user.id);
  if (!event?.plan?.tasks) return { ok: false, error: "We couldn’t find that event." };

  const id = `c${randomUUID().replace(/-/g, "").slice(0, 8)}`;
  const result = buildCustomTask(input, event.event_date, todayInNewYork(), id);
  if (!result.ok) return result;

  const rows = await sql`
    UPDATE events
    SET plan = jsonb_set(plan, '{tasks}', (plan->'tasks') || ${JSON.stringify([result.task])}::jsonb),
        updated_at = now()
    WHERE id = ${event.id} AND user_id = ${user.id}
      AND jsonb_typeof(plan->'tasks') = 'array'
      AND jsonb_array_length(plan->'tasks') < ${MAX_TASKS}
    RETURNING id
  `;
  if (rows.length === 0) {
    return { ok: false, error: `This plan already has ${MAX_TASKS} tasks. Remove one to add another.` };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/events/${event.id}`);

  // Basic plans don't show dates, so don't send one back
  const isPremium = event.is_premium || user.plan === "premium";
  const { dueDate, catchUp, ...basicTask } = result.task;
  return { ok: true, task: isPremium ? result.task : basicTask };
}

// Removes one task (the host's own or one from the generated plan)
export async function deleteTask(eventId, taskId) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  if (typeof taskId !== "string" || !TASK_ID_PATTERN.test(taskId)) return { ok: false };

  const event = await findOwnedEvent(eventId, user.id);
  if (!event?.plan?.tasks) return { ok: false };

  await sql`
    UPDATE events
    SET plan = jsonb_set(plan, '{tasks}', COALESCE((
          SELECT jsonb_agg(t ORDER BY pos)
          FROM jsonb_array_elements(plan->'tasks') WITH ORDINALITY AS list(t, pos)
          WHERE t->>'id' <> ${taskId}
        ), '[]'::jsonb)),
        updated_at = now()
    WHERE id = ${event.id} AND user_id = ${user.id} AND jsonb_typeof(plan->'tasks') = 'array'
  `;
  revalidatePath("/dashboard");
  revalidatePath(`/events/${event.id}`);
  return { ok: true };
}

// Suggests venues near the host's location and saves them with the event
export async function findVenues(eventId, rawLocation) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in again." };

  const event = await findOwnedEvent(eventId, user.id);
  if (!event?.plan) return { ok: false, error: "We couldn’t find that event." };

  const location = cleanLocation(rawLocation);
  if (!location) {
    return { ok: false, error: "Enter a city, town or ZIP code, like “State College, PA” or “16801”." };
  }
  if (!(await useAiAllowance(user.id))) {
    return { ok: false, error: "You’ve used a lot of AI searches today. Please come back tomorrow." };
  }

  const venueBudget =
    event.plan.budget?.find((item) => item.category === "Venue")?.amount ?? Number(event.budget) * 0.35;
  const details = {
    eventType: event.event_type,
    eventDate: event.event_date,
    guestCount: event.guest_count,
    budget: Number(event.budget),
    theme: event.theme,
  };

  let result;
  try {
    const aiOutput = await suggestVenuesWithAI(details, location, venueBudget);
    result = cleanVenues(aiOutput, location);
    if (result.venues.length === 0) throw new Error("AI returned no usable venues.");
  } catch (error) {
    console.error("Venue search failed:", error);
    return { ok: false, error: "We couldn’t find venues just now. Please try again in a minute." };
  }

  await sql`
    UPDATE events
    SET plan = jsonb_set(plan, '{venues}', ${JSON.stringify(result)}::jsonb), updated_at = now()
    WHERE id = ${event.id} AND user_id = ${user.id}
  `;
  return { ok: true, result };
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

    // Keep the tasks the host added and any venues they found
    const ownTasks = (event.plan?.tasks ?? []).filter((task) => task.custom);
    plan.tasks = [...plan.tasks, ...ownTasks].slice(0, MAX_TASKS);
    if (event.plan?.venues) plan.venues = event.plan.venues;

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
