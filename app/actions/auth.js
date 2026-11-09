"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FAILED_LOGINS = 10; // per email, per 15 minutes

// Only allow redirects to pages on this site (blocks "//evil.com" tricks)
function safeNext(value) {
  const next = String(value ?? "");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function cleanEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export async function signup(prevState, formData) {
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  const email = cleanEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  const errors = {};
  if (name.length < 1 || name.length > 60) errors.name = "Enter your name (up to 60 characters).";
  if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.email = "Enter a valid email address.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  else if (new TextEncoder().encode(password).length > 72) errors.password = "Use 72 characters or fewer.";

  if (Object.keys(errors).length) {
    return { errors, values: { name, email } };
  }

  const passwordHash = await hashPassword(password);
  const rows = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${name})
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `;

  if (rows.length === 0) {
    return {
      errors: { email: "An account with this email already exists. Log in instead." },
      values: { name, email },
    };
  }

  await createSession(rows[0].id);
  redirect("/dashboard");
}

export async function login(prevState, formData) {
  const email = cleanEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Enter your email and password.", values: { email } };
  }

  const recent = await sql`
    SELECT count(*)::int AS n FROM login_attempts
    WHERE email = ${email} AND created_at > now() - interval '15 minutes'
  `;
  if (recent[0].n >= MAX_FAILED_LOGINS) {
    return {
      error: "Too many attempts. Wait 15 minutes, then try again.",
      values: { email },
    };
  }

  const users = await sql`SELECT id, password_hash FROM users WHERE email = ${email} LIMIT 1`;
  const user = users[0];
  const ok = await verifyPassword(password, user?.password_hash);

  if (!ok) {
    await sql`INSERT INTO login_attempts (email) VALUES (${email})`;
    return { error: "That email and password don’t match an account.", values: { email } };
  }

  await sql`DELETE FROM login_attempts WHERE email = ${email} OR created_at < now() - interval '1 day'`;
  await createSession(user.id);
  redirect(next);
}

export async function logout() {
  await destroySession();
  redirect("/");
}
