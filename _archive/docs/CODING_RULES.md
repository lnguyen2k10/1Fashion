# AI Coding Rules & Standards

## 1. Nguyên tắc cốt lõi (Core Principles)
*   **Single Source of Truth**: Tuyệt đối tuân thủ tài liệu trong thư mục `docs/`. Không tự ý sáng tạo logic ngoài PRD.
*   **No Creativity**: Không thêm các tính năng "thông minh" hoặc thay đổi luồng vận hành nếu không có trong thiết kế.
*   **Royal Luxury Aesthetic**: Mọi giao diện phải đạt chuẩn "Premium". Sử dụng bảng màu: Vàng hoàng gia (Royal Gold), Trắng sứ (Porcelain White), Đen huyền bí (Mystic Black).
*   **Plan First**: Luôn tạo `implementation_plan.md` và chờ phê duyệt trước khi viết code.

## 2. Tiêu chuẩn Kỹ thuật (Technical Standards)
*   **Stack**: Next.js 15+ (App Router), React 19, Tailwind CSS v4, Supabase, Framer Motion.
*   **UI/UX**: 
    *   Sử dụng `framer-motion` cho các hiệu ứng chuyển cảnh và micro-interactions.
    *   Không sử dụng placeholder. Nếu cần ảnh, hãy dùng công cụ tạo ảnh hoặc ảnh chất lượng cao từ Unsplash (thông qua URL).
    *   Typography: Ưu tiên các font sang trọng (đã được cấu hình hoặc sử dụng Google Fonts).
*   **Database**: Sử dụng Supabase. Mọi thay đổi Schema phải được ghi lại trong `DATABASE.md` và có migration file tương ứng.
*   **Email**: Sử dụng Resend cho toàn bộ hệ thống thông báo.

## 3. Quy trình làm việc (Workflow)
1.  **Nghiên cứu**: Đọc kỹ tài liệu PRD và System Specs.
2.  **Lập kế hoạch**: Viết `implementation_plan.md` chi tiết các bước.
3.  **Thực thi**: Code theo từng block nhỏ, kiểm tra ngay sau mỗi block.
4.  **Kiểm tra**: Sử dụng Browser Tool để xác nhận giao diện và logic đúng như PRD.
5.  **Báo cáo**: Cập nhật `PROGRESS_REPORT.md`.

## 4. Cấm (Hard Restrictions)
*   Cấm viết code khi chưa thống nhất kế hoạch.
*   Cấm sử dụng màu sắc generic (red, blue, green nguyên bản).
*   Cấm bỏ qua lỗi Lint hoặc Typescript.
