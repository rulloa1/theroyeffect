-- Redesign & Pitch Studio: one row per run of the pipeline that captures a
-- prospect's site, rebuilds the homepage, and drafts the outreach that goes
-- with it. Follows the public.prospects pattern (admin-only RLS, hex share
-- token for the public page).

CREATE TABLE public.redesign_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  host text NOT NULL,
  treatment text NOT NULL DEFAULT 'cinematic',
  pitch_angle text NOT NULL DEFAULT 'lost_enquiries',

  -- Pipeline progress. `step` is the 0-based index of the NEXT step to run.
  status text NOT NULL DEFAULT 'queued',
  step integer NOT NULL DEFAULT 0,
  progress integer NOT NULL DEFAULT 0,
  error text,

  -- Stage output.
  business_name text,
  contact_email text,
  capture jsonb NOT NULL DEFAULT '{}'::jsonb,
  audit jsonb NOT NULL DEFAULT '{}'::jsonb,
  design jsonb NOT NULL DEFAULT '{}'::jsonb,
  changes jsonb NOT NULL DEFAULT '[]'::jsonb,

  pitch_subject text,
  pitch_body text,
  pitch_rationale text,
  pitch_status text NOT NULL DEFAULT 'none',

  share_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  share_viewed_at timestamptz,
  lead_id uuid,
  sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT redesign_runs_treatment_check
    CHECK (treatment IN ('cinematic', 'cinematic_3d', 'editorial')),
  CONSTRAINT redesign_runs_angle_check
    CHECK (pitch_angle IN ('lost_enquiries', 'looks_dated', 'slow_on_mobile')),
  CONSTRAINT redesign_runs_status_check
    CHECK (status IN ('queued', 'running', 'complete', 'failed', 'cancelled', 'archived')),
  CONSTRAINT redesign_runs_pitch_status_check
    CHECK (pitch_status IN ('none', 'draft', 'sent', 'failed')),
  CONSTRAINT redesign_runs_step_check CHECK (step >= 0 AND step <= 6),
  CONSTRAINT redesign_runs_progress_check CHECK (progress >= 0 AND progress <= 100)
);

CREATE UNIQUE INDEX redesign_runs_share_token_key ON public.redesign_runs (share_token);
CREATE INDEX redesign_runs_recent_idx ON public.redesign_runs (created_at DESC);
CREATE INDEX redesign_runs_active_idx ON public.redesign_runs (status)
  WHERE status IN ('queued', 'running');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.redesign_runs TO authenticated;
GRANT ALL ON public.redesign_runs TO service_role;

ALTER TABLE public.redesign_runs ENABLE ROW LEVEL SECURITY;

-- No anon policy: the public /redesign/<token> page reads through the
-- service-role client, which bypasses RLS, so the token stays the only key.
CREATE POLICY "Admins manage redesign runs"
ON public.redesign_runs FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));
