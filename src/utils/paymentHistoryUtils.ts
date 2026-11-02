/** Appointment payment timeline from `payment.history` (consultation APIs). */

export type PaymentBreakdownLine = {
  key: string;
  label: string;
  amount: number;
  emphasize?: boolean;
  muted?: boolean;
};

export type PaymentBreakdown = {
  currency: string;
  consultationFee: number | null;
  platformFee: number | null;
  platformFeePercent: number | null;
  gst: number | null;
  gstPercent: number | null;
  couponDiscount: number | null;
  couponCode: string | null;
  total: number | null;
  status: string | null;
  lines: PaymentBreakdownLine[];
};

const toMoney = (value: any): number | null => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toPercent = (value: any): number | null => {
  const n = toMoney(value);
  if (n == null) return null;
  return n;
};

const pickPaymentRoot = (...sources: any[]) => {
  for (const source of sources) {
    if (!source) continue;
    if (source?.payment && typeof source.payment === 'object') return source.payment;
    if (source?.summary && typeof source.summary === 'object' && source?.amount != null) {
      return source;
    }
  }
  return null;
};

/**
 * Normalize consultation payment.summary (+ root gst_percent / platform_fee_percent)
 * into clear fee / GST% / platform fee / total rows.
 */
export const getPaymentBreakdown = (...sources: any[]): PaymentBreakdown | null => {
  const payment = pickPaymentRoot(...sources);
  if (!payment) return null;

  const summary =
    payment?.summary && typeof payment.summary === 'object'
      ? payment.summary
      : payment;

  const consultationFee = toMoney(
    summary?.consultation_fee ??
      summary?.taxable_consultation_fee ??
      payment?.consultation_fee,
  );
  const platformFee = toMoney(
    summary?.platform_fee ?? payment?.platform_fee,
  );
  const platformFeePercent = toPercent(
    payment?.platform_fee_percent ?? summary?.platform_fee_percent,
  );
  const gst = toMoney(summary?.gst ?? payment?.gst);
  const gstPercent = toPercent(
    payment?.gst_percent ?? summary?.gst_percent ?? summary?.gst_rate,
  );
  const couponDiscount = toMoney(
    summary?.coupon_discount ?? payment?.coupon_discount,
  );
  const couponCode =
    payment?.coupon_code || summary?.coupon_code
      ? String(payment?.coupon_code || summary?.coupon_code)
      : null;
  const total = toMoney(
    summary?.total_payable_amount ??
      payment?.amount ??
      payment?.total_amount ??
      payment?.paid_amount,
  );
  const currency = String(
    summary?.currency || payment?.currency || 'INR',
  );
  const status = payment?.status
    ? String(payment.status).trim().toLowerCase()
    : null;

  const structuredLines: PaymentBreakdownLine[] = [
    consultationFee != null
      ? {
          key: 'consultation_fee',
          label: 'Consultation fee',
          amount: consultationFee,
        }
      : null,
    couponDiscount != null && couponDiscount > 0
      ? {
          key: 'coupon_discount',
          label: couponCode ? `Coupon (${couponCode})` : 'Coupon discount',
          amount: -Math.abs(couponDiscount),
          muted: true,
        }
      : null,
    platformFee != null && platformFee !== 0
      ? {
          key: 'platform_fee',
          label:
            platformFeePercent != null && platformFeePercent > 0
              ? `Platform fee (${platformFeePercent}%)`
              : 'Platform fee',
          amount: platformFee,
        }
      : null,
    gst != null && gst !== 0
      ? {
          key: 'gst',
          label:
            gstPercent != null && gstPercent > 0
              ? `GST (${gstPercent}%)`
              : 'GST',
          amount: gst,
        }
      : null,
    total != null
      ? {
          key: 'total',
          label: 'Total paid',
          amount: total,
          emphasize: true,
        }
      : null,
  ].filter(Boolean) as PaymentBreakdownLine[];

  // Prefer structured fee/GST%/platform rows when API provides summary numbers
  let lines = structuredLines;
  if (lines.length === 0) {
    const apiLines = Array.isArray(summary?.lines) ? summary.lines : [];
    lines = apiLines
      .map((line: any, index: number) => {
        const amount = toMoney(
          line?.amount ?? line?.value ?? line?.total ?? line?.fee,
        );
        const label = String(
          line?.label || line?.name || line?.title || line?.description || '',
        ).trim();
        if (!label || amount == null) return null;
        return {
          key: `api-${index}-${label}`,
          label,
          amount,
          emphasize: Boolean(line?.emphasize || line?.is_total),
          muted: Boolean(line?.muted || line?.is_discount),
        } as PaymentBreakdownLine;
      })
      .filter(Boolean) as PaymentBreakdownLine[];
  }

  if (!lines.length && total == null && consultationFee == null) {
    return null;
  }

  // Ensure total row exists when API lines omit it
  if (
    total != null &&
    !lines.some(l => l.emphasize || /total/i.test(l.label))
  ) {
    lines.push({
      key: 'total',
      label: 'Total paid',
      amount: total,
      emphasize: true,
    });
  }

  return {
    currency,
    consultationFee,
    platformFee,
    platformFeePercent,
    gst,
    gstPercent,
    couponDiscount,
    couponCode,
    total,
    status,
    lines,
  };
};

