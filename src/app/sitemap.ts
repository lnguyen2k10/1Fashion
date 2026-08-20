import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS — sitemap is generated server-side only
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://1fashion.asia';
  
  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/directory`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/offers`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  try {
    // Dynamic routes from database (Published landing pages only)
    const { data: pages } = await supabaseAdmin
      .from('landing_pages')
      .select(`
        updated_at,
        business_profiles ( slug )
      `)
      .eq('status', 'Published');

    if (pages) {
      for (const page of pages) {
        if (page.business_profiles && (page.business_profiles as any).slug) {
          routes.push({
            url: `${baseUrl}/${(page.business_profiles as any).slug}`,
            lastModified: new Date(page.updated_at || Date.now()),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to generate dynamic sitemap:', error);
  }

  return routes;
}
