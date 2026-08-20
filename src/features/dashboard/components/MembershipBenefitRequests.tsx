'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

type BenefitType = 'admin_blog' | 'facebook_post'
type Limits = {
  max_admin_blog_posts?: number
  facebook_post_count?: number
}
type BenefitRequest = { id: string; benefit_type: BenefitType; details: string; status: string; admin_note: string | null; requested_at: string; subscription_id: string }

const benefitDefinitions: { type: BenefitType; label: string; quota: (limits: Limits) => number; hint: string }[] = [
  { type: 'admin_blog', label: 'Bài blog do admin hỗ trợ', quota: (limits) => limits.max_admin_blog_posts ?? 0, hint: 'Gửi chủ đề, thông tin shop và nội dung cần hỗ trợ.' },
  { type: 'facebook_post', label: 'Bài đăng fanpage', quota: (limits) => limits.facebook_post_count ?? 0, hint: 'Gửi nội dung, ảnh và thời điểm mong muốn đăng.' },
]

export function MembershipBenefitRequests({ subscriptionId, limits }: { subscriptionId: string; limits: Limits | null | undefined }) {
  const [requests, setRequests] = useState<BenefitRequest[]>([])
  const [selected, setSelected] = useState<BenefitType | null>(null)
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const availableBenefits = useMemo(() => benefitDefinitions.filter((benefit) => benefit.quota(limits ?? {}) > 0), [limits])
  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/shop/benefit-requests', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Không thể tải quyền lợi')
      setRequests(result.requests ?? [])
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải quyền lợi')
    } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  const submit = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      const response = await fetch('/api/shop/benefit-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benefitType: selected, details }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Không thể gửi yêu cầu')
      toast.success('Đã gửi yêu cầu đến super admin.')
      setSelected(null); setDetails(''); await load()
    } catch (error: any) {
      toast.error(error.message || 'Không thể gửi yêu cầu')
    } finally { setSubmitting(false) }
  }

  if (availableBenefits.length === 0) return null
  const visibleRequests = requests.filter((request) => request.subscription_id === subscriptionId)
  return <section className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
    <h2 className="font-semibold text-violet-950">Quyền lợi cần super admin thực hiện</h2>
    <p className="mt-1 text-xs text-violet-800">Gửi yêu cầu tại đây; số lượt chỉ được tính khi yêu cầu không bị từ chối.</p>
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {availableBenefits.map((benefit) => {
        const used = visibleRequests.filter((request) => request.benefit_type === benefit.type && request.status !== 'rejected').length
        const remaining = Math.max(0, benefit.quota(limits ?? {}) - used)
        return <div key={benefit.type} className="rounded-xl border border-violet-200 bg-white p-4"><p className="font-medium text-sm">{benefit.label}</p><p className="mt-1 text-xs text-zinc-500">Còn {remaining}/{benefit.quota(limits ?? {})} lượt</p><button disabled={remaining === 0} onClick={() => setSelected(benefit.type)} className="mt-3 rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300">Gửi yêu cầu</button></div>
      })}
    </div>
    {loading ? <p className="mt-4 text-xs text-zinc-500">Đang tải lịch sử yêu cầu…</p> : visibleRequests.length > 0 && <div className="mt-5 space-y-2"><p className="text-xs font-semibold text-zinc-700">Lịch sử xử lý</p>{visibleRequests.map((request) => <div key={request.id} className="rounded-lg border border-violet-100 bg-white px-3 py-2 text-xs"><span className="font-medium">{benefitDefinitions.find((benefit) => benefit.type === request.benefit_type)?.label}</span> · <span>{request.status}</span>{request.admin_note && <p className="mt-1 text-zinc-500">Ghi chú admin: {request.admin_note}</p>}</div>)}</div>}
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6"><h3 className="font-semibold">{benefitDefinitions.find((benefit) => benefit.type === selected)?.label}</h3><p className="mt-2 text-xs text-zinc-500">{benefitDefinitions.find((benefit) => benefit.type === selected)?.hint}</p><textarea value={details} onChange={(event) => setDetails(event.target.value)} rows={5} className="mt-4 w-full rounded-lg border p-3 text-sm" placeholder="Thông tin cần super admin thực hiện" /><button disabled={submitting} onClick={submit} className="mt-4 w-full rounded-lg bg-violet-700 py-3 text-sm font-semibold text-white disabled:opacity-50">{submitting ? 'Đang gửi…' : 'Gửi yêu cầu'}</button><button disabled={submitting} onClick={() => setSelected(null)} className="mt-2 w-full py-2 text-sm text-zinc-600">Hủy</button></div></div>}
  </section>
}
