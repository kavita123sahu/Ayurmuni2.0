# 03 — Summary

Counts are rows in `01-app-vs-web.md`. Every app-inventory ID is one row.

| Status | Rows |
| --- | ---: |
| MATCH | 363 |
| PARTIAL | 99 |
| MISSING | 17 |
| N/A-PLATFORM | 5 |
| Total | 484 |

Native comparison only. Excludes S-098–S-188 and C-126–C-179, which are website files copied into the app inventory.

| Status | Native rows |
| --- | ---: |
| MATCH | 218 |
| PARTIAL | 99 |
| MISSING | 17 |
| N/A-PLATFORM | 5 |
| Native total | 339 |

Unclaimed web pages: 4. Unclaimed web components: 20. Unclaimed web APIs: 0.

App-inventory IDs checked: 484. Missing from the table: 0.

## Build order

Shared clients and the calls both apps already use come first. Pages that are blocked by a missing call come after that call exists.

1. Keep one API client behavior: bearer token, 401 refresh (`user/token/refresh/`), and the same JSON error shape. Auth batch showed the web client already does this.
2. Auth calls both sides share: send OTP, login, register, profile GET and POST, legal policy GET. Then close the P0 auth gaps: profile 403 on splash, policy accept after OTP, register profile check, and mount `/policy-accept`.
3. Account recover (`user/customer/account/recover/`) before treating the deleted-account alert as finished.
4. Shared components used by those pages: button, field, modal, policy content, toast, empty state, search field.
5. Catalog calls both sides share: products, categories, discovery, cart, coupons, fee quote, place order, verify payment. Then the Razorpay path on checkout and consult pay.
6. Consult calls both sides share: doctors, favourites, book slot, verify consult payment. Then slip, receipt, and consultation-history paths that the web pages do not list yet.
7. Patients, records, prescriptions, diet plans, yoga, notifications list.
8. Pages already routed on the web, in this order: auth (splash through access mode), home, catalog and cart, consult and pay, profile and patients, diet and yoga, legal hub. Mount policy detail with the legal hub.
9. Platform substitutes, not copies: browser geolocation instead of the OS permission modal, browser Notification instead of OneSignal, HTML video instead of the native player, file input instead of the image picker, a downloadable calendar event instead of the device calendar.
10. Ask before building: unicommerce poll, dummy offer card, referral card, coming soon, 404, Open Graph, sitemap, robots.
