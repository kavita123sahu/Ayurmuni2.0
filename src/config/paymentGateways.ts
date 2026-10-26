import type { TablerIconName } from '../components/TablerIcon';

/**
 * API `payment_gateway` values only:
 *   pinelabs | razorpay | icici
 */
export type PaymentGateway = 'pinelabs' | 'razorpay' | 'icici';

export type PaymentGatewayOption = {
  id: PaymentGateway;
  title: string;
  subtitle: string;
  icon: TablerIconName;
};

export const PAYMENT_GATEWAY_OPTIONS: Record<PaymentGateway, PaymentGatewayOption> = {
  razorpay: {
    id: 'razorpay',
    title: 'Razorpay',
    subtitle: 'Native SDK — UPI, cards, net banking',
    icon: 'credit-card',
  },
  icici: {
    id: 'icici',
    title: 'ICICI PayPhi',
    subtitle: 'Native PayPhi SDK — UPI, cards, net banking',
    icon: 'building',
  },
  pinelabs: {
    id: 'pinelabs',
    title: 'Pine Labs',
    subtitle: 'Hosted checkout — UPI, cards, wallets',
    icon: 'wallet',
  },
};

export const PAYMENT_GATEWAY_ORDER: PaymentGateway[] = [
  'razorpay',
  'icici',
  'pinelabs',
];

export const DEFAULT_GATEWAY_FLAGS: Record<PaymentGateway, boolean> = {
  razorpay: true,
  icici: true,
  pinelabs: true,
};

/** Hide ICICI when PayPhi native module is not in this build. */
export function filterRunnableGateways(
  gateways: PaymentGateway[],
  opts?: { payphiNativeLinked?: boolean },
): PaymentGateway[] {
  const list = (Array.isArray(gateways) ? gateways : []).filter(id =>
    id === 'icici' ? Boolean(opts?.payphiNativeLinked) : true,
  );
  return list.length ? list : ['razorpay'];
}

/** Parse API gateway id. Exact: pinelabs | razorpay | icici (legacy "payphi" → icici). */
export const parsePaymentGateway = (value: unknown): PaymentGateway | null => {
  const s = String(value ?? '').trim().toLowerCase();
  if (s === 'pinelabs') return 'pinelabs';
  if (s === 'razorpay') return 'razorpay';
  if (s === 'icici' || s === 'payphi') return 'icici';
  return null;
};

/** @deprecated Prefer parsePaymentGateway */
export const normalizeGateway = parsePaymentGateway;

/** Value to send on book-slot / place-order / verify. */
export const toApiPaymentGateway = (
  gateway?: PaymentGateway | string | null,
): PaymentGateway => parsePaymentGateway(gateway) ?? 'razorpay';

const asBool = (value: unknown, fallback: boolean): boolean => {
  if (value == null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  const s = String(value).trim().toLowerCase();
  if (s === 'true' || s === '1' || s === 'yes') return true;
  if (s === 'false' || s === '0' || s === 'no') return false;
  return fallback;
};

/**
 * Enabled gateways from customer profile.
 * Prefers `payment_gateways` with keys: pinelabs, razorpay, icici.
 */
export const resolveEnabledGateways = (profile: any): PaymentGateway[] => {
  const source = profile?.customer ?? profile ?? {};
  const raw = source?.payment_gateways;
  const flags = { ...DEFAULT_GATEWAY_FLAGS };

  if (Array.isArray(raw)) {
    const listed = new Set(
      raw.map(parsePaymentGateway).filter(Boolean) as PaymentGateway[],
    );
    PAYMENT_GATEWAY_ORDER.forEach(id => {
      flags[id] = listed.has(id);
    });
  } else if (raw && typeof raw === 'object') {
    PAYMENT_GATEWAY_ORDER.forEach(id => {
      flags[id] = asBool(raw[id], flags[id]);
    });
  }

  flags.pinelabs = asBool(source?.pinelabs_enabled, flags.pinelabs);
  flags.razorpay = asBool(source?.razorpay_enabled, flags.razorpay);
  flags.icici = asBool(
    source?.icici_enabled ?? source?.payphi_enabled,
    flags.icici,
  );

  const enabled = PAYMENT_GATEWAY_ORDER.filter(id => flags[id]);
  return enabled.length ? enabled : ['razorpay'];
};

export const resolveDefaultGateway = (
  profile: any,
  enabled: PaymentGateway[],
): PaymentGateway => {
  // Prefer Razorpay whenever it is enabled (stable default; ICICI SDK may be unavailable)
  if (enabled.includes('razorpay')) return 'razorpay';
  const source = profile?.customer ?? profile ?? {};
  const preferred = parsePaymentGateway(source?.default_payment_gateway);
  return preferred && enabled.includes(preferred) ? preferred : enabled[0];
};
