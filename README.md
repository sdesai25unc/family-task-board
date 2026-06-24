# Family Task Board

A zero-cost, family-only PWA where Dad, Mom, Siddhu, and Sammy assign each other
tasks, see them sync live, and (later) get push reminders. Installed via
"Add to Home Screen" — not an app store.

> Status: **Phases 1–3 complete** (scaffold, database, core app). Notifications
> (PWA push + email) are the next phase and are intentionally not built yet.

## Run it locally

1. **Set up the database** — follow `supabase/README.md` (create a free Supabase
   project, run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`).
2. **Add your keys** — copy `.env.example` to `.env` and fill in
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. **Install & run:**
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:5173. Until `.env` is filled in, the app shows a setup
   notice instead of crashing.

## What works now

- **Pick your name** — four colorful buttons; choice saved in `localStorage`.
- **My Tasks** — your open tasks, sorted by due date, overdue ones in red.
- **All Tasks** — every open task, grouped by person or by due date.
- **Create / edit** — title, description, due date, multi-assignee; "assigned by you".
- **Task detail** — who assigned it & when, who completed it; mark complete / reopen / edit.
- **Done** — completed tasks archived (never hard-deleted).
- **Live sync** — Supabase Realtime; changes on any device appear everywhere.

## Tech

React + Vite + Tailwind v4 · Supabase (Postgres + Realtime) · deploy on Vercel/Netlify (later).

## Project layout

```
src/
  components/   UI: NamePicker, TaskCard, TaskForm, TaskDetail, Modal, Avatar, MemberChip
  lib/          supabase client, useBoard (data + realtime + mutations),
                useCurrentMember, colors, dates
supabase/
  migrations/0001_init.sql   schema + RLS + realtime
  seed.sql                   4 members + example tasks
  README.md                  beginner setup walkthrough
```
