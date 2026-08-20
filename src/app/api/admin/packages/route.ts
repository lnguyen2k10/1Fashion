import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function validatePackage(input: unknown) {
  const body = input && typeof input === 'object' ? input as Record<string, unknown> : {}
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : ''
  const price = typeof body.price === 'number' ? body.price : Number(body.price)
  const durationDays = typeof body.duration_days === 'number' ? body.duration_days : Number(body.duration_days)
  const trialDays = typeof body.trial_days === 'number' ? body.trial_days : Number(body.trial_days || 0)
  const isAvailable = body.is_available !== false
  const limits = body.limits as Record<string, unknown> | undefined
  const readLimit = (key: string, allowUnlimited = false) => {
    const value = limits?.[key]
    if (allowUnlimited && (value === null || value === -1 || value === '-1')) return null
    const number = Number(value)
    return Number.isInteger(number) && number >= 0 && number <= 10000 ? number : undefined
  }
  const maxOffers = readLimit('max_offers')
  const maxProducts = readLimit('max_products', true)
  const maxAdminBlogs = readLimit('max_admin_blog_posts')
  const homepageShopFeatures = readLimit('homepage_shop_feature_count')
  const homepageProductFeatures = readLimit('homepage_product_feature_count')
  const facebookPosts = readLimit('facebook_post_count')
  const features = Array.isArray(body.features) ? body.features.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, 200)).filter(Boolean).slice(0, 30) : []
  if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 3650 || !Number.isInteger(trialDays) || trialDays < 0 || trialDays > 365 || [maxOffers, maxProducts, maxAdminBlogs, homepageShopFeatures, homepageProductFeatures, facebookPosts].some((item) => item === undefined)) return null
  return { name, price: Math.round(price), duration_days: durationDays, trial_days: trialDays, is_available: isAvailable, limits: { public_landing_page: limits?.public_landing_page !== false, max_products: maxProducts, max_admin_blog_posts: maxAdminBlogs, max_offers: maxOffers, homepage_shop_feature_count: homepageShopFeatures, homepage_shop_feature_duration_days: 7, homepage_product_feature_count: homepageProductFeatures, homepage_product_feature_duration_days: 7, facebook_post_count: facebookPosts, refund_window_days: 365, refund_percentage: 100 }, features }
}

// Helper to check admin role
async function checkAdmin(req: Request) {
  const { data: { user } } = await supabaseAdmin.auth.getUser(
    req.headers.get('Authorization')?.split(' ')[1] || ''
  )
  if (!user) return false
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return profile?.role === 'super_admin'
}

export async function GET(req: Request) {
  if (!await checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data, error } = await supabaseAdmin
    .from('packages')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!await checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const payload = validatePackage(await req.json().catch(() => null))
  if (!payload) return NextResponse.json({ error: 'Dữ liệu gói không hợp lệ.' }, { status: 400 })
  const { data, error } = await supabaseAdmin.from('packages').insert([payload]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  if (!await checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  const id = body && typeof body.id === 'string' ? body.id : null
  const updates = validatePackage(body)
  if (!id || !updates) return NextResponse.json({ error: 'Dữ liệu gói không hợp lệ.' }, { status: 400 })
  const { data, error } = await supabaseAdmin.from('packages').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  if (!await checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  const { error } = await supabaseAdmin.from('packages').update({ is_available: false }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, archived: true })
}
