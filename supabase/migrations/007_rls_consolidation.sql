-- ─── Migration 007: RLS Consolidation & Function Hardening ──────────────────
-- Two generations of RLS policies coexisted on most tables: an older set
-- created via the dashboard and the hardened set from migration 004. Because
-- permissive policies are OR'd together, the older, weaker policies silently
-- undermined the newer ones. Most critically, the legacy "own profile update"
-- policy on profiles had no role/status guard — any user could promote
-- themselves to admin via the REST API.
--
-- This migration:
--   1. Drops every legacy/duplicate policy (fixes privilege escalation,
--      audit-log spoofing, and non-ready document metadata exposure).
--   2. Recreates the kept policies scoped TO authenticated with
--      (SELECT auth.uid()) initplan optimization (fixes all 32
--      auth_rls_initplan warnings and 110 multiple_permissive_policies
--      warnings from the Supabase performance advisor).
--   3. Hardens SECURITY DEFINER functions: daily-usage functions now reject
--      calls for other users' IDs; anon can no longer execute any of them.
--   4. Adds covering indexes for the 5 unindexed foreign keys.

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. DROP LEGACY / DUPLICATE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- profiles — legacy update policy allowed self-role-escalation (CRITICAL)
DROP POLICY IF EXISTS "own profile read"   ON public.profiles;
DROP POLICY IF EXISTS "own profile update" ON public.profiles;

-- children — duplicates of "users manage own children"
DROP POLICY IF EXISTS "children select" ON public.children;
DROP POLICY IF EXISTS "children insert" ON public.children;
DROP POLICY IF EXISTS "children update" ON public.children;
DROP POLICY IF EXISTS "children delete" ON public.children;

-- conversations — duplicates of "users manage own conversations"
DROP POLICY IF EXISTS "conv select" ON public.conversations;
DROP POLICY IF EXISTS "conv insert" ON public.conversations;
DROP POLICY IF EXISTS "conv update" ON public.conversations;
DROP POLICY IF EXISTS "conv delete" ON public.conversations;

-- messages — duplicates of "users * own messages"
DROP POLICY IF EXISTS "msg select" ON public.messages;
DROP POLICY IF EXISTS "msg insert" ON public.messages;
DROP POLICY IF EXISTS "msg delete" ON public.messages;

-- documents — legacy admin policy used a bare profiles subquery and had no
-- WITH CHECK; legacy read policy exposed non-ready docs (incl. error_message)
DROP POLICY IF EXISTS "Admins can manage documents"           ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can read documents" ON public.documents;

-- document_chunks — duplicates
DROP POLICY IF EXISTS "Admins can insert chunks"            ON public.document_chunks;
DROP POLICY IF EXISTS "Admins can delete chunks"            ON public.document_chunks;
DROP POLICY IF EXISTS "Authenticated users can read chunks" ON public.document_chunks;

-- subscriptions — duplicate read policy
DROP POLICY IF EXISTS "Users can read own subscription" ON public.subscriptions;

-- privacy_audit_log — duplicate read policy + always-true INSERT policy.
-- The INSERT policy applied to ALL roles (service role bypasses RLS and never
-- needed it), letting any user forge audit entries.
DROP POLICY IF EXISTS "Users can view own audit events"       ON public.privacy_audit_log;
DROP POLICY IF EXISTS "Service role can insert audit events"  ON public.privacy_audit_log;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. RECREATE KEPT POLICIES — TO authenticated, initplan-optimized
-- ═══════════════════════════════════════════════════════════════════════════

-- profiles ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "users read own profile"    ON public.profiles;
DROP POLICY IF EXISTS "users update own profile"  ON public.profiles;
DROP POLICY IF EXISTS "admin read all profiles"   ON public.profiles;
DROP POLICY IF EXISTS "admin update all profiles" ON public.profiles;

CREATE POLICY "users read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

-- Users may update safe fields but never role or status.
CREATE POLICY "users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (
    id = (SELECT auth.uid())
    AND role   = (SELECT p.role   FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
    AND status = (SELECT p.status FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
  );

CREATE POLICY "admin read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT public.get_user_role()) = 'admin');

CREATE POLICY "admin update all profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT public.get_user_role()) = 'admin');

-- children ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "users manage own children" ON public.children;

CREATE POLICY "users manage own children" ON public.children
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- conversations ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "users manage own conversations" ON public.conversations;

CREATE POLICY "users manage own conversations" ON public.conversations
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- messages ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "users select own messages" ON public.messages;
DROP POLICY IF EXISTS "users insert own messages" ON public.messages;
DROP POLICY IF EXISTS "users delete own messages" ON public.messages;

CREATE POLICY "users select own messages" ON public.messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND c.user_id = (SELECT auth.uid())
  ));

