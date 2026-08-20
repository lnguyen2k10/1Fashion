/**
 * 1Fashion.asia - Categories Service
 * Fetches shop categories dynamically from Supabase site_categories table.
 * Admin can add/edit/reorder categories via admin panel - no code changes needed.
 */
import { createClient } from '@/lib/supabase/client';
import type { SiteCategory } from '@/types/landing-page';

// Cache duration in ms (5 minutes) - avoid hammering DB on every filter render
let _cache: SiteCategory[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchCategories(): Promise<SiteCategory[]> {
  const now = Date.now();
  if (_cache && (now - _cacheTime) < CACHE_TTL) {
    return _cache;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('site_categories')
    .select('name, slug, icon, color, description')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) {
    console.error('[categories] fetch error:', error?.message);
    return _cache || [];  // Return stale cache if available
  }

  _cache = data as SiteCategory[];
  _cacheTime = now;
  return _cache;
}

/** Invalidate cache (call after admin updates categories) */
export function invalidateCategoriesCache() {
  _cache = null;
  _cacheTime = 0;
}

