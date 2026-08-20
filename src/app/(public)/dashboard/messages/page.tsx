'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Mail, CheckCircle2, Clock, Trash2 } from 'lucide-react'
import { useDashboard } from '../DashboardClientWrapper'

export default function MessagesPage() {
  const { profile, loading: ctxLoading } = useDashboard()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (ctxLoading) return
    if (profile) {
      loadMessages(profile.id)
    }
  }, [ctxLoading, profile])

  const loadMessages = async (businessId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('shop_messages')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      
    if (error) {
      toast.error('Lỗi tải tin nhắn')
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('shop_messages')
      .update({ is_read: true })
      .eq('id', id)
      
    if (error) {
      toast.error('Có lỗi xảy ra')
    } else {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
      toast.success('Đã đánh dấu đọc')
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) return
    
    const { error } = await supabase
      .from('shop_messages')
      .delete()
      .eq('id', id)
      
    if (error) {
      toast.error('Lỗi khi xóa tin nhắn')
    } else {
      setMessages(prev => prev.filter(m => m.id !== id))
      toast.success('Đã xóa tin nhắn')
    }
  }

  if (loading || ctxLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 md:space-y-12 md:p-12">
      <div className="flex flex-col gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[#D4AF37] font-mono text-[10px] uppercase tracking-[0.4em]"
        >
          <Mail size={14} />
          <span>Hỗ Trợ & Liên Hệ</span>
        </motion.div>
        <h1 className="font-sans text-3xl font-light tracking-tight text-[#2F2F2F] sm:text-4xl md:text-5xl">
          Hộp Thư <span className="font-bold">Đến.</span>
        </h1>
      </div>

      <div className="max-w-4xl space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Quản lý tin nhắn và liên hệ từ khách hàng.</p>
          </div>
          <div className="px-4 py-2 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20 flex items-center gap-2">
            <Mail size={18} className="text-[#D4AF37]" />
            <span className="font-bold text-[#D4AF37]">{messages.filter(m => !m.is_read).length} tin mới</span>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <Mail size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có tin nhắn nào</h3>
            <p className="text-gray-500 text-sm">Khi khách hàng gửi liên hệ từ trang cửa hàng, tin nhắn sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`rounded-2xl border bg-white p-4 transition-all duration-200 sm:p-6 ${
                  msg.is_read 
                    ? 'border-gray-100 shadow-sm opacity-75' 
                    : 'border-[#D4AF37]/30 shadow-md ring-1 ring-[#D4AF37]/10'
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3 sm:gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {msg.customer_name}
                      {!msg.is_read && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider">Mới</span>
                      )}
                    </h3>
                    <div className="mt-1 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-4">
                      <span className="font-medium text-[#D4AF37]">{msg.customer_phone}</span>
                      <span className="flex items-center gap-1 text-xs">
                        <Clock size={14} />
                        {new Date(msg.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!msg.is_read && (
                      <button
                        onClick={() => markAsRead(msg.id)}
                        className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                        title="Đánh dấu đã đọc"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa tin nhắn"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
