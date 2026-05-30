-- Migration 06: conversations + messages + needs_human_replies
-- Why: every DM webhook lands here. Conversations bucket 24h+ window per
-- customer per page. Messages stream chronologically. needs_human queue lets
-- seller fix what AI couldn't handle.
-- What: 3 tables. Heavy indexes (this is the hottest read path post-launch).

BEGIN;

DO $$ BEGIN
  CREATE TYPE public.conversation_status AS ENUM ('active', 'order_confirmed', 'needs_human', 'closed', 'spam');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.message_direction AS ENUM ('inbound', 'outbound');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.message_sender AS ENUM ('customer', 'ai', 'seller', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.escalation_reason AS ENUM ('low_confidence', 'customer_complaint', 'unknown_product', 'manual_request', 'payment_dispute', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.conversations (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id                uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  page_id                  uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  customer_id              uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  external_customer_id     text NOT NULL,
  channel                  public.channel NOT NULL,
  status                   public.conversation_status NOT NULL DEFAULT 'active',
  last_message_at          timestamptz NOT NULL DEFAULT now(),
  last_inbound_at          timestamptz,
  last_outbound_at         timestamptz,
  message_count            integer NOT NULL DEFAULT 0,
  ai_handled                boolean NOT NULL DEFAULT true,
  meta                     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conv_seller         ON public.conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conv_page           ON public.conversations(page_id);
CREATE INDEX IF NOT EXISTS idx_conv_status         ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conv_last_msg       ON public.conversations(seller_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_external       ON public.conversations(page_id, external_customer_id);

CREATE TRIGGER trg_conv_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.messages (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  seller_id           uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  direction           public.message_direction NOT NULL,
  sender_type         public.message_sender NOT NULL,
  external_message_id text,
  content             text,
  media_url           text,
  media_type          text,
  llm_input_tokens    integer,
  llm_output_tokens   integer,
  llm_model           text,
  ai_confidence       numeric(4,3),
  metadata            jsonb NOT NULL DEFAULT '{}'::jsonb,
  delivered_at        timestamptz,
  read_at             timestamptz,
  failed              boolean NOT NULL DEFAULT false,
  error_detail        text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_msg_conv             ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_msg_seller_created   ON public.messages(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_direction        ON public.messages(direction);
CREATE INDEX IF NOT EXISTS idx_msg_external         ON public.messages(external_message_id);

CREATE TRIGGER trg_msg_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.needs_human_replies (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  seller_id           uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  trigger_message_id  uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  reason              public.escalation_reason NOT NULL DEFAULT 'low_confidence',
  ai_suggestion       text,
  is_resolved         boolean NOT NULL DEFAULT false,
  resolved_at         timestamptz,
  resolved_by         uuid REFERENCES auth.users(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nh_seller_unresolved
  ON public.needs_human_replies(seller_id, created_at DESC) WHERE is_resolved = false;

CREATE TRIGGER trg_nh_updated_at
  BEFORE UPDATE ON public.needs_human_replies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.conversations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.needs_human_replies   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conv_own_seller" ON public.conversations FOR ALL
TO authenticated
USING (seller_id = auth.uid() OR public.current_admin_role() IN ('owner', 'manager', 'staff', 'support'))
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "msg_own_seller" ON public.messages FOR ALL
TO authenticated
USING (seller_id = auth.uid() OR public.current_admin_role() IN ('owner', 'manager', 'staff', 'support'))
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "nh_own_seller" ON public.needs_human_replies FOR ALL
TO authenticated
USING (seller_id = auth.uid() OR public.current_admin_role() IN ('owner', 'manager', 'support'))
WITH CHECK (seller_id = auth.uid());

COMMIT;
