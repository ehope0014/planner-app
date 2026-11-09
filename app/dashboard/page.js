import Link from "next/link";
import { redirect } from "next/navigation";
import Sprig from "@/components/Sprig";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Dashboard",
};

const sections = [
  { id: "events", label: "My events" },
  { id: "checklist", label: "Checklist" },
  { id: "budget", label: "Budget" },
  { id: "timeline", label: "Timeline" },
];

function Panel({ id, title, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 rounded-3xl border border-beige bg-white p-7 sm:p-9">
      <h2 id={`${id}-title`} className="font-display text-3xl text-sage-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const isPremium = user.plan === "premium";
  const firstName = user.name.split(" ")[0];

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

      <p className="mt-8 rounded-xl bg-sage-50 px-5 py-4 text-sage-900">
        You’re signed in as {user.email}. Saving events to this dashboard is coming in the next update.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[13rem_1fr]">
        {/* Section navigation: a sidebar on large screens, a scrollable row on phones */}
        <nav aria-label="Dashboard sections" className="lg:sticky lg:top-28 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block whitespace-nowrap rounded-full px-4 py-2 text-muted transition-colors hover:bg-linen hover:text-sage-900 lg:rounded-xl"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-8">
          <Panel id="events" title="My events">
            <div className="relative mt-6 overflow-hidden rounded-2xl bg-linen px-6 py-12 text-center">
              <Sprig className="pointer-events-none absolute -right-6 -top-10 h-56 w-auto text-sage-300" />
              <p className="relative font-display text-3xl text-ink">No events yet</p>
              <p className="relative mx-auto mt-2 max-w-sm text-muted">
                Plan your first celebration and it will appear here, ready to pick up anytime.
              </p>
              <Link
                href="/plan"
                className="relative mt-6 inline-block rounded-full border border-sage-700 px-6 py-2.5 font-medium text-sage-900 hover:bg-white"
              >
                Plan an event
              </Link>
            </div>
          </Panel>

          <div className="grid gap-8 xl:grid-cols-2">
            <Panel id="checklist" title="Checklist">
              <p className="mt-3 text-muted">
                Your personalized tasks will appear here. Check them off as you go and watch your progress fill in.
              </p>
              <div className="mt-6 h-2 rounded-full bg-sage-50" aria-hidden="true" />
              <p className="mt-2 text-sm text-muted">0 of 0 tasks done</p>
            </Panel>

            <Panel id="budget" title="Budget">
              <p className="mt-3 text-muted">
                See how your total splits across venue, food, decorations, entertainment and extras.
              </p>
              <div className="mt-6 h-2 rounded-full bg-sage-50" aria-hidden="true" />
              <p className="mt-2 text-sm text-muted">No budget set</p>
            </Panel>
          </div>

          <Panel id="timeline" title="Timeline">
            <p className="mt-3 max-w-xl text-muted">
              Deadlines counted back from your event date, so you always know what to do this week.
              Included with Premium.
            </p>
            <ol className="mt-8 border-l border-beige pl-6" aria-label="Timeline placeholder">
              {["Months before", "Weeks before", "The week of", "The day"].map((phase) => (
                <li key={phase} className="relative pb-6 last:pb-0">
                  <span className="absolute -left-[1.85rem] top-1.5 h-3 w-3 rounded-full border border-sage-300 bg-ivory" aria-hidden="true" />
                  <p className="text-ink">{phase}</p>
                  <p className="text-sm text-muted">Tasks appear after you create a plan</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}
