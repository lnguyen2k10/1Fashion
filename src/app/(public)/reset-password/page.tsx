'use client'
import toast from 'react-hot-toast';

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, Send, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (error: any) {
      toast(error.message || 'Đã có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: '#ffffff' }}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] animate-pulse-gold opacity-40" style={{ background: '#D4AF37' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[100px] opacity-60" style={{ background: '#FFFFFF' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="p-8 md:p-10 space-y-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
             style={{ 
               background: 'rgba(255,255,255,0.6)', 
               backdropFilter: 'blur(16px)', 
               border: '1px solid rgba(255,255,255,0.8)' 
             }}>
             
          <div className="text-center space-y-4">
            <Link href="/" className="inline-block mb-2">
              <span className="font-sans text-3xl font-black tracking-widest text-[#2F2F2F]"><span className="text-[#D4AF37]">1</span>Fashion</span>
            </Link>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.4em] mb-1">Hỗ trợ tài khoản</span>
              <h1 className="text-2xl font-bold text-[#2F2F2F] leading-tight" style={{ fontFamily: "'Inter', serif" }}>
                Khôi phục<br /><span className="text-[#D4AF37]">Mật khẩu.</span>
              </h1>
              <p className="text-[10px] text-[#2F2F2F]/50 font-medium mt-3 px-6">
                Nhập email doanh nghiệp của bạn để nhận liên kết đặt lại mật khẩu.
              </p>
            </div>
          </div>

          {!sent ? (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2F2F2F]/40 group-focus-within:text-[#D4AF37] transition-colors">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/50 border border-white/60 rounded-2xl py-3.5 pl-12 pr-4 text-[#2F2F2F] placeholder:text-[#2F2F2F]/40 outline-none focus:border-[#D4AF37] focus:bg-white transition-all font-medium text-xs shadow-sm"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="relative overflow-hidden w-full py-3.5 rounded-full text-white font-bold uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 group disabled:opacity-50 transition-all shadow-[0_8px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_12px_25px_rgba(212,175,55,0.35)]"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5E0A3 50%, #B8860B 100%)' }}
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Gửi liên kết</span>
                    <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 py-4"
            >
              <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto text-[#B8860B]">
                <Send size={24} />
              </div>
              <p className="text-xs text-[#2F2F2F]/70 leading-relaxed">
                Chúng tôi đã gửi một liên kết khôi phục tới <br/><b className="text-[#2F2F2F]">{email}</b>.<br/> Vui lòng kiểm tra hòm thư.
              </p>
              <button 
                onClick={() => setSent(false)}
                className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest hover:underline"
              >
                Thử lại với email khác
              </button>
            </motion.div>
          )}

          <div className="pt-6 border-t border-[#D4AF37]/10 text-center">
            <Link href="/login" className="text-[10px] font-bold text-[#2F2F2F]/40 uppercase tracking-widest hover:text-[#D4AF37] flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft size={14} /> Trở về Đăng nhập
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold text-[#2F2F2F]/40 uppercase tracking-[0.3em] hover:text-[#D4AF37] transition-colors">
            Trở về trang chủ
          </Link>
        </div>
      </motion.div>

      <div className="absolute top-10 right-10 opacity-30"><Sparkles size={40} className="text-[#D4AF37]" /></div>
      <div className="absolute bottom-10 left-10 opacity-20"><Sparkles size={60} className="text-[#D4AF37]" /></div>
    </main>
  )
}
