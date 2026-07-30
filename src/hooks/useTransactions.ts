import { useCallback, useEffect, useState } from 'react';
import * as _ORDER_SERVICES from '../services/OrderService';
import { TablerIconName } from '../components/TablerIcon';

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

export const useTransactions = () => {
    const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setError(null);

            const res: any = await _ORDER_SERVICES.getTransactions({ page: 1, page_size: 20 });
            const results = res?.data?.results ?? res?.data ?? [];

            setTransactions(Array.isArray(results) ? results.map(mapTransaction) : []);
        } catch (e: any) {
            console.log('TRANSACTIONS_ERROR', e);
            setError(e?.message ?? 'Failed to load transactions');
            setTransactions([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        await fetchTransactions(true);
    }, [fetchTransactions]);

    return {
        transactions,
        loading,
        refreshing,
        error,
        refresh,
    };
};
