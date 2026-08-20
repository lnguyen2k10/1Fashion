import React from 'react'
import Image from 'next/image'
import { Clock, ArrowRight, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getBlogFallbackImage } from '@/lib/utils/blog-fallback'

export const metadata = {
  title: 'Blog & Cẩm Nang | 1Fashion.asia',
  description: 'Khám phá những mẹo vặt hữu ích, xu hướng mua sắm mới nhất và các bài viết thú vị từ cộng đồng 1Fashion.asia.',
}

type BlogPost = {
  id: string
  slug?: string
  title: string
  content: string
  image_url: string
  created_at: string
  category: string
  business_profiles: {
    business_name: string
    logo_url: string
    slug: string
  }
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const resolvedSearchParams = await searchParams
  const selectedCat = resolvedSearchParams.category
  const supabase = await createClient()

  // Build the query
  let query = supabase
    .from('blogs')
    .select('*, business_profiles(business_name, logo_url, slug)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (selectedCat) {
    query = query.eq('category', selectedCat)
  }

  const { data: postsData, error } = await query
  const posts = (postsData as unknown as BlogPost[]) || []

  // Extract unique categories for the filter
  const { data: allCategoriesData } = await supabase
    .from('blogs')
    .select('category')
    .eq('status', 'published')

  const uniqueCategories = Array.from(new Set(allCategoriesData?.map(c => c.category).filter(Boolean))) as string[]

  const featuredPost = posts[0]
  const regularPosts = posts.slice(1)

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pb-16 pt-24 sm:pb-24 sm:pt-32" style={{ background: '#ffffff' }}>
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:space-y-16 sm:px-6">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] animate-fade-in-up sm:mb-6 sm:tracking-[0.4em]">
              Tin Tức & Mẹo Hay
            </span>
            <h1 className="font-serif mb-5 text-4xl font-bold leading-tight text-[#2F2F2F] animate-fade-in-up animation-delay-100 sm:mb-8 sm:text-5xl md:text-7xl">
              Góc <span className="text-[#D4AF37]">Chia Sẻ.</span>
            </h1>
            <p className="text-base font-medium leading-relaxed text-[#2F2F2F]/60 animate-fade-in-up animation-delay-200 md:text-xl">
              Khám phá những mẹo vặt hữu ích, xu hướng mua sắm mới nhất và các bài viết thú vị từ cộng đồng 1Fashion.asia.
            </p>
          </div>

          {/* Category Filter Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 border-y border-[#D4AF37]/10 py-8">
            <Link
              href="/blog"
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                !selectedCat 
                  ? 'bg-[#D4AF37] text-white shadow-lg' 
                  : 'bg-white text-[#2F2F2F]/60 hover:text-[#D4AF37] border border-transparent hover:border-[#D4AF37]/20'
              }`}
            >
              Tất cả
            </Link>
            {uniqueCategories.map(cat => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  selectedCat === cat 
                    ? 'bg-[#D4AF37] text-white shadow-lg' 
                    : 'bg-white text-[#2F2F2F]/60 hover:text-[#D4AF37] border border-transparent hover:border-[#D4AF37]/20'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-[#D4AF37]/10 bg-white/50 py-20 text-center sm:rounded-[3rem] sm:py-32">
              <Tag size={48} className="mx-auto text-[#D4AF37]/20 mb-6" />
              <h3 className="text-2xl font-bold text-[#2F2F2F] mb-2 font-playfair">Chưa có bài viết</h3>
              <p className="text-[#2F2F2F]/50">Danh mục này đang được các chuyên gia biên soạn.</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <Link href={`/blog/${featuredPost.slug || featuredPost.id}`} className="group relative cursor-pointer block overflow-hidden rounded-3xl border border-[#D4AF37]/10 bg-white shadow-2xl sm:rounded-[2.5rem]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                    <div className="relative h-[300px] lg:h-auto overflow-hidden order-1 lg:order-2">
                      <Image 
                        width={800}
                        height={600}
                        src={featuredPost.image_url && featuredPost.image_url.trim() !== '' && featuredPost.image_url !== 'null' ? featuredPost.image_url : getBlogFallbackImage(featuredPost.category)} 
                        alt={featuredPost.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out"
                      />
                    </div>
                    <div className="order-2 flex flex-col justify-center bg-white p-6 sm:p-10 md:p-16 lg:order-1">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] uppercase">
                          <span className="text-[#D4AF37] px-4 py-1.5 border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/5">
                            {featuredPost.category || 'TIN TỨC'}
                          </span>
                          <span className="text-[#2F2F2F]/40 flex items-center gap-1.5" suppressHydrationWarning>
                            <Clock size={12}/> {new Date(featuredPost.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <h2 className="font-playfair text-3xl font-bold leading-[1.1] text-[#2F2F2F] transition-colors group-hover:text-[#D4AF37] sm:text-4xl md:text-5xl">
                          {featuredPost.title}
                        </h2>
                        <p className="text-[#2F2F2F]/60 text-lg leading-relaxed font-medium line-clamp-3">
                          {featuredPost.content?.substring(0, 150)}...
                        </p>
                        
                        <div className="flex items-center gap-3 pt-4 border-t border-[#D4AF37]/10 mt-6">
                          <div className="w-8 h-8 rounded-full bg-[#D4AF37] border border-[#D4AF37]/20 flex items-center justify-center text-xs font-bold text-white">
                            1F
                          </div>
                          <span className="text-xs font-bold text-gray-800">
                            1Fashion.asia
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Regular Posts Grid */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
                {regularPosts.map((post) => (
                  <Link href={`/blog/${post.slug || post.id}`} key={post.id} className="group cursor-pointer flex flex-col space-y-6">
                    <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-sm relative border border-transparent hover:border-[#D4AF37]/20 transition-all duration-500">
                      <Image 
                        width={600}
                        height={400}
                        src={post.image_url && post.image_url.trim() !== '' && post.image_url !== 'null' ? post.image_url : getBlogFallbackImage(post.category)} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] shadow-lg">
                        {post.category || 'TIN TỨC'}
                      </div>
                    </div>
                    <div className="space-y-4 px-2">
                      <div className="flex items-center gap-3 text-[10px] font-bold text-[#2F2F2F]/40 uppercase tracking-widest">
                        <span suppressHydrationWarning>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-[#2F2F2F] group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-2 font-playfair">
                        {post.title}
                      </h3>
                      <p className="text-[#2F2F2F]/60 text-sm leading-relaxed font-medium line-clamp-3">
                        {post.content?.substring(0, 100)}...
                      </p>
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-[#D4AF37] border border-[#D4AF37]/20 flex items-center justify-center text-[10px] font-bold text-white">
                          1F
                        </div>
                        <span className="text-xs font-bold text-gray-500 line-clamp-1">
                          1Fashion.asia
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      
    </div>
  )
}
