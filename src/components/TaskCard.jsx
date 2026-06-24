import Avatar from './Avatar'
import { dueLabel, isOverdue, isDueToday } from '../lib/dates'

// One task as a tappable card. Shows title, due status, and assignee avatars.
export default function TaskCard({ task, onClick }) {
  const overdue = task.status === 'open' && isOverdue(task.due_date)
  const dueToday = task.status === 'open' && isDueToday(task.due_date)
  const done = task.status === 'done'

  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md active:scale-[0.99] ${
        overdue ? 'border-red-300 bg-red-50' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`truncate font-semibold ${
              done ? 'text-gray-400 line-through' : 'text-gray-800'
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{task.description}</p>
          )}
        </div>

        {/* Assignee avatars, overlapping */}
        <div className="flex shrink-0 -space-x-2">
          {task.assignees.map((a) => (
            <Avatar key={a.id} member={a} size="sm" />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            done
              ? 'bg-green-100 text-green-700'
              : overdue
                ? 'bg-red-100 text-red-700'
                : dueToday
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
          }`}
        >
          {done ? '✓ Done' : dueLabel(task.due_date)}
        </span>
        {task.creator && (
          <span className="text-xs text-gray-400">by {task.creator.name}</span>
        )}
      </div>
    </button>
  )
}
