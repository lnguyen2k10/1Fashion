import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const PAGE_SIZE = 24

const safeFilter = (value: string | null, max = 80) => (value || '')
  .normalize('NFKC')
  .replace(/[^\p{L}\p{N}\s-]/gu, '')
  .trim()
  .slice(0, max)

// Fixed UUIDs for the seeded demo shops – excluded from the real directory
const DEMO_SLUGS = [
  'sneakerville-hcm',
  'trendy-boutique-saigon',
  'luxury-bags-hcm',
  'urban-street-style',
  'royal-watch-collection',
  'kids-fashion-paradise'
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Math.min(Number.parseInt(searchParams.get('page') || '1', 10) || 1, 10_000))
  const query = safeFilter(searchParams.get('q'))
  const category = safeFilter(searchParams.get('category'))
  const location = safeFilter(searchParams.get('location') || searchParams.get('district'))
  const admin = createAdminClient()

  let requestQuery = admin
    .from('directory_shops')
    .select('business_slug, business_name, category, location_ward, location_district, location_city, is_verified, logo_url, rating_score, cover_image', { count: 'exact' })
    .not('business_slug', 'in', `(${DEMO_SLUGS.join(',')})`)
    .order('updated_at', { ascending: false })

  if (category && category !== 'Tất cả') {
    // Lookup the category slug from site_categories
    const { data: catData } = await admin.from('site_categories').select('slug').eq('name', category).single()
    const slug = catData?.slug || category
    // Match either the name (e.g. "Thời Trang") or the slug (e.g. "fashion") in the categories array, OR as fallback in the legacy category column
    requestQuery = requestQuery.or(`categories.cs.{${category}},categories.cs.{${slug}},category.eq.${category},category.eq.${slug}`)
  }
  if (location && location !== 'Tất cả') requestQuery = requestQuery.ilike('location_city', `%${location}%`)
  if (query) {
    const term = `%${query}%`
    requestQuery = requestQuery.or(`business_name.ilike.${term},category.ilike.${term},location_city.ilike.${term},location_district.ilike.${term}`)
  }

  const { data, error, count } = await requestQuery.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  if (error) return NextResponse.json({ error: 'Không thể tải danh bạ.' }, { status: 500 })
  return NextResponse.json({ shops: data ?? [], page, pageSize: PAGE_SIZE, total: count ?? 0 }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
