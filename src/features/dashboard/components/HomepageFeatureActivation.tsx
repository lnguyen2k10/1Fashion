'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

type Product = { id: string; name: string; image_url: string | null }
type Activation = { id: string; feature_type: 'shop' | 'product'; product_id: string | null; starts_at: string; expires_at: string; subscription_id: string }
type Limits = { homepage_shop_feature_count?: number; homepage_product_feature_count?: number }

export function HomepageFeatureActivation({ subscriptionId }: { subscriptionId: string }) {
  const [limits, setLimits] = useState<Limits>({})
  const [products, setProducts] = useState<Product[]>([])
  const [activations, setActivations] = useState<Activation[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<'shop' | 'product' | null>(null)
  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/shop/homepage-features', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Không thể tải quyền lợi nổi bật')
      setLimits(result.subscription?.limits || {})
      setProducts(result.products || [])
      setActivations(result.activations || [])
    } catch (error: any) { toast.error(error.message || 'Không thể tải quyền lợi nổi bật') } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  const usage = useMemo(() => ({
    shop: activations.filter((item) => item.subscription_id === subscriptionId && item.feature_type === 'shop').length,
    product: activations.filter((item) => item.subscription_id === subscriptionId && item.feature_type === 'product').length,
  }), [activations, subscriptionId])
  const shopQuota = limits.homepage_shop_feature_count ?? 0
  const productQuota = limits.homepage_product_feature_count ?? 0
  if (shopQuota <= 0 && productQuota <= 0) return null

  const activate = async (featureType: 'shop' | 'product') => {
    if (featureType === 'product' && !selectedProduct) { toast.error('Hãy chọn sản phẩm trước.'); return }
    setSubmitting(featureType)
    try {
      const response = await fetch('/api/shop/homepage-features', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featureType, productId: featureType === 'product' ? selectedProduct : undefined }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Không thể kích hoạt nổi bật')
      toast.success('Đã kích hoạt hiển thị nổi bật trong 7 ngày.')
      await load()
    } catch (error: any) { toast.error(error.message || 'Không thể kích hoạt nổi bật') } finally { setSubmitting(null) }
  }

  const remainingShop = Math.max(0, shopQuota - usage.shop)
  const remainingProduct = Math.max(0, productQuota - usage.product)
  return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-semibold text-amber-950">Tự kích hoạt nổi bật trang chủ</h2><p className="mt-1 text-xs text-amber-800">Shop tự chọn thời điểm và sản phẩm; mỗi lượt hiển thị trong 7 ngày.</p>{loading ? <p className="mt-4 text-xs text-zinc-500">Đang tải…</p> : <div className="mt-4 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-amber-200 bg-white p-4"><p className="font-medium text-sm">Shop nổi bật</p><p className="mt-1 text-xs text-zinc-500">Còn {remainingShop}/{shopQuota} lượt.</p><button disabled={remainingShop === 0 || submitting !== null} onClick={() => activate('shop')} className="mt-3 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300">{submitting === 'shop' ? 'Đang kích hoạt…' : 'Đưa shop lên trang chủ'}</button></div><div className="rounded-xl border border-amber-200 bg-white p-4"><p className="font-medium text-sm">Sản phẩm nổi bật</p><p className="mt-1 text-xs text-zinc-500">Còn {remainingProduct}/{productQuota} lượt.</p><select value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)} className="mt-3 w-full rounded-lg border p-2 text-sm"><option value="">Chọn sản phẩm</option>{products.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}</select><button disabled={remainingProduct === 0 || !selectedProduct || submitting !== null} onClick={() => activate('product')} className="mt-3 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300">{submitting === 'product' ? 'Đang kích hoạt…' : 'Đưa sản phẩm lên trang chủ'}</button></div></div>}</section>
}
