'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Download, Plus, Upload, X, ChevronDown, ChevronUp, QrCode, ExternalLink, Copy, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

// ─── Types ───────────────────────────────────────────────────────────────────
type Category = { id: string; name: string }

type ProductDraft = {
  name: string
  description: string
  price: string
  price_original: string
  image_url: string
  category: string
  is_featured: boolean
}

type FullShopDraft = {
  // Account
  email: string
  password: string
  // Basic info
  business_name: string
  description: string
  categories: string[]
  logo_url: string
  // Contact & Location
  location_city: string
  location_district: string
  location_ward: string
  address_full: string
  hotline: string
  zalo_phone: string
  operating_hours: string
  facebook_url: string
  website_url: string
  // Hero Slides (up to 3 image URLs)
  hero_slides: [string, string, string]
  // Products from CSV
  products: ProductDraft[]
}

type BatchShopDraft = {
  email: string
  password: string
  business_name: string
  categories: string[]
  location_city: string
  location_district: string
  location_ward: string
  address_full: string
  hotline: string
  zalo_phone: string
  logo_url: string
}

type CreatedResult = { email: string; businessName: string; slug: string; password: string }

// ─── Constants ────────────────────────────────────────────────────────────────
const PRODUCT_TEMPLATE_HEADERS = ['name', 'description', 'price', 'price_original', 'image_url', 'gallery_1', 'gallery_2', 'gallery_3', 'gallery_4', 'gallery_5', 'category', 'is_featured']
const BATCH_TEMPLATE_HEADERS = ['email', 'password', 'business_name', 'categories', 'location_city', 'location_district', 'location_ward', 'address_full', 'hotline', 'zalo_phone', 'logo_url']

const emptyDraft = (): FullShopDraft => ({
  email: '', password: '', business_name: '', description: '', categories: [],
  logo_url: '', location_city: 'TP. Hồ Chí Minh', location_district: '', location_ward: '',
  address_full: '', hotline: '', zalo_phone: '', operating_hours: '8:00 - 22:00 (Thứ 2 - Chủ nhật)',
  facebook_url: '', website_url: '', hero_slides: ['', '', ''], products: [],
})

// ─── CSV helpers ─────────────────────────────────────────────────────────────
function parseCsv(input: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false
  for (let i = 0; i < input.length; i++) {
    const c = input[i]; const n = input[i + 1]
    if (c === '"' && quoted && n === '"') { cell += '"'; i++ }
    else if (c === '"') quoted = !quoted
    else if (c === ',' && !quoted) { row.push(cell.trim()); cell = '' }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && n === '\n') i++
      row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ''
    } else cell += c
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row)
  return rows
}

function csvVal(v: string) { return v.includes(',') || v.includes('"') ? `"${v.replaceAll('"', '""')}"` : v }
function csvRow(cols: string[]) { return cols.map(csvVal).join(',') }

// ─── Image upload helper ──────────────────────────────────────────────────────
async function uploadImage(file: File, folder: string): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Lỗi upload ảnh')
  return data.url as string
}

