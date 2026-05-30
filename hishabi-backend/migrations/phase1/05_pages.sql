-- Migration 05: pages (connected FB/IG/WA channels)
-- Why: each seller can connect multiple Meta surfaces. Webhooks need fast
-- lookup: external page_id -> seller_id. Tokens encrypted (app-level AES,
-- never returned to frontend).
-- What: pages table with channel enum, external_id, encrypted token bytea,
-- per-seller scoped RLS. Backend (service role) writes encrypted bytes.

BEGIN;

DO $$ BEGIN
  CREATE TYPE public.channel AS ENUM ('messenger', 'instagram', 'whatsapp');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.page_status AS ENUM ('active', 'disconnected', 'token_expired', 'error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.pages (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id                uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  channel                  public.channel NOT NULL,
  external_id              text NOT NULL,
  display_name             text NOT NULL,
  username                 text,
  profile_picture_url      text,
  access_token_encrypted   bytea NOT NULL,
  token_expires_at         timestamptz,
  webhook_subscribed       boolean NOT NULL DEFAULT false,
  status                   public.page_status NOT NULL DEFAULT 'active',
  meta                     jsonb NOT NULL DEFAULT '{}'::jsonb,
  connected_at             timestamptz NOT NULL DEFAULT now(),
  disconnected_at          timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),

  UNIQUE (channel, external_id)
);

CREATE INDEX IF NOT EXISTS idx_pages_seller        ON public.pages(seller_id);
CREATE INDEX IF NOT EXISTS idx_pages_channel       ON public.pages(channel);
CREATE INDEX IF NOT EXISTS idx_pages_status        ON public.pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_external      ON public.pages(channel, external_id);

CREATE TRIGGER trg_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Seller sees own pages BUT token bytes never exposed via REST/RLS read.
-- Frontend must use a view that omits the encrypted column.
CREATE POLICY "pages_own_seller_read" ON public.pages FOR SELECT
TO authenticated
USING (seller_id = auth.uid() OR public.current_admin_role() IN ('owner', 'manager'));

-- INSERT / UPDATE / DELETE done by backend only (no policy = denied).

-- Safe view for frontend (no token).
CREATE OR REPLACE VIEW public.v_pages_safe AS
SELECT
  id, seller_id, channel, external_id, display_name, username,
  profile_picture_url, webhook_subscribed, status, meta,
  connected_at, disconnected_at, token_expires_at, created_at, updated_at
FROM public.pages;

GRANT SELECT ON public.v_pages_safe TO authenticated;

COMMIT;
