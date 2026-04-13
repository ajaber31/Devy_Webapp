-- ─── Migration 004: Security Hardening ─────────────────────────────────────
-- Run in Supabase SQL Editor (or via supabase db push).
-- Idempotent: all CREATE TABLE / CREATE POLICY statements use IF NOT EXISTS
-- or DROP IF EXISTS + recreate.

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. WEBHOOK IDEMPOTENCY TABLE
--    Prevents Stripe retry storms from sending duplicate emails.
--    Entries older than 7 days are cleaned up by a scheduled function.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
  event_id    TEXT        PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-purge entries older than 7 days (requires pg_cron extension).
-- If pg_cron is not enabled, you can run the DELETE manually or via a
-- Supabase Edge Function on a schedule.
DO $outer$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'purge-processed-webhook-events',
      '0 3 * * *',
      'DELETE FROM public.processed_webhook_events WHERE processed_at < NOW() - INTERVAL ''7 days'''
    );
  END IF;
END;
$outer$;

-- RLS: only the service role (bypasses RLS) can insert/select processed events.
-- Regular users have no access.
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- No user-facing policies — service role bypasses RLS entirely.
-- If you need an admin read policy, add it here.


-- ═══════════════════════════════════════════════════════════════════════════
-- 2. MESSAGES TABLE — ownership-scoped RLS
--    Users can only read/write messages in conversations they own.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users select own messages"  ON public.messages;
DROP POLICY IF EXISTS "users insert own messages"  ON public.messages;
DROP POLICY IF EXISTS "users delete own messages"  ON public.messages;

CREATE POLICY "users select own messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "users insert own messages" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "users delete own messages" ON public.messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- 3. CONVERSATIONS TABLE — ownership RLS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own conversations" ON public.conversations;

CREATE POLICY "users manage own conversations" ON public.conversations
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. CHILDREN TABLE — ownership RLS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own children" ON public.children;

CREATE POLICY "users manage own children" ON public.children
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════════════════
-- 5. DOCUMENTS TABLE — admin-only write, authenticated read for ready docs
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins manage documents"    ON public.documents;
DROP POLICY IF EXISTS "authenticated read ready docs" ON public.documents;

-- Admins can do everything
CREATE POLICY "admins manage documents" ON public.documents
  FOR ALL USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- Authenticated users can read the count/metadata of ready documents
-- (needed for the dashboard "ready document count" call)
CREATE POLICY "authenticated read ready docs" ON public.documents
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND status = 'ready'
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- 6. DOCUMENT_CHUNKS TABLE — admin write, authenticated read (semantic search)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins manage chunks"       ON public.document_chunks;
DROP POLICY IF EXISTS "authenticated read chunks"  ON public.document_chunks;

CREATE POLICY "admins manage chunks" ON public.document_chunks
  FOR ALL USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- Authenticated users can read chunks (required for match_chunks RPC / semantic search)
CREATE POLICY "authenticated read chunks" ON public.document_chunks
  FOR SELECT USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════════════════════
-- 7. SUBSCRIPTIONS TABLE — users read own row, NO user write access
--    All writes go through the service role (webhook + billing actions).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might allow user writes
DROP POLICY IF EXISTS "users read own subscription"  ON public.subscriptions;
DROP POLICY IF EXISTS "users write own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "users insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "users update own subscription" ON public.subscriptions;

-- Read-only for the owning user
CREATE POLICY "users read own subscription" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- NO INSERT / UPDATE / DELETE policy for regular users.
-- Service role bypasses RLS — all writes happen via service-role actions.


-- ═══════════════════════════════════════════════════════════════════════════
-- 8. PROFILES TABLE — users read/update own row, cannot change role/status
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own profile"   ON public.profiles;
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;

CREATE POLICY "users read own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update safe fields (name, consent) but NOT role or status.
-- We enforce this with a WITH CHECK that rejects any row where role or status
-- differs from the current stored value.
CREATE POLICY "users update own profile" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Prevent self-escalation: new role must equal current role
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM public.profiles WHERE id = auth.uid())
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- 9. PRIVACY_AUDIT_LOG TABLE — users read own entries, NO user writes
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.privacy_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own audit log"   ON public.privacy_audit_log;
DROP POLICY IF EXISTS "users write audit log"      ON public.privacy_audit_log;

CREATE POLICY "users read own audit log" ON public.privacy_audit_log
  FOR SELECT USING (user_id = auth.uid());

-- NO INSERT / UPDATE / DELETE for users — service role only.
