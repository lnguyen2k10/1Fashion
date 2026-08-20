import { createClient } from '@/lib/supabase/client'

export interface SystemLocation {
  id: string
  name: string
  slug: string
}

let cachedLocations: SystemLocation[] | null = null

export async function fetchLocations(): Promise<SystemLocation[]> {
  if (cachedLocations) return cachedLocations

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('system_locations')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching system locations:', error)
      return []
    }

    cachedLocations = data || []
    return cachedLocations
  } catch (err) {
    console.error('Failed to fetch system locations:', err)
    return []
  }
}
