'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Database, 
  CreditCard, 
  Users, 
  Package, 
  ListChecks,
  FileText, 
  Palette,
  ScrollText,
  Mail,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/admin/benefits', label: 'Thực hiện quyền lợi', icon: ListChecks },
  { href: '/admin', label: 'Tổng Quan & Leads', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Đối Tác & Trang Đích', icon: Users },
  { href: '/admin/shop-accounts', label: 'Tạo tài khoản shop', icon: Users },
  { href: '/admin/subscriptions', label: 'Đối Soát Thanh Toán', icon: CreditCard },
  { href: '/admin/packages', label: 'Gói Thành Viên', icon: Package },
  { href: '/admin/categories', label: 'Quản Lý Ngành Hàng', icon: LayoutDashboard },
  { href: '/admin/product-categories', label: 'Danh Mục Sản Phẩm', icon: Package },
  { href: '/admin/locations', label: 'Quản Lý Địa Điểm', icon: ScrollText },
  { href: '/admin/blogs', label: 'Quản Lý Bài Viết', icon: FileText },
  { href: '/admin/branding', label: 'Nhận Diện Thương Hiệu', icon: Palette },
  { href: '/admin/audit', label: 'Nhật ký vận hành', icon: ScrollText },
  { href: '/admin/settings', label: 'Cài Đặt Hệ Thống', icon: LayoutDashboard },
  { href: '/admin/email', label: 'Email giao dịch', icon: Mail },
]

function NavLink({ href, label, icon: Icon, exact, onNavigate }: { href: string; label: string; icon: any; exact?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all group ${
        isActive
          ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 font-bold'
          : 'text-[#2F2F2F]/70 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border border-transparent'
      }`}
    >
      <Icon 
        size={15} 
        className={`flex-shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-[#2F2F2F]/40 group-hover:text-[#D4AF37]'} transition-colors`}
      />
      <span className="truncate">{label}</span>
      {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-[#D4AF37]" />}
    </Link>
  )
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <div data-admin-shell className="min-h-screen bg-[#ffffff] text-[#2F2F2F] flex">
      <header className="fixed inset-x-0 top-0 z-30 flex h-15 items-center justify-between border-b border-[#D4AF37]/15 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 text-sm font-bold"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]"><Sparkles size={14} className="text-white" /></span><span className="text-[#D4AF37]">1</span>Fashion Admin</Link>
        <button type="button" aria-label={mobileMenuOpen ? 'Đóng menu quản trị' : 'Mở menu quản trị'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#D4AF37]/20 bg-white text-[#2F2F2F]">{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </header>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#D4AF37]/20 bg-white shadow-xl transition-transform duration-200 lg:w-60 lg:translate-x-0 lg:shadow-none ${mobileMenuOpen ? 'translate-x-0' : ''}`}>
        {/* Logo */}
        <div className="p-5 border-b border-[#D4AF37]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#D4AF37] flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#2F2F2F] font-sans tracking-wide"><span className="text-[#D4AF37]">1</span>Fashion Admin</h1>
              <p className="text-[9px] font-mono text-[#2F2F2F]/40 uppercase tracking-[0.2em]">Quản Trị Hệ Thống</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-mono text-[#2F2F2F]/30 uppercase tracking-[0.2em] px-4 py-2">Menu Chính</p>
          {navItems.map(item => (
            <NavLink key={item.href} {...item} onNavigate={() => setMobileMenuOpen(false)} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#D4AF37]/10 space-y-2">
          <div className="px-4 py-2">
            <p className="text-[10px] text-[#2F2F2F]/40 font-mono">Đăng nhập với vai trò</p>
            <p className="text-xs text-[#9c7a1c] font-medium">Super Admin</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#2F2F2F]/60 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border border-transparent transition-all"
          >
            <LogOut size={15} />
            Về trang chủ
          </Link>
        </div>
      </aside>

      {mobileMenuOpen && <button type="button" aria-label="Đóng menu" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-[35] bg-black/30 backdrop-blur-[1px] lg:hidden" />}

      {/* Main Content */}
      <main className="min-h-screen w-full flex-1 bg-[#ffffff] pt-15 lg:ml-60 lg:pt-0">
        <div data-admin-content className="mx-auto max-w-screen-xl p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-6 lg:p-8 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
