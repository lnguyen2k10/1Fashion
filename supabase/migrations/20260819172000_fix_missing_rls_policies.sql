-- 1. Policies for shop_daily_metrics
DROP POLICY IF EXISTS "shop_daily_metrics_shop_owner_read" ON public.shop_daily_metrics;
CREATE POLICY "shop_daily_metrics_shop_owner_read" 
ON public.shop_daily_metrics FOR SELECT 
TO authenticated 
USING (
    business_id IN (
        SELECT id FROM public.business_profiles WHERE account_id = auth.uid()
    )
);

-- 2. Policies for system_settings
DROP POLICY IF EXISTS "system_settings_auth_read" ON public.system_settings;
CREATE POLICY "system_settings_auth_read" 
ON public.system_settings FOR SELECT 
TO authenticated USING (true);

DROP POLICY IF EXISTS "system_settings_admin_all" ON public.system_settings;
CREATE POLICY "system_settings_admin_all" 
ON public.system_settings FOR ALL 
TO authenticated USING ( (SELECT private.is_super_admin()) );

-- 3. Policies for user_favorites
DROP POLICY IF EXISTS "user_favorites_own_manage" ON public.user_favorites;
CREATE POLICY "user_favorites_own_manage"
ON public.user_favorites FOR ALL
TO authenticated USING (user_id = auth.uid());

-- 4. Policies for user_subscriptions
DROP POLICY IF EXISTS "user_subscriptions_own_manage" ON public.user_subscriptions;
CREATE POLICY "user_subscriptions_own_manage"
ON public.user_subscriptions FOR ALL
TO authenticated USING (user_id = auth.uid());
