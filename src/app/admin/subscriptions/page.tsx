'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type Subscription = { id: string; status: string; verified: boolean; proof_image_url: string | null; created_at: string; business_profiles?: { business_name: string } | null; packages?: { name: string; price: number; duration_days: number } | null }
type Refund = { id: string; status: 'pending' | 'approved' | 'rejected' | 'refunded'; reason: string | null; requested_at: string; business_profiles?: { business_name: string } | null; subscriptions?: { packages?: { name: string } | null } | null }

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const load = async () => {
    setLoading(true)
    try {
      const [subscriptionsResponse, refundsResponse] = await Promise.all([fetch('/api/admin/subscriptions', { cache: 'no-store' }), fetch('/api/admin/refunds', { cache: 'no-store' })])
      const [subscriptionResult, refundResult] = await Promise.all([subscriptionsResponse.json(), refundsResponse.json()])
      if (!subscriptionsResponse.ok) throw new Error(subscriptionResult.error || 'Không thể tải thanh toán')
      setSubscriptions(subscriptionResult.subscriptions || [])
      if (refundsResponse.ok) setRefunds(refundResult.requests || [])
    } catch (error: any) { toast.error(error.message || 'Không thể tải dữ liệu') } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  const reviewSubscription = async (id: string, approve: boolean) => {
    setProcessingId(id)
    try { const response = await fetch('/api/admin/subscriptions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approve }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); toast.success(approve ? 'Đã kích hoạt gói.' : 'Đã từ chối.'); await load() } catch (error: any) { toast.error(error.message || 'Không thể xử lý') } finally { setProcessingId(null) }
  }
  const reviewRefund = async (id: string, status: Refund['status']) => {
    setProcessingId(id)
    try { const response = await fetch('/api/admin/refunds', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); toast.success(status === 'refunded' ? 'Đã ghi nhận hoàn tiền.' : 'Đã cập nhật yêu cầu.'); await load() } catch (error: any) { toast.error(error.message || 'Không thể xử lý') } finally { setProcessingId(null) }
  }
  return <main className="mx-auto max-w-6xl space-y-8 p-8"><header><h1 className="text-3xl font-bold text-[#2F2F2F]">Đối soát thành viên</h1><p className="mt-2 text-sm text-zinc-500">Duyệt thanh toán thủ công và yêu cầu hoàn tiền.</p></header><section className="overflow-x-auto rounded-2xl border bg-white"><h2 className="border-b p-4 font-semibold">Yêu cầu thanh toán</h2>{loading ? <p className="p-6 text-sm text-zinc-500">Đang tải…</p> : <table className="w-full text-left text-sm"><thead className="border-b bg-zinc-50 text-xs uppercase text-zinc-500"><tr><th className="p-4">Shop</th><th className="p-4">Gói</th><th className="p-4">Biên lai</th><th className="p-4">Trạng thái</th><th className="p-4 text-right">Xử lý</th></tr></thead><tbody>{subscriptions.map((item) => <tr key={item.id} className="border-b"><td className="p-4">{item.business_profiles?.business_name || '—'}</td><td className="p-4">{item.packages?.name || '—'}<div className="text-xs text-zinc-400">{item.packages?.price?.toLocaleString('vi-VN')}đ</div></td><td className="p-4">{item.proof_image_url ? <a href={item.proof_image_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Mở ảnh</a> : '—'}</td><td className="p-4">{item.status}</td><td className="p-4 text-right">{item.status === 'pending' && <><button disabled={processingId === item.id} onClick={() => reviewSubscription(item.id, true)} className="mr-2 rounded bg-emerald-600 px-3 py-2 text-xs text-white">Duyệt</button><button disabled={processingId === item.id} onClick={() => reviewSubscription(item.id, false)} className="rounded border border-rose-200 px-3 py-2 text-xs text-rose-700">Từ chối</button></>}</td></tr>)}</tbody></table>}</section><section className="overflow-x-auto rounded-2xl border bg-white"><div className="border-b p-4"><h2 className="font-semibold">Yêu cầu hoàn tiền</h2><p className="mt-1 text-xs text-zinc-500">Hoàn tiền 100% trong 365 ngày kể từ khi gói được kích hoạt.</p></div>{loading ? <p className="p-6 text-sm text-zinc-500">Đang tải…</p> : refunds.length === 0 ? <p className="p-6 text-sm text-zinc-500">Chưa có yêu cầu hoàn tiền.</p> : <table className="w-full text-left text-sm"><thead className="border-b bg-zinc-50 text-xs uppercase text-zinc-500"><tr><th className="p-4">Shop</th><th className="p-4">Lý do</th><th className="p-4">Trạng thái</th><th className="p-4 text-right">Xử lý</th></tr></thead><tbody>{refunds.map((item) => <tr key={item.id} className="border-b"><td className="p-4">{item.business_profiles?.business_name || '—'}</td><td className="p-4 text-xs text-zinc-600">{item.reason || 'Không nêu lý do'}</td><td className="p-4">{item.status}</td><td className="p-4 text-right">{item.status === 'pending' && <><button disabled={processingId === item.id} onClick={() => reviewRefund(item.id, 'approved')} className="mr-2 rounded bg-amber-500 px-3 py-2 text-xs text-white">Duyệt</button><button disabled={processingId === item.id} onClick={() => reviewRefund(item.id, 'rejected')} className="rounded border border-rose-200 px-3 py-2 text-xs text-rose-700">Từ chối</button></>}{item.status === 'approved' && <button disabled={processingId === item.id} onClick={() => reviewRefund(item.id, 'refunded')} className="rounded bg-emerald-600 px-3 py-2 text-xs text-white">Đã hoàn tiền</button>}</td></tr>)}</tbody></table>}</section></main>
}
