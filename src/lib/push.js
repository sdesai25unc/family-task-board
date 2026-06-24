import { supabase } from './supabase'

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY

// ── Environment checks ───────────────────────────────────────────────────────

export function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

// True when launched from the Home Screen (the only mode iOS allows push in).
export function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

// Does this browser/context support Web Push at all right now?
export function pushSupported() {
  const hasApis =
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  if (!hasApis) return false
  // On iOS, push only works once installed to the Home Screen.
  if (isIOS() && !isStandalone()) return false
  return true
}

export function permissionState() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission // 'default' | 'granted' | 'denied'
}

// ── Subscribe / unsubscribe ──────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

// Ask permission, subscribe via the service worker, and persist the subscription
// JSON to members.push_sub. Returns the subscription, or throws with a reason.
export async function enablePush(memberId) {
  if (!VAPID_PUBLIC) throw new Error('Push is not configured (missing VAPID public key).')
  if (!pushSupported()) {
    throw new Error(
      isIOS()
        ? 'On iPhone, add this app to your Home Screen first, then enable reminders from there.'
        : 'This browser does not support notifications.',
    )
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notifications were not allowed. You can enable them in browser settings.')
  }

  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
    })
  }

  const { error } = await supabase
    .from('members')
    .update({ push_sub: sub.toJSON() })
    .eq('id', memberId)
  if (error) throw error

  return sub
}

export async function disablePush(memberId) {
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()
  } catch {
    /* ignore */
  }
  await supabase.from('members').update({ push_sub: null }).eq('id', memberId)
}

// ── Sending (calls the Supabase Edge Function) ───────────────────────────────

// Fire a push to the given member ids via the send-push Edge Function.
// Best-effort: never throws into the UI — a failed notification must not block
// creating a task. The Edge Function handles email fallback server-side.
export async function sendPush({ memberIds, title, body, url = '/', tag }) {
  try {
    const base = import.meta.env.VITE_SUPABASE_URL
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!base || !anon) return
    await fetch(`${base}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anon}`,
        apikey: anon,
      },
      body: JSON.stringify({ memberIds, title, body, url, tag }),
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('sendPush failed (non-fatal):', e)
  }
}
