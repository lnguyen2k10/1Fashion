'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BookOpen, House, LayoutDashboard, LogIn, Store, Tag } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type NavItem = { href: string; label: string; icon: typeof House; exact?: boolean }

const guestItems: NavItem[] = [
  { href: '/', label: 'Trang chủ', icon: House, exact: true },
  { href: '/directory', label: 'Cửa hàng', icon: Store },
  { href: '/offers', label: 'Ưu đãi', icon: Tag },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/login', label: 'Đăng nhập', icon: LogIn },
]

/** Persistent, thumb-friendly navigation for the public marketplace only. */
export function MobileNavigation() {
  const pathname = usePathname()
  const [dashboardHref, setDashboardHref] = useState('/dashboard')
  const [signedIn, setSignedIn] = useState(false)

  const hidden = !pathname || (!['/', '/dashboard', '/account', '/directory', '/offers', '/blog', '/login', '/signup', '/admin', '/onboarding'].includes(`/${pathname.split('/')[1] || ''}`.replace(/\/$/, '')) && pathname.length > 1) || pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/reset-password') || pathname.startsWith('/update-password') || pathname.startsWith('/onboarding')

  useEffect(() => {
    const supabase = createClient()
    const refresh = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setSignedIn(Boolean(user))
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      setDashboardHref(profile?.role === 'super_admin' ? '/admin' : '/dashboard')
    }
    void refresh()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { void refresh() })
    return () => subscription.unsubscribe()
  }, [])

  if (hidden) return null
  const items = signedIn ? [...guestItems.slice(0, 4), { href: dashboardHref, label: dashboardHref === '/admin' ? 'Quản trị' : 'Quản lý', icon: LayoutDashboard }] : guestItems

  return <nav aria-label="Điều hướng nhanh" className="fixed inset-x-0 bottom-0 z-[90] border-t border-zinc-200/80 bg-white/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_28px_rgba(0,0,0,0.08)] backdrop-blur-xl md:hidden">
    <div className="mx-auto grid max-w-lg grid-cols-5">{items.map((item) => {
      const Icon = item.icon
      const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
      return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition ${active ? 'text-[#B8860B]' : 'text-zinc-500 active:bg-zinc-100'}`}>
        <Icon size={20} strokeWidth={active ? 2.4 : 1.9} /><span className="max-w-full truncate">{item.label}</span>
      </Link>
    })}</div>
  </nav>
}

export function PublicMobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hidden = !pathname || (!['/', '/dashboard', '/account', '/directory', '/offers', '/blog', '/login', '/signup', '/admin', '/onboarding'].includes(`/${pathname.split('/')[1] || ''}`.replace(/\/$/, '')) && pathname.length > 1) || pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/reset-password') || pathname.startsWith('/update-password') || pathname.startsWith('/onboarding')
  return <div className={hidden ? '' : 'pb-[calc(4.2rem+env(safe-area-inset-bottom))] md:pb-0'}>{children}</div>
}
