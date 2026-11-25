/**
 * Diet plan purchase contract:
 * GET diet/fee-quote/ → POST diet/purchase/ → gateway → POST diet/verify-payment/ → start.
 * Amounts always come from the server (never recomputed in the app).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './APIconfig';
import { formatRupee } from '../utils/currencyUtils';

const SETTLED_KEY = 'ayurmuni_diet_paid';
const SETTLED_TTL_MS = 24 * 60 * 60 * 1000;

const str = (value: unknown) =>
  value == null ? '' : String(value).trim();

const toNumber = (value: unknown): number | null => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const flagFalse = (value: unknown) =>
  value === false ||
  value === 0 ||
  value === '0' ||
  String(value).trim().toLowerCase() === 'false';

const flagTrue = (value: unknown) =>
  value === true ||
  value === 1 ||
  value === '1' ||
  String(value).trim().toLowerCase() === 'true';

export type DietFeeRow = {
  key: string;
  label: string;
  value: string;
  deduct?: boolean;
};

export type DietFeeSummary = {
  rows: DietFeeRow[];
  total: string;
  totalRaw: string;
};

export type DietPurchasePayload = {
  diet_plan_id: string;
  patient_id?: string | null;
  payment_gateway?: string | null;
};

export type ParsedDietPurchase = {
  purchase: Record<string, any>;
  checkout: Record<string, any>;
  purchaseId: string;
  gateway: string;
  gatewayOrderId: string;
  sessionId: string;
  razorpayKey: string;
  amount: string;
  amountPaise: number;
  fees: DietFeeSummary | null;
  alreadyPaid: boolean;
  skipGateway: boolean;
  message: string;
  error: string;
};

/** Display rupee text from a server decimal ("3538.82" -> "₹3,538.82"). */
export const formatServerMoney = (value: unknown) => {
  const n = toNumber(value);
  if (n == null) return '';
  return Number.isInteger(n)
    ? formatRupee(n)
    : formatRupee(n, { decimals: 2 });
};

const percentText = (value: unknown) => {
  const n = toNumber(value);
  if (n == null) return '';
  return `${Number.isInteger(n) ? n : Number(n.toFixed(2))}%`;
};

const moneyRow = (
  key: string,
  label: string,
  value: unknown,
  opts?: { deduct?: boolean },
): DietFeeRow | null => {
  const n = toNumber(value);
  if (n == null) return null;
  if (opts?.deduct && n <= 0) return null;
  const shown = opts?.deduct
    ? `− ${formatServerMoney(n)}`
    : formatServerMoney(n);
  return { key, label, value: shown, deduct: Boolean(opts?.deduct) };
};

/**
 * A catalog plan that must be paid before the first start.
 * Paused / stopped / completed runs already went through start — no charge again.
 * Price 0, or is_paid explicitly false, starts directly.
 */
export const dietPlanNeedsPurchase = (
  plan: any,
  status: string = 'not_started',
) => {
  if (!plan) return false;
  const state = String(status || 'not_started').toLowerCase();
  if (state && state !== 'not_started' && state !== 'none') return false;
  if (flagFalse(plan.is_paid)) return false;
  if (
    flagTrue(plan.is_purchased) ||
    plan.is_purchased === 1 ||
    String(plan.is_purchased || '').toLowerCase() === 'true'
  ) {
    return false;
  }
  const price = toNumber(
    plan.price ?? plan.selling_price ?? plan.amount ?? plan.paid_price,
  );
  if (flagTrue(plan.is_paid)) return !(price != null && price <= 0);
  return price != null && price > 0;
};

export const isDietAlreadyPurchasedMessage = (message: unknown) =>
  /already (purchased|paid|bought)/i.test(String(message || ''));

/** Invoice rows from `checkout.fees` (fallback `purchase.fees` / fee-quote). */
export const mapDietFees = (fees: any): DietFeeSummary | null => {
  if (!fees || typeof fees !== 'object' || Array.isArray(fees)) return null;
  const rows: DietFeeRow[] = [];
  const push = (row: DietFeeRow | null) => {
    if (row) rows.push(row);
  };
  push(
    moneyRow(
      'price',
      'Diet plan',
      fees.selling_price ?? fees.price ?? fees.plan_price,
    ),
  );
  if (toNumber(fees.discount_amount) != null) {
    push(moneyRow('discount', 'Discount', fees.discount_amount, { deduct: true }));
  } else {
    push(moneyRow('discount', 'Discount', fees.discount, { deduct: true }));
  }
  push(
    moneyRow('coupon', 'Coupon', fees.coupon_discount ?? fees.coupon_amount, {
      deduct: true,
    }),
  );
  push(
    moneyRow('offer', 'Offer', fees.offer_discount ?? fees.offer_amount, {
      deduct: true,
    }),
  );
  push(moneyRow('subtotal', 'Taxable value', fees.taxable_amount ?? fees.subtotal));
  if (toNumber(fees.gst_amount) != null) {
    const pct = percentText(fees.gst_percent);
    push(moneyRow('gst', pct ? `GST (${pct})` : 'GST', fees.gst_amount));
  }
  if (toNumber(fees.platform_fee) != null) {
    const pct = percentText(fees.platform_fee_percent);
    push(
      moneyRow(
        'platform',
        pct && toNumber(fees.platform_fee_percent)! > 0
          ? `Platform fee (${pct})`
          : 'Platform fee',
        fees.platform_fee,
      ),
    );
  }
  push(moneyRow('convenience', 'Convenience fee', fees.convenience_fee));
  const totalRaw = fees.total_payable_amount ?? fees.total ?? fees.paid_price;
  if (toNumber(totalRaw) == null && !rows.length) return null;
  if (!rows.length && toNumber(totalRaw) != null) {
    rows.push({
      key: 'price',
      label: 'Diet plan',
      value: formatServerMoney(totalRaw),
      deduct: false,
    });
  }
  return {
    rows,
    total: formatServerMoney(totalRaw) || (rows.length ? rows[rows.length - 1].value : ''),
    totalRaw: str(totalRaw),
  };
};

