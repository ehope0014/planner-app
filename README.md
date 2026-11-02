# Planora

**Your event, beautifully planned.**

Planora is an AI-powered event planning assistant for birthdays, bridal showers,
engagement parties, graduation parties and other celebrations.

## Built with

- Next.js (App Router) and React
- Tailwind CSS
- Coming next: Neon PostgreSQL, authentication, AI plan generation, Stripe

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
| `.env.example` | Names of secret settings needed later. No real values. |

## Build stages

1. Week 1 MVP: homepage, navigation, pricing, event form, dashboard layout ✅
2. Accounts: sign up, log in, log out, demo account, Neon database
3. AI: personalized checklist, budget split, timeline
4. Saved events: dashboard with check-offs, each user sees only their own events
5. Payments: Stripe checkout for Premium ($4.99 per event)

## Security rules for this project

- Secret keys live only in Vercel environment variables, never in code or on GitHub.
- `.gitignore` keeps `.env` files and `node_modules` out of GitHub.
- Every saved event will be checked against the logged-in user on the server.
