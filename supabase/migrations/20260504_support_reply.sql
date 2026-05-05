-- Add reply columns to support_requests table
ALTER TABLE support_requests
ADD COLUMN IF NOT EXISTS admin_reply text,
ADD COLUMN IF NOT EXISTS replied_at timestamptz;
