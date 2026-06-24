# Supabase setup — beginner walkthrough

You don't need any command-line tools. Everything happens in the Supabase website.

## One-time setup

1. Go to **https://supabase.com** and sign in (GitHub or email).
2. Click **New project**. Give it a name (`family-task-board`), set & save a database
   password, pick the closest region, plan = **Free**. Wait ~2 minutes for it to finish.

## Step 1 — Create the tables

1. In your project, open the **SQL Editor** (left sidebar, the `</>` icon).
2. Click **+ New query**.
3. Open the file `supabase/migrations/0001_init.sql` from this project, copy ALL of it,
   and paste it into the editor.
4. Click **Run** (or press Ctrl/Cmd + Enter). You should see "Success. No rows returned."

This creates the `members`, `tasks`, and `task_assignees` tables, turns on security
policies, and enables real-time sync.

## Step 2 — Add the starter family + tasks

1. Click **+ New query** again.
2. Copy ALL of `supabase/seed.sql` and paste it in.
3. Click **Run**.

This adds your 4 family members (Dad, Mom, Siddhu, Sammy) and a few example tasks so the
app doesn't look empty on first open.

> Both files are safe to run more than once — they won't create duplicates.

## Step 3 — Get your two app keys

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** and the **anon public** key.
3. In the project root, copy `.env.example` to a new file named `.env` and paste:
   ```
   VITE_SUPABASE_URL=...your Project URL...
   VITE_SUPABASE_ANON_KEY=...your anon public key...
   ```
4. Save. The app reads these on startup.

## Verify it worked

Open the **Table Editor** in Supabase. You should see `members` with 4 rows and `tasks`
with 4 rows. Done — the backend is ready.
