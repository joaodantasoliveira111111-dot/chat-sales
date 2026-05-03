-- Make authenticated write policies explicit for browser-side Supabase inserts.
-- Supabase/Postgres uses WITH CHECK to validate new rows on INSERT/UPDATE.

DROP POLICY IF EXISTS "Users manage own pages" ON public.public_pages;
DROP POLICY IF EXISTS "Users can read own pages" ON public.public_pages;
DROP POLICY IF EXISTS "Users can insert own pages" ON public.public_pages;
DROP POLICY IF EXISTS "Users can update own pages" ON public.public_pages;
DROP POLICY IF EXISTS "Users can delete own pages" ON public.public_pages;
CREATE POLICY "Users can read own pages" ON public.public_pages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pages" ON public.public_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pages" ON public.public_pages
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own pages" ON public.public_pages
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own flows" ON public.flows;
DROP POLICY IF EXISTS "Users can read own flows" ON public.flows;
DROP POLICY IF EXISTS "Users can insert own flows" ON public.flows;
DROP POLICY IF EXISTS "Users can update own flows" ON public.flows;
DROP POLICY IF EXISTS "Users can delete own flows" ON public.flows;
CREATE POLICY "Users can read own flows" ON public.flows
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flows" ON public.flows
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flows" ON public.flows
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own flows" ON public.flows
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own flow nodes" ON public.flow_nodes;
DROP POLICY IF EXISTS "Users can read own flow nodes" ON public.flow_nodes;
DROP POLICY IF EXISTS "Users can insert own flow nodes" ON public.flow_nodes;
DROP POLICY IF EXISTS "Users can update own flow nodes" ON public.flow_nodes;
DROP POLICY IF EXISTS "Users can delete own flow nodes" ON public.flow_nodes;
CREATE POLICY "Users can read own flow nodes" ON public.flow_nodes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flow nodes" ON public.flow_nodes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flow nodes" ON public.flow_nodes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own flow nodes" ON public.flow_nodes
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own flow edges" ON public.flow_edges;
DROP POLICY IF EXISTS "Users can read own flow edges" ON public.flow_edges;
DROP POLICY IF EXISTS "Users can insert own flow edges" ON public.flow_edges;
DROP POLICY IF EXISTS "Users can update own flow edges" ON public.flow_edges;
DROP POLICY IF EXISTS "Users can delete own flow edges" ON public.flow_edges;
CREATE POLICY "Users can read own flow edges" ON public.flow_edges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flow edges" ON public.flow_edges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flow edges" ON public.flow_edges
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own flow edges" ON public.flow_edges
  FOR DELETE USING (auth.uid() = user_id);
