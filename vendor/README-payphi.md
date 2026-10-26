# ICICI PayPhi

## App behaviour

- Uses book-slot `data.icici` **as-is** (no frontend remapping).
- **`secretKey` is never required in the app** — it stays on the backend.
- SDK opens with `merchantId`, `merchantTxnNo`, `amount`, `currencyCode`, `customerEmailID`, etc. from `data.icici`.
- Optional: backend may send `secureToken` / `SecureToken` / `secureHash` on `data.icici` (HMAC computed server-side). If present, the native bridge uses it.

## Overrides

`vendor/payphi-sdk-overrides/` patches the installed SDK so `secretKey` is not mandatory.  
Applied automatically via `npm postinstall` (`scripts/apply-payphi-overrides.js`).

After changing overrides, rebuild:

```bash
npx react-native run-android
```

## verify-payment

```json
{
  "payment_id": "<book-slot>",
  "gateway_order_id": "<book-slot gateway_order_id>",
  "icici_merchant_txn_no": "<same>",
  "merchantTxnNo": "<same>",
  "payment_gateway": "icici"
}
```
