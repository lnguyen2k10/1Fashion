import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_SHOP_CONTENT, DEFAULT_TEMPLATE_ID } from '@/lib/constants'
import { slugify } from '@/lib/utils'

const MAX_BATCH_SIZE = 250
const TRIAL_DAYS = 30

type ProductInput = {
  name: string
  description?: string
  price?: string
  price_original?: string
  image_url?: string
  image_gallery?: string[]
  category?: string
  is_featured?: boolean
  sort_order?: number
  tags?: string[]
}

type ShopInput = {
  email?: unknown
  password?: unknown
  business_name?: unknown
  description?: unknown
  categories?: unknown
  location_city?: unknown
  location_district?: unknown
  location_ward?: unknown
  address_full?: unknown
  hotline?: unknown
  zalo_phone?: unknown
  logo_url?: unknown
  operating_hours?: unknown
  facebook_url?: unknown
  website_url?: unknown
  hero_slides?: unknown  // string[] – up to 3 image URLs
  products?: unknown     // ProductInput[]
}

type NormalizedShop = {
  email: string
  password: string
  businessName: string
  description: string | null
  categories: string[]
  locationCity: string | null
  locationDistrict: string | null
  locationWard: string | null
  addressFull: string | null
  hotline: string | null
  zaloPhone: string | null
  logoUrl: string | null
  operatingHours: string | null
  facebookUrl: string | null
  websiteUrl: string | null
  heroSlides: string[]
  products: ProductInput[]
}

const asText = (value: unknown, max = 160) => typeof value === 'string' ? value.trim().slice(0, max) : ''

function normalizeCategories(value: unknown) {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[;,|]/) : []
  return [...new Set(raw.map((item) => asText(item, 80)).filter(Boolean))].slice(0, 12)
}

function normalizeHeroSlides(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => typeof item === 'string' ? item.trim() : '')
    .filter(Boolean)
    .slice(0, 3)
}

function normalizeProducts(value: unknown): ProductInput[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object' && typeof (item as any).name === 'string' && (item as any).name.trim())
    .map((item: any) => ({
      name: String(item.name).trim().slice(0, 200),
      description: item.description ? String(item.description).trim().slice(0, 1000) : undefined,
      price: item.price ? String(item.price).trim().slice(0, 50) : undefined,
      price_original: item.price_original ? String(item.price_original).trim().slice(0, 50) : undefined,
      image_url: item.image_url ? String(item.image_url).trim().slice(0, 500) : undefined,
      image_gallery: Array.isArray(item.image_gallery) ? item.image_gallery.filter((u: unknown) => typeof u === 'string').slice(0, 5) : undefined,
      category: item.category ? String(item.category).trim().slice(0, 80) : undefined,
      is_featured: Boolean(item.is_featured),
      sort_order: Number(item.sort_order) || 0,
      tags: Array.isArray(item.tags) ? item.tags.filter((t: unknown) => typeof t === 'string') : undefined,
    }))
    .slice(0, 500)
}

function normalizeShop(input: ShopInput): NormalizedShop {
  const email = asText(input.email, 254).toLowerCase()
  const password = typeof input.password === 'string' ? input.password : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email không hợp lệ.')
  if (password.length < 8 || password.length > 128) throw new Error('Mật khẩu phải có từ 8 đến 128 ký tự.')

  const businessName = asText(input.business_name, 120) || `Shop ${email.split('@')[0]}`
  return {
    email,
    password,
    businessName,
    description: asText(input.description, 500) || null,
    categories: normalizeCategories(input.categories),
    locationCity: asText(input.location_city, 100) || null,
    locationDistrict: asText(input.location_district, 100) || null,
    locationWard: asText(input.location_ward, 100) || null,
    addressFull: asText(input.address_full, 300) || null,
    hotline: asText(input.hotline, 40) || null,
    zaloPhone: asText(input.zalo_phone, 40) || null,
    logoUrl: asText(input.logo_url, 500) || null,
    operatingHours: asText(input.operating_hours, 200) || null,
    facebookUrl: asText(input.facebook_url, 500) || null,
    websiteUrl: asText(input.website_url, 500) || null,
    heroSlides: normalizeHeroSlides(input.hero_slides),
    products: normalizeProducts(input.products),
  }
}

async function getActor() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  return profile?.role === 'super_admin' ? user : null
}

