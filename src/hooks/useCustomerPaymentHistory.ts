import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';
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

const asText = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nested =
      record.name ?? record.full_name ?? record.label ?? record.title ?? record.id;
    if (typeof nested === 'string' || typeof nested === 'number') {
      return String(nested).trim();
    }
  }
  return fallback;
};

const asPerson = (value: unknown): { id: string; name: string } | null => {
  if (value == null || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number') {
    const name = String(value).trim();
    return name ? { id: name, name } : null;
  }
  if (typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const name = asText(
    record.name ?? record.full_name ?? record.patient_name ?? record.doctor_name,
  );
  const id = asText(record.id ?? record.uuid, name);
  if (!name && !id) return null;
  return { id: id || name, name: name || id };
};

/** Keep every field the list renders as a string or number. Raw API objects crash Text. */
const normalizeEntry = (raw: any, index: number): PaymentHistoryEntry | null => {
  if (!raw || typeof raw !== 'object') return null;

  const amountValue = Number(
    raw.amount ?? raw.total_amount ?? raw.paid_amount ?? raw.total ?? 0,
  );
  const typeText = asText(raw.type ?? raw.payment_type ?? raw.source).toLowerCase();
  const entryText = asText(
    raw.entry_type ?? raw.direction ?? raw.transaction_type,
  ).toLowerCase();
  const created = asText(
    raw.created_at ?? raw.paid_at ?? raw.at ?? raw.date ?? raw.createdAt,
  );
  const id = asText(raw.id ?? raw.payment_id ?? raw.uuid, `payment-${index}-${created}`);

  const appointment =
    raw.appointment && typeof raw.appointment === 'object'
      ? {
          id: asText(raw.appointment.id),
          appointment_date: asText(
            raw.appointment.appointment_date ?? raw.appointment.date,
          ),
          consultation_type: asText(raw.appointment.consultation_type),
          status: asText(raw.appointment.status),
        }
      : null;

  return {
    ...raw,
    id,
    type: typeText.includes('order') ? 'order' : 'consultation',
    entry_type:
      entryText.includes('credit') || entryText.includes('refund') ? 'credit' : 'debit',
    event_type: asText(raw.event_type ?? raw.event ?? raw.status, 'payment'),
    amount: Number.isFinite(amountValue) ? amountValue : 0,
    currency: asText(raw.currency, 'INR') || 'INR',
    status: asText(raw.status, 'pending').toLowerCase() || 'pending',
    note: asText(raw.note ?? raw.reason ?? raw.description),
    gateway_payment_id: asText(raw.gateway_payment_id) || null,
    gateway_refund_id: asText(raw.gateway_refund_id) || null,
    created_at: created,
    doctor: asPerson(raw.doctor),
    patient: asPerson(raw.patient),
    appointment,
    consultation_payment:
      raw.consultation_payment && typeof raw.consultation_payment === 'object'
        ? raw.consultation_payment
        : null,
    refund_request:
      raw.refund_request && typeof raw.refund_request === 'object'
        ? raw.refund_request
        : null,
  };
};

/** `refund_processed` → `Refund processed` */
export const formatEventType = (eventType?: unknown) => {
  const text = asText(eventType, 'payment').replace(/_/g, ' ').trim();
  if (!text) return 'Payment';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getEntryTitle = (entry: PaymentHistoryEntry) => {
  const doctorName = asText(entry?.doctor?.name);
  if (doctorName) return `Dr. ${doctorName}`;
  return entry?.type === 'order' ? 'Order payment' : 'Consultation';
};

/* -------------------------------------------------------------------------- */
/*                                   Hook                                     */
/* -------------------------------------------------------------------------- */

const pickList = (res: any): any[] => {
  const data = res?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(res)) return res;

  const buckets = [data, res];
  for (const bucket of buckets) {
    if (!bucket || typeof bucket !== 'object') continue;
    if (Array.isArray(bucket.results)) return bucket.results;
    if (Array.isArray(bucket.data)) return bucket.data;
    if (Array.isArray(bucket.history)) return bucket.history;
    if (Array.isArray(bucket.payments)) return bucket.payments;
    if (Array.isArray(bucket.items)) return bucket.items;
  }
  return [];
};

/** List response is a plain array or a paginated `{ results, next }` envelope. */
const readPage = (
  res: any,
): { list: PaymentHistoryEntry[]; hasNext: boolean; failedMessage: string | null } => {
  if (res?.success === false) {
    return {
      list: [],
      hasNext: false,
      failedMessage: asText(res?.message, 'Failed to load payment history'),
    };
  }

  const rawList = pickList(res);
  const list = rawList
    .map((row, index) => normalizeEntry(row, index))
    .filter((row): row is PaymentHistoryEntry => row != null);

  const data = res?.data;
  let hasNext = false;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if ('next' in data) {
      hasNext = data.next != null && data.next !== '' && data.next !== false;
    } else if (typeof data.count === 'number' && typeof data.page === 'number') {
      hasNext = data.page * PAGE_SIZE < data.count;
    } else {
      hasNext = list.length >= PAGE_SIZE;
    }
  }

  // A short page is the last page, even if `next` is a stale URL.
  if (list.length < PAGE_SIZE) hasNext = false;

  return { list, hasNext, failedMessage: null };
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
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

      const finish = (apply: () => void) => {
        let committed = false;
        const commit = () => {
          if (committed || !mountedRef.current || requestId !== requestIdRef.current) {
            return;
          }
          committed = true;
          apply();
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
          busyRef.current = false;
        };

        // First paint waits until the push animation finishes.
        // Filling a SectionList mid-transition crashes the native screen.
        if (mode === 'initial') {
          InteractionManager.runAfterInteractions(commit);
          setTimeout(commit, 400);
          return;
        }
        commit();
      };

      try {
        const res = await _ORDER_SERVICES.getCustomerPaymentHistory({
          type,
          entry_type,
          date_from,
          date_to,
          page,
          page_size: PAGE_SIZE,
        });
        if (requestId !== requestIdRef.current) return;

        const { list, hasNext, failedMessage } = readPage(res);
        finish(() => {
          if (failedMessage) {
            setError(failedMessage);
            if (mode !== 'more') {
              setItems([]);
              setHasMore(false);
            }
            return;
          }
          setItems(prev => (mode === 'more' ? [...prev, ...list] : list));
          setHasMore(hasNext);
          pageRef.current = page;
        });
      } catch (e: any) {
        if (requestId !== requestIdRef.current) return;
        console.log('PAYMENT_HISTORY_ERROR', e);
        finish(() => {
          setError(asText(e?.message, 'Failed to load payment history'));
          if (mode !== 'more') {
            setItems([]);
            setHasMore(false);
          }
        });
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
