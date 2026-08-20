import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueEmail } from '@/lib/email-outbox'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const packageId = typeof body?.packageId === 'string' ? body.packageId : null
  const proofImageUrl = typeof body?.proofImageUrl === 'string' ? body.proofImageUrl : null
  if (!packageId || !proofImageUrl) return NextResponse.json({ error: 'Thiếu gói hoặc ảnh biên lai.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: shop, error: shopError } = await admin
    .from('business_profiles')
    .select('id')
    .eq('account_id', user.id)
    .maybeSingle()
  if (shopError || !shop) return NextResponse.json({ error: 'Không tìm thấy shop.' }, { status: 404 })

  const expectedPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public_images/shops/${shop.id}/receipt/`
  if (!proofImageUrl.startsWith(expectedPrefix)) {
    return NextResponse.json({ error: 'Ảnh biên lai không hợp lệ.' }, { status: 400 })
  }

  const { data: packageRecord } = await admin.from('packages').select('id, name, price').eq('id', packageId).eq('is_available', true).maybeSingle()
  if (!packageRecord) return NextResponse.json({ error: 'Gói không tồn tại.' }, { status: 404 })

  const { data: pendingRequest } = await admin
    .from('subscriptions')
    .select('id')
    .eq('business_id', shop.id)
    .eq('status', 'pending')
    .eq('verified', false)
    .limit(1)
    .maybeSingle()
  if (pendingRequest) {
    return NextResponse.json({ error: 'A pending payment request already exists for this shop.' }, { status: 409 })
  }

  const { data, error } = await admin.from('subscriptions').insert({
    business_id: shop.id,
    package_id: packageId,
    status: 'pending',
    verified: false,
    proof_image_url: proofImageUrl,
  }).select('id, status, verified, created_at').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { data: admins } = await admin.from('profiles').select('id, email').eq('role', 'super_admin')
  if (admins?.length) {
    await admin.from('notifications').insert(admins.map((profile) => ({
      profile_id: profile.id,
      sender_id: user.id,
      type: 'payment_review',
      title: 'Yêu cầu duyệt thanh toán',
      message: `Shop đã gửi biên lai cho gói ${packageRecord.name}.`,
      link: '/admin/subscriptions',
    })))
    await Promise.all(admins.filter((profile) => profile.email).map((profile) => queueEmail(admin, {
      profileId: profile.id,
      templateKey: 'payment_review',
      dedupeKey: `subscription:${data.id}:${profile.id}`,
      recipientEmail: profile.email,
      subject: '1Fashion.asia: Có yêu cầu duyệt thanh toán mới',
      bodyText: `Một shop vừa gửi biên lai cho gói ${packageRecord.name} (${packageRecord.price.toLocaleString('vi-VN')}đ). Vui lòng vào Quản trị > Đối soát thanh toán để kiểm tra.`,
    }))).catch((queueError) => console.error('Could not queue payment-review email', queueError))
  }

  return NextResponse.json({ data }, { status: 201 })
}
