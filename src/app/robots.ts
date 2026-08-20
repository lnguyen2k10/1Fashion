import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://1fashion.asia';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/login/', '/signup/', '/onboarding/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
