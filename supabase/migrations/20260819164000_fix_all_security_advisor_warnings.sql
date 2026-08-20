-- 1. Fix slugify mutable search_path and unaccent extension in public schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION unaccent SET SCHEMA extensions;

DROP FUNCTION IF EXISTS public.slugify(text);
CREATE OR REPLACE FUNCTION public.slugify(value TEXT) RETURNS TEXT AS $$
BEGIN
  -- remove accents, lower case, replace spaces/special chars with hyphens
  RETURN trim(both '-' from regexp_replace(lower(extensions.unaccent(value)), '[^a-z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT SET search_path = public, extensions, pg_temp;

-- 2. Drop broad SELECT policy on public_images to prevent file listing (public URLs still work)
DROP POLICY IF EXISTS public_images_read ON storage.objects;

-- 3. Fix SECURITY DEFINER warnings on functions
-- Switch get_shop_analytics_with_bonus to SECURITY INVOKER (runs securely as the authenticated shop owner)
ALTER FUNCTION public.get_shop_analytics_with_bonus(uuid, integer) SECURITY INVOKER;

-- Revoke EXECUTE from anon and authenticated for review_subscription (only service_role/admin can execute)
REVOKE EXECUTE ON FUNCTION public.review_subscription(uuid, boolean) FROM public, anon, authenticated;

-- rls_auto_enable (if exists) switch to SECURITY INVOKER
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable') THEN
        ALTER FUNCTION public.rls_auto_enable() SECURITY INVOKER;
    END IF;
END $$;
