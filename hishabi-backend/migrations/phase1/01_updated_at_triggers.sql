-- Migration 01: updated_at triggers
-- Why: existing tables only track created_at. We need updated_at for audit,
-- realtime sync, conflict resolution, and incremental ETL later.
-- What: generic trigger function + ALTER + trigger on 5 existing tables.

BEGIN;

-- Generic trigger function (reusable for all future tables).
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at column + trigger to each existing table.
ALTER TABLE public.sellers         ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.products        ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.customers       ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.orders          ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.product_images  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_sellers_updated_at        ON public.sellers;
DROP TRIGGER IF EXISTS trg_products_updated_at       ON public.products;
DROP TRIGGER IF EXISTS trg_customers_updated_at      ON public.customers;
DROP TRIGGER IF EXISTS trg_orders_updated_at         ON public.orders;
DROP TRIGGER IF EXISTS trg_product_images_updated_at ON public.product_images;

CREATE TRIGGER trg_sellers_updated_at        BEFORE UPDATE ON public.sellers        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated_at       BEFORE UPDATE ON public.products       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_customers_updated_at      BEFORE UPDATE ON public.customers      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated_at         BEFORE UPDATE ON public.orders         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_product_images_updated_at BEFORE UPDATE ON public.product_images FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
