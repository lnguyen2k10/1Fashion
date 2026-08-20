'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProfileSettings } from '@/features/dashboard/components/ProfileSettings'
import { ProductsManager } from '@/features/dashboard/components/ProductsManager'
import { OffersManager } from '@/features/dashboard/components/OffersManager'
import { useDashboard } from '../DashboardClientWrapper'
import {
  Globe,
  EyeOff,
  Loader2,
  Package,
  Tag,
  Settings,
  ExternalLink,
  Edit3,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

type TabType = 'general' | 'products' | 'offers'

export default function BusinessDashboardStorePage() {
  const { profile, setProfile, landingPage } = useDashboard()
  const [isPublished, setIsPublished] = useState(landingPage?.is_published || false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('general')

  const supabase = createClient()
  const publicSlug = landingPage?.business_slug || profile?.slug

  const handleTogglePublish = async () => {
    if (!landingPage?.id) return
    setIsUpdatingStatus(true)
    try {
      const newStatus = !isPublished
      const { error } = await supabase
        .from('landing_pages')
        .update({ is_published: newStatus, updated_at: new Date().toISOString() })
        .eq('id', landingPage.id)
      if (error) throw error
      setIsPublished(newStatus)
    } catch (err: any) {
      console.error(err)
      alert('Lỗi khi cập nhật trạng thái: ' + err.message)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (!profile) return null

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-400">

      {/* ── Page header ── */}
      <div className="pt-2">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37]">Quản lý</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#2F2F2F] sm:text-3xl">Cửa Hàng</h1>
      </div>

      {/* ── Public page actions card ── */}
      <section className="rounded-2xl border border-[#D4AF37]/25 bg-white overflow-hidden">
        {/* Status row */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-[#D4AF37]/10">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isPublished ? 'bg-green-500' : 'bg-zinc-400'}`} />
            <span className="text-sm font-semibold text-[#2F2F2F]">
              {isPublished ? 'Đang công khai' : 'Đang ở chế độ nháp'}
            </span>
          </div>
          <button
            onClick={handleTogglePublish}
            disabled={isUpdatingStatus}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
              isPublished
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
            }`}
          >
            {isUpdatingStatus ? (
              <Loader2 size={13} className="animate-spin" />
            ) : isPublished ? (
              <><EyeOff size={13} /> Tắt công khai</>
            ) : (
              <><Globe size={13} /> Bật công khai</>
            )}
          </button>
        </div>

        {/* Editor & View buttons */}
        <div className="grid grid-cols-2 divide-x divide-[#D4AF37]/10">
          <Link
            href={`/${publicSlug}?edit=true`}
            className="flex flex-col items-center gap-1.5 px-4 py-4 text-center hover:bg-[#D4AF37]/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
              <Edit3 size={17} className="text-[#D4AF37]" />
            </div>
            <span className="text-xs font-bold text-[#2F2F2F]">Mở Editor</span>
            <span className="text-[10px] text-zinc-400 leading-snug">Chỉnh sửa nội dung,<br />hình ảnh trang shop</span>
          </Link>
          <Link
            href={`/${publicSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 px-4 py-4 text-center hover:bg-zinc-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center">
              <ExternalLink size={17} className="text-zinc-500" />
            </div>
            <span className="text-xs font-bold text-[#2F2F2F]">Xem Trang</span>
            <span className="text-[10px] text-zinc-400 leading-snug">Xem trang công khai<br />như khách hàng thấy</span>
          </Link>
        </div>

        {/* Mobile editor tip */}
        <div className="px-4 py-2.5 bg-amber-50/60 border-t border-amber-100">
          <p className="text-[11px] text-amber-700 leading-snug">
            <span className="font-bold">💡 Trên điện thoại:</span> Sau khi chỉnh sửa xong, bấm nút{' '}
            <strong>"✕ Thoát chỉnh sửa"</strong> ở góc trên để lưu và quay về.
          </p>
        </div>
      </section>

      {/* ── Content tabs ── */}
      <div>
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
          {([
            { id: 'general',  icon: Settings, label: 'Hồ sơ cửa hàng' },
            { id: 'products', icon: Package,  label: 'Sản phẩm' },
            { id: 'offers',   icon: Tag,      label: 'Ưu đãi' },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === id
                  ? 'bg-[#2F2F2F] text-white shadow-sm'
                  : 'bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-200'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === 'general' && (
            <div className="max-w-2xl">
              <ProfileSettings
                profile={profile}
                onUpdate={(data: any) => setProfile({ ...profile, ...data })}
              />
            </div>
          )}
          {activeTab === 'products' && (
            <div className="max-w-4xl">
              <ProductsManager businessId={profile.id} />
            </div>
          )}
          {activeTab === 'offers' && (
            <div className="max-w-4xl">
              <OffersManager businessId={profile.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
