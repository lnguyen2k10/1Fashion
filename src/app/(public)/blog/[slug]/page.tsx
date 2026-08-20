import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Clock, ArrowLeft } from 'lucide-react'
import { getBlogFallbackImage } from '@/lib/utils/blog-fallback'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('blogs').select('title, content, image_url, category').eq('slug', slug).maybeSingle()
  return {
    title: data?.title ? `${data.title} | 1Fashion.asia Blog` : 'Blog | 1Fashion.asia',
    description: data?.content ? data.content.substring(0, 160) : 'Khám phá bài viết trên 1Fashion.asia',
    openGraph: {
      images: [data?.image_url && data.image_url.trim() !== '' && data.image_url !== 'null' ? data.image_url : getBlogFallbackImage(data?.category)],
    }
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blogs')
    .select('*, business_profiles(business_name, logo_url, slug)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!post) {
    notFound()
  }

  // Get related posts (same category)
  const { data: related } = await supabase
    .from('blogs')
    .select('id, slug, title, image_url, category, created_at')
    .eq('status', 'published')
    .neq('id', post.id)
    .eq('category', post.category)
    .order('created_at', { ascending: false })
    .limit(3)

  // Get latest posts
  const { data: latest } = await supabase
    .from('blogs')
    .select('id, slug, title, image_url, category, created_at')
    .eq('status', 'published')
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get categories
  const { data: allPosts } = await supabase
    .from('blogs')
    .select('category')
    .eq('status', 'published')

  const categoryCounts = allPosts?.reduce((acc: Record<string, number>, curr) => {
    if (curr.category) {
      acc[curr.category] = (acc[curr.category] || 0) + 1
    }
    return acc
  }, {}) || {}
  const categories = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }))

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-grow pt-24 sm:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-xs uppercase tracking-widest hover:text-[#B8860B] transition-colors mb-8">
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Main Article (Left) */}
            <article className="lg:w-2/3">
              <header className="mb-10 text-left">
                <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
                  <span className="text-[#D4AF37] px-4 py-1.5 border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/5">
                    {post.category || 'TIN TỨC'}
                  </span>
                  <span className="text-[#2F2F2F]/40 flex items-center gap-1.5" suppressHydrationWarning>
                    <Clock size={12}/> {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                
                <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-[#2F2F2F] mb-8">
                  {post.title}
                </h1>

                <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37] border border-[#D4AF37]/20 flex items-center justify-center text-sm font-bold text-white">
                    1F
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-800">1Fashion.asia</div>
                    <div className="text-xs text-gray-500">Đội ngũ biên tập</div>
                  </div>
                </div>
              </header>

              <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden mb-12 shadow-xl bg-zinc-100">
                <Image 
                  src={post.image_url && post.image_url.trim() !== '' && post.image_url !== 'null' ? post.image_url : getBlogFallbackImage(post.category)}
                  alt={post.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div 
                className="prose prose-lg prose-gray max-w-none whitespace-pre-line leading-relaxed text-[#2F2F2F]/80"
              >
                {post.content}
              </div>
            </article>

            {/* Sidebar (Right) */}
            <aside className="lg:w-1/3 space-y-12">
              {/* Categories */}
              {categories.length > 0 && (
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-[#2F2F2F] font-playfair mb-6 pb-4 border-b border-gray-200">
                    Danh mục
                  </h3>
                  <ul className="space-y-3">
                    {categories.map((cat, idx) => (
                      <li key={idx}>
                        <Link href={`/blog?category=${encodeURIComponent(cat.name)}`} className="flex items-center justify-between group">
                          <span className="text-gray-600 group-hover:text-[#D4AF37] transition-colors">{cat.name}</span>
                          <span className="text-xs bg-white px-2 py-1 rounded-md text-gray-400 font-medium group-hover:text-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-colors">
                            {cat.count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Posts */}
              {related && related.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-[#2F2F2F] font-playfair mb-6 pb-4 border-b border-gray-100">
                    Bài viết liên quan
                  </h3>
                  <div className="space-y-6">
                    {related.map(rel => {
                      const image = rel.image_url && rel.image_url.trim() !== '' && rel.image_url !== 'null' ? rel.image_url : getBlogFallbackImage(rel.category)
                      return (
                        <Link href={`/blog/${rel.slug || rel.id}`} key={rel.id} className="group flex gap-4 items-start">
                          <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative bg-zinc-100">
                            <Image 
                              src={image}
                              alt={rel.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-widest mb-1.5 line-clamp-1">
                              {rel.category}
                            </div>
                            <h4 className="text-sm font-bold text-[#2F2F2F] group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug">
                              {rel.title}
                            </h4>
                            <span className="text-xs text-gray-400 mt-2 block" suppressHydrationWarning>
                              {new Date(rel.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Latest Posts (if related is empty, or show both) */}
              {(!related || related.length === 0) && latest && latest.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-[#2F2F2F] font-playfair mb-6 pb-4 border-b border-gray-100">
                    Mới nhất
                  </h3>
                  <div className="space-y-6">
                    {latest.map(latestPost => {
                      const isCurrent = latestPost.id === post.id
                      const image = latestPost.image_url && latestPost.image_url.trim() !== '' && latestPost.image_url !== 'null' ? latestPost.image_url : getBlogFallbackImage(latestPost.category)
                      
                      return (
                        <Link href={`/blog/${latestPost.slug || latestPost.id}`} key={latestPost.id} className="group flex gap-4 items-start">
                          <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden relative bg-zinc-100">
                            <Image 
                              src={image}
                              alt={latestPost.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-widest mb-1.5 line-clamp-1">
                              {latestPost.category}
                            </div>
                            <h4 className="text-sm font-bold text-[#2F2F2F] group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug">
                              {latestPost.title}
                            </h4>
                            <span className="text-xs text-gray-400 mt-2 block" suppressHydrationWarning>
                              {new Date(latestPost.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      
    </div>
  )
}
