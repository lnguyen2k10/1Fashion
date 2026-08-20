import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function authorized() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  return profile?.role === 'super_admin' ? user : null
}

export async function GET(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(10, Number.parseInt(searchParams.get('pageSize') || '25', 10) || 25))
  const query = (searchParams.get('q') || '').trim().slice(0, 100)
  const admin = createAdminClient()
  let shopsQuery = admin
    .from('business_profiles')
    .select('id, account_id, business_name, slug, category, hotline, is_verified, location_city, profiles!inner(email, role, subscription_status, expiry_date), landing_pages(id, is_published, status)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)
  if (query) {
    const escaped = query.replaceAll(',', ' ')
    shopsQuery = shopsQuery.or(`business_name.ilike.%${escaped}%,category.ilike.%${escaped}%,location_city.ilike.%${escaped}%`)
  }
  const { data, error, count } = await shopsQuery
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ shops: data ?? [], total: count ?? 0, page, pageSize })
}

export async function PATCH(request: Request) {
  const actor = await authorized()
  if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json().catch(() => null)
  const businessId = typeof body?.businessId === 'string' ? body.businessId : ''
  if (!businessId) return NextResponse.json({ error: 'Missing business id' }, { status: 400 })

  const admin = createAdminClient()
  const { data: business } = await admin.from('business_profiles').select('id, account_id').eq('id', businessId).maybeSingle()
  if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const businessChanges = body?.businessChanges && typeof body.businessChanges === 'object' ? body.businessChanges : null
  const profileChanges = body?.profileChanges && typeof body.profileChanges === 'object' ? body.profileChanges : null
  const landingPageChanges = body?.landingPageChanges && typeof body.landingPageChanges === 'object' ? body.landingPageChanges : null
  if (businessChanges) {
    const allowed = ['business_name', 'category', 'categories', 'hotline', 'zalo_phone', 'location_city', 'location_district', 'location_ward', 'is_verified', 'theme_color', 'social_links', 'logo_url']
    const changes = Object.fromEntries(Object.entries(businessChanges).filter(([key]) => allowed.includes(key)))
    if (Object.keys(changes).length === 0) return NextResponse.json({ error: 'No valid shop fields supplied' }, { status: 400 })
    const { error } = await admin.from('business_profiles').update(changes).eq('id', business.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }
  if (profileChanges) {
    const allowed = ['role', 'subscription_status', 'expiry_date']
    const changes = Object.fromEntries(Object.entries(profileChanges).filter(([key]) => allowed.includes(key)))
    if (changes.role && !['shop', 'super_admin'].includes(String(changes.role))) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    if (changes.subscription_status === 'unblock') {
      const [{ data: activeSubscription }, { data: targetProfile }] = await Promise.all([
        admin.from('subscriptions').select('id').eq('business_id', business.id).eq('status', 'active').eq('verified', true).gt('end_date', new Date().toISOString()).limit(1).maybeSingle(),
        admin.from('profiles').select('expiry_date').eq('id', business.account_id).maybeSingle(),
      ])
      changes.subscription_status = activeSubscription ? 'active' : (targetProfile?.expiry_date && new Date(targetProfile.expiry_date).getTime() > Date.now() ? 'trial' : 'expired')
    }
    if (changes.subscription_status && !['trial', 'active', 'blocked', 'expired', 'inactive'].includes(String(changes.subscription_status))) return NextResponse.json({ error: 'Invalid subscription status' }, { status: 400 })
    if (changes.role && changes.role !== 'super_admin') {
      if (business.account_id === actor.id) return NextResponse.json({ error: 'You cannot remove your own super admin role' }, { status: 400 })
      const { data: targetProfile } = await admin.from('profiles').select('role').eq('id', business.account_id).maybeSingle()
      if (targetProfile?.role === 'super_admin') {
        const { count: adminCount } = await admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'super_admin')
        if ((adminCount ?? 0) <= 1) return NextResponse.json({ error: 'The last super admin role cannot be removed' }, { status: 400 })
      }
    }
    const { error } = await admin.from('profiles').update(changes).eq('id', business.account_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }
  if (landingPageChanges) {
    const landingPageId = typeof body?.landingPageId === 'string' ? body.landingPageId : null
    if (!landingPageId) return NextResponse.json({ error: 'Missing landing page id' }, { status: 400 })
    const { data: page } = await admin.from('landing_pages').select('id').eq('id', landingPageId).eq('business_id', business.id).maybeSingle()
    if (!page) return NextResponse.json({ error: 'Landing page not found' }, { status: 404 })
    const allowed = ['is_published', 'status']
    const changes = Object.fromEntries(Object.entries(landingPageChanges).filter(([key]) => allowed.includes(key)))
    if (typeof changes.is_published !== 'boolean' || !['Published', 'Draft'].includes(String(changes.status))) return NextResponse.json({ error: 'Invalid landing page state' }, { status: 400 })
    const { error } = await admin.from('landing_pages').update(changes).eq('id', page.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }
  await admin.from('admin_audit_logs').insert({ admin_id: actor.id, action: 'UPDATE_BUSINESS_ADMIN', target_id: business.id, target_type: 'business', details: { businessChanges, profileChanges, landingPageChanges, landingPageId: body?.landingPageId ?? null } })
  return NextResponse.json({ success: true })
}
