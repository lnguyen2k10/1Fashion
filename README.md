# 1Fashion — Tài Liệu Mô Tả Hệ Thống (Product Specification)
*Phiên bản: 1.0 — Ngày cập nhật: 14/08/2026*

---

## 1. Định nghĩa Sản phẩm

**1Fashion** là một **Online Shopping Mall** — một nền tảng trung tâm thương mại trực tuyến dạng **Danh bạ (Directory)** dành riêng cho ngành **Thời trang, Phụ kiện & Bán lẻ**.

Mục tiêu cốt lõi: **Giúp khách hàng TÌM KIẾM và KHÁM PHÁ các cửa hàng & sản phẩm, không phục vụ giao dịch mua bán trực tiếp trên nền tảng.** Việc mua bán được thực hiện qua kênh riêng của từng cửa hàng (Zalo, Fanpage, Website...).

---

## 2. Đối tượng Sử dụng

| Vai trò | Mô tả |
|---|---|
| **Khách vãng lai (Visitor)** | Tìm kiếm và khám phá shop, xem sản phẩm, tìm địa chỉ |
| **Chủ shop (Business Owner)** | Đăng ký tài khoản, được Admin kích hoạt, tự quản lý trang Landing Page của mình |
| **Quản trị viên (Super Admin)** | Kiểm soát toàn bộ hệ thống, duyệt shop, quản lý gói dịch vụ |

---

## 3. Luồng Vận hành Cốt lõi

### Luồng Chủ shop
```
Đăng ký tài khoản
  → Admin xem xét & kích hoạt gói thành viên (thủ công)
  → Chủ shop đăng nhập vào Dashboard
  → Chỉnh sửa Landing Page trực tiếp (Visual Editor)
  → Preview → Lưu → Công khai (Publish)
  → Khách hàng truy cập trang tại: /p/[slug]
```

### Luồng Khách hàng
```
Truy cập Trang chủ (/)
  → Tìm kiếm theo: Tên shop / Danh mục / Địa điểm
  → Xem danh sách shop trong /directory
  → Click vào shop → Landing Page đầy đủ tại /p/[slug]
  → Liên hệ shop qua Zalo / Fanpage / Điện thoại
```

---

## 4. Trang Chủ (Homepage `/`)

Giao diện sang trọng theo phong cách **Premium Fashion Mall**:

- **Hero Section**: Slideshow ảnh thời trang full-screen với hiệu ứng Ken Burns
- **Thanh tìm kiếm chính**: Search theo tên shop + chọn Địa điểm + chọn Danh mục
- **Icon Grid Danh mục**: Các icon danh mục sản phẩm dẫn đến `/directory?category=...`
- **Featured Shops (Cửa hàng nổi bật)**: Hiển thị các shop có is_verified = true
- **Featured Offers (Ưu đãi nổi bật)**: Tổng hợp các ưu đãi từ bảng `business_offers`
- **Trending / Blog Ribbon**: Các bài viết Admin tạo từ bảng `blogs`
- **Footer chuẩn**: Logo, mô tả, mạng xã hội của 1Fashion

---

## 5. Trang Danh bạ (Directory `/directory`)

Danh sách shop dạng lưới (grid), hỗ trợ lọc real-time:

- **Bộ lọc**: Danh mục (từ `site_categories`) + Địa điểm (Quận/Huyện)
- **Thanh search**: Tìm kiếm full-text theo tên shop
- **Thẻ shop**: Ảnh bìa + Logo + Tên shop + Danh mục + Badge Verified
- **Phân trang**: Tải thêm (load more) hoặc phân trang số

---

## 6. Landing Page Cửa hàng (`/p/[slug]`)

**Mỗi cửa hàng có duy nhất 1 mẫu template** (`MarketTemplate`) với đầy đủ các section sau:

| Section | Mô tả |
|---|---|
| **Hero Slides** | 3 slide ảnh ấn tượng (chủ shop upload) |
| **About / Intro** | Giới thiệu ngắn về cửa hàng |
| **Danh mục kinh doanh** | Các nhãn danh mục (Thời Trang, Phụ Kiện...) |
| **Sản phẩm nổi bật** | Grid sản phẩm từ `shop_products`, chỉ xem, không mua |
| **Ưu đãi / Khuyến mãi** | Các chương trình ưu đãi từ `business_offers` |
| **Thông tin liên hệ** | Địa chỉ, điện thoại, zalo, email, website |
| **Mạng xã hội** | Fanpage, TikTok, YouTube, Zalo, Instagram |
| **Giờ hoạt động** | Lịch mở cửa từng ngày trong tuần |
| **Bản đồ** | Leaflet.js (miễn phí) hiển thị địa điểm cửa hàng |
| **Gallery / Lookbook** | Bộ ảnh sản phẩm / bộ sưu tập |

