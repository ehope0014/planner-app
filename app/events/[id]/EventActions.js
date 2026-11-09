"use client";

import { useActionState } from "react";
import { deleteEvent, regeneratePlan } from "@/app/actions/events";

export default function EventActions({ eventId, isPremium }) {
  const [state, regenerateAction, regenerating] = useActionState(regeneratePlan, { error: null });

  return (
    <section aria-label="Event options" className="space-y-4">
      {isPremium && (
        <form
          action={regenerateAction}
          onSubmit={(e) => {
            if (!window.confirm("Create a fresh plan? Your current checklist and check-offs will be replaced.")) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="eventId" value={eventId} />
          <button
            type="submit"
            disabled={regenerating}
            className="w-full rounded-full border border-sage-700 px-6 py-3 font-medium text-sage-900 transition-colors hover:bg-sage-50 disabled:cursor-wait disabled:opacity-70"
          >
            {regenerating ? "Creating a fresh plan…" : "Regenerate plan"}
          </button>
          {regenerating && (
            <p className="mt-2 text-center text-sm text-muted" aria-live="polite">
              This takes about 20 seconds.
            </p>
          )}
          {state?.error && (
            <p role="alert" className="mt-2 text-center text-sm text-rose">
              {state.error}
            </p>
          )}
        </form>
      )}

      <form
        action={deleteEvent}
        onSubmit={(e) => {
          if (!window.confirm("Delete this event and its plan? This can’t be undone.")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="eventId" value={eventId} />
        <button type="submit" className="w-full rounded-full px-6 py-3 text-muted transition-colors hover:text-rose">
          Delete event
        </button>
      </form>
    </section>
  );
}
