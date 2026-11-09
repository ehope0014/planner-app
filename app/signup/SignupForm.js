"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { authButton, authInput } from "@/components/AuthCard";

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm text-rose">
      {message}
    </p>
  );
}

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, { errors: {}, values: {} });
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <div>
        <label htmlFor="name" className="font-medium text-ink">Your name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={60}
          required
          defaultValue={state.values?.name ?? ""}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={authInput}
        />
        <FieldError id="name-error" message={errors.name} />
      </div>

      <div>
        <label htmlFor="email" className="font-medium text-ink">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ""}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={authInput}
        />
        <FieldError id="email-error" message={errors.email} />
      </div>

      <div>
        <label htmlFor="password" className="font-medium text-ink">Password</label>
        <p id="password-hint" className="text-sm text-muted">At least 8 characters.</p>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-hint password-error" : "password-hint"}
          className={authInput}
        />
        <FieldError id="password-error" message={errors.password} />
      </div>

      <button type="submit" disabled={pending} className={authButton}>
        {pending ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}
