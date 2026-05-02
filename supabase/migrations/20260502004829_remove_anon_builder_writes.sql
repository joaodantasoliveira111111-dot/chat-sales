drop policy if exists "Anon can manage flows through admin routes" on public.flows;
drop policy if exists "Anon can manage flow nodes through admin routes" on public.flow_nodes;
drop policy if exists "Anon can manage flow edges through admin routes" on public.flow_edges;
drop policy if exists "Anon can manage flow versions through admin routes" on public.flow_versions;

drop policy if exists "Anon can manage appearance settings" on public.admin_settings;
drop policy if exists "Anon can manage encrypted payment settings" on public.admin_settings;

-- Keep public read-only policies for published landing pages:
-- - Public can read active products
-- - Public can read published flows
-- - Public can read nodes/edges from published flows
-- - Anon can read appearance settings
--
-- Admin writes now go through Next.js server routes using SUPABASE_SERVICE_ROLE_KEY.
