-- Add gallery_images to shop_products
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;
