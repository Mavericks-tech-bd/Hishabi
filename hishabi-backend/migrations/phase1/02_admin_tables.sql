-- Migration 02: admin_users + admin_audit_log
-- Why: separate admin identity from sellers (security isolation principle).
-- Sellers cannot escalate to admin via any path. Role-based access controls
-- all owner-only financial visibility (sale_fees, payments, courier_commissions).
-- What: 2 tables with strict RLS. Future staff onboarding = INSERT row, no schema change.

BEGIN;

-- Admin role enum (future-proof for staff hiring without schema migration).
DO $$ BEGIN
  CREATE TYPE public.admin_role AS ENUM ('owner', 'manager', 'staff', 'support');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.admin_users (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id    uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email               text NOT NULL UNIQUE,
  full_name           text,
  role                public.admin_role NOT NULL DEFAULT 'staff',
  is_active           boolean NOT NULL DEFAULT true,
  permissions         jsonb NOT NULL DEFAULT '{}'::jsonb,
  allowed_ips         text[] DEFAULT NULL,
  device_fingerprint  text DEFAULT NULL,
  last_login_at       timestamptz,
  last_login_ip       text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_role     ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active   ON public.admin_users(is_active) WHERE is_active = true;

CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Audit log: append-only record of every admin action.
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id              bigserial PRIMARY KEY,
  actor_admin_id  uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  actor_email     text NOT NULL,
  action          text NOT NULL,
  target_type     text,
  target_id       text,
  details         jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address      inet,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor    ON public.admin_audit_log(actor_admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action   ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_target   ON public.admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_created  ON public.admin_audit_log(created_at DESC);

-- RLS: lock down both tables. Only owner role can read admin_users + audit log.
ALTER TABLE public.admin_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log  ENABLE ROW LEVEL SECURITY;

-- Helper: is current authenticated user a specific admin role?
CREATE OR REPLACE FUNCTION public.current_admin_role()
RETURNS public.admin_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.admin_users
  WHERE supabase_user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.current_admin_role() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.current_admin_role() TO authenticated;

-- Owner sees + modifies all admin_users. Other admins see only own row.
CREATE POLICY "owner_full_admin_users" ON public.admin_users FOR ALL
TO authenticated
USING (public.current_admin_role() = 'owner')
WITH CHECK (public.current_admin_role() = 'owner');

CREATE POLICY "self_read_admin_users" ON public.admin_users FOR SELECT
TO authenticated
USING (supabase_user_id = auth.uid());

-- Audit log: owner reads all. INSERT done via backend (service role bypasses RLS).
-- No UPDATE / DELETE policy = append-only enforced.
CREATE POLICY "owner_read_audit" ON public.admin_audit_log FOR SELECT
TO authenticated
USING (public.current_admin_role() = 'owner');

COMMIT;
