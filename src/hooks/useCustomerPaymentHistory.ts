import { useCallback, useEffect, useRef, useState } from 'react';
import * as _ORDER_SERVICES from '../services/OrderService';
import type { CustomerPaymentHistoryQuery } from '../services/OrderService';

const PAGE_SIZE = 20;

/* -------------------------------------------------------------------------- */
/*                         API shape: payments/customer/history/              */
/* -------------------------------------------------------------------------- */

export type PaymentHistoryEntry = {
  id: string;
  type: 'consultation' | 'order';
  entry_type: 'credit' | 'debit';
  event_type: string;
  amount: number;
  currency: string;
  status: string;
  note: string;
  gateway_payment_id: string | null;
  gateway_refund_id: string | null;
  created_at: string;
  consultation_payment: {
    id: string;
    status: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    paid_at: string | null;
    refunded_at: string | null;
  } | null;
  refund_request: {
    id: string;
    admin_status: string;
    gateway_status: string;
    processed_at: string | null;
  } | null;
  doctor: { id: string; name: string } | null;
  patient: { id: string; name: string } | null;
  appointment: {
    id: string;
    appointment_date: string;
    consultation_type: string;
    status: string;
  } | null;
};

export type PaymentHistoryFilters = Omit<
  CustomerPaymentHistoryQuery,
  'page' | 'page_size'
>;

/* -------------------------------------------------------------------------- */
/*                               Display helpers                              */
/* -------------------------------------------------------------------------- */

/** `refund_processed` → `Refund processed` */
export const formatEventType = (eventType: string) => {
  const text = eventType.replace(/_/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getEntryTitle = (entry: PaymentHistoryEntry) => {
  if (entry.doctor?.name) return `Dr. ${entry.doctor.name}`;
  return entry.type === 'order' ? 'Order payment' : 'Consultation';
};

/* -------------------------------------------------------------------------- */
/*                                   Hook                                     */
/* -------------------------------------------------------------------------- */

/** List response is either a plain array or `{ results, next }`. */
const readPage = (res: any): { list: PaymentHistoryEntry[]; hasNext: boolean } => {
  const data = res?.data;
  if (Array.isArray(data)) return { list: data, hasNext: false };
  const list: PaymentHistoryEntry[] = Array.isArray(data?.results) ? data.results : [];
  return { list, hasNext: Boolean(data?.next) };
};

export const useCustomerPaymentHistory = (filters: PaymentHistoryFilters) => {
  const [items, setItems] = useState<PaymentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(1);
  const busyRef = useRef(false);
  const requestIdRef = useRef(0);

  const { type, entry_type, date_from, date_to } = filters;

  const fetchPage = useCallback(
    async (page: number, mode: 'initial' | 'more' | 'refresh') => {
      if (mode === 'more' && busyRef.current) return;
      busyRef.current = true;
      const requestId = ++requestIdRef.current;

      if (mode === 'initial') setLoading(true);
      if (mode === 'more') setLoadingMore(true);
      if (mode === 'refresh') setRefreshing(true);
      setError(null);

      try {
        const res = await _ORDER_SERVICES.getCustomerPaymentHistory({
          type,
          entry_type,
          date_from,
          date_to,
          page,
          page_size: PAGE_SIZE,
        });
        // A newer filter request started — ignore this stale response
        if (requestId !== requestIdRef.current) return;

        const { list, hasNext } = readPage(res);
        setItems(prev => (mode === 'more' ? [...prev, ...list] : list));
        setHasMore(hasNext);
        pageRef.current = page;
      } catch (e: any) {
        if (requestId !== requestIdRef.current) return;
        console.log('PAYMENT_HISTORY_ERROR', e);
        setError(e?.message ?? 'Failed to load payment history');
        if (mode !== 'more') {
          setItems([]);
          setHasMore(false);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
          busyRef.current = false;
        }
      }
    },
    [type, entry_type, date_from, date_to],
  );

  // Filters changed → start again from page 1
  useEffect(() => {
    fetchPage(1, 'initial');
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || busyRef.current) return;
    fetchPage(pageRef.current + 1, 'more');
  }, [hasMore, fetchPage]);

  const refresh = useCallback(() => fetchPage(1, 'refresh'), [fetchPage]);

  return { items, loading, loadingMore, refreshing, hasMore, error, loadMore, refresh };
};
