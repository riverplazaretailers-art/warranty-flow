CREATE TABLE public.pilot_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  work_email text NOT NULL,
  company text NOT NULL,
  oem_brands text,
  note text,
  source text NOT NULL DEFAULT 'website'
);

GRANT ALL ON public.pilot_leads TO service_role;

ALTER TABLE public.pilot_leads ENABLE ROW LEVEL SECURITY;

CREATE INDEX pilot_leads_email_created_idx ON public.pilot_leads (lower(work_email), created_at DESC);