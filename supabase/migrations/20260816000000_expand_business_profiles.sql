-- Add comprehensive directory fields to business_profiles
ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS address_full TEXT,
  ADD COLUMN IF NOT EXISTS email_contact TEXT,
  ADD COLUMN IF NOT EXISTS operating_hours_text TEXT;

-- Grant permissions for authenticated users to update these new fields
GRANT UPDATE (address_full, email_contact, operating_hours_text) ON public.business_profiles TO authenticated;
