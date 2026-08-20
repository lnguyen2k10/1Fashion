'use client'

import React, { useState, useEffect, useRef, ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, Upload, Download, X, ChevronDown, ChevronUp } from 'lucide-react'
import { ImagePickerModal } from '@/features/editor/components/ImagePickerModal'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Product {
  id: string
  business_id: string
  name: string
  description: string
  price: string
  price_original: string
  image_url: string
  image_gallery: string[]
  category: string
  status: string
  is_featured: boolean
  sort_order: number
  tags: string[]
}

// ─── CSV helpers ──────────────────────────────────────────────────────────────
function parseCsv(input: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false
  for (let i = 0; i < input.length; i++) {
    const c = input[i]; const n = input[i + 1]
    if (c === '"' && quoted && n === '"') { cell += '"'; i++ }
    else if (c === '"') quoted = !quoted
    else if (c === ',' && !quoted) { row.push(cell.trim()); cell = '' }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && n === '\n') i++
      row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ''
    } else cell += c
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row)
  return rows
}
function csvVal(v: string) { return v.includes(',') || v.includes('"') ? `"${v.replaceAll('"', '""')}"` : v }
function csvRow(cols: string[]) { return cols.map(csvVal).join(',') }

const PRODUCT_CSV_HEADERS = ['name', 'description', 'price', 'price_original', 'image_url', 'gallery_1', 'gallery_2', 'gallery_3', 'gallery_4', 'gallery_5', 'category', 'is_featured']

