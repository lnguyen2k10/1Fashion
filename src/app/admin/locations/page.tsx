'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { confirmAction } from '@/lib/confirm'

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('system_locations')
      .select('*')
      .order('sort_order', { ascending: true })
      
    if (error) {
      toast.error('Lỗi tải địa điểm')
    } else {
      setLocations(data || [])
    }
    setLoading(false)
  }

  const handleOpenModal = (loc: any = null) => {
    if (loc) {
      setEditingId(loc.id)
      setName(loc.name)
      setSlug(loc.slug)
      setSortOrder(loc.sort_order.toString())
      setIsActive(loc.is_active)
    } else {
      setEditingId(null)
      setName('')
      setSlug('')
      setSortOrder('0')
      setIsActive(true)
    }
    setIsModalOpen(true)
  }

  // Auto-generate slug
  useEffect(() => {
    if (!editingId && name) {
      const generatedSlug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setSlug(generatedSlug)
    }
  }, [name, editingId])

  const handleSave = async () => {
    if (!name || !slug) {
      toast.error('Vui lòng nhập tên và slug')
      return
    }

    const payload = {
      name,
      slug,
      sort_order: parseInt(sortOrder) || 0,
      is_active: isActive
    }

    if (editingId) {
      const { error } = await supabase.from('system_locations').update(payload).eq('id', editingId)
      if (error) toast.error('Lỗi cập nhật: ' + error.message)
      else {
        toast.success('Cập nhật thành công')
        setIsModalOpen(false)
        loadLocations()
      }
    } else {
      const { error } = await supabase.from('system_locations').insert([payload])
      if (error) toast.error('Lỗi thêm: ' + error.message)
      else {
        toast.success('Thêm thành công')
        setIsModalOpen(false)
        loadLocations()
      }
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction('Bạn có chắc muốn xoá địa điểm này?')
    if (confirmed) {
      const { error } = await supabase.from('system_locations').delete().eq('id', id)
      if (error) toast.error('Lỗi xoá: ' + error.message)
      else {
        toast.success('Đã xoá thành công')
        loadLocations()
      }
    }
  }

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Địa Điểm</h1>
          <p className="text-slate-500 text-sm mt-1">Tuỳ chỉnh các tỉnh/thành phố chuẩn cho hệ thống.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Thêm Địa Điểm
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Tên Địa Điểm</th>
              <th className="px-6 py-4 font-semibold">Slug</th>
              <th className="px-6 py-4 font-semibold text-center">Thứ tự</th>
              <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {locations.map(loc => (
              <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">{loc.name}</td>
                <td className="px-6 py-4 font-mono text-xs">{loc.slug}</td>
                <td className="px-6 py-4 text-center">{loc.sort_order}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${loc.is_active ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {loc.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(loc)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Edit2 size={14}/></button>
                    <button onClick={() => handleDelete(loc.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {locations.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">Chưa có địa điểm nào.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Sửa Địa Điểm' : 'Thêm Địa Điểm'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên địa điểm *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="VD: TP. Hồ Chí Minh" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Slug *</label>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-xs" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thứ tự hiển thị</label>
                  <input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">Kích hoạt</label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Huỷ</button>
              <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                {editingId ? 'Cập Nhật' : 'Lưu Địa Điểm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
