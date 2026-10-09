import type { TablerIconName } from '../components/TablerIcon';

/** Online payment gateways available for consultation checkout. */
export type PaymentGateway = 'pinelabs' | 'razorpay';

export type PaymentGatewayOption = {
  id: PaymentGateway;
  title: string;
  subtitle: string;
  icon: TablerIconName;
};

export const PAYMENT_GATEWAY_OPTIONS: Record<PaymentGateway, PaymentGatewayOption> = {
  pinelabs: {
    id: 'pinelabs',
    title: 'Pine Labs',
    subtitle: 'UPI, cards, net banking & wallets',
    icon: 'wallet',
  },
  razorpay: {
    id: 'razorpay',
    title: 'Razorpay',
    subtitle: 'UPI, cards, net banking & wallets',
    icon: 'credit-card',
  },
};

/** Order shown in the picker; the first enabled one is preselected. */
export const PAYMENT_GATEWAY_ORDER: PaymentGateway[] = ['pinelabs', 'razorpay'];

/** Used until the profile API sends gateway flags. */
export const DEFAULT_GATEWAY_FLAGS: Record<PaymentGateway, boolean> = {
  pinelabs: true,
  razorpay: true,
};

const toFlag = (value: unknown, fallback: boolean): boolean => {
  if (value == null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  const s = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'enabled', 'active', 'on'].includes(s)) return true;
  if (['false', '0', 'no', 'disabled', 'inactive', 'off'].includes(s)) return false;
  return fallback;
};

export const normalizeGateway = (value: unknown): PaymentGateway | null => {
  const s = String(value ?? '').trim().toLowerCase().replace(/[\s_-]/g, '');
  if (s === 'pinelabs' || s === 'pinelab' || s === 'plural') return 'pinelabs';
  if (s === 'razorpay') return 'razorpay';
  return null;
};

/**
 * Enabled gateways from the customer profile. Accepted shapes:
 * - `payment_gateways: { pinelabs: true, razorpay: false }`
 * - `payment_gateways: ['pinelabs', 'razorpay']` / `enabled_payment_gateways: [...]`
 * - `pinelabs_enabled` / `razorpay_enabled` booleans
 * Missing flags fall back to DEFAULT_GATEWAY_FLAGS.
 */
export const resolveEnabledGateways = (profile: any): PaymentGateway[] => {
  const source = profile?.customer ?? profile ?? {};
  const settings = source?.payment_settings ?? source?.settings ?? {};
  const raw =
    source?.payment_gateways ??
    source?.enabled_payment_gateways ??
    settings?.payment_gateways ??
    settings?.enabled_payment_gateways;

  const flags = { ...DEFAULT_GATEWAY_FLAGS };

  if (Array.isArray(raw)) {
    const listed = new Set(raw.map(normalizeGateway).filter(Boolean) as PaymentGateway[]);
    PAYMENT_GATEWAY_ORDER.forEach(id => {
      flags[id] = listed.has(id);
    });
  } else if (raw && typeof raw === 'object') {
    PAYMENT_GATEWAY_ORDER.forEach(id => {
      const entry = raw[id] ?? (id === 'pinelabs' ? raw.pine_labs ?? raw.pinelab : undefined);
      const value = entry && typeof entry === 'object' ? entry.enabled ?? entry.is_enabled : entry;
      flags[id] = toFlag(value, flags[id]);
    });
  }

  flags.pinelabs = toFlag(source?.pinelabs_enabled ?? settings?.pinelabs_enabled, flags.pinelabs);
  flags.razorpay = toFlag(source?.razorpay_enabled ?? settings?.razorpay_enabled, flags.razorpay);

  const enabled = PAYMENT_GATEWAY_ORDER.filter(id => flags[id]);
  return enabled.length ? enabled : ['razorpay'];
};

/** Preferred gateway from the profile (`default_payment_gateway`), else the first enabled. */
export const resolveDefaultGateway = (profile: any, enabled: PaymentGateway[]): PaymentGateway => {
  const source = profile?.customer ?? profile ?? {};
  const preferred = normalizeGateway(
    source?.default_payment_gateway ?? source?.payment_settings?.default_payment_gateway,
  );
  return preferred && enabled.includes(preferred) ? preferred : enabled[0];
};
