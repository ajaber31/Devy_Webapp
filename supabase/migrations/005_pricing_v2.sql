-- ============================================================
-- Devy Pricing v2: Starter ($29.99) + Professional ($99.99)
-- Replaces the 4-tier model (free/starter/pro/clinician).
-- Every new signup gets a 14-day free trial on Starter.
-- petits_genies hidden plan retained for clinic grants.
-- ============================================================

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_id_check;

UPDATE public.subscriptions
SET plan_id = 'professional', updated_at = now()
WHERE plan_id = 'pro';

-- Drop privacy_audit_log FK so account deletion can cascade through profiles.
-- Audit log is append-only (RULES block UPDATE/DELETE), so the FK was preventing
-- the SET NULL cascade from running. Removing the FK keeps the original user_id
-- intact in the audit log even after the user is deleted, which is the right
-- behavior for compliance (audit trails should outlive accounts).
ALTER TABLE public.privacy_audit_log
  DROP CONSTRAINT IF EXISTS privacy_audit_log_user_id_fkey;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_id_check
  CHECK (plan_id IN ('starter', 'professional', 'petits_genies'));

ALTER TABLE public.subscriptions ALTER COLUMN plan_id SET DEFAULT 'starter';
ALTER TABLE public.subscriptions ALTER COLUMN status  SET DEFAULT 'trialing';

-- Auto-create trigger: every new signup -> 14-day Starter trial
CREATE OR REPLACE FUNCTION public.handle_new_profile_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, status, trial_ends_at)
  VALUES (NEW.id, 'starter', 'trialing', now() + interval '14 days')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
