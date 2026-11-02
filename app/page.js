import Link from "next/link";
import Sprig from "@/components/Sprig";
import PricingPlans from "@/components/PricingPlans";

const steps = [
  {
    title: "Describe your celebration",
    text: "Event type, date, guest count, budget and the feeling you’re going for. It takes about two minutes.",
  },
  {
    title: "Get a plan made for it",
    text: "Planora builds a checklist, a budget split and a timeline that fit your event, not a generic template.",
  },
  {
    title: "Check it off as you go",
    text: "Your plan is saved to your dashboard. Come back anytime, tick off what’s done, and see what’s next.",
  },
];

const features = [
  {
    title: "A checklist that knows your event",
    text: "A bridal shower for 40 needs different things than a graduation party for 120. Your list reflects that.",
  },
  {
    title: "A budget that adds up",
    text: "Your total is divided across venue, food, decorations, entertainment and extras, and every dollar is accounted for.",
  },
  {
    title: "A timeline that counts back from the day",
    text: "Each task gets a deadline based on your date, so you know what to book this week and what can wait.",
  },
  {
    title: "Everything in one place",
    text: "Save your events, return whenever you like, and pick up exactly where you left off.",
  },
];

const occasions = [
  "Birthdays",
  "Bridal showers",
  "Engagement parties",
  "Graduations",
  "Baby showers",
  "Anniversaries",
];

const sampleTasks = [
  { task: "Reserve the garden venue", when: "12 weeks before", done: true },
  { task: "Send invitations", when: "6 weeks before", done: true },
  { task: "Confirm florals and tableware", when: "3 weeks before", done: false },
  { task: "Final headcount to caterer", when: "1 week before", done: false },
];

const sampleBudget = [
  { label: "Venue", amount: 420, share: 35 },
  { label: "Food and drink", amount: 360, share: 30 },
  { label: "Decorations", amount: 180, share: 15 },
  { label: "Entertainment", amount: 120, share: 10 },
  { label: "Other", amount: 120, share: 10 },
];

function SamplePlanCard() {
  return (
    <figure className="stationery relative rounded-sm px-8 pb-9 pt-10 sm:px-11">
      <figcaption className="text-sm text-muted">Sample plan</figcaption>
      <p className="mt-1 font-display text-[2.1rem] leading-tight text-sage-900">
        Grace’s bridal shower
      </p>
      <p className="text-muted">Saturday, June 6 for 40 guests</p>

      <ul className="mt-7 space-y-3.5">
        {sampleTasks.map((item) => (
          <li key={item.task} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                item.done ? "border-sage-700 bg-sage-700" : "border-sage-500"
              }`}
            >
              {item.done && (
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="#fbf8f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 6.2l2.3 2.2L9.5 3.6" />
                </svg>
              )}
            </span>
            <span className="flex-1">
              <span className={item.done ? "text-muted line-through decoration-sage-300" : "text-ink"}>
                {item.task}
              </span>
              <span className="block text-sm text-muted">{item.when}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-beige pt-6">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-muted">Budget</p>
          <p className="font-display text-2xl text-sage-900">$1,200</p>
        </div>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full" aria-hidden="true">
          {sampleBudget.map((item, i) => (
            <span
              key={item.label}
              style={{ width: `${item.share}%` }}
              className={["bg-sage-900", "bg-sage-700", "bg-sage-500", "bg-sage-300", "bg-beige"][i]}
            />
          ))}
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {sampleBudget.map((item) => (
            <li key={item.label} className="flex justify-between text-muted">
              <span>{item.label}</span>
              <span className="text-ink">${item.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 md:grid-cols-[1.1fr_1fr] md:gap-10 md:pb-28 md:pt-20">
          <div className="relative z-10">
            <h1 className="font-display text-[3.4rem] leading-[1.02] text-sage-900 sm:text-7xl lg:text-[5.6rem]">
              Your event, beautifully planned.
            </h1>
            <p className="mt-7 max-w-md text-lg text-muted">
              Tell Planora about your celebration. Get a checklist, a budget that adds up to what you can
              spend, and a timeline that counts down to the day.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/plan"
                className="rounded-full bg-sage-700 px-8 py-3.5 font-medium text-ivory transition-colors hover:bg-sage-900"
              >
                Get started
              </Link>
              <Link
                href="/pricing"
                className="rounded-full px-5 py-3.5 font-medium text-sage-900 underline decoration-sage-300 underline-offset-[6px] hover:decoration-sage-700"
              >
                See pricing
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted">Free to start. No planner fees.</p>
          </div>

          <div className="relative mx-auto w-full max-w-md md:mr-0">
            <Sprig
              animate
              className="pointer-events-none absolute -left-24 -top-16 h-[30rem] w-auto text-sage-500 sm:-left-32"
            />
            <div className="relative md:rotate-[1.5deg]">
              <SamplePlanCard />
            </div>
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section aria-label="Occasions Planora plans" className="border-y border-beige bg-linen">
        <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-7 font-display text-2xl text-sage-700 sm:px-8 sm:text-[1.7rem]">
          {occasions.map((name, i) => (
            <li key={name} className="flex items-center gap-8">
              {name}
              {i < occasions.length - 1 && (
                <svg aria-hidden="true" viewBox="0 0 20 10" className="hidden h-2.5 w-5 text-sage-300 sm:block" fill="currentColor">
                  <path d="M0 5C5 0 15 0 20 5C15 10 5 10 0 5Z" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <h2 className="max-w-xl font-display text-5xl leading-tight text-sage-900 md:text-6xl">
            Three steps from idea to plan.
          </h2>
          <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
            {steps.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="font-display text-7xl leading-none text-sage-300" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-xl font-medium text-ink">{step.title}</h3>
                <p className="mt-2 max-w-sm text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 md:grid-cols-[1fr_1.3fr] md:py-32">
          <div className="md:sticky md:top-32 md:self-start">
            <h2 className="font-display text-5xl leading-tight text-sage-900 md:text-6xl">
              Everything a planner would hand you.
            </h2>
            <p className="mt-6 max-w-sm text-lg text-muted">
              Without the planner’s fee. Planora is built for hosts who care how the day feels and want a
              clear path to get there.
            </p>
          </div>
          <dl className="divide-y divide-beige border-y border-beige">
            {features.map((feature) => (
              <div key={feature.title} className="py-8">
                <dt className="font-display text-3xl text-ink">{feature.title}</dt>
                <dd className="mt-3 max-w-lg text-muted">{feature.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24">
        <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8 md:py-32">
          <div className="text-center">
            <h2 className="font-display text-5xl text-sage-900 md:text-6xl">Simple pricing.</h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-muted">
              Start for free. Upgrade a single event when you want the full timeline.
            </p>
          </div>
          <div className="mt-16">
            <PricingPlans />
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="px-5 sm:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-sage-100 px-8 py-20 text-center sm:px-16">
          <Sprig className="pointer-events-none absolute -bottom-24 -right-10 h-96 w-auto rotate-[200deg] text-sage-300" />
          <h2 className="relative font-display text-5xl leading-tight text-sage-900 md:text-6xl">
            Start planning your celebration.
          </h2>
          <p className="relative mx-auto mt-5 max-w-md text-lg text-muted">
            Two minutes of details. A plan you can actually follow.
          </p>
          <Link
            href="/plan"
            className="relative mt-10 inline-block rounded-full bg-sage-700 px-8 py-3.5 font-medium text-ivory transition-colors hover:bg-sage-900"
          >
            Get started
          </Link>
        </div>
      </section>
    </>
  );
}
