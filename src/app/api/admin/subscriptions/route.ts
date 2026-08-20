import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'super_admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { supabase }
}

export async function GET() {
  const authorization = await requireSuperAdmin()
  if ('error' in authorization) return authorization.error

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('subscriptions')
    .select('id, status, verified, proof_image_url, created_at, end_date, business_profiles!inner(id, business_name, account_id), packages(id, name, price, duration_days)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ subscriptions: data ?? [] })
}

export async function PATCH(request: Request) {
  const authorization = await requireSuperAdmin()
  if ('error' in authorization) return authorization.error

  const body = await request.json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id : null
  const approve = typeof body?.approve === 'boolean' ? body.approve : null
  if (!id || approve === null) return NextResponse.json({ error: 'Dữ liệu duyệt không hợp lệ.' }, { status: 400 })

  const { error } = await authorization.supabase.rpc('review_subscription', { subscription_id: id, approve })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