async function provisionOne(raw: ShopInput) {
  const shop = normalizeShop(raw)
  const admin = createAdminClient()
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: shop.email,
    password: shop.password,
    email_confirm: true,
    user_metadata: { full_name: shop.businessName },
  })
  if (authError || !authData.user) throw new Error(authError?.message || 'Không thể tạo tài khoản đăng nhập.')

  const accountId = authData.user.id
  let businessId: string | null = null
  try {
    const expiryDate = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const { error: profileError } = await admin.from('profiles').upsert({
      id: accountId,
      email: shop.email,
      full_name: shop.businessName,
      role: 'shop',
      subscription_status: 'trial',
      expiry_date: expiryDate,
    }, { onConflict: 'id' })
    if (profileError) throw profileError

    const slug = `${slugify(shop.businessName) || 'shop'}-${crypto.randomUUID().slice(0, 8)}`
    const { data: business, error: businessError } = await admin.from('business_profiles').insert({
      account_id: accountId,
      business_name: shop.businessName,
      slug,
      category: shop.categories[0] || 'Chưa phân loại',
      categories: shop.categories,
      location_city: shop.locationCity,
      location_district: shop.locationDistrict,
      location_ward: shop.locationWard,
      address_full: shop.addressFull,
      hotline: shop.hotline,
      zalo_phone: shop.zaloPhone,
      logo_url: shop.logoUrl,
      description: shop.description,
      operating_hours_text: shop.operatingHours,
      facebook_url: shop.facebookUrl,
      website_url: shop.websiteUrl,
      is_verified: false,
    }).select('id, slug').single()
    if (businessError || !business) throw businessError || new Error('Không thể tạo hồ sơ shop.')
    businessId = business.id

    // Build content_json with hero slides & contact info populated
    const contentJson = structuredClone(DEFAULT_SHOP_CONTENT) as any
    if (shop.heroSlides.length > 0) {
      contentJson.hero_section.hero_slides = shop.heroSlides.map((url) => ({ image_url: url, title: '' }))
      // Pad to 3 slides if fewer provided
      const defaults = (DEFAULT_SHOP_CONTENT as any).hero_section.hero_slides
      while (contentJson.hero_section.hero_slides.length < 3) {
        contentJson.hero_section.hero_slides.push(defaults[contentJson.hero_section.hero_slides.length] || defaults[0])
      }
    }
    contentJson.about_us.intro_text = shop.description || contentJson.about_us.intro_text
    contentJson.contact_info.address_full = shop.addressFull || ''
    contentJson.contact_info.hotline = shop.hotline || ''
    contentJson.contact_info.website = shop.websiteUrl || ''
    if (shop.facebookUrl) {
      contentJson.contact_info.social_links = [{ platform: 'facebook', url: shop.facebookUrl }]
    }
    contentJson.cta_banner.cta_phone = shop.zaloPhone || shop.hotline || ''

    const { error: landingError } = await admin.from('landing_pages').insert({
      business_id: business.id,
      template_id: DEFAULT_TEMPLATE_ID,
      status: 'Draft',
      is_published: false,
      content_json: contentJson,
      draft_json: contentJson,
    })
    if (landingError) throw landingError

    if (shop.addressFull && shop.locationDistrict) {
      await admin.from('business_locations').insert({
        business_id: business.id,
        city: shop.locationCity || 'TP. Hồ Chí Minh',
        district: shop.locationDistrict,
        address_full: shop.addressFull,
      }).then(() => {})  // non-fatal
    }

    // Insert initial products if provided
    if (shop.products.length > 0) {
      const productRows = shop.products.map((p, idx) => ({
        business_id: business.id,
        name: p.name,
        description: p.description || null,
        price: p.price || null,
        price_original: p.price_original || null,
        image_url: p.image_url || null,
        image_gallery: p.image_gallery ? JSON.stringify(p.image_gallery) : '[]',
        category: p.category || null,
        is_featured: p.is_featured || false,
        sort_order: p.sort_order ?? idx,
        tags: p.tags || [],
        status: 'active',
      }))
      await admin.from('shop_products').insert(productRows)
    }

    return { email: shop.email, businessName: shop.businessName, slug: business.slug }
  } catch (error) {
    if (businessId) await admin.from('business_profiles').delete().eq('id', businessId)
    await admin.auth.admin.deleteUser(accountId)
    throw error
  }
}

export async function POST(request: Request) {
  const actor = await getActor()
  if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json().catch(() => null)
  const candidates = Array.isArray(body?.shops) ? body.shops : body?.shop ? [body.shop] : []
  if (!candidates.length) return NextResponse.json({ error: 'Cần ít nhất một shop.' }, { status: 400 })
  if (candidates.length > MAX_BATCH_SIZE) return NextResponse.json({ error: `Mỗi lượt chỉ được tạo tối đa ${MAX_BATCH_SIZE} shop.` }, { status: 400 })

  const results: Array<{ index: number; email: string; businessName: string; slug: string }> = []
  const failures: Array<{ index: number; email: string; error: string }> = []
  const queue = [...candidates.entries()]
  const workers = Array.from({ length: Math.min(3, queue.length) }, async () => {
    while (queue.length) {
      const next = queue.shift()
      if (!next) return
      const [index, input] = next
      try {
        const result = await provisionOne(input as ShopInput)
        results.push({ index, ...result })
      } catch (error) {
        failures.push({ index, email: asText((input as ShopInput)?.email, 254), error: error instanceof Error ? error.message : 'Không thể tạo shop.' })
      }
    }
  })
  await Promise.all(workers)

  const admin = createAdminClient()
  await admin.from('admin_audit_logs').insert({
    admin_id: actor.id,
    action: candidates.length === 1 ? 'CREATE_SHOP_ACCOUNT' : 'IMPORT_SHOP_ACCOUNTS',
    target_type: 'shop_account',
    details: { requested: candidates.length, created: results.length, failed: failures.length, emails: results.map((item) => item.email) },
  })

  return NextResponse.json({ created: results.sort((a, b) => a.index - b.index), failed: failures.sort((a, b) => a.index - b.index) }, { status: failures.length === candidates.length ? 400 : 201 })
}
