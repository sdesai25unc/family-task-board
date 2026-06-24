import { useMemo, useState } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import { useBoard } from './lib/useBoard'
import { useCurrentMember } from './lib/useCurrentMember'
import { byDueDate, dueLabel } from './lib/dates'
import NamePicker from './components/NamePicker'
import TaskCard from './components/TaskCard'
import TaskForm from './components/TaskForm'
import TaskDetail from './components/TaskDetail'
import Avatar from './components/Avatar'
import NotificationSetup from './components/NotificationSetup'

function SetupNeeded() {
  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <h1 className="text-xl font-bold">Almost there — connect Supabase</h1>
        <p className="mt-2 text-sm">
          Copy <code className="rounded bg-amber-100 px-1">.env.example</code> to{' '}
          <code className="rounded bg-amber-100 px-1">.env</code> and fill in your{' '}
          <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_ANON_KEY</code>, then
          restart <code className="rounded bg-amber-100 px-1">npm run dev</code>. See{' '}
          <code className="rounded bg-amber-100 px-1">supabase/README.md</code>.
        </p>
      </div>
    </div>
  )
}

const TABS = [
  { key: 'mine', label: 'My Tasks' },
  { key: 'all', label: 'All Tasks' },
  { key: 'done', label: 'Done' },
]

export default function App() {
  const board = useBoard()
  const { members, tasks, loading, error } = board
  const { memberId, member, select, clear } = useCurrentMember(members)

  const [tab, setTab] = useState('mine')
  const [grouping, setGrouping] = useState('assignee') // 'assignee' | 'due' (All tab)
  const [creating, setCreating] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [editing, setEditing] = useState(false)

  const detailTask = tasks.find((t) => t.id === detailId) || null

  const openTasks = useMemo(() => tasks.filter((t) => t.status === 'open'), [tasks])
  const doneTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status === 'done')
        .sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || '')),
    [tasks],
  )

  const myTasks = useMemo(
    () =>
      openTasks
        .filter((t) => t.assignees.some((a) => a.id === memberId))
        .sort(byDueDate),
    [openTasks, memberId],
  )

  if (!isSupabaseConfigured) return <SetupNeeded />

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center text-gray-400">Loading…</div>
    )
  }

  if (!memberId) {
    return <NamePicker members={members} onPick={select} />
  }

  // ── Grouping for the All Tasks tab ─────────────────────────────────────────
  let allGroups = []
  if (grouping === 'assignee') {
    allGroups = members.map((m) => ({
      key: m.id,
      label: m.name,
      member: m,
      tasks: openTasks.filter((t) => t.assignees.some((a) => a.id === m.id)).sort(byDueDate),
    }))
    const unassigned = openTasks.filter((t) => t.assignees.length === 0)
    if (unassigned.length) allGroups.push({ key: 'none', label: 'Unassigned', tasks: unassigned })
  } else {
    const buckets = new Map()
    for (const t of [...openTasks].sort(byDueDate)) {
      const label = dueLabel(t.due_date)
      if (!buckets.has(label)) buckets.set(label, [])
      buckets.get(label).push(t)
    }
    allGroups = [...buckets.entries()].map(([label, ts]) => ({ key: label, label, tasks: ts }))
  }

  return (
    <div className="min-h-full pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <span className="font-extrabold text-gray-800">Family Task Board</span>
          </div>
          <button
            onClick={clear}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-gray-100"
            title="Switch member"
          >
            <Avatar member={member} size="sm" />
            <span className="text-sm font-semibold text-gray-600">{member?.name}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-2xl gap-1 px-4">
          {TABS.map((t) => {
            const count =
              t.key === 'mine' ? myTasks.length : t.key === 'all' ? openTasks.length : doneTasks.length
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex-1 border-b-2 py-2.5 text-sm font-semibold transition ${
                  tab === t.key
                    ? 'border-violet-600 text-violet-700'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {t.label}
                <span className="ml-1 text-xs text-gray-400">{count}</span>
              </button>
            )
          })}
        </div>
      </header>

      <NotificationSetup member={member} />

      <main className="mx-auto max-w-2xl px-4 py-5">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* My Tasks */}
        {tab === 'mine' && (
          <Section
            empty="Nothing on your plate. 🎉"
            tasks={myTasks}
            onOpen={setDetailId}
          />
        )}

        {/* All Tasks */}
        {tab === 'all' && (
          <>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-400">Group by</span>
              <div className="inline-flex rounded-full bg-gray-100 p-0.5">
                {['assignee', 'due'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrouping(g)}
                    className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                      grouping === g ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {g === 'assignee' ? 'Person' : 'Due date'}
                  </button>
                ))}
              </div>
            </div>

            {openTasks.length === 0 ? (
              <Empty text="No open tasks. Add one with the + button." />
            ) : (
              <div className="space-y-6">
                {allGroups
                  .filter((grp) => grp.tasks.length > 0)
                  .map((grp) => (
                    <div key={grp.key}>
                      <div className="mb-2 flex items-center gap-2">
                        {grp.member && <Avatar member={grp.member} size="sm" />}
                        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                          {grp.label}
                        </h2>
                        <span className="text-xs text-gray-400">{grp.tasks.length}</span>
                      </div>
                      <div className="space-y-3">
                        {grp.tasks.map((t) => (
                          <TaskCard key={t.id} task={t} onClick={() => setDetailId(t.id)} />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {/* Done archive */}
        {tab === 'done' && (
          <Section
            empty="No completed tasks yet."
            tasks={doneTasks}
            onOpen={setDetailId}
          />
        )}
      </main>

      {/* Floating create button */}
      <button
        onClick={() => setCreating(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-3xl text-white shadow-lg transition hover:bg-violet-700 active:scale-95"
        aria-label="New task"
      >
        +
      </button>

      {/* Create */}
      <TaskForm
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={board.createTask}
        members={members}
        currentMember={member}
      />

      {/* Detail */}
      <TaskDetail
        open={Boolean(detailId) && !editing}
        task={detailTask}
        currentMember={member}
        onClose={() => setDetailId(null)}
        onEdit={() => setEditing(true)}
        onComplete={board.completeTask}
        onReopen={board.reopenTask}
      />

      {/* Edit (reuses the form) */}
      {detailTask && (
        <TaskForm
          open={editing}
          task={detailTask}
          onClose={() => setEditing(false)}
          onSubmit={(vals) => board.updateTask(detailTask.id, vals)}
          members={members}
          currentMember={member}
        />
      )}
    </div>
  )
}

function Section({ tasks, onOpen, empty }) {
  if (tasks.length === 0) return <Empty text={empty} />
  return (
    <div className="space-y-3">
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} onClick={() => onOpen(t.id)} />
      ))}
    </div>
  )
}

function Empty({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center text-gray-400">
      {text}
    </div>
  )
}
