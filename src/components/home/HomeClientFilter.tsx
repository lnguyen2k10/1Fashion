'use client'

import { useRouter } from 'next/navigation'
import { FilterBar } from '@/components/home/FilterBar'
import { FeaturedSection } from '@/components/home/FeaturedSection'

interface Shop {
  slug: string
  business_name: string
  category: string
  location_district: string
  is_verified: boolean
  logo_url: string
  cover_image: string
  services: { name: string; price: string }[]
  rating_score?: number
  rating_count?: number
}

export function HomeClientFilter({ businesses }: { businesses: Shop[] }) {
  const router = useRouter()
  const navigate = (key: 'category' | 'location', value: string) => {
    const params = new URLSearchParams()
    if (value !== 'Tất cả') params.set(key, value)
    router.push(`/directory${params.size ? `?${params}` : ''}`)
  }

  return <>
    <FilterBar activeCategory="Tất cả" activeLocation="Tất cả" onCategory={(value) => navigate('category', value)} onLocation={(value) => navigate('location', value)} />
    {businesses.length > 0 && <FeaturedSection businesses={businesses} />}
  </>
}
