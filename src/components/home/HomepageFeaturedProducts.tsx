import Image from 'next/image'
import Link from 'next/link'

type FeaturedProduct = { product_id: string; name: string; description?: string | null; price?: string | null; image_url?: string | null; category?: string | null; business_slug: string; business_name: string; expires_at: string }

export function HomepageFeaturedProducts({ products }: { products: FeaturedProduct[] }) {
  if (products.length === 0) return null
  return <section className="bg-[#fffaf0] py-16 sm:py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6"><div className="mb-8 sm:mb-10"><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#B8860B]">Được shop lựa chọn</p><h2 className="mt-2 text-3xl font-bold text-[#2F2F2F]">Sản phẩm nổi bật</h2></div><div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">{products.map((product) => <Link key={`${product.product_id}-${product.expires_at}`} href={`/${product.business_slug}#products`} className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="relative aspect-[4/3] bg-zinc-100">{product.image_url && <Image src={product.image_url} alt={product.name} fill className="object-cover" />}<span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Nổi bật</span></div><div className="p-4"><p className="text-xs text-zinc-500">{product.business_name}</p><h3 className="mt-1 font-semibold text-zinc-900">{product.name}</h3><p className="mt-2 text-sm font-bold text-[#B8860B]">{product.price || 'Liên hệ'}</p><p className="mt-3 text-xs text-zinc-400">Hiển thị đến {new Date(product.expires_at).toLocaleDateString('vi-VN')}</p></div></Link>)}</div></div></section>
}
