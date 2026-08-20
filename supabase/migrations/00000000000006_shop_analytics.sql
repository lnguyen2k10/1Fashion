-- ==========================================
-- 1. Create System Settings Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only authenticated super_admin can read/write system settings via client, 
-- but we also allow reads from authenticated users if needed for UI,
-- For now, let's allow all authenticated to read, and super_admin to write.
CREATE POLICY "Allow authenticated to read settings" 
ON public.system_settings FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Allow super_admin to all settings" 
ON public.system_settings FOR ALL 
TO authenticated USING (auth.jwt() ->> 'role' = 'super_admin');

-- Insert default random view range setting
INSERT INTO public.system_settings (key, value, description)
VALUES (
    'random_view_range', 
    '{"min": 10, "max": 50, "enabled": true}'::jsonb,
    'Configuration for random daily views and clicks added to shops for motivation'
) ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- 2. Create Shop Daily Metrics Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.shop_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    real_views INT DEFAULT 0,
    clicks INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(business_id, metric_date)
);

ALTER TABLE public.shop_daily_metrics ENABLE ROW LEVEL SECURITY;

-- Allow shop owner to read their own metrics
CREATE POLICY "Shop owners can view their metrics"
ON public.shop_daily_metrics FOR SELECT
TO authenticated
USING (
    business_id IN (
        SELECT id FROM public.business_profiles WHERE account_id = auth.uid()
    )
);

-- Service role can insert/update metrics (from edge functions/webhook)
-- but for now allow authenticated to insert their own views? No, views should be tracked securely.
-- We'll just allow service_role to manage it.

-- ==========================================
-- 3. Create Analytics RPC Function with Bonus
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_shop_analytics_with_bonus(
  p_business_id UUID,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  metric_date DATE,
  real_views INT,
  bonus_views INT,
  total_views INT,
  clicks INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_setting JSONB;
  v_min INT := 10;
  v_max INT := 50;
  v_enabled BOOLEAN := true;
  v_date DATE;
  v_bonus_v INT;
  v_real_v INT;
  v_real_c INT;
  v_hash_int INT;
BEGIN
  -- Get configuration
  SELECT value INTO v_setting FROM public.system_settings WHERE key = 'random_view_range';
  IF v_setting IS NOT NULL THEN
    v_min := COALESCE((v_setting->>'min')::int, 10);
    v_max := COALESCE((v_setting->>'max')::int, 50);
    v_enabled := COALESCE((v_setting->>'enabled')::boolean, true);
  END IF;

  FOR i IN 0..(p_days - 1) LOOP
    v_date := CURRENT_DATE - i;
    
    -- Generate consistent deterministic random bonus views based on MD5(business_id + date)
    IF v_enabled AND v_max >= v_min THEN
      -- Get a 32-bit integer from the md5 hash to use as random seed
      v_hash_int := abs(('x' || substr(md5(p_business_id::text || v_date::text), 1, 8))::bit(32)::integer);
      v_bonus_v := v_min + mod(v_hash_int, (v_max - v_min + 1));
    ELSE
      v_bonus_v := 0;
    END IF;
    
    -- Fetch real views if any exist
    SELECT COALESCE(sdm.real_views, 0), COALESCE(sdm.clicks, 0)
    INTO v_real_v, v_real_c
    FROM public.shop_daily_metrics sdm
    WHERE sdm.business_id = p_business_id AND sdm.metric_date = v_date;
    
    IF NOT FOUND THEN
      v_real_v := 0;
      v_real_c := 0;
    END IF;

    -- Assign output variables
    metric_date := v_date;
    real_views := v_real_v;
    bonus_views := v_bonus_v;
    total_views := v_real_v + v_bonus_v;
    
    -- Clicks: real clicks + fake clicks (10% to 20% of bonus views for realism)
    -- Using the same hash so it's consistent
    IF v_bonus_v > 0 THEN
       clicks := v_real_c + floor(v_bonus_v * (0.10 + (mod(v_hash_int, 10) / 100.0))); 
    ELSE
       clicks := v_real_c;
    END IF;

    RETURN NEXT;
  END LOOP;
END;
$$;
