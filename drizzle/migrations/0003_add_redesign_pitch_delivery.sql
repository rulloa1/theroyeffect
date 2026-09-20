-- Adds pitch delivery to the existing public.redesign_runs: a share token for
-- the public /redesign/<token> page, a recipient address, the CRM link, and
-- the send timestamp.
--
-- The table is already live, so every statement is written to be safe to
-- re-run. Existing rows pick up a share token from the column default.

ALTER TABLE public.redesign_runs
  ADD COLUMN IF NOT EXISTS share_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS share_viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS lead_id uuid,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS redesign_runs_share_token_key
  ON public.redesign_runs (share_token);