const toPaise = (value: unknown) => {
  const n = toNumber(value);
  return n != null && n > 0 ? Math.round(n * 100) : 0;
};

const PAID_STATUSES = new Set([
  'paid',
  'success',
  'successful',
  'captured',
  'completed',
]);

/**
 * Normalised purchase response.
 * `skipGateway` → nothing due (already paid / payable 0) — start the plan.
 */
export const parseDietPurchase = (
  response: any,
  requestedGateway?: string,
): ParsedDietPurchase => {
  const root =
    response?.data && typeof response.data === 'object' ? response.data : {};
  const purchase =
    root.purchase && typeof root.purchase === 'object' ? root.purchase : root;
  const checkout =
    root.checkout && typeof root.checkout === 'object' ? root.checkout : root;
  const gateway = str(
    checkout.payment_gateway ||
      purchase.payment_gateway ||
      requestedGateway ||
      'cashfree',
  ).toLowerCase();
  const gatewayOrderId = str(
    checkout.gateway_order_id ||
      checkout.cashfree_order_id ||
      checkout.razorpay_order_id ||
      checkout.order_id,
  );
  const feeSource =
    (checkout.fees && typeof checkout.fees === 'object' ? checkout.fees : null) ||
    (purchase.fees && typeof purchase.fees === 'object' ? purchase.fees : null);
  const amount = str(
    checkout.amount ??
      purchase.paid_price ??
      purchase.amount ??
      feeSource?.total_payable_amount,
  );
  const fees =
    mapDietFees(feeSource) ||
    (amount
      ? {
          rows: [
            {
              key: 'price',
              label: 'Diet plan',
              value: formatServerMoney(amount),
            },
          ],
          total: formatServerMoney(amount),
          totalRaw: amount,
        }
      : null);
  const status = str(purchase.status || purchase.payment_status).toLowerCase();
  const parsed: ParsedDietPurchase = {
    purchase,
    checkout,
    purchaseId: str(purchase.id || purchase.purchase_id),
    gateway: gateway || 'cashfree',
    gatewayOrderId,
    sessionId: str(checkout.payment_session_id),
    razorpayKey: str(
      root.razorpay_key ||
        checkout.razorpay_key ||
        checkout.key ||
        purchase.razorpay_key,
    ),
    amount,
    amountPaise: toPaise(amount),
    fees,
    alreadyPaid: PAID_STATUSES.has(status),
    skipGateway: false,
    message: str(response?.message),
    error: '',
  };
  const paid = toNumber(purchase.paid_price);
  const charged = toNumber(checkout.amount);
  const sameNode = checkout === purchase;
  if (!parsed.purchaseId) {
    parsed.error = 'Could not start payment.';
  } else if (
    !sameNode &&
    paid != null &&
    charged != null &&
    Math.round(paid * 100) !== Math.round(charged * 100)
  ) {
    parsed.error = 'Payment amount mismatch. Please try again.';
  } else if (parsed.alreadyPaid || parsed.amountPaise <= 0) {
    parsed.skipGateway = true;
  } else if (!parsed.sessionId && !gatewayOrderId && gateway === 'cashfree') {
    parsed.error = 'Payment gateway not ready. Please try again.';
  }
  return parsed;
};

/**
 * POST diet/verify-payment/ body.
 * Cashfree: purchase_id + gateway_order_id (+ gateway_payment_id when known).
 */
export const buildDietVerifyPayload = (
  parsed: Pick<ParsedDietPurchase, 'purchaseId' | 'gateway' | 'gatewayOrderId'>,
  response: Record<string, any> = {},
) => {
  const orderId =
    str(response?.gateway_order_id) ||
    str(response?.razorpay_order_id) ||
    str(response?.cashfree_order_id) ||
    str(response?.order_id) ||
    str(parsed?.gatewayOrderId);
  const paymentId =
    str(response?.gateway_payment_id) ||
    str(response?.razorpay_payment_id) ||
    str(response?.cf_payment_id) ||
    str(response?.cashfree_payment_id);
  const signature =
    str(response?.gateway_signature) || str(response?.razorpay_signature);

  if (parsed?.gateway === 'razorpay') {
    return {
      purchase_id: str(parsed?.purchaseId),
      gateway_order_id: orderId,
      gateway_payment_id: paymentId,
      gateway_signature: signature,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    };
  }

  return {
    purchase_id: str(parsed?.purchaseId),
    gateway_order_id: orderId,
    ...(paymentId
      ? { gateway_payment_id: paymentId, cf_payment_id: paymentId }
      : {}),
    ...(orderId ? { cashfree_order_id: orderId } : {}),
  };
};

