/**
 * Single Source of Truth Order Normalizer (34-Column Multi-Column Sync)
 * Syncs paired columns across the Supabase `orders` schema:
 * - Status: payment_status, order_status, status
 * - Type: is_preorder, order_type, product_type
 * - Queue: queue_id, queue_number
 * - Customer: customer_id, user_id, customer_phone, phone, customer_email, email
 */
export const normalizeOrder = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  const unifiedStatus = raw.order_status || raw.status || 'pending_payment';
  const statusLower = String(unifiedStatus).toLowerCase().trim();

  const hasExplicitPre =
    raw.is_preorder === true ||
    raw.is_preorder === 'true' ||
    raw.isPreOrder === true ||
    raw.isPreOrder === 'true' ||
    raw.order_type === 'preorder' ||
    raw.order_type === 'pre_order' ||
    raw.type === 'preorder' ||
    raw.orderType === 'preorder' ||
    raw.orderType === 'pre_order' ||
    raw.product_type === 'preorder' ||
    raw.product_type === 'pre_order';

  const hasExplicitStock =
    raw.is_preorder === false ||
    raw.is_preorder === 'false' ||
    raw.isPreOrder === false ||
    raw.isPreOrder === 'false' ||
    raw.order_type === 'stock' ||
    raw.order_type === 'instock' ||
    raw.order_type === 'in_stock' ||
    raw.orderType === 'stock' ||
    raw.orderType === 'instock' ||
    raw.product_type === 'stock' ||
    raw.product_type === 'in_stock';

  const inferredPre = Boolean(
    ['in_queue', 'in_production', 'ready_to_transfer', 'delivering', 'producing', 'molding', 'assembling'].includes(statusLower) ||
    (raw.queue_id && String(raw.queue_id).toUpperCase().startsWith('Q-')) ||
    (raw.queue_number && String(raw.queue_number).toUpperCase().startsWith('Q-')) ||
    raw.boat_size ||
    raw.boat_model_name ||
    raw.deposit_amount ||
    raw.deposit ||
    (typeof raw.notes === 'string' && /พรีออเดอร์|custom pre-order|สั่งผลิต|สั่งทำ|มัดจำ|preorder|pre-order/i.test(raw.notes)) ||
    (typeof (raw.product_name || raw.productName) === 'string' && /พรีออเดอร์|สั่งผลิต|สั่งทำ|preorder|pre-order/i.test(raw.product_name || raw.productName)) ||
    (Array.isArray(raw.items) && raw.items.some((i) => i?.is_preorder === true || i?.status === 'preorder')) ||
    (Array.isArray(raw.order_items) && raw.order_items.some((i) => i?.is_preorder === true || i?.status === 'preorder'))
  );

  const isPreorder = hasExplicitPre ? true : hasExplicitStock ? false : inferredPre;
  const resolvedType = isPreorder ? 'preorder' : 'stock';
  const resolvedCustomerId = raw.customer_id ?? raw.user_id ?? null;
  const resolvedPhone = raw.customer_phone || raw.phone || '';
  const resolvedEmail = raw.customer_email || raw.email || '';
  const resolvedQueue = isPreorder ? (raw.queue_id || raw.queue_number || null) : null;

  return {
    ...raw,
    order_status: unifiedStatus,
    status: unifiedStatus,
    payment_status: raw.payment_status || 'pending',
    is_preorder: isPreorder,
    order_type: resolvedType,
    product_type: resolvedType,
    queue_id: resolvedQueue,
    queue_number: resolvedQueue,
    customer_id: resolvedCustomerId,
    user_id: resolvedCustomerId,
    customer_phone: resolvedPhone,
    phone: resolvedPhone,
    customer_email: resolvedEmail,
    email: resolvedEmail,
  };
};
