import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Leaf, MapPin, Package, Star } from 'lucide-react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { formatAddress } from '../cart/mapCart';
import { formatRupee, resolveImageUrl } from '../home/catalog';
import { requireAuth } from '../services/guestAuth';
import { extractOrderDetail, getOrderById } from '../services/orderService';
import { formatOrderId } from '../utils/formatDisplayId';
import { consumePendingProductReview } from '../utils/pendingReviews';
import { isOrderItemRated, resolveOrderItemVariantId } from '../utils/reviewUtils';
import {
  Badge,
  Button,
  Disclaimer,
  EmptyState,
  Skeleton,
  SkeletonText,
} from '../components/ui';
import {
  ORDERS_COPY as T,
  orderStatusLabel,
  orderStatusTone,
} from '../content/orders';
import '../design/pages/orders.css';

export default function OrderDetails() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localReviews, setLocalReviews] = useState({});

  useEffect(() => {
    (async () => {
      if (!(await requireAuth('Please login to view this order'))) return;
      setLoading(true);
      const res = await getOrderById(orderId);
      setOrder(extractOrderDetail(res));
      setLoading(false);
    })();
  }, [orderId, location.key]);

  useEffect(() => {
    const pending = consumePendingProductReview();
    if (!pending?.variantId) return;
    if (pending.orderId && String(pending.orderId) !== String(order?.id ?? orderId)) return;
    setLocalReviews((prev) => ({
      ...prev,
      [pending.variantId]: pending,
    }));
  }, [order?.id, orderId, location.key]);

  const items = Array.isArray(order?.items) ? order.items : [];
  const address = order?.delivery_address || order?.address || order?.shipping_address;
  const status = String(order?.order_status || order?.status || '').toLowerCase();
  const canReview = status === 'delivered' || status === 'completed';
  const orderCode = order?.order_code || order?.order_number || orderId;

  const openProductReview = (item) => {
    const variantId = resolveOrderItemVariantId(item);
    if (!variantId || !order?.id) return;
    if (isOrderItemRated(item) || localReviews[variantId]) return;
    navigate('/share-experience', {
      state: {
        entityType: 'product',
        entityName: item?.variant?.variant_title || item?.product_name || item?.name || 'Product',
        entitySubtitle: `Order ${formatOrderId(order?.order_code ?? order?.id)}`,
        variantId,
        orderId: String(order.id),
        initialRating: 0,
      },
    });
  };

  return (
    <AppShell tab="profile">
      <section className="or-page">
        <PageHeader
          title={T.detailTitle}
          subtitle={orderCode ? `#${orderCode}` : undefined}
          backTo="/profile/orders"
        />

        {loading ? (
          <div className="or-skel" aria-busy="true" aria-label={T.detailLoading}>
            <Skeleton style={{ height: 120, borderRadius: 'var(--am-radius-lg)' }} />
            <SkeletonText lines={4} />
          </div>
        ) : !order ? (
          <EmptyState
            icon={<Package size={28} />}
            title={T.notFoundTitle}
            description={T.notFoundText}
            action={
              <Button variant="primary" onClick={() => navigate('/profile/orders')}>
                {T.backToOrders}
              </Button>
            }
          />
        ) : (
          <div className="or-detail">
            <div className="or-card">
              <h2>{T.itemsTitle}</h2>
              {items.map((item) => {
                const variantId = resolveOrderItemVariantId(item);
                const local = localReviews[variantId];
                const rated = isOrderItemRated(item) || Boolean(local);
                const image = resolveImageUrl(item?.variant || item);
                const name =
                  item?.variant?.variant_title || item?.product_name || item?.name;
                const unitPrice = formatRupee(
                  item.selling_price ?? item.price ?? item.unit_price,
                );
                return (
                  <div key={item.id || item.variant_id} className="or-item">
                    <span className="or-item__thumb">
                      {image ? (
                        <img src={image} alt="" loading="lazy" decoding="async" />
                      ) : (
                        <Leaf size={20} aria-hidden />
                      )}
                    </span>
                    <p className="or-item__name">
                      {name}
                      <small>
                        {T.qty(item.quantity)} · {unitPrice}
                      </small>
                      {rated ? (
                        <small>
                          {local?.rating || item?.review?.rating
                            ? T.youRated(local?.rating || item?.review?.rating)
                            : T.reviewSubmitted}
                        </small>
                      ) : null}
                    </p>
                    {!rated && variantId && canReview ? (
                      <Button
                        className="or-item__action"
                        variant="secondary"
                        size="sm"
                        leadingIcon={<Star size={14} aria-hidden />}
                        onClick={() => openProductReview(item)}
                      >
                        {T.rate}
                      </Button>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <aside className="or-aside">
              <div className="or-status-block">
                <p className="or-status-block__label">Status</p>
                <Badge tone={orderStatusTone(status)} size="md">
                  {orderStatusLabel(status)}
                </Badge>
              </div>

              {address ? (
                <div className="or-card or-delivery">
                  <h2>
                    <MapPin size={16} aria-hidden />
                    {T.delivery}
                  </h2>
                  <p>{formatAddress(address)}</p>
                </div>
              ) : null}

              <div className="or-card">
                <p className="or-total">
                  <span>{T.total}</span>
                  <span>{formatRupee(order.total_amount ?? order.payable_amount)}</span>
                </p>
              </div>
            </aside>
          </div>
        )}

        <Disclaimer />
      </section>
    </AppShell>
  );
}
