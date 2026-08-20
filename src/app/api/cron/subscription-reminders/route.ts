import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueEmail } from '@/lib/email-outbox'

export const runtime = 'nodejs'

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  return Boolean(secret && request.headers.get('authorization') === `Bearer ${secret}`)
}

async function enqueueExpiringMemberships() {
  const admin = createAdminClient()
  const now = new Date()
  const deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const { data: profiles, error } = await admin.from('profiles')
    .select('id, email, full_name, expiry_date')
    .eq('role', 'shop')
    .neq('subscription_status', 'blocked')
    .gte('expiry_date', now.toISOString())
    .lte('expiry_date', deadline.toISOString())
  if (error) throw error

  await Promise.all((profiles ?? []).filter((profile) => profile.email && profile.expiry_date).map(async (profile) => {
    const expiry = new Date(profile.expiry_date!).toISOString().slice(0, 10)
    await queueEmail(admin, {
      profileId: profile.id,
      templateKey: 'membership_expiry_reminder',
      dedupeKey: `${profile.id}:${expiry}`,
      recipientEmail: profile.email,
      subject: '1Fashion.asia: Gói thành viên của bạn sắp hết hạn',
      bodyText: `Xin chào ${profile.full_name || 'bạn'}, gói thành viên của bạn sẽ hết hạn vào ${expiry}. Vui lòng gửi yêu cầu gia hạn trong trang quản trị shop để duy trì landing page công khai.`,
    })
  }))
  return profiles?.length ?? 0
}

async function deliverOutbox() {
  const admin = createAdminClient()
  const { data: items, error } = await admin.from('email_outbox')
    .select('id, recipient_email, subject, body_text, attempt_count')
    .in('status', ['pending', 'failed'])
    .lt('attempt_count', 3)
    .order('created_at', { ascending: true })
    .limit(50)
  if (error) throw error

  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) return { delivered: 0, queued: items?.length ?? 0, configured: false }
  const resend = new Resend(process.env.RESEND_API_KEY)
  let delivered = 0
  for (const item of items ?? []) {
    const { data, error: sendError } = await resend.emails.send({ from: process.env.FROM_EMAIL, to: item.recipient_email, subject: item.subject, text: item.body_text })
    const update = sendError
      ? { status: 'failed', error_message: sendError.message.slice(0, 1000), attempt_count: item.attempt_count + 1, last_attempt_at: new Date().toISOString() }
      : { status: 'sent', provider_message_id: data?.id ?? null, error_message: null, attempt_count: item.attempt_count + 1, last_attempt_at: new Date().toISOString(), sent_at: new Date().toISOString() }
    const { error: updateError } = await admin.from('email_outbox').update(update).eq('id', item.id)
    if (updateError) throw updateError
    if (!sendError) delivered += 1
  }
  return { delivered, queued: items?.length ?? 0, configured: true }
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const enqueued = await enqueueExpiringMemberships()
    const delivery = await deliverOutbox()
    return NextResponse.json({ success: true, enqueued, ...delivery })
  } catch (error) {
    console.error('subscription reminder cron failed', error)
    return NextResponse.json({ error: 'Unable to process email outbox' }, { status: 500 })
  }
}
