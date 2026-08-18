ALTER TABLE public.pilot_leads
  ADD COLUMN IF NOT EXISTS dms text,
  ADD COLUMN IF NOT EXISTS claims_per_month text,
  ADD COLUMN IF NOT EXISTS admin_shared_role boolean,
  ADD COLUMN IF NOT EXISTS admin_shared_role_note text,
  ADD COLUMN IF NOT EXISTS first_oem text;