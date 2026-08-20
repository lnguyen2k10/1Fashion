'use client'

import React, { createContext, useContext, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  Settings, 
  MessageSquare, 
  LogOut,
  ShieldCheck,
  CreditCard,
  Store,
  User,
  ExternalLink,
  Edit3,
} from 'lucide-react'

interface DashboardContextType {
  user: any
  profile: any
  isAdmin: boolean
  landingPage: any
  loading: boolean
  setProfile: (profile: any) => void
}

const DashboardContext = createContext<DashboardContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  landingPage: null,
  loading: true,
  setProfile: () => {}
})

export const useDashboard = () => useContext(DashboardContext)

interface DashboardClientWrapperProps {
  children: React.ReactNode
  initialUser: any
  initialProfile: any
  initialIsAdmin: boolean
  initialLandingPage: any
}

export default function DashboardClientWrapper({
  children,
  initialUser,
  initialProfile,
  initialIsAdmin,
  initialLandingPage,
}: DashboardClientWrapperProps) {
  const [user] = useState<any>(initialUser)
  const [profile, setProfile] = useState<any>(initialProfile)
  const [isAdmin] = useState(initialIsAdmin)
  const [landingPage] = useState<any>(initialLandingPage)
  const [unreadCount, setUnreadCount] = useState(0)

  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (profile?.id) {
      const getUnread = async () => {
        const { count } = await supabase.from('shop_messages').select('*', { count: 'exact', head: true }).eq('shop_id', profile.id).eq('is_read', false)
        if (count) setUnreadCount(count)
      }
      getUnread()
    }
  }, [profile?.id, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { name: 'Tổng Quan',     href: '/dashboard',          icon: LayoutDashboard },
    { name: 'Cửa Hàng',      href: '/dashboard/store',    icon: Store },
    { name: 'Tin Nhắn',      href: '/dashboard/messages', icon: MessageSquare, badge: unreadCount },
    { name: 'Gói TV',        href: '/dashboard/billing',  icon: CreditCard },
    { name: 'Tài Khoản',     href: '/dashboard/settings', icon: User },
  ]

  const publicSlug = landingPage?.business_slug || profile?.slug

  return (
    <DashboardContext.Provider value={{ user, profile, isAdmin, landingPage, loading: false, setProfile }}>
      <div className="min-h-screen bg-[#ffffff] flex">

        {/* ── Mobile top bar ── */}
        <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[#D4AF37]/15 bg-white/95 px-4 backdrop-blur lg:hidden">
          <Link href="/dashboard" className="max-w-[75%] truncate text-sm font-bold tracking-wide text-[#2F2F2F]">
            {profile?.business_name || '1Fashion Shop'}
          </Link>
          {/* Status dot */}
          <span className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest ${landingPage?.is_published ? 'text-green-600' : 'text-zinc-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${landingPage?.is_published ? 'bg-green-500' : 'bg-zinc-400'}`} />
            {landingPage?.is_published ? 'Công khai' : 'Nháp'}
          </span>
        </header>

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#D4AF37]/20 flex-col">
          <div className="p-6 h-20 border-b border-[#D4AF37]/10 flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-widest text-[#2F2F2F]" style={{ fontFamily: "'Inter', serif" }}>
                <span className="text-[#D4AF37]">1</span>FASHION
              </span>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] shadow-sm font-bold border border-[#D4AF37]/20' 
                      : 'text-zinc-500 hover:bg-[#D4AF37]/5 hover:text-[#D4AF37] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-[#D4AF37]' : ''} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {item.badge ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </div>

          {/* Sidebar footer – desktop only */}
          <div className="p-4 border-t border-[#D4AF37]/10 bg-amber-50/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 shrink-0 overflow-hidden">
                {profile?.logo_url ? (
                  <Image src={profile.logo_url} width={40} height={40} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#D4AF37] font-bold text-sm">{(profile?.business_name || 'B').charAt(0)}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-[#2F2F2F] truncate">{profile?.business_name}</p>
                <p className="text-[10px] text-zinc-500 font-mono truncate">ID: {profile?.id?.split('-')[0]}</p>
              </div>
            </div>
            
            {/* Quick links – desktop sidebar only */}
            <div className="flex gap-2 mb-2">
              <Link
                href={`/${publicSlug}`}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#ffffff] text-[#2F2F2F]/60 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors border border-[#D4AF37]/15"
              >
                <ExternalLink size={11} /> Trang Tôi
              </Link>
              <Link
                href={`/${publicSlug}?edit=true`}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-[#D4AF37]/20 transition-colors border border-[#D4AF37]/30"
              >
                <Edit3 size={11} /> Editor
              </Link>
            </div>

            {isAdmin && (
              <Link href="/admin">
                <button className="w-full flex items-center justify-center gap-2 py-2 mb-2 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-amber-200 transition-colors">
                  <ShieldCheck size={14} /> Quản Trị
                </button>
              </Link>
            )}

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="min-h-screen flex-1 pt-14 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:ml-64 lg:pt-0 lg:pb-0">
          {children}
        </main>

        {/* ── Mobile Bottom Nav – exactly 5 tabs ── */}
        <nav
          aria-label="Điều hướng quản trị shop"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-[#D4AF37]/15 bg-white/97 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-6px_24px_rgba(0,0,0,0.07)] backdrop-blur-xl lg:hidden"
        >
          <div className="grid grid-cols-5 max-w-lg mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                    active ? 'text-[#B8860B]' : 'text-zinc-400 active:bg-zinc-50'
                  }`}
                >
                  {/* Active indicator dot */}
                  {active && (
                    <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#D4AF37]" />
                  )}
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                  <span className="truncate leading-none mt-0.5">{item.name}</span>
                  {/* Unread badge */}
                  {item.badge ? (
                    <span className="absolute top-1 right-[calc(50%-14px)] bg-red-500 text-white text-[8px] font-bold min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-1">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </DashboardContext.Provider>
  )
}
