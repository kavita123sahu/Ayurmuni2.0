import type { TablerIconName } from '../components/TablerIcon';

/**
 * API `payment_gateway` values:
 *   cashfree | razorpay | icici
 */
export type PaymentGateway = 'cashfree' | 'razorpay' | 'icici';

export type PaymentGatewayOption = {
  id: PaymentGateway;
  title: string;
  subtitle: string;
  icon: TablerIconName;
};

export const PAYMENT_GATEWAY_OPTIONS: Record<PaymentGateway, PaymentGatewayOption> = {
  cashfree: {
    id: 'cashfree',
    title: 'Cashfree',
    subtitle: 'UPI, cards, net banking & wallets',
    icon: 'credit-card',
  },
  razorpay: {
    id: 'razorpay',
    title: 'Razorpay',
    subtitle: 'Native SDK — UPI, cards, net banking',
    icon: 'credit-card',
  },
  icici: {
    id: 'icici',
    title: 'ICICI PayPhi',
    subtitle: 'ICICI PayPhi — UPI, cards & net banking',
    icon: 'building',
  },
};

const GATEWAY_ORDER: PaymentGateway[] = ['cashfree', 'razorpay', 'icici'];

const DEFAULT_FLAGS: Record<PaymentGateway, boolean> = {
  cashfree: true,
  razorpay: true,
  icici: true,
};

/** Hide ICICI when PayPhi native module is not in this build. */
export function filterRunnableGateways(
  gateways: PaymentGateway[],
  opts?: { payphiNativeLinked?: boolean },
): PaymentGateway[] {
  const list = (Array.isArray(gateways) ? gateways : []).filter(id =>
    id === 'icici' ? Boolean(opts?.payphiNativeLinked) : true,
  );
  return list.length ? list : ['cashfree'];
}

/** Parse API / UI gateway id → cashfree | razorpay | icici. */
export const parsePaymentGateway = (value: unknown): PaymentGateway | null => {
  const s = String(value ?? '')
    .trim()
    .toLowerCase();
  if (s === 'razorpay') return 'razorpay';
  if (s === 'cashfree') return 'cashfree';
  if (s === 'icici' || s === 'payphi') return 'icici';
  return null;
};

/** Value to send on book-slot / place-order / verify. */
export const toApiPaymentGateway = (
  gateway?: PaymentGateway | string | null,
): PaymentGateway => parsePaymentGateway(gateway) ?? 'cashfree';

const asBool = (value: unknown, fallback: boolean): boolean => {
  if (value == null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  const s = String(value).trim().toLowerCase();
  if (s === 'true' || s === '1' || s === 'yes') return true;
  if (s === 'false' || s === '0' || s === 'no') return false;
  return fallback;
};

export const normalizeGateway = (value: unknown): PaymentGateway | null => {
  const s = String(value ?? '').trim().toLowerCase().replace(/[\s_-]/g, '');
  if (s === 'pinelabs' || s === 'pinelab' || s === 'plural') return 'pinelabs';
  if (s === 'razorpay') return 'razorpay';
  if (
    s === 'payphi' ||
    s === 'payphisdk' ||
    s === 'icici' ||
    s === 'icicipayphi' ||
    s === 'phicommerce'
  ) {
    return 'icici';
  }
  return null;
};

/**
 * Enabled gateways from customer profile.
 * Prefers `payment_gateways` with keys: cashfree, razorpay, icici.
 */
export const resolveEnabledGateways = (profile: any): PaymentGateway[] => {
  const source = profile?.customer ?? profile ?? {};
  const raw = source?.payment_gateways;
  const flags = { ...DEFAULT_FLAGS };

  if (Array.isArray(raw)) {
    const listed = new Set(
      raw.map(parsePaymentGateway).filter(Boolean) as PaymentGateway[],
    );
    GATEWAY_ORDER.forEach(id => {
      flags[id] = listed.has(id);
    });
  } else if (raw && typeof raw === 'object') {
    GATEWAY_ORDER.forEach(id => {
      flags[id] = asBool(raw[id], flags[id]);
    });
  }

  flags.cashfree = asBool(source?.cashfree_enabled, flags.cashfree);
  flags.razorpay = asBool(source?.razorpay_enabled, flags.razorpay);
  flags.icici = asBool(
    source?.icici_enabled ?? source?.payphi_enabled,
    flags.icici,
  );

  const enabled = GATEWAY_ORDER.filter(id => flags[id]);
  return enabled.length ? enabled : ['cashfree'];
};

export const resolveDefaultGateway = (
  profile: any,
  enabled: PaymentGateway[],
): PaymentGateway => {
  if (enabled.includes('cashfree')) return 'cashfree';
  if (enabled.includes('razorpay')) return 'razorpay';
  const source = profile?.customer ?? profile ?? {};
  const preferred = parsePaymentGateway(source?.default_payment_gateway);
  return preferred && enabled.includes(preferred) ? preferred : enabled[0];
};

const str = (value: unknown): string => {
  if (value == null) return '';
  return String(value).trim();
};

/** Order id for verify-payment `gateway_order_id`. */
export const getGatewayOrderId = (
  data: any,
  gateway: PaymentGateway,
): string => {
  if (gateway === 'razorpay') {
    return str(data?.razorpay_order_id) || str(data?.gateway_order_id);
  }
  if (gateway === 'cashfree') {
    return (
      str(data?.cashfree_order_id) ||
      str(data?.cf_order_id) ||
      str(data?.cashfree?.order_id) ||
      str(data?.payment_session_id ? data?.order_id : '') ||
      str(data?.gateway_order_id)
    );
  }
  // icici
  return (
    str(data?.gateway_order_id) ||
    str(data?.icici?.merchantTxnNo) ||
    str(data?.invoice_no)
  );
};

export const hasGatewayOrder = (data: any): boolean =>
  Boolean(
    data?.razorpay_order_id ||
      data?.gateway_order_id ||
      data?.payment_session_id ||
      data?.cashfree_order_id ||
      data?.cashfree ||
      data?.invoice_no ||
      data?.icici,
  );
