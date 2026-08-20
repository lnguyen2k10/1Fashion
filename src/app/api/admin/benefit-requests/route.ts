import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'super_admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { user, admin: createAdminClient() }
}

export async function GET() {
  const context = await requireAdmin()
  if ('error' in context) return context.error
  const { data, error } = await context.admin
    .from('membership_benefit_requests')
    .select('id, benefit_type, details, status, admin_note, requested_at, reviewed_at, business_profiles(business_name), subscriptions(packages(name))')
    .order('requested_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ requests: data ?? [] })
}

export async function PATCH(request: Request) {
  const context = await requireAdmin()
  if ('error' in context) return context.error
  const body = await request.json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id : null
  const status = ['in_progress', 'fulfilled', 'rejected'].includes(body?.status) ? body.status : null
  const adminNote = typeof body?.adminNote === 'string' ? body.adminNote.trim().slice(0, 3000) : null
  if (!id || !status) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  const { error } = await context.admin
    .from('membership_benefit_requests')
    .update({ status, admin_note: adminNote, reviewed_at: new Date().toISOString(), reviewed_by: context.user.id })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
