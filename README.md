# Planora

**Your event, beautifully planned.**

Planora is an AI-powered event planning assistant for birthdays, bridal showers,
engagement parties, graduation parties and other celebrations.

## Built with

- Next.js (App Router) and React
- Tailwind CSS
- Neon PostgreSQL (database), password login with secure sessions
- Claude Haiku 5.5 (Anthropic API) for plan generation, called only from the server
- Coming next: Stripe

## Project map

| Path | What it is |
| --- | --- |
| `app/page.js` | Homepage |
| `app/pricing/page.js` | Pricing page |
| `app/plan/` | Event details form |
| `app/dashboard/page.js` | Dashboard layout |
| `app/globals.css` | Colors, fonts and global styles |
| `components/` | Navigation, footer, logo, pricing cards, illustration |
| `lib/validateEvent.js` | Form validation (will also run on the server) |
| `app/login`, `app/signup`, `app/actions/auth.js` | Accounts: log in, sign up, log out |
| `lib/auth.js`, `lib/db.js` | Sessions, password checks, database connection |
| `lib/ai.js`, `lib/planMath.js` | AI request, and the logic that checks its output (exact budget totals, task dates) |
| `app/actions/events.js`, `app/events/` | Creating, saving, checking off and deleting events |
| `database/schema.sql` | Database tables and the demo account (run once in Neon) |
| `.env.example` | Names of secret settings needed later. No real values. |

## Build stages

1. Week 1 MVP: homepage, navigation, pricing, event form, dashboard layout ✅
2. Accounts: sign up, log in, log out, demo account, Neon database ✅
3. AI: personalized checklist, budget split, timeline ✅
4. Saved events: dashboard with check-offs, each user sees only their own events ✅
5. Payments: Stripe checkout for Premium ($4.99 per event)

## Security rules for this project

- Secret keys live only in Vercel environment variables, never in code or on GitHub.
- `.gitignore` keeps `.env` files and `node_modules` out of GitHub.
- Every saved event will be checked against the logged-in user on the server.
