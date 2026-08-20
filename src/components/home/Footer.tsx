import Image from 'next/image'
import Link from 'next/link'
import { Camera, Globe, MessageCircle, Music2, Share2, ShoppingBag, Video } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/constants'

type SocialLinks = Record<string, string>
type Settings = { app_name?: string | null; tagline?: string | null; logo_url?: string | null; social_links?: SocialLinks | null }

const SOCIALS = [
  { key: 'facebook', label: 'Facebook', Icon: Share2 },
  { key: 'instagram', label: 'Instagram', Icon: Camera },
  { key: 'tiktok', label: 'TikTok', Icon: Music2 },
  { key: 'youtube', label: 'YouTube', Icon: Video },
  { key: 'zalo', label: 'Zalo', Icon: MessageCircle },
  { key: 'website', label: 'Website', Icon: Globe },
]

function safeUrl(value: unknown) {
  if (typeof value !== 'string') return null
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null } catch { return null }
}

export async function Footer() {
  const supabase = await createClient()
  
  const [settingsResult, categoriesResult] = await Promise.all([
    supabase.from('site_settings').select('app_name, tagline, logo_url, social_links').eq('id', 'current').maybeSingle(),
    supabase.from('site_categories').select('name').eq('is_active', true).order('sort_order').limit(12),
  ])

  const settings: Settings = {
    app_name: settingsResult.data?.app_name || BRAND_NAME,
    tagline: settingsResult.data?.tagline || BRAND_TAGLINE,
    logo_url: settingsResult.data?.logo_url || null,
    social_links: settingsResult.data?.social_links || {}
  }
  
  const categories = (categoriesResult.data || []) as { name: string }[]

  const social = SOCIALS.map((item) => ({ ...item, url: safeUrl(settings.social_links?.[item.key]) })).filter((item) => item.url)
  const categoryColumns = [categories.slice(0, 4), categories.slice(4, 8), categories.slice(8, 12)].filter((group) => group.length)

  return <footer className="border-t border-zinc-100 bg-white">
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-3">
            {settings.logo_url ? <Image src={settings.logo_url} alt={settings.app_name || BRAND_NAME} width={160} height={48} className="h-10 w-auto object-contain" /> : <><ShoppingBag className="text-[#B8860B]" /><span className="font-playfair text-3xl font-black tracking-tighter text-zinc-900"><span className="text-[#D4AF37]">1</span>Fashion</span></>}
          </Link>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-500">{settings.tagline || BRAND_TAGLINE}</p>
          {social.length > 0 && <div className="mt-6 flex flex-wrap gap-3">{social.map(({ key, label, Icon, url }) => <a key={key} href={url!} target="_blank" rel="noreferrer" aria-label={label} className="rounded-full border border-zinc-200 p-2.5 text-zinc-600 transition hover:border-[#D4AF37] hover:text-[#B8860B]"><Icon size={16} /></a>)}</div>}
        </div>
        {categoryColumns.map((group, index) => <div key={index}><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Danh mục</p><nav className="mt-4 space-y-3">{group.map((category) => <Link key={category.name} href={`/directory?category=${encodeURIComponent(category.name)}`} className="block text-sm text-zinc-600 transition hover:text-[#B8860B]">{category.name}</Link>)}</nav></div>)}
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Thông tin</p><nav className="mt-4 space-y-3"><Link href="/signup" className="block text-sm text-zinc-600 transition hover:text-[#B8860B]">Đăng ký cửa hàng</Link><Link href="/blog" className="block text-sm text-zinc-600 transition hover:text-[#B8860B]">Cẩm nang thời trang</Link><Link href="/terms" className="block text-sm text-zinc-600 transition hover:text-[#B8860B]">Điều khoản sử dụng</Link><Link href="/privacy" className="block text-sm text-zinc-600 transition hover:text-[#B8860B]">Chính sách bảo mật</Link><Link href="/demo" className="block text-sm font-semibold text-[#B8860B] transition hover:text-[#D4AF37]">✦ Xem shop demo mẫu</Link></nav></div>
      </div>
      <div className="mt-14 flex flex-col gap-3 border-t border-zinc-100 pt-6 text-xs text-zinc-400 md:flex-row md:items-center md:justify-between"><span suppressHydrationWarning>© {new Date().getFullYear()} {settings.app_name || BRAND_NAME}. Bảo lưu mọi quyền.</span><span>Tìm shop, thương hiệu và sản phẩm thời trang tại TP.HCM</span></div>
    </div>
  </footer>
}
