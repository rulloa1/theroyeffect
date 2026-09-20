CREATE TABLE public.redesign_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  host text NOT NULL,
  treatment text NOT NULL DEFAULT 'cinematic',
  angle text NOT NULL DEFAULT 'lost_enquiries',
  status text NOT NULL DEFAULT 'draft',
  scan jsonb NOT NULL DEFAULT '{}'::jsonb,
  headline text,
  subheadline text,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  outreach_subject text,
  outreach_body text,
  error_message text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.redesign_runs TO authenticated;
GRANT ALL ON public.redesign_runs TO service_role;

ALTER TABLE public.redesign_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage redesign runs"
ON public.redesign_runs
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX redesign_runs_created_at_idx ON public.redesign_runs (created_at DESC);