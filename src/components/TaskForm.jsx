import { useState, useEffect } from 'react'
import Modal from './Modal'
import MemberChip from './MemberChip'

// Shared form for creating and editing a task. Pass `task` to edit; omit to create.
export default function TaskForm({
  open,
  onClose,
  onSubmit,
  members,
  currentMember,
  task = null,
}) {
  const editing = Boolean(task)
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [assigneeIds, setAssigneeIds] = useState(
    task ? task.assignees.map((a) => a.id) : currentMember ? [currentMember.id] : [],
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  // The form stays mounted between opens (only its visibility toggles), so its
  // state would otherwise persist. Reset every time it opens: empty for a new
  // task, or the task's values when editing.
  useEffect(() => {
    if (!open) return
    setTitle(task?.title || '')
    setDescription(task?.description || '')
    setDueDate(task?.due_date || '')
    setAssigneeIds(task ? task.assignees.map((a) => a.id) : currentMember ? [currentMember.id] : [])
    setErr(null)
    setSaving(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task])

  const toggle = (id) =>
    setAssigneeIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const canSubmit = title.trim() && assigneeIds.length > 0 && !saving

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setErr(null)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        assigneeIds,
        createdBy: currentMember?.id,
      })
      onClose()
    } catch (e) {
      setErr(e.message || 'Something went wrong saving the task.')
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit task' : 'New task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Description <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Any details…"
            className="mt-1 w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Due date <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="date"
            value={dueDate || ''}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Assign to</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {members.map((m) => (
              <MemberChip
                key={m.id}
                member={m}
                selectable
                selected={assigneeIds.includes(m.id)}
                onClick={() => toggle(m.id)}
              />
            ))}
          </div>
          {assigneeIds.length === 0 && (
            <p className="mt-1.5 text-xs text-gray-400">Pick at least one person.</p>
          )}
        </div>

        {currentMember && (
          <p className="text-sm text-gray-500">
            Assigned by <span className="font-semibold">{currentMember.name}</span>
          </p>
        )}

        {err && <p className="text-sm text-red-600">{err}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 rounded-xl bg-violet-600 py-2.5 font-semibold text-white shadow hover:bg-violet-700 disabled:opacity-40"
          >
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
