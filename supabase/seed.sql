-- ─────────────────────────────────────────────────────────────────────────────
-- Family Task Board — seed data
-- Run this SECOND in the Supabase SQL Editor (after 0001_init.sql).
-- Re-runnable: uses fixed uuids + "on conflict do nothing".
-- Dates are relative to a "today" of 2026-06-21 so the board looks alive:
--   one overdue, one due tomorrow (due-soon), a couple a few days out.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Members (fixed uuids so seed + assignees stay deterministic) ──────────────
insert into public.members (id, name, color, email) values
  ('11111111-1111-1111-1111-111111111111', 'Dad',    'blue',   null),
  ('22222222-2222-2222-2222-222222222222', 'Mom',    'coral',  null),
  ('33333333-3333-3333-3333-333333333333', 'Siddhu', 'green',  null),
  ('44444444-4444-4444-4444-444444444444', 'Sammy',  'purple', null)
on conflict (id) do nothing;

-- ── Tasks ────────────────────────────────────────────────────────────────────
insert into public.tasks (id, title, description, due_date, created_by, status, created_at) values
  -- Overdue: due 2 days ago, still open → shows red
  ('a0000001-0000-0000-0000-000000000001',
   'Fix the leaky kitchen faucet',
   'The drip is getting worse. Washer is probably shot — there are spares in the garage drawer.',
   '2026-06-19',
   '22222222-2222-2222-2222-222222222222',  -- assigned by Mom
   'open',
   '2026-06-16 09:12:00+00'),

  -- Due tomorrow: due-soon
  ('a0000002-0000-0000-0000-000000000002',
   'Pick up dry cleaning',
   'Two shirts and the gray blazer. Ticket is on the fridge.',
   '2026-06-22',
   '11111111-1111-1111-1111-111111111111',  -- assigned by Dad
   'open',
   '2026-06-20 18:40:00+00'),

  -- A few days out, multiple assignees
  ('a0000003-0000-0000-0000-000000000003',
   'Plan Grandma''s birthday dinner',
   'Decide on a restaurant or cook at home, figure out the cake, and send the invite to the cousins.',
   '2026-06-27',
   '22222222-2222-2222-2222-222222222222',  -- assigned by Mom
   'open',
   '2026-06-21 08:05:00+00'),

  -- A week out, chore for the kids
  ('a0000004-0000-0000-0000-000000000004',
   'Take out the recycling bins',
   'Blue bin to the curb Thursday night. Flatten the cardboard first!',
   '2026-06-28',
   '11111111-1111-1111-1111-111111111111',  -- assigned by Dad
   'open',
   '2026-06-21 07:30:00+00')
on conflict (id) do nothing;

-- ── Task assignees ───────────────────────────────────────────────────────────
insert into public.task_assignees (task_id, member_id) values
  -- Faucet → Dad
  ('a0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111'),
  -- Dry cleaning → Mom
  ('a0000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222'),
  -- Birthday dinner → Mom + Siddhu (multiple assignees)
  ('a0000003-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222'),
  ('a0000003-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333'),
  -- Recycling → Sammy
  ('a0000004-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444')
on conflict (task_id, member_id) do nothing;
