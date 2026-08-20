-- 1Fashion production hardening
-- Account model: shop and super_admin only. All authorization is enforced by RLS.

-- Normalize the legacy enum values without rebuilding the type.
do $$
begin
  if exists (select 1 from pg_enum where enumtypid = 'public.user_role'::regtype and enumlabel = 'Admin') then
    alter type public.user_role rename value 'Admin' to 'super_admin';
  end if;
  if exists (select 1 from pg_enum where enumtypid = 'public.user_role'::regtype and enumlabel = 'Business') then
    alter type public.user_role rename value 'Business' to 'shop';
  end if;
end $$;

update public.profiles set role = 'shop' where role::text = 'User';
alter table public.profiles alter column role set default 'shop';

-- Blogs are global editorial content, managed only by super admins.
alter table public.blogs alter column business_id drop not null;

-- Private helpers deliberately live outside public/Data API schemas.
create schema if not exists private;
revoke all on schema private from public;

create or replace function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
  );
$$;

revoke all on function private.is_super_admin() from public;
grant execute on function private.is_super_admin() to anon, authenticated;

-- Prevent a browser client from promoting itself or changing billing state.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- Field-level limits for shop profile editing. account_id and verification are immutable to shops.
revoke all on public.business_profiles from anon, authenticated;
grant select on public.business_profiles to anon, authenticated;
grant update (business_name, slug, category, location_city, location_district, zalo_phone, hotline, social_links, logo_url, theme_color) on public.business_profiles to authenticated;
grant all on public.business_profiles to service_role;

-- Rebuild all public RLS policies explicitly. Existing permissive policies were unsafe.
do $$
declare policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  end loop;
end $$;

alter table public.profiles enable row level security;
create policy profiles_select_self_or_admin on public.profiles for select to authenticated
  using ((select auth.uid()) = id or (select private.is_super_admin()));
create policy profiles_update_self_or_admin on public.profiles for update to authenticated
  using ((select auth.uid()) = id or (select private.is_super_admin()))
  with check ((select auth.uid()) = id or (select private.is_super_admin()));

alter table public.business_profiles enable row level security;
create policy businesses_public_read on public.business_profiles for select to anon, authenticated using (true);
create policy businesses_shop_update on public.business_profiles for update to authenticated
  using (account_id = (select auth.uid()) or (select private.is_super_admin()))
  with check (account_id = (select auth.uid()) or (select private.is_super_admin()));

alter table public.landing_pages enable row level security;
create policy landing_pages_shop_or_admin_read on public.landing_pages for select to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));
create policy landing_pages_shop_or_admin_write on public.landing_pages for all to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()))
  with check (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));

alter table public.shop_products enable row level security;
create policy products_public_read on public.shop_products for select to anon, authenticated using (status = 'active' or (select private.is_super_admin()) or business_id in (select id from public.business_profiles where account_id = (select auth.uid())));
create policy products_shop_or_admin_write on public.shop_products for all to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()))
  with check (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));

alter table public.business_offers enable row level security;
create policy offers_public_read on public.business_offers for select to anon, authenticated using (status = 'active' or (select private.is_super_admin()) or business_id in (select id from public.business_profiles where account_id = (select auth.uid())));
create policy offers_shop_or_admin_write on public.business_offers for all to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()))
  with check (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));

alter table public.business_locations enable row level security;
create policy locations_public_read on public.business_locations for select to anon, authenticated using (true);
create policy locations_shop_or_admin_write on public.business_locations for all to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()))
  with check (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));

alter table public.operating_hours enable row level security;
create policy operating_hours_public_read on public.operating_hours for select to anon, authenticated using (true);
create policy operating_hours_shop_or_admin_write on public.operating_hours for all to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()))
  with check (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));

alter table public.shop_messages enable row level security;
create policy messages_shop_or_admin_read on public.shop_messages for select to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));
create policy messages_shop_or_admin_update on public.shop_messages for update to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()))
  with check (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));

alter table public.bookings enable row level security;
create policy bookings_shop_or_admin_read on public.bookings for select to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));
create policy bookings_shop_or_admin_update on public.bookings for update to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()))
  with check (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));

alter table public.subscriptions enable row level security;
create policy subscriptions_shop_or_admin_read on public.subscriptions for select to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));
create policy subscriptions_shop_submit_pending on public.subscriptions for insert to authenticated
  with check (
    business_id in (select id from public.business_profiles where account_id = (select auth.uid()))
    and status = 'pending'
    and coalesce(verified, false) = false
  );
