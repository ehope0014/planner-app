import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { findOwnedEvent } from "@/lib/events";
import { daysUntil, formatEventDate, todayInNewYork } from "@/lib/planMath";
import EventPlanner from "./EventPlanner";
import EventActions from "./EventActions";

export const metadata = { title: "Your event plan" };

// Regenerating a plan calls the AI, which can take up to ~30 seconds
export const maxDuration = 60;

const BAR_COLORS = ["bg-sage-900", "bg-sage-700", "bg-sage-500", "bg-sage-300", "bg-beige"];

const money = (value, cents = false) =>
  Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });

function countdown(days) {
  if (days < 0) return "This event has passed";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export default async function EventPage({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/events/${encodeURIComponent(id)}`);

  const event = await findOwnedEvent(id, user.id);
  if (!event || !event.plan) notFound();

  const isPremium = event.is_premium || user.plan === "premium";
  const plan = event.plan;
  const days = daysUntil(event.event_date, todayInNewYork());
  const budgetCentsShown = plan.budget.some((item) => !Number.isInteger(item.amount));

  // Basic plans get the checklist without dates; the dated timeline is Premium
  const tasks = plan.tasks.map((task) =>
    isPremium ? task : { id: task.id, title: task.title, detail: task.detail, category: task.category, done: task.done }
  );

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-10 sm:px-8 md:pt-14">
      <Link href="/dashboard" className="text-muted hover:text-sage-900">
        ‹ All events
      </Link>

      <header className="mt-6 border-b border-beige pb-10">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-muted">{countdown(days)}</p>
          {isPremium && (
            <span className="rounded-full bg-sage-900 px-3 py-0.5 text-sm font-medium text-ivory">Premium</span>
          )}
        </div>
        <h1 className="mt-2 font-display text-5xl leading-tight text-sage-900 md:text-6xl">
          {event.event_type}
        </h1>
        {event.theme && <p className="mt-2 max-w-2xl text-lg italic text-muted">{event.theme}</p>}
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
          <div>
            <dt className="text-sm text-muted">Date</dt>
            <dd className="text-ink">{formatEventDate(event.event_date)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Guests</dt>
            <dd className="text-ink">{event.guest_count.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Budget</dt>
            <dd className="text-ink">{money(event.budget, budgetCentsShown)}</dd>
          </div>
        </dl>
        {plan.summary && <p className="mt-8 max-w-3xl text-lg leading-relaxed text-ink">{plan.summary}</p>}
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <EventPlanner
          key={plan.generatedAt}
          eventId={event.id}
          eventDate={event.event_date}
          initialTasks={tasks}
          isPremium={isPremium}
        />

        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <section aria-labelledby="budget-title" className="stationery rounded-sm px-7 py-9">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="budget-title" className="font-display text-3xl text-sage-900">Budget</h2>
              <p className="font-display text-2xl text-ink">{money(event.budget, budgetCentsShown)}</p>
            </div>
            <div className="mt-5 flex h-2.5 overflow-hidden rounded-full" aria-hidden="true">
              {plan.budget.map((item, i) => (
                <span key={item.category} style={{ width: `${item.percent}%` }} className={BAR_COLORS[i]} />
              ))}
            </div>
            <ul className="mt-6 space-y-5">
              {plan.budget.map((item, i) => (
                <li key={item.category}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-2.5 text-ink">
                      <span className={`h-2.5 w-2.5 rounded-full ${BAR_COLORS[i]}`} aria-hidden="true" />
                      {item.category}
                    </span>
                    <span className="text-ink">
                      {money(item.amount, budgetCentsShown)}
                      <span className="ml-2 text-sm text-muted">{item.percent}%</span>
                    </span>
                  </div>
                  {item.note && <p className="mt-1 pl-5 text-sm text-muted">{item.note}</p>}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-beige pt-4 text-sm text-muted">
              Every dollar of your {money(event.budget, budgetCentsShown)} is assigned.
            </p>
          </section>

          {plan.tips?.length > 0 && (
            <section aria-labelledby="tips-title" className="rounded-3xl bg-sage-50 px-7 py-8">
              <h2 id="tips-title" className="font-display text-2xl text-sage-900">Planner’s notes</h2>
              <ul className="mt-4 space-y-3 text-ink">
                {plan.tips.map((tip) => (
                  <li key={tip} className="flex gap-3">
                    <svg viewBox="0 0 20 10" className="mt-2 h-2 w-4 shrink-0 text-sage-500" fill="currentColor" aria-hidden="true">
                      <path d="M0 5C5 0 15 0 20 5C15 10 5 10 0 5Z" />
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <EventActions eventId={event.id} isPremium={isPremium} />
        </aside>
      </div>
    </div>
  );
}
