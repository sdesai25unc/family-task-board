# Family Task Board — Handoff Packet

Use this to continue the build in a fresh Claude chat. It captures exactly where we are.

## TL;DR of where we are

Phases 1–3 (scaffold, database, core app) are **done and working locally**. The PWA
shell (manifest, service worker, icons) is **done**. Web Push code is **written on both
the frontend and the Edge Function**. 

👉 **The current task: deploying the `send-push` Edge Function in the Supabase dashboard,
then setting its secrets, then doing a first push test.** We were mid-deploy.

## What's built and verified

- **Stack:** React + Vite + Tailwind v4. Supabase (Postgres + Realtime). Builds clean
  (`npm run build`), dev server runs at http://localhost:5173.
- **Database (live in Supabase):** `members`, `tasks`, `task_assignees` with RLS
  (allow-all policies) and Realtime enabled. Seeded with 4 members (Dad=blue, Mom=coral,
  Siddhu=green, Sammy=purple) and 4 sample tasks. SQL is in `supabase/migrations/0001_init.sql`
  and `supabase/seed.sql`.
- **Core app:** name picker → My/All/Done tabs → create/edit task → task detail →
  complete/reopen → live Realtime sync. All working.
- **PWA:** `public/manifest.webmanifest`, `public/sw.js` (push + notificationclick handlers,
  no aggressive caching), icons in `public/` (`icon-192.png`, `icon-512.png`,
  `apple-touch-icon.png`), wired into `index.html`, SW registered in `src/main.jsx`.
- **Web Push (code complete, not yet deployed/tested):**
  - `src/lib/push.js` — subscribe, save subscription to `members.push_sub`, iOS/standalone
    detection, and `sendPush()` which calls the Edge Function.
  - `src/components/NotificationSetup.jsx` — the "🔔 Turn on reminders" banner + iOS
    "Add to Home Screen" hint. Mounted in `src/App.jsx` under the header.
  - `src/lib/useBoard.js` — `createTask` now calls `sendPush()` to notify assignees
    (excluding the creator).
  - `supabase/functions/send-push/index.ts` — the Edge Function (Deno + `npm:web-push`),
    with Resend email fallback built in.

## Environment / secrets

`.env` (local, gitignored) is filled in with:
- `VITE_SUPABASE_URL` = https://ijbqlhsexuuhdobdnqgq.supabase.co  (project ref: `ijbqlhsexuuhdobdnqgq`)
- `VITE_SUPABASE_ANON_KEY` = the Supabase **publishable** key (`sb_publishable_...`)
- `VITE_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` = generated VAPID pair (in `.env`)
- `VAPID_SUBJECT` = mailto:weslimemphis@gmail.com
- Resend vars are still blank (email fallback step, later)

Regenerate VAPID anytime with `node scripts/generate-vapid.mjs` (icons: `node scripts/generate-icons.mjs`).

## ▶️ NEXT STEPS (resume here)

### 1. Finish deploying the `send-push` Edge Function (Supabase dashboard → Edge Functions)
- We clicked **Deploy a new function → Via Editor**.
- Function **name** must be `send-push` (the editor defaulted it to "clever-api" — rename it).
- The **file stays `index.ts`**; paste the code from `supabase/functions/send-push/index.ts`
  (a JS version without TS type annotations pastes most cleanly into the dashboard editor).
- **Verify JWT:** must be **OFF** for this function (the app uses the publishable key, which
  isn't a JWT; the function protects itself via the service-role key internally). If the
  toggle isn't on the deploy screen, deploy first, then turn it off in the function's
  **Details/Settings** tab.
- Click **Deploy**.

### 2. Set the function's secrets (Edge Functions → Secrets, or Project Settings → Edge Functions)
Add these (values from your local `.env`):
| Secret name | Value |
|-------------|-------|
| `VAPID_PUBLIC_KEY` | value of `VITE_VAPID_PUBLIC_KEY` in `.env` |
| `VAPID_PRIVATE_KEY` | value of `VAPID_PRIVATE_KEY` in `.env` |
| `VAPID_SUBJECT` | `mailto:weslimemphis@gmail.com` |
(Do NOT set `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — Supabase injects those.)
Leave `RESEND_API_KEY` / `RESEND_FROM_EMAIL` unset until the email step.

### 3. First push test (on this computer, desktop Chrome — works on localhost)
The on-assign push goes to assignees *except the creator*, so to test on one machine:
1. Open http://localhost:5173, pick **Dad**, click **Turn on reminders**, allow notifications.
   (This saves the browser's subscription to Dad's `push_sub`.)
2. Click your avatar (top-right) to switch, pick **Mom**, click **Turn on reminders** again.
   (Same browser is now also Mom's subscription.)
3. As **Mom**, create a task assigned to **Dad** → you should get a desktop notification.
- Debug: Supabase → Edge Functions → `send-push` → **Logs**. The function returns a
  `results` array showing `via: 'push'` ok/fail per member.

### 4. Remaining phases (not started)
- **Daily cron** Edge Function: "due tomorrow" + "overdue" reminders. New function (e.g.
  `daily-reminders`) that queries open tasks by `due_date`, then calls `send-push` per task.
  Schedule via Supabase cron (`pg_cron` / the dashboard schedule) ~8am.
- **Resend email fallback:** create free Resend account, set `RESEND_API_KEY` +
  `RESEND_FROM_EMAIL` secrets, add members' `email` values. The send-push function already
  falls back to email when a member has no `push_sub`.
- **Deploy to Vercel/Netlify (Phase 8):** gives an HTTPS URL. **Required for iPhone**: iOS
  Web Push only works after **Add to Home Screen** on an HTTPS site (iOS 16.4+); it never
  works in the Safari tab. Set the same `VITE_*` env vars in the host's dashboard. Then do
  the real iPhone test and send the family the link + install instructions.

## iOS reality (keep saying this)
Push on iPhone = installed to Home Screen + iOS 16.4+ only. Always treat push as
best-effort with email as the safety net. The app already detects iPhone-in-Safari and
shows the Add-to-Home-Screen hint instead of a dead button.

## Useful commands
```
npm run dev       # start app at http://localhost:5173
npm run build     # verify it compiles
node scripts/generate-vapid.mjs   # new VAPID keys (then update .env + function secrets)
```

## Reference docs in repo
- `CLAUDE.md` — full project spec
- `supabase/README.md` — DB setup walkthrough
- `supabase/functions/README.md` — Edge Function deploy + secrets walkthrough
- `README.md` — project overview + run steps
