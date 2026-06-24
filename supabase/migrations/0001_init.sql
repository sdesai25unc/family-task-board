-- ─────────────────────────────────────────────────────────────────────────────
-- Family Task Board — initial schema
-- Run this FIRST in the Supabase SQL Editor (before seed.sql).
-- Safe to re-run: uses "if not exists" and guarded policy/publication blocks.
-- ─────────────────────────────────────────────────────────────────────────────

-- gen_random_uuid() lives in pgcrypto (already available on Supabase, but be safe)
create extension if not exists pgcrypto;

-- ── members ──────────────────────────────────────────────────────────────────
create table if not exists public.members (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  color     text not null check (color in ('blue', 'coral', 'green', 'purple')),
  push_sub  jsonb,
  email     text
);

-- ── tasks ────────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  due_date     date,
  created_by   uuid references public.members(id),
  status       text not null default 'open' check (status in ('open', 'done')),
  created_at   timestamptz default now(),
  completed_at timestamptz,
  completed_by uuid references public.members(id)
);

-- ── task_assignees (many-to-many) ────────────────────────────────────────────
create table if not exists public.task_assignees (
  task_id    uuid references public.tasks(id) on delete cascade,
  member_id  uuid references public.members(id),
  primary key (task_id, member_id)
);

-- Helpful indexes for the feed queries
create index if not exists idx_tasks_status        on public.tasks (status);
create index if not exists idx_tasks_due_date      on public.tasks (due_date);
create index if not exists idx_assignees_member    on public.task_assignees (member_id);

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Trust-based family app with no real auth: the anon key needs full access.
-- We still enable RLS (so Supabase doesn't warn about open tables) and add
-- explicit permissive "allow all" policies for the anon + authenticated roles.
alter table public.members        enable row level security;
alter table public.tasks          enable row level security;
alter table public.task_assignees enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'members' and policyname = 'allow_all_members') then
    create policy allow_all_members on public.members
      for all to anon, authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'allow_all_tasks') then
    create policy allow_all_tasks on public.tasks
      for all to anon, authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'task_assignees' and policyname = 'allow_all_task_assignees') then
    create policy allow_all_task_assignees on public.task_assignees
      for all to anon, authenticated using (true) with check (true);
  end if;
end $$;

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- Add tasks + task_assignees to the realtime publication so every device
-- updates live. Guarded so re-running doesn't error if already added.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'task_assignees'
  ) then
    alter publication supabase_realtime add table public.task_assignees;
  end if;
end $$;
