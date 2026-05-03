-- ============================================================
-- Delivery node runtime and safe inventory claiming
-- ============================================================

ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS password TEXT,
  ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assigned_lead_id TEXT;

UPDATE public.inventory_items
SET
  type = COALESCE(type, delivery_type),
  email = COALESCE(email, access_email),
  password = COALESCE(password, access_password)
WHERE type IS NULL OR email IS NULL OR password IS NULL;

ALTER TABLE public.deliveries
  ADD COLUMN IF NOT EXISTS lead_id TEXT,
  ADD COLUMN IF NOT EXISTS delivery_type TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'delivered',
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.deliveries
  ALTER COLUMN delivered_at DROP DEFAULT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND constraint_name = 'orders_status_check'
  ) THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;
  END IF;
END $$;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check CHECK (
    status IN (
      'pending',
      'paid',
      'delivered',
      'expired',
      'cancelled',
      'refunded',
      'paid_pending_stock',
      'pending_delivery',
      'manual_pending',
      'failed'
    )
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'inventory_items'
      AND constraint_name = 'inventory_status_check'
  ) THEN
    ALTER TABLE public.inventory_items DROP CONSTRAINT inventory_status_check;
  END IF;
END $$;

ALTER TABLE public.inventory_items
  ADD CONSTRAINT inventory_status_check CHECK (
    status IN ('available','reserved','delivered','sold','used','blocked','disabled','replaced')
  );

CREATE INDEX IF NOT EXISTS inventory_available_claim_idx
  ON public.inventory_items(product_id, status, created_at)
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS deliveries_status_idx ON public.deliveries(status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_deliveries_updated_at'
      AND tgrelid = 'public.deliveries'::regclass
  ) THEN
    CREATE TRIGGER set_deliveries_updated_at
      BEFORE UPDATE ON public.deliveries
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.claim_available_inventory_item(
  p_order_id UUID,
  p_user_id UUID,
  p_product_id UUID,
  p_status TEXT DEFAULT 'delivered',
  p_lead_id TEXT DEFAULT NULL
)
RETURNS public.inventory_items
LANGUAGE plpgsql
AS $$
DECLARE
  claimed public.inventory_items;
BEGIN
  WITH candidate AS (
    SELECT id
    FROM public.inventory_items
    WHERE user_id = p_user_id
      AND product_id = p_product_id
      AND status = 'available'
    ORDER BY created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  UPDATE public.inventory_items item
  SET
    status = p_status,
    assigned_order_id = p_order_id,
    assigned_lead_id = p_lead_id,
    delivered_at = NOW(),
    updated_at = NOW()
  FROM candidate
  WHERE item.id = candidate.id
  RETURNING item.* INTO claimed;

  RETURN claimed;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_available_inventory_item(UUID, UUID, UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_available_inventory_item(UUID, UUID, UUID, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.claim_available_inventory_item(UUID, UUID, UUID, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_available_inventory_item(UUID, UUID, UUID, TEXT, TEXT) TO service_role;
