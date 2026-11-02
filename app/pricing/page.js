import PricingPlans from "@/components/PricingPlans";

export const metadata = {
  title: "Pricing",
};

const questions = [
  {
    q: "What does “per event” mean?",
    a: "You pay $4.99 once for a single event, like one bridal shower or one birthday party. There’s no subscription and nothing renews.",
  },
  {
    q: "Can I try Planora before paying?",
    a: "Yes. The Basic plan is free and includes a personalized checklist and budget breakdown. Upgrade only if you want the full timeline and progress tracking.",
  },
  {
    q: "Can I upgrade an event I’ve already started?",
    a: "Yes. Upgrading keeps everything you’ve already planned and adds the Premium features to that event.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pb-10 pt-14 sm:px-8 md:pt-20">
      <div className="text-center">
        <h1 className="font-display text-5xl text-sage-900 md:text-7xl">Simple pricing.</h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted">
          Start for free. Upgrade a single event when you want the full timeline.
        </p>
      </div>

      <div className="mt-16">
        <PricingPlans />
      </div>

      <section className="mx-auto mt-24 max-w-2xl" aria-labelledby="faq-title">
        <h2 id="faq-title" className="font-display text-4xl text-sage-900">
          Questions
        </h2>
        <div className="mt-6 divide-y divide-beige border-y border-beige">
          {questions.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="text-2xl leading-none text-sage-700 transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-xl text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
