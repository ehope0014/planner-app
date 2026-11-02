"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function EventForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [minDate, setMinDate] = useState(undefined);

  // Set the earliest allowed date using the visitor's own clock
  useEffect(() => {
    setMinDate(minEventDate());
  }, []);

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = validateEvent(values);
    if (!result.ok) {
      setErrors(result.errors);
      const firstInvalid = Object.keys(result.errors)[0];
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    setErrors({});
    setSubmitted(result.data);
  }

  function describedBy(name, hasHint) {
    const ids = [];
    if (hasHint) ids.push(`${name}-hint`);
    if (errors[name]) ids.push(`${name}-error`);
    return ids.length ? ids.join(" ") : undefined;
  }

  const border = (name) => (errors[name] ? "border-rose" : "border-beige");

  if (submitted) {
    return (
      <div className="stationery rounded-sm px-8 py-10 sm:px-12" role="status">
        <h2 className="font-display text-4xl text-sage-900">Your event details are ready.</h2>
        <dl className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Event</dt>
            <dd className="text-lg text-ink">{submitted.eventType}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Date</dt>
            <dd className="text-lg text-ink">{formatDate(submitted.eventDate)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Guests</dt>
            <dd className="text-lg text-ink">{submitted.guestCount.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Budget</dt>
            <dd className="text-lg text-ink">
              {submitted.budget.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </dd>
          </div>
          {submitted.theme && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted">Theme</dt>
              <dd className="text-lg text-ink">{submitted.theme}</dd>
            </div>
          )}
        </dl>
        <p className="mt-8 rounded-xl bg-sage-50 px-5 py-4 text-sage-900">
          Personalized plan generation is coming to Planora soon. Your details haven’t been saved yet.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => setSubmitted(null)}
            className="rounded-full border border-sage-700 px-6 py-3 font-medium text-sage-900 hover:bg-sage-50"
          >
            Edit details
          </button>
          <Link href="/dashboard" className="rounded-full px-6 py-3 font-medium text-sage-900 underline decoration-sage-300 underline-offset-[6px]">
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
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

      <button
        type="submit"
        className="w-full rounded-full bg-sage-700 px-8 py-4 font-medium text-ivory transition-colors hover:bg-sage-900 sm:w-auto"
      >
        Create my plan
      </button>
    </form>
  );
}
