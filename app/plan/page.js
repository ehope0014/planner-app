import EventForm from "./EventForm";

export const metadata = {
  title: "Plan an event",
};

export default function PlanPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-14 sm:px-8 md:pt-20">
      <h1 className="font-display text-5xl leading-tight text-sage-900 md:text-6xl">
        Tell us about your event.
      </h1>
      <p className="mt-5 max-w-lg text-lg text-muted">
        A few details are all Planora needs to shape your checklist, budget and timeline.
      </p>
      <div className="mt-12">
        <EventForm />
      </div>
    </div>
  );
}
