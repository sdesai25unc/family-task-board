import { useState } from 'react'
import Modal from './Modal'
import MemberChip from './MemberChip'
import Avatar from './Avatar'
import { dueLabel, isOverdue, formatDateTime } from '../lib/dates'

// Full task info + actions. Any member can complete, reopen, or edit.
export default function TaskDetail({
  open,
  task,
  onClose,
  onEdit,
  onComplete,
  onReopen,
  currentMember,
}) {
  const [busy, setBusy] = useState(false)
  if (!task) return null

  const done = task.status === 'done'
  const overdue = !done && isOverdue(task.due_date)

  const run = async (fn) => {
    setBusy(true)
    try {
      await fn()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Task">
      <div className="space-y-5">
        <div>
          <h3 className={`text-xl font-bold ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {task.title}
          </h3>
          <div className="mt-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                done
                  ? 'bg-green-100 text-green-700'
                  : overdue
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {done ? '✓ Done' : dueLabel(task.due_date)}
            </span>
          </div>
        </div>

        {task.description && (
          <p className="whitespace-pre-wrap text-gray-600">{task.description}</p>
        )}

        <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Assigned to
            </div>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {task.assignees.length ? (
                task.assignees.map((a) => <MemberChip key={a.id} member={a} />)
              ) : (
                <span className="text-sm text-gray-400">No one</span>
              )}
            </div>
          </div>

          {task.creator && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Avatar member={task.creator} size="sm" />
              <span>
                Assigned by <span className="font-semibold">{task.creator.name}</span>
                {task.created_at && (
                  <span className="text-gray-400"> · {formatDateTime(task.created_at)}</span>
                )}
              </span>
            </div>
          )}

          {done && task.completer && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Avatar member={task.completer} size="sm" />
              <span>
                Completed by <span className="font-semibold">{task.completer.name}</span>
                {task.completed_at && (
                  <span className="text-gray-400"> · {formatDateTime(task.completed_at)}</span>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {!done ? (
            <button
              disabled={busy}
              onClick={() => run(() => onComplete(task.id, currentMember?.id))}
              className="flex-1 rounded-xl bg-green-600 py-2.5 font-semibold text-white shadow hover:bg-green-700 disabled:opacity-40"
            >
              ✓ Mark complete
            </button>
          ) : (
            <button
              disabled={busy}
              onClick={() => run(() => onReopen(task.id))}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ↩ Reopen
            </button>
          )}
          <button
            onClick={onEdit}
            className="rounded-xl border border-gray-200 px-5 py-2.5 font-semibold text-gray-600 hover:bg-gray-50"
          >
            Edit
          </button>
        </div>
      </div>
    </Modal>
  )
}
