import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'ftb:member-id'

// Identity = the member id you picked, stored in localStorage. No real auth.
export function useCurrentMember(members) {
  const [memberId, setMemberId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || null
    } catch {
      return null
    }
  })

  const select = useCallback((id) => {
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      /* private mode etc. — keep working in-memory */
    }
    setMemberId(id)
  }, [])

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setMemberId(null)
  }, [])

  // If the stored id no longer matches a real member (e.g. db reseeded), drop it.
  useEffect(() => {
    if (memberId && members.length && !members.some((m) => m.id === memberId)) {
      clear()
    }
  }, [memberId, members, clear])

  const member = members.find((m) => m.id === memberId) || null

  return { memberId, member, select, clear }
}
