'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Save, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AdminSettingsPage() {
  const [minViews, setMinViews] = useState(10)
  const [maxViews, setMaxViews] = useState(50)
  const [enabled, setEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'random_view_range')
        .single()

      if (data && data.value) {
        const val = data.value as any
        if (val.min !== undefined) setMinViews(val.min)
        if (val.max !== undefined) setMaxViews(val.max)
        if (val.enabled !== undefined) setEnabled(val.enabled)
      }
    } catch (err) {
      console.error('Error fetching settings', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setStatus('idle')
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'random_view_range',
          value: { min: minViews, max: maxViews, enabled },
          description: 'Configuration for random daily views and clicks added to shops for motivation'
        })

      if (error) throw error
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      console.error('Error saving settings', err)
      setStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-[#2F2F2F]/60 animate-pulse">Đang tải cấu hình...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2F2F2F]">Cài Đặt Hệ Thống</h1>
          <p className="text-sm text-[#2F2F2F]/60 mt-1">Cấu hình các thông số hoạt động chung của toàn bộ nền tảng</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#D4AF37]/20 p-6 sm:p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#2F2F2F]">Thúc đẩy tương tác Shop (Motivation Boost)</h2>
            <p className="text-xs text-[#2F2F2F]/60 mt-0.5">Cấu hình số lượt xem và click ảo được cộng dồn hằng ngày cho mỗi cửa hàng</p>
          </div>
        </div>

        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-bold text-[#2F2F2F]">Trạng thái hoạt động</label>
              <p className="text-xs text-[#2F2F2F]/60">Bật hoặc tắt tính năng cộng dồn view ảo</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2F2F2F] flex items-center gap-2">
                Lượt xem tối thiểu / ngày
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min={0}
                  value={minViews}
                  onChange={(e) => setMinViews(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2F2F2F] flex items-center gap-2">
                Lượt xem tối đa / ngày
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min={minViews}
                  value={maxViews}
                  onChange={(e) => setMaxViews(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving || maxViews < minViews}
              className="px-6 py-2.5 rounded-xl bg-[#2F2F2F] hover:bg-black text-white text-sm font-bold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" /> : <Save size={16} />}
              Lưu cấu hình
            </button>

            {status === 'success' && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 size={16} /> Đã lưu thành công!
              </span>
            )}
            
            {status === 'error' && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-red-600 animate-in fade-in slide-in-from-left-2">
                <AlertCircle size={16} /> Có lỗi xảy ra. Vui lòng thử lại.
              </span>
            )}

            {maxViews < minViews && (
              <span className="text-xs text-red-500 font-medium">Max phải lớn hơn hoặc bằng Min</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
