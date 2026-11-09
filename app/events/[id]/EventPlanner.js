"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleTask } from "@/app/actions/events";
import { TASK_CATEGORIES, TIMELINE_PHASES, formatEventDate, timelinePhase } from "@/lib/planMath";

function TaskRow({ task, onToggle, showDate }) {
  const inputId = `task-${task.id}-${showDate ? "timeline" : "list"}`;
  return (
    <li className="flex gap-4 py-4">
      <input
        id={inputId}
        type="checkbox"
        checked={task.done}
        onChange={(e) => onToggle(task.id, e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-full border border-sage-500 bg-white bg-center bg-no-repeat transition-colors checked:border-sage-700 checked:bg-sage-700 checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 12 12%22><path d=%22M2.5 6.2l2.3 2.2L9.5 3.6%22 fill=%22none%22 stroke=%22%23fbf8f1%22 stroke-width=%221.8%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] checked:bg-[length:12px]"
      />
      <label htmlFor={inputId} className="flex-1 cursor-pointer">
        <span className={task.done ? "text-muted line-through decoration-sage-300" : "text-ink"}>
          {task.title}
        </span>
        {task.detail && <span className="mt-0.5 block text-sm text-muted">{task.detail}</span>}
        {showDate && task.dueDate && (
          <span className="mt-1 block text-sm text-sage-700">
            {task.catchUp ? "Catch up: " : "By "}
            {formatEventDate(task.dueDate, { weekday: "short", year: undefined })}
          </span>
        )}
      </label>
    </li>
  );
}

export default function EventPlanner({ eventId, eventDate, initialTasks, isPremium }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [saveError, setSaveError] = useState(false);
  const [, startTransition] = useTransition();

  const doneCount = tasks.filter((t) => t.done).length;
  const percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  function handleToggle(taskId, done) {
    // Update the screen right away, then save; undo if saving fails
    setTasks((current) => current.map((t) => (t.id === taskId ? { ...t, done } : t)));
    setSaveError(false);
    startTransition(async () => {
      const result = await toggleTask(eventId, taskId, done).catch(() => ({ ok: false }));
      if (!result?.ok) {
        setTasks((current) => current.map((t) => (t.id === taskId ? { ...t, done: !done } : t)));
        setSaveError(true);
      }
    });
  }

  const byCategory = TASK_CATEGORIES.map((category) => ({
    category,
    items: tasks.filter((t) => t.category === category),
  })).filter((group) => group.items.length > 0);

  const byPhase = isPremium
    ? TIMELINE_PHASES.map((phase) => ({
        phase,
        items: tasks.filter((t) => timelinePhase(t.dueDate, eventDate) === phase),
      })).filter((group) => group.items.length > 0)
    : [];

  return (
    <div className="space-y-12">
      <section aria-labelledby="progress-title">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="progress-title" className="font-display text-3xl text-sage-900">Progress</h2>
          <p className="text-muted" aria-live="polite">
            {doneCount} of {tasks.length} tasks done
          </p>
        </div>
        <div
          className="mt-4 h-2.5 overflow-hidden rounded-full bg-sage-50"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Planning progress"
        >
          <div className="h-full rounded-full bg-sage-700 transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
        {saveError && (
          <p role="alert" className="mt-3 text-sm text-rose">
            That change didn’t save. Check your connection and try again.
          </p>
        )}
      </section>

      <section aria-labelledby="checklist-title">
        <h2 id="checklist-title" className="font-display text-3xl text-sage-900">Checklist</h2>
        <div className="mt-4 space-y-8">
          {byCategory.map((group) => (
            <div key={group.category}>
              <h3 className="border-b border-beige pb-2 font-medium text-sage-900">{group.category}</h3>
              <ul className="divide-y divide-beige/70">
                {group.items.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={handleToggle} showDate={false} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="timeline-title">
        <h2 id="timeline-title" className="font-display text-3xl text-sage-900">Timeline</h2>
        {isPremium ? (
          <ol className="mt-6 border-l border-beige pl-7">
            {byPhase.map((group) => (
              <li key={group.phase} className="relative pb-8 last:pb-0">
                <span
                  className="absolute -left-[2.1rem] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-sage-500 bg-ivory"
                  aria-hidden="true"
                />
                <h3 className="font-medium text-ink">{group.phase}</h3>
                <ul className="divide-y divide-beige/70">
                  {group.items.map((task) => (
                    <TaskRow key={task.id} task={task} onToggle={handleToggle} showDate />
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-5 rounded-3xl border border-beige bg-linen px-7 py-9">
            <p className="font-display text-2xl text-ink">Know exactly what to do each week.</p>
            <p className="mt-2 max-w-lg text-muted">
              Premium turns this checklist into a dated timeline counted back from your event, and lets you
              regenerate your plan anytime.
            </p>
            <Link
              href="/pricing"
              className="mt-6 inline-block rounded-full bg-sage-700 px-6 py-3 font-medium text-ivory hover:bg-sage-900"
            >
              See Premium
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
