-- Lock down profile fields the app trusts.
--
-- profiles.email is used to attach guest checkouts, project briefs and past
-- purchases to an account (payments webhook resolveUserId, brief intake,
-- handle_new_user). The original table-wide UPDATE grant let any signed-in
-- user set their own profile email to someone else's address and receive that
-- person's orders, brief PDF and Stripe billing portal. stripe_customer_id had
-- the same exposure.
--
-- After this migration, email is only ever written from auth.users, and
-- clients can edit only the contact fields the portal form saves
-- (saveMyProfile in src/utils/portal.functions.ts).

REVOKE INSERT, UPDATE ON public.profiles FROM authenticated;

GRANT UPDATE (
  full_name,
  company,
  phone,
  website,
  city,
  time_zone,
  preferred_contact,
  notes,
  onboarding_completed_at,
  updated_at
) ON public.profiles TO authenticated;

-- Undo any profile email that no longer matches the account's real email.
UPDATE public.profiles AS p
SET email = u.email
FROM auth.users AS u
WHERE u.id = p.id
  AND p.email IS DISTINCT FROM u.email;

-- Keep profiles.email in step when a user changes their auth email.
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_profile_email() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed
AFTER UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_email();
