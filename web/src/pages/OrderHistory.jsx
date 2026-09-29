import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Package } from 'lucide-react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { mapOrderToListItem } from '../profile/map';
import { requireAuth } from '../services/guestAuth';
import { getOrders, normalizeOrdersList } from '../services/orderService';
import {
  Badge,
  Button,
  Chip,
  Disclaimer,
  EmptyState,
  SearchField,
  Skeleton,
  SkeletonText,
} from '../components/ui';
import {
  ORDERS_COPY as T,
  orderStatusLabel,
  orderStatusTone,
} from '../content/orders';
import '../design/pages/orders.css';

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!(await requireAuth('Please login to view orders'))) return;
      setLoading(true);
      const res = await getOrders({ page: 1, page_size: 40 });
      setOrders(normalizeOrdersList(res).map(mapOrderToListItem));
      setLoading(false);
    })();
  }, []);

  const list = useMemo(() => {
    const chip = T.filters.find((item) => item.key === filter);
    const q = search.trim().toLowerCase();
    return orders.filter((item) => {
      const status = String(item.status || '').toLowerCase();
      if (chip?.match && !chip.match.includes(status)) return false;
      if (!q) return true;
      return [item.title, item.orderCode, item.id, item.status].some((value) =>
        String(value || '').toLowerCase().includes(q),
      );
    });
  }, [orders, filter, search]);

  return (
    <AppShell tab="profile">
      <section className="or-page">
        <PageHeader title={T.historyTitle} subtitle={T.historySubtitle} backTo="/profile" />

        <div className="or-toolbar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder={T.searchPlaceholder}
            label={T.searchPlaceholder}
          />
          <div className="or-filters" role="group" aria-label={T.statusFilter}>
            {T.filters.map((item) => (
              <Chip
                key={item.key}
                selected={filter === item.key}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </Chip>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="or-skel" aria-busy="true" aria-label={T.loading}>
            <Skeleton style={{ height: 88, borderRadius: 'var(--am-radius-lg)' }} />
            <Skeleton style={{ height: 88, borderRadius: 'var(--am-radius-lg)' }} />
            <SkeletonText lines={2} />
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={<Package size={28} />}
            title={T.emptyTitle}
            description={T.emptyText}
            action={
              <Button variant="primary" onClick={() => navigate('/products')}>
                {T.shopProducts}
              </Button>
            }
          />
        ) : (
          <div className="or-list">
            {list.map((item) => (
              <button
                key={item.id}
                type="button"
                className="or-row"
                onClick={() => navigate(`/profile/orders/${item.id}`)}
              >
                <span className="or-row__thumb">
                  {item.image ? (
                    <img src={item.image} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <Leaf size={22} aria-hidden />
                  )}
                </span>
                <div className="or-row__body">
                  <p className="or-row__title">{item.title}</p>
                  <p className="or-row__meta">#{item.orderCode}</p>
                  <p className="or-row__meta">{item.date}</p>
                </div>
                <div className="or-row__aside">
                  <Badge tone={orderStatusTone(item.status)}>
                    {orderStatusLabel(item.status)}
                  </Badge>
                  <strong className="or-row__amount">{item.amount}</strong>
                </div>
              </button>
            ))}
          </div>
        )}

        <Disclaimer />
      </section>
    </AppShell>
  );
}
