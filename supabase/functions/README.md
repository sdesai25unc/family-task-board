# Edge Functions — deploy & secrets (beginner walkthrough)

The `send-push` function delivers notifications. It runs on Supabase (not in the
browser) because push messages must be signed with the private VAPID key.

You can deploy it two ways. **The Dashboard way needs no command-line tools** — do that.

## Option A — Dashboard (recommended)

1. In Supabase, open **Edge Functions** (left sidebar, the lambda `λ` icon).
2. Click **Create a function** (or **Deploy a new function** → via editor).
3. Name it exactly **`send-push`**.
4. Delete the starter code, then paste the entire contents of
   `supabase/functions/send-push/index.ts` from this project.
5. Click **Deploy**.

### Turn OFF JWT verification for this function
Because the app uses the new "publishable" key (which isn't a JWT), the function
must not enforce JWT auth. The function protects itself by using the service-role
key internally.
- Open the `send-push` function → **Settings** (or the "Details" tab).
- Find **Verify JWT** / **Enforce JWT verification** and **turn it OFF**.

### Add the secrets
- Go to **Edge Functions → Secrets** (or Project Settings → Edge Functions → Secrets).
- Add these (get the VAPID values from your local `.env`):
  | Name | Value |
  |------|-------|
  | `VAPID_PUBLIC_KEY` | the value of `VITE_VAPID_PUBLIC_KEY` in your `.env` |
  | `VAPID_PRIVATE_KEY` | the value of `VAPID_PRIVATE_KEY` in your `.env` |
  | `VAPID_SUBJECT` | `mailto:weslimemphis@gmail.com` |
  | `RESEND_API_KEY` | *(later — leave unset until the email step)* |
  | `RESEND_FROM_EMAIL` | *(later)* |
- You do **not** set `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` — Supabase injects
  those automatically.

## Option B — CLI (no Docker needed for deploy)

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase functions deploy send-push --no-verify-jwt
npx supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:weslimemphis@gmail.com
```

Your project ref is the `xxxx` in your project URL `https://xxxx.supabase.co`.

## Test it

From the app: pick your name, click **Turn on reminders**, allow notifications,
then create a task assigned to *someone else*. That person's device should get a push.
(On desktop Chrome at localhost this works; on iPhone it only works after the app is
added to the Home Screen on the deployed HTTPS site.)
