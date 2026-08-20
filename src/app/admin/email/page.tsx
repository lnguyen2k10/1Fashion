import { CheckCircle2, Mail, TriangleAlert } from 'lucide-react'

export default function EmailServicePage() {
  const configured = Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL)
  return <main className="max-w-4xl space-y-8"><header><h1 className="text-2xl font-bold text-[#2F2F2F]">Email giao dịch</h1><p className="mt-1 text-sm text-zinc-500">Trạng thái cấu hình gửi email của hệ thống.</p></header>
    <section className={`rounded-2xl border p-6 ${configured ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><div className="flex items-start gap-3">{configured ? <CheckCircle2 className="mt-0.5 text-emerald-600" /> : <TriangleAlert className="mt-0.5 text-amber-600" />}<div><h2 className="font-semibold">{configured ? 'Resend đã được cấu hình' : 'Chưa cấu hình gửi email'}</h2><p className="mt-2 text-sm">{configured ? 'Máy chủ có đủ RESEND_API_KEY và FROM_EMAIL để gửi email giao dịch.' : 'Để bật gửi email, cấu hình RESEND_API_KEY và FROM_EMAIL ở môi trường deploy. Hệ thống không hiển thị hoặc lưu secret trong trang admin.'}</p></div></div></section>
    <section className="rounded-2xl border bg-white p-6"><div className="flex items-center gap-2"><Mail size={18} /><h2 className="font-semibold">Thông báo hiện có</h2></div><p className="mt-3 text-sm text-zinc-600">Yêu cầu thanh toán, hoàn tiền và quyền lợi hiện được ghi vào notification trong ứng dụng. Email chỉ được coi là sẵn sàng sau khi cấu hình Resend; không có template nào được hiển thị là “đang hoạt động” khi chưa có luồng gửi thực tế.</p></section>
  </main>
}
