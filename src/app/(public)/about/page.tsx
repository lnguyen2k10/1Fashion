'use client'

import React from 'react'
import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import { Store, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2, Search, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function AboutPage() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-[#D4AF37] selection:text-black font-sans pb-32">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#111] to-[#0a0a0a] z-10" />
          <Image
            src="/images/about-hero.png"
            alt="1Fashion Hero"
            fill
            className="object-cover opacity-60 blur-[1px]"
            priority
          />
        </motion.div>

        <div className="relative z-20 container mx-auto px-6 max-w-5xl text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
            <motion.div variants={fadeInUp} className="inline-block">
              <span className="px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
                Dành Cho Doanh Nghiệp
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-playfair font-black tracking-tight text-white leading-[1.1]">
              Đưa shop của bạn đến gần hơn với khách hàng
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto font-light leading-relaxed">
              <b className="text-white font-medium">1Fashion.asia</b> là nền tảng khám phá Thời trang & Phụ kiện, giúp khách hàng tìm kiếm shop, thương hiệu, sản phẩm và địa điểm mua sắm phù hợp — đồng thời giúp các shop xây dựng hiện diện trực tuyến chuyên nghiệp.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="pt-8 flex flex-col items-center">
              <p className="text-[#D4AF37] font-medium mb-6">Shop của bạn đã có thể xuất hiện trên 1Fashion.</p>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-[#F5E0A3] hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(212,175,55,0.3)]"
              >
                Nhận Quyền Quản Lý Shop
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50 z-20">
          <ChevronDown size={32} strokeWidth={1} />
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-24 relative z-20 bg-[#0a0a0a]">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-white">
              Khách hàng đang tìm kiếm shop của bạn ở đâu?
            </h2>
            <div className="text-zinc-400 text-lg space-y-6 leading-relaxed">
              <p>Ngày nay, khách hàng có thể tìm kiếm một sản phẩm trên rất nhiều nơi. Nhưng thông tin về các shop thường nằm rải rác: Google Maps, Facebook, Instagram, Website riêng, TikTok, hay các hội nhóm.</p>
              <p>Điều đó khiến khách hàng khó có một nơi thuận tiện để <strong className="text-white font-medium">khám phá, xem thông tin và tìm đến những shop phù hợp.</strong></p>
            </div>
            
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm mt-12 shadow-2xl">
              <h3 className="text-[#D4AF37] text-xl font-bold mb-4 uppercase tracking-wider">1Fashion được xây dựng để làm điều đó</h3>
              <p className="text-zinc-300 text-lg">Một nền tảng tập trung cho:</p>
              <p className="text-white font-playfair font-bold text-2xl mt-4 tracking-wide">
                Thời trang • Phụ kiện • Shop • Thương hiệu • Sản phẩm
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-[#111]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-playfair font-black text-white mb-6">
              1Fashion mang lại gì cho SHOP?
            </h2>
          </div>

          <div className="space-y-32">
            {/* Feature 1 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
              <div className="md:w-1/2 space-y-6">
                <div className="text-[#D4AF37] font-mono text-xl font-bold">01</div>
                <h3 className="text-3xl font-playfair font-bold text-white">Một trang giới thiệu chuyên nghiệp</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Mỗi shop có một <strong className="text-white">trang riêng trên 1Fashion</strong>, được thiết kế để khách hàng có thể nhanh chóng biết shop bán gì, xem hình ảnh, sản phẩm, thông tin liên hệ và địa chỉ. Thay vì chỉ có một cái tên trong danh sách, shop có một không gian giới thiệu riêng.
                </p>
              </div>
              <div className="md:w-1/2 w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 p-8 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Store size={80} className="text-zinc-700 group-hover:text-[#D4AF37] transition-colors duration-500" strokeWidth={1} />
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
              <div className="md:w-1/2 space-y-6">
                <div className="text-[#D4AF37] font-mono text-xl font-bold">02</div>
                <h3 className="text-3xl font-playfair font-bold text-white">Khám phá và tìm thấy shop</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  1Fashion tập trung vào nhu cầu của người mua. Điều này tạo ra một môi trường mà shop có cơ hội xuất hiện trước những người đang chủ động tìm kiếm thời trang và phụ kiện.
                </p>
                <blockquote className="border-l-4 border-[#D4AF37] pl-6 py-2 text-zinc-300 italic font-playfair text-xl">
                  "Chúng tôi không chỉ đưa shop lên một danh bạ. Chúng tôi đang xây dựng một nơi để khách hàng khám phá các shop thời trang."
                </blockquote>
              </div>
              <div className="md:w-1/2 w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 p-8 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Search size={80} className="text-zinc-700 group-hover:text-[#D4AF37] transition-colors duration-500" strokeWidth={1} />
              </div>
            </motion.div>

            {/* Feature 3 & 4 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="grid md:grid-cols-2 gap-12">
              <div className="bg-zinc-900/50 border border-zinc-800/50 p-10 rounded-3xl space-y-6 hover:border-[#D4AF37]/30 transition-colors duration-500">
                <div className="text-[#D4AF37] font-mono text-xl font-bold">03 & 04</div>
                <h3 className="text-2xl font-playfair font-bold text-white">Giới thiệu sản phẩm & Kết nối trực tiếp</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Shop có thể giới thiệu các dòng sản phẩm ngay trên trang. Khách hàng có thể <strong>Xem → Quan tâm → Liên hệ shop → Mua hàng</strong> qua Điện thoại, Zalo, Website, Facebook, Instagram...
                </p>
                <div className="inline-block px-4 py-2 bg-white/5 text-[#D4AF37] rounded-lg font-medium border border-white/10">
                  1Fashion KHÔNG thu hoa hồng trên giao dịch.
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/50 p-10 rounded-3xl space-y-6 hover:border-[#D4AF37]/30 transition-colors duration-500">
                <div className="text-[#D4AF37] font-mono text-xl font-bold">05</div>
                <h3 className="text-2xl font-playfair font-bold text-white">Tự quản lý thông tin của mình</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Sau khi nhận quyền quản lý, chủ shop có thể cập nhật mọi thông tin: Hình ảnh, Sản phẩm, Liên hệ, Mạng xã hội, Nội dung giới thiệu...
                </p>
                <p className="text-white font-medium">Thông tin càng đầy đủ → khách hàng càng dễ hiểu về shop.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRICING & MEMBERSHIP */}
      <section className="py-24 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#1a1500] to-[#0a0a0a] opacity-50 z-0" />
        
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center space-y-6 mb-16">
            <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-[#D4AF37]">Chương trình thành viên ban đầu</h2>
            <h3 className="text-4xl md:text-6xl font-playfair font-black text-white">
              Chỉ dành cho 100 doanh nghiệp đầu tiên
            </h3>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Không chỉ dành cho hôm nay. Tham gia sớm giúp shop của bạn trở thành một trong những thành viên đầu tiên của nền tảng với mức chi phí ưu đãi vĩnh viễn.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-4xl mx-auto bg-gradient-to-b from-zinc-900 to-black border border-[#D4AF37]/30 rounded-[3rem] p-8 md:p-16 shadow-[0_0_80px_rgba(212,175,55,0.1)]">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              
              {/* Left Pricing */}
              <div className="lg:w-2/5 text-center lg:text-left space-y-6">
                <div className="inline-block bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-full text-sm font-bold tracking-widest uppercase border border-[#D4AF37]/20 mb-4">
                  Gói Premium Tiêu Chuẩn
                </div>
                <div className="space-y-2">
                  <div className="text-zinc-500 line-through text-2xl font-mono">499.000đ / NĂM</div>
                  <div className="text-5xl md:text-6xl font-black text-white tracking-tight flex items-baseline justify-center lg:justify-start gap-1">
                    299K<span className="text-2xl text-zinc-400 font-normal">/năm</span>
                  </div>
                  <p className="text-[#D4AF37] font-medium pt-2">≈ 24.900đ / tháng</p>
                </div>
                <div className="pt-8 hidden lg:block">
                  <Link 
                    href="/login" 
                    className="flex items-center justify-center gap-2 w-full bg-white text-black px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-all duration-300"
                  >
                    Nhận Quản Lý Ngay
                  </Link>
                </div>
              </div>

              {/* Right Features */}
              <div className="lg:w-3/5 w-full">
                <h4 className="text-xl font-playfair font-bold text-white mb-6">Thành viên ban đầu nhận được gì?</h4>
                <ul className="space-y-4">
                  {[
                    "Trang giới thiệu shop trên 1Fashion",
                    "Quyền nhận và quản lý trang của shop",
                    "Giới thiệu thông tin doanh nghiệp & sản phẩm",
                    "Thông tin liên hệ trực tiếp, link website & MXH",
                    "KHÔNG thu hoa hồng bán hàng",
                    "KHÔNG phí đăng ký & thiết lập",
                    "KHÔNG phí ẩn hay phát sinh chi phí ngoài gói"
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
                      <span className="text-zinc-300">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-12 lg:hidden">
              <Link 
                href="/login" 
                className="flex items-center justify-center gap-2 w-full bg-[#D4AF37] text-black px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-white transition-all duration-300"
              >
                Nhận Quản Lý Ngay
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* GUARANTEE SECTION */}
      <section className="py-24 bg-zinc-950 relative overflow-hidden">
        <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/10 blur-[100px] rounded-full z-0" />
        
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center space-y-8">
            <ShieldCheck size={64} className="text-[#D4AF37] mx-auto" strokeWidth={1} />
            <h2 className="text-3xl md:text-5xl font-playfair font-black text-white uppercase tracking-wide">
              Cam kết hoàn 100% phí
            </h2>
            <h3 className="text-xl text-[#D4AF37] font-medium">Yên tâm tham gia — không phù hợp, chúng tôi hoàn lại phí</h3>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12 text-left space-y-6">
              <p className="text-zinc-300 text-lg leading-relaxed">
                Chúng tôi hiểu rằng: <strong className="text-white">299.000đ cũng là một khoản chi phí mà chủ shop cần cân nhắc.</strong> Vì vậy, đối với thành viên ban đầu, 1Fashion đưa ra cam kết:
              </p>
              <div className="border-l-4 border-[#D4AF37] pl-6 py-2 bg-zinc-800/30 rounded-r-xl">
                <p className="text-white font-medium text-lg">
                  Nếu trong vòng 12 tháng bạn cảm thấy việc tham gia 1Fashion không phù hợp với shop của mình, bạn có thể yêu cầu hoàn lại 100% phí thành viên đã thanh toán.
                </p>
              </div>
              <p className="text-zinc-400 font-mono tracking-widest uppercase text-sm">
                Không phí ẩn. Không phí hủy. Không điều khoản phát sinh bất ngờ.
              </p>
              <p className="text-zinc-500 italic text-sm mt-4">
                *Bạn tham gia vì tin tưởng chúng tôi. Chúng tôi muốn dùng chính cam kết của mình để xây dựng sự tin tưởng đó.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* REALITY CHECK */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-white leading-tight">
                1Fashion không hứa những điều không thể kiểm soát
              </h2>
              <p className="text-zinc-400 text-lg">Chúng tôi <strong>không cam kết</strong>:</p>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-center gap-3"><span className="text-red-500 font-bold text-xl">✕</span> "Bạn chắc chắn sẽ có X khách hàng."</li>
                <li className="flex items-center gap-3"><span className="text-red-500 font-bold text-xl">✕</span> "Bạn chắc chắn bán được X đơn hàng."</li>
                <li className="flex items-center gap-3"><span className="text-red-500 font-bold text-xl">✕</span> "Bạn sẽ đứng số 1 Google."</li>
              </ul>
              <p className="text-zinc-500 italic">Bởi vì những điều đó phụ thuộc vào thị trường và hành vi người dùng.</p>
            </div>
            
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-10 rounded-3xl space-y-6">
              <h3 className="text-2xl font-playfair font-bold text-[#D4AF37]">Điều chúng tôi cam kết là:</h3>
              <p className="text-zinc-200 text-lg leading-relaxed">
                Cung cấp cho shop một trang hiện diện chuyên nghiệp trên 1Fashion, giúp khách hàng dễ dàng khám phá thông tin và kết nối trực tiếp với shop.
              </p>
              <div className="h-px w-full bg-[#D4AF37]/20" />
              <p className="text-white font-bold">
                100% phí thành viên được hoàn lại trong vòng 1 năm theo chính sách cam kết của chương trình.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CUSTOMER PERSPECTIVE */}
      <section className="py-24 bg-[#111]">
        <div className="container mx-auto px-6 max-w-4xl text-center space-y-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-4">
            <h2 className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">Ai đang tìm kiếm shop</h2>
            <h3 className="text-3xl md:text-5xl font-playfair font-bold text-white">Còn khách hàng thì sao?</h3>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-3xl">
            <p className="text-xl text-zinc-300 font-playfair italic mb-8">
              "Khi khách hàng muốn tìm một shop thời trang, hãy để họ có một nơi để bắt đầu."
            </p>
            <div className="flex flex-col gap-4 text-left max-w-lg mx-auto">
              <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 text-zinc-200">“Shop thời trang nữ ở TP.HCM”</div>
              <ArrowRight size={20} className="text-[#D4AF37] mx-auto rotate-90" />
              <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 text-zinc-200">“Local brand nào phù hợp với tôi?”</div>
              <ArrowRight size={20} className="text-[#D4AF37] mx-auto rotate-90" />
              <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 text-zinc-200">“Tôi muốn xem sản phẩm của shop này.”</div>
            </div>
            <p className="text-[#D4AF37] font-medium mt-10 text-lg">
              1Fashion hướng tới việc biến những nhu cầu tìm kiếm đó thành những kết nối thực tế giữa khách hàng và shop.
            </p>
          </motion.div>
        </div>
      </section>

      {/* STEPS TO CLAIM */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-playfair font-black text-white mb-6">
              Shop của bạn đã có trên 1Fashion?
            </h2>
            <p className="text-zinc-400 text-lg">Nếu chúng tôi đã tạo trang giới thiệu cho shop của bạn, bạn có thể làm theo 5 bước:</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {[
              "Kiểm tra thông tin",
              "Nhận quyền quản lý",
              "Cập nhật thông tin",
              "Bổ sung sản phẩm",
              "Bắt đầu giới thiệu"
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center flex flex-col items-center justify-center gap-4 hover:border-[#D4AF37]/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center font-bold font-mono">
                  {idx + 1}
                </div>
                <span className="text-sm font-medium text-white">{step}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-[#111]">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-white mb-4">
              Câu hỏi thường gặp
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              { q: "1. 1Fashion có bán hàng thay shop không?", a: "Không. 1Fashion tập trung giúp khách hàng khám phá shop và sản phẩm, sau đó kết nối trực tiếp với shop." },
              { q: "2. 1Fashion có thu hoa hồng không?", a: "Không. Gói thành viên không tính hoa hồng trên giao dịch." },
              { q: "3. Tôi có phải xây website riêng không?", a: "Không. Shop có trang giới thiệu riêng trên 1Fashion." },
              { q: "4. Tôi có thể tự cập nhật thông tin không?", a: "Có, sau khi nhận quyền quản lý tài khoản/shop theo các tính năng được cung cấp." },
              { q: "5. 299.000đ có phải phí duy nhất không?", a: "Đối với chương trình thành viên ban đầu, không có phí ẩn hoặc chi phí bắt buộc khác ngoài phí thành viên được công bố." },
              { q: "6. Nếu tôi không thấy phù hợp thì sao?", a: "Thành viên ban đầu được áp dụng cam kết hoàn 100% phí trong vòng 1 năm, theo chính sách hoàn tiền của chương trình." },
            ].map((faq, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50"
              >
                <h4 className="text-white font-bold text-lg mb-2">{faq.q}</h4>
                <p className="text-zinc-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 relative border-t border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent opacity-50 z-0" />
        
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-8">
            <h2 className="text-5xl md:text-7xl font-playfair font-black text-white mb-6">
              Khám phá. Kết nối. Mua sắm.
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium text-zinc-400 max-w-2xl mx-auto mb-12">
              <div className="bg-zinc-900 py-3 rounded-lg border border-zinc-800">Không xây web mới</div>
              <div className="bg-zinc-900 py-3 rounded-lg border border-zinc-800">Không hoa hồng</div>
              <div className="bg-zinc-900 py-3 rounded-lg border border-zinc-800">Không ép doanh số</div>
              <div className="bg-[#D4AF37]/10 text-[#D4AF37] py-3 rounded-lg border border-[#D4AF37]/30 font-bold">299k/năm</div>
            </div>

            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-10 py-5 rounded-full text-lg font-bold uppercase tracking-wider hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_50px_rgba(212,175,55,0.4)]"
            >
              Kiểm Tra & Nhận Quyền Quản Lý Shop
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

    </main>
  )
}
