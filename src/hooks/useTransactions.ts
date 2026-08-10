import { useCallback, useEffect, useRef, useState } from 'react';
import * as _ORDER_SERVICES from '../services/OrderService';
import { TablerIconName } from '../components/TablerIcon';

export const TRANSACTION_PAGE_SIZE = 20;

export type TransactionListItem = {
  id: string;
  name: string;
  date: string;
  amount: string;
  status: string;
  iconName: TablerIconName;
  paymentMethod?: string;
  referenceCode?: string;
  orderCode?: string;
  raw: any;
};

const formatTransactionDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mapStatusLabel = (status?: string) => {
  const normalized = String(status ?? '').toLowerCase();
  if (normalized === 'success') return 'PAID';
  if (normalized === 'failed') return 'FAILED';
  if (normalized === 'pending') return 'PENDING';
  if (normalized === 'refunded') return 'REFUNDED';
  return String(status ?? 'UNKNOWN').toUpperCase();
};

const mapTransactionIcon = (txn: any): TablerIconName => {
  const method = String(txn?.payment_method ?? '').toLowerCase();
  if (method.includes('upi') || method.includes('wallet')) return 'wallet';
  if (method.includes('card')) return 'credit-card';
  if (txn?.order?.order_code) return 'shopping-cart';
  return 'receipt';
};

const mapTransaction = (txn: any): TransactionListItem => {
  const orderCode = txn?.order?.order_code;
  const referenceCode = txn?.reference_code;
  const paymentMethod = String(txn?.payment_method ?? txn?.payment_type ?? '')
    .replace(/_/g, ' ')
    .toUpperCase();

  return {
    id: String(txn.id),
    name: orderCode || referenceCode || 'Transaction',
    date: formatTransactionDate(txn.paid_at || txn.created_at),
    amount: Number(txn.amount ?? 0).toLocaleString('en-IN'),
    status: mapStatusLabel(txn.status),
    iconName: mapTransactionIcon(txn),
    paymentMethod,
    referenceCode,
    orderCode,
    raw: txn,
  };
};

const normalizeTransactionList = (res: any): any[] => {
  const data = res?.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  if (Array.isArray(res?.results)) return res.results;
  return [];
};

const hasMoreTransactionPages = (
  res: any,
  pageResultsLength: number,
  pageSize: number,
) => {
  const data = res?.data;

  if (Array.isArray(data)) {
    return false;
  }

  if (data && typeof data === 'object' && 'next' in data) {
    return data.next != null && data.next !== '';
  }

  if (
    data &&
    typeof data === 'object' &&
    typeof data.count === 'number' &&
    typeof data.page === 'number'
  ) {
    return data.page * pageSize < data.count;
  }

  if (data && typeof data === 'object' && typeof data.count === 'number') {
    return pageResultsLength >= pageSize;
  }

  return pageResultsLength >= pageSize;
};

export const useTransactions = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? TRANSACTION_PAGE_SIZE;

  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingLockRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);

  const fetchPage = useCallback(
    async (pageToLoad: number, mode: 'replace' | 'append' | 'refresh') => {
      if (loadingLockRef.current && mode === 'append') {
        return;
      }

      loadingLockRef.current = true;

      try {
        if (mode === 'replace') setLoading(true);
        else if (mode === 'append') setLoadingMore(true);
        else setRefreshing(true);

        setError(null);

        const res: any = await _ORDER_SERVICES.getTransactions({
          page: pageToLoad,
          page_size: pageSize,
        });

        const rawList = normalizeTransactionList(res);
        const mapped = rawList.map(mapTransaction);
        let more = hasMoreTransactionPages(res, mapped.length, pageSize);

        setTransactions(prev => {
          if (mode !== 'append') {
            return mapped;
          }

          const seen = new Set(prev.map(item => item.id));
          const unique = mapped.filter(item => {
            if (!item.id || seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });

          if (unique.length === 0) {
            more = false;
          }

          return [...prev, ...unique];
        });

        setPage(pageToLoad);
        pageRef.current = pageToLoad;
        setHasMore(more);
        hasMoreRef.current = more;
      } catch (e: any) {
        console.log('TRANSACTIONS_ERROR', e);
        setError(e?.message ?? 'Failed to load transactions');
        if (mode !== 'append') {
          setTransactions([]);
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        loadingLockRef.current = false;
      }
    },
    [pageSize],
  );

  useEffect(() => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    setPage(1);
    setHasMore(true);
    fetchPage(1, 'replace');
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (
      loadingLockRef.current ||
      !hasMoreRef.current ||
      loading ||
      refreshing ||
      loadingMore
    ) {
      return;
    }
    fetchPage(pageRef.current + 1, 'append');
  }, [fetchPage, loading, loadingMore, refreshing]);

  const refresh = useCallback(async () => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    await fetchPage(1, 'refresh');
  }, [fetchPage]);

  return {
    transactions,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    page,
    refresh,
    loadMore,
  };
};
