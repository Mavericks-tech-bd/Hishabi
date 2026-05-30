-- Migration 07: expand customers + orders
-- Why: customers currently manual-add only. AI must auto-create on first DM.
-- Orders single-product only; real F-commerce orders are multi-item with size/color.
-- What: add channel + external_id + page link to customers; add items jsonb +
-- source enum + page/conversation refs to orders.

BEGIN;

DO $$ BEGIN
  CREATE TYPE public.order_source AS ENUM ('ai', 'manual', 'imported');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Customers expansion.
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS channel             public.channel,
  ADD COLUMN IF NOT EXISTS external_id         text,
  ADD COLUMN IF NOT EXISTS page_id             uuid REFERENCES public.pages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS first_contact_at    timestamptz,
  ADD COLUMN IF NOT EXISTS last_contact_at     timestamptz,
  ADD COLUMN IF NOT EXISTS total_orders_count  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lifetime_value_bdt  numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes               text;

CREATE INDEX IF NOT EXISTS idx_customers_external
  ON public.customers(channel, external_id) WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_seller_phone
  ON public.customers(seller_id, phone) WHERE phone IS NOT NULL;

-- Per-channel unique customer per seller (avoids duplicates from same FB user).
CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_channel_external
  ON public.customers(seller_id, channel, external_id)
  WHERE external_id IS NOT NULL;

-- Orders expansion.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS items              jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS source             public.order_source NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS conversation_id    uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS page_id            uuid REFERENCES public.pages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subtotal           numeric(12,2),
  ADD COLUMN IF NOT EXISTS shipping_charge    numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount           numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS confirmed_at       timestamptz,
  ADD COLUMN IF NOT EXISTS notes              text;

CREATE INDEX IF NOT EXISTS idx_orders_seller_status   ON public.orders(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_conversation    ON public.orders(conversation_id);
CREATE INDEX IF NOT EXISTS idx_orders_confirmed_at    ON public.orders(confirmed_at DESC);

-- Note: existing product_id + quantity columns retained for backward compat.
-- New orders via AI populate items jsonb instead. Backend reads items first,
-- falls back to product_id+quantity for legacy rows. Eventually drop legacy
-- columns when no rows remain that use them.

COMMIT;
