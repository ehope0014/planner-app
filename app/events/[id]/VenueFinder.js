"use client";

import { useState } from "react";
import { findVenues } from "@/app/actions/events";

function mapsLink(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Finds venues near the host's location and lets them add one to their checklist
export default function VenueFinder({ eventId, initialResult, onAddTask }) {
  const [location, setLocation] = useState(initialResult?.location ?? "");
  const [result, setResult] = useState(initialResult ?? null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [added, setAdded] = useState({}); // venue name -> "saving" | "done" | "error"

  async function handleSearch(e) {
    e.preventDefault();
    if (location.trim().length < 2) {
      setError("Enter a city, town or ZIP code.");
      return;
    }
    setSearching(true);
    setError("");
    const response = await findVenues(eventId, location).catch(() => null);
    setSearching(false);
    if (response?.ok) {
      setResult(response.result);
      setAdded({});
    } else {
      setError(response?.error ?? "We couldn’t find venues just now. Please try again in a minute.");
    }
  }

  async function handleAdd(venue) {
    setAdded((current) => ({ ...current, [venue.name]: "saving" }));
    const response = await onAddTask({
      title: `Contact ${venue.name} about availability`,
      detail: [venue.kind, venue.area, venue.estimatedCost].filter(Boolean).join(" · "),
      category: "Venue",
    });
    setAdded((current) => ({ ...current, [venue.name]: response?.ok ? "done" : "error" }));
  }

  return (
    <section aria-labelledby="venues-title">
      <h2 id="venues-title" className="font-display text-3xl text-sage-900">Find a venue</h2>
      <p className="mt-2 max-w-xl text-muted">
        Tell us where you’re hosting and Planora will suggest places that fit your guest count and venue budget.
      </p>

      <form onSubmit={handleSearch} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Your city, town or ZIP code</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={80}
            placeholder="City, town or ZIP code, e.g. State College, PA"
            className="w-full rounded-full border border-beige bg-white px-5 py-3 text-ink focus:border-sage-500"
          />
        </label>
        <button
          type="submit"
          disabled={searching}
          className="rounded-full bg-sage-700 px-7 py-3 font-medium text-ivory transition-colors hover:bg-sage-900 disabled:cursor-wait disabled:opacity-70"
        >
          {searching ? "Finding venues…" : result ? "Search again" : "Find venues"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-3 text-sm text-rose">{error}</p>
      )}
      {searching && (
        <p role="status" className="mt-3 text-sm text-muted">This usually takes about 10 seconds.</p>
      )}

      {result?.venues?.length > 0 && (
        <div className="mt-7">
          <p className="text-sm text-muted">Suggestions near {result.location}</p>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {result.venues.map((venue) => {
              const state = added[venue.name];
              return (
                <li key={venue.name} className="flex flex-col rounded-3xl border border-beige bg-white px-6 py-6">
                  <p className="text-xs uppercase tracking-wide text-sage-500">{venue.kind}</p>
                  <h3 className="mt-1 font-display text-2xl leading-snug text-ink">{venue.name}</h3>
                  <p className="text-sm text-muted">{venue.area}</p>
                  {venue.why && <p className="mt-3 text-ink">{venue.why}</p>}
                  {venue.estimatedCost && (
                    <p className="mt-2 text-sm text-sage-700">Estimated: {venue.estimatedCost}</p>
                  )}
                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
                    <a
                      href={mapsLink(venue.mapsQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-sage-300 px-4 py-2 text-sm font-medium text-sage-900 transition-colors hover:border-sage-700"
                    >
                      {venue.named ? "View on map" : "Search the map"}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleAdd(venue)}
                      disabled={state === "saving" || state === "done"}
                      className="rounded-full px-4 py-2 text-sm font-medium text-sage-700 underline decoration-sage-300 underline-offset-4 hover:decoration-sage-700 disabled:no-underline disabled:opacity-80"
                    >
                      {state === "done"
                        ? "Added to checklist ✓"
                        : state === "saving"
                          ? "Adding…"
                          : state === "error"
                            ? "Try adding again"
                            : "Add to checklist"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {result.advice && <p className="mt-5 max-w-2xl text-ink">{result.advice}</p>}
          <p className="mt-3 text-sm text-muted">
            Suggestions are made by AI. Check each place’s hours, prices and availability before you book.
          </p>
        </div>
      )}
    </section>
  );
}
