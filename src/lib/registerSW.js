// Registers the service worker (required for install + push). Runs after load
// so it never blocks first paint. No-ops in browsers without service workers.
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('Service worker registration failed:', err)
    })
  })
}
