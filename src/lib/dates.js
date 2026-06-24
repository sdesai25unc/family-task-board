// Small date helpers. due_date is stored as a plain 'YYYY-MM-DD' date string,
// so we compare against the local "today" without timezone surprises.

export function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  return dueDate < todayStr()
}

export function isDueToday(dueDate) {
  if (!dueDate) return false
  return dueDate === todayStr()
}

// Friendly relative label: "Overdue", "Due today", "Due tomorrow",
// "Due Sat, Jun 27", or "No due date".
export function dueLabel(dueDate) {
  if (!dueDate) return 'No due date'
  const today = todayStr()
  if (dueDate < today) return 'Overdue'
  if (dueDate === today) return 'Due today'

  const due = new Date(dueDate + 'T00:00:00')
  const t = new Date(today + 'T00:00:00')
  const diffDays = Math.round((due - t) / 86400000)
  if (diffDays === 1) return 'Due tomorrow'

  const fmt = due.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  return `Due ${fmt}`
}

export function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Sort comparator: tasks with a due date first (earliest first), then undated.
export function byDueDate(a, b) {
  if (!a.due_date && !b.due_date) return 0
  if (!a.due_date) return 1
  if (!b.due_date) return -1
  return a.due_date.localeCompare(b.due_date)
}
