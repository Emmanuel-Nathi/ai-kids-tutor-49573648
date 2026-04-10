import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_NAME = 'ai-kids-tutor'
const ROOT_DOMAIN = 'www.aikidstutor.co.za'
const SENDER_DOMAIN = 'notify.www.aikidstutor.co.za'
const FROM_DOMAIN = 'www.aikidstutor.co.za'
const LOGO_URL = `https://${ROOT_DOMAIN}/email-logo.png`

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatMinutes(seconds: number): string {
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`
}

interface ChildStats {
  name: string
  sessions: number
  xp: number
  activeSeconds: number
  homework: number
  subjects: Record<string, number>
}

function buildEmailHtml(parentName: string, childrenStats: ChildStats[]): string {
  const safeParentName = escapeHtml(parentName || 'there')
  const childCards = childrenStats.map(c => {
    const safeName = escapeHtml(c.name)
    return `
    <div style="background:#FFF7ED;border-radius:12px;padding:20px;margin-bottom:16px;">
      <h3 style="font-family:'Fredoka',sans-serif;color:#1A1F2C;margin:0 0 12px 0;font-size:18px;">
        🧒 ${safeName}
      </h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;color:#6B7280;font-size:14px;">📚 Sessions</td>
          <td style="padding:6px 0;text-align:right;font-weight:600;color:#1A1F2C;font-size:14px;">${c.sessions}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6B7280;font-size:14px;">⭐ XP Earned</td>
          <td style="padding:6px 0;text-align:right;font-weight:600;color:#F59E0B;font-size:14px;">${c.xp}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6B7280;font-size:14px;">⏱️ Learning Time</td>
          <td style="padding:6px 0;text-align:right;font-weight:600;color:#1A1F2C;font-size:14px;">${formatMinutes(c.activeSeconds)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6B7280;font-size:14px;">📝 Homework</td>
          <td style="padding:6px 0;text-align:right;font-weight:600;color:#1A1F2C;font-size:14px;">${c.homework}</td>
        </tr>
      </table>
      ${Object.keys(c.subjects).length > 0 ? `
      <div style="margin-top:12px;">
        <p style="color:#6B7280;font-size:13px;margin:0 0 8px;font-weight:600;">📖 Subjects Studied</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${Object.entries(c.subjects).map(([subj, count]) => `
            <span style="display:inline-block;background:#FED7AA;color:#9A3412;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;">
              ${escapeHtml(subj)} × ${count}
            </span>
          `).join('')}
        </div>
      </div>` : ''}
    </div>
  `}).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#F97316,#FB923C);padding:32px;text-align:center;">
        <img src="${LOGO_URL}" alt="${SITE_NAME}" width="60" height="60" style="border-radius:12px;margin-bottom:12px;">
        <h1 style="font-family:'Fredoka',sans-serif;color:#ffffff;margin:0;font-size:24px;">
          Weekly Learning Report 📊
        </h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">
          Here's how your kids did this week
        </p>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;font-size:15px;margin:0 0 20px;">
          Hi ${safeParentName} 👋, here's your weekly summary:
        </p>
        ${childCards}
        <div style="text-align:center;margin-top:24px;">
          <a href="https://${ROOT_DOMAIN}/parent"
             style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;">
            View Full Report →
          </a>
        </div>
      </div>
      <div style="padding:20px 24px;background:#F9FAFB;text-align:center;border-top:1px solid #E5E7EB;">
        <p style="color:#9CA3AF;font-size:12px;margin:0;">
          You're receiving this because you have an account on AI Kids Tutor.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}

function buildPlainText(parentName: string, childrenStats: ChildStats[]): string {
  let text = `Weekly Learning Report\n\nHi ${parentName || 'there'},\n\nHere's how your kids did this week:\n\n`
  for (const c of childrenStats) {
    text += `${c.name}\n`
    text += `  Sessions: ${c.sessions}\n`
    text += `  XP Earned: ${c.xp}\n`
    text += `  Learning Time: ${formatMinutes(c.activeSeconds)}\n`
    text += `  Homework: ${c.homework}\n`
    const subjEntries = Object.entries(c.subjects)
    if (subjEntries.length > 0) {
      text += `  Subjects: ${subjEntries.map(([s, n]) => `${s} (${n})`).join(', ')}\n`
    }
    text += `\n`
  }
  text += `View full report: https://${ROOT_DOMAIN}/parent\n`
  return text
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Get all parents with children
  const { data: parents, error: parentErr } = await supabase
    .from('profiles')
    .select('user_id, display_name')

  if (parentErr || !parents?.length) {
    console.error('Failed to fetch parents', parentErr)
    return new Response(JSON.stringify({ error: 'No parents found' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let emailsSent = 0

  for (const parent of parents) {
    const { data: authUser } = await supabase.auth.admin.getUserById(parent.user_id)
    if (!authUser?.user?.email) continue

    const { data: children } = await supabase
      .from('children')
      .select('id, name')
      .eq('parent_id', parent.user_id)

    if (!children?.length) continue

    const childrenStats: ChildStats[] = []

    for (const child of children) {
      const { data: sessions } = await supabase
        .from('sessions')
        .select('active_time_seconds, subject')
        .eq('child_id', child.id)
        .gte('started_at', oneWeekAgo)

      const sessionCount = sessions?.length ?? 0
      const activeSeconds = sessions?.reduce((sum, s) => sum + (s.active_time_seconds || 0), 0) ?? 0

      const subjectMap: Record<string, number> = {}
      for (const s of sessions ?? []) {
        if (s.subject) {
          subjectMap[s.subject] = (subjectMap[s.subject] || 0) + 1
        }
      }

      const { data: points } = await supabase
        .from('points')
        .select('amount')
        .eq('child_id', child.id)
        .gte('created_at', oneWeekAgo)

      const xp = points?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0

      const { data: hw } = await supabase
        .from('homework')
        .select('id')
        .eq('child_id', child.id)
        .gte('created_at', oneWeekAgo)

      childrenStats.push({
        name: child.name,
        sessions: sessionCount,
        xp,
        activeSeconds,
        homework: hw?.length ?? 0,
        subjects: subjectMap,
      })
    }

    const totalActivity = childrenStats.reduce((s, c) => s + c.sessions + c.xp + c.homework, 0)
    if (totalActivity === 0) continue

    const html = buildEmailHtml(parent.display_name || '', childrenStats)
    const text = buildPlainText(parent.display_name || '', childrenStats)
    const messageId = crypto.randomUUID()

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'weekly_summary',
      recipient_email: authUser.user.email,
      status: 'pending',
    })

    const { error: enqueueError } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        run_id: messageId,
        message_id: messageId,
        to: authUser.user.email,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: 'Your Weekly Learning Report 📊',
        html,
        text,
        purpose: 'transactional',
        label: 'weekly_summary',
        queued_at: new Date().toISOString(),
      },
    })

    if (enqueueError) {
      console.error('Failed to enqueue weekly summary', { email: authUser.user.email, error: enqueueError })
      await supabase.from('email_send_log').insert({
        message_id: messageId,
        template_name: 'weekly_summary',
        recipient_email: authUser.user.email,
        status: 'failed',
        error_message: 'Failed to enqueue',
      })
    } else {
      emailsSent++
    }
  }

  console.log(`Weekly summary complete: ${emailsSent} emails enqueued`)

  return new Response(
    JSON.stringify({ success: true, emails_enqueued: emailsSent }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
