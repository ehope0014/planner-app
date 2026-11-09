"use client";

import { useActionState, useEffect, useState } from "react";
import { createEvent } from "@/app/actions/events";
import { EVENT_TYPES, LIMITS, minEventDate, validateEvent } from "@/lib/validateEvent";

const empty = { eventType: "", eventDate: "", guestCount: "", budget: "", theme: "" };

const inputClass =
  "block w-full rounded-xl border bg-ivory px-4 py-3 text-ink placeholder:text-muted/60 focus:border-sage-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sage-300";

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="font-medium text-ink">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-rose">
          {error}
        </p>
      )}
    </div>
  );
}

export default function EventForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [minDate, setMinDate] = useState(undefined);
  const [state, formAction, pending] = useActionState(createEvent, { error: null });

  // Set the earliest allowed date using the visitor's own clock
  useEffect(() => {
    setMinDate(minEventDate());
  }, []);

  // Show any problems the server found (it re-checks everything)
  useEffect(() => {
    if (state?.errors) setErrors(state.errors);
  }, [state]);

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  }

  // Check in the browser first for instant feedback; only valid forms are sent
  function handleSubmit(event) {
    const result = validateEvent(values);
    if (!result.ok) {
      event.preventDefault();
      setErrors(result.errors);
      const firstInvalid = Object.keys(result.errors)[0];
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    setErrors({});
  }

  function describedBy(name, hasHint) {
    const ids = [];
    if (hasHint) ids.push(`${name}-hint`);
    if (errors[name]) ids.push(`${name}-error`);
    return ids.length ? ids.join(" ") : undefined;
  }

  const border = (name) => (errors[name] ? "border-rose" : "border-beige");

  return (
    <form
      noValidate
      action={formAction}
      onSubmit={handleSubmit}
      aria-busy={pending}
      className="space-y-8 rounded-3xl border border-beige bg-white p-6 sm:p-10"
    >
      <Field id="eventType" label="What are you celebrating?" error={errors.eventType}>
        <div className="relative">
        <select
          id="eventType"
          name="eventType"
          value={values.eventType}
          onChange={update}
          aria-invalid={Boolean(errors.eventType)}
          aria-describedby={describedBy("eventType")}
          className={`${inputClass} ${border("eventType")} appearance-none pr-10`}
        >
          <option value="" disabled>
            Choose an event type
          </option>
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 text-sage-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M1 1.5l5 5 5-5" />
        </svg>
        </div>
      </Field>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="eventDate" label="Event date" error={errors.eventDate}>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            min={minDate}
            value={values.eventDate}
            onChange={update}
            aria-invalid={Boolean(errors.eventDate)}
            aria-describedby={describedBy("eventDate")}
            className={`${inputClass} ${border("eventDate")}`}
          />
        </Field>

        <Field id="guestCount" label="Number of guests" error={errors.guestCount}>
          <input
            id="guestCount"
            name="guestCount"
            type="number"
            inputMode="numeric"
            min={LIMITS.minGuests}
            max={LIMITS.maxGuests}
            step="1"
            placeholder="40"
            value={values.guestCount}
            onChange={update}
            aria-invalid={Boolean(errors.guestCount)}
            aria-describedby={describedBy("guestCount")}
            className={`${inputClass} ${border("guestCount")}`}
          />
        </Field>
      </div>

      <Field
        id="budget"
        label="Total budget"
        hint="Everything included: venue, food, decorations and extras."
        error={errors.budget}
      >
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
            $
          </span>
          <input
            id="budget"
            name="budget"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="1,200"
            value={values.budget}
            onChange={update}
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={describedBy("budget", true)}
            className={`${inputClass} ${border("budget")} pl-8`}
          />
        </div>
      </Field>

      <Field
        id="theme"
        label="Theme and style (optional)"
        hint="Colors, mood, or anything you’ve been picturing."
        error={errors.theme}
      >
        <textarea
          id="theme"
          name="theme"
          rows={3}
          maxLength={LIMITS.maxThemeLength}
          placeholder="Garden party with soft greens, white florals and candlelight"
          value={values.theme}
          onChange={update}
          aria-invalid={Boolean(errors.theme)}
          aria-describedby={describedBy("theme", true)}
          className={`${inputClass} ${border("theme")} resize-y`}
        />
        <p className="mt-1 text-right text-sm text-muted">
          {values.theme.length}/{LIMITS.maxThemeLength}
        </p>
      </Field>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-rose/10 px-4 py-3 text-rose">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-sage-700 px-8 py-4 font-medium text-ivory transition-colors hover:bg-sage-900 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          {pending ? "Planning your celebration…" : "Create my plan"}
        </button>
        <p className="text-sm text-muted" aria-live="polite">
          {pending
            ? "Writing your checklist, budget and timeline. This takes about 20 seconds."
            : "Your plan is saved to your dashboard."}
        </p>
      </div>
    </form>
  );
}
