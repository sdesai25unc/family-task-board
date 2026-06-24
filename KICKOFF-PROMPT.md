# Kickoff prompt — paste this into Claude Code

Copy everything below the line into Claude Code as your first message, from inside the
`family-task-board/` folder (so it can see CLAUDE.md and .claude/agents/).

---

Read CLAUDE.md fully — it's the spec for this project. Then read the three subagent
definitions in `.claude/agents/`.

I'm building Family Task Board: a zero-cost, family-only PWA where a family of four
assigns each other tasks, syncs in real time, and gets push reminders. It is NOT going on
any app store — it's installed via "Add to Home Screen." Everything must stay in free
tiers (Supabase, Vercel/Netlify, Resend). There is no real login: you pick your name from
a list and it's stored in localStorage.

Before writing code, do these three things and show me each:

1. Give me a short build plan that follows the build order in CLAUDE.md, and tell me which
   subagent owns each phase.
2. List every external account I need to create (Supabase project, Resend, Vercel/Netlify)
   and exactly what I have to do in each — keep it beginner-level, I've never used a
   backend before.
3. Produce a `.env.example` listing every environment variable the project will need.

Then start with phases 1–3 only: scaffold Vite + React + Tailwind, stand up the Supabase
schema + Realtime + seed data, and wire the core flow (name picker → task feed →
create → detail → done archive). Get me a working, usable app WITHOUT notifications first
— notifications are the riskiest layer and I don't want them blocking a usable build.

Delegate database/SQL/Edge-Function/seed work to the supabase-backend agent, and React/
Tailwind/layout work to the frontend-ui agent. Hold the pwa-notifications agent until the
core app works. Pause and check in with me after phase 3 before adding notifications.

Use my real family names: Dad, Mom, [BROTHER NAME], [MY NAME] — replace the bracketed
ones. Colors: Dad=blue, Mom=coral, [Brother]=green, [Me]=purple.

Stop and ask me whenever you hit a decision that affects cost, or anything that would
require a paid plan.

---

## After phase 3 works, continue with:

> The core app works. Now bring in the pwa-notifications agent. Add the PWA manifest and
> service worker so the app installs to the home screen, then Web Push for the three
> triggers (assigned-to-you, due-in-1-day, overdue), with Resend email as the fallback.
> Coordinate the cron triggers with the supabase-backend agent. Be explicit with me about
> the iOS "Add to Home Screen" requirement and test a real push before calling it done.

## Final step:

> Walk me through deploying to Vercel (or Netlify) for free, and give me a one-paragraph
> message I can send my family with the link and the "Add to Home Screen" instructions for
> both iPhone and Android.
