import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'

export async function POST(request: Request) {
  const rateLimit = await enforceRateLimit(request, 'analytics', 60, 60 * 1000)
  if (rateLimit.unavailable) return NextResponse.json(
    { error: 'Analytics is temporarily unavailable.' },
    { status: 503 },
  )
  if (!rateLimit.allowed) return NextResponse.json(
    { error: 'Too many events.' },
    { status: 429 },
  )
  const body = await request.json().catch(() => null)
  const businessId = typeof body?.businessId === 'string' ? body.businessId : ''
  const pageSlug = typeof body?.pageSlug === 'string' ? body.pageSlug.slice(0, 160) : null
  const eventType = body?.eventType === 'view' || body?.eventType === 'zalo_click' ? body.eventType : null
  if (!businessId || !pageSlug || !eventType) return NextResponse.json({ error: 'Invalid event.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: business } = await admin.from('active_landing_pages').select('business_id').eq('business_id', businessId).eq('business_slug', pageSlug).maybeSingle()
  if (!business) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  await admin.from('analytics_events').insert({ business_id: businessId, event_type: eventType, page_slug: pageSlug, referrer: request.headers.get('referer')?.slice(0, 1000) ?? null })
  return NextResponse.json({ success: true }, { status: 201 })
}
