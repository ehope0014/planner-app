import Link from "next/link";

const free = [
  "Personalized planning checklist",
  "Budget split across venue, food, decor and more",
  "Saved to your dashboard, with check-offs",
];

const premium = [
  "Everything in Basic",
  "Timeline with a deadline for every task",
  "Catch-up dates if you start planning late",
  "Regenerate your plan anytime",
];

function Check({ className = "" }) {
  return (
    <svg className={`mt-1 h-4 w-4 shrink-0 ${className}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

export default function PricingPlans() {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-0">
      {/* Basic */}
      <div className="flex flex-col rounded-3xl border border-beige bg-white p-8 sm:p-10 md:rounded-r-none md:border-r-0">
        <h3 className="font-display text-3xl text-sage-900">Basic</h3>
        <p className="mt-2 text-muted">For a simple get-together.</p>
        <p className="mt-8 flex items-baseline gap-2">
          <span className="font-display text-6xl text-ink">$0</span>
          <span className="text-muted">free forever</span>
        </p>
        <ul className="mt-8 flex-1 space-y-3">
          {free.map((item) => (
            <li key={item} className="flex gap-3 text-ink">
              <Check className="text-sage-500" />
              {item}
            </li>
          ))}
        </ul>
        <Link
          href="/plan"
          className="mt-10 rounded-full border border-sage-700 px-6 py-3 text-center font-medium text-sage-900 transition-colors hover:bg-sage-50"
        >
          Start free
        </Link>
      </div>

      {/* Premium */}
      <div className="flex flex-col rounded-3xl bg-sage-900 p-8 text-ivory sm:p-10 md:-my-4 md:py-14">
        <h3 className="font-display text-3xl">Premium</h3>
        <p className="mt-2 text-sage-100/85">For the celebration you want to get exactly right.</p>
        <p className="mt-8 flex items-baseline gap-2">
          <span className="font-display text-6xl">$4.99</span>
          <span className="text-sage-100/85">per event, one time</span>
        </p>
        <ul className="mt-8 flex-1 space-y-3">
          {premium.map((item) => (
            <li key={item} className="flex gap-3">
              <Check className="text-sage-300" />
              {item}
            </li>
          ))}
        </ul>
        <Link
          href="/plan"
          className="mt-10 rounded-full bg-ivory px-6 py-3 text-center font-medium text-sage-900 transition-colors hover:bg-linen"
        >
          Plan with Premium
        </Link>
      </div>
    </div>
  );
}
