-- Meta Pixel + Conversions API tracking

CREATE TABLE IF NOT EXISTS public.meta_tracking_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  pixel_id TEXT,
  access_token_encrypted TEXT,
  dataset_id TEXT,
  test_event_code TEXT,
  verified_domain TEXT,
  business_name TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  browser_tracking_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  server_tracking_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  advanced_matching_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  deduplication_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_event_at TIMESTAMPTZ,
  last_event_name TEXT,
  last_event_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tracking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  page_id UUID,
  product_id UUID,
  flow_id UUID,
  conversation_id TEXT,
  lead_id TEXT,
  order_id UUID,
  session_id TEXT NOT NULL,
  fbp TEXT,
  fbc TEXT,
  fbclid TEXT,
  user_agent TEXT,
  ip_address TEXT,
  landing_page_url TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, session_id)
);

CREATE TABLE IF NOT EXISTS public.tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  session_id TEXT,
  conversation_id TEXT,
  lead_id TEXT,
  order_id UUID,
  page_id UUID,
  product_id UUID,
  flow_id UUID,
  event_name TEXT NOT NULL,
  event_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'browser',
  meta_event_name TEXT,
  payload JSONB DEFAULT '{}',
  response JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tracking_events_source_check CHECK (source IN ('browser','server','both')),
  CONSTRAINT tracking_events_status_check CHECK (status IN ('pending','sent','failed','deduplicated','skipped'))
);

CREATE UNIQUE INDEX IF NOT EXISTS tracking_events_event_id_source_idx
  ON public.tracking_events(event_id, source);
CREATE INDEX IF NOT EXISTS tracking_sessions_tenant_session_idx
  ON public.tracking_sessions(tenant_id, session_id);
CREATE INDEX IF NOT EXISTS tracking_events_tenant_created_idx
  ON public.tracking_events(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tracking_events_order_idx
  ON public.tracking_events(order_id);

ALTER TABLE public.meta_tracking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own meta tracking settings" ON public.meta_tracking_settings;
CREATE POLICY "Users manage own meta tracking settings"
  ON public.meta_tracking_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own tracking sessions" ON public.tracking_sessions;
CREATE POLICY "Users read own tracking sessions"
  ON public.tracking_sessions FOR SELECT
  USING (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "Users read own tracking events" ON public.tracking_events;
CREATE POLICY "Users read own tracking events"
  ON public.tracking_events FOR SELECT
  USING (auth.uid() = tenant_id);

DROP TRIGGER IF EXISTS set_meta_tracking_settings_updated_at ON public.meta_tracking_settings;
CREATE TRIGGER set_meta_tracking_settings_updated_at
  BEFORE UPDATE ON public.meta_tracking_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tracking_sessions_updated_at ON public.tracking_sessions;
CREATE TRIGGER set_tracking_sessions_updated_at
  BEFORE UPDATE ON public.tracking_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
