# PayPhi (ICICI) Customer SDK

1. Copy `react-native-payphi-sdk-v1.0.0.tgz` into this `vendor/` folder.
2. Install:

```bash
npm install ./vendor/react-native-payphi-sdk-v1.0.0.tgz
```

3. Rebuild the native app (required — not a JS-only change):

```bash
npx react-native run-android
# and for iOS: link the framework per the PayPhi installation guide, then
npx react-native run-ios
```

The app already wires:

- `payment_gateway: 'payphi'` on place-order / book-slot
- `PayphiSdk.setAppInfo()` + `PayphiSdk.makePayment()`
- `payment_response` → verify-payment
