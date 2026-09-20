-- Adds a delivery_url column and a daily cron trigger for the delivery
-- automation route (support-window-closing + retainer-weekly-sync).
-- Follows the same pattern as followup-autopilot and prospect-crm-sync.

ALTER TABLE private.automation_config
  ADD COLUMN IF NOT EXISTS delivery_url text NOT NULL DEFAULT
    'https://project--562bff25-798c-4deb-b966-1843715c88c5.lovable.app/api/public/automation/delivery';

CREATE OR REPLACE FUNCTION private.trigger_delivery_automation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public, extensions
AS $$
DECLARE
  cfg private.automation_config%ROWTYPE;
BEGIN
  SELECT * INTO cfg FROM private.automation_config WHERE id = true;
  PERFORM net.http_post(
    url := cfg.delivery_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-automation-token', cfg.cron_token),
    body := '{}'::jsonb
  );
END;
$$;
REVOKE ALL ON FUNCTION private.trigger_delivery_automation() FROM PUBLIC, anon, authenticated;

-- Unscheduled any prior version of this job (safe to re-run).
SELECT cron.unschedule('delivery-automation-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'delivery-automation-daily');

-- Daily at 9:00 AM CT (14:00 UTC). The support-window-closing logic
-- filters by date range so it only fires on day 12-14; the weekly
-- sync sends every Monday (the route checks the day internally).
SELECT cron.schedule(
  'delivery-automation-daily',
  '0 14 * * *',
  $$SELECT private.trigger_delivery_automation();$$
);
