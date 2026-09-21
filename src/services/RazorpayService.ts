type RazorpayOptions = {
  key: string;
  amount: number;
  order_id: string;
  currency?: string;
  name: string;
  email: string;
  contact: string;
  description?: string;
  themeColor?: string;
};

/**
 * Detect user cancel / dismiss / back-exit from Razorpay.
 * SDK shapes vary: flat `{ code, description }` or nested `{ error: { reason, description } }`.
 */
export const isRazorpayUserCancelled = (error: any): boolean => {
  if (!error) return false;

  let cancelledCode: unknown;
  try {
    const RazorpayCheckout = require('react-native-razorpay').default;
    cancelledCode = RazorpayCheckout?.PAYMENT_CANCELLED;
  } catch {
    cancelledCode = undefined;
  }

  const nested = error?.error && typeof error.error === 'object' ? error.error : null;
  const code = error?.code ?? nested?.code;
  const reason = String(
    nested?.reason ?? error?.reason ?? '',
  ).toLowerCase();
  const desc = String(
    error?.description ??
      nested?.description ??
      error?.message ??
      nested?.message ??
      '',
  ).toLowerCase();
  const source = String(nested?.source ?? error?.source ?? '').toLowerCase();

  const looksCancelledByText =
    reason.includes('cancel') ||
    reason === 'payment_cancelled' ||
    reason.includes('dismiss') ||
    desc.includes('cancel') ||
    desc.includes('dismiss') ||
    desc.includes('exit') ||
    desc.includes('closed by user') ||
    desc.includes('back pressed');

  if (looksCancelledByText) {
    return true;
  }

  if (code === cancelledCode || code === 2 || code === '2') {
    return true;
  }

  // Code 0 is often cancel on RN Razorpay, but can also be network — only treat as
  // cancel when there is no hard failure wording.
  if (code === 0 || code === '0') {
    const looksFailed =
      desc.includes('network') ||
      desc.includes('fail') ||
      desc.includes('timeout') ||
      desc.includes('invalid') ||
      desc.includes('error');
    if (!looksFailed) {
      return true;
    }
  }

  // Common UPI back-exit payload from Razorpay
  if (
    source === 'customer' &&
    (reason.includes('payment') || desc.includes('upi') || desc.includes('delay'))
  ) {
    return true;
  }

  return false;
};

const delay = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

/**
 * Open Razorpay checkout.
 * Avoid InteractionManager — it can hang and block the native sheet forever.
 */
export const openRazorpayPayment = async (options: RazorpayOptions) => {
  // Lazy require so metro/native module issues surface at open-time with a clear error
  const RazorpayCheckout = require('react-native-razorpay').default;

  const key = String(options.key || '').trim();
  const orderId = String(options.order_id || '').trim();
  const amount = Math.round(Number(options.amount));

  if (!key) {
    throw {
      code: 'BAD_REQUEST',
      description: 'Payment key missing from order response',
    };
  }
  if (!orderId) {
    throw {
      code: 'BAD_REQUEST',
      description: 'Razorpay order id missing from order response',
    };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw { code: 'BAD_REQUEST', description: 'Invalid payment amount' };
  }

  const name = String(options.name || 'AyurMuni').trim() || 'AyurMuni';
  const email =
    String(options.email || 'customer@ayurmuni.com').trim() ||
    'customer@ayurmuni.com';
  let contact = String(options.contact || '').replace(/\D/g, '');
  if (contact.length === 10) contact = `91${contact}`;
  if (contact.length < 10) contact = '919999999999';

  const payload = {
    description: options.description || 'Payment',
    image: 'https://rzp-mobile.s3.amazonaws.com/images/rzp.jpg',
    currency: options.currency || 'INR',
    key,
    amount,
    order_id: orderId,
    name,
    prefill: {
      name,
      email,
      contact,
    },
    theme: {
      color: options.themeColor || '#0D614E',
    },
  };

  console.log('RAZORPAY_OPEN =>', {
    key: `${key.slice(0, 8)}…`,
    order_id: orderId,
    amount,
    contact,
    email,
  });

  // Brief yield so RN finishes the loading-state re-render before native UI
  await delay(250);

  try {
    const result = await RazorpayCheckout.open(payload);
    console.log('RAZORPAY_SUCCESS =>', {
      payment_id: result?.razorpay_payment_id,
    });
    return result;
  } catch (error) {
    console.log('RAZORPAY_OPEN_ERROR =>', error);
    throw error;
  }
};

/**
 * Convert API amount (rupees like 179 / "179.00") to Razorpay paise.
 * Product order API returns rupees — same as consultation.
 */
export const toRazorpayPaise = (
  apiAmount: unknown,
  fallbackRupees: number,
): number => {
  const fallback = Math.round(Number(fallbackRupees) || 0);
  const fallbackPaise = fallback * 100;
  const n = Number(apiAmount);

  if (!Number.isFinite(n) || n <= 0) {
    return fallbackPaise > 0 ? fallbackPaise : 0;
  }

  // Already paise for this order (e.g. 17900 when payable is 179)
  if (fallback > 0 && Math.round(n) === fallbackPaise) {
    return Math.round(n);
  }

  // Rupees (179, "179.00", 179.5) → paise
  if (n < 100000) {
    return Math.round(n * 100);
  }

  return Math.round(n);
};
