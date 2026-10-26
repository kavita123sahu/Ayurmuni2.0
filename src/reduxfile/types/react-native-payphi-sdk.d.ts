declare module 'react-native-payphi-sdk' {
  export type PayphiPaymentRequest = {
    amount: string | number;
    merchantId: string;
    merchantTxnNo: string;
    currencyCode: string;
    customerEmailID: string;
    secretKey: string;
    addlParam1?: string;
    addlParam2?: string;
    aggregatorID?: string;
    apiVersion?: string;
    [key: string]: unknown;
  };

  export type PayphiSdkModule = {
    getPlatformVersion?: () => Promise<string>;
    setAppInfo: (
      environment: string,
      merchantId: string,
      appId: string,
      merchantName?: string,
    ) => Promise<string>;
    makePayment: (request: PayphiPaymentRequest) => void;
    addPaymentResponseListener: (
      callback: (event: any) => void,
    ) => { remove: () => void };
  };

  const PayphiSdk: PayphiSdkModule;
  export default PayphiSdk;
}
