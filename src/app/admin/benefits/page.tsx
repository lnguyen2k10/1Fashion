'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type BenefitRequest = {
  id: string
  benefit_type: 'admin_blog' | 'facebook_post'
  details: string
  status: 'pending' | 'in_progress' | 'fulfilled' | 'rejected'
  admin_note: string | null
  business_profiles?: { business_name: string } | null
  subscriptions?: { packages?: { name: string } | null } | null
}

const labels = { admin_blog: 'Bài blog', facebook_post: 'Bài đăng fanpage' }

export default function AdminBenefitsPage() {
  const [requests, setRequests] = useState<BenefitRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const load = async () => {
    setLoading(true)
    try { const response = await fetch('/api/admin/benefit-requests', { cache: 'no-store' }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Không thể tải yêu cầu quyền lợi'); setRequests(result.requests ?? []) } catch (error: any) { toast.error(error.message || 'Không thể tải dữ liệu') } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  const update = async (id: string, status: 'in_progress' | 'fulfilled' | 'rejected') => {
    setProcessing(id)
    try { const response = await fetch('/api/admin/benefit-requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, adminNote: notes[id] || null }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Không thể cập nhật yêu cầu'); toast.success('Đã cập nhật yêu cầu.'); await load() } catch (error: any) { toast.error(error.message || 'Không thể cập nhật yêu cầu') } finally { setProcessing(null) }
  }
  return <main className="mx-auto max-w-6xl space-y-6"><header><h1 className="text-3xl font-bold text-[#2F2F2F]">Thực hiện quyền lợi thành viên</h1><p className="mt-2 text-sm text-zinc-500">Quản lý blog hỗ trợ, bài fanpage và các lượt nổi bật mà shop yêu cầu.</p></header><section className="overflow-x-auto rounded-2xl border bg-white">{loading ? <p className="p-6 text-sm text-zinc-500">Đang tải…</p> : requests.length === 0 ? <p className="p-6 text-sm text-zinc-500">Chưa có yêu cầu quyền lợi.</p> : <table className="w-full text-left text-sm"><thead className="border-b bg-zinc-50 text-xs uppercase text-zinc-500"><tr><th className="p-4">Shop</th><th className="p-4">Quyền lợi</th><th className="p-4">Yêu cầu</th><th className="p-4">Trạng thái</th><th className="p-4">Ghi chú</th><th className="p-4 text-right">Xử lý</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id} className="border-b align-top"><td className="p-4"><p className="font-medium">{request.business_profiles?.business_name || '—'}</p><p className="mt-1 text-xs text-zinc-400">{request.subscriptions?.packages?.name || '—'}</p></td><td className="p-4">{labels[request.benefit_type]}</td><td className="max-w-xs whitespace-pre-wrap p-4 text-xs text-zinc-600">{request.details || 'Không kèm nội dung'}</td><td className="p-4"><span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{request.status}</span></td><td className="p-4"><textarea value={notes[request.id] ?? request.admin_note ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} rows={2} className="w-48 rounded border p-2 text-xs" placeholder="Ghi chú gửi shop" /></td><td className="whitespace-nowrap p-4 text-right">{request.status === 'pending' && <button disabled={processing === request.id} onClick={() => update(request.id, 'in_progress')} className="mr-2 rounded bg-amber-500 px-3 py-2 text-xs text-white">Nhận xử lý</button>}{request.status === 'pending' && <button disabled={processing === request.id} onClick={() => update(request.id, 'rejected')} className="rounded border border-rose-200 px-3 py-2 text-xs text-rose-700">Từ chối</button>}{request.status === 'in_progress' && <button disabled={processing === request.id} onClick={() => update(request.id, 'fulfilled')} className="rounded bg-emerald-600 px-3 py-2 text-xs text-white">Đã hoàn thành</button>}</td></tr>)}</tbody></table>}</section></main>
}