create policy subscriptions_admin_update on public.subscriptions for update to authenticated
  using ((select private.is_super_admin())) with check ((select private.is_super_admin()));

-- Atomic manual-payment decision. Only an authenticated super admin can call it.
create or replace function public.review_subscription(subscription_id uuid, approve boolean)
returns void
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
declare
  selected_subscription public.subscriptions%rowtype;
  package_duration integer;
begin
  if not private.is_super_admin() then
    raise exception 'forbidden';
  end if;

  select * into selected_subscription
  from public.subscriptions
  where id = subscription_id
  for update;

  if not found then
    raise exception 'subscription_not_found';
  end if;

  if approve then
    select coalesce(duration_days, 30) into package_duration
    from public.packages where id = selected_subscription.package_id;

    update public.subscriptions
    set status = 'active', verified = true,
        start_date = now(), end_date = now() + make_interval(days => package_duration)
    where id = subscription_id;

    update public.profiles
    set subscription_status = 'active', expiry_date = now() + make_interval(days => package_duration)
    where id = (select account_id from public.business_profiles where id = selected_subscription.business_id);
  else
    update public.subscriptions
    set status = 'rejected', verified = false
    where id = subscription_id;
  end if;

  insert into public.admin_audit_logs (admin_id, action, target_id, target_type, details)
  values (auth.uid(), case when approve then 'APPROVE_SUBSCRIPTION' else 'REJECT_SUBSCRIPTION' end, subscription_id, 'subscription', jsonb_build_object('approved', approve));
end;
$$;

revoke all on function public.review_subscription(uuid, boolean) from public;
grant execute on function public.review_subscription(uuid, boolean) to authenticated;

alter table public.packages enable row level security;
create policy packages_public_read on public.packages for select to anon, authenticated using (true);
create policy packages_admin_write on public.packages for all to authenticated
  using ((select private.is_super_admin())) with check ((select private.is_super_admin()));

alter table public.site_settings enable row level security;
create policy site_settings_public_read on public.site_settings for select to anon, authenticated using (true);
create policy site_settings_admin_write on public.site_settings for all to authenticated
  using ((select private.is_super_admin())) with check ((select private.is_super_admin()));

alter table public.site_categories enable row level security;
create policy categories_public_read on public.site_categories for select to anon, authenticated using (true);
create policy categories_admin_write on public.site_categories for all to authenticated
  using ((select private.is_super_admin())) with check ((select private.is_super_admin()));

alter table public.blogs enable row level security;
create policy blogs_public_read_published on public.blogs for select to anon, authenticated using (status = 'published' or (select private.is_super_admin()));
create policy blogs_admin_write on public.blogs for all to authenticated
  using ((select private.is_super_admin())) with check ((select private.is_super_admin()));

alter table public.notifications enable row level security;
create policy notifications_own_or_admin_read on public.notifications for select to authenticated
  using (profile_id = (select auth.uid()) or (select private.is_super_admin()));
create policy notifications_own_or_admin_update on public.notifications for update to authenticated
  using (profile_id = (select auth.uid()) or (select private.is_super_admin()))
  with check (profile_id = (select auth.uid()) or (select private.is_super_admin()));

alter table public.analytics_events enable row level security;
create policy analytics_shop_or_admin_read on public.analytics_events for select to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));

alter table public.admin_audit_logs enable row level security;
create policy audit_logs_admin_read on public.admin_audit_logs for select to authenticated using ((select private.is_super_admin()));
create policy audit_logs_admin_insert on public.admin_audit_logs for insert to authenticated with check ((select private.is_super_admin()));

alter table public.reviews enable row level security;
create policy reviews_public_read on public.reviews for select to anon, authenticated using (true);

-- Hide dormant consumer-only tables while consumer accounts are disabled.
alter table public.user_favorites enable row level security;
alter table public.user_subscriptions enable row level security;

-- Safe public shop projection. It intentionally omits account_id, owner email and subscription data.
drop view if exists public.active_landing_pages;
create view public.active_landing_pages with (security_barrier = true) as
select
  lp.id,
  lp.id as landing_page_id,
  lp.business_id,
  lp.template_id,
  lp.content_json,
  lp.is_published,
  lp.status as page_status,
  lp.updated_at,
  bp.business_name,
  bp.slug as business_slug,
  bp.category,
  bp.theme_color,
  bp.zalo_phone,
  bp.hotline,
  bp.logo_url,
  bp.is_verified,
  bp.rating_score,
  bp.location_city,
  bp.location_district,
  bp.social_links,
  bl.lat,
  bl.lng,
  bl.address_full
