'use client'
import toast from 'react-hot-toast';

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Check, X, Settings, Info } from 'lucide-react'
import { confirmAction } from '@/lib/confirm'

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<any>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [trialDays, setTrialDays] = useState(0)
  const [durationDays, setDurationDays] = useState(365)
  const [maxOffers, setMaxOffers] = useState(3)
  const [maxProducts, setMaxProducts] = useState(-1)
  const [maxAdminBlogs, setMaxAdminBlogs] = useState(1)
  const [homepageShopFeatures, setHomepageShopFeatures] = useState(0)
  const [homepageProductFeatures, setHomepageProductFeatures] = useState(0)
  const [facebookPosts, setFacebookPosts] = useState(0)
  const [publicLandingPage, setPublicLandingPage] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)
  const [features, setFeatures] = useState<string[]>([''])

  const supabase = createClient()

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const token = await getAuthToken()
      const response = await fetch('/api/admin/packages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data && !data.error) setPackages(data)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (pkg: any = null) => {
    if (pkg) {
      setEditingPackage(pkg)
      setName(pkg.name)
      setPrice(pkg.price)
      setTrialDays(pkg.trial_days)
      setDurationDays(pkg.duration_days)
      setMaxOffers(pkg.limits?.max_offers ?? 3)
      setMaxProducts(pkg.limits?.max_products ?? -1)
      setMaxAdminBlogs(pkg.limits?.max_admin_blog_posts ?? 1)
      setHomepageShopFeatures(pkg.limits?.homepage_shop_feature_count ?? 0)
      setHomepageProductFeatures(pkg.limits?.homepage_product_feature_count ?? 0)
      setFacebookPosts(pkg.limits?.facebook_post_count ?? 0)
      setPublicLandingPage(pkg.limits?.public_landing_page !== false)
      setIsAvailable(pkg.is_available !== false)
      setFeatures(pkg.features || [''])
    } else {
      setEditingPackage(null)
      setName('')
      setPrice(0)
      setTrialDays(0)
      setDurationDays(365)
      setMaxOffers(3)
      setMaxProducts(-1); setMaxAdminBlogs(1); setHomepageShopFeatures(0); setHomepageProductFeatures(0); setFacebookPosts(0); setPublicLandingPage(true); setIsAvailable(true)
      setFeatures([''])
    }
    setIsModalOpen(true)
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const addFeatureRow = () => setFeatures([...features, ''])
  const removeFeatureRow = (index: number) => setFeatures(features.filter((_, i) => i !== index))

  const handleSave = async () => {
    const validFeatures = features.filter(f => f.trim() !== '')
    const payload = {
      name,
      price,
      trial_days: trialDays,
      duration_days: durationDays,
      is_available: isAvailable,
      limits: { public_landing_page: publicLandingPage, max_products: maxProducts < 0 ? null : maxProducts, max_admin_blog_posts: maxAdminBlogs, max_offers: maxOffers, homepage_shop_feature_count: homepageShopFeatures, homepage_shop_feature_duration_days: 7, homepage_product_feature_count: homepageProductFeatures, homepage_product_feature_duration_days: 7, facebook_post_count: facebookPosts, refund_window_days: 365, refund_percentage: 100 },
      features: validFeatures
    }

    const token = await getAuthToken()
    const method = editingPackage ? 'PUT' : 'POST'
    const body = editingPackage ? { ...payload, id: editingPackage.id } : payload

    try {
      const response = await fetch('/api/admin/packages', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      
      const result = await response.json()
      if (result.error) throw new Error(result.error)
      
      setIsModalOpen(false)
      fetchPackages()
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction('Ngừng bán gói này? Dữ liệu lịch sử và các gói đã mua sẽ được giữ nguyên.')
    if (!confirmed) return
    
    const token = await getAuthToken()
    try {
      const response = await fetch(`/api/admin/packages?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.error) throw new Error(result.error)
      toast.success('Đã ngừng bán gói thành viên')
      fetchPackages()
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-bold text-[#2F2F2F]">Cấu Hình Gói Dịch Vụ (SaaS Plans)</h2>
          <p className="text-xs text-[#2F2F2F]/60 mt-1">Thiết lập gói thành viên và hạn mức ưu đãi shop được phép công khai.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-white hover:bg-[#C59B27] transition rounded-lg text-xs font-semibold shadow-sm"
        >
          <Plus size={14} /> Thêm Gói Mới
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#2F2F2F]/60 text-xs font-mono animate-pulse">Đang tải danh sách gói cước...</div>
      ) : packages.length === 0 ? (
        <div className="p-12 text-center text-[#2F2F2F]/60 text-xs font-mono">Chưa cấu hình gói cước nào. Nhấn nút "Thêm Gói Mới" để bắt đầu.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div key={pkg.id} className={`bg-white border border-[#D4AF37]/10 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-sm ${pkg.is_available === false ? 'opacity-60' : ''}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-lg text-[#2F2F2F] font-sans">{pkg.name}</h3>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenModal(pkg)} 
                      className="p-1.5 rounded hover:bg-[#FDFBF7] text-[#2F2F2F]/40 hover:text-[#D4AF37] transition"
                      title="Sửa"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button 
                      onClick={() => handleDelete(pkg.id)} 
                      className="p-1.5 rounded hover:bg-[#FDFBF7] text-[#2F2F2F]/40 hover:text-red-600 transition"
                      title="Ngừng bán"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#D4AF37] font-mono">{pkg.price.toLocaleString('vi-VN')}đ</p>
                  <p className="text-[10px] text-[#2F2F2F]/40 mt-1 font-mono uppercase tracking-wider">
                    Chu kỳ: {pkg.duration_days} ngày | Trial: {pkg.trial_days} ngày
                  </p>
                  {pkg.is_available === false && <p className="mt-1 text-xs font-medium text-amber-700">Đã ngừng bán</p>}
                </div>
                <div className="pt-4 border-t border-[#D4AF37]/5 space-y-2">
                  <p className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest flex items-center gap-1">
                    <Settings size={11} /> Giới hạn tính năng:
                  </p>
                  <div className="text-xs text-[#2F2F2F]/80 bg-[#FDFBF7] px-3 py-2 rounded-lg font-mono">
                    <p>• Tối đa {pkg.limits?.max_offers ?? 3} ưu đãi (Offers)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest flex items-center gap-1">
                  <Info size={11} /> Đặc quyền đi kèm:
                </p>
                <ul className="space-y-1.5 pl-1">
                  {(pkg.features || []).map((f: string, i: number) => (
                    <li key={i} className="text-xs text-[#2F2F2F]/80 flex items-start gap-2 leading-relaxed">
                      <Check size={12} className="text-[#B8860B] mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#D4AF37]/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#D4AF37]/10 p-5 flex justify-between items-center z-10">
              <div>
                <h3 className="font-sans font-bold text-lg text-[#2F2F2F]">
                  {editingPackage ? 'Cập Nhật Cấu Hình Gói' : 'Tạo Gói SaaS Mới'}
                </h3>
                <p className="text-xs text-[#2F2F2F]/40 font-mono mt-1">Cấu hình các chỉ số hạn mức của gói cước</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-[#2F2F2F]/40 hover:text-[#2F2F2F] rounded-lg hover:bg-[#FDFBF7] transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#2F2F2F]/60">Tên gói cước</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="VD: Premium Luxury" 
                    className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg px-3 py-2 text-sm text-[#2F2F2F] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[#2F2F2F]/60">Giá thành (VNĐ)</label>
                    <input 
                      type="number" 
                      value={price} 
                      onChange={e => setPrice(Number(e.target.value))} 
                      className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg px-3 py-2 text-sm text-[#2F2F2F] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#2F2F2F]/60">Dùng thử (Số ngày)</label>
                    <input 
                      type="number" 
                      value={trialDays} 
                      onChange={e => setTrialDays(Number(e.target.value))} 
                      className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg px-3 py-2 text-sm text-[#2F2F2F] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[#2F2F2F]/60">Thời hạn chu kỳ (Ngày)</label>
                    <input 
                      type="number" 
                      value={durationDays} 
                      onChange={e => setDurationDays(Number(e.target.value))} 
                      className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg px-3 py-2 text-sm text-[#2F2F2F] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#2F2F2F]/60">Hạn mức Offers (Quota)</label>
                    <input 
                      type="number" 
                      value={maxOffers}
                      onChange={e => setMaxOffers(Number(e.target.value))}
                      className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg px-3 py-2 text-sm text-[#2F2F2F] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-1 text-xs text-[#2F2F2F]/60">Sản phẩm (-1 = không giới hạn)<input type="number" value={maxProducts} onChange={e => setMaxProducts(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-sm" /></label>
                  <label className="space-y-1 text-xs text-[#2F2F2F]/60">Bài blog admin hỗ trợ<input type="number" min="0" value={maxAdminBlogs} onChange={e => setMaxAdminBlogs(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-sm" /></label>
                  <label className="space-y-1 text-xs text-[#2F2F2F]/60">Lần shop nổi bật trang chủ<input type="number" min="0" value={homepageShopFeatures} onChange={e => setHomepageShopFeatures(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-sm" /></label>
                  <label className="space-y-1 text-xs text-[#2F2F2F]/60">Sản phẩm nổi bật trang chủ<input type="number" min="0" value={homepageProductFeatures} onChange={e => setHomepageProductFeatures(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-sm" /></label>
                  <label className="space-y-1 text-xs text-[#2F2F2F]/60">Bài đăng fanpage<input type="number" min="0" value={facebookPosts} onChange={e => setFacebookPosts(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-sm" /></label>
                </div>

                <label className="flex items-center gap-2 text-xs text-[#2F2F2F]/70">
                  <input type="checkbox" checked={publicLandingPage} onChange={event => setPublicLandingPage(event.target.checked)} />
                  Cho phép landing page công khai theo gói này
                </label>
                <label className="flex items-center gap-2 text-xs text-[#2F2F2F]/70">
                  <input type="checkbox" checked={isAvailable} onChange={event => setIsAvailable(event.target.checked)} />
                  Mở bán gói này cho shop
                </label>

                <div className="space-y-2 pt-2">
                  <label className="text-xs text-[#2F2F2F]/60 block">Đặc quyền đi kèm (Features)</label>
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text" 
                          value={feature} 
                          onChange={e => handleFeatureChange(index, e.target.value)} 
                          className="flex-1 bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg px-3 py-2 text-xs text-[#2F2F2F] focus:border-[#D4AF37] focus:outline-none"
                          placeholder="VD: Bản đồ tích hợp chỉ đường Google Maps" 
                        />
                        <button 
                          onClick={() => removeFeatureRow(index)} 
                          className="p-2 text-[#2F2F2F]/40 hover:text-red-600 hover:bg-[#FDFBF7] rounded-lg transition"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={addFeatureRow} 
                      className="text-xs text-[#D4AF37] hover:text-[#C59B27] font-semibold transition"
                    >
                      + Thêm dòng đặc quyền
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-[#D4AF37]/10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#FDFBF7] text-[#2F2F2F]/60 hover:text-[#2F2F2F] hover:bg-[#FDFBF7]/80 transition border border-[#D4AF37]/10"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#D4AF37] text-white hover:bg-[#C59B27] transition"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
