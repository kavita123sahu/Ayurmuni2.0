import RazorpayCheckout from 'react-native-razorpay';

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

export const openRazorpayPayment = (options: RazorpayOptions) => {
  return RazorpayCheckout.open({
    description: options.description || 'Payment',
    image: 'https://rzp-mobile.s3.amazonaws.com/images/rzp.jpg',

    currency: options.currency || 'INR',
    key: options.key,
    amount: options.amount,

    order_id: options.order_id,

    name: options.name,

    prefill: {
      name: options.name,
      email: options.email,
      contact: options.contact,
    },

    theme: {
      color: options.themeColor || '#000',
    },

    modal: {
      confirm_close: true,
    },
  });
};