-- Add soft-delete column to products and inventory_items
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Create indexes for common query pattern
CREATE INDEX IF NOT EXISTS idx_products_not_deleted ON products(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_not_deleted ON inventory_items(user_id) WHERE deleted_at IS NULL;
