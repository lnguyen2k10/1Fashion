'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { confirmAction } from '@/lib/confirm'
import {
  Plus, Edit2, Trash2, X, RefreshCw, FileText,
  Eye, EyeOff, Image as ImageIcon, Check
} from 'lucide-react'
import { getBlogFallbackImage } from '@/lib/utils/blog-fallback'
import { slugify } from '@/lib/utils'

type Blog = {
  id: string
  title: string
  category: string
  content: string
  image_url: string | null
  status: string
  created_at: string
  business_id: string | null
  slug?: string
}

const CATEGORIES = [
  'Xu Hướng Thời Trang', 'Phụ Kiện & Trang Sức', 'Streetwear', 'Giày Dép',
  'Hàng Hiệu', 'Trẻ Em', 'Tin Tức 1Fashion.asia', 'Khuyến Mãi', 'Lookbook'
]

export default function AdminBlogsPage() {
  const supabase = createClient()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<'published' | 'draft'>('published')

  const loadBlogs = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .is('business_id', null) // admin-created blogs only
      .order('created_at', { ascending: false })
    if (!error) setBlogs(data || [])
    else toast.error('Lỗi tải blog: ' + error.message)
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadBlogs() }, [loadBlogs])

  const resetForm = () => {
    setTitle(''); setCategory(CATEGORIES[0]); setContent('')
    setImageUrl(''); setStatus('published'); setEditingId(null)
  }

  const openCreate = () => { resetForm(); setShowForm(true) }

  const openEdit = (b: Blog) => {
    setTitle(b.title); setCategory(b.category || CATEGORIES[0])
    setContent(b.content || ''); setImageUrl(b.image_url || '')
    setStatus((b.status as any) || 'published')
    setEditingId(b.id); setShowForm(true)
  }

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Cần nhập tiêu đề!'); return }
    setSaving(true)
    try {
      const payload: any = {
        title: title.trim(),
        category,
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        status,
        business_id: null, // admin global blog
        updated_at: new Date().toISOString()
      }

      if (editingId) {
        // Only update slug if not editing an existing one, or if you want it to change
        // For safety, let's not update slug on edit to prevent breaking old links, 
        // unless you want to. Since we didn't store original slug in state, we won't update it.
        const { error } = await supabase.from('blogs').update(payload).eq('id', editingId)
        if (error) throw error
        toast.success('✅ Đã cập nhật bài viết!')
      } else {
        payload.slug = `${slugify(payload.title)}-${Math.random().toString(36).substring(2, 10)}`
        const { error } = await supabase.from('blogs').insert({ ...payload, created_at: new Date().toISOString() })
        if (error) throw error
        toast.success('✅ Đã đăng bài viết!')
      }

      setShowForm(false); resetForm(); loadBlogs()
    } catch (err: any) {
      toast.error('Lỗi lưu: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const ok = await confirmAction('Xóa bài viết này không thể hoàn tác!')
    if (!ok) return
    const { error } = await supabase.from('blogs').delete().eq('id', id)
    if (!error) { toast.success('Đã xóa bài viết'); loadBlogs() }
    else toast.error('Lỗi xóa: ' + error.message)
  }

  const toggleStatus = async (b: Blog) => {
    const newStatus = b.status === 'published' ? 'draft' : 'published'
    const { error } = await supabase.from('blogs').update({ status: newStatus }).eq('id', b.id)
    if (!error) {
      setBlogs(prev => prev.map(x => x.id === b.id ? { ...x, status: newStatus } : x))
      toast.success(newStatus === 'published' ? '👁️ Đã xuất bản' : '🙈 Đã ẩn bài viết')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-sans font-bold text-[#2F2F2F]">Quản Lý Blog Hệ Thống</h2>
          <p className="text-xs text-[#2F2F2F]/50 mt-1">
            Bài viết Admin sẽ hiển thị trên Homepage (phần Đang Thịnh Hành).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadBlogs} className="p-2 rounded-lg border border-[#D4AF37]/20 text-[#2F2F2F]/50 hover:text-[#D4AF37] transition">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#1A1A1A] bg-gradient-to-r from-[#D4AF37] to-[#F5E0A3] hover:brightness-105 transition shadow-sm"
          >
            <Plus size={16} /> Tạo Bài Viết Mới
          </button>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-20 px-4 overflow-y-auto"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl mb-20"
            >
              <div className="p-6 border-b border-[#D4AF37]/10 flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#2F2F2F]">
                  {editingId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full hover:bg-gray-100 transition">
                  <X size={18} className="text-[#2F2F2F]/60" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-[#2F2F2F]/60 uppercase tracking-widest mb-2">Tiêu đề *</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="VD: Top 10 xu hướng thời trang 2026"
                    className="w-full px-4 py-3 rounded-xl border border-[#D4AF37]/20 text-[#2F2F2F] bg-[#FDFBF7] focus:outline-none focus:border-[#D4AF37] text-sm"
                  />
                </div>

                {/* Category + Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2F2F2F]/60 uppercase tracking-widest mb-2">Danh mục</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#D4AF37]/20 text-[#2F2F2F] bg-[#FDFBF7] focus:outline-none focus:border-[#D4AF37] text-sm"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2F2F2F]/60 uppercase tracking-widest mb-2">Trạng thái</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-[#D4AF37]/20 text-[#2F2F2F] bg-[#FDFBF7] focus:outline-none focus:border-[#D4AF37] text-sm"
                    >
                      <option value="published">🟢 Xuất bản</option>
                      <option value="draft">⚫ Bản nháp</option>
                    </select>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-bold text-[#2F2F2F]/60 uppercase tracking-widest mb-2">
                    <ImageIcon size={10} className="inline mr-1" /> URL Ảnh bìa
                  </label>
                  <input
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 rounded-xl border border-[#D4AF37]/20 text-[#2F2F2F] bg-[#FDFBF7] focus:outline-none focus:border-[#D4AF37] text-sm font-mono"
                  />
                  {imageUrl && (
                    <div className="mt-2 h-32 rounded-xl overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt="preview"
                        width={600}
                        height={200}
                        className="w-full h-full object-cover"
                        onError={() => setImageUrl('')}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-[#2F2F2F]/60 uppercase tracking-widest mb-2">Nội dung</label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={8}
                    placeholder="Viết nội dung bài viết tại đây..."
                    className="w-full px-4 py-3 rounded-xl border border-[#D4AF37]/20 text-[#2F2F2F] bg-[#FDFBF7] focus:outline-none focus:border-[#D4AF37] text-sm leading-relaxed resize-none"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold text-[#1A1A1A] bg-gradient-to-r from-[#D4AF37] to-[#F5E0A3] hover:brightness-105 disabled:opacity-60 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-[#1A1A1A]/30 border-t-[#1A1A1A] rounded-full animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {editingId ? 'Lưu thay đổi' : 'Đăng bài viết'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blog List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-[#D4AF37]/10" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#D4AF37]/10">
          <FileText size={40} className="mx-auto text-[#D4AF37]/30 mb-4" />
          <p className="text-[#2F2F2F]/40 font-medium">Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map(b => (
            <motion.div
              key={b.id}
              layout
              className="bg-white rounded-2xl border border-[#D4AF37]/10 p-4 flex items-center gap-4 hover:shadow-sm transition"
            >
              {/* Cover thumbnail */}
              <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0">
                <Image
                  width={160}
                  height={120}
                  src={b.image_url || getBlogFallbackImage(b.category)}
                  alt={b.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    b.status === 'published' ? 'bg-amber-50 text-[#B8860B] border border-amber-200' : 'bg-gray-50 text-gray-400 border border-gray-200'
                  }`}>
                    {b.status === 'published' ? '● Đang hiển thị' : '○ Bản nháp'}
                  </span>
                  <span className="text-[9px] text-[#D4AF37] font-bold tracking-wider uppercase">{b.category}</span>
                </div>
                <h4 className="font-bold text-[#2F2F2F] text-sm leading-tight truncate">{b.title}</h4>
                <p className="text-xs text-[#2F2F2F]/40 mt-0.5">
                  {new Date(b.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleStatus(b)}
                  title={b.status === 'published' ? 'Ẩn bài' : 'Xuất bản'}
                  className={`p-2 rounded-lg border transition ${
                    b.status === 'published'
                      ? 'text-[#B8860B] border-amber-200 bg-amber-50 hover:bg-[#B8860B] hover:text-white'
                      : 'text-gray-400 border-gray-200 bg-gray-50 hover:bg-gray-200'
                  }`}
                >
                  {b.status === 'published' ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => openEdit(b)}
                  className="p-2 rounded-lg border border-[#D4AF37]/20 text-[#D4AF37] bg-[#D4AF37]/5 hover:bg-[#D4AF37] hover:text-white transition"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-2 rounded-lg border border-red-200 text-red-400 bg-red-50 hover:bg-red-500 hover:text-white transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-[#2F2F2F]/30 font-mono text-center">
        {blogs.length} bài viết • Hiển thị trên Homepage khi status = published
      </p>
    </div>
  )
}
