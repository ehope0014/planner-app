"use client";

import { useState, useTransition } from "react";
import { addTask, deleteTask, toggleTask } from "@/app/actions/events";
import { TASK_CATEGORIES, TIMELINE_PHASES, formatEventDate, timelinePhase } from "@/lib/planMath";
import VenueFinder from "./VenueFinder";

function TaskRow({ task, onToggle, onRemove, showDate }) {
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
        {task.custom && <span className="mt-1 block text-xs uppercase tracking-wide text-sage-500">Added by you</span>}
      </label>
      <button
        type="button"
        onClick={() => onRemove(task.id)}
        aria-label={`Remove task: ${task.title}`}
        title="Remove task"
        className="h-7 w-7 shrink-0 rounded-full text-lg leading-none text-muted transition-colors hover:bg-sage-50 hover:text-rose"
      >
        ×
      </button>
    </li>
  );
}

// Lets the host add their own task to the plan
function AddTaskForm({ isPremium, eventDate, onAdd }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Other");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give your task a short name.");
      return;
    }
    setSaving(true);
    setError("");
    const result = await onAdd({ title, category, dueDate });
    setSaving(false);
    if (result.ok) {
      setTitle("");
      setDueDate("");
    } else {
      setError(result.error ?? "That task didn’t save. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-3xl border border-beige bg-linen px-6 py-6">
      <h3 className="font-medium text-sage-900">Add your own task</h3>
      <p className="mt-1 text-sm text-muted">Anything else on your mind? Add it to your checklist.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex-1 sm:min-w-[14rem]">
          <span className="text-sm text-muted">Task</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="e.g. Pick up the cake"
            className="mt-1 w-full rounded-xl border border-beige bg-white px-4 py-2.5 text-ink focus:border-sage-500"
          />
        </label>
        <label>
          <span className="text-sm text-muted">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-xl border border-beige bg-white px-3 py-2.5 text-ink sm:w-auto"
          >
            {TASK_CATEGORIES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
        {isPremium && (
          <label>
            <span className="text-sm text-muted">Due by (optional)</span>
            <input
              type="date"
              value={dueDate}
              max={eventDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-beige bg-white px-3 py-2 text-ink sm:w-auto"
            />
          </label>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-sage-700 px-6 py-2.5 font-medium text-ivory transition-colors hover:bg-sage-900 disabled:cursor-wait disabled:opacity-70"
        >
          {saving ? "Adding…" : "Add task"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-rose">{error}</p>
      )}
    </form>
  );
}

export default function EventPlanner({ eventId, eventDate, initialTasks, initialVenues, isPremium, upgrade }) {
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

  // Saves a new task and shows it in the list. Returns { ok, error }.
  async function handleAdd(input) {
    const result = await addTask(eventId, input).catch(() => ({ ok: false }));
    if (result?.ok) setTasks((current) => [...current, result.task]);
    return result ?? { ok: false };
  }

  function handleRemove(taskId) {
    const previous = tasks;
    setTasks((current) => current.filter((t) => t.id !== taskId));
    setSaveError(false);
    startTransition(async () => {
      const result = await deleteTask(eventId, taskId).catch(() => ({ ok: false }));
      if (!result?.ok) {
        setTasks(previous);
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
        items: tasks
          .filter((t) => t.dueDate && timelinePhase(t.dueDate, eventDate) === phase)
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
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
                  <TaskRow key={task.id} task={task} onToggle={handleToggle} onRemove={handleRemove} showDate={false} />
                ))}
              </ul>
            </div>
          ))}
        </div>
        <AddTaskForm isPremium={isPremium} eventDate={eventDate} onAdd={handleAdd} />
      </section>

      <VenueFinder eventId={eventId} initialResult={initialVenues} onAddTask={handleAdd} />

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
                    <TaskRow key={task.id} task={task} onToggle={handleToggle} onRemove={handleRemove} showDate />
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
            <div className="mt-6">{upgrade}</div>
          </div>
        )}
      </section>
    </div>
  );
}
