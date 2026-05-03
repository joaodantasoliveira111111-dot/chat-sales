-- ============================================================
-- Sales Flow media assets for X1 conversational selling
-- ============================================================

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  flow_id UUID REFERENCES public.flows(id) ON DELETE CASCADE,
  node_id UUID,
  type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT,
  duration NUMERIC,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT media_assets_type_check CHECK (type IN ('image','video','audio','document','file'))
);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own media assets"
  ON public.media_assets
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can read published flow media assets"
  ON public.media_assets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.flows f
      WHERE f.id = media_assets.flow_id
        AND f.status = 'published'
    )
  );

CREATE INDEX IF NOT EXISTS media_assets_user_id_idx ON public.media_assets(user_id);
CREATE INDEX IF NOT EXISTS media_assets_flow_id_idx ON public.media_assets(flow_id);
CREATE INDEX IF NOT EXISTS media_assets_node_id_idx ON public.media_assets(node_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_media_assets_updated_at'
      AND tgrelid = 'public.media_assets'::regclass
  ) THEN
    CREATE TRIGGER set_media_assets_updated_at
      BEFORE UPDATE ON public.media_assets
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chatfy-media',
  'chatfy-media',
  TRUE,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg',
    'audio/wav',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public can read Chatfy media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'chatfy-media');

CREATE POLICY "Users upload own Chatfy media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chatfy-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own Chatfy media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'chatfy-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'chatfy-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own Chatfy media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chatfy-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
