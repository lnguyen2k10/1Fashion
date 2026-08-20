-- ============================================================================
-- 1FASHION V4 MIGRATION: MESSAGING FEATURE
-- Thêm tính năng lưu tin nhắn từ khách hàng vào database
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shop_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bật RLS
ALTER TABLE public.shop_messages ENABLE ROW LEVEL SECURITY;

-- Khách hàng vãng lai có quyền GỬI (INSERT) tin nhắn
CREATE POLICY "Anyone can insert messages"
  ON public.shop_messages FOR INSERT
  WITH CHECK (true);

-- Chủ shop chỉ có thể XEM (SELECT) tin nhắn của mình
CREATE POLICY "Owners can view their own messages"
  ON public.shop_messages FOR SELECT
  USING (
    business_id IN (SELECT id FROM public.business_profiles WHERE account_id = auth.uid())
  );

-- Chủ shop có thể ĐÁNH DẤU (UPDATE) tin nhắn của mình thành đã đọc
CREATE POLICY "Owners can update their own messages"
  ON public.shop_messages FOR UPDATE
  USING (
    business_id IN (SELECT id FROM public.business_profiles WHERE account_id = auth.uid())
  );
