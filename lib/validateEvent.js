// Validates the event details form.
// This same function will run on the server in later stages, so a user
// can never save bad data even if they bypass the form in their browser.

export const EVENT_TYPES = [
  "Birthday",
  "Bridal shower",
  "Engagement party",
  "Graduation party",
  "Baby shower",
  "Anniversary",
  "Other celebration",
];

export const LIMITS = {
  minGuests: 1,
  maxGuests: 1000,
  minBudget: 50,
  maxBudget: 1000000,
  maxThemeLength: 300,
  maxYearsAhead: 3,
};

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function minEventDate() {
  return todayISO();
}

// `today` (YYYY-MM-DD) lets the server use a fixed time zone instead of its own clock
export function validateEvent(input, { today = todayISO() } = {}) {
  const errors = {};
  const data = {};

  // Event type
  const eventType = String(input.eventType ?? "").trim();
  if (!EVENT_TYPES.includes(eventType)) {
    errors.eventType = "Choose the kind of event you’re planning.";
  } else {
    data.eventType = eventType;
  }

  // Event date: YYYY-MM-DD, today or later, within a few years
  const eventDate = String(input.eventDate ?? "").trim();
  const dateIsValid =
    /^\d{4}-\d{2}-\d{2}$/.test(eventDate) && !Number.isNaN(Date.parse(`${eventDate}T00:00:00`));
  if (!dateIsValid) {
    errors.eventDate = "Pick the date of your event.";
  } else if (eventDate < today) {
    errors.eventDate = "Choose a date that hasn’t passed yet.";
  } else {
    const latestYear = Number(today.slice(0, 4)) + LIMITS.maxYearsAhead;
    if (eventDate > `${latestYear}${today.slice(4)}`) {
      errors.eventDate = `Choose a date within the next ${LIMITS.maxYearsAhead} years.`;
    } else {
      data.eventDate = eventDate;
    }
  }

  // Guest count: whole number in range
  const guests = Number(input.guestCount);
  if (!Number.isInteger(guests) || guests < LIMITS.minGuests || guests > LIMITS.maxGuests) {
    errors.guestCount = `Enter a whole number of guests between ${LIMITS.minGuests} and ${LIMITS.maxGuests.toLocaleString()}.`;
  } else {
    data.guestCount = guests;
  }

  // Budget: dollars, up to 2 decimal places
  const budgetText = String(input.budget ?? "").replace(/[$,\s]/g, "");
  const budget = Number(budgetText);
  if (
    budgetText === "" ||
    !/^\d+(\.\d{1,2})?$/.test(budgetText) ||
    budget < LIMITS.minBudget ||
    budget > LIMITS.maxBudget
  ) {
    errors.budget = `Enter a budget between $${LIMITS.minBudget} and $${LIMITS.maxBudget.toLocaleString()}.`;
  } else {
    data.budget = Math.round(budget * 100) / 100;
  }

  // Theme: optional free text, trimmed and length-limited
  const theme = String(input.theme ?? "").trim().replace(/\s+/g, " ");
  if (theme.length > LIMITS.maxThemeLength) {
    errors.theme = `Keep your theme under ${LIMITS.maxThemeLength} characters.`;
  } else {
    data.theme = theme;
  }

  return { ok: Object.keys(errors).length === 0, data, errors };
}
