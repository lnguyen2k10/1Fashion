import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminAuditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle() : { data: null }
  if (profile?.role !== 'super_admin') return null

  const admin = createAdminClient()
  const [{ data: logs }, { data: outbox }] = await Promise.all([
    admin.from('admin_audit_logs').select('id, admin_id, action, target_type, created_at').order('created_at', { ascending: false }).limit(100),
    admin.from('email_outbox').select('id, template_key, recipient_email, status, attempt_count, error_message, created_at').order('created_at', { ascending: false }).limit(50),
  ])
  const actorIds = [...new Set((logs ?? []).map((item) => item.admin_id).filter((id): id is string => Boolean(id)))]
  const { data: actors } = actorIds.length ? await admin.from('profiles').select('id, email').in('id', actorIds) : { data: [] as { id: string; email: string }[] }
  const emails = new Map((actors ?? []).map((actor) => [actor.id, actor.email]))

  return <div className="space-y-8">
    <header><h1 className="text-2xl font-bold">Nhật ký vận hành</h1><p className="mt-1 text-sm text-zinc-500">100 thao tác quản trị và 50 email gần nhất. Nhật ký chỉ đọc để phục vụ truy vết.</p></header>
    <section className="overflow-x-auto rounded-2xl border bg-white"><h2 className="border-b p-5 font-semibold">Thao tác quản trị</h2><table className="w-full text-left text-sm"><thead className="bg-zinc-50 text-xs text-zinc-500"><tr><th className="p-3">Thời điểm</th><th className="p-3">Quản trị viên</th><th className="p-3">Thao tác</th><th className="p-3">Đối tượng</th></tr></thead><tbody>{(logs ?? []).map((item) => <tr key={item.id} className="border-t"><td className="p-3 text-zinc-500">{new Date(item.created_at).toLocaleString('vi-VN')}</td><td className="p-3">{emails.get(item.admin_id) || 'Hệ thống'}</td><td className="p-3 font-medium">{item.action}</td><td className="p-3 text-zinc-600">{item.target_type || '—'}</td></tr>)}{!logs?.length && <tr><td colSpan={4} className="p-6 text-center text-zinc-500">Chưa có thao tác nào.</td></tr>}</tbody></table></section>
    <section className="overflow-x-auto rounded-2xl border bg-white"><h2 className="border-b p-5 font-semibold">Hàng đợi email</h2><table className="w-full text-left text-sm"><thead className="bg-zinc-50 text-xs text-zinc-500"><tr><th className="p-3">Tạo lúc</th><th className="p-3">Loại</th><th className="p-3">Người nhận</th><th className="p-3">Trạng thái</th><th className="p-3">Lần gửi</th></tr></thead><tbody>{(outbox ?? []).map((item) => <tr key={item.id} className="border-t"><td className="p-3 text-zinc-500">{new Date(item.created_at).toLocaleString('vi-VN')}</td><td className="p-3">{item.template_key}</td><td className="p-3">{item.recipient_email}</td><td className="p-3"><span className={item.status === 'sent' ? 'text-emerald-700' : item.status === 'failed' ? 'text-red-700' : 'text-amber-700'}>{item.status}</span>{item.error_message && <div className="mt-1 max-w-xs truncate text-xs text-red-600">{item.error_message}</div>}</td><td className="p-3">{item.attempt_count}/3</td></tr>)}{!outbox?.length && <tr><td colSpan={5} className="p-6 text-center text-zinc-500">Chưa có email nào trong hàng đợi.</td></tr>}</tbody></table></section>
  </div>
}
