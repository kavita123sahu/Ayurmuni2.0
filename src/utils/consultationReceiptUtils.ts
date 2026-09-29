/**
 * Normalize consultation receipt API payload into display-ready fee + payment fields.
 *
 * Notes live under:
 * payment_information.payload.payment.entity.notes
 * { gst_amount, platform_fee, listed_amount, ... }
 */

const toNumber = (value: any): number => {
  if (value == null || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** Razorpay amounts are often in paise when large vs rupee totals. */
const amountFromPaymentEntity = (entity: any, fallbackRupees: number): number => {
  const raw = toNumber(entity?.amount);
  if (!raw) return fallbackRupees;
  // Heuristic: if amount looks like paise (>= 1000 and no decimal on related totals), convert
  if (raw >= 1000 && Number.isInteger(raw)) {
    return raw / 100;
  }
  return raw;
};

export const getConsultationPaymentEntity = (receipt: any) => {
  const info = receipt?.payment_information;
  return (
    info?.payload?.payment?.entity ||
    info?.payment?.entity ||
    info?.payload?.entity ||
    null
  );
};

export const getConsultationPaymentNotes = (receipt: any) => {
  const entity = getConsultationPaymentEntity(receipt);
  const notes = entity?.notes;
  return notes && typeof notes === 'object' ? notes : {};
};

export type ConsultationReceiptBreakdown = {
  consultationFee: number;
  platformFee: number;
  gstAmount: number;
  listedAmount: number;
  /** Razorpay gateway fee (paise → rupees when needed) */
  gatewayFee: number;
  gatewayTax: number;
  totalPaid: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentId: string;
  orderId: string;
  bank: string;
  bankTransactionId: string;
  paidAt: string;
  email: string;
  contact: string;
};

export const parseConsultationReceiptBreakdown = (
  receipt: any,
): ConsultationReceiptBreakdown => {
  const notes = getConsultationPaymentNotes(receipt);
  const entity = getConsultationPaymentEntity(receipt);
  const info = receipt?.payment_information || {};

  const consultationFee = toNumber(
    receipt?.consultation_fees ?? notes?.listed_amount ?? 0,
  );
  const platformFee = toNumber(notes?.platform_fee ?? receipt?.platform_fee);
  const gstAmount = toNumber(notes?.gst_amount ?? receipt?.gst_amount);
  const listedAmount = toNumber(notes?.listed_amount) || consultationFee;

  const totalFromApi = toNumber(receipt?.amount ?? receipt?.total_amount);
  const totalFromParts =
    consultationFee + platformFee + gstAmount > 0
      ? consultationFee + platformFee + gstAmount
      : 0;
  const totalPaid =
    totalFromApi > 0
      ? totalFromApi
      : amountFromPaymentEntity(entity, totalFromParts || consultationFee);

  const gatewayFeeRaw = toNumber(entity?.fee);
  const gatewayTaxRaw = toNumber(entity?.tax);
  const gatewayFee =
    gatewayFeeRaw >= 100 && Number.isInteger(gatewayFeeRaw)
      ? gatewayFeeRaw / 100
      : gatewayFeeRaw;
  const gatewayTax =
    gatewayTaxRaw >= 100 && Number.isInteger(gatewayTaxRaw)
      ? gatewayTaxRaw / 100
      : gatewayTaxRaw;

  const method = String(entity?.method || receipt?.payment_method || '').trim();
  const methodLabel = method
    ? method.charAt(0).toUpperCase() + method.slice(1)
    : String(receipt?.payment_type || '').trim() || '—';

  return {
    consultationFee,
    platformFee,
    gstAmount,
    listedAmount,
    gatewayFee,
    gatewayTax,
    totalPaid,
    currency: String(receipt?.currency || entity?.currency || 'INR'),
    paymentMethod: methodLabel,
    paymentStatus: String(
      receipt?.payment_status || entity?.status || '',
    ).trim(),
    paymentId: String(
      entity?.id ||
        info?.razorpay_payment_id ||
        receipt?.payment_id ||
        '',
    ).trim(),
    orderId: String(
      entity?.order_id || info?.razorpay_order_id || '',
    ).trim(),
    bank: String(entity?.bank || '').trim(),
    bankTransactionId: String(
      entity?.acquirer_data?.bank_transaction_id || '',
    ).trim(),
    paidAt: String(
      info?.verified_at || receipt?.paid_at || receipt?.date || '',
    ).trim(),
    email: String(entity?.email || '').trim(),
    contact: String(entity?.contact || '').trim(),
  };
};
