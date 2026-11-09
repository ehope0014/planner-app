-- Planora database setup
-- Paste this whole file into the Neon SQL Editor and click Run.
-- It is safe to run more than once: nothing is deleted or duplicated.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Accounts
CREATE TABLE IF NOT EXISTS users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email          text NOT NULL UNIQUE,
  password_hash  text NOT NULL,
  name           text NOT NULL,
  plan           text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  is_demo        boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Login sessions (only a scrambled version of each session token is stored)
CREATE TABLE IF NOT EXISTS sessions (
  token_hash  text PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

-- Failed login attempts, used to slow down password guessing
CREATE TABLE IF NOT EXISTS login_attempts (
  id          bigserial PRIMARY KEY,
  email       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_email_idx ON login_attempts(email, created_at);

-- Saved events (used in a later stage). Every event belongs to exactly one user.
CREATE TABLE IF NOT EXISTS events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type   text NOT NULL,
  event_date   date NOT NULL,
  guest_count  integer NOT NULL CHECK (guest_count BETWEEN 1 AND 1000),
  budget       numeric(12, 2) NOT NULL CHECK (budget >= 0),
  theme        text NOT NULL DEFAULT '',
  plan         jsonb,
  is_premium   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);

-- Demo account for grading: premium access, no email verification.
INSERT INTO users (email, password_hash, name, plan, is_demo)
VALUES ('demo@demo.com', crypt('password123!', gen_salt('bf', 10)), 'Demo Host', 'premium', true)
ON CONFLICT (email) DO UPDATE
  SET password_hash = EXCLUDED.password_hash,
      plan = 'premium',
      is_demo = true;

-- Quick check: this should show one row for the demo account.
SELECT email, name, plan, is_demo FROM users WHERE email = 'demo@demo.com';
