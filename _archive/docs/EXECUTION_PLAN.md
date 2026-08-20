# Beauty & Dental Directory - Lộ trình thực thi thực tế (Updated)

Dựa trên kết quả Audit toàn diện, lộ trình thực thi được cấu trúc lại thành các Milestone để đảm bảo tính vận hành 100% theo PRD.

## Milestone 1: Landing Page Engine & Routing (Hoàn thành 100%)
*   **[X] Dynamic Routing:** Triển khai `/p/[slug]` để hiển thị Landing Page từ Database.
*   **[X] Template Switcher:** Tự động chọn Royal/Modern/Seasonal dựa trên `template_id`.
*   **[X] Directory Page:** Xây dựng `/directory` với bộ lọc khu vực và lĩnh vực.
*   **[X] Core Linking:** Kết nối toàn bộ nút bấm trên trang chủ tới dữ liệu thực.

## Milestone 2: Auth & Business Onboarding (Đang thực hiện - 70%)
*   **[X] Luxury Login UI:** Giao diện đăng nhập cao cấp cho doanh nghiệp.
*   **[X] SaaS Signup UI:** Luồng đăng ký dùng thử 30 ngày.
*   **[ ] Auth Logic:** Kết nối Supabase Auth cho đăng ký/đăng nhập.
*   **[ ] Password Recovery:** Chức năng quên mật khẩu.

## Milestone 3: Visual Editor & Owner Dashboard (Chưa thực hiện)
*   **Owner Dashboard:** Giao diện quản lý trạng thái, lượt xem và thông tin doanh nghiệp.
*   **Visual Editor:** Chế độ chỉnh sửa trực quan trực tiếp trên Landing Page.
*   **Data Saving:** Logic lưu thay đổi vào `landing_pages.content_json`.
*   **Booking Email:** Tích hợp Resend gửi mail thông báo đặt lịch.

## Milestone 4: Admin Tools & Scalability (Chưa thực hiện)
*   **Bulk Import UI:** Giao diện dán dữ liệu JSON để nhập hàng loạt DN.
*   **Verification UI:** Hệ thống duyệt DN và cấp tích xanh.
*   **Seed Data:** Nhập 50-100 DN thực tế để hoàn thiện danh bạ.

---

## CHIẾN LƯỢC RA TIỀN (3 NGÀY)
1.  **Ngày 1:** Hoàn thiện "Cái vỏ" và hiển thị dữ liệu (Đã xong Milestone 1).
2.  **Ngày 2:** Hoàn thiện hệ thống Tài khoản và Công cụ chỉnh sửa (Milestone 2 & 3).
3.  **Ngày 3:** Nhập liệu công nghiệp và Kích hoạt marketing (Milestone 4).