from public.landing_pages lp
join public.business_profiles bp on bp.id = lp.business_id
left join public.business_locations bl on bl.business_id = bp.id
where lp.is_published = true and lp.status = 'Published';

revoke all on public.landing_pages from anon;
revoke all on public.shop_landing_page from anon, authenticated;
revoke all on public.active_landing_pages from anon, authenticated, public;
grant select on public.active_landing_pages to anon, authenticated;

-- The old SECURITY DEFINER helper was publicly executable. Public reads are already safe via RLS.
create or replace function public.get_active_categories()
returns table(name text, slug text, icon text, color text, description text)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select name, slug, icon, color, description
  from public.site_categories
  where is_active = true
  order by sort_order asc, name asc;
$$;

-- Storage: shops only control their own files in shops/<business-id>/..., while admins own admin/.
do $$
declare policy_record record;
begin
  for policy_record in
    select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects'
  loop
    execute format('drop policy if exists %I on storage.objects', policy_record.policyname);
  end loop;
end $$;

create policy public_images_read on storage.objects for select to anon, authenticated using (bucket_id = 'public_images');
create policy public_images_shop_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'public_images'
  and (storage.foldername(name))[1] = 'shops'
  and (storage.foldername(name))[2] in (select id::text from public.business_profiles where account_id = (select auth.uid()))
);
create policy public_images_shop_update on storage.objects for update to authenticated using (
  bucket_id = 'public_images'
  and (storage.foldername(name))[1] = 'shops'
  and (storage.foldername(name))[2] in (select id::text from public.business_profiles where account_id = (select auth.uid()))
) with check (
  bucket_id = 'public_images'
  and (storage.foldername(name))[1] = 'shops'
  and (storage.foldername(name))[2] in (select id::text from public.business_profiles where account_id = (select auth.uid()))
);
create policy public_images_shop_delete on storage.objects for delete to authenticated using (
  bucket_id = 'public_images'
  and (storage.foldername(name))[1] = 'shops'
  and (storage.foldername(name))[2] in (select id::text from public.business_profiles where account_id = (select auth.uid()))
);
create policy public_images_admin_manage on storage.objects for all to authenticated using (
  bucket_id = 'public_images' and (select private.is_super_admin())
) with check (
  bucket_id = 'public_images' and (select private.is_super_admin())
);

-- Indexes for shop dashboards and admin payment approval at production scale.
create index if not exists idx_business_profiles_account_id on public.business_profiles(account_id);
create index if not exists idx_landing_pages_published_updated on public.landing_pages(updated_at desc) where is_published = true and status = 'Published';
create index if not exists idx_bookings_business_created on public.bookings(business_id, created_at desc);
create index if not exists idx_subscriptions_business_created on public.subscriptions(business_id, created_at desc);
create index if not exists idx_subscriptions_pending_created on public.subscriptions(created_at desc) where verified = false;
create index if not exists idx_shop_messages_business_created on public.shop_messages(business_id, created_at desc);
create index if not exists idx_analytics_events_business_created on public.analytics_events(business_id, created_at desc);
create index if not exists idx_business_locations_business_id on public.business_locations(business_id);
create index if not exists idx_notifications_profile_created on public.notifications(profile_id, created_at desc);
create index if not exists idx_blogs_published_created on public.blogs(status, created_at desc) where status = 'published';

-- Least-privilege API grants. RLS above remains the row-level enforcement layer.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.active_landing_pages, public.business_profiles, public.shop_products,
  public.business_offers, public.business_locations, public.operating_hours, public.packages,
  public.site_settings, public.site_categories, public.blogs, public.reviews to anon;
grant select on public.active_landing_pages, public.business_profiles, public.shop_products,
  public.business_offers, public.business_locations, public.operating_hours, public.packages,
  public.site_settings, public.site_categories, public.blogs, public.reviews, public.profiles,
  public.landing_pages, public.shop_messages, public.bookings, public.subscriptions,
  public.notifications, public.analytics_events, public.admin_audit_logs to authenticated;
grant insert, update, delete on public.landing_pages, public.shop_products, public.business_offers,
  public.business_locations, public.operating_hours to authenticated;
grant update on public.shop_messages, public.bookings, public.notifications to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;
grant update (business_name, slug, category, location_city, location_district, zalo_phone, hotline,
  social_links, logo_url, theme_color) on public.business_profiles to authenticated;
grant insert on public.subscriptions, public.admin_audit_logs to authenticated;
grant insert, update, delete on public.packages, public.site_settings, public.site_categories,
  public.blogs to authenticated;
