# Master Data Structure - Landing Page (content_json)

Tài liệu này định nghĩa cấu trúc dữ liệu chuẩn cho `content_json` trong bảng `landing_pages`. Toàn bộ hệ thống Import và Visual Editor phải tuân thủ cấu trúc này.

## 1. Cấu trúc JSON chi tiết

| Section | Field | Description | Default/Fallback |
| :--- | :--- | :--- | :--- |
| **Hero Section** | `hero_title` | Tiêu đề lớn chính | "Chào mừng tới [Business Name]" |
| | `hero_subtitle` | Phụ đề dưới tiêu đề | "Dịch vụ đẳng cấp chuyên nghiệp" |
| | `hero_video_url` | Link video background | null |
| | `hero_slides` | Mảng 3-5 ảnh chất lượng cao | Placeholder Images (Unsplash) |
| **About Us** | `intro_text` | Văn bản giới thiệu | Giới thiệu dựa trên Category & District |
| | `experience_years` | Số năm kinh nghiệm | "5+" |
| | `video_intro_url` | Video giới thiệu chi tiết | null |
| **Services Menu** | `services_menu` | Mảng các object dịch vụ | [] |
| | `- service_name` | Tên dịch vụ | null |
| | `- description` | Mô tả ngắn | "" |
| | `- price` | Giá hiển thị | "Liên hệ" |
| | `- image_url` | Ảnh minh họa dịch vụ | Placeholder Image |
| **Contact Info** | `zalo_link` | Link chat Zalo | `https://zalo.me/[zalo_phone]` |
| | `hotline` | Số hotline liên hệ | `zalo_phone` |
| | `email` | Email doanh nghiệp | `email_owner` |
| | `address_full` | Địa chỉ đầy đủ | null |
| | `google_map_embed` | Mã nhúng Google Map | null |
| **Operating Hours**| `operating_hours` | JSON chứa giờ làm việc | {} |
| **Social Trust** | `rating_count` | Số lượng đánh giá | Random (10-60) |
| | `social_links` | Object chứa FB, Tiktok, Insta | {} |

---

## 2. Quy tắc xử lý dữ liệu
1.  **Slug**: Tự động sinh từ `business_name` nếu không cung cấp.
2.  **Giá tiền**: Nếu rỗng hoặc null, mặc định hiển thị "Liên hệ".
3.  **Hình ảnh**: Sử dụng `PLACEHOLDER_IMAGES` chất lượng cao cho các trường bị thiếu.
4.  **Expiry**: Mặc định `now() + 30 days` cho mọi lượt Import.
