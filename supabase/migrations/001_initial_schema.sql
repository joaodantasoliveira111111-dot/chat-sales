-- ============================================================
-- CHATFY - Initial Schema Migration
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_crypto";

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'draft',
  delivery_type TEXT,
  image_url TEXT,
  support_text TEXT,
  default_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug),
  CONSTRAINT products_status_check CHECK (status IN ('draft','active','inactive','archived')),
  CONSTRAINT products_delivery_type_check CHECK (delivery_type IN ('digital_credential','file','link','custom_text','license_key','manual') OR delivery_type IS NULL)
);

-- ============================================================
-- 3. THEMES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. FLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  page_id UUID,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  start_node_id UUID,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  CONSTRAINT flows_status_check CHECK (status IN ('draft','published','archived'))
);

-- ============================================================
-- 5. FLOW NODES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flow_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  flow_id UUID REFERENCES public.flows(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  position_x NUMERIC DEFAULT 0,
  position_y NUMERIC DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. FLOW EDGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flow_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  flow_id UUID REFERENCES public.flows(id) ON DELETE CASCADE,
  source_node_id UUID REFERENCES public.flow_nodes(id) ON DELETE CASCADE,
  source_handle TEXT,
  target_node_id UUID REFERENCES public.flow_nodes(id) ON DELETE CASCADE,
  target_handle TEXT,
  condition JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. FLOW VERSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flow_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  flow_id UUID REFERENCES public.flows(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  nodes_snapshot JSONB DEFAULT '[]',
  edges_snapshot JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. PUBLIC PAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.public_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  flow_id UUID REFERENCES public.flows(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  public_title TEXT NOT NULL,
  public_subtitle TEXT,
  avatar_url TEXT,
  logo_url TEXT,
  theme_id TEXT DEFAULT 'dark_premium' REFERENCES public.themes(id),
  primary_color TEXT DEFAULT '#8B5CF6',
  secondary_color TEXT DEFAULT '#06B6D4',
  background_config JSONB DEFAULT '{}',
  bubble_style TEXT DEFAULT 'rounded',
  button_style TEXT DEFAULT 'filled',
  show_header BOOLEAN DEFAULT TRUE,
  show_support_button BOOLEAN DEFAULT FALSE,
  show_microcopy BOOLEAN DEFAULT TRUE,
  microcopy_text TEXT,
  show_powered_by BOOLEAN DEFAULT FALSE,
  custom_css TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug),
  CONSTRAINT pages_status_check CHECK (status IN ('draft','published','archived'))
);

-- Add FK for flows.page_id now that public_pages exists
ALTER TABLE public.flows ADD CONSTRAINT flows_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.public_pages(id) ON DELETE SET NULL;

-- ============================================================
-- 9. INVENTORY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT,
  delivery_type TEXT NOT NULL,
  access_email TEXT,
  access_password TEXT,
  access_url TEXT,
  file_url TEXT,
  license_key TEXT,
  custom_content TEXT,
  extra_instructions TEXT,
  status TEXT DEFAULT 'available',
  assigned_order_id UUID,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT inventory_status_check CHECK (status IN ('available','reserved','delivered','disabled','replaced'))
);

-- ============================================================
-- 10. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  page_id UUID REFERENCES public.public_pages(id) ON DELETE SET NULL,
  flow_id UUID REFERENCES public.flows(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_whatsapp TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'pending',
  payment_provider TEXT,
  gateway_payment_id TEXT,
  pix_code TEXT,
  pix_qr_code_url TEXT,
  pix_qr_code_base64 TEXT,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT orders_status_check CHECK (status IN ('pending','paid','delivered','expired','cancelled','refunded','paid_pending_stock','failed'))
);

-- FK for inventory_items.assigned_order_id
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_order_fkey FOREIGN KEY (assigned_order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- ============================================================
-- 11. DELIVERIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  delivery_payload JSONB DEFAULT '{}',
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. PAYMENT EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  order_id UUID,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. SUPPORT REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_whatsapp TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT support_status_check CHECK (status IN ('open','in_progress','resolved','closed'))
);

-- ============================================================
-- 14. ADMIN SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  key TEXT NOT NULL,
  value JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- ============================================================
-- 15. ANALYTICS EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  page_id UUID,
  product_id UUID,
  flow_id UUID,
  order_id UUID,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON public.products(slug);
CREATE UNIQUE INDEX IF NOT EXISTS pages_slug_idx ON public.public_pages(slug);
CREATE INDEX IF NOT EXISTS orders_gateway_payment_id_idx ON public.orders(gateway_payment_id);
CREATE INDEX IF NOT EXISTS orders_session_id_idx ON public.orders(session_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS inventory_status_idx ON public.inventory_items(status);
CREATE INDEX IF NOT EXISTS inventory_product_id_idx ON public.inventory_items(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS deliveries_order_id_idx ON public.deliveries(order_id);
CREATE INDEX IF NOT EXISTS analytics_session_id_idx ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_event_name_idx ON public.analytics_events(event_name);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Themes: public read
CREATE POLICY "Themes are publicly readable" ON public.themes FOR SELECT USING (true);

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Products
CREATE POLICY "Users manage own products" ON public.products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can read active products" ON public.products FOR SELECT USING (status = 'active');

-- Public Pages
CREATE POLICY "Users manage own pages" ON public.public_pages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can read published pages" ON public.public_pages FOR SELECT USING (status = 'published');

-- Flows
CREATE POLICY "Users manage own flows" ON public.flows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can read published flows" ON public.flows FOR SELECT USING (status = 'published');

-- Flow Nodes
CREATE POLICY "Users manage own flow nodes" ON public.flow_nodes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can read flow nodes" ON public.flow_nodes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.flows f WHERE f.id = flow_id AND f.status = 'published')
);

-- Flow Edges
CREATE POLICY "Users manage own flow edges" ON public.flow_edges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can read flow edges" ON public.flow_edges FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.flows f WHERE f.id = flow_id AND f.status = 'published')
);

-- Flow Versions
CREATE POLICY "Users manage own flow versions" ON public.flow_versions FOR ALL USING (auth.uid() = user_id);

-- Inventory Items (never expose to public)
CREATE POLICY "Users manage own inventory" ON public.inventory_items FOR ALL USING (auth.uid() = user_id);

-- Orders (allow service role for API routes)
CREATE POLICY "Users manage own orders" ON public.orders FOR ALL USING (auth.uid() = user_id);

-- Deliveries
CREATE POLICY "Users manage own deliveries" ON public.deliveries FOR ALL USING (auth.uid() = user_id);

-- Payment Events
CREATE POLICY "Users manage own payment events" ON public.payment_events FOR ALL USING (auth.uid() = user_id);

-- Support Requests
CREATE POLICY "Users manage own support" ON public.support_requests FOR ALL USING (auth.uid() = user_id);

-- Admin Settings
CREATE POLICY "Users manage own settings" ON public.admin_settings FOR ALL USING (auth.uid() = user_id);

-- Analytics Events
CREATE POLICY "Users manage own analytics" ON public.analytics_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- ============================================================
-- TRIGGERS - auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_pages_updated_at BEFORE UPDATE ON public.public_pages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_flows_updated_at BEFORE UPDATE ON public.flows FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_flow_nodes_updated_at BEFORE UPDATE ON public.flow_nodes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_inventory_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_support_updated_at BEFORE UPDATE ON public.support_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TRIGGER - auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'admin'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
