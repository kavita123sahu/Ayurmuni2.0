export const ORDERS_COPY = {
  // Confirmation
  confirmTitle: 'Order placed',
  confirmText: 'Thank you. Your Ayurmuni order is confirmed.',
  confirmEmptyTitle: 'No order to show',
  confirmEmptyText: 'If you just checked out, return to your cart and try again.',
  home: 'Home',
  cart: 'Cart',
  continueShopping: 'Continue shopping',
  viewOrders: 'View orders',
  orderItems: 'Items in this order',
  qtyPrice: (qty, price) => `Qty ${qty} · ${price}`,

  // History
  historyTitle: 'Order history',
  historySubtitle: 'Track your product orders',
  searchPlaceholder: 'Search orders',
  statusFilter: 'Status',
  loading: 'Loading orders…',
  emptyTitle: 'No orders found',
  emptyText: 'Orders you place will appear here. Browse the store to get started.',
  shopProducts: 'Shop products',
  filters: [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending', match: ['pending', 'confirmed'] },
    { key: 'processing', label: 'Processing', match: ['processing', 'packed'] },
    { key: 'shipped', label: 'Shipped', match: ['shipped'] },
    { key: 'delivered', label: 'Delivered', match: ['delivered', 'completed'] },
    { key: 'cancelled', label: 'Cancelled', match: ['cancelled', 'returned'] },
  ],

  // Details
  detailTitle: 'Order details',
  detailLoading: 'Loading order…',
  notFoundTitle: 'Order not found',
  notFoundText: 'This order may have been removed or the link is incorrect.',
  backToOrders: 'Back to orders',
  delivery: 'Delivery',
  total: 'Total',
  itemsTitle: 'Items',
  rate: 'Rate',
  reviewSubmitted: 'Review submitted',
  youRated: (n) => `You rated ${n} ★`,
  qty: (n) => `Qty ${n}`,
};

export const ORDER_STATUS_TONE = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  packed: 'info',
  shipped: 'primary',
  delivered: 'success',
  completed: 'success',
  cancelled: 'danger',
  returned: 'danger',
};

export const orderStatusTone = (status) =>
  ORDER_STATUS_TONE[String(status || '').toLowerCase()] || 'neutral';

export const orderStatusLabel = (status) => {
  const raw = String(status || '').trim();
  if (!raw) return 'Pending';
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};
