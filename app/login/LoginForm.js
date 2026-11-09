"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { authButton, authInput } from "@/components/AuthCard";

export default function LoginForm({ next }) {
  const [state, formAction, pending] = useActionState(login, { error: null, values: {} });

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="next" value={next} />

      {state.error && (
        <p role="alert" className="rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="font-medium text-ink">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ""}
          className={authInput}
        />
      </div>

      <div>
        <label htmlFor="password" className="font-medium text-ink">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={authInput}
        />
      </div>

      <button type="submit" disabled={pending} className={authButton}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
