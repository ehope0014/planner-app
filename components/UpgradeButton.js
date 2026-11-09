"use client";

import { useFormStatus } from "react-dom";
import { startCheckout } from "@/app/actions/billing";

function SubmitButton({ priceLabel, className }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Opening secure checkout…" : `Unlock Premium for ${priceLabel}`}
    </button>
  );
}

export default function UpgradeButton({ eventId, priceLabel, className = "" }) {
  return (
    <form action={startCheckout}>
      <input type="hidden" name="eventId" value={eventId} />
      <SubmitButton
        priceLabel={priceLabel}
        className={`rounded-full bg-sage-700 px-6 py-3 font-medium text-ivory transition-colors hover:bg-sage-900 disabled:cursor-wait disabled:opacity-70 ${className}`}
      />
    </form>
  );
}
