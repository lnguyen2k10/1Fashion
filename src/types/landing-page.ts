// ============================================================================
// 1Fashion.asia - Landing Page Type Definitions (v3 - Fashion/Shopping)
// Không hardcode category - lấy từ DB qua site_categories table
// ============================================================================

export interface LandingPageData {
  // ─── Hero Slides ─────────────────────────────────────────────────────────
  hero_section?: {
    hero_title?: string
    hero_subtitle?: string
    hero_slides?: HeroSlide[]       // Mảng slides (tối đa 3)
  }

  // ─── Giới thiệu Shop ────────────────────────────────────────────────────
  about_us?: {
    section_title?: string
    intro_text?: string
    about_image_1?: string
    about_image_2?: string
  }

  // ─── Sản phẩm nổi bật ───────────────────────────────────────────────────
  // Key "services_menu" giữ nguyên trong DB để backward-compat với data cũ
  // Hiển thị với label "Sản Phẩm" trên UI
  services_menu?: ProductItem[]

  // ─── Lookbook / Gallery ─────────────────────────────────────────────────
  gallery?: GalleryItem[]
  gallery_section?: SectionHeader

  // ─── Ưu đãi / Khuyến mãi ────────────────────────────────────────────────
  offers_list?: {
    title?: string
    subtitle?: string
  }

  // ─── Testimonials ────────────────────────────────────────────────────────
  social_trust?: {
    rating_count?: number
    rating_score?: number
    testimonials?: Testimonial[]
  }

  // ─── Thông tin Liên hệ + Bản đồ ─────────────────────────────────────────
  contact_info?: ContactInfo

  // ─── Section Header customization ───────────────────────────────────────
  services_section?: SectionHeader      // Tiêu đề section Sản Phẩm
  testimonials_section?: SectionHeader

  // ─── CTA Banner ──────────────────────────────────────────────────────────
  cta_banner?: {
    title?: string
    subtitle?: string
    cta_label?: string
    cta_phone?: string
  }

  // ─── Nội dung tự do ──────────────────────────────────────────────────────
  custom_text?: {
    title?: string
    body?: string
  }

  // ─── Theme ───────────────────────────────────────────────────────────────
  theme_color?: string   // Override from business_profiles.theme_color

  // ─── Metadata quản trị ───────────────────────────────────────────────────
  metadata?: {
    priority?: string
    selection_rank?: number | string
    prospect_score?: number | string
    neighborhood?: string
    claim_this_business?: boolean | string
    search_string?: string
    google_rank?: number | string
    scraped_at?: string
    [key: string]: any
  }
}

// ─── Hero Slide ─────────────────────────────────────────────────────────────
export interface HeroSlide {
  image_url: string
  title?: string        // Text hiển thị trên slide (optional)
  subtitle?: string
}

// ─── Product Item ────────────────────────────────────────────────────────────
// "price" là text, không phải số: "490.000đ", "Liên hệ", "200k - 500k"
export interface ProductItem {
  id?: string           // shop_products.id nếu sync từ DB
  name: string
  desc?: string
  price: string
  price_original?: string   // Giá gốc (hiển thị gạch ngang)
  img: string
  category?: string         // Sub-category: "Áo", "Giày", "Túi"...
  tags?: string[]
  is_featured?: boolean
  image_gallery?: string[]  // Mảng URL các ảnh phụ
}

// ─── Gallery ────────────────────────────────────────────────────────────────
export interface GalleryItem {
  url: string
  caption?: string
}

// ─── Testimonial ─────────────────────────────────────────────────────────────
export interface Testimonial {
  name: string
  role?: string
  text: string
  avatar?: string
  rating?: number
}

// ─── Contact Info ─────────────────────────────────────────────────────────────
export interface ContactInfo {
  address_full?: string
  hotline?: string
  zalo?: string
  email?: string
  website?: string
  map_embed_url?: string   // Nếu dùng Google Maps embed (optional)
  google_maps_url?: string // Đường link chia sẻ Google Maps
  place_id?: string        // ID địa điểm của Google Maps
  operating_hours_text?: string   // text fallback nếu chưa có bảng operating_hours
  social_links?: SocialLink[]
}

// ─── Social Link ──────────────────────────────────────────────────────────────
export interface SocialLink {
  platform: 'facebook' | 'tiktok' | 'instagram' | 'youtube' | 'zalo' | 'website' | string
  url: string
  label?: string
}

// ─── Section Header ──────────────────────────────────────────────────────────
export interface SectionHeader {
  title: string
  subtitle?: string
}

// ─── Site Category (từ DB site_categories) ───────────────────────────────────
export interface SiteCategory {
  name: string
  slug: string
  icon: string
  color: string
  description?: string
}

// ─── Operating Hours (từ DB operating_hours) ─────────────────────────────────
export interface OperatingHoursEntry {
  day_of_week: number   // 0=CN, 1=T2, ..., 6=T7
  open_time: string     // "08:00"
  close_time: string    // "22:00"
  is_closed: boolean
}

// ─── Shop từ active_landing_pages view ───────────────────────────────────────
export interface ShopListing {
  id: string
  landing_page_id: string
  business_id: string
  template_id: string
  content_json: LandingPageData
  is_published: boolean
  page_status: string
  updated_at: string
  account_id: string
  business_name: string
  business_slug: string
  category: string
  theme_color: string
  zalo_phone?: string
  hotline?: string
  logo_url?: string
  is_verified: boolean
  rating_score: number
  location_city: string
  location_district: string
  social_links: SocialLink[]
  lat?: number
  lng?: number
  address_full?: string
  subscription_status: string
  expiry_date: string
  email_owner: string
}
