import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function currentShop() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const admin = createAdminClient()
  const { data: shop } = await admin.from('business_profiles').select('id').eq('account_id', user.id).maybeSingle()
  if (!shop) return { error: NextResponse.json({ error: 'Shop not found' }, { status: 404 }) }
  return { admin, user, shop }
}

export async function GET() {
  const context = await currentShop()
  if ('error' in context) return context.error
  const { data, error } = await context.admin.from('refund_requests').select('id, subscription_id, status, reason, admin_note, requested_at, reviewed_at').eq('business_id', context.shop.id).order('requested_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ requests: data ?? [] })
}

export async function POST(request: Request) {
  const context = await currentShop()
  if ('error' in context) return context.error
  const body = await request.json().catch(() => null)
  const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 2000) : ''
  const { data: subscription } = await context.admin.from('subscriptions').select('id, start_date, status, verified').eq('business_id', context.shop.id).eq('status', 'active').eq('verified', true).order('start_date', { ascending: false }).limit(1).maybeSingle()
  if (!subscription || !subscription.start_date || Date.now() - new Date(subscription.start_date).getTime() > 365 * 24 * 60 * 60 * 1000) return NextResponse.json({ error: 'Gói không còn trong thời hạn hoàn tiền 100% (365 ngày).' }, { status: 400 })
  const { data: created, error } = await context.admin.from('refund_requests').insert({ business_id: context.shop.id, subscription_id: subscription.id, reason }).select('id, status, requested_at').single()
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'Yêu cầu hoàn tiền cho gói này đã tồn tại.' : error.message }, { status: 400 })
  const { data: admins } = await context.admin.from('profiles').select('id').eq('role', 'super_admin')
  if (admins?.length) await context.admin.from('notifications').insert(admins.map((admin) => ({ profile_id: admin.id, sender_id: context.user.id, type: 'refund_request', title: 'Yêu cầu hoàn tiền', message: 'Một shop đã gửi yêu cầu hoàn tiền gói thành viên.', link: '/admin/subscriptions' })))
  return NextResponse.json({ request: created }, { status: 201 })
}