export function ProductsManager({ businessId }: { businessId: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)
  const [productCategories, setProductCategories] = useState<any[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [businessId])

  const fetchProducts = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('shop_products').select('*').eq('business_id', businessId).order('created_at', { ascending: false }),
        supabase.from('product_categories').select('*').eq('is_active', true).order('sort_order', { ascending: true })
      ])
      
      if (productsRes.error) throw productsRes.error
      setProducts(productsRes.data || [])
      if (!categoriesRes.error) {
        setProductCategories(categoriesRes.data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct?.name) return
    
    setSaving(true)
    try {
      if (editingProduct.id) {
        const { error } = await supabase
          .from('shop_products')
          .update({
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price,
            price_original: editingProduct.price_original,
            image_url: editingProduct.image_url,
            image_gallery: JSON.stringify((editingProduct as any).image_gallery || []),
            category: editingProduct.category,
            status: editingProduct.status || 'active',
            is_featured: editingProduct.is_featured || false,
            sort_order: (editingProduct as any).sort_order || 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('shop_products')
          .insert({
            business_id: businessId,
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price,
            price_original: editingProduct.price_original,
            image_url: editingProduct.image_url,
            image_gallery: JSON.stringify((editingProduct as any).image_gallery || []),
            category: editingProduct.category,
            status: editingProduct.status || 'active',
            is_featured: editingProduct.is_featured || false,
            sort_order: (editingProduct as any).sort_order || 0,
          })
        if (error) throw error
      }
      setIsModalOpen(false)
      fetchProducts()
    } catch (error: any) {
      alert('Lỗi khi lưu sản phẩm: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return
    
    try {
      const { error } = await supabase.from('shop_products').delete().eq('id', id)
      if (error) throw error
      setProducts(products.filter(p => p.id !== id))
    } catch (error: any) {
      alert('Lỗi khi xóa: ' + error.message)
    }
  }

  const openNewModal = () => {
    setEditingProduct({
      name: '',
      description: '',
      price: '',
      price_original: '',
      image_url: '',
      category: '',
      status: 'active',
      is_featured: false
    })
    setIsModalOpen(true)
  }

  // ─── CSV import ──────────────────────────────────────────────────────────
  const [importing, setImporting] = useState(false)
  const [showImportHint, setShowImportHint] = useState(false)
  const csvRef = useRef<HTMLInputElement>(null)

  const downloadProductTemplate = () => {
    const sample = ['Áo thun nữ', 'Mô tả sản phẩm', '200.000đ', '300.000đ', 'https://link-anh-chinh.jpg', 'https://anh2.jpg', '', '', '', '', 'Áo', 'false']
    const content = [PRODUCT_CSV_HEADERS, sample].map(csvRow).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' }))
    a.download = 'mau-san-pham.csv'; a.click(); URL.revokeObjectURL(a.href)
  }

  const handleProductCsv = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const rows = parseCsv(text)
      const header = rows.shift()?.map((h) => h.toLowerCase().replace(/^\uFEFF/, '')) ?? []
      if (!header.includes('name')) { toast.error('CSV cần có cột name (tên sản phẩm).'); return }
      if (rows.length > 500) { toast.error('Tối đa 500 sản phẩm mỗi lần import.'); return }
      const read = (row: string[], field: string) => row[header.indexOf(field)] || ''
      const supabase = createClient()
      const toInsert = rows
        .filter((row) => read(row, 'name'))
        .map((row, idx) => ({
          business_id: businessId,
          name: read(row, 'name').slice(0, 200),
          description: read(row, 'description') || null,
          price: read(row, 'price') || null,
          price_original: read(row, 'price_original') || null,
          image_url: read(row, 'image_url') || null,
          image_gallery: JSON.stringify([1,2,3,4,5].map((n) => read(row, `gallery_${n}`)).filter(Boolean)),
          category: read(row, 'category') || null,
          is_featured: read(row, 'is_featured').toLowerCase() === 'true',
          sort_order: idx,
          status: 'active',
        }))
      const { error } = await supabase.from('shop_products').insert(toInsert)
      if (error) throw error
      toast.success(`✅ Đã nhập ${toInsert.length} sản phẩm vào shop!`)
      fetchProducts()
    } catch (err: any) {
      toast.error('Lỗi import CSV: ' + err.message)
    } finally { setImporting(false) }
  }

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#D4AF37]" /></div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#2F2F2F]">Sản phẩm của cửa hàng</h2>
          <p className="text-sm text-zinc-500 mt-1">Quản lý danh sách sản phẩm để hiển thị trên gian hàng.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadProductTemplate}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
            <Download size={13} /> Tải file mẫu
          </button>
          <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
            {importing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Nhập từ CSV
            <input ref={csvRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={handleProductCsv} />
          </label>
          <button 
            onClick={openNewModal}
            className="bg-[#2F2F2F] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-sm hover:shadow"
          >
            <Plus size={16} /> Thêm Sản phẩm
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fcfaf5] border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Giá bán</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                      <ImageIcon size={20} className="text-zinc-300" />
                    </div>
                    <p className="text-zinc-500 font-medium">Chưa có sản phẩm nào</p>
                    <p className="text-xs text-zinc-400 mt-1">Hãy thêm sản phẩm đầu tiên để bắt đầu bán hàng.</p>
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden relative flex-shrink-0 border border-zinc-200">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400"><ImageIcon size={16} /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#2F2F2F]">{product.name}</p>
                          <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{product.description || 'Không có mô tả'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#D4AF37]">{product.price || 'Liên hệ'}</span>
                        {product.price_original && <span className="text-xs text-zinc-400 line-through mt-0.5">{product.price_original}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-medium">{product.category || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl z-10">
              <div>
                <h3 className="text-2xl font-light text-[#2F2F2F]">
                  {editingProduct.id ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                </h3>
                <p className="text-sm text-zinc-500 mt-1">Điền thông tin chi tiết cho sản phẩm của bạn.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full transition-colors">
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Tên sản phẩm *</label>
                    <input 
                      required
                      type="text" 
                      value={editingProduct.name || ''} 
                      onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all bg-zinc-50/50"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Giá bán</label>
                      <input 
                        type="text" 
                        placeholder="VD: 490.000đ"
                        value={editingProduct.price || ''} 
                        onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all bg-zinc-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Giá gốc</label>
                      <input 
                        type="text" 
                        placeholder="Gạch ngang"
                        value={editingProduct.price_original || ''} 
                        onChange={e => setEditingProduct({...editingProduct, price_original: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all bg-zinc-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Danh mục</label>
                    <select
                      value={editingProduct.category || ''}
                      onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all bg-zinc-50/50 appearance-none"
                    >
                      <option value="">-- Chọn danh mục sản phẩm --</option>
                      {productCategories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Hình ảnh</label>
                  <div 
                    onClick={() => setIsImagePickerOpen(true)}
                    className="w-full aspect-square md:aspect-[4/5] rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/80 flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all relative overflow-hidden group"
                  >
                    {editingProduct.image_url ? (
                      <>
                        <Image src={editingProduct.image_url} alt="Preview" fill className="object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-medium text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Thay đổi ảnh</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-zinc-400 p-6">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <ImageIcon size={24} className="text-[#D4AF37]" />
                        </div>
                        <p className="text-sm font-medium text-[#2F2F2F]">Bấm để tải ảnh lên</p>
                        <p className="text-xs mt-1">Kích thước khuyên dùng: Vuông hoặc 4:5</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Mô tả ngắn</label>
                <textarea 
                  rows={4}
                  placeholder="Nhập mô tả sản phẩm của bạn..."
                  value={editingProduct.description || ''} 
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all bg-zinc-50/50 resize-none"
                />
              </div>

              {/* Gallery images */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Ảnh thư viện (tối đa 5 ảnh)</label>
                <div className="grid grid-cols-5 gap-2">
                  {[0,1,2,3,4].map((idx) => {
                    const gallery: string[] = (editingProduct as any).image_gallery || []
                    const url = gallery[idx] || ''
                    return (
                      <div key={idx} className="relative aspect-square rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 overflow-hidden">
                        {url ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const g = [...(gallery || [])]; g.splice(idx, 1, '')
                                setEditingProduct({ ...editingProduct, image_gallery: g.filter(Boolean) } as any)
                              }}
                              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                            ><X size={10} /></button>
                          </>
                        ) : (
                          <label className="flex w-full h-full cursor-pointer flex-col items-center justify-center text-zinc-300 hover:text-zinc-400 transition-colors">
                            <Plus size={16} />
                            <span className="text-[9px] mt-0.5">{idx+1}</span>
                            <input type="text"
                              placeholder="Dán link ảnh"
                              className="mt-1 w-full px-1 text-[9px] border rounded text-zinc-700"
                              onBlur={(e) => {
                                const val = e.target.value.trim()
                                if (!val) return
                                const g = [...(gallery || [])]
                                g[idx] = val
                                setEditingProduct({ ...editingProduct, image_gallery: g } as any)
                                e.target.value = ''
                              }}
                            />
                          </label>
                        )}
                      </div>
                    )
                  })}
                </div>
                <p className="mt-1 text-xs text-zinc-400">Dán link URL ảnh vào ô, hoặc nhập CSV với cột gallery_1…gallery_5.</p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-[#2F2F2F] bg-zinc-100 hover:bg-zinc-200 font-bold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 rounded-xl bg-[#D4AF37] text-[#2F2F2F] font-bold hover:bg-[#C5A028] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ImagePickerModal 
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        currentUrl={editingProduct?.image_url}
        onSelect={(url) => {
          setEditingProduct(prev => prev ? {...prev, image_url: url} : null)
          setIsImagePickerOpen(false)
        }}
      />
    </div>
  )
}
