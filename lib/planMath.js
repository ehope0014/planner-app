// Pure helpers that turn the AI's suggestions into a plan we can trust.
// No database or network here, so this logic is easy to test.

export const BUDGET_CATEGORIES = ["Venue", "Food and drink", "Decorations", "Entertainment", "Other"];
const DEFAULT_SHARES = [35, 30, 15, 10, 10];

export const TASK_CATEGORIES = [
  "Venue",
  "Food and drink",
  "Decorations",
  "Entertainment",
  "Guests and invitations",
  "Other",
];

const DAY_MS = 24 * 60 * 60 * 1000;

function clampText(value, max) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function isoToUTC(iso) {
  return Date.parse(`${iso}T00:00:00Z`);
}

function utcToISO(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

// Splits a budget across the five categories so the amounts add up to the
// exact total, to the cent. The AI only suggests the percentages.
export function allocateBudget(total, suggestions = []) {
  const byName = new Map(
    (Array.isArray(suggestions) ? suggestions : []).map((item) => [item?.category, item])
  );

  let shares = BUDGET_CATEGORIES.map((name) => {
    const pct = Number(byName.get(name)?.percent);
    return Number.isFinite(pct) && pct > 0 ? Math.min(pct, 100) : 0;
  });
  if (shares.reduce((a, b) => a + b, 0) <= 0) shares = [...DEFAULT_SHARES];
  const shareSum = shares.reduce((a, b) => a + b, 0);

  const totalCents = Math.round(Number(total) * 100);
  const exact = shares.map((s) => (totalCents * s) / shareSum);
  const cents = exact.map(Math.floor);
  let remainder = totalCents - cents.reduce((a, b) => a + b, 0);

  // Hand leftover cents to the categories with the largest fractions
  const order = exact
    .map((value, i) => ({ i, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; remainder > 0; k = (k + 1) % order.length, remainder--) {
    cents[order[k].i] += 1;
  }

  return BUDGET_CATEGORIES.map((name, i) => ({
    category: name,
    amount: cents[i] / 100,
    percent: Math.round((cents[i] / Math.max(totalCents, 1)) * 1000) / 10,
    note: clampText(byName.get(name)?.note, 200),
  }));
}

// Cleans the AI's task list and gives every task a due date counted back from
// the event. Tasks whose ideal date has already passed are due today.
export function buildTasks(rawTasks, eventDateISO, todayISO) {
  const eventMs = isoToUTC(eventDateISO);
  const todayMs = Math.min(isoToUTC(todayISO), eventMs);
  const seen = new Set();

  const tasks = (Array.isArray(rawTasks) ? rawTasks : [])
    .map((raw) => {
      const title = clampText(raw?.title, 100);
      if (!title || seen.has(title.toLowerCase())) return null;
      seen.add(title.toLowerCase());

      let daysBefore = Math.round(Number(raw?.days_before));
      if (!Number.isFinite(daysBefore)) daysBefore = 7;
      daysBefore = Math.max(0, Math.min(daysBefore, 730));

      const idealMs = eventMs - daysBefore * DAY_MS;
      const dueMs = Math.max(idealMs, todayMs);

      return {
        title,
        detail: clampText(raw?.detail, 240),
        category: TASK_CATEGORIES.includes(raw?.category) ? raw.category : "Other",
        dueDate: utcToISO(dueMs),
        catchUp: idealMs < todayMs, // ideally would have been done already
        done: false,
      };
    })
    .filter(Boolean)
    .slice(0, 30)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return tasks.map((task, i) => ({ id: `t${i + 1}`, ...task }));
}

export function buildPlan(aiOutput, event, todayISO) {
  const tips = (Array.isArray(aiOutput?.tips) ? aiOutput.tips : [])
    .map((tip) => clampText(tip, 220))
    .filter(Boolean)
    .slice(0, 5);

  return {
    summary: clampText(aiOutput?.summary, 400),
    tasks: buildTasks(aiOutput?.tasks, event.eventDate, todayISO),
    budget: allocateBudget(event.budget, aiOutput?.budget),
    tips,
    generatedAt: new Date().toISOString(),
  };
}

// Groups dated tasks into the phases shown on the timeline
export function timelinePhase(dueDateISO, eventDateISO) {
  const days = Math.round((isoToUTC(eventDateISO) - isoToUTC(dueDateISO)) / DAY_MS);
  if (days <= 0) return "Event day";
  if (days <= 7) return "Final week";
  if (days <= 30) return "2 to 4 weeks before";
  if (days <= 90) return "1 to 3 months before";
  return "3 or more months before";
}

export const TIMELINE_PHASES = [
  "3 or more months before",
  "1 to 3 months before",
  "2 to 4 weeks before",
  "Final week",
  "Event day",
];

export function daysUntil(eventDateISO, todayISO) {
  return Math.round((isoToUTC(eventDateISO) - isoToUTC(todayISO)) / DAY_MS);
}

export function formatEventDate(iso, options = {}) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function todayInNewYork() {
  // Planora's customers are US-based; Eastern time keeps "today" stable for them
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}
