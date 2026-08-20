'use client'

import React, { useState } from 'react'
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      
      if (data.user) {
        const { data: acc } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle()
          
        if (acc?.role === 'super_admin') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Email hoặc mật khẩu không chính xác.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10"
      >
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-playfair text-4xl font-black tracking-tighter text-[#2F2F2F]"><span className="text-[#D4AF37]">1</span>Fashion</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
            <p className="text-sm text-gray-500">Chào mừng trở lại bảng điều khiển</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#D4AF37] transition-colors">
                <input type="checkbox" className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37] w-4 h-4" />
                Ghi nhớ
              </label>
              <Link href="/reset-password" title="Quên mật khẩu" className="hover:text-[#D4AF37] transition-colors">Quên mật khẩu?</Link>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#D4AF37] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#B8962A] disabled:opacity-50 transition-all shadow-md active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Đăng nhập <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-gray-100 text-center space-y-4">
            <p className="text-xs text-gray-500">Chưa có tài khoản?</p>
            <Link href="/signup" className="block">
              <button type="button" className="w-full py-3 rounded-xl border-2 border-gray-100 text-gray-700 text-sm font-semibold hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all">
                Đăng ký tài khoản mới
              </button>
            </Link>
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
