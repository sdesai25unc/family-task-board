/* Family Task Board service worker.
 *
 * Deliberately MINIMAL caching: this app needs fresh task data, so we do NOT
 * cache API responses. We only take control quickly and handle push messages.
 * (A full offline cache could serve stale tasks, which is worse than a network
 * error for a live shared board.) */

self.addEventListener('install', () => {
  // Activate this version immediately instead of waiting for old tabs to close.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// ── Web Push (used from the notifications phase onward) ───────────────────────
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'Family Task Board', body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'Family Task Board'
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' },
    tag: data.tag, // collapse duplicate reminders for the same task
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Focus (or open) the app when a notification is tapped.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    }),
  )
})
