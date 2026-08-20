import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const [shops, views, pendingPayments, activeSubscriptions, pendingRefunds, pendingBenefits, settings] = await Promise.all([
    admin.from('business_profiles').select('*', { count: 'exact', head: true }),
    admin.from('analytics_events').select('*', { count: 'exact', head: true }),
    admin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('verified', true).gt('end_date', new Date().toISOString()),
    admin.from('refund_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('membership_benefit_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'in_progress']),
    admin.from('site_settings').select('logo_url, manual_payment_instructions').eq('id', 'current').maybeSingle(),
  ])
  const errors = [shops, views, pendingPayments, activeSubscriptions, pendingRefunds, pendingBenefits, settings].find((result) => result.error)?.error
  if (errors) return NextResponse.json({ error: errors.message }, { status: 400 })
  return NextResponse.json({
    metrics: { shops: shops.count ?? 0, pageViews: views.count ?? 0, pendingPayments: pendingPayments.count ?? 0, activeSubscriptions: activeSubscriptions.count ?? 0, pendingRefunds: pendingRefunds.count ?? 0, pendingBenefits: pendingBenefits.count ?? 0 },
    readiness: { logoConfigured: Boolean(settings.data?.logo_url), paymentInstructionsConfigured: Boolean(settings.data?.manual_payment_instructions) },
  })
}
