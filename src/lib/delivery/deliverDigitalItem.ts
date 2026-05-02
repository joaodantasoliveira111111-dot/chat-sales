import { createAdminClient } from '@/lib/supabase/middleware'
import { DeliveryPayload } from '@/types'

/**
 * deliverDigitalItem
 * 
 * Handles automatic delivery of digital items after payment confirmation.
 * 
 * Rules:
 * 1. Verify order exists and is paid
 * 2. Verify no duplicate delivery
 * 3. Find available inventory item
 * 4. Reserve atomically to prevent race conditions
 * 5. Create delivery record
 * 6. Mark order as delivered
 * 7. If no stock: mark as paid_pending_stock
 */
export async function deliverDigitalItem(orderId: string): Promise<{
  success: boolean
  deliveryId?: string
  error?: string
  pendingStock?: boolean
}> {
  const supabase = createAdminClient()

  // 1. Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, product:products(*)')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { success: false, error: 'Order not found' }
  }

  // 2. Verify paid status
  if (order.status !== 'paid') {
    return { success: false, error: `Order status is ${order.status}, not paid` }
  }

  // 3. Check for existing delivery (idempotency)
  const { data: existingDelivery } = await supabase
    .from('deliveries')
    .select('id')
    .eq('order_id', orderId)
    .single()

  if (existingDelivery) {
    return { success: true, deliveryId: existingDelivery.id }
  }

  if (!order.product_id) {
    return { success: false, error: 'Order has no product associated' }
  }

  const product = order.product

  // 4. Find and atomically reserve an available inventory item
  // Using a conditional UPDATE to prevent race conditions
  const { data: availableItem, error: findError } = await supabase
    .from('inventory_items')
    .select('id, delivery_type, access_email, access_password, access_url, file_url, license_key, custom_content, extra_instructions, title')
    .eq('product_id', order.product_id)
    .eq('status', 'available')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (findError || !availableItem) {
    // No stock available - mark as paid_pending_stock
    await supabase
      .from('orders')
      .update({
        status: 'paid_pending_stock',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return { success: false, pendingStock: true, error: 'No inventory available' }
  }

  // 5. Reserve the inventory item atomically
  const { error: reserveError } = await supabase
    .from('inventory_items')
    .update({
      status: 'delivered',
      assigned_order_id: orderId,
      delivered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', availableItem.id)
    .eq('status', 'available') // Double-check to prevent race condition

  if (reserveError) {
    return { success: false, error: 'Failed to reserve inventory item' }
  }

  // 6. Build delivery payload
  const deliveryPayload: DeliveryPayload = {
    product_name: product?.name,
    customer_name: order.customer_name,
    access_email: availableItem.access_email || undefined,
    access_password: availableItem.access_password || undefined,
    access_url: availableItem.access_url || undefined,
    license_key: availableItem.license_key || undefined,
    custom_content: availableItem.custom_content || undefined,
    extra_instructions: availableItem.extra_instructions || undefined,
    order_id: orderId,
    delivery_type: availableItem.delivery_type,
  }

  // 7. Create delivery record
  const { data: delivery, error: deliveryError } = await supabase
    .from('deliveries')
    .insert({
      user_id: order.user_id,
      order_id: orderId,
      product_id: order.product_id,
      inventory_item_id: availableItem.id,
      delivery_payload: deliveryPayload,
      delivered_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (deliveryError) {
    // Rollback inventory reservation
    await supabase
      .from('inventory_items')
      .update({ status: 'available', assigned_order_id: null, delivered_at: null })
      .eq('id', availableItem.id)

    return { success: false, error: 'Failed to create delivery record' }
  }

  // 8. Mark order as delivered
  await supabase
    .from('orders')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  return { success: true, deliveryId: delivery.id }
}