export type PaymentHistoryEntry = {
  status: string;
  amount: number | null;
  currency: string;
  reason?: string;
  at?: string;
  gateway_refund_id?: string;
};

export type RefundSummary = {
  amount: number | null;
  at?: string;
  refundId?: string;
};

const REFUND_ELIGIBLE_STATUSES = new Set([
  'cancelled',
  'canceled',
  'missed',
  'expired',
  'no_show',
  'noshow',
]);

const mapHistoryEntries = (list: any[]): PaymentHistoryEntry[] =>
  list
    .map((entry: any) => {
      const amountNum = Number(entry?.amount);
      return {
        status: String(entry?.status || '').trim().toLowerCase(),
        amount: Number.isFinite(amountNum) ? amountNum : null,
        currency: String(entry?.currency || 'INR'),
        reason: entry?.reason ? String(entry.reason) : undefined,
        at: entry?.at ? String(entry.at) : undefined,
        gateway_refund_id: entry?.gateway_refund_id
          ? String(entry.gateway_refund_id)
          : undefined,
      };
    })
    .filter(entry => entry.status)
    .sort((a, b) => {
      const ta = a.at ? new Date(a.at).getTime() : 0;
      const tb = b.at ? new Date(b.at).getTime() : 0;
      return ta - tb;
    });

const pickHistory = (source: any): any[] | null => {
  const list =
    source?.payment?.history ??
    source?.payment_history ??
    source?.appointment?.payment?.history ??
    source?.rawData?.payment?.history ??
    source?.rawData?.appointment?.payment?.history;
  return Array.isArray(list) ? list : null;
};

/** `payment.refund.history` (or nested refund object) for refund tracking UI. */
const pickRefundHistory = (source: any): any[] | null => {
  const candidates = [
    source?.payment?.refund?.history,
    source?.payment?.refund_history,
    source?.refund?.history,
    source?.appointment?.payment?.refund?.history,
    source?.appointment?.refund?.history,
    source?.rawData?.payment?.refund?.history,
    source?.rawData?.refund?.history,
  ];
  for (const list of candidates) {
    if (Array.isArray(list) && list.length) return list;
  }
  return null;
};

export const getPaymentHistory = (
  ...sources: any[]
): PaymentHistoryEntry[] => {
  for (const source of sources) {
    const list = pickHistory(source);
    if (!list?.length) continue;
    return mapHistoryEntries(list);
  }
  return [];
};

/** Refund timeline from `payment.refund.history` for Appointment Detail. */
export const getRefundHistory = (
  ...sources: any[]
): PaymentHistoryEntry[] => {
  for (const source of sources) {
    const list = pickRefundHistory(source);
    if (!list?.length) continue;
    return mapHistoryEntries(list);
  }
  // Fallback: refund_* rows inside payment.history
  const fromPayment = getPaymentHistory(...sources).filter(e =>
    e.status.startsWith('refund'),
  );
  return fromPayment;
};

export type RefundDisplay = RefundSummary & {
  label: string;
  pending?: boolean;
};

/** Refund paid or initiated for cancelled / missed — list badge. */
export const getCompletedRefund = (
  appointmentStatus: string | undefined,
  ...sources: any[]
): RefundDisplay | null => {
  const status = String(appointmentStatus || '').trim().toLowerCase();
  if (!REFUND_ELIGIBLE_STATUSES.has(status)) return null;
  const history = [
    ...getRefundHistory(...sources),
    ...getPaymentHistory(...sources),
  ];
  const paid = [...history].reverse().find(e => e.status === 'refund_paid');
  if (paid) {
    return {
      amount: paid.amount,
      at: paid.at,
      refundId: paid.gateway_refund_id,
      label: 'Refunded',
      pending: false,
    };
  }
  const pending = [...history]
    .reverse()
    .find(e => e.status === 'refund_pending');
  if (pending) {
    return {
      amount: pending.amount,
      at: pending.at,
      refundId: pending.gateway_refund_id,
      label: 'Refund initiated',
      pending: true,
    };
  }
  return null;
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'Payment complete',
  pending: 'Payment pending',
  failed: 'Payment failed',
  cancelled: 'Appointment cancelled',
  canceled: 'Appointment cancelled',
  missed: 'Appointment missed',
  refund_pending: 'Refund initiated',
  refund_paid: 'Refund completed',
  refund_failed: 'Refund failed',
};

export const formatPaymentStatusLabel = (status: string) =>
  PAYMENT_STATUS_LABELS[status] ||
  status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

/** Tone used for the timeline dot / text. */
export const getPaymentStatusTone = (
  status: string,
): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (status === 'paid' || status === 'refund_paid') return 'success';
  if (status === 'refund_pending' || status === 'pending') return 'warning';
  if (
    status === 'failed' ||
    status === 'refund_failed' ||
    status === 'cancelled' ||
    status === 'canceled' ||
    status === 'missed'
  ) {
    return 'danger';
  }
  return 'neutral';
};

/** Backend reason codes like `personal_or_unforeseen_circumstance` → readable text. */
export const formatPaymentReason = (reason?: string) => {
  if (!reason) return '';
  if (/\s/.test(reason)) return reason;
  const text = reason.replace(/_/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatPaymentTimestamp = (at?: string) => {
  if (!at) return '';
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return '';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${hours}:${minutes} ${meridiem}`;
};
