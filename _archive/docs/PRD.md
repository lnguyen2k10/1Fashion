# Beauty & Dental Directory (Premium Version) - PRD

## 1. Thông tin chung
*   **Tên dự án:** Beauty & Dental Directory (Premium Version).
*   **Mô hình:** Directory (Danh bạ) kết hợp SaaS Landing Page.
*   **Phong cách chủ đạo:** Royal Luxury (Vàng hoàng gia, trắng sứ, sang trọng, tươi sáng).

## 2. Cấu trúc Người dùng & Phân quyền (User Roles)
### A. Quản trị viên (Super Admin)
*   Quản lý danh sách doanh nghiệp (Phê duyệt/Khóa/Xác minh tích xanh).
*   **Quản lý Gói thành viên:** Thiết lập đơn giá, số ngày Trial, hạn mức bài viết Blog/Social cho từng gói.
*   Quản lý Blog chung của hệ thống.
*   Nhận email thông báo cho mọi lượt Booking trên toàn hệ thống để giám sát.

### B. Chủ doanh nghiệp (Business Owner)
*   Đăng ký tài khoản, chọn gói thành viên (mặc định dùng thử 30 ngày).
*   **Công cụ chỉnh sửa Landing Page (Visual Editor):** Thay đổi nội dung, hình ảnh dịch vụ, giá cả, giờ làm việc, video intro, bản đồ.
*   Quản lý bài đăng Blog cá nhân (nằm trong hạn mức gói).
*   Cấu hình liên hệ: Số Zalo riêng, Hotline, Email riêng để nhận Booking.

### C. Khách hàng (End-User)
*   Tìm kiếm doanh nghiệp theo: Lĩnh vực (Spa/Nha khoa/Clinic) và Địa điểm (Quận/Huyện/Thành phố).
*   Xem Landing Page chuyên nghiệp của DN.
*   Thực hiện Booking hoặc liên hệ trực tiếp qua Zalo/Call.
*   Đánh giá (Rating) và Chia sẻ (Social Share).

## 3. Cơ chế Gói thành viên & Vận hành (Subscription Logic)
*   **Quy trình Trial:** Sau khi đăng ký, doanh nghiệp có 30 ngày sử dụng full chức năng.
*   **Trạng thái Unpublish:** Sau 30 ngày, nếu không nâng cấp, Landing Page sẽ tự động chuyển sang trạng thái "Private" (Khách không thể truy cập).
*   **Hạn mức nội dung:** Admin định nghĩa số lượng bài viết tối đa mỗi tháng doanh nghiệp được đăng dựa trên gói họ mua.
*   **Quy trình nâng cấp:** DN nhấn "Nâng cấp" -> Hệ thống gửi thông báo cho Admin -> Admin liên hệ thanh toán thủ công -> Admin kích hoạt gói trên Dashboard quản trị.

## 4. Hệ thống thông báo (Notification Flow)
*   **Khi có khách đặt lịch (Booking Form):**
    1.  Gửi 01 Email về Mail doanh nghiệp (để họ xử lý khách).
    2.  Gửi 01 Email về Mail Admin (để quản lý dữ liệu và hỗ trợ).
*   **Khi sắp hết hạn Trial:** Gửi email nhắc nhở DN trước 3 ngày.
