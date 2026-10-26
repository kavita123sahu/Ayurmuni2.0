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

/** Read Razorpay key from place-order / book-slot response (exact API fields). */
export const pickRazorpayKey = (data: any): string => {
  if (!data || typeof data !== 'object') return '';
  const candidates = [
    data.razorpay_key,
    data.razorpay?.key,
    data.razorpay?.key_id,
    data.gateway_key,
    data.key_id,
    data.checkout?.razorpay_key,
    data.checkout?.key,
    data.checkout?.key_id,
    data.key,
  ];
  for (const value of candidates) {
    const key = String(value ?? '').trim();
    if (key.startsWith('rzp_')) return key;
  }
  // Fallback: any non-empty string key field (legacy)
  for (const value of candidates) {
    const key = String(value ?? '').trim();
    if (key) return key;
  }
  return '';
};

/** Convert rupees (or already-paise) to Razorpay paise. */
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
  if (fallback > 0 && Math.round(n) === fallbackPaise) {
    return Math.round(n);
  }
  if (n < 100000) {
    return Math.round(n * 100);
  }
  return Math.round(n);
};

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

const digits = (value: unknown, fallback = '919999999999') => {
  let contact = String(value || '').replace(/\D/g, '');
  if (contact.length === 10) contact = `91${contact}`;
  return contact.length >= 10 ? contact : fallback;
};

/** True when user cancelled / dismissed Razorpay. */
export const isRazorpayUserCancelled = (error: any): boolean => {
  if (!error) return false;

  let cancelledCode: unknown;
  try {
    cancelledCode = require('react-native-razorpay').default?.PAYMENT_CANCELLED;
  } catch {
    cancelledCode = undefined;
  }

  const nested =
    error?.error && typeof error.error === 'object' ? error.error : null;
  const code = error?.code ?? nested?.code;
  const reason = String(nested?.reason ?? error?.reason ?? '').toLowerCase();
  const desc = String(
    error?.description ?? nested?.description ?? error?.message ?? '',
  ).toLowerCase();
  const source = String(nested?.source ?? error?.source ?? '').toLowerCase();

  if (
    reason.includes('cancel') ||
    reason === 'payment_cancelled' ||
    reason.includes('dismiss') ||
    desc.includes('cancel') ||
    desc.includes('dismiss') ||
    desc.includes('closed by user') ||
    desc.includes('back pressed')
  ) {
    return true;
  }

  if (code === cancelledCode || code === 2 || code === '2') return true;

  if (code === 0 || code === '0') {
    const looksFailed =
      desc.includes('network') ||
      desc.includes('fail') ||
      desc.includes('timeout') ||
      desc.includes('invalid');
    if (!looksFailed) return true;
  }

  if (
    source === 'customer' &&
    (reason.includes('payment') || desc.includes('upi') || desc.includes('delay'))
  ) {
    return true;
  }

  return false;
};

/** Open Razorpay checkout. Needs razorpay_key + order_id + amount (paise). */
export const openRazorpayPayment = async (options: RazorpayOptions) => {
  const RazorpayCheckout = require('react-native-razorpay').default;

  const key = String(options.key || '').trim();
  const orderId = String(options.order_id || '').trim();
  const amount = Math.round(Number(options.amount));

  if (!key) {
    throw { code: 'BAD_REQUEST', description: 'Payment key missing from order response' };
  }
  if (!orderId) {
    throw { code: 'BAD_REQUEST', description: 'Razorpay order id missing from order response' };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw { code: 'BAD_REQUEST', description: 'Invalid payment amount' };
  }

  const name = String(options.name || 'AyurMuni').trim() || 'AyurMuni';
  const email =
    String(options.email || 'customer@ayurmuni.com').trim() ||
    'customer@ayurmuni.com';
  const contact = digits(options.contact);

  const payload = {
    description: options.description || 'Payment',
    image: 'https://rzp-mobile.s3.amazonaws.com/images/rzp.jpg',
    currency: options.currency || 'INR',
    key,
    amount,
    order_id: orderId,
    name,
    prefill: { name, email, contact },
    theme: { color: options.themeColor || '#0D614E' },
  };

  console.log('RAZORPAY_OPEN =>', {
    key: `${key.slice(0, 8)}…`,
    order_id: orderId,
    amount,
  });

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

/** Open Razorpay for an autopay subscription (subscription_id, not order). */
export const openRazorpaySubscription = async (options: {
  key: string;
  subscription_id: string;
  name: string;
  email: string;
  contact: string;
  description?: string;
  themeColor?: string;
}) => {
  const RazorpayCheckout = require('react-native-razorpay').default;

  const key = String(options.key || '').trim();
  const subscriptionId = String(options.subscription_id || '').trim();
  if (!key) {
    throw { code: 'BAD_REQUEST', description: 'Payment key missing from response' };
  }
  if (!subscriptionId) {
    throw { code: 'BAD_REQUEST', description: 'Subscription id missing from response' };
  }

  const name = String(options.name || 'AyurMuni').trim() || 'AyurMuni';
  const email =
    String(options.email || 'customer@ayurmuni.com').trim() ||
    'customer@ayurmuni.com';
  const contact = digits(options.contact);

  await delay(250);

  return RazorpayCheckout.open({
    description: options.description || 'Subscription',
    currency: 'INR',
    key,
    subscription_id: subscriptionId,
    name,
    prefill: { name, email, contact },
    theme: { color: options.themeColor || '#0D614E' },
  });
};