CREATE POLICY "users insert own messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND c.user_id = (SELECT auth.uid())
  ));

CREATE POLICY "users delete own messages" ON public.messages
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND c.user_id = (SELECT auth.uid())
  ));

-- documents ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins manage documents"       ON public.documents;
DROP POLICY IF EXISTS "authenticated read ready docs" ON public.documents;

CREATE POLICY "admins manage documents" ON public.documents
  FOR ALL TO authenticated
  USING ((SELECT public.get_user_role()) = 'admin')
  WITH CHECK ((SELECT public.get_user_role()) = 'admin');

CREATE POLICY "authenticated read ready docs" ON public.documents
  FOR SELECT TO authenticated
  USING (status = 'ready');

-- document_chunks ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins manage chunks"      ON public.document_chunks;
DROP POLICY IF EXISTS "authenticated read chunks" ON public.document_chunks;

CREATE POLICY "admins manage chunks" ON public.document_chunks
  FOR ALL TO authenticated
  USING ((SELECT public.get_user_role()) = 'admin')
  WITH CHECK ((SELECT public.get_user_role()) = 'admin');

CREATE POLICY "authenticated read chunks" ON public.document_chunks
  FOR SELECT TO authenticated
  USING (true);

-- subscriptions ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "users read own subscription" ON public.subscriptions;

CREATE POLICY "users read own subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- privacy_audit_log ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "users read own audit log"        ON public.privacy_audit_log;
DROP POLICY IF EXISTS "Admins can view all audit events" ON public.privacy_audit_log;

CREATE POLICY "users read own audit log" ON public.privacy_audit_log
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all audit events" ON public.privacy_audit_log
  FOR SELECT TO authenticated
  USING ((SELECT public.get_user_role()) = 'admin');

-- daily_usage_log ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own usage" ON public.daily_usage_log;

CREATE POLICY "Users can read own usage" ON public.daily_usage_log
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- incident_log ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage incident log" ON public.incident_log;

CREATE POLICY "Admins can manage incident log" ON public.incident_log
  FOR ALL TO authenticated
  USING ((SELECT public.get_user_role()) = 'admin')
  WITH CHECK ((SELECT public.get_user_role()) = 'admin');

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. SECURITY DEFINER FUNCTION HARDENING
-- ═══════════════════════════════════════════════════════════════════════════

-- Daily-usage functions were callable by any signed-in user with an arbitrary
-- p_user_id — letting one user read another's usage or burn their daily quota.
-- Non-service-role callers may now only act on their own user ID.

CREATE OR REPLACE FUNCTION public.get_daily_usage(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
BEGIN
  IF auth.role() <> 'service_role' AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'permission denied: can only query own usage';
  END IF;

  SELECT question_count INTO v_count
  FROM public.daily_usage_log
  WHERE user_id = p_user_id
    AND usage_date = CURRENT_DATE;
  RETURN COALESCE(v_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_usage(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
BEGIN
  IF auth.role() <> 'service_role' AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'permission denied: can only increment own usage';
  END IF;

  INSERT INTO public.daily_usage_log (user_id, usage_date, question_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET question_count = daily_usage_log.question_count + 1
  RETURNING question_count INTO v_count;
  RETURN v_count;
END;
$$;

-- Anonymous visitors could invoke every SECURITY DEFINER function via
-- /rest/v1/rpc/* — including match_chunks, which bypasses RLS and would let
-- an unauthenticated caller exfiltrate the entire knowledge base.
REVOKE EXECUTE ON FUNCTION public.match_chunks(extensions.vector, double precision, integer, text[]) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_role()                 FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_daily_usage(uuid)           FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.increment_daily_usage(uuid)     FROM anon, public;

-- Internal trigger functions should not be exposed via the API at all.
-- (Trigger firing does not require EXECUTE, so this is safe.)
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                     FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at()                   FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_incident_log_updated_at()      FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_profile_subscription()     FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()                     FROM anon, authenticated, public;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. COVERING INDEXES FOR UNINDEXED FOREIGN KEYS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_children_user_id           ON public.children(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_child_id     ON public.conversations(child_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by      ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_incident_log_reported_by   ON public.incident_log(reported_by);
CREATE INDEX IF NOT EXISTS idx_subscriptions_granted_by   ON public.subscriptions(plan_granted_by);
