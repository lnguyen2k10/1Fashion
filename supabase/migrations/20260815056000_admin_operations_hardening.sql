-- Packages are archived instead of deleted when they should no longer be sold.
alter table public.packages add column if not exists is_available boolean not null default true;
create index if not exists idx_packages_available_price on public.packages(price) where is_available = true;

-- A blocked shop must immediately lose public-page eligibility, even if it has
-- an otherwise valid subscription.
create or replace function private.has_shop_publish_entitlement(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select exists (
    select 1 from public.business_profiles business
    join public.profiles owner on owner.id = business.account_id
    where business.id = target_business_id and (
      owner.role = 'super_admin'
      or (owner.subscription_status <> 'blocked' and (
        (owner.subscription_status = 'trial' and owner.expiry_date > now())
        or exists (
          select 1 from public.subscriptions subscription
          join public.packages package on package.id = subscription.package_id
          where subscription.business_id = business.id and subscription.status = 'active'
            and subscription.verified = true and subscription.end_date > now()
            and case when package.limits ->> 'public_landing_page' in ('true', 'false')
              then (package.limits ->> 'public_landing_page')::boolean else true end
        )
      ))
    )
  );
$$;

-- Email delivery records are idempotent and provide an operational audit trail.
create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  template_key text not null,
  dedupe_key text not null,
  recipient_email text not null,
  subject text not null,
  body_text text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_attempt_at timestamptz,
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (template_key, dedupe_key)
);
alter table public.email_outbox enable row level security;
drop policy if exists email_outbox_admin_read on public.email_outbox;
create policy email_outbox_admin_read on public.email_outbox for select to authenticated using ((select private.is_super_admin()));
revoke all on public.email_outbox from anon, authenticated;
grant select on public.email_outbox to authenticated;
create index if not exists idx_email_outbox_status_created on public.email_outbox(status, created_at desc);
