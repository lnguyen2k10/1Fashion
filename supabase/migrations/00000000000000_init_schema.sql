-- 1SPA V2 INITIAL SCHEMA (100% SYNC WITH CODEBASE)
-- This file establishes the entire database structure, perfectly aligned with src/types/database.ts

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM TYPES (ENUMS)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('Admin', 'Business', 'User');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE business_category AS ENUM ('Spa', 'Dental', 'Clinic', 'Beauty');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE page_status AS ENUM ('Draft', 'Published');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('Pending', 'Confirmed', 'Completed', 'Cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- 3. TABLES

-- PROFILES (Users, Businesses, Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'User',
    full_name TEXT,
    email TEXT NOT NULL,
    subscription_status TEXT DEFAULT 'inactive',
    expiry_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    app_name TEXT DEFAULT '1Fashion',
    tagline TEXT,
    accent_color TEXT DEFAULT '#D4AF37',
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PACKAGES (Subscription Plans)
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price FLOAT NOT NULL,
    trial_days INT,
      duration_days INT,
      features JSONB DEFAULT '{}'::jsonb,
      limits JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );

-- BUSINESS PROFILES
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category business_category NOT NULL,
    location_city TEXT,
    location_district TEXT,
    zalo_phone TEXT,
    hotline TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    logo_url TEXT,
    rating_score FLOAT DEFAULT 5.0,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    verified BOOLEAN DEFAULT false,
    proof_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- LANDING PAGES
CREATE TABLE IF NOT EXISTS public.landing_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL,
    status page_status DEFAULT 'Draft',
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    draft_json JSONB DEFAULT '{}'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- BUSINESS LOCATIONS
CREATE TABLE IF NOT EXISTS public.business_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    address_full TEXT NOT NULL,
    lat FLOAT,
    lng FLOAT
);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_info JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    rating FLOAT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- USER FAVORITES
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, business_id)
);

-- USER SUBSCRIPTIONS (Offers)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, business_id)
);

-- BLOGS
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    event_type TEXT,
    page_slug TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_id UUID,
    target_type TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- BUSINESS OFFERS
CREATE TABLE IF NOT EXISTS public.business_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    discount_code TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'active',
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. VIEWS & LOGIC

-- View for Active Landing Pages (v1 - will be replaced by later migrations)
-- CASCADE also drops dependent views: directory_shops, active_homepage_shop_features, active_homepage_product_features
DROP VIEW IF EXISTS public.active_landing_pages CASCADE;
CREATE OR REPLACE VIEW public.active_landing_pages AS
SELECT 
    lp.id,
    lp.business_id,
    lp.template_id,
    lp.content_json,
    lp.is_published,
    lp.status as page_status,
    bp.business_name,
    bp.slug as business_slug,
    bp.category,
    bp.zalo_phone,
    bp.hotline,
    bp.logo_url,
    bp.is_verified,
    acc.subscription_status,
    acc.expiry_date
FROM public.landing_pages lp
JOIN public.business_profiles bp ON lp.business_id = bp.id
JOIN public.profiles acc ON bp.account_id = acc.id
WHERE lp.is_published = true;

-- Ensure Only One Published Page Per Business
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_published_page 
ON public.landing_pages (business_id) 
WHERE (is_published = true);


-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Bật RLS cho tất cả các bảng
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_offers ENABLE ROW LEVEL SECURITY;

-- NOTE: Initial RLS policies are intentionally omitted here.
-- All RLS policies are fully defined and managed by migration:
-- 20260815024113_production_security_roles_manual_billing.sql
-- That migration drops ALL existing policies and rebuilds them correctly
-- with the renamed enum values (Admin -> super_admin, Business -> shop).
;
