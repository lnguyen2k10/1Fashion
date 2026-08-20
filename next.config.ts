import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Supabase Storage CDN
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        // Supabase Storage CDN (alternative)
        protocol: 'https',
        hostname: '*.supabase.in',
      },
      {
        // Imgur for team/gallery images
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        // NhakhoaKim and similar business logos
        protocol: 'https',
        hostname: 'nhakhoakim.com',
      },
      {
        // SenSpa
        protocol: 'https',
        hostname: 'senspa.com.vn',
      },
      {
        // Google user avatars and scraped images
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        // Google Street View thumbnails
        protocol: 'https',
        hostname: 'streetviewpixels-pa.googleapis.com',
      },
      {
        // Facebook CDN (business profile photos)
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
      {
        // Vercel gradients and assets
        protocol: 'https',
        hostname: 'grainy-gradients.vercel.app',
      },
      {
        // Vercel deployments (production + preview/staging branches)
        protocol: 'https',
        hostname: '*.vercel.app',
      },
    ],
  },
};

export default nextConfig;
