# QUY TẮC KỶ CƯƠNG DỮ LIỆU CHO AI (AI DATABASE RULES)

**DÀNH CHO TẤT CẢ CÁC AI AGENTS:** Bạn phải đọc và tuân thủ tuyệt đối các quy tắc này TRƯỚC KHI thực hiện bất kỳ lệnh `supabase.from()` hay tạo file SQL nào.

## 1. NGUỒN CHÂN LÝ DUY NHẤT (SSOT)
- **Bảng User**: Luôn là `profiles`. **NGHIÊM CẤM** sử dụng hoặc nhắc lại bảng `accounts`.
- **Trạng thái Gói**: Luôn là `subscription_status`. **NGHIÊM CẤM** dùng `subscription_plan`.
- **Giá trị Role**: Chỉ chấp nhận chữ thường: `admin`, `business`, `user`.
- **Giá trị Status**: Chỉ chấp nhận chữ thường: `trial`, `active`, `blocked`.

## 2. QUY TẮC "DÒ TRƯỚC KHI LÀM"
- KHÔNG ĐƯỢC tự ý sáng tạo tên bảng mới (ví dụ: `experts_table`, `service_list`).
- PHẢI kiểm tra file `DATABASE_COMPLETE_SPEC.md` để xem bảng đó đã tồn tại hay chưa.
- Nếu bảng chưa tồn tại trong SPEC, PHẢI xin ý kiến CTO/USER trước khi tạo.

## 3. QUY CHUẨN JSONB (LANDING PAGES)
Hầu hết dữ liệu nội dung (`experts`, `services`, `reviews`) nằm trong cột `content_json` của bảng `landing_pages`.
- Dịch vụ: Phải dùng khóa `services_menu`.
- Chuyên gia: Phải dùng khóa `experts_list`.
- Đánh giá: Phải dùng khóa `testimonials`.

## 4. HÀNH VI BỊ CẤM
- CẤM tạo các file SQL migration chồng chéo mà không xóa bản cũ.
- CẤM sử dụng CamelCase (ví dụ: `businessName`) cho tên cột. Luôn dùng `snake_case`.

---
*Mọi AI vi phạm quy tắc này sẽ bị coi là gây nguy hiểm cho tính ổn định của hệ thống.*
