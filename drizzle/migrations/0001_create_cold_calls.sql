CREATE TABLE public.cold_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  phone text NOT NULL,
  website text,
  prospect_id uuid,
  redesign_run_id uuid REFERENCES public.redesign_runs(id) ON DELETE SET NULL,
  vapi_call_id text UNIQUE,
  status text NOT NULL DEFAULT 'queued',
  talking_points text,
  error_message text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cold_calls TO authenticated;
GRANT ALL ON public.cold_calls TO service_role;

ALTER TABLE public.cold_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage cold calls"
ON public.cold_calls
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX cold_calls_created_at_idx ON public.cold_calls (created_at DESC);