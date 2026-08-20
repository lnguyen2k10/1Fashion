-- Add temp_password to business_profiles
ALTER TABLE public.business_profiles ADD COLUMN temp_password text;
