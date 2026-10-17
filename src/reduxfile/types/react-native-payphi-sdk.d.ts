declare module 'react-native-payphi-sdk' {
  export type PayphiAppInfo = {
    merchantId: string;
    environment?: string;
    aggregatorId?: string;
    appName?: string;
    appVersion?: string;
    [key: string]: unknown;
  };

  export type PayphiPaymentRequest = {
    amount: number | string;
    invoiceNo: string;
    currencyCode?: string;
    customerEmail?: string;
    customerMobile?: string;
    customerName?: string;
    [key: string]: unknown;
  };

  export type PayphiSdkModule = {
    setAppInfo?: (info: PayphiAppInfo) => void | Promise<void>;
    setAppinfo?: (info: PayphiAppInfo) => void | Promise<void>;
    init?: (info: PayphiAppInfo) => void | Promise<void>;
    makePayment?: (
      request: PayphiPaymentRequest,
    ) => void | Promise<any>;
    startPayment?: (
      request: PayphiPaymentRequest,
    ) => void | Promise<any>;
    pay?: (request: PayphiPaymentRequest) => void | Promise<any>;
  };

  const PayphiSdk: PayphiSdkModule;
  export default PayphiSdk;
  export const PayphiSdk: PayphiSdkModule;
}
