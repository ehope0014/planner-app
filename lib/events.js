import { sql } from "@/lib/db";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isEventId(value) {
  return UUID_PATTERN.test(String(value));
}

// Every query here requires the owner's user id, so nobody, including the
// shared demo account, can read or change another person's event.
export async function findOwnedEvent(eventId, userId) {
  if (!isEventId(eventId) || !userId) return null;
  const rows = await sql`
    SELECT id, event_type, event_date::text AS event_date, guest_count,
           budget::float8 AS budget, theme, plan, is_premium
    FROM events
    WHERE id = ${eventId} AND user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function listOwnedEvents(userId) {
  return sql`
    SELECT id, event_type, event_date::text AS event_date, guest_count,
           budget::float8 AS budget, theme, is_premium,
           COALESCE(jsonb_array_length(plan->'tasks'), 0) AS task_count,
           (SELECT count(*)::int FROM jsonb_array_elements(COALESCE(plan->'tasks', '[]'::jsonb)) t
              WHERE (t->>'done')::boolean) AS done_count
    FROM events
    WHERE user_id = ${userId}
    ORDER BY event_date ASC, created_at DESC
    LIMIT 100
  `;
}