const PAID_VERIFY = new Set([
  'paid',
  'success',
  'successful',
  'completed',
  'captured',
  'active',
]);
const UNPAID_VERIFY = new Set([
  'failed',
  'failure',
  'pending',
  'created',
  'initiated',
  'cancelled',
  'canceled',
  'expired',
]);

/** True when diet/verify-payment/ says the charge is captured. */
export const isDietPaymentVerified = (verify: any) => {
  if (!verify || typeof verify !== 'object') return false;
  if (
    verify.success === false ||
    verify.success === 'false' ||
    verify.success === 0
  ) {
    return false;
  }
  const status = str(
    verify?.data?.purchase?.status ||
      verify?.data?.payment_status ||
      verify?.data?.status,
  ).toLowerCase();
  if (UNPAID_VERIFY.has(status)) return false;
  if (
    verify.success === true ||
    verify.success === 'true' ||
    verify.success === 1
  ) {
    return true;
  }
  return PAID_VERIFY.has(status);
};

/* -------------------------------------------------------------------------- */
/*                              Settled cache                                 */
/* -------------------------------------------------------------------------- */

type SettledStore = Record<string, { purchaseId?: string; at: number }>;

const readSettled = async (): Promise<SettledStore> => {
  try {
    const raw = await AsyncStorage.getItem(SETTLED_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

/** Payment for this plan already verified — next Start must not charge again. */
export const isDietPaymentSettled = async (planId: string) => {
  const id = str(planId);
  if (!id) return false;
  const row = (await readSettled())[id];
  if (!row?.at) return false;
  return Date.now() - Number(row.at) < SETTLED_TTL_MS;
};

export const rememberDietPaymentSettled = async (
  planId: string,
  purchaseId?: string,
) => {
  const id = str(planId);
  if (!id) return;
  try {
    const all = await readSettled();
    all[id] = { purchaseId: str(purchaseId), at: Date.now() };
    await AsyncStorage.setItem(SETTLED_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota */
  }
};

export const clearDietPaymentSettled = async (planId: string) => {
  const id = str(planId);
  if (!id) return;
  try {
    const all = await readSettled();
    delete all[id];
    await AsyncStorage.setItem(SETTLED_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
};

/* -------------------------------------------------------------------------- */
/*                                    APIs                                    */
/* -------------------------------------------------------------------------- */

/** GET diet/fee-quote/?diet_plan_id= — server price breakup. */
export const getDietFeeQuote = async (dietPlanId: string) => {
  const id = encodeURIComponent(str(dietPlanId));
  return apiClient(`diet/fee-quote/?diet_plan_id=${id}`, { method: 'GET' });
};

/** POST diet/purchase/ — creates the gateway order. Does not start the plan. */
export const purchaseDietPlan = async (payload: DietPurchasePayload) => {
  const body: DietPurchasePayload = {
    diet_plan_id: str(payload.diet_plan_id),
  };
  if (payload.patient_id) body.patient_id = str(payload.patient_id);
  if (payload.payment_gateway) {
    body.payment_gateway = str(payload.payment_gateway);
  }
  console.log('DIET_PURCHASE_PAYLOAD =>', body);
  const response = await apiClient('diet/purchase/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  console.log('DIET_PURCHASE_RESPONSE =>', JSON.stringify(response));
  return response;
};

/** POST diet/verify-payment/ — confirms the gateway charge before start. */
export const verifyDietPayment = async (payload: Record<string, unknown>) => {
  console.log('DIET_VERIFY_PAYLOAD =>', payload);
  const response = await apiClient('diet/verify-payment/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  console.log('DIET_VERIFY_RESPONSE =>', JSON.stringify(response));
  return response;
};

/** Patient's own diet runs (no catalog `type=all`). */
export const getMyDietPlans = async (
  params: {
    page?: number;
    page_size?: number;
    patient_assignment_status?: string;
    is_purchased?: string | boolean;
    search?: string;
  } = {},
) => {
  const query = new URLSearchParams();
  query.set('page', String(params.page ?? 1));
  query.set('page_size', String(params.page_size ?? 40));
  if (params.patient_assignment_status) {
    query.set(
      'patient_assignment_status',
      String(params.patient_assignment_status),
    );
  }
  if (params.is_purchased != null && params.is_purchased !== '') {
    query.set('is_purchased', String(params.is_purchased));
  }
  if (params.search) query.set('search', String(params.search).trim());
  return apiClient(`patients/diet-plans/?${query.toString()}`, {
    method: 'GET',
  });
};
