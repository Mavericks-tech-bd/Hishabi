-- Migration 08: financial tables (OWNER-ONLY visibility)
-- Why: Forhad's revenue streams = subscription + 1% sale fee + courier commission.
-- Staff (manager/staff/support) must NEVER see these numbers. Triple-layer:
-- RLS (here) + backend authorization + frontend menu hide.
-- What: 4 tables, each with owner-only SELECT RLS. Backend writes via service role.

BEGIN;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('initiated', 'success', 'failed', 'refunded', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.courier_provider AS ENUM ('pathao', 'redx', 'steadfast', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.courier_status AS ENUM ('created', 'picked_up', 'in_transit', 'delivered', 'returned', 'failed', 'canceled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. payment_transactions — every SSLCommerz transaction (seller subscriptions).
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id             uuid NOT NULL REFERENCES public.sellers(id) ON DELETE RESTRICT,
  subscription_id       uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount_bdt            numeric(12,2) NOT NULL,
  currency              text NOT NULL DEFAULT 'BDT',
  status                public.payment_status NOT NULL DEFAULT 'initiated',
  sslcommerz_tran_id    text UNIQUE,
  sslcommerz_session_id text,
  bank_tran_id          text,
  card_type             text,
  store_amount          numeric(12,2),
  ipn_payload           jsonb,
  initiated_at          timestamptz NOT NULL DEFAULT now(),
  completed_at          timestamptz,
  failure_reason        text,
  refunded_at           timestamptz,
  refund_amount         numeric(12,2),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pay_seller     ON public.payment_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_pay_status     ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_pay_created    ON public.payment_transactions(created_at DESC);

CREATE TRIGGER trg_pay_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. sale_fees — 1% per AI-confirmed order (Forhad's per-transaction revenue).
CREATE TABLE IF NOT EXISTS public.sale_fees (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  seller_id       uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  order_total     numeric(12,2) NOT NULL,
  fee_pct         numeric(4,2) NOT NULL,
  fee_amount_bdt  numeric(12,2) NOT NULL,
  is_collected    boolean NOT NULL DEFAULT false,
  collected_at    timestamptz,
  collection_ref  text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sf_seller       ON public.sale_fees(seller_id);
CREATE INDEX IF NOT EXISTS idx_sf_uncollected  ON public.sale_fees(seller_id) WHERE is_collected = false;
CREATE INDEX IF NOT EXISTS idx_sf_created      ON public.sale_fees(created_at DESC);

CREATE TRIGGER trg_sf_updated_at
  BEFORE UPDATE ON public.sale_fees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. courier_jobs — booked deliveries via Pathao/RedX/Steadfast.
-- (Seller-visible: they see job status. Commissions hidden.)
CREATE TABLE IF NOT EXISTS public.courier_jobs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  seller_id           uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  provider            public.courier_provider NOT NULL,
  provider_tracking   text,
  consignment_id      text,
  status              public.courier_status NOT NULL DEFAULT 'created',
  delivery_fee_bdt    numeric(12,2),
  cod_amount_bdt      numeric(12,2),
  pickup_address      jsonb,
  delivery_address    jsonb,
  api_response        jsonb,
  booked_at           timestamptz NOT NULL DEFAULT now(),
  delivered_at        timestamptz,
  returned_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cj_seller       ON public.courier_jobs(seller_id);
CREATE INDEX IF NOT EXISTS idx_cj_order        ON public.courier_jobs(order_id);
CREATE INDEX IF NOT EXISTS idx_cj_status       ON public.courier_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cj_provider     ON public.courier_jobs(provider);

CREATE TRIGGER trg_cj_updated_at
  BEFORE UPDATE ON public.courier_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. courier_commissions — Forhad's per-booking earning from courier partner.
-- OWNER-ONLY (seller never sees).
CREATE TABLE IF NOT EXISTS public.courier_commissions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_job_id      uuid NOT NULL UNIQUE REFERENCES public.courier_jobs(id) ON DELETE CASCADE,
  provider            public.courier_provider NOT NULL,
  commission_bdt      numeric(12,2) NOT NULL,
  is_paid             boolean NOT NULL DEFAULT false,
  paid_at             timestamptz,
  settlement_ref      text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cc_provider     ON public.courier_commissions(provider);
CREATE INDEX IF NOT EXISTS idx_cc_unpaid       ON public.courier_commissions(provider) WHERE is_paid = false;
CREATE INDEX IF NOT EXISTS idx_cc_created      ON public.courier_commissions(created_at DESC);

CREATE TRIGGER trg_cc_updated_at
  BEFORE UPDATE ON public.courier_commissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS on all 4.
ALTER TABLE public.payment_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_fees             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_jobs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_commissions   ENABLE ROW LEVEL SECURITY;

-- payment_transactions: seller sees OWN history (they paid the money).
-- Owner sees all. Other admin roles BLOCKED.
CREATE POLICY "pay_seller_own_or_owner" ON public.payment_transactions FOR SELECT
TO authenticated
USING (seller_id = auth.uid() OR public.current_admin_role() = 'owner');

-- sale_fees: OWNER-ONLY (seller does not see Forhad's cut).
CREATE POLICY "sf_owner_only" ON public.sale_fees FOR SELECT
TO authenticated
USING (public.current_admin_role() = 'owner');

-- courier_jobs: seller sees OWN (they need delivery status). Owner + manager + support also.
CREATE POLICY "cj_seller_own_or_admin" ON public.courier_jobs FOR SELECT
TO authenticated
USING (seller_id = auth.uid() OR public.current_admin_role() IN ('owner', 'manager', 'support'));

-- courier_commissions: OWNER-ONLY.
CREATE POLICY "cc_owner_only" ON public.courier_commissions FOR SELECT
TO authenticated
USING (public.current_admin_role() = 'owner');

-- No INSERT/UPDATE/DELETE policies = backend (service role) writes only.

COMMIT;
