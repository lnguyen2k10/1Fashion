# Supabase Database Source of Truth

Generated on: 11:25:00 18/5/2026

## Table: active_landing_pages

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | YES |  |
| landing_page_id | uuid | YES |  |
| business_id | uuid | YES |  |
| template_id | text | YES |  |
| content_json | jsonb | YES |  |
| is_published | boolean | YES |  |
| page_status | text | YES |  |
| created_at | timestamp with time zone | YES |  |
| account_id | uuid | YES |  |
| business_name | text | YES |  |
| business_slug | text | YES |  |
| category | text | YES |  |
| zalo_phone | text | YES |  |
| hotline | text | YES |  |
| logo_url | text | YES |  |
| is_verified | boolean | YES |  |
| rating_score | double precision | YES |  |
| location_city | text | YES |  |
| location_district | text | YES |  |
| address_full | text | YES |  |
| subscription_status | text | YES |  |
| expiry_date | timestamp with time zone | YES |  |

## Table: analytics_events

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() |
| business_id | uuid | YES |  |
| event_type | text | YES |  |
| page_slug | text | YES |  |
| created_at | timestamp with time zone | YES | now() |
| referrer | text | YES |  |

## Table: blogs

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() |
| business_id | uuid | NO |  |
| title | text | NO |  |
| content | text | NO |  |
| image_url | text | YES |  |
| status | text | YES | 'Published'::text |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## Table: bookings

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | uuid_generate_v4() |
| business_id | uuid | NO |  |
| customer_info | jsonb | NO |  |
| status | text | NO | 'Pending'::text |
| source_url | text | YES |  |
| created_at | timestamp with time zone | NO | timezone('utc'::text, now()) |

## Table: business_locations

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | uuid_generate_v4() |
| business_id | uuid | NO |  |
| city | text | NO | 'TP.HCM'::text |
| district | text | NO |  |
| address_full | text | NO |  |
| lat | double precision | YES |  |
| lng | double precision | YES |  |

## Table: business_profiles

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | uuid_generate_v4() |
| account_id | uuid | NO |  |
| business_name | text | NO |  |
| slug | text | NO |  |
| category | text | NO |  |
| zalo_phone | text | YES |  |
| hotline | text | YES |  |
| logo_url | text | YES |  |
| is_verified | boolean | NO | false |
| created_at | timestamp with time zone | NO | timezone('utc'::text, now()) |
| location_city | text | YES | ''::text |
| location_district | text | YES | ''::text |
| rating_score | double precision | YES | 5.0 |
| social_links | jsonb | YES | '{}'::jsonb |

## Table: landing_pages

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | uuid_generate_v4() |
| business_id | uuid | NO |  |
| template_id | text | NO | 'royal'::text |
| content_json | jsonb | NO | '{}'::jsonb |
| is_published | boolean | NO | false |
| updated_at | timestamp with time zone | NO | timezone('utc'::text, now()) |
| status | text | YES | 'Draft'::text |
| draft_json | jsonb | YES |  |

## Table: notifications

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() |
| profile_id | uuid | YES |  |
| type | text | YES |  |
| title | text | YES |  |
| message | text | YES |  |
| is_read | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |
| sender_id | uuid | YES |  |
| link | text | YES |  |

## Table: packages

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() |
| name | text | NO |  |
| price | numeric | NO |  |
| trial_days | integer | YES | 0 |
| duration_days | integer | YES | 365 |
| features | jsonb | YES | '[]'::jsonb |
| created_at | timestamp with time zone | YES | now() |
| limits | jsonb | YES | '{"max_blogs": 3}'::jsonb |

## Table: profiles

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO |  |
| role | text | NO | 'business'::text |
| full_name | text | YES |  |
| email | text | NO |  |
| subscription_status | text | NO | 'trial'::text |
| expiry_date | timestamp with time zone | NO | (now() + '30 days'::interval) |
| created_at | timestamp with time zone | NO | timezone('utc'::text, now()) |
| avatar_url | text | YES |  |

## Table: reviews

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | uuid_generate_v4() |
| business_id | uuid | NO |  |
| author_name | text | NO |  |
| rating | integer | NO |  |
| comment | text | YES |  |
| created_at | timestamp with time zone | NO | timezone('utc'::text, now()) |

## Table: site_settings

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | text | NO | 'current'::text |
| app_name | text | YES | '1Beauty.Asia'::text |
| tagline | text | YES | 'Premium Beauty, Spa & Dental Directory'::text |
| accent_color | text | YES | '#D4AF37'::text |
| logo_url | text | YES |  |
| updated_at | timestamp with time zone | YES | now() |

## Table: subscriptions

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() |
| business_id | uuid | NO |  |
| package_id | uuid | NO |  |
| status | text | YES | 'Pending'::text |
| start_date | timestamp with time zone | YES | now() |
| end_date | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | YES | now() |
| verified | boolean | YES | false |