// ─── QR Card Component ────────────────────────────────────────────────────────
function QRCardAdmin({ shop, siteUrl }: { shop: CreatedResult; siteUrl: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const loginUrl = `${siteUrl}/login`
  const shopUrl = `${siteUrl}/${shop.slug}`

  const downloadQR = async (type: 'admin' | 'customer') => {
    const { toPng } = await import('html-to-image')
    const el = document.getElementById(`qr-card-${type}-${shop.slug}`)
    if (!el) return
    const url = await toPng(el, { cacheBust: true, pixelRatio: 3 })
    const a = document.createElement('a'); a.href = url
    a.download = `QR-${type === 'admin' ? 'admin' : 'khachhang'}-${shop.slug}.png`
    a.click()
  }

  const [copied, setCopied] = useState(false)
  const copyLink = async () => {
    await navigator.clipboard.writeText(shopUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div ref={ref} className="space-y-6">
      {/* Admin QR */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[#B8860B]">QR Chủ shop (có thông tin đăng nhập)</p>
        <div
          id={`qr-card-admin-${shop.slug}`}
          className="relative w-72 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-5 shadow-xl text-white overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <p className="text-[#D4AF37] font-bold text-lg mb-1">1Fashion</p>
            <p className="text-white font-bold text-sm truncate">{shop.businessName}</p>
            <p className="text-zinc-400 text-xs mt-0.5 mb-3 truncate">{shop.email}</p>
            <div className="flex justify-center bg-white rounded-xl p-2 mb-3">
              <QRCodeSVG value={loginUrl} size={120} />
            </div>
            <div className="bg-[#D4AF37]/10 rounded-lg p-2.5 space-y-1 text-xs">
              <p><span className="text-zinc-400">Địa chỉ: </span><span className="font-medium">{loginUrl}</span></p>
              <p><span className="text-zinc-400">Email: </span><span className="font-medium">{shop.email}</span></p>
              <p><span className="text-zinc-400">Mật khẩu: </span><span className="font-medium">{shop.password}</span></p>
            </div>
            <p className="text-[10px] text-zinc-500 text-center mt-2">⚠️ Bí mật – Chỉ chia sẻ với chủ shop</p>
          </div>
        </div>
        <button
          onClick={() => downloadQR('admin')}
          className="flex items-center gap-1.5 text-xs text-[#B8860B] hover:text-[#8A6810] font-medium"
        >
          <Download size={13} /> Tải QR Admin
        </button>
      </div>

      {/* Customer QR */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">QR Khách hàng (link shop)</p>
        <div
          id={`qr-card-customer-${shop.slug}`}
          className="relative w-72 rounded-2xl border border-[#D4AF37]/30 bg-white p-5 shadow-sm overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#D4AF37]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="text-[#D4AF37] font-bold text-lg mb-1">1Fashion</p>
            <p className="text-[#2F2F2F] font-bold text-sm truncate mb-3">{shop.businessName}</p>
            <div className="flex justify-center bg-zinc-50 rounded-xl p-3 mb-3">
              <QRCodeSVG value={shopUrl} size={120} fgColor="#2F2F2F" />
            </div>
            <p className="text-center text-xs text-zinc-500 truncate">{shopUrl}</p>
            <p className="text-center text-[10px] text-zinc-400 mt-1">Quét mã để xem gian hàng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadQR('customer')}
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 font-medium"
          >
            <Download size={13} /> Tải QR Khách
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 font-medium"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            {copied ? 'Đã copy!' : 'Copy link shop'}
          </button>
          <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 font-medium">
            <ExternalLink size={13} /> Xem shop
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Image Upload Slot ────────────────────────────────────────────────────────
function ImageSlot({ label, value, onChange, folder }: {
  label: string; value: string; onChange: (url: string) => void; folder: string
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, folder)
      onChange(url)
    } catch (err: any) {
      toast.error(err.message || 'Lỗi upload ảnh')
    } finally { setUploading(false) }
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-zinc-600">{label}</p>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="relative cursor-pointer rounded-xl border-2 border-dashed border-[#D4AF37]/30 bg-zinc-50 hover:border-[#D4AF37]/60 hover:bg-[#FFFDF5] transition-all overflow-hidden"
        style={{ height: 100 }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-zinc-400">
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            <span className="text-xs">{uploading ? 'Đang tải…' : 'Chọn ảnh'}</span>
          </div>
        )}
        {value && (
          <button
            type="button"
            onClick={(ev) => { ev.stopPropagation(); onChange('') }}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
          ><X size={12} /></button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
    </div>
  )
}

// ─── Product CSV parser ───────────────────────────────────────────────────────
function parseProductCsv(text: string): ProductDraft[] {
  const rows = parseCsv(text)
  const header = rows.shift()?.map((h) => h.toLowerCase().replace(/^\uFEFF/, '')) ?? []
  if (!header.includes('name')) return []
  const read = (row: string[], field: string) => row[header.indexOf(field)] || ''
  return rows
    .map((row) => ({
      name: read(row, 'name'),
      description: read(row, 'description'),
      price: read(row, 'price'),
      price_original: read(row, 'price_original'),
      image_url: read(row, 'image_url'),
      category: read(row, 'category'),
      is_featured: read(row, 'is_featured').toLowerCase() === 'true',
      // gallery handled separately in API
      _gallery: [1,2,3,4,5].map((n) => read(row, `gallery_${n}`)).filter(Boolean),
    }))
    .filter((p) => p.name)
    .map(({ _gallery, ...p }) => ({ ...p, image_url: p.image_url || '' }))
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ShopProvisioning({ onCreated }: { onCreated: () => void }) {
  const [tab, setTab] = useState<'single' | 'batch'>('single')
  const [categories, setCategories] = useState<Category[]>([])
  const [draft, setDraft] = useState<FullShopDraft>(emptyDraft)
  const [batch, setBatch] = useState<BatchShopDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<CreatedResult | null>(null)
  const [batchResult, setBatchResult] = useState<{ created: any[]; failed: any[] } | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const supabase = useMemo(() => createClient(), [])
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    void supabase.from('site_categories').select('id, name').eq('is_active', true).order('sort_order')
      .then(({ data }) => setCategories((data ?? []) as Category[]))
  }, [supabase])

  const update = (field: keyof FullShopDraft, value: any) =>
    setDraft((prev) => ({ ...prev, [field]: value }))

  const updateSlide = (idx: number, url: string) =>
    setDraft((prev) => {
      const slides = [...prev.hero_slides] as [string, string, string]
      slides[idx] = url
      return { ...prev, hero_slides: slides }
    })

  const toggleCategory = (name: string) =>
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.includes(name)
        ? prev.categories.filter((c) => c !== name)
        : [...prev.categories, name],
    }))

  // ─── Single shop submit ────────────────────────────────────────────────────
  const submitSingle = async () => {
    if (!draft.email || !draft.password) { toast.error('Cần nhập email và mật khẩu.'); return }
    setSubmitting(true); setCreated(null)
    try {
      const payload = {
        shops: [{
          ...draft,
          hero_slides: draft.hero_slides.filter(Boolean),
          products: draft.products,
        }],
      }
      const res = await fetch('/api/admin/shop-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok && !data.created?.length) throw new Error(data.error || 'Không thể tạo shop.')
      if (data.created?.length) {
        const c = data.created[0]
        setCreated({ ...c, password: draft.password })
        toast.success(`Đã tạo shop "${c.businessName}" thành công!`)
        onCreated()
      }
      if (data.failed?.length) toast.error(data.failed[0].error || 'Tạo shop thất bại.')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi không xác định.')
    } finally { setSubmitting(false) }
  }

  // ─── Product CSV upload ────────────────────────────────────────────────────
  const handleProductCsv = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const text = await file.text()
    const products = parseProductCsv(text)
    if (!products.length) { toast.error('File CSV không hợp lệ hoặc không có dòng dữ liệu.'); return }
    update('products', products)
    toast.success(`Đã đọc ${products.length} sản phẩm từ file CSV.`)
  }

  const downloadProductTemplate = () => {
    const sample = ['Áo thun nữ', 'Mô tả sản phẩm', '200.000đ', '300.000đ', 'https://link.anh.chinh.jpg', 'https://anh2.jpg', '', '', '', '', 'Áo', 'false']
    const content = [PRODUCT_TEMPLATE_HEADERS, sample].map(csvRow).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' }))
    a.download = 'mau-san-pham.csv'; a.click(); URL.revokeObjectURL(a.href)
  }

  // ─── Batch CSV upload ──────────────────────────────────────────────────────
  const handleBatchCsv = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const rows = parseCsv(await file.text())
    const header = rows.shift()?.map((h) => h.toLowerCase().replace(/^\uFEFF/, '')) ?? []
    if (!header.includes('email') || !header.includes('password')) {
      toast.error('CSV cần có cột email và password.'); return
    }
    if (rows.length > 250) { toast.error('Tối đa 250 shop mỗi lần import.'); return }
    const read = (row: string[], field: string) => row[header.indexOf(field)] || ''
    const parsed = rows.map((row) => ({
      email: read(row, 'email'), password: read(row, 'password'),
      business_name: read(row, 'business_name'),
      categories: read(row, 'categories').split(/[;|]/).map((c) => c.trim()).filter(Boolean),
      location_city: read(row, 'location_city'), location_district: read(row, 'location_district'),
      location_ward: read(row, 'location_ward'), address_full: read(row, 'address_full'),
      hotline: read(row, 'hotline'), zalo_phone: read(row, 'zalo_phone'), logo_url: read(row, 'logo_url'),
    }))
    setBatch(parsed); setBatchResult(null)
    toast.success(`Đã đọc ${parsed.length} dòng. Kiểm tra rồi bấm tạo.`)
  }

  const submitBatch = async () => {
    if (!batch.length) return
    setSubmitting(true); setBatchResult(null)
    try {
      const res = await fetch('/api/admin/shop-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shops: batch }),
      })
      const data = await res.json()
      setBatchResult({ created: data.created ?? [], failed: data.failed ?? [] })
      if (data.created?.length) { toast.success(`Đã tạo ${data.created.length} shop.`); onCreated() }
      if (data.failed?.length) toast.error(`${data.failed.length} dòng thất bại.`)
    } catch (err: any) { toast.error(err.message) } finally { setSubmitting(false) }
  }

  const downloadBatchTemplate = () => {
    const sample = ['shop@example.com', 'MatKhau8ky', 'Tên shop mẫu', 'Thời trang nữ;Phụ kiện', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', '10 Nguyễn Huệ', '0900000000', '0900000000', '']
    const content = [BATCH_TEMPLATE_HEADERS, sample].map(csvRow).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' }))
    a.download = 'mau-import-hang-loat.csv'; a.click(); URL.revokeObjectURL(a.href)
  }

  // ─── Render: Success Screen ──────────────────────────────────────────────
  if (created) {
    return (
      <section className="space-y-6 rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-600">✅ Tạo shop thành công</p>
            <h2 className="mt-1 text-xl font-bold text-[#2F2F2F]">{created.businessName}</h2>
            <p className="text-sm text-zinc-500">{created.email}</p>
          </div>
          <button
            onClick={() => { setCreated(null); setDraft(emptyDraft()) }}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-white"
          >
            + Tạo shop khác
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <QRCardAdmin shop={created} siteUrl={siteUrl} />
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-0 rounded-2xl border border-[#D4AF37]/20 bg-[#FFFEFA] shadow-sm overflow-hidden">
      {/* Tab header */}
      <div className="flex border-b border-[#D4AF37]/20">
        {(['single', 'batch'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3.5 text-sm font-bold transition-colors ${tab === t ? 'bg-white text-[#2F2F2F] border-b-2 border-[#D4AF37]' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'}`}
          >
            {t === 'single' ? '🏪 Tạo 1 Shop Toàn Diện' : '📋 Nhập Hàng Loạt (CSV)'}
          </button>
        ))}
      </div>

      {/* ─── SINGLE TAB ─────────────────────────────────────────────── */}
      {tab === 'single' && (
        <div className="p-6 space-y-7">
          {/* Section 1: Tài khoản */}
          <div>
            <h3 className="text-sm font-bold text-[#B8860B] uppercase tracking-widest mb-3">1. Tài khoản đăng nhập</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={draft.email} onChange={(e) => update('email', e.target.value)}
                placeholder="Email đăng nhập *" type="email"
                className="rounded-lg border bg-white p-2.5 text-sm focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50" />
              <input value={draft.password} onChange={(e) => update('password', e.target.value)}
                placeholder="Mật khẩu (từ 8 ký tự) *" type="text"
                className="rounded-lg border bg-white p-2.5 text-sm font-mono focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50" />
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">Mật khẩu hiển thị rõ để bạn copy gửi qua Zalo cho chủ shop. Hệ thống không lưu mật khẩu sau khi tạo.</p>
          </div>

          {/* Section 2: Thông tin cơ bản */}
          <div>
            <h3 className="text-sm font-bold text-[#B8860B] uppercase tracking-widest mb-3">2. Thông tin cơ bản</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <ImageSlot label="Logo shop" value={draft.logo_url} onChange={(url) => update('logo_url', url)} folder="logos" />
              </div>
              <div className="md:col-span-2 space-y-3">
                <input value={draft.business_name} onChange={(e) => update('business_name', e.target.value)}
                  placeholder="Tên shop (sẽ hiển thị trên trang đích)"
                  className="w-full rounded-lg border bg-white p-2.5 text-sm focus:border-[#D4AF37] focus:outline-none" />
                <textarea value={draft.description} onChange={(e) => update('description', e.target.value)}
                  placeholder="Mô tả ngắn về shop (hiển thị trong phần Giới thiệu)"
                  rows={3}
                  className="w-full rounded-lg border bg-white p-2.5 text-sm resize-none focus:border-[#D4AF37] focus:outline-none" />
              </div>
            </div>
            {/* Categories */}
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-zinc-600">Lĩnh vực kinh doanh</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <label key={cat.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors ${draft.categories.includes(cat.name) ? 'border-[#B8860B] bg-[#D4AF37]/10 text-[#8A6810] font-medium' : 'bg-white text-zinc-600 hover:border-[#D4AF37]/50'}`}>
                    <input type="checkbox" className="sr-only" checked={draft.categories.includes(cat.name)} onChange={() => toggleCategory(cat.name)} />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Liên hệ & Địa chỉ */}
          <div>
            <h3 className="text-sm font-bold text-[#B8860B] uppercase tracking-widest mb-3">3. Liên hệ & Địa chỉ</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <input value={draft.location_city} onChange={(e) => update('location_city', e.target.value)}
                placeholder="Tỉnh / Thành phố"
                className="rounded-lg border bg-white p-2.5 text-sm focus:border-[#D4AF37] focus:outline-none" />
              <input value={draft.location_district} onChange={(e) => update('location_district', e.target.value)}
                placeholder="Quận / Huyện"
                className="rounded-lg border bg-white p-2.5 text-sm focus:border-[#D4AF37] focus:outline-none" />
              <input value={draft.location_ward} onChange={(e) => update('location_ward', e.target.value)}
                placeholder="Phường / Xã"
                className="rounded-lg border bg-white p-2.5 text-sm focus:border-[#D4AF37] focus:outline-none" />
              <input value={draft.address_full} onChange={(e) => update('address_full', e.target.value)}
                placeholder="Địa chỉ chi tiết (số nhà, tên đường)"
                className="rounded-lg border bg-white p-2.5 text-sm sm:col-span-2 lg:col-span-3 focus:border-[#D4AF37] focus:outline-none" />
              <input value={draft.hotline} onChange={(e) => update('hotline', e.target.value)}
                placeholder="Hotline" type="tel"
                className="rounded-lg border bg-white p-2.5 text-sm focus:border-[#D4AF37] focus:outline-none" />
              <input value={draft.zalo_phone} onChange={(e) => update('zalo_phone', e.target.value)}
                placeholder="Số Zalo" type="tel"
                className="rounded-lg border bg-white p-2.5 text-sm focus:border-[#D4AF37] focus:outline-none" />
              <input value={draft.operating_hours} onChange={(e) => update('operating_hours', e.target.value)}
                placeholder="Giờ hoạt động (vd: 8:00–22:00)"
                className="rounded-lg border bg-white p-2.5 text-sm focus:border-[#D4AF37] focus:outline-none" />
              <input value={draft.facebook_url} onChange={(e) => update('facebook_url', e.target.value)}
                placeholder="Link Facebook (tuỳ chọn)"
                className="rounded-lg border bg-white p-2.5 text-sm focus:border-[#D4AF37] focus:outline-none" />
              <input value={draft.website_url} onChange={(e) => update('website_url', e.target.value)}
                placeholder="Website (tuỳ chọn)"
                className="rounded-lg border bg-white p-2.5 text-sm sm:col-span-2 focus:border-[#D4AF37] focus:outline-none" />
            </div>
          </div>

          {/* Section 4: Hero Slides */}
          <div>
            <h3 className="text-sm font-bold text-[#B8860B] uppercase tracking-widest mb-3">4. Ảnh banner trang đích (Hero Slides)</h3>
            <p className="text-xs text-zinc-400 mb-3">Tải lên 3 ảnh banner sẽ hiển thị trên slideshow đầu trang của shop. Để trống, hệ thống sẽ dùng ảnh mặc định.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {([0, 1, 2] as const).map((idx) => (
                <ImageSlot
                  key={idx}
                  label={`Banner ${idx + 1}`}
                  value={draft.hero_slides[idx]}
                  onChange={(url) => updateSlide(idx, url)}
                  folder="hero-slides"
                />
              ))}
            </div>
          </div>

          {/* Section 5: Sản phẩm */}
          <div>
            <h3 className="text-sm font-bold text-[#B8860B] uppercase tracking-widest mb-3">5. Sản phẩm ban đầu (tuỳ chọn)</h3>
            <div className="rounded-xl border border-dashed border-[#D4AF37]/30 bg-zinc-50 p-4 space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <button type="button" onClick={downloadProductTemplate}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-white">
                  <Download size={13} /> Tải file CSV mẫu sản phẩm
                </button>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-white">
                  <Upload size={13} /> Nhập sản phẩm từ CSV
                  <input type="file" accept=".csv,text/csv" className="sr-only" onChange={handleProductCsv} />
                </label>
              </div>
              {draft.products.length > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                  <p className="text-xs font-medium text-green-700">✅ {draft.products.length} sản phẩm sẵn sàng nhập</p>
                  <button onClick={() => update('products', [])} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <X size={12} /> Xóa
                  </button>
                </div>
              )}
              <p className="text-[11px] text-zinc-400">File CSV mẫu gồm: name, description, price, price_original, image_url, gallery_1…5, category, is_featured. Tối đa 500 sản phẩm mỗi lần.</p>
            </div>
          </div>

          {/* Action */}
          <div className="border-t border-[#D4AF37]/20 pt-5">
            <button
              type="button"
              disabled={submitting}
              onClick={submitSingle}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2F2F2F] px-6 py-3 text-sm font-bold text-white hover:bg-black disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Đang tạo shop…</> : <><Plus size={16} /> Tạo Shop & Tài khoản ngay</>}
            </button>
          </div>
        </div>
      )}

      {/* ─── BATCH TAB ──────────────────────────────────────────────── */}
      {tab === 'batch' && (
        <div className="p-6 space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Nhập hàng loạt từ CSV</h2>
              <p className="mt-1 text-sm text-zinc-500">Tạo tối đa 250 shop/lượt. Tải file mẫu, điền thông tin, rồi upload lên.</p>
            </div>
            <button onClick={downloadBatchTemplate}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">
              <Download size={15} /> Tải file mẫu
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50">
              <Upload size={16} /> Chọn file CSV
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={handleBatchCsv} />
            </label>
            {batch.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{batch.length} shop sẵn sàng import</span>
                <button onClick={() => setBatch([])}><X size={15} className="text-zinc-400" /></button>
                <button
                  disabled={submitting}
                  onClick={submitBatch}
                  className="rounded-lg bg-[#B8860B] px-4 py-2 text-sm font-bold text-white disabled:opacity-50 hover:bg-[#8A6810]"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Tạo hàng loạt'}
                </button>
              </div>
            )}
          </div>

          {batchResult && (
            <div className="rounded-xl border bg-white p-4 space-y-2 text-sm">
              <p className="font-bold text-green-700">✅ Đã tạo: {batchResult.created.length} shop</p>
              {batchResult.failed.length > 0 && (
                <>
                  <p className="font-bold text-red-600">❌ Thất bại: {batchResult.failed.length} dòng</p>
                  <ul className="text-xs text-red-600 space-y-0.5 pl-4 list-disc">
                    {batchResult.failed.slice(0, 10).map((f, i) => (
                      <li key={i}>{f.email}: {f.error}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
