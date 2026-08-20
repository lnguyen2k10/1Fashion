'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, Building2, CreditCard, Eye, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

type Metrics = { shops: number; pageViews: number; pendingPayments: number; activeSubscriptions: number; pendingRefunds: number; pendingBenefits: number }
type Readiness = { logoConfigured: boolean; paymentInstructionsConfigured: boolean }

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({ shops: 0, pageViews: 0, pendingPayments: 0, activeSubscriptions: 0, pendingRefunds: 0, pendingBenefits: 0 })
  const [readiness, setReadiness] = useState<Readiness>({ logoConfigured: false, paymentInstructionsConfigured: false })
  const [loading, setLoading] = useState(true)
  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/overview', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Không thể tải số liệu quản trị')
      setMetrics(result.metrics); setReadiness(result.readiness)
    } catch (error: any) { toast.error(error.message || 'Không thể tải số liệu quản trị') } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  const cards = [
    { label: 'Tổng shop', value: metrics.shops, icon: Building2 },
    { label: 'Lượt xem landing page', value: metrics.pageViews, icon: Eye },
    { label: 'Thanh toán chờ duyệt', value: metrics.pendingPayments, icon: CreditCard },
    { label: 'Gói đang hoạt động', value: metrics.activeSubscriptions, icon: BarChart3 },
  ]
  const outstanding = metrics.pendingRefunds + metrics.pendingBenefits
  return <main className="mx-auto max-w-6xl space-y-8 p-8"><header className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Tổng quan quản trị</h1><p className="mt-2 text-sm text-zinc-500">Số liệu thực từ Supabase và các việc cần xử lý.</p></div><button onClick={() => void load()} className="rounded-lg border p-2" aria-label="Làm mới"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button></header>
    <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-2xl border bg-white p-6"><Icon className="text-[#D4AF37]" size={23} /><p className="mt-5 text-xs uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{loading ? '—' : value.toLocaleString('vi-VN')}</p></article>)}</section>
    <section className="grid gap-5 md:grid-cols-2"><article className="rounded-2xl border bg-white p-6"><div className="flex items-center gap-2"><ShieldAlert size={18} className="text-amber-600" /><h2 className="font-semibold">Hàng đợi vận hành</h2></div><p className="mt-4 text-3xl font-bold">{loading ? '—' : outstanding}</p><p className="mt-1 text-sm text-zinc-500">{metrics.pendingRefunds} hoàn tiền · {metrics.pendingBenefits} quyền lợi cần xử lý</p><Link href="/admin/subscriptions" className="mt-4 inline-block text-sm font-semibold text-[#B8860B]">Mở đối soát →</Link></article><article className="rounded-2xl border bg-white p-6"><div className="flex items-center gap-2"><Sparkles size={18} className="text-[#D4AF37]" /><h2 className="font-semibold">Mức sẵn sàng website</h2></div><div className="mt-4 space-y-2 text-sm"><p>{readiness.logoConfigured ? '✓' : '○'} Logo website</p><p>{readiness.paymentInstructionsConfigured ? '✓' : '○'} Hướng dẫn thanh toán thủ công</p></div>{(!readiness.logoConfigured || !readiness.paymentInstructionsConfigured) && <Link href="/admin/branding" className="mt-4 inline-block text-sm font-semibold text-[#B8860B]">Hoàn thiện cấu hình →</Link>}</article></section>
    <section className="rounded-2xl border bg-white p-7"><h2 className="text-xl font-semibold">Thao tác nhanh</h2><div className="mt-5 flex flex-wrap gap-3"><Link href="/admin/subscriptions" className="rounded-xl bg-[#2F2F2F] px-4 py-3 text-sm font-semibold text-white">Đối soát thanh toán</Link><Link href="/admin/users" className="rounded-xl border px-4 py-3 text-sm font-semibold">Quản lý shop</Link><Link href="/admin/benefits" className="rounded-xl border px-4 py-3 text-sm font-semibold">Thực hiện quyền lợi</Link><Link href="/admin/blogs" className="rounded-xl border px-4 py-3 text-sm font-semibold">Quản lý bài viết</Link></div></section>
  </main>
}
