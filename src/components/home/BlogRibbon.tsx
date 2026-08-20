import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getBlogFallbackImage } from '@/lib/utils/blog-fallback'

export type HomepagePost = {
  id: string
  title: string
  excerpt?: string | null
  content?: string | null
  category?: string | null
  cover_image?: string | null
  image_url?: string | null
  created_at?: string | null
  slug?: string | null
}

export function BlogRibbon({ posts }: { posts: HomepagePost[] }) {
  if (!posts.length) return null

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10 sm:gap-6">
          <div><p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B8860B]">Từ 1Fashion</p><h2 className="mt-3 text-3xl font-bold text-zinc-900 md:text-4xl">Cẩm nang thời trang</h2></div>
          <Link href="/blog" className="hidden items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B8860B] md:flex">Xem tất cả <ArrowRight size={15} /></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {posts.map((post) => {
            let image = post.cover_image || post.image_url
            if (!image || image.trim() === '' || image === 'null') {
              image = getBlogFallbackImage(post.category)
            }
            const summary = post.excerpt || post.content || ''
            return <Link href={`/blog/${post.slug || post.id}`} key={post.id} className="block group overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <Image src={image} alt="" width={640} height={360} className="h-48 w-full object-cover" />
              <div className="p-6"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8860B]">{post.category || 'Cẩm nang'}</p><h3 className="mt-3 text-xl font-bold leading-snug text-zinc-900">{post.title}</h3>{summary && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-500">{summary}</p>}<span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-[#B8860B]">Đọc bài viết <ArrowRight size={13} /></span></div>
            </Link>
          })}
        </div>
        <Link href="/blog" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B8860B] md:hidden">Xem tất cả <ArrowRight size={15} /></Link>
      </div>
    </section>
  )
}
