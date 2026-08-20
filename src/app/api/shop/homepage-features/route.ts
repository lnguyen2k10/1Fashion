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
  return { admin, shop }
}

async function activeSubscription(admin: ReturnType<typeof createAdminClient>, businessId: string) {
  return admin.from('subscriptions').select('id, benefits_snapshot, packages(limits)').eq('business_id', businessId).eq('status', 'active').eq('verified', true).gt('end_date', new Date().toISOString()).order('end_date', { ascending: false }).limit(1).maybeSingle()
}

export async function GET() {
  const context = await currentShop()
  if ('error' in context) return context.error
  const [subscriptionResult, productsResult, activationsResult] = await Promise.all([
    activeSubscription(context.admin, context.shop.id),
    context.admin.from('shop_products').select('id, name, image_url, status').eq('business_id', context.shop.id).eq('status', 'active').order('created_at', { ascending: false }),
    context.admin.from('homepage_feature_activations').select('id, feature_type, product_id, starts_at, expires_at, created_at, subscription_id').eq('business_id', context.shop.id).order('created_at', { ascending: false }),
  ])
  if (productsResult.error || activationsResult.error) return NextResponse.json({ error: productsResult.error?.message || activationsResult.error?.message }, { status: 400 })
  const subscription = subscriptionResult.data
  const packageLimits = (subscription?.benefits_snapshot || (subscription?.packages as { limits?: unknown } | null)?.limits || {}) as Record<string, unknown>
  return NextResponse.json({ subscription: subscription ? { id: subscription.id, limits: packageLimits } : null, products: productsResult.data ?? [], activations: activationsResult.data ?? [] })
}

export async function POST(request: Request) {
  const context = await currentShop()
  if ('error' in context) return context.error
  const body = await request.json().catch(() => null)
  const featureType = body?.featureType === 'shop' || body?.featureType === 'product' ? body.featureType : null
  const productId = typeof body?.productId === 'string' ? body.productId : null
  if (!featureType || (featureType === 'product' && !productId)) return NextResponse.json({ error: 'Invalid homepage feature request.' }, { status: 400 })
  const { data: subscription } = await activeSubscription(context.admin, context.shop.id)
  if (!subscription) return NextResponse.json({ error: 'No active membership package.' }, { status: 400 })
  const { data, error } = await context.admin.from('homepage_feature_activations')
    .insert({ business_id: context.shop.id, subscription_id: subscription.id, feature_type: featureType, product_id: featureType === 'product' ? productId : null, expires_at: new Date().toISOString() })
    .select('id, feature_type, product_id, starts_at, expires_at')
    .single()
  if (error) {
    const isQuotaError = error.message.includes('homepage_feature_quota_exceeded')
    return NextResponse.json({ error: isQuotaError ? 'This homepage feature quota has already been used.' : error.message }, { status: 400 })
  }
  return NextResponse.json({ activation: data }, { status: 201 })
}
