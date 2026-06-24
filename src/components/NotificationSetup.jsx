import { useEffect, useState } from 'react'
import {
  enablePush,
  pushSupported,
  permissionState,
  isIOS,
  isStandalone,
} from '../lib/push'

// A small banner under the header that guides the member to turn on reminders.
// Degrades gracefully: on iPhone-in-Safari it shows the Add-to-Home-Screen hint
// instead of a button that couldn't work.
export default function NotificationSetup({ member }) {
  const [status, setStatus] = useState('hidden') // hidden | prompt | ios-hint | denied | working | on
  const [error, setError] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!member) return
    if (isIOS() && !isStandalone()) {
      setStatus('ios-hint')
      return
    }
    if (!pushSupported()) {
      setStatus('hidden')
      return
    }
    const perm = permissionState()
    if (perm === 'granted') {
      // Already allowed — silently make sure this member's subscription is saved.
      enablePush(member.id).then(
        () => setStatus('hidden'),
        () => setStatus('hidden'),
      )
    } else if (perm === 'denied') {
      setStatus('denied')
    } else {
      setStatus('prompt')
    }
  }, [member])

  if (dismissed || status === 'hidden' || status === 'on') return null

  const turnOn = async () => {
    setStatus('working')
    setError(null)
    try {
      await enablePush(member.id)
      setStatus('on')
    } catch (e) {
      setError(e.message)
      setStatus('prompt')
    }
  }

  const Wrapper = ({ children }) => (
    <div className="mx-auto max-w-2xl px-4 pt-4">
      <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
        {children}
        <button
          onClick={() => setDismissed(true)}
          className="ml-auto shrink-0 rounded-full px-2 text-violet-400 hover:text-violet-700"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )

  if (status === 'ios-hint') {
    return (
      <Wrapper>
        <span className="text-lg">📲</span>
        <span>
          To get reminders on your iPhone: tap the <strong>Share</strong> button, choose{' '}
          <strong>Add to Home Screen</strong>, then open the app from your home screen and turn
          on reminders there.
        </span>
      </Wrapper>
    )
  }

  if (status === 'denied') {
    return (
      <Wrapper>
        <span className="text-lg">🔕</span>
        <span>
          Reminders are blocked. To turn them on, allow notifications for this site in your
          browser settings.
        </span>
      </Wrapper>
    )
  }

  // prompt / working
  return (
    <Wrapper>
      <span className="text-lg">🔔</span>
      <div>
        <span>Get a ping when someone assigns you a task.</span>
        {error && <div className="mt-1 text-rose-600">{error}</div>}
        <button
          onClick={turnOn}
          disabled={status === 'working'}
          className="mt-2 rounded-full bg-violet-600 px-4 py-1.5 font-semibold text-white shadow hover:bg-violet-700 disabled:opacity-50"
        >
          {status === 'working' ? 'Turning on…' : 'Turn on reminders'}
        </button>
      </div>
    </Wrapper>
  )
}
