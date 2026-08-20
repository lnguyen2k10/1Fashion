/**
 * 1Fashion.asia - SYSTEM CONSTANTS
 *
 * RULE: NO hardcoded business categories here.
 * Categories are admin-managed via the `site_categories` table in Supabase.
 * Use `fetchCategories()` from @/lib/services/categories to get them.
 *
 * This file only contains UI/design constants not business-domain specific.
 */

// ─── Branding ────────────────────────────────────────────────────────────────
export const BRAND_NAME = '1Fashion'
export const BRAND_TAGLINE = 'Trung Tâm Thương Mại Thời Trang & Phụ Kiện'

// ─── Colors ──────────────────────────────────────────────────────────────────
export const BRAND_ACCENT_COLOR = '#D4AF37'    // Gold
export const DEFAULT_THEME_COLOR = '#D4AF37'   // Fallback cho shop chưa chọn màu

// ─── Template ────────────────────────────────────────────────────────────────
// Hệ thống chỉ có DUY NHẤT 1 template
export const DEFAULT_TEMPLATE_ID = 'MarketTemplate'

// ─── Default Shop Content (khi shop mới tạo, chưa chỉnh sửa gì) ─────────────
export const DEFAULT_SHOP_CONTENT = {
  hero_section: {
    hero_title: 'Bộ Sưu Tập Mới Nhất',
    hero_subtitle: 'Khám phá phong cách của bạn tại đây',
    hero_slides: [
      { image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1920', title: '' },
      { image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1920', title: '' },
      { image_url: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1920', title: '' },
    ]
  },
  about_us: {
    section_title: 'Về Cửa Hàng',
    intro_text: 'Chúng tôi mang đến những sản phẩm thời trang chất lượng cao với phong cách đa dạng, phù hợp với mọi lứa tuổi và phong cách sống.',
  },
  services_menu: [
    {
      name: 'Đầm Maxi Trắng Thanh Lịch',
      price: '590.000đ',
      price_original: '850.000đ',
      img: 'https://images.unsplash.com/photo-1515347619253-081e1a5332f9?q=80&w=800',
      image_gallery: ['https://images.unsplash.com/photo-1515347619253-081e1a5332f9?q=80&w=800', 'https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=800'],
      category: 'Váy Đầm',
      desc: 'Đầm maxi lụa tơ tằm cao cấp, thiết kế cổ chữ V tôn dáng. Chất liệu thoáng mát, phù hợp đi biển, dạo phố hoặc đi tiệc nhẹ. Freesize phù hợp cho mọi vóc dáng.',
      is_featured: true
    },
    {
      name: 'Áo Sơ Mi Nữ Công Sở Lụa Tơ Tằm',
      price: '350.000đ',
      img: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?q=80&w=800',
      category: 'Áo Sơ Mi',
      desc: 'Áo sơ mi lụa mềm mại, chống nhăn hiệu quả. Phù hợp cho môi trường công sở thanh lịch. Màu trắng basic cực dễ phối đồ với chân váy hoặc quần tây.',
      is_featured: false
    },
    {
      name: 'Túi Xách Da Đeo Chéo Nữ Cổ Điển',
      price: '790.000đ',
      price_original: '1.200.000đ',
      img: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800',
      category: 'Phụ Kiện',
      desc: 'Túi xách da PU cao cấp phong cách retro cổ điển. Ngăn chứa rộng rãi có thể đựng điện thoại, ví tiền và đồ trang điểm cơ bản. Dây đeo có thể điều chỉnh độ dài.',
      is_featured: true
    },
    {
      name: 'Chân Váy Chữ A Xếp Ly Dáng Dài',
      price: '280.000đ',
      price_original: '350.000đ',
      img: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800',
      category: 'Chân Váy',
      desc: 'Chân váy chữ A dáng dài, xếp ly tỉ mỉ giúp che khuyết điểm hoàn hảo. Có lớp lót lụa mềm mại bên trong không sợ lộ. Mix cùng sơ mi hoặc áo phông đều rất xinh.',
      is_featured: false
    },
    {
      name: 'Giày Cao Gót Mũi Nhọn Tôn Dáng',
      price: '420.000đ',
      img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800',
      image_gallery: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800'],
      category: 'Giày Dép',
      desc: 'Giày cao gót 7cm thiết kế mũi nhọn thanh lịch. Chất da lộn mềm mại, đế lót êm ái chống đau chân khi mang cả ngày. Màu đỏ rượu quyến rũ nổi bật.',
      is_featured: false
    },
    {
      name: 'Kính Râm Thời Trang Mắt Mèo',
      price: '190.000đ',
      price_original: '300.000đ',
      img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800',
      category: 'Phụ Kiện',
      desc: 'Kính mát mắt mèo phong cách sành điệu. Tròng kính Polarized chống tia UV400 tuyệt đối, bảo vệ đôi mắt khỏi ánh nắng mặt trời.',
      is_featured: true
    }
  ],
  gallery: [],
  contact_info: {
    address_full: '',
    hotline: '',
    email: '',
    website: '',
    social_links: []
  },
  cta_banner: {
    title: 'Liên Hệ Với Chúng Tôi',
    subtitle: 'Chúng tôi luôn sẵn sàng hỗ trợ bạn',
    cta_label: 'Nhắn Zalo Ngay',
    cta_phone: ''
  }
}

// ─── Social Platforms ────────────────────────────────────────────────────────
export const SOCIAL_PLATFORMS = [
  { id: 'facebook',  label: 'Facebook',  icon: 'facebook',  color: '#1877F2', placeholder: 'https://facebook.com/shopname' },
  { id: 'tiktok',    label: 'TikTok',    icon: 'tiktok',    color: '#000000', placeholder: 'https://tiktok.com/@shopname' },
  { id: 'instagram', label: 'Instagram', icon: 'instagram', color: '#E1306C', placeholder: 'https://instagram.com/shopname' },
  { id: 'youtube',   label: 'YouTube',   icon: 'youtube',   color: '#FF0000', placeholder: 'https://youtube.com/@shopname' },
  { id: 'zalo',      label: 'Zalo',      icon: 'zalo',      color: '#0068FF', placeholder: 'https://zalo.me/shopphone' },
  { id: 'website',   label: 'Website',   icon: 'globe',     color: '#374151', placeholder: 'https://yourshop.com' },
] as const

// ─── Operating Hours ─────────────────────────────────────────────────────────
export const DAYS_OF_WEEK = [
  { value: 1, label: 'Thứ Hai' },
  { value: 2, label: 'Thứ Ba' },
  { value: 3, label: 'Thứ Tư' },
  { value: 4, label: 'Thứ Năm' },
  { value: 5, label: 'Thứ Sáu' },
  { value: 6, label: 'Thứ Bảy' },
  { value: 0, label: 'Chủ Nhật' },
]

// ─── Vietnamese Districts ────────────────────────────────────────────────────
// GEO data (không phải business domain), an toàn để hardcode
export const VN_DISTRICTS_HCMC = [
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7',
  'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
  'Bình Thạnh', 'Bình Tân', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Tân Phú',
  'Thủ Đức', 'Bình Chánh', 'Cần Giờ', 'Củ Chi', 'Hóc Môn', 'Nhà Bè',
]

export const VN_DISTRICTS_HN = [
  'Ba Đình', 'Hoàn Kiếm', 'Đống Đa', 'Hai Bà Trưng', 'Hoàng Mai',
  'Cầu Giấy', 'Thanh Xuân', 'Nam Từ Liêm', 'Bắc Từ Liêm',
]

export const VN_DISTRICTS_DN = [
  'Hải Châu', 'Sơn Trà', 'Ngũ Hành Sơn', 'Thanh Khê', 'Liên Chiểu',
]

export const ALL_DISTRICTS = [
  'Tất cả',
  ...VN_DISTRICTS_HCMC,
]

export const VN_CITIES = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
]
