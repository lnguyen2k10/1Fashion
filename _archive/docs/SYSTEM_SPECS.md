# Beauty & Dental Directory - SYSTEM SPECIFICATIONS

## 1. Tech Stack
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS.
- **Backend**: Supabase (PostgreSQL, Auth, Storage).
- **Email**: Resend API.
- **Styling**: Royal Luxury Design System.

## 2. Core Modules
### A. Auth Module
- Sử dụng Supabase SSR.
- Tự động tạo `account` và `business_profile` ngay sau khi Signup.
- Thiết lập mặc định 30 ngày Trial.

### B. Directory Module
- Cơ chế tìm kiếm Dynamic SQL dựa trên Category và Location.
- View `active_landing_pages` đóng vai trò kiểm soát truy cập (Gatekeeper).

### C. Editor Module (Visual Editor)
- Client-side editing với JSON state.
- Đồng bộ hóa JSONB vào trường `content_json` của bảng `landing_pages`.

### D. Booking & Notification
- Tích hợp Resend API gửi mail đồng thời cho Chủ DN và Super Admin.

## 3. Security (RLS)
- **Public**: Có thể xem danh bạ và các trang Landing Page ở trạng thái `Published`.
- **Owner**: Có quyền sửa (Update) Profile và Landing Page của chính mình.
- **Admin**: Có quyền tối cao qua `service_role`.
