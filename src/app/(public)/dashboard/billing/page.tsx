'use client'

import { useEffect, useState } from 'react'
import { Check, CreditCard, Info, Loader2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { uploadShopImage } from '@/lib/storage/shop-images'
import { useDashboard } from '../DashboardClientWrapper'
import { MembershipBenefitRequests } from '@/features/dashboard/components/MembershipBenefitRequests'
import { HomepageFeatureActivation } from '@/features/dashboard/components/HomepageFeatureActivation'

type Package = { id: string; name: string; price: number; duration_days: number; features: string[] | null; limits: { max_offers?: number; max_products?: number | null; max_admin_blog_posts?: number; homepage_shop_feature_count?: number; homepage_product_feature_count?: number; facebook_post_count?: number; refund_window_days?: number } | null }

export default function BillingPage() {
  const { profile, loading: profileLoading } = useDashboard()
  const [packages, setPackages] = useState<Package[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [paymentInstructions, setPaymentInstructions] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [requestingRefund, setRequestingRefund] = useState(false)

  const loadBilling = async () => {
    if (!profile?.id) return
    setLoading(true)
    const supabase = createClient()
    const [packageResult, subscriptionResult, settingsResult] = await Promise.all([
      supabase.from('packages').select('*').eq('is_available', true).order('price', { ascending: true }),
      supabase.from('subscriptions').select('*, packages(*)').eq('business_id', profile.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('site_settings').select('manual_payment_instructions').eq('id', 'current').maybeSingle(),
    ])
    if (packageResult.error) toast.error(packageResult.error.message)
    if (subscriptionResult.error) toast.error(subscriptionResult.error.message)
    setPackages((packageResult.data ?? []) as Package[])
    setCurrentSubscription(subscriptionResult.data)
    setPaymentInstructions((settingsResult.data as { manual_payment_instructions?: string | null } | null)?.manual_payment_instructions || '')
    setLoading(false)
  }

  useEffect(() => { if (!profileLoading) void loadBilling() }, [profileLoading, profile?.id])

  const submitReceipt = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedPackage || !paymentInstructions.trim()) return
    setUploading(true)
    try {
      const proofImageUrl = await uploadShopImage(file, 'receipt')
      const response = await fetch('/api/shop/subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId: selectedPackage.id, proofImageUrl }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Không thể gửi yêu cầu thanh toán')
      toast.success('Đã gửi biên lai. Super admin sẽ kiểm tra và kích hoạt gói.')
      setSelectedPackage(null)
      await loadBilling()
    } catch (error: any) { toast.error(error.message || 'Không thể tải biên lai lên') } finally { setUploading(false); event.target.value = '' }
  }

  const requestRefund = async () => {
    setRequestingRefund(true)
    try {
      const response = await fetch('/api/shop/refunds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: refundReason }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Không thể gửi yêu cầu hoàn tiền')
      toast.success('Đã gửi yêu cầu hoàn tiền đến super admin.')
      setRefundOpen(false); setRefundReason('')
    } catch (error: any) { toast.error(error.message || 'Không thể gửi yêu cầu hoàn tiền') } finally { setRequestingRefund(false) }
  }

  if (profileLoading || loading) return <div className="flex min-h-[400px] items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={40} /></div>
  const isActive = currentSubscription?.status === 'active' && currentSubscription?.verified

  return <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 md:space-y-10 md:p-12">
    {isActive && currentSubscription?.id && <MembershipBenefitRequests subscriptionId={currentSubscription.id} limits={currentSubscription.packages?.limits} />}
    {isActive && currentSubscription?.id && <HomepageFeatureActivation subscriptionId={currentSubscription.id} />}
    <header><div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-[#D4AF37]"><CreditCard size={14} />Thanh toán</div><h1 className="text-4xl font-light text-[#2F2F2F]">Gói dịch vụ</h1><p className="mt-2 text-sm text-[#2F2F2F]/60">Chuyển khoản và tải biên lai. Gói chỉ có hiệu lực sau khi super admin duyệt.</p></header>
    {currentSubscription && <section className={`rounded-2xl border p-5 ${isActive ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><p className="font-semibold">{currentSubscription.packages?.name || 'Yêu cầu gói dịch vụ'}</p><p className="mt-1 text-sm">Trạng thái: <strong>{isActive ? 'Đang hoạt động' : currentSubscription.status === 'rejected' ? 'Bị từ chối' : 'Chờ duyệt'}</strong></p>{isActive && currentSubscription.end_date && <p className="mt-1 text-xs">Hiệu lực đến {new Date(currentSubscription.end_date).toLocaleDateString('vi-VN')}</p>}{isActive && <div className="mt-4 border-t border-emerald-200 pt-4"><p className="text-xs text-emerald-800">Hoàn tiền 100% trong 365 ngày kể từ ngày nâng cấp gói.</p><button onClick={() => setRefundOpen(true)} className="mt-2 rounded-lg border border-emerald-400 px-3 py-2 text-xs font-semibold text-emerald-800">Yêu cầu hoàn tiền</button></div>}</section>}
    {packages.length === 0 ? <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 sm:p-6"><p className="font-semibold">Chưa có gói dịch vụ mở bán.</p><p className="mt-1">Super admin cần tạo và công khai ít nhất một gói trước khi shop có thể gửi yêu cầu thanh toán.</p></section> : <div className="grid gap-4 sm:gap-6 md:grid-cols-3">{packages.map((item) => { const current = isActive && currentSubscription?.package_id === item.id; return <article key={item.id} className="flex min-h-[320px] flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:min-h-[340px] sm:p-6"><h2 className="text-center text-lg font-bold">{item.name}</h2><p className="mt-3 text-center text-3xl font-bold text-[#D4AF37]">{item.price.toLocaleString('vi-VN')}đ</p><p className="text-center text-xs text-gray-500">/{item.duration_days} ngày</p><div className="mt-6 flex-1 border-t pt-4 text-sm"><p className="mb-2 flex items-center gap-1 text-xs uppercase text-gray-500"><Info size={12} />Quyền lợi</p>{(item.features ?? []).map((feature) => <p key={feature} className="mb-2 flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#B8860B]" />{feature}</p>)}<p className="mt-3 text-xs text-gray-500">Tối đa {item.limits?.max_offers ?? 0} ưu đãi</p></div><button disabled={current} onClick={() => setSelectedPackage(item)} className="mt-6 min-h-11 rounded-xl bg-[#1A1A1A] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500">{current ? 'Đang sử dụng' : 'Chọn gói này'}</button></article> })}</div>}
    {selectedPackage && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6"><h2 className="text-center text-xl font-bold">Thanh toán chuyển khoản</h2><p className="mt-2 text-center text-xs text-zinc-500">Hoàn tiền 100% trong 365 ngày từ khi gói được kích hoạt.</p><div className="mt-5 whitespace-pre-wrap rounded-xl border bg-gray-50 p-4 text-sm leading-7">{paymentInstructions || 'Thông tin chuyển khoản chưa được cấu hình. Vui lòng liên hệ quản trị viên.'}<p>Số tiền: <strong>{selectedPackage.price.toLocaleString('vi-VN')} VNĐ</strong></p><p>Nội dung: <strong>TT {profile?.slug} GOI {selectedPackage.name}</strong></p></div><label className="mt-5 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-6 text-sm text-gray-500">{uploading ? <Loader2 className="animate-spin" /> : <Upload />}<span className="mt-2">{uploading ? 'Đang tải lên...' : paymentInstructions.trim() ? 'Tải ảnh biên lai' : 'Chờ quản trị viên cấu hình thanh toán'}</span><input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading || !paymentInstructions.trim()} onChange={submitReceipt} /></label><button className="mt-4 w-full py-2 text-sm text-gray-600" onClick={() => setSelectedPackage(null)} disabled={uploading}>Hủy</button></div></div>}
    {refundOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6"><h2 className="text-xl font-bold">Yêu cầu hoàn tiền</h2><p className="mt-2 text-sm text-zinc-500">Chính sách: hoàn tiền 100% trong 365 ngày kể từ khi nâng cấp gói. Super admin sẽ xử lý thủ công.</p><textarea value={refundReason} onChange={(event) => setRefundReason(event.target.value)} rows={4} placeholder="Lý do yêu cầu hoàn tiền (không bắt buộc)" className="mt-5 w-full rounded-lg border p-3 text-sm" /><button disabled={requestingRefund} onClick={requestRefund} className="mt-4 w-full rounded-lg bg-[#2F2F2F] py-3 text-sm font-semibold text-white disabled:opacity-50">{requestingRefund ? 'Đang gửi…' : 'Gửi yêu cầu'}</button><button disabled={requestingRefund} onClick={() => setRefundOpen(false)} className="mt-3 w-full py-2 text-sm text-zinc-600">Hủy</button></div></div>}
  </div>
}