**Phong cách**: Sang trọng, premium, gây ấn tượng mạnh ngay lần đầu xem.

---

## 7. Dashboard Chủ Shop (`/dashboard`)

Giao diện đơn giản, tiện lợi cho chủ shop tự vận hành:

- **Tổng quan**: Lượt xem, trạng thái gói dịch vụ, thời hạn
- **Chỉnh sửa Landing Page (Visual Editor)**: Chỉnh sửa trực tiếp trên bản xem trước, không cần code
  - Thay đổi ảnh bằng cách click trực tiếp
  - Sửa văn bản inline
  - Thêm/xóa/sắp xếp section
  - Chọn màu chủ đạo (theme color)
  - **Preview → Lưu → Publish** (3 bước duy nhất)
- **Quản lý Sản phẩm**: Thêm/sửa/xóa sản phẩm hiển thị trên Landing Page
- **Quản lý Ưu đãi**: Tạo và quản lý các khuyến mãi
- **Cài đặt tài khoản**: Thông tin cơ bản, mật khẩu, mạng xã hội, địa chỉ

---

## 8. Admin Panel (`/admin`)

Quản trị hệ thống do Super Admin vận hành:

- **Tổng quan**: Số liệu thống kê toàn hệ thống
- **Quản lý Đối tác (Users)**: Duyệt shop đăng ký, xem thông tin
- **Kích hoạt Gói dịch vụ (Subscriptions)**: Xem yêu cầu và kích hoạt gói thủ công
- **Quản lý Gói (Packages)**: Tạo/sửa các gói thành viên
- **Quản lý Danh mục (Categories)**: Thêm/sửa/xóa danh mục ngành hàng
- **Quản lý Blog**: Admin viết và đăng bài blog cho Trang chủ
- **Nhận diện thương hiệu (Branding)**: Thay đổi logo, màu sắc, tagline hệ thống

> **KHÔNG CÓ** tính năng Import hàng loạt (đã bỏ). Admin kích hoạt shop thủ công theo từng đơn.

---

## 9. Cấu Trúc Database (Các bảng chính)

| Bảng | Mô tả |
|---|---|
| `profiles` | Tài khoản người dùng (Business/Admin) |
| `business_profiles` | Hồ sơ cửa hàng, slug, địa chỉ |
| `landing_pages` | Nội dung JSON của landing page |
| `shop_products` | Sản phẩm của từng shop |
| `business_offers` | Ưu đãi/khuyến mãi của từng shop |
| `business_locations` | Tọa độ lat/lng cho bản đồ Leaflet |
| `site_categories` | Danh mục Admin cấu hình |
| `packages` | Gói dịch vụ |
| `subscriptions` | Quản lý gói của từng shop |
| `blogs` | Blog do Admin viết |
| `analytics_events` | Theo dõi lượt xem landing page |

---

## 10. Cấu Trúc Mã Nguồn

```
/src
  /app
    /(public)
      /page.tsx           → Trang chủ
      /directory          → Danh bạ shop
      /p/[slug]           → Landing Page shop
      /dashboard          → Khu vực chủ shop
      /login, /signup     → Xác thực
    /admin                → Khu vực quản trị
    /api                  → API routes
  /features
    /auth                 → Xác thực & đăng ký
    /dashboard            → Components dashboard chủ shop
    /editor               → Visual Editor (SectionManager, ImagePickerModal...)
    /landing-pages
      /templates
        /market-v1        → [MẪU DUY NHẤT] MarketTemplate cho thời trang
  /components             → UI dùng chung (Navbar, Footer, PaymentPopup...)
  /lib                    → Constants, services, Supabase clients
```

---

## 11. Quy tắc Phát triển Quan trọng

1. **Chỉ có 1 template duy nhất**: `MarketTemplate` trong `/templates/market-v1`. **Không tạo thêm template mới**.
2. **Không có hệ thống Import CSV**: Mọi dữ liệu nhập thủ công qua dashboard hoặc admin panel.
3. **Không có tính năng Đặt lịch (Booking)**: Bảng `bookings` trong DB cũ không được sử dụng trong luồng hiện tại.
4. **Blog là của Admin**: Chủ shop không tự tạo blog.
5. **Vận hành tối giản**: Ưu tiên luồng đơn giản nhất cho chủ shop — đăng ký → được kích hoạt → chỉnh sửa → publish.

---

## 12. Tech Stack

| Công nghệ | Vai trò |
|---|---|
| **Next.js 16** | Framework chính (App Router) |
| **Supabase** | Database (Postgres), Auth, RLS |
| **TailwindCSS 4** | Styling |
| **Framer Motion** | Animations |
| **Leaflet.js** | Bản đồ miễn phí |
| **Resend** | Gửi email |
| **Upstash Redis** | Rate limiting |

---

*1Fashion — Trung tâm thương mại online dành riêng cho ngành Thời trang & Phụ kiện Việt Nam.*
