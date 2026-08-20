'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, MessageSquare, ShoppingBag, Zap, Store, CreditCard, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useDashboard } from './DashboardClientWrapper'
import { motion, AnimatePresence } from 'framer-motion'

export default function BusinessDashboardOverview() {
  const { user, profile, landingPage } = useDashboard()
  const [loading, setLoading] = useState(true)
  const [pageViews, setPageViews] = useState<number | null>(null)
  const [zaloClicks, setZaloClicks] = useState<number | null>(null)
  const [productCount, setProductCount] = useState<number | null>(null)
  const [unreadMessages, setUnreadMessages] = useState<number | null>(null)
  const [showSetupPopup, setShowSetupPopup] = useState(false)

  useEffect(() => {
    if (!profile) return
    const supabase = createClient()
    void (async () => {
      const [viewsResult, zaloResult, productsResult, messagesResult] = await Promise.all([
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('business_id', profile.id).eq('event_type', 'view'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('business_id', profile.id).eq('event_type', 'zalo_click'),
        supabase.from('shop_products').select('*', { count: 'exact', head: true }).eq('business_id', profile.id),
        supabase.from('shop_messages').select('*', { count: 'exact', head: true }).eq('shop_id', profile.id).eq('is_read', false),
      ])
      setPageViews(viewsResult.count ?? 0)
      setZaloClicks(zaloResult.count ?? 0)
      setProductCount(productsResult.count ?? 0)
      setUnreadMessages(messagesResult.count ?? 0)
      setLoading(false)
    })()
  }, [profile?.id, user?.id])

  useEffect(() => {
    if (profile && !loading) {
      const isMissingInfo = profile.category === 'Chưa phân loại' || !profile.location_city || profile.categories?.length === 0
      const dismissed = sessionStorage.getItem('dismissedSetupPopup') === 'true'
      if (isMissingInfo && !dismissed) {
        setShowSetupPopup(true)
      }
    }
  }, [profile, loading])

  const dismissPopup = () => {
    sessionStorage.setItem('dismissedSetupPopup', 'true')
    setShowSetupPopup(false)
  }

  if (loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
      </div>
    )
  }

  const isPublished = landingPage?.is_published

  return (
    <main className="mx-auto max-w-2xl space-y-5 p-4 sm:p-6">
      {/* Greeting */}
      <div className="pt-2">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37]">Bảng quản lý</p>
        <h1 className="mt-1.5 text-2xl font-semibold text-[#2F2F2F] sm:text-3xl">
          {profile.business_name}
        </h1>
      </div>

      {/* Status badge */}
      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        isPublished
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-green-500' : 'bg-zinc-400'}`} />
        {isPublished ? 'Cửa hàng đang công khai' : 'Cửa hàng đang ở chế độ nháp'}
        <Link
          href="/dashboard/store"
          className="ml-1 underline underline-offset-2 text-[10px] opacity-70 hover:opacity-100"
        >
          Cấu hình
        </Link>
      </div>

      {/* Stat grid */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<ShoppingBag size={18} />}
          label="Sản phẩm"
          value={(productCount ?? 0).toLocaleString('vi-VN')}
          sub="Tổng sản phẩm"
          href="/dashboard/store"
          accent
        />
        <StatCard
          icon={<MessageSquare size={18} />}
          label="Tin nhắn mới"
          value={(unreadMessages ?? 0).toLocaleString('vi-VN')}
          sub="Chưa phản hồi"
          href="/dashboard/messages"
          highlight={!!unreadMessages}
        />
        <StatCard
          icon={<Eye size={18} />}
          label="Lượt xem"
          value={(pageViews ?? 0).toLocaleString('vi-VN')}
          sub="Truy cập trang"
        />
        <StatCard
          icon={<Zap size={18} />}
          label="Click Zalo"
          value={(zaloClicks ?? 0).toLocaleString('vi-VN')}
          sub="Liên hệ qua Zalo"
        />
      </section>

      {/* Quick nav shortcuts */}
      <section className="grid grid-cols-2 gap-3 pt-2">
        <QuickLink
          href="/dashboard/store"
          icon={<Store size={20} />}
          label="Quản lý Cửa Hàng"
          desc="Sản phẩm, ưu đãi, trang công khai"
        />
        <QuickLink
          href="/dashboard/billing"
          icon={<CreditCard size={20} />}
          label="Gói Thành Viên"
          desc="Nâng cấp và quyền lợi"
        />
      </section>

      {/* Setup Popup */}
      <AnimatePresence>
        {showSetupPopup && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative flex flex-col items-center text-center"
            >
              <button onClick={dismissPopup} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-full p-2 transition-colors">
                <X size={16} />
              </button>
              <div className="w-16 h-16 bg-amber-50 text-[#D4AF37] rounded-full flex items-center justify-center mb-5 mt-2">
                <Store size={32} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Cập nhật cửa hàng</h3>
              <p className="text-sm text-zinc-500 mb-6 leading-relaxed">Bạn có muốn dành chút thời gian để nhập các thông tin chính yếu cho shop (danh mục, địa chỉ, số điện thoại...) không?</p>
              
              <div className="flex w-full gap-3">
                <button onClick={dismissPopup} className="flex-1 py-3 px-4 bg-zinc-100 text-zinc-700 font-semibold rounded-xl hover:bg-zinc-200 transition-colors text-sm">
                  Để sau
                </button>
                <Link href="/dashboard/store" onClick={dismissPopup} className="flex-1 py-3 px-4 bg-[#2F2F2F] text-white font-semibold rounded-xl hover:bg-black transition-colors shadow-lg shadow-black/20 text-sm">
                  Cập nhật ngay
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  href,
  accent = false,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  href?: string
  accent?: boolean
  highlight?: boolean
}) {
  const cls = `flex flex-col justify-between rounded-2xl border p-4 transition-all ${
    highlight
      ? 'border-red-200 bg-red-50'
      : accent
      ? 'border-[#D4AF37]/40 bg-[#D4AF37]/8'
      : 'border-[#D4AF37]/20 bg-white'
  }`
  const inner = (
    <article className={cls}>
      <div className={highlight ? 'text-red-500' : 'text-[#D4AF37]'}>{icon}</div>
      <div>
        <p className="mt-3 text-2xl font-bold text-[#2F2F2F]">{value}</p>
        <p className="text-xs font-medium text-zinc-500 mt-0.5">{label}</p>
        <p className="text-[10px] text-zinc-400 mt-0.5">{sub}</p>
      </div>
    </article>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function QuickLink({
  href,
  icon,
  label,
  desc,
}: {
  href: string
  icon: React.ReactNode
  label: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-2xl border border-[#D4AF37]/20 bg-white p-4 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all active:scale-[0.98]"
    >
      <div className="text-[#D4AF37]">{icon}</div>
      <div>
        <p className="text-sm font-bold text-[#2F2F2F]">{label}</p>
        <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{desc}</p>
      </div>
    </Link>
  )
}
