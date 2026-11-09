import { cookies } from "next/headers";
import { cache } from "react";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

const SESSION_COOKIE = "planora_session";
const SESSION_DAYS = 30;

// Checked when an email isn't found, so a wrong email takes as long as a
// wrong password (attackers can't learn which emails have accounts by timing).
let dummyHash;
async function getDummyHash() {
  if (!dummyHash) dummyHash = await bcrypt.hash(randomBytes(16).toString("hex"), 10);
  return dummyHash;
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  const matches = await bcrypt.compare(password, hash || (await getDummyHash()));
  return Boolean(hash) && matches;
}

export async function createSession(userId) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await sql`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (${hashToken(token)}, ${userId}, ${expires.toISOString()})
  `;
  // Tidy up expired sessions while we're here
  await sql`DELETE FROM sessions WHERE expires_at < now()`;

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true, // browser JavaScript can't read it
    secure: process.env.NODE_ENV === "production", // HTTPS only on the live site
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await sql`DELETE FROM sessions WHERE token_hash = ${hashToken(token)}`;
  }
  store.delete(SESSION_COOKIE);
}

// Returns the logged-in user, or null. Cached so each page load
// asks the database at most once.
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;

  const rows = await sql`
    SELECT u.id, u.email, u.name, u.plan, u.is_demo
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)} AND s.expires_at > now()
    LIMIT 1
  `;
  return rows[0] ?? null;
});
