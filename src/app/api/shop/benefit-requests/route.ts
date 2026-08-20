import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const benefitTypes = ['admin_blog', 'facebook_post'] as const
type BenefitType = typeof benefitTypes[number]

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
  const { data, error } = await context.admin
    .from('membership_benefit_requests')
    .select('id, benefit_type, details, status, admin_note, requested_at, reviewed_at, subscription_id')
    .eq('business_id', context.shop.id)
    .order('requested_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ requests: data ?? [] })
}

export async function POST(request: Request) {
  const context = await currentShop()
  if ('error' in context) return context.error
  const body = await request.json().catch(() => null)
  const benefitType = benefitTypes.includes(body?.benefitType as BenefitType) ? body.benefitType as BenefitType : null
  const details = typeof body?.details === 'string' ? body.details.trim().slice(0, 3000) : ''
  if (!benefitType) return NextResponse.json({ error: 'Invalid benefit type.' }, { status: 400 })

  const { data: subscription } = await context.admin
    .from('subscriptions')
    .select('id')
    .eq('business_id', context.shop.id)
    .eq('status', 'active')
    .eq('verified', true)
    .gt('end_date', new Date().toISOString())
    .order('end_date', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!subscription) return NextResponse.json({ error: 'No active membership package.' }, { status: 400 })

  const { data: created, error } = await context.admin
    .from('membership_benefit_requests')
    .insert({ business_id: context.shop.id, subscription_id: subscription.id, benefit_type: benefitType, details })
    .select('id, benefit_type, status, requested_at')
    .single()
  if (error) {
    const quotaExceeded = error.message.includes('membership_benefit_quota_exceeded')
    return NextResponse.json({ error: quotaExceeded ? 'Benefit quota has already been used.' : error.message }, { status: 400 })
  }

  const { data: admins } = await context.admin.from('profiles').select('id').eq('role', 'super_admin')
  if (admins?.length) {
    await context.admin.from('notifications').insert(admins.map((admin) => ({
      profile_id: admin.id,
      sender_id: context.user.id,
      type: 'membership_benefit_request',
      title: 'Membership benefit request',
      message: 'A shop has requested a membership benefit.',
      link: '/admin/subscriptions',
    })))
  }
  return NextResponse.json({ request: created }, { status: 201 })
}
