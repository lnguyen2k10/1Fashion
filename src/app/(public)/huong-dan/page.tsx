'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Lock, 
  Image as ImageIcon,
  Mail, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  CheckCircle,
  HelpCircle,
  UserCheck
} from 'lucide-react'

export default function ManualPage() {
  const steps = [
    {
      num: '01',
      title: 'Đăng nhập trang quản trị',
      icon: <Lock className="w-8 h-8 text-[#E0A96D]" />,
      desc: 'Sử dụng địa chỉ email và mật khẩu mặc định (ví dụ: Market123!) được bàn giao để đăng nhập hệ thống.',
      details: [
        'Truy cập đường dẫn quản trị tại: /login',
        'Điền chính xác Email chủ cơ sở và mật khẩu mặc định.',
        'Đổi mật khẩu bảo mật riêng của bạn ngay tại lần đăng nhập đầu tiên.'
      ]
    },
    {
      num: '02',
      title: 'Thay đổi ảnh & giá dịch vụ',
      icon: <ImageIcon className="w-8 h-8 text-[#E0A96D]" />,
      desc: 'Giao diện chỉnh sửa kéo-thả (Visual Editor) cho phép thay đổi hình ảnh và mô tả dịch vụ trực quan 100%.',
      details: [
        'Nhấn nút "Chỉnh sửa trực quan" tại góc trang chủ cá nhân của bạn.',
        'Rê chuột vào tiêu đề dịch vụ, bảng giá hoặc giới thiệu và nhập trực tiếp văn bản mới.',
        'Nhấn "Lưu thay đổi" tại thanh công cụ phía trên để áp dụng lập tức lên trang web.'
      ]
    },
    {
      num: '03',
      title: 'Nhận thông báo lịch hẹn',
      icon: <Mail className="w-8 h-8 text-[#E0A96D]" />,
      desc: 'Hệ thống tự động đồng bộ hóa toàn bộ lịch hẹn tư vấn mới về hòm thư điện tử và Zalo của bạn.',
      details: [
        'Khi khách hàng điền form, email thông báo tự động gửi về địa chỉ mail của bạn tức thì.',
        'Xem trực tiếp danh sách lịch hẹn đặt chỗ (Leads Tracker) trong trang quản trị Dashboard.',
        'Khách hàng bấm chat Zalo sẽ được kết nối thẳng với số điện thoại Zalo của bạn.'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#2C3E50] selection:bg-[#D4AF37]/20 selection:text-[#2C3E50] overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <header className="relative py-20 px-4 text-center overflow-hidden bg-white border-b border-[#D4AF37]/10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#FCFBF7]/50 to-white opacity-40" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#B8860B] px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase"
          >
            <Sparkles className="w-4 h-4" /> Tài liệu hướng dẫn bàn giao độc quyền
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-6xl text-[#2C3E50] leading-tight"
          >
            Khởi Động Trang <span className="text-[#D4AF37] italic">Landing Page</span> Của Bạn
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Chào mừng Quý đối tác đến với hệ thống 1Fashion. Chỉ với 3 bước đơn giản dưới đây, bạn đã làm chủ hoàn chỉnh trang danh bạ cao cấp của riêng mình để tiếp cận hàng triệu khách hàng mục tiêu.
          </motion.p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-24 h-24 border-l border-t border-[#D4AF37]/20 rounded-tl-2xl" />
        <div className="absolute bottom-10 right-10 w-24 h-24 border-r border-b border-[#D4AF37]/20 rounded-br-2xl" />
      </header>

      {/* THREE STEPS MANUAL */}
      <main className="max-w-6xl mx-auto py-20 px-4 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-[#D4AF37]/10 hover:shadow-xl hover:border-[#D4AF37]/30 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#FCFBF7] border border-[#D4AF37]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <span className="font-serif text-4xl text-[#D4AF37]/20 group-hover:text-[#D4AF37]/40 transition-colors font-bold">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="font-serif text-2xl text-[#2C3E50] group-hover:text-[#B8860B] transition-colors">
                    {step.title}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <hr className="border-[#D4AF37]/10" />

                <ul className="space-y-3 text-sm text-slate-600">
                  {step.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex gap-2 items-start">
                      <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] font-bold uppercase tracking-widest group-hover:gap-2.5 transition-all">
                  Chi tiết bước {step.num} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SUPPORT ACCORDION & DIRECTORY LINK */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white p-10 rounded-3xl border border-[#D4AF37]/15 max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl -z-10" />
          <div className="space-y-3 max-w-lg text-center md:text-left">
            <h3 className="font-serif text-3xl text-[#2C3E50]">Bạn cần hỗ trợ kỹ thuật thêm?</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Nếu bạn có thắc mắc về phương pháp ánh xạ tên miền riêng (Custom Domain) hoặc tích hợp thanh toán tự động, đội ngũ kỹ thuật của chúng tôi luôn trực tuyến hỗ trợ 24/7.
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
            <Link 
              href="/login"
              className="bg-[#D4AF37] text-white px-8 py-3.5 rounded-full text-center font-bold tracking-widest text-xs uppercase hover:bg-[#B8860B] transition-all shadow-md hover:scale-105"
            >
              Đăng nhập ngay
            </Link>
            <Link 
              href="/directory"
              className="border border-[#D4AF37]/40 text-[#B8860B] px-8 py-3.5 rounded-full text-center font-bold tracking-widest text-xs uppercase hover:bg-[#D4AF37]/5 transition-all"
            >
              Xem trang danh bạ
            </Link>
          </div>
        </motion.div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#2C3E50] text-[#FCFBF7] py-12 px-4 border-t border-[#D4AF37]/15">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#FCFBF7]/50 uppercase tracking-widest">
          <div>© 2026 1Fashion directory platform. Premium Experience.</div>
          <div className="flex gap-6">
            <Link href="/directory" className="hover:text-white transition-colors">Danh bạ</Link>
            <Link href="/login" className="hover:text-white transition-colors">Quản trị</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
