import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import { sendPush } from './push'

// The columns we always pull for a task, including the embedded creator,
// completer, and assignees. Supabase resolves the two members() relationships
// via the FK column hints (created_by / completed_by); assignees come through
// the task_assignees join table.
const TASK_SELECT = `
  id, title, description, due_date, status, created_at, completed_at,
  created_by, completed_by,
  creator:members!created_by ( id, name, color ),
  completer:members!completed_by ( id, name, color ),
  task_assignees ( member:members ( id, name, color ) )
`

// Flatten task_assignees -> assignees: [{id,name,color}, ...]
function normalize(task) {
  return {
    ...task,
    assignees: (task.task_assignees || []).map((row) => row.member).filter(Boolean),
  }
}

export function useBoard() {
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Avoid overlapping refetches when several realtime events land at once.
  const refetchPending = useRef(false)

  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase.from('members').select('id, name, color, email')
    if (error) throw error
    return data || []
  }, [])

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_SELECT)
      .order('due_date', { ascending: true, nullsFirst: false })
    if (error) throw error
    return (data || []).map(normalize)
  }, [])

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    try {
      const [m, t] = await Promise.all([fetchMembers(), fetchTasks()])
      setMembers(m)
      setTasks(t)
      setError(null)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [fetchMembers, fetchTasks])

  // Lightweight task-only refresh used by realtime events.
  const refreshTasks = useCallback(async () => {
    if (refetchPending.current) return
    refetchPending.current = true
    try {
      const t = await fetchTasks()
      setTasks(t)
    } catch {
      /* transient; next event or manual refresh will recover */
    } finally {
      refetchPending.current = false
    }
  }, [fetchTasks])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Realtime: any change to tasks or task_assignees -> refetch the task list so
  // every family device stays in sync without polling.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    const channel = supabase
      .channel('board-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, refreshTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_assignees' }, refreshTasks)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshTasks])

  // ── Mutations ──────────────────────────────────────────────────────────────

  // Create a task + its assignee rows. assigneeIds is an array of member ids.
  const createTask = useCallback(async ({ title, description, dueDate, createdBy, assigneeIds }) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description: description || null,
        due_date: dueDate || null,
        created_by: createdBy,
        status: 'open',
      })
      .select('id')
      .single()
    if (error) throw error

    if (assigneeIds?.length) {
      const rows = assigneeIds.map((member_id) => ({ task_id: data.id, member_id }))
      const { error: aErr } = await supabase.from('task_assignees').insert(rows)
      if (aErr) throw aErr
    }
    await refreshTasks()

    // Notify everyone the task was assigned to, except the person creating it.
    const recipients = (assigneeIds || []).filter((id) => id !== createdBy)
    if (recipients.length) {
      const assigner = members.find((m) => m.id === createdBy)
      sendPush({
        memberIds: recipients,
        title: assigner ? `${assigner.name} assigned you a task` : 'New task assigned to you',
        body: title,
        url: '/',
        tag: `task-${data.id}`,
      })
    }
    return data.id
  }, [refreshTasks, members])

  const updateTask = useCallback(async (taskId, { title, description, dueDate, assigneeIds }) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        title,
        description: description || null,
        due_date: dueDate || null,
      })
      .eq('id', taskId)
    if (error) throw error

    if (assigneeIds) {
      // Replace the assignee set: clear then re-insert.
      const { error: delErr } = await supabase
        .from('task_assignees')
        .delete()
        .eq('task_id', taskId)
      if (delErr) throw delErr
      if (assigneeIds.length) {
        const rows = assigneeIds.map((member_id) => ({ task_id: taskId, member_id }))
        const { error: insErr } = await supabase.from('task_assignees').insert(rows)
        if (insErr) throw insErr
      }
    }
    await refreshTasks()
  }, [refreshTasks])

  const completeTask = useCallback(async (taskId, memberId) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'done',
        completed_at: new Date().toISOString(),
        completed_by: memberId,
      })
      .eq('id', taskId)
    if (error) throw error
    await refreshTasks()
  }, [refreshTasks])

  const reopenTask = useCallback(async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'open', completed_at: null, completed_by: null })
      .eq('id', taskId)
    if (error) throw error
    await refreshTasks()
  }, [refreshTasks])

  return {
    members,
    tasks,
    loading,
    error,
    refresh,
    createTask,
    updateTask,
    completeTask,
    reopenTask,
  }
}
