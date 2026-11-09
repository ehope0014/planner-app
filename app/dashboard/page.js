import Link from "next/link";
import { redirect } from "next/navigation";
import Sprig from "@/components/Sprig";
import { getCurrentUser } from "@/lib/auth";
import { listOwnedEvents } from "@/lib/events";
import { daysUntil, formatEventDate, todayInNewYork } from "@/lib/planMath";

export const metadata = {
  title: "Dashboard",
};

function countdown(days) {
  if (days < 0) return "Past event";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function EventCard({ event, today, accountPremium }) {
  const days = daysUntil(event.event_date, today);
  const percent = event.task_count ? Math.round((event.done_count / event.task_count) * 100) : 0;
  const premium = event.is_premium || accountPremium;

  return (
    <li>
      <Link
        href={`/events/${event.id}`}
        className="group block h-full rounded-3xl border border-beige bg-white p-7 transition-colors hover:border-sage-300"
      >
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className={days < 0 ? "text-muted" : "text-sage-700"}>{countdown(days)}</span>
          {premium && <span className="rounded-full bg-sage-900 px-2.5 py-0.5 font-medium text-ivory">Premium</span>}
        </div>
        <h2 className="mt-3 font-display text-3xl text-ink group-hover:text-sage-900">{event.event_type}</h2>
        <p className="mt-1 text-muted">
          {formatEventDate(event.event_date, { weekday: undefined })} for {event.guest_count.toLocaleString()} guests
        </p>
        {event.theme && <p className="mt-2 line-clamp-2 text-sm italic text-muted">{event.theme}</p>}

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-sage-50" aria-hidden="true">
          <div className="h-full rounded-full bg-sage-700" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted">
          {event.done_count} of {event.task_count} tasks done
        </p>
      </Link>
    </li>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const events = await listOwnedEvents(user.id);
  const today = todayInNewYork();
  const isPremium = user.plan === "premium";
  const firstName = user.name.split(" ")[0];

  const upcoming = events.filter((e) => e.event_date >= today);
  const past = events.filter((e) => e.event_date < today);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-8 md:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-5xl text-sage-900 md:text-6xl">Hello, {firstName}.</h1>
          <p className="mt-3 flex flex-wrap items-center gap-3 text-lg text-muted">
            Every event you plan with Planora lives here.
            <span
              className={`rounded-full px-3 py-0.5 text-sm font-medium ${
                isPremium ? "bg-sage-900 text-ivory" : "border border-sage-300 text-sage-900"
              }`}
            >
              {isPremium ? "Premium" : "Basic plan"}
            </span>
          </p>
        </div>
        <Link
          href="/plan"
          className="rounded-full bg-sage-700 px-6 py-3 font-medium text-ivory transition-colors hover:bg-sage-900"
        >
          Plan an event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="relative mt-12 overflow-hidden rounded-3xl bg-linen px-6 py-16 text-center">
          <Sprig className="pointer-events-none absolute -right-6 -top-10 h-64 w-auto text-sage-300" />
          <p className="relative font-display text-4xl text-ink">No events yet</p>
          <p className="relative mx-auto mt-3 max-w-sm text-muted">
            Plan your first celebration. You’ll get a checklist, a budget split and a timeline, saved right here.
          </p>
          <Link
            href="/plan"
            className="relative mt-8 inline-block rounded-full bg-sage-700 px-7 py-3 font-medium text-ivory hover:bg-sage-900"
          >
            Plan an event
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section aria-labelledby="upcoming-title" className="mt-12">
              <h2 id="upcoming-title" className="font-display text-3xl text-sage-900">Upcoming</h2>
              <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} today={today} accountPremium={isPremium} />
                ))}
              </ul>
            </section>
          )}
          {past.length > 0 && (
            <section aria-labelledby="past-title" className="mt-14">
              <h2 id="past-title" className="font-display text-3xl text-sage-900">Past</h2>
              <ul className="mt-6 grid gap-6 opacity-80 md:grid-cols-2 lg:grid-cols-3">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} today={today} accountPremium={isPremium} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
