// send-push — Supabase Edge Function (Deno)
//
// Sends a Web Push notification to a set of members. If a member has no push
// subscription (or push fails) and email is configured, it falls back to Resend.
//
// Called from the app (on task assign) and from the daily cron function.
// Body: { memberIds: string[], title: string, body: string, url?: string, tag?: string }
//
// Secrets it needs (set in the dashboard, see supabase/functions/README.md):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
//   RESEND_API_KEY, RESEND_FROM_EMAIL   (optional — enables email fallback)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by Supabase automatically.

import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function sendEmail(key: string, to: string, title: string, body: string) {
  const from = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to,
      subject: `Family Task Board: ${title}`,
      text: `${title}\n\n${body}\n\nOpen the board to see it.`,
    }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { memberIds, title, body, url = '/', tag } = await req.json()
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return json({ error: 'memberIds (non-empty array) required' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: members, error } = await supabase
      .from('members')
      .select('id, name, email, push_sub')
      .in('id', memberIds)
    if (error) throw error

    const subject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@example.com'
    const pub = Deno.env.get('VAPID_PUBLIC_KEY')
    const priv = Deno.env.get('VAPID_PRIVATE_KEY')
    const vapidReady = Boolean(pub && priv)
    if (vapidReady) webpush.setVapidDetails(subject, pub!, priv!)

    const resendKey = Deno.env.get('RESEND_API_KEY')
    const payload = JSON.stringify({ title, body, url, tag })
    const results: unknown[] = []

    for (const m of members ?? []) {
      // 1) Try Web Push if we have a subscription + keys.
      if (m.push_sub && vapidReady) {
        try {
          await webpush.sendNotification(m.push_sub, payload)
          results.push({ id: m.id, via: 'push', ok: true })
          continue
        } catch (e: any) {
          const code = e?.statusCode
          // 404/410 = subscription is dead; clear it so we stop trying.
          if (code === 404 || code === 410) {
            await supabase.from('members').update({ push_sub: null }).eq('id', m.id)
          }
          results.push({ id: m.id, via: 'push', ok: false, error: String(code || e) })
          // fall through to email
        }
      }

      // 2) Email fallback.
      if (m.email && resendKey) {
        try {
          await sendEmail(resendKey, m.email, title, body)
          results.push({ id: m.id, via: 'email', ok: true })
        } catch (e) {
          results.push({ id: m.id, via: 'email', ok: false, error: String(e) })
        }
      } else if (!m.push_sub) {
        results.push({ id: m.id, via: 'none', ok: false, error: 'no push_sub and no email' })
      }
    }

    return json({ results })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
