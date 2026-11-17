/**
 * Single Source of Truth Order Normalizer
 * Ensures consistent status (`order_status` & `status`) and order type (`is_preorder` & `order_type`)
 * across Admin Dashboard, Customer Tracking, Navbar, and Payment flows.
 */
export const normalizeOrder = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  const unifiedStatus = raw.order_status || raw.status || 'pending_payment';
  const isPreorder = Boolean(
    raw.is_preorder === true ||
    raw.is_preorder === 'true' ||
    raw.order_type === 'preorder' ||
    raw.order_type === 'pre_order' ||
    (raw.queue_id && String(raw.queue_id).startsWith('Q-'))
  );

  return {
    ...raw,
    order_status: unifiedStatus,
    status: unifiedStatus,
    is_preorder: isPreorder,
    order_type: isPreorder ? 'preorder' : 'stock',
  };
};
