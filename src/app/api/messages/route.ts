import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''

export async function POST(request: Request) {
  const rateLimit = await enforceRateLimit(request, 'messages', 5, 10 * 60 * 1000)
  if (rateLimit.unavailable) return NextResponse.json(
    { error: 'Dá»‹ch vá»¥ táº¡m thá»i khÃ´ng sáºµn sÃ ng. Vui lÃ²ng thá»­ láº¡i.' },
    { status: 503 },
  )
  if (!rateLimit.allowed) return NextResponse.json(
    { error: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau.' },
    { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000))) } },
  )
  const body = await request.json().catch(() => null)
  const businessId = clean(body?.businessId, 64)
  const customerName = clean(body?.customerName, 120)
  const customerPhone = clean(body?.customerPhone, 30)
  const content = clean(body?.content, 2000)
  if (!businessId || !customerName || !customerPhone || !content) return NextResponse.json({ error: 'Thông tin liên hệ không hợp lệ.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: business } = await admin.from('active_landing_pages').select('business_id').eq('business_id', businessId).maybeSingle()
  if (!business) return NextResponse.json({ error: 'Cửa hàng không tồn tại.' }, { status: 404 })
  const { error } = await admin.from('shop_messages').insert({ business_id: businessId, customer_name: customerName, customer_phone: customerPhone, content })
  if (error) return NextResponse.json({ error: 'Không thể gửi tin nhắn.' }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 201 })
}
