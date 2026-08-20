alter table public.site_settings
  add column if not exists social_links jsonb not null default '{}'::jsonb,
  add column if not exists terms_content text,
  add column if not exists privacy_content text,
  add column if not exists hero_content jsonb not null default '{}'::jsonb;

update public.site_settings
set
  terms_content = coalesce(terms_content, $$# Điều khoản sử dụng

Cập nhật lần cuối: 15/08/2026

1Fashion là nền tảng danh bạ và landing page dành cho shop thời trang. Chủ shop chịu trách nhiệm về tính chính xác, quyền sử dụng hình ảnh, nội dung và thông tin liên hệ đã đăng.

Nền tảng có thể tạm ẩn nội dung vi phạm pháp luật, quyền sở hữu trí tuệ hoặc tiêu chuẩn cộng đồng. Gói dịch vụ được kích hoạt sau khi super admin xác nhận thanh toán theo chính sách công bố.

Liên hệ 1Fashion khi cần hỗ trợ hoặc báo cáo nội dung.$$),
  privacy_content = coalesce(privacy_content, $$# Chính sách bảo mật

Cập nhật lần cuối: 15/08/2026

1Fashion chỉ thu thập thông tin cần thiết để vận hành tài khoản shop, landing page và yêu cầu hỗ trợ. Dữ liệu không được bán cho bên thứ ba.

Thông tin công khai do shop chủ động xuất bản trên landing page. Thông tin tài khoản, thanh toán và vận hành nội bộ chỉ được truy cập bởi người có thẩm quyền.

Bạn có thể yêu cầu cập nhật hoặc xóa dữ liệu tài khoản bằng cách liên hệ quản trị viên.$$),
  hero_content = case when hero_content = '{}'::jsonb then jsonb_build_object(
    'eyebrow', 'Danh bạ thời trang',
    'title', 'Khám phá phong cách của bạn',
    'subtitle', coalesce(tagline, 'Khám phá các shop thời trang và phụ kiện.'),
    'image_url', null
  ) else hero_content end;
