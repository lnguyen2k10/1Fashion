import React, { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { fetchCategories } from '@/lib/services/categories'
import DirectoryClient from './DirectoryClient'

const PAGE_SIZE = 24

const DEMO_SLUGS = [
  'sneakerville-hcm',
  'trendy-boutique-saigon',
  'luxury-bags-hcm',
  'urban-street-style',
  'royal-watch-collection',
  'kids-fashion-paradise'
]

export const revalidate = 60

export const metadata = {
  title: 'Danh Bạ Shop Thời Trang | 1Fashion.asia',
  description: 'Khám phá hàng ngàn shop thời trang, thương hiệu local brand và cửa hàng phụ kiện trên toàn quốc.',
}

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string, category?: string, location?: string, district?: string, loc?: string }> }) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''
  const category = resolvedParams.category || 'Tất cả'
  const location = resolvedParams.location || resolvedParams.district || resolvedParams.loc || 'Tất cả'

  const supabase = await createClient()

  let requestQuery = supabase
    .from('directory_shops')
    .select('business_slug, business_name, category, location_ward, location_district, location_city, is_verified, logo_url, rating_score, cover_image, content_json', { count: 'exact' })
    .not('business_slug', 'in', `(${DEMO_SLUGS.join(',')})`)
    .order('updated_at', { ascending: false })

  if (category && category !== 'Tất cả') {
    const { data: catData } = await supabase.from('site_categories').select('slug').eq('name', category).single()
    const slug = catData?.slug || category
    requestQuery = requestQuery.or(`categories.cs.{${category}},categories.cs.{${slug}},category.eq.${category},category.eq.${slug}`)
  }
  if (location && location !== 'Tất cả') {
    requestQuery = requestQuery.ilike('location_city', `%${location}%`)
  }
  if (query) {
    const term = `%${query}%`
    requestQuery = requestQuery.or(`business_name.ilike.${term},category.ilike.${term},location_city.ilike.${term},location_district.ilike.${term}`)
  }

  const [{ data, count }, categories] = await Promise.all([
    requestQuery.range(0, PAGE_SIZE - 1),
    fetchCategories()
  ])

  const initialShops = data || []
  const total = count || 0

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <DirectoryClient 
        initialShops={initialShops} 
        total={total} 
        categories={categories}
        initialQuery={query}
        initialCategory={category}
        initialLocation={location}
      />
    </Suspense>
  )
}
