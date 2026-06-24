# Family Task Board — Project Context

This file is the source of truth for the project. Read it fully before writing code.

## What we're building

A shared family task manager as a **Progressive Web App (PWA)**. A family of four
assigns each other tasks that currently get lost in group-message chains. The app
gives them one shared board, real-time sync, and push reminders.

This is a **personal, zero-cost, family-only app**. It will NOT go on any app store.
It is installed by adding it to the home screen. Stay inside free tiers at every step.

## Hard constraints (do not violate)

- **$0 cost.** Supabase free tier, Vercel/Netlify free tier, Resend free tier only.
  If a feature would require a paid plan, stop and flag it instead of building it.
- **No real login.** No passwords, no email auth. Identity = pick your name from a list,
  stored in `localStorage`. This is a trust-based family app.
- **Works on mobile AND desktop** via browser. Responsive layout.
- **Installable as a PWA** so push notifications work (especially iOS 16.4+, which
  requires "Add to Home Screen" before web push functions).

## Tech stack

- Frontend: **React + Vite + Tailwind CSS**
- Backend: **Supabase** (Postgres + Realtime + Edge Functions + cron)
- Notifications: **Web Push API** (VAPID), with **email fallback via Resend**
- Deploy: **Vercel or Netlify** (free)

## Family members

Replace these placeholders before first run. Each member has a name and a signature color.

| Name        | Color   |
|-------------|---------|
| Dad         | blue    |
| Mom         | coral   |
| [Brother]   | green   |
| [You]       | purple  |

## Database schema (Supabase)

```sql
-- members
id            uuid primary key default gen_random_uuid()
name          text not null
color         text not null            -- 'blue' | 'coral' | 'green' | 'purple'
push_sub      jsonb                    -- web push subscription, nullable
email         text                     -- for email fallback, nullable

-- tasks
id            uuid primary key default gen_random_uuid()
title         text not null
description   text
due_date      date
created_by    uuid references members(id)
status        text not null default 'open'   -- 'open' | 'done'
created_at    timestamptz default now()
completed_at  timestamptz
completed_by  uuid references members(id)

-- task_assignees (many-to-many: a task can go to multiple people)
task_id       uuid references tasks(id) on delete cascade
member_id     uuid references members(id)
primary key (task_id, member_id)
```

Enable **Realtime** on the `tasks` and `task_assignees` tables so all devices update live.

Because there is no real auth, Row Level Security can be permissive (the whole family
shares the data). Still enable RLS with a simple "allow all for anon key" policy rather
than leaving tables wide open with no RLS — cleaner and avoids Supabase warnings.

## Screens / features

1. **Pick your name** — first load shows 4 big colorful buttons, one per member.
   Tap to select; store in `localStorage`. Show this only if no member is stored.

2. **Task feed — two tabs:**
   - *My Tasks*: tasks assigned to the current member, sorted by due date.
     Overdue tasks highlighted in red.
   - *All Tasks*: every open task across the family. Toggle grouping by assignee
     or by due date.

3. **Create task** — title (required), description (optional), due date (date picker),
   assign to (multi-select, 1–4 members). "Assigned by [current member]" auto-fills.
   On submit, push-notify all assignees.

4. **Task detail** — full info, who assigned it and when. Any member can mark complete
   or edit. Completed tasks move to a **Done** archive tab (never hard-deleted).

## Notifications — when they fire

- New task assigned to you → immediate push
- 1 day before a task's due date → push (daily cron checks)
- Task becomes overdue → push (daily cron checks)

No daily digest. Cron runs via a Supabase Edge Function scheduled daily (e.g. 8am).
If a member has no push subscription, fall back to email via Resend.

## UI vibe

Colorful and fun — it should feel like a warm family app, not enterprise software.
Each member's signature color appears on their avatar, their tasks, and their name chips.
Friendly rounded cards, clear typography, playful but legible. Mobile-first responsive.

## Onboarding gift detail (important)

Before this is gifted, the database should be **pre-seeded with a few real-looking tasks**
so the app feels alive on first open, not empty. Build a `seed.sql` (or a seed script)
with 3–4 example tasks across members. An empty app reads as broken; a populated one
reads as real.

## Build order (recommended)

1. Scaffold Vite + React + Tailwind, get it running locally.
2. Stand up Supabase project, create schema, enable Realtime, add seed data.
3. Wire frontend to Supabase: name-picker → task feed → create → detail → done archive.
4. Add PWA manifest + service worker; confirm "Add to Home Screen" works.
5. Layer in Web Push (VAPID keys, subscription storage, send-on-assign).
6. Add the daily cron Edge Function for due-soon + overdue notifications.
7. Add Resend email fallback.
8. Deploy to Vercel/Netlify, share the URL with the family.

Ship a working version after step 3 before adding notifications — that's the riskiest
layer and you don't want it blocking a usable app.

## Subagents

Three specialist subagents live in `.claude/agents/`. Delegate to them when the work
falls squarely in their domain:
- `supabase-backend` — schema, RLS, Realtime, Edge Functions, cron, seed data
- `pwa-notifications` — service worker, manifest, Web Push (VAPID), iOS quirks, Resend
- `frontend-ui` — React components, Tailwind, the colorful responsive family UI

Keep all secrets (VAPID keys, Supabase service-role key, Resend key) in environment
variables, never committed. Provide a `.env.example` listing every required variable.
