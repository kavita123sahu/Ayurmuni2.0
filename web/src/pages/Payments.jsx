import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { formatRupee } from '../home/catalog';
import {
  TRANSACTION_PAGE_SIZE,
  hasMoreTransactionPages,
  mapTransaction,
  normalizeTransactionList,
  transactionIconGlyph,
} from '../profile/transactions';
import { requireAuth } from '../services/guestAuth';
import { getTransactions } from '../services/orderService';

export default function Payments() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const lockRef = useRef(false);

  const fetchPage = useCallback(async (pageToLoad, mode) => {
    if (lockRef.current && mode === 'append') return;
    lockRef.current = true;
    try {
      if (mode === 'replace') setLoading(true);
      else setLoadingMore(true);
      setError('');
      const res = await getTransactions({
        page: pageToLoad,
        page_size: TRANSACTION_PAGE_SIZE,
      });
      const mapped = normalizeTransactionList(res).map(mapTransaction);
      let more = hasMoreTransactionPages(res, mapped.length, TRANSACTION_PAGE_SIZE);

      setTransactions((prev) => {
        if (mode !== 'append') return mapped;
        const seen = new Set(prev.map((item) => item.id));
        const unique = mapped.filter((item) => {
          if (!item.id || seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        if (unique.length === 0) more = false;
        return [...prev, ...unique];
      });

      pageRef.current = pageToLoad;
      setHasMore(more);
      hasMoreRef.current = more;
    } catch (e) {
      setError(e?.message || 'Failed to load transactions');
      if (mode !== 'append') {
        setTransactions([]);
        setHasMore(false);
        hasMoreRef.current = false;
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      lockRef.current = false;
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!(await requireAuth('Please login to view payments'))) return;
      pageRef.current = 1;
      hasMoreRef.current = true;
      setHasMore(true);
      fetchPage(1, 'replace');
    })();
  }, [fetchPage]);

  const loadMore = () => {
    if (lockRef.current || !hasMoreRef.current || loading || loadingMore) return;
    fetchPage(pageRef.current + 1, 'append');
  };

  const openDetail = (item) => {
    navigate(`/profile/payments/${item.id}`, { state: { transaction: item.raw } });
  };

  return (
    <AppShell tab="profile">
      <section className="catalog-page payments-page">
        <header className="catalog-head">
          <button type="button" className="text-back" onClick={() => navigate('/profile')}>
            ← Back
          </button>
          <div>
            <h1>Payments</h1>
            <p>Manage Your Transaction</p>
          </div>
        </header>

        {loading ? (
          <p className="muted">Loading transactions…</p>
        ) : transactions.length === 0 ? (
          <div className="empty-copy">
            <strong>No transactions yet</strong>
            <p>{error || 'Your payment history will appear here.'}</p>
          </div>
        ) : (
          <>
            {transactions.map((item) => (
              <button
                key={item.id}
                type="button"
                className="checkout-card order-row"
                onClick={() => openDetail(item)}
              >
                <div className="checkout-item txn-item">
                  <span className="thumb-fallback txn-icon">{transactionIconGlyph(item.iconName)}</span>
                  <p>
                    {item.name}
                    {item.paymentMethod ? <small>{item.paymentMethod}</small> : null}
                    <small>{item.date}</small>
                  </p>
                  <span className="txn-right">
                    <strong>{formatRupee(item.raw?.amount ?? 0)}</strong>
                    <em className={`txn-status ${item.status.toLowerCase()}`}>{item.status}</em>
                  </span>
                </div>
              </button>
            ))}
            {hasMore ? (
              <div className="load-more-wrap">
                <button type="button" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </AppShell>
  );
}
