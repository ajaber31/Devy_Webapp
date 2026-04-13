-- ============================================================
-- Devy Phase 3: Billing & Subscription
-- ============================================================

-- ----------------------------------------
-- Table: subscriptions
-- One row per user. Upserted by Stripe webhook handler.
-- Users cannot write to this table directly — all writes
-- come from the service-role client in the webhook handler.
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Stripe identifiers (null for free users who have never subscribed)
  stripe_customer_id     text        UNIQUE,
  stripe_subscription_id text        UNIQUE,
  stripe_price_id        text,

  -- Plan state
  plan_id                text        NOT NULL DEFAULT 'free'
                                     CHECK (plan_id IN ('free', 'standard', 'professional')),
  status                 text        NOT NULL DEFAULT 'active'
                                     CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'paused')),

  -- Billing period
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean     NOT NULL DEFAULT false,
  canceled_at            timestamptz,

  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only SELECT their own row; all writes go through service role
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ----------------------------------------
-- Table: daily_usage_log
-- One row per (user_id, usage_date). Because the date is UTC,
-- counts reset automatically at midnight UTC each day.
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_usage_log (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usage_date     date    NOT NULL DEFAULT CURRENT_DATE,
  question_count integer NOT NULL DEFAULT 0,

  UNIQUE (user_id, usage_date)
);

ALTER TABLE public.daily_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage"
  ON public.daily_usage_log FOR SELECT
  USING (auth.uid() = user_id);

-- ----------------------------------------
-- Function: increment_daily_usage
-- Atomically increments today's question count for a user.
-- Returns the NEW count after the increment.
-- Called from /api/chat before streaming starts.
-- SECURITY DEFINER so it can write regardless of RLS.
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.increment_daily_usage(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO public.daily_usage_log (user_id, usage_date, question_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET question_count = daily_usage_log.question_count + 1
  RETURNING question_count INTO v_count;

  RETURN v_count;
END;
$$;

-- ----------------------------------------
-- Function: get_daily_usage
-- Returns today's question count for a user (0 if no row yet).
-- SECURITY DEFINER so it can read regardless of RLS.
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.get_daily_usage(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT question_count INTO v_count
  FROM public.daily_usage_log
  WHERE user_id = p_user_id
    AND usage_date = CURRENT_DATE;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- ----------------------------------------
-- Trigger: auto-create a free subscription row when a profile
-- is created so every user always has a subscription record.
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_profile_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_create_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_subscription();

-- ----------------------------------------
-- Backfill: give every existing user a free subscription row.
-- Idempotent — safe to re-run.
-- ----------------------------------------
INSERT INTO public.subscriptions (user_id, plan_id, status)
SELECT id, 'free', 'active'
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- ----------------------------------------
-- Indexes for fast lookups from the webhook handler
-- ----------------------------------------
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON public.subscriptions (stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription
  ON public.subscriptions (stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date
  ON public.daily_usage_log (user_id, usage_date);
