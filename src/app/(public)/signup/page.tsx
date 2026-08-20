'use client'

import React, { useState } from 'react'
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Mail, Lock, Building, ArrowRight, ShieldCheck, AlertCircle, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { completeSignupProfile } from '@/features/auth/actions/auth'
import { slugify } from '@/lib/utils'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    if (formData.password.length < 8) {
      setErrorMsg('Mật khẩu phải có độ dài từ 8 ký tự trở lên.')
      setLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { business_name: formData.name } }
      })

      if (authError) throw authError

      if (authData.user) {
        if (!authData.session) {
          setErrorMsg('Hãy kiểm tra email để xác nhận tài khoản, sau đó đăng nhập để hoàn tất tạo shop.')
          setLoading(false)
          return
        }

        const result = await completeSignupProfile(authData.user.id, formData.email, formData.name);
        if (!result.success) {
          throw new Error(result.error);
        }

        // Wait a bit to show the loading animation before redirecting
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Đã có lỗi xảy ra trong quá trình đăng ký.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden">
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && !errorMsg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
          >
            <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            </motion.div>
            <p className="mt-6 text-black font-semibold text-sm">Đang tạo tài khoản...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10 flex flex-col md:flex-row"
      >
        {/* Left Side: Info */}
        <div className="md:w-5/12 bg-black p-8 md:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=800')] opacity-30 object-cover grayscale mix-blend-overlay" />
          
          <div className="relative z-10 space-y-8">
            <Link href="/" className="inline-block">
              <span className="font-playfair text-4xl font-black tracking-tighter text-white"><span className="text-[#D4AF37]">1</span>Fashion</span>
            </Link>

            <h2 className="text-3xl font-bold leading-tight font-sans tracking-tight">
              Bắt đầu hành trình <br/>kinh doanh.
            </h2>

            <div className="space-y-4 pt-4">
              {[
                '30 ngày dùng thử miễn phí',
                'Giao diện cửa hàng chuẩn mực',
                'Hệ thống quản lý dễ sử dụng',
                'Hỗ trợ SEO khu vực tối ưu'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-[#F5E0A3] flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 pt-12">
            <p className="text-xs font-semibold text-gray-400">Tham gia nền tảng mua sắm</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Đăng ký cửa hàng
            </h1>
            <p className="text-sm text-gray-500">
              Tạo trang landing riêng và quản lý cửa hàng của bạn.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Đăng Ký Tài Khoản Chủ Shop</h3>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <AnimatePresence>
              {errorMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600">
                  <AlertCircle size={16} />
                  <p className="text-xs font-medium">{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">
                  <Building size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Tên Cửa Hàng / Thương Hiệu"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-sm"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="Email đăng nhập"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-sm"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="Mật khẩu (tối thiểu 8 ký tự)"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-sm"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 rounded-xl bg-[#D4AF37] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#B8962A] disabled:opacity-50 transition-all shadow-md active:scale-[0.98]"
            >
              Tạo tài khoản <ArrowRight size={16} />
            </button>
          </form>

          <div className="pt-8 text-center space-y-4">
            <p className="text-sm font-medium text-gray-500">
              Đã có tài khoản? <Link href="/login" className="text-[#D4AF37] font-semibold hover:underline ml-1">Đăng nhập</Link>
            </p>

          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 text-center w-full z-0">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-[#D4AF37] transition-colors">
          &larr; Trở về trang chủ
        </Link>
      </div>
    </main>
  )
}
