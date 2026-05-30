-- Migration 03: plans + subscriptions
-- Why: existing sellers.plan enum locked to free/starter/max (3 tiers, plus
-- product/image limits). Locked 2026-05-28 pricing is 5 tiers
-- (Free/Starter/Growth/Pro/Business) with per-month conversation quota +
-- token budget per conv + page limit + image limit per product +
-- per-day conversation cap + decreasing sale_fee_pct. Product limit removed
-- entirely (sellers upload unlimited products). Plans become DATA, not enum —
-- easier to tweak pricing without schema migration.
-- What: plans table (seed 5 rows) + subscriptions (seller -> plan FK, period,
-- payment id reference). Future: SSLCommerz checkout writes here.

BEGIN;

CREATE TABLE IF NOT EXISTS public.plans (
  id                     text PRIMARY KEY,
  name                   text NOT NULL,
  price_bdt              integer NOT NULL CHECK (price_bdt >= 0),
  conversations_limit    integer NOT NULL CHECK (conversations_limit >= 0),
  token_budget_per_conv  integer NOT NULL CHECK (token_budget_per_conv > 0),
  per_day_conv_cap       integer NOT NULL CHECK (per_day_conv_cap > 0),
  pages_limit            integer NOT NULL CHECK (pages_limit >= 1),
  image_limit_per_product integer NULL CHECK (image_limit_per_product IS NULL OR image_limit_per_product > 0),
  sale_fee_pct           numeric(4,2) NOT NULL CHECK (sale_fee_pct >= 0 AND sale_fee_pct <= 100),
  features               jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active              boolean NOT NULL DEFAULT true,
  sort_order             integer NOT NULL DEFAULT 0,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- image_limit_per_product NULL = unlimited (Growth / Pro / Business).
-- token_budget_per_conv = max output tokens AI can spend on one customer's
-- 24hr conversation window before escalating to human.
-- per_day_conv_cap = abuse guard, max distinct customers AI can open new
-- convs with per day.

CREATE TRIGGER trg_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed the 5 tiers (idempotent via ON CONFLICT). LOCKED 2026-05-28.
-- See memory/project_pricing_plans.md and repo-root admin.md for full
-- business rationale (margins, hidden revenue streams, upgrade pressure).
INSERT INTO public.plans
  (id, name, price_bdt, conversations_limit, token_budget_per_conv, per_day_conv_cap, pages_limit, image_limit_per_product, sale_fee_pct, sort_order)
VALUES
  ('free',     'Free',        0,    30,   800,   5,   1, 3,    1.00, 1),
  ('starter',  'Starter',   199,   150,  1400,  30,   1, 10,   1.00, 2),
  ('growth',   'Growth',    499,   600,  2000,  60,   2, NULL, 1.00, 3),
  ('pro',      'Pro',       999,  1800,  3200, 150,   3, NULL, 0.70, 4),
  ('business', 'Business', 2499,  4500,  4700, 300,   5, NULL, 0.50, 5)
ON CONFLICT (id) DO UPDATE SET
  name                    = EXCLUDED.name,
  price_bdt               = EXCLUDED.price_bdt,
  conversations_limit     = EXCLUDED.conversations_limit,
  token_budget_per_conv   = EXCLUDED.token_budget_per_conv,
  per_day_conv_cap        = EXCLUDED.per_day_conv_cap,
  pages_limit             = EXCLUDED.pages_limit,
  image_limit_per_product = EXCLUDED.image_limit_per_product,
  sale_fee_pct            = EXCLUDED.sale_fee_pct,
  sort_order              = EXCLUDED.sort_order;

-- Subscriptions: one ACTIVE row per seller, history retained.
DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'expired', 'pending_payment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id             uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  plan_id               text NOT NULL REFERENCES public.plans(id),
  status                public.subscription_status NOT NULL DEFAULT 'pending_payment',
  period_start          timestamptz NOT NULL DEFAULT now(),
  period_end            timestamptz NOT NULL,
  auto_renew            boolean NOT NULL DEFAULT false,
  sslcommerz_tran_id    text,
  amount_paid_bdt       integer,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subs_seller          ON public.subscriptions(seller_id);
CREATE INDEX IF NOT EXISTS idx_subs_status          ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subs_period_end      ON public.subscriptions(period_end);

-- Only one ACTIVE subscription per seller at a time.
CREATE UNIQUE INDEX IF NOT EXISTS uq_subs_active_per_seller
  ON public.subscriptions(seller_id)
  WHERE status = 'active';

CREATE TRIGGER trg_subs_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS.
ALTER TABLE public.plans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans: public read (any authenticated user can see pricing).
CREATE POLICY "plans_read_all" ON public.plans FOR SELECT
TO authenticated
USING (is_active = true);

-- Plans: only owner can modify.
CREATE POLICY "plans_owner_write" ON public.plans FOR ALL
TO authenticated
USING (public.current_admin_role() = 'owner')
WITH CHECK (public.current_admin_role() = 'owner');

-- Subscriptions: seller sees only own. Owner sees all.
CREATE POLICY "subs_own_seller" ON public.subscriptions FOR SELECT
TO authenticated
USING (seller_id = auth.uid() OR public.current_admin_role() = 'owner');

-- Sellers cannot directly INSERT/UPDATE/DELETE — only backend via service role.
-- (No write policy = write blocked for authenticated role.)

COMMIT;
