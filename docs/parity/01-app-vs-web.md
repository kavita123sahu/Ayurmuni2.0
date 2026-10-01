# 01 — App vs web

Compared by job, using `docs/app-audit/` and `docs/web-audit/`. No application code was changed.

Web IDs are the website inventory. A web component is written `WC-###` so it is not confused with native `C-###`. A web API is the `A-###` from `docs/web-audit/00-inventory.md`.

Only auth screens S-001–S-005 and P-001–P-005 were read line by line. Every other MATCH says the same job is routed on both sides and that field-level differences were not in those batches.

Rows S-098–S-188 and C-126–C-179 are website files that the app inventory also listed. They are included so every app-inventory ID appears. They are not a second native feature.

Priority: P0 blocks sign-in, payment, booking, or legal accept. P1 is a missing or split user job. P2 is a secondary screen or control. P3 is presentation or an unconfirmed caller.

## Counts

| Status | Rows |
| --- | ---: |
| MATCH | 358 |
| PARTIAL | 103 |
| MISSING | 18 |
| N/A-PLATFORM | 5 |
| Total app IDs | 484 |

Native rows only (S-001–S-097, C-001–C-125, every feature, every API). The other MATCH rows are website files repeated inside the app inventory.

| Status | Native rows |
| --- | ---: |
| MATCH | 213 |
| PARTIAL | 103 |
| MISSING | 18 |
| N/A-PLATFORM | 5 |
| Native total | 339 |

## Screens

| App ID | App item | Web ID | Web item | Status | Exact gap | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| S-001 | Splash | P-001 | Splash | MATCH | Both wait 900 ms, then route from the stored token. No token goes to welcome. Profile GET stores user info when data exists. Onboarded goes home. Guest, non-customer, or skipped goes home as guest. A customer who is not onboarded goes to assessment. Only a thrown error.response status 403 goes to login. Any other failure marks guest and opens home. A returned 403 or logout body is not a login redirect. | — |
| S-002 | Welcome | P-002 | Welcome | MATCH | Both play six stories (welcome video, then consult, medicine, delivery, diet, yoga) and continue to login. Auto-advance is 4200 ms on image slides. | — |
| S-003 | Login | P-003 | Login | MATCH | Both collect a 10-digit +91 number, require the terms checkbox, open terms and privacy from the legal-required API, send OTP, store the returned OTP, and pass a deleted-account hold into the next step. | — |
| S-004 | OTP verify | P-004 | OTP verify | MATCH | Login and register accept policies, load the profile, and open Home when it is complete. Dismissing the notification dialog registers with alerts off. When the number belongs to a deleted account, the alert stays and verify posts user/customer/account/recover/ with phone and otp and no auth token. A response with an access token continues like login and clears the hold. Browser Notification permission stands in for OneSignal. | — |
| S-005 | Access mode | P-005 | Access mode | MATCH | On open, a complete profile goes to Home. Skip and Set up my profile still mark the session as guest. Use a different phone number confirms, clears the session, and opens welcome. | — |
| S-006 | Complete details | P-006 | Complete details | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-007 | Onboarding | P-007 | Onboarding | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-008 | Assessment type | P-008 | Assessment type | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-009 | Patient FAQ / prakriti intro | P-009 | Patient FAQ | MATCH | Web mounts this page on both /patient-faq and /assessment-prakriti. Field-level differences were not in the finished audit batches. | — |
| S-010 | Prakriti profile | P-011 | Prakriti profile | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-011 | Medical history | P-012 | Medical history | PARTIAL | Web also has a separate questionnaire route /assessment-medical (P-010). Native runs the questionnaire inside the medical-history flow and the QuestionnaireScreen component, not as its own navigator route. Whether every native step exists on P-012 was not in the finished audit batches. | P1 |
| S-012 | Home | P-013 | Home | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-013 | Home category widget | P-013 | Home | MATCH | Native home-category widget is embedded, not its own route. Web home is the page that owns the category tiles. | — |
| S-014 | Top doctors card | P-013 | Home | MATCH | Native top-doctors card is embedded. Web home is the page that owns suggested doctors. | — |
| S-015 | Orange lab | P-071 | Orange lab | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-016 | Packages | P-072 | Packages | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-017 | Products tab | P-014 | Products | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-018 | Top categories | P-015 | Top categories | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-019 | Category products | P-016 | Category products | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-020 | Product search | P-018 | Product search | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-021 | Product details | P-017 | Product details | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-022 | Product reviews | P-019 | Reviews | PARTIAL | Both have a review page. Native reads review/. Web also calls /reviews/product, /reviews/user, and review update and delete. Whether the native page can edit or delete a review was not in the finished audit batches. | P1 |
| S-023 | Review gallery | P-020 | Review gallery | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-024 | Cart | P-021 | Cart | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-025 | Checkout | P-022 | Checkout | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-026 | Order confirmation | P-023 | Order confirmation | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-027 | Order history | P-024 | Order history | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-028 | Order details | P-025 | Order details | PARTIAL | Web order service also cancels an order and polls unicommerce tracking. Those two calls are not in the native order service notes. Other order-detail fields were not in the finished audit batches. | P1 |
| S-029 | Consult home | P-026 | Consult | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-030 | All doctors | P-029 | Doctors | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-031 | Search doctors | P-029 | Doctors | PARTIAL | Native SearchDoctors is not registered in the navigator. Web has no separate doctor-search route. Doctor browse is the doctors page. | P2 |
| S-032 | Favourite doctors | P-057 | Favourite doctors | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-033 | Category doctor | P-028 | Category doctor | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-034 | Doctor profile | P-030 | Doctor profile | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-035 | Doctor slots | P-031 | Doctor slot | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-036 | Doctor slip | P-033 | Doctor slip | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-037 | Multiple doctor slip | P-033 | Doctor slip | MATCH | When the slip returns more than one consultation, the same page shows the visit count, progress, the first three visits, View all when there are more, and medicines from those visits. | — |
| S-038 | Booking confirm | P-035 | Booking confirm | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-039 | Add calendar | P-036 | Add calendar | PARTIAL | Both have an add-calendar page. Native can write a device calendar event. Web has no device calendar; the page must offer a downloadable event or a manual date. That difference was not line-checked. | P2 |
| S-040 | Consult history | P-027 | Consult history | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-041 | Doctor consultation history | P-034 | Doctor consultation history | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-042 | Medical receipt | P-055 | Medical receipt | MATCH | Both load customers/doctors/consultation-receipt/?consultation_id=. The page shows receipt number, date, patient, method, status, bank, payment and order ids, consultation fee, platform fee, GST, and total paid. Download saves a text file in the browser. | — |
| S-043 | Upload report | P-065 | Medical records | PARTIAL | Native Uploadreport is not a registered route. Web has no upload-report page. Record upload lives on medical records, and prescription upload is a different flow. | P2 |
| S-044 | Preview modal | — | — | MISSING | Native preview modal is embedded and not a route. The web inventory has no document-preview modal. | P2 |
| S-045 | Review modal | WC-027 | ReviewSubmitModal | MATCH | Native review modal is embedded. Web review submit is a modal, not a route. | — |
| S-046 | Medical record card | P-065 | Medical records | PARTIAL | Native medical-record card is an embedded widget. Web renders records on the records page and does not inventory a separate card component. | P3 |
| S-047 | Patient video call | P-069 | Video call | PARTIAL | Both join an Agora visit. Native uses react-native-agora. Web uses agora-rtc-sdk-ng and redirects /profile/video with no id back to appointments. Camera and microphone permission is the browser prompt. | P1 |
| S-048 | Chat | P-052 | Chat | MATCH | Both load and send appointment messages and use a socket. Web chat redirects to appointments when the route is incomplete. | — |
| S-049 | Razorpay | P-022 | Checkout | MATCH | Consult pay opens Razorpay checkout.js for a consultation order, retries a pending payment, and verifies it. Product checkout places a prepaid order and opens the same checkout script with the order key, paise amount, and payment_id on verify. The browser script is the stand-in for the native Razorpay SDK. | — |
| S-050 | Medicines | P-070 | Medicines | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-051 | Prescription upload | P-073 | Prescription upload | PARTIAL | Both upload a prescription. Native uses the image picker and document picker. Web must use a file input. The accepted file types were not in the finished audit batches. | P1 |
| S-052 | Verify prescription | P-074 | Prescription verify | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-053 | Medicine checkout | P-075 | Medicine checkout | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-054 | Medicine order status | P-076 | Order status | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-055 | Profile | P-037 | Profile | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-056 | Edit profile | P-038 | Edit profile | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-057 | Settings | P-039 | Settings | PARTIAL | Web settings has a child route for notification settings (P-040). Native settings has no separate notification-settings screen in the navigator. Other settings rows were not in the finished audit batches. | P2 |
| S-058 | Addresses | P-048 | Addresses | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-059 | Address form | P-049 | Address form | MATCH | Web uses one form for /new and /:addressId. Native uses one address screen for add and edit. | — |
| S-060 | Location picker | P-041 | Location picker | PARTIAL | Both pick a map point. Native asks for OS location permission. Web uses the browser geolocation prompt and the page permission model. | P1 |
| S-061 | Appointments | P-050 | Appointments | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-062 | Appointment details | P-051 | Appointment details | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-063 | Prescription detail | P-053 | Prescription detail | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-064 | Payments | P-067 | Payments | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-065 | Transaction details | P-068 | Transaction details | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-066 | Rewards | P-066 | Rewards | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-067 | Wishlist | P-056 | Wishlist | PARTIAL | Both have a wishlist page. The favourites/products toggle is recorded on the web client. The native wishlist caller was not named in the API inventory. | P1 |
| S-068 | FAQ list | P-058 | Help center | PARTIAL | Native has a separate FAQ list screen. Web uses the help-center list and opens one article at /profile/faq/:faqId. | P2 |
| S-069 | Help center | P-058 | Help center | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-070 | Medical records | P-065 | Medical records | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-071 | Patients | P-063 | Patients | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-072 | Patient card | P-063 | Patients | MATCH | Native patient card is embedded. Web patients page is the list that shows each patient. | — |
| S-073 | Selected patient | P-063 | Patients | PARTIAL | Native selected-patient widget is embedded and not a route. Web switches the active patient from the patients page via patients/switch. A dedicated selected-patient view was not inventoried. | P2 |
| S-074 | Add or edit patient | P-064 | Patient form | MATCH | Web uses one form for new and :patientId. | — |
| S-075 | Share experience | P-054 | Share experience | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-076 | Notifications | P-083 | Notifications | PARTIAL | Both list notifications. Native also delivers them with OneSignal. Web uses the in-app list plus the browser Notification API and a settings page. There is no welcome-push call on the web. | P1 |
| S-077 | Mentor profile | P-042 | Mentor profile | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-078 | Consult mentor | P-043 | Consult mentor | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-079 | Mentor checkout | P-044 | Mentor checkout | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-080 | Mentor order | P-045 | Mentor order | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-081 | Mentor refund | P-046 | Mentor refund | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-082 | Mentor exchange | P-047 | Mentor exchange | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-083 | Payment plan | — | — | MISSING | Native PaymentPlan is not registered in the navigator, and the web inventory has no payment-plan page. | P2 |
| S-084 | Session breakdown | — | — | MISSING | Native SessionBreakdown is not registered in the navigator, and the web inventory has no session-breakdown page. | P2 |
| S-085 | Yoga list | P-077 | Yoga | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-086 | Yoga session | P-078 | Yoga session | PARTIAL | Both open one session. Native plays it with react-native-video. Web plays it in an HTML video element. Offline download is not a web feature. | P2 |
| S-087 | Diet list | P-079 | Diet | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-088 | Diet plan detail | P-080 | Diet plan | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-089 | Weekly meal | P-081 | Weekly meal | MATCH | Web has both /diet/weekly and /diet/:planId/weekly. | — |
| S-090 | Meal details | P-082 | Meal details | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-091 | Terms | P-084 | Terms | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-092 | Policy accept | P-088 | Policy accept | MATCH | /policy-accept is mounted and blocks browser back until the user accepts. The page lists required policies and posts policies/legal/accept with type all. | — |
| S-093 | Policy detail | P-089 | Policy detail | MATCH | /policy-detail is mounted. Policy accept opens it with the selected policy type and title. | — |
| S-094 | Legal policies hub | P-062 | Legal policies hub | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-095 | Privacy center | P-060 | Privacy center | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-096 | Feedback information | P-061 | Feedback information | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| S-097 | Network error | P-087 | Network error | MATCH | Both replace the app tree while offline. Native uses NetInfo. Web uses navigator.onLine and also has /network-error. | — |
| S-098 | Splash (already the website page) | P-001 | Splash | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-001. | — |
| S-099 | Welcome (already the website page) | P-002 | Welcome | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-002. | — |
| S-100 | Login (already the website page) | P-003 | Login | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-003. | — |
| S-101 | OTP verify (already the website page) | P-004 | OTP verify | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-004. | — |
| S-102 | Access mode (already the website page) | P-005 | Access mode | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-005. | — |
| S-103 | Complete details (already the website page) | P-006 | Complete details | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-006. | — |
| S-104 | Onboarding (already the website page) | P-007 | Onboarding | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-007. | — |
| S-105 | Assessment type (already the website page) | P-008 | Assessment type | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-008. | — |
| S-106 | Patient FAQ (already the website page) | P-009 | Patient FAQ | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-009. | — |
| S-107 | Questionnaire (already the website page) | P-010 | Questionnaire | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-010. | — |
| S-108 | Prakriti profile (already the website page) | P-011 | Prakriti profile | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-011. | — |
| S-109 | Medical history (already the website page) | P-012 | Medical history | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-012. | — |
| S-110 | Home (already the website page) | P-013 | Home | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-013. | — |
| S-111 | Products (already the website page) | P-014 | Products | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-014. | — |
| S-112 | Top categories (already the website page) | P-015 | Top categories | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-015. | — |
| S-113 | Category products (already the website page) | P-016 | Category products | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-016. | — |
| S-114 | Product details (already the website page) | P-017 | Product details | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-017. | — |
| S-115 | Product search (already the website page) | P-018 | Product search | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-018. | — |
| S-116 | Review page (already the website page) | P-019 | Reviews | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-019. | — |
| S-117 | Review gallery (already the website page) | P-020 | Review gallery | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-020. | — |
| S-118 | Cart (already the website page) | P-021 | Cart | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-021. | — |
| S-119 | Checkout (already the website page) | P-022 | Checkout | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-022. | — |
| S-120 | Order confirmation (already the website page) | P-023 | Order confirmation | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-023. | — |
| S-121 | Order history (already the website page) | P-024 | Order history | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-024. | — |
| S-122 | Order details (already the website page) | P-025 | Order details | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-025. | — |
| S-123 | Consult (already the website page) | P-026 | Consult | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-026. | — |
| S-124 | Consult history (already the website page) | P-027 | Consult history | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-027. | — |
| S-125 | Category doctor (already the website page) | P-028 | Category doctor | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-028. | — |
| S-126 | Doctors (already the website page) | P-029 | Doctors | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-029. | — |
| S-127 | Doctor profile (already the website page) | P-030 | Doctor profile | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-030. | — |
| S-128 | Doctor slot (already the website page) | P-031 | Doctor slot | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-031. | — |
| S-129 | Consult pay (already the website page) | P-032 | Consult pay | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-032. | — |
| S-130 | Doctor slip (already the website page) | P-033 | Doctor slip | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-033. | — |
| S-131 | Doctor consultation history (already the website page) | P-034 | Doctor consultation history | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-034. | — |
| S-132 | Booking confirm (already the website page) | P-035 | Booking confirm | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-035. | — |
| S-133 | Add calendar (already the website page) | P-036 | Add calendar | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-036. | — |
| S-134 | Profile (already the website page) | P-037 | Profile | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-037. | — |
| S-135 | Edit profile (already the website page) | P-038 | Edit profile | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-038. | — |
| S-136 | Settings (already the website page) | P-039 | Settings | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-039. | — |
| S-137 | Notification settings (already the website page) | P-040 | Notification settings | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-040. | — |
| S-138 | Location picker (already the website page) | P-041 | Location picker | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-041. | — |
| S-139 | Mentor profile (already the website page) | P-042 | Mentor profile | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-042. | — |
| S-140 | Consult mentor (already the website page) | P-043 | Consult mentor | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-043. | — |
| S-141 | Mentor checkout (already the website page) | P-044 | Mentor checkout | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-044. | — |
| S-142 | Mentor order (already the website page) | P-045 | Mentor order | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-045. | — |
| S-143 | Mentor refund (already the website page) | P-046 | Mentor refund | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-046. | — |
| S-144 | Mentor exchange (already the website page) | P-047 | Mentor exchange | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-047. | — |
| S-145 | Addresses (already the website page) | P-048 | Addresses | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-048. | — |
| S-146 | Address form (already the website page) | P-049 | Address form | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-049. | — |
| S-147 | Appointments (already the website page) | P-050 | Appointments | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-050. | — |
| S-148 | Appointment details (already the website page) | P-051 | Appointment details | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-051. | — |
| S-149 | Chat (already the website page) | P-052 | Chat | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-052. | — |
| S-150 | Prescription detail (already the website page) | P-053 | Prescription detail | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-053. | — |
| S-151 | Share experience (already the website page) | P-054 | Share experience | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-054. | — |
| S-152 | Medical receipt (already the website page) | P-055 | Medical receipt | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-055. | — |
| S-153 | Wishlist (already the website page) | P-056 | Wishlist | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-056. | — |
| S-154 | Favourite doctors (already the website page) | P-057 | Favourite doctors | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-057. | — |
| S-155 | Help center (already the website page) | P-058 | Help center | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-058. | — |
| S-156 | FAQ detail (already the website page) | P-059 | FAQ detail | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-059. | — |
| S-157 | Privacy center (already the website page) | P-060 | Privacy center | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-060. | — |
| S-158 | Feedback information (already the website page) | P-061 | Feedback information | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-061. | — |
| S-159 | Legal policies hub (already the website page) | P-062 | Legal policies hub | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-062. | — |
| S-160 | Patients (already the website page) | P-063 | Patients | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-063. | — |
| S-161 | Patient form (already the website page) | P-064 | Patient form | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-064. | — |
| S-162 | Medical records (already the website page) | P-065 | Medical records | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-065. | — |
| S-163 | Rewards (already the website page) | P-066 | Rewards | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-066. | — |
| S-164 | Payments (already the website page) | P-067 | Payments | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-067. | — |
| S-165 | Transaction details (already the website page) | P-068 | Transaction details | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-068. | — |
| S-166 | Video call redirect (already the website page) | P-069 | Video call | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-069. | — |
| S-167 | Video call (already the website page) | P-069 | Video call | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-069. | — |
| S-168 | Medicines (already the website page) | P-070 | Medicines | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-070. | — |
| S-169 | Orange lab (already the website page) | P-071 | Orange lab | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-071. | — |
| S-170 | Packages (already the website page) | P-072 | Packages | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-072. | — |
| S-171 | Prescription upload (already the website page) | P-073 | Prescription upload | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-073. | — |
| S-172 | Prescription verify (already the website page) | P-074 | Prescription verify | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-074. | — |
| S-173 | Medicine checkout (already the website page) | P-075 | Medicine checkout | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-075. | — |
| S-174 | Order status (already the website page) | P-076 | Order status | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-076. | — |
| S-175 | Yoga (already the website page) | P-077 | Yoga | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-077. | — |
| S-176 | Yoga session (already the website page) | P-078 | Yoga session | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-078. | — |
| S-177 | Diet (already the website page) | P-079 | Diet | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-079. | — |
| S-178 | Diet plan (already the website page) | P-080 | Diet plan | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-080. | — |
| S-179 | Weekly meal (already the website page) | P-081 | Weekly meal | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-081. | — |
| S-180 | Meal details (already the website page) | P-082 | Meal details | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-082. | — |
| S-181 | Notifications (already the website page) | P-083 | Notifications | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-083. | — |
| S-182 | Terms (already the website page) | P-084 | Terms | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-084. | — |
| S-183 | About (already the website page) | P-085 | About | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-085. | — |
| S-184 | Contact (already the website page) | P-086 | Contact | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-086. | — |
| S-185 | Network error (already the website page) | P-087 | Network error | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-087. | — |
| S-186 | Policy accept (already the website page) | P-088 | Policy accept | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-088. | — |
| S-187 | Policy detail (already the website page) | P-089 | Policy detail | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-089. | — |
| S-188 | Coming soon (already the website page) | P-090 | Coming soon | MATCH | This app-inventory row is the website file, not a native screen. It is the same page as P-090. | — |

## Components

| App ID | App item | Web ID | Web item | Status | Exact gap | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| C-001 | ActionCards | — | — | MISSING | No website action-card component is inventoried. Home tiles are on the home page. | P2 |
| C-002 | ActiveDietHomeCard | P-079 | Diet | PARTIAL | Active diet card is not a web component. Diet home data is a web hook (useActiveDietHome) used by the diet and home pages. | P2 |
| C-003 | AllDoctorCard | WC-009 | DoctorCard | PARTIAL | Web has one doctor card. Native also has a separate all-doctor card. | P3 |
| C-004 | AppDataInitializer | — | — | MISSING | No website bootstrap component loads app data at launch. Splash only loads the profile. | P2 |
| C-005 | AppHeader | WC-018 | PageHeader | PARTIAL | Web page header is a back-and-title bar. It does not cover every native app-header action. | P3 |
| C-006 | AppInputField | WC-039 | Field | MATCH | Text field. Native is a React Native input. Web Field is the form control. | — |
| C-007 | AppointAction | P-051 | Appointment details | PARTIAL | Appointment actions are not a separate web component. The appointment-action API exists on the web. | P1 |
| C-008 | AppointDateTime | P-051 | Appointment details | PARTIAL | Date and time display is inside the appointment pages, not a shared web component. | P3 |
| C-009 | AppointmnetCard | WC-005 | ConsultationCard | PARTIAL | Web consultation card covers the appointment summary. Field parity was not line-checked. | P2 |
| C-010 | AvailabilityDot | P-030 | Doctor profile | PARTIAL | Availability is shown on doctor pages. There is no shared availability-dot component. | P3 |
| C-011 | AyurmuniBrandShade | P-001 | Splash | MATCH | Brand mark and wordmark. Web splash and auth pages carry the same brand, without a shared shade component. | — |
| C-012 | BackIconButton | WC-018 | PageHeader | MATCH | Back control. Web pages use the page header or the browser back button. | — |
| C-013 | BlinkitAddButton | P-021 | Cart | PARTIAL | Add-to-cart control is not a named web component. Cart mutation API exists. | P2 |
| C-014 | BrandList | P-070 | Medicines | PARTIAL | Brand list is not a named web component. Web does call customers/brands/. | P2 |
| C-015 | CalenderCard | P-036 | Add calendar | PARTIAL | Calendar card is not a shared web component. The add-calendar page is the surface. | P3 |
| C-016 | CancelAppointModal | P-051 | Appointment details | PARTIAL | Cancel-appointment modal is not inventoried on the web. The appointment-action API is. | P1 |
| C-017 | CartAddedToastBar | WC-032 | ToastHost | MATCH | Added-to-cart feedback. Web uses the toast host instead of a dedicated cart toast bar. | — |
| C-018 | CartBadge | WC-002 | AppShell | MATCH | Cart count. Web tab bar shows a badge from the cart context. | — |
| C-019 | CategoryList | P-014 | Products | PARTIAL | Category list is not a named web component. Category pages exist. | P3 |
| C-020 | CommonButton | WC-034 | Button | MATCH | Primary and secondary actions. | — |
| C-021 | ConsultationTimeline | WC-006 | ConsultationTimeline | MATCH | Consultation timeline on both clients. | — |
| C-022 | DoctorConsultationSection | P-026 | Consult | PARTIAL | Doctor consultation section is not a named web component. The consult page is the surface. | P2 |
| C-023 | CouponAppliedModal | — | — | MISSING | No coupon-applied confirmation modal on the web. Coupon apply card exists. | P2 |
| C-024 | CouponApplyCard | WC-007 | CouponApplyCard | MATCH | Apply a coupon. Web does not inventory the offers panel or ticket as separate components. | — |
| C-025 | CouponOffersPanel | WC-007 | CouponApplyCard | PARTIAL | Offers panel is folded into the apply card on the web, if it is shown at all. The panel itself is not inventoried. | P2 |
| C-026 | CouponTicket | WC-007 | CouponApplyCard | PARTIAL | Coupon ticket visual is not a web component. | P3 |
| C-027 | CustomBottomSheet | WC-042 | Modal | MATCH | Bottom sheet on native, dialog on the web. | — |
| C-028 | CustomeTab | WC-002 | AppShell | PARTIAL | Both provide Home, Products, Cart, Medicines, Consult. Native hides the tab on scroll. Web does not. | P3 |
| C-029 | CustomNotification | WC-032 | ToastHost | MATCH | In-app message. Web toast host is the surface. | — |
| C-030 | CustomToggle | P-039 | Settings | PARTIAL | Toggle control is not a shared web component. Settings is the page that would hold it. | P3 |
| C-031 | DashboardCard | P-037 | Profile | PARTIAL | Dashboard stat card is not a named web component. | P3 |
| C-032 | Detailimages | P-017 | Product details | PARTIAL | Image gallery is inside product details. No shared detail-images component. | P3 |
| C-033 | DietPlanActionPanel | P-080 | Diet plan | PARTIAL | Diet-plan actions are not a named web component. Start, water, and progress APIs exist. | P1 |
| C-034 | DietPlanCard | P-079 | Diet | PARTIAL | Diet plan card is not a named web component. Diet pages are the surface. | P2 |
| C-035 | DiseaseSelectionModal | WC-008 | DiseaseSelectionModal | MATCH | Disease picker on both clients. | — |
| C-036 | DoctorAvatar | WC-009 | DoctorCard | PARTIAL | Avatar is inside the web doctor card, not its own component. | P3 |
| C-037 | DoctorCard | WC-009 | DoctorCard | MATCH | Doctor card. | — |
| C-038 | DoctorListCard | WC-009 | DoctorCard | PARTIAL | List layout differs. One web doctor card is inventoried. | P3 |
| C-039 | DynamicGrid | P-014 | Products | PARTIAL | Grid layout is page CSS, not a component. | P3 |
| C-040 | EmptyState | WC-038 | EmptyState | MATCH | Empty state. | — |
| C-041 | FAQItem | P-059 | FAQ detail | PARTIAL | FAQ row is not a web component. Help center and FAQ detail are the pages. | P3 |
| C-042 | FavouriteButton | P-056 | Wishlist | PARTIAL | Favourite control is not a named web component. favorites/products is a web call. | P2 |
| C-043 | FeedbackModal | P-061 | Feedback information | PARTIAL | Feedback modal is not inventoried. Feedback page exists. | P2 |
| C-044 | FilterTab | WC-051 | Tabs | MATCH | Filter tabs. | — |
| C-045 | FloatingVideoOverlay | WC-012 | FloatingVideoOverlay | MATCH | Floating call overlay. | — |
| C-046 | Header | WC-031 | SiteHeader | PARTIAL | Native screen header versus site header plus page header. Site header also links to About and Contact. | P3 |
| C-047 | ConsultationPackagesSection | P-072 | Packages | PARTIAL | Packages section is not a home component on the web. The packages page exists. | P2 |
| C-048 | OrangeLabHomeSection | P-071 | Orange lab | PARTIAL | Orange-lab home section is not a web component. The labs page exists. | P2 |
| C-049 | PanchakarmaSection | — | — | MISSING | No Panchakarma section is inventoried on the web. | P2 |
| C-050 | HomeDoctorCard | WC-009 | DoctorCard | PARTIAL | Home doctor card is the same job as the web doctor card. | P3 |
| C-051 | HomeHeader | WC-031 | SiteHeader | PARTIAL | Home header actions (search, location, notifications) are split across the site header and home page. Not line-checked. | P2 |
| C-052 | HomeJoinAppointmentsSection | WC-013 | HomeJoinAppointments | MATCH | Join upcoming visit from home. | — |
| C-053 | HydrationCard | P-079 | Diet | PARTIAL | Hydration summary is not a web component. Water log API exists. | P1 |
| C-054 | InAppNotificationWatcher | P-083 | Notifications | N/A-PLATFORM | Native watcher listens for OneSignal. Web alternative is the notifications page, browser Notification permission, and the settings page. | P2 |
| C-055 | InfiniteMarquee | WC-016 | MarqueeCollage | PARTIAL | Native marquee is a horizontal text strip on login. Web collage is scrolling images plus a rotating headline. Same login surface, different motion. | P3 |
| C-056 | InteractiveMapPicker | WC-014 | InteractiveMapPicker | MATCH | Map point picker. | — |
| C-057 | JoinCallBanner | WC-013 | HomeJoinAppointments | MATCH | Join-call banner. Web home section is the surface. | — |
| C-058 | LoadingSpinner | WC-049 | Skeleton | PARTIAL | Native uses a spinner. Web inventory uses skeletons for loading. Both mean the loading state. | P3 |
| C-059 | LocationBottomSheet | WC-015 | LocationSheet | MATCH | Location picker sheet. | — |
| C-060 | LocationPermissionModal | P-041 | Location picker | N/A-PLATFORM | OS permission dialog cannot be drawn by the site. Web alternative is the browser geolocation prompt on the location picker. | P2 |
| C-061 | LogoutModal | WC-042 | Modal | MATCH | Confirm dialog. OTP notification dismiss registers with alerts off. Access mode uses it to confirm changing the phone number. | — |
| C-062 | MealCard | P-082 | Meal details | PARTIAL | Meal card is not a named web component. Meal pages exist. | P3 |
| C-063 | BasicInfoForm | WC-054 | BasicInfoForm | MATCH | Questionnaire basic-info form. | — |
| C-064 | BmiGaugeCard | P-012 | Medical history | PARTIAL | BMI gauge is not a web component. bmi.js exists as a helper. Whether the gauge is rendered was not line-checked. | P2 |
| C-065 | BottomButton | WC-034 | Button | MATCH | Bottom action button. | — |
| C-066 | MedicalHeader | WC-053 | QuestLayout | PARTIAL | Medical header is part of the web quest layout, not its own component. | P3 |
| C-067 | OptionCard | P-010 | Questionnaire | PARTIAL | Option card is not a named web component. The questionnaire page is the surface. | P2 |
| C-068 | ProgressBar | WC-050 | StepIndicator | MATCH | Step progress. | — |
| C-069 | MentorCard | P-042 | Mentor profile | PARTIAL | Mentor card is not a named web component. | P3 |
| C-070 | MyProductCard | WC-023 | ProductCard | PARTIAL | Compact product card versus the web product card. Not line-checked. | P3 |
| C-071 | OrderCard | P-024 | Order history | PARTIAL | Order card is not a named web component. Order history is the page. | P3 |
| C-072 | OrderItem | P-025 | Order details | PARTIAL | Order line is not a named web component. | P3 |
| C-073 | PaymentCard | P-067 | Payments | PARTIAL | Payment card is not a named web component. | P3 |
| C-074 | PaymentHistoryTimeline | P-067 | Payments | PARTIAL | Payment timeline is not a named web component. Payment history page exists. | P2 |
| C-075 | PolicyContentRenderer | WC-019 | PolicyContent | MATCH | Renders policy body. Login uses it on both clients. | — |
| C-076 | PrescriptionFilePreview | — | — | MISSING | No prescription file preview component on the web. | P1 |
| C-077 | PrescriptionRequiredModalHost | P-073 | Prescription upload | PARTIAL | Prescription-required gate is not a named web component. Upload page is the surface. | P1 |
| C-078 | PrimaryButton | WC-034 | Button | MATCH | Primary button. | — |
| C-079 | ProductCard | WC-023 | ProductCard | MATCH | Product card. | — |
| C-080 | ProductDetailDiscoverySection | WC-024 | ProductDiscoveryRails | MATCH | Discovery rails on product detail. | — |
| C-081 | ProductDetailsDiscovery | WC-024 | ProductDiscoveryRails | PARTIAL | Second native discovery block. Web inventories one rails component. | P3 |
| C-082 | ProductDiscoverySection | WC-024 | ProductDiscoveryRails | MATCH | Product discovery section. | — |
| C-083 | ProductImagePreviewModal | P-017 | Product details | PARTIAL | Full-screen image preview is not a web component. The details page is the surface. | P3 |
| C-084 | ProductSearchFilterBar | WC-025 | ProductSearchFilterBar | MATCH | Search filters. | — |
| C-085 | ProfileHeader | P-037 | Profile | PARTIAL | Profile header is not a named web component. | P3 |
| C-086 | PromoCard | WC-010 | DummyOfferCard | PARTIAL | Promo card versus the web dummy offer card. The web card is marked dummy in the inventory. | P2 |
| C-087 | QuantityControl | P-021 | Cart | PARTIAL | Quantity control is not a named web component. Cart page is the surface. | P2 |
| C-088 | PrakritiNoteModal | WC-022 | PrakritiNoteModal | MATCH | Prakriti note. | — |
| C-089 | PrakritiQuestLayout | WC-053 | QuestLayout | MATCH | Prakriti question layout. | — |
| C-090 | QuestionnaireLayout | WC-053 | QuestLayout | MATCH | Questionnaire layout. | — |
| C-091 | QuestionnaireScreen | P-010 | Questionnaire | MATCH | Questionnaire runner. Web route is /assessment-medical. | — |
| C-092 | questSounds | — | — | N/A-PLATFORM | Native quest sounds. Web alternative is optional HTML audio on the questionnaire. None is inventoried. | P3 |
| C-093 | RecentDoctors | P-026 | Consult | PARTIAL | Recent doctors list is not a named web component. customers/doctors/recent exists on the web. | P2 |
| C-094 | RecentProductsList | P-013 | Home | PARTIAL | Recent products list is not a named web component. | P3 |
| C-095 | RenderAppoint | P-050 | Appointments | PARTIAL | Appointment row renderer is not a named web component. | P3 |
| C-096 | RescheduleModal | P-051 | Appointment details | PARTIAL | Reschedule modal is not inventoried. Appointment-action API exists on the web. | P1 |
| C-097 | ReviewSecton | WC-046 | ReviewCard | PARTIAL | Review list block versus the web review card. Edit and delete exist on the web review API. | P2 |
| C-098 | RewardGridCard | P-066 | Rewards | PARTIAL | Reward grid card is not a named web component. | P3 |
| C-099 | ScreenShell | WC-002 | AppShell | MATCH | Screen chrome. Web uses AppShell or AuthShell. | — |
| C-100 | SearchBar | WC-047 | SearchField | MATCH | Search field. | — |
| C-101 | SectionHeader | WC-048 | SectionHeader | MATCH | Section title. | — |
| C-102 | SegmentTabs | WC-051 | Tabs | MATCH | Segmented tabs. | — |
| C-103 | SelectedUploadCard | P-073 | Prescription upload | PARTIAL | Selected-file card is not a named web component. | P2 |
| C-104 | SessionCard | P-078 | Yoga session | PARTIAL | Session card is not a named web component. | P3 |
| C-105 | SettingItem | P-039 | Settings | PARTIAL | Settings row is not a named web component. | P3 |
| C-106 | SOSHeader | — | — | MISSING | No SOS header on the web. | P1 |
| C-107 | StepCard | WC-050 | StepIndicator | PARTIAL | Step card versus the step indicator. | P3 |
| C-108 | StyleCard | WC-035 | Card | MATCH | Generic card surface. | — |
| C-109 | SuggestedCard | P-013 | Home | PARTIAL | Suggested card is not a named web component. Suggested product, medicine, and diet APIs exist. | P3 |
| C-110 | TablerIcon | — | — | N/A-PLATFORM | Tabler icons on native. Web uses lucide-react. Same job, different icon set. | P3 |
| C-111 | TimeSlot | P-031 | Doctor slot | PARTIAL | Time-slot chip is not a named web component. The slot page is the surface. | P2 |
| C-112 | TopSellingList | P-014 | Products | PARTIAL | Top-selling list is not a named web component. | P3 |
| C-113 | TransactionCard | P-067 | Payments | PARTIAL | Transaction card is not a named web component. Transaction detail page exists. | P3 |
| C-114 | UploadRecordModal | P-065 | Medical records | PARTIAL | Upload-record modal is not inventoried. The records page posts medical-records. | P1 |
| C-115 | VisitedDoctorHomeCard | WC-013 | HomeJoinAppointments | PARTIAL | Visited-doctor home card is not separately inventoried. Recent-doctors API exists. | P3 |
| C-116 | WaterGlass | — | — | MISSING | Water glass is not on the web. Water log API exists without this control. | P1 |
| C-117 | WaterGoalStartModal | — | — | MISSING | Water-goal start modal is not on the web. | P1 |
| C-118 | WaterIntakeModal | — | — | MISSING | Water intake modal is not on the web. patients/diet-plans/water is called by the web diet service. | P1 |
| C-119 | WishlistButton | P-056 | Wishlist | PARTIAL | Wishlist button is not a named web component. | P2 |
| C-120 | WishlistToastBar | WC-032 | ToastHost | MATCH | Wishlist toast. Web uses the toast host. | — |
| C-121 | YogaVideoPlayer | P-078 | Yoga session | PARTIAL | Native video player versus an HTML video on the session page. No shared player component. | P2 |
| C-122 | chatContainer | P-052 | Chat | MATCH | Chat thread. Web chat page includes the thread rather than this component file. | — |
| C-123 | ChatHeader | P-052 | Chat | PARTIAL | Chat header is inside the chat page, not a separate component. | P3 |
| C-124 | MessageBubble | P-052 | Chat | PARTIAL | Message bubble is inside the chat page, not a separate component. | P3 |
| C-125 | MessageInput | P-052 | Chat | PARTIAL | Message input is inside the chat page, not a separate component. Send uses the same messages endpoint. | P2 |
| C-126 | AgoraVideoTile (already the website component) | C-001 | AgoraVideoTile | MATCH | This app-inventory row is the website file. Same component as web C-001. | — |
| C-127 | AppShell (already the website component) | C-002 | AppShell | MATCH | This app-inventory row is the website file. Same component as web C-002. | — |
| C-128 | AuthShell (already the website component) | C-003 | AuthShell | MATCH | This app-inventory row is the website file. Same component as web C-003. | — |
| C-129 | BannerCarousel (already the website component) | C-004 | BannerCarousel | MATCH | This app-inventory row is the website file. Same component as web C-004. | — |
| C-130 | ConsultationCard (already the website component) | C-005 | ConsultationCard | MATCH | This app-inventory row is the website file. Same component as web C-005. | — |
| C-131 | ConsultationTimeline (already the website component) | C-006 | ConsultationTimeline | MATCH | This app-inventory row is the website file. Same component as web C-006. | — |
| C-132 | CouponApplyCard (already the website component) | C-007 | CouponApplyCard | MATCH | This app-inventory row is the website file. Same component as web C-007. | — |
| C-133 | DiseaseSelectionModal (already the website component) | C-008 | DiseaseSelectionModal | MATCH | This app-inventory row is the website file. Same component as web C-008. | — |
| C-134 | DoctorCard (already the website component) | C-009 | DoctorCard | MATCH | This app-inventory row is the website file. Same component as web C-009. | — |
| C-135 | DummyOfferCard (already the website component) | C-010 | DummyOfferCard | MATCH | This app-inventory row is the website file. Same component as web C-010. | — |
| C-136 | EnhancedSearchField (already the website component) | C-011 | EnhancedSearchField | MATCH | This app-inventory row is the website file. Same component as web C-011. | — |
| C-137 | FloatingVideoOverlay (already the website component) | C-012 | FloatingVideoOverlay | MATCH | This app-inventory row is the website file. Same component as web C-012. | — |
| C-138 | HomeJoinAppointments (already the website component) | C-013 | HomeJoinAppointments | MATCH | This app-inventory row is the website file. Same component as web C-013. | — |
| C-139 | InteractiveMapPicker (already the website component) | C-014 | InteractiveMapPicker | MATCH | This app-inventory row is the website file. Same component as web C-014. | — |
| C-140 | LocationSheet (already the website component) | C-015 | LocationSheet | MATCH | This app-inventory row is the website file. Same component as web C-015. | — |
| C-141 | MarqueeCollage (already the website component) | C-016 | MarqueeCollage | MATCH | This app-inventory row is the website file. Same component as web C-016. | — |
| C-142 | NetworkGuard (already the website component) | C-017 | NetworkGuard | MATCH | This app-inventory row is the website file. Same component as web C-017. | — |
| C-143 | PageHeader (already the website component) | C-018 | PageHeader | MATCH | This app-inventory row is the website file. Same component as web C-018. | — |
| C-144 | PolicyContent (already the website component) | C-019 | PolicyContent | MATCH | This app-inventory row is the website file. Same component as web C-019. | — |
| C-145 | PolicyHubList (already the website component) | C-020 | PolicyHubList | MATCH | This app-inventory row is the website file. Same component as web C-020. | — |
| C-146 | PolicyHubPage (already the website component) | C-021 | PolicyHubPage | MATCH | This app-inventory row is the website file. Same component as web C-021. | — |
| C-147 | PrakritiNoteModal (already the website component) | C-022 | PrakritiNoteModal | MATCH | This app-inventory row is the website file. Same component as web C-022. | — |
| C-148 | ProductCard (already the website component) | C-023 | ProductCard | MATCH | This app-inventory row is the website file. Same component as web C-023. | — |
| C-149 | ProductDiscoveryRails (already the website component) | C-024 | ProductDiscoveryRails | MATCH | This app-inventory row is the website file. Same component as web C-024. | — |
| C-150 | ProductSearchFilterBar (already the website component) | C-025 | ProductSearchFilterBar | MATCH | This app-inventory row is the website file. Same component as web C-025. | — |
| C-151 | ReferralCard (already the website component) | C-026 | ReferralCard | MATCH | This app-inventory row is the website file. Same component as web C-026. | — |
| C-152 | ReviewSubmitModal (already the website component) | C-027 | ReviewSubmitModal | MATCH | This app-inventory row is the website file. Same component as web C-027. | — |
| C-153 | ShareButton (already the website component) | C-028 | ShareButton | MATCH | This app-inventory row is the website file. Same component as web C-028. | — |
| C-154 | ShareModal (already the website component) | C-029 | ShareModal | MATCH | This app-inventory row is the website file. Same component as web C-029. | — |
| C-155 | SiteFooter (already the website component) | C-030 | SiteFooter | MATCH | This app-inventory row is the website file. Same component as web C-030. | — |
| C-156 | SiteHeader (already the website component) | C-031 | SiteHeader | MATCH | This app-inventory row is the website file. Same component as web C-031. | — |
| C-157 | ToastHost (already the website component) | C-032 | ToastHost | MATCH | This app-inventory row is the website file. Same component as web C-032. | — |
| C-158 | Badge (already the website component) | C-033 | Badge | MATCH | This app-inventory row is the website file. Same component as web C-033. | — |
| C-159 | Button (already the website component) | C-034 | Button | MATCH | This app-inventory row is the website file. Same component as web C-034. | — |
| C-160 | Card (already the website component) | C-035 | Card | MATCH | This app-inventory row is the website file. Same component as web C-035. | — |
| C-161 | Chip (already the website component) | C-036 | Chip | MATCH | This app-inventory row is the website file. Same component as web C-036. | — |
| C-162 | Disclaimer (already the website component) | C-037 | Disclaimer | MATCH | This app-inventory row is the website file. Same component as web C-037. | — |
| C-163 | EmptyState (already the website component) | C-038 | EmptyState | MATCH | This app-inventory row is the website file. Same component as web C-038. | — |
| C-164 | Field (already the website component) | C-039 | Field | MATCH | This app-inventory row is the website file. Same component as web C-039. | — |
| C-165 | IconButton (already the website component) | C-040 | IconButton | MATCH | This app-inventory row is the website file. Same component as web C-040. | — |
| C-166 | MediaCard (already the website component) | C-041 | MediaCard | MATCH | This app-inventory row is the website file. Same component as web C-041. | — |
| C-167 | Modal (already the website component) | C-042 | Modal | MATCH | This app-inventory row is the website file. Same component as web C-042. | — |
| C-168 | Rail (already the website component) | C-043 | Rail | MATCH | This app-inventory row is the website file. Same component as web C-043. | — |
| C-169 | Rating (already the website component) | C-044 | Rating | MATCH | This app-inventory row is the website file. Same component as web C-044. | — |
| C-170 | Reveal (already the website component) | C-045 | Reveal | MATCH | This app-inventory row is the website file. Same component as web C-045. | — |
| C-171 | ReviewCard (already the website component) | C-046 | ReviewCard | MATCH | This app-inventory row is the website file. Same component as web C-046. | — |
| C-172 | SearchField (already the website component) | C-047 | SearchField | MATCH | This app-inventory row is the website file. Same component as web C-047. | — |
| C-173 | SectionHeader (already the website component) | C-048 | SectionHeader | MATCH | This app-inventory row is the website file. Same component as web C-048. | — |
| C-174 | Skeleton (already the website component) | C-049 | Skeleton | MATCH | This app-inventory row is the website file. Same component as web C-049. | — |
| C-175 | StepIndicator (already the website component) | C-050 | StepIndicator | MATCH | This app-inventory row is the website file. Same component as web C-050. | — |
| C-176 | Tabs (already the website component) | C-051 | Tabs | MATCH | This app-inventory row is the website file. Same component as web C-051. | — |
| C-177 | Tile (already the website component) | C-052 | Tile | MATCH | This app-inventory row is the website file. Same component as web C-052. | — |
| C-178 | QuestLayout (already the website component) | C-053 | QuestLayout | MATCH | This app-inventory row is the website file. Same component as web C-053. | — |
| C-179 | BasicInfoForm (already the website component) | C-054 | BasicInfoForm | MATCH | This app-inventory row is the website file. Same component as web C-054. | — |

## Features

| App ID | App item | Web ID | Web item | Status | Exact gap | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| F-001 | Auth and session | WF-001 | Auth and session | PARTIAL | Same splash, welcome, login, OTP, guest flag, and token refresh. Web splash handles 403 and logout results. Web OTP does not accept policies, register skips the profile check, and /policy-accept is unrouted. Web access mode has no change-number and no completed-profile redirect. Native OTP ignores the deleted-account params that web displays. | P0 |
| F-002 | Onboarding and prakriti | WF-002 | Onboarding and prakriti | MATCH | Same job is routed on both sides. Field-level differences are not in the finished audit batches (only auth screens S-001–S-005 and P-001–P-005 were read line by line). | — |
| F-003 | Medical history questionnaire | WF-003 | Medical history | PARTIAL | Web splits the runner onto /assessment-medical and the saved history onto /medical-history. Native keeps the runner with the medical-history screen. Step parity was not line-checked. | P1 |
| F-004 | Home dashboard | WF-004 | Home | PARTIAL | Both load categories, banners, suggestions, and a join-visit strip. Web home calls customers/doctors/?suggested=true. That query is not in the native home service notes. Panchakarma section is native-only. | P1 |
| F-005 | Product catalog and search | WF-005 | Catalog and search | PARTIAL | Both have catalog, category, detail, search, and discovery. customers/search, recent search, health-categories, and health-diseases are in the native API list and not in the web API list, while a search page exists. | P1 |
| F-006 | Cart, checkout, and orders | WF-006 | Cart, checkout, orders | PARTIAL | Both have cart, fee quote, place order, Razorpay or pay on delivery, verify payment, history, and detail. Web also cancels an order and polls unicommerce tracking. Those two calls are not in the native order service. | P1 |
| F-007 | Doctor consult and booking | WF-007 | Consult and booking | PARTIAL | Both browse doctors, slots, slip, appointments, and receipts. Slip and receipt use the same doctor-slip and consultation-receipt paths as the app. Consultation-history is still missing from the web API list even though that page exists. Unrouted doctor search and upload-report have no web pages. | P1 |
| F-008 | Video call and chat | WF-008 | Video and chat | MATCH | Agora join, socket chat, and a floating overlay exist on both. SDK and permission UI differ by platform. | — |
| F-009 | Medicines and prescriptions | WF-009 | Medicines and prescriptions | MATCH | Catalog, upload, verify, checkout, and order status exist on both. File picking is the platform difference. | — |
| F-010 | Profile and account | WF-010 | Profile and account | MATCH | Profile, edit, settings, addresses, and help exist on both. Web adds a notification-settings child route. | — |
| F-011 | Patients and medical records | WF-011 | Patients and records | MATCH | List, form, switch, and record upload endpoints exist on both. Native upload and preview widgets are not all named on the web. | — |
| F-012 | Payments and rewards | WF-012 | Payments and rewards | MATCH | Payment history, transaction detail, and rewards exist on both. | — |
| F-013 | Mentor, diet, and yoga | WF-013 | Mentor, diet, and yoga | PARTIAL | Mentor, diet, weekly meals, and yoga exist on both. Native payment-plan and session-breakdown screens are unrouted and have no web page. Water UI components are native-only while the water API exists on the web. Web diet service also calls plan status. | P1 |
| F-014 | Legal, policies, and static pages | WF-014 | Legal and static | PARTIAL | Terms, privacy center, legal hub, and feedback exist on both. Native policy accept and policy detail are routed. Those web routes are commented out. About and Contact exist only on the web. | P0 |
| F-015 | Notifications | WF-015 | Notifications | PARTIAL | Both list notifications. Native sends a welcome push through OneSignal. Web has browser notification permission and a settings page, and it can POST notifications. Welcome push is not on the web. | P1 |
| F-016 | Location | WF-016 | Location | PARTIAL | Both pick a place with Google. Native shows an OS permission modal. Web uses the browser prompt. | P1 |
| F-017 | Labs and packages | WF-017 | Labs and packages | MATCH | Orange lab and packages pages exist on both. | — |
| F-018 | Reviews and wishlist | WF-018 | Reviews and wishlist | PARTIAL | Review page, gallery, share-experience, and wishlist exist on both. Web adds /reviews CRUD. Native list uses review/. | P1 |
| F-019 | Connectivity and placeholders | WF-019 | Offline and placeholders | PARTIAL | Both block the tree when offline. Web has no 404 route. Coming soon exists only as an unrouted web file. | P2 |

## APIs

| App ID | App item | Web ID | Web item | Status | Exact gap | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| A-001 | POST user/token/refresh/ | A-001 | POST user/token/refresh/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-002 | POST user/send-otp/ | A-002 | POST user/send-otp/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-003 | POST user/customer/login/ | A-003 | POST user/customer/login/ | MATCH | Same login body. Both merge data.customer into profile flags, accept policies, and open Home when the profile is complete. | — |
| A-004 | POST user/customer/register/ | A-004 | POST user/customer/register/ | MATCH | Same register body, including is_notification_enabled. Both load the profile afterward and open Home when it is complete. | — |
| A-005 | GET customers/profile/ | A-005 | GET customers/profile/ | MATCH | Same GET. Splash uses the returned body the same way on both sides and does not treat status 403 or logout as a login redirect. | — |
| A-006 | POST customers/profile/ | A-006 | POST customers/profile/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-007 | DELETE customers/profile/ | A-007 | DELETE customers/profile/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-008 | POST user/customer/account/recover/ | A-086 | POST user/customer/account/recover/ | MATCH | Same method, path, and body: phone_number and otp, no auth token. OTP verify calls it when the deleted-account alert is showing. | — |
| A-009 | POST user/upload/ | A-008 | POST user/upload/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-010 | GET customers/address/ | A-010 | GET customers/address/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-011 | POST customers/address/ | A-011 | POST customers/address/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-012 | PATCH customers/address/?id= | A-012 | PATCH customers/address/?id= | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-013 | DELETE customers/address/?id= | A-013 | DELETE customers/address/?id= | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-014 | GET customers/prakriti/info/ | A-009 | GET customers/prakriti/info/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-015 | GET customers/questionnaires/questions/list/ | A-014 | GET customers/questionnaires/questions/list/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-016 | POST customers/initiate_onboarding/ | A-015 | POST customers/initiate_onboarding/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-017 | POST customers/questionnaires/responses/ | A-016 | POST customers/questionnaires/responses/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-018 | POST customers/answer_prakriti/ | A-017 | POST customers/answer_prakriti/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-019 | GET customers/dashboard/categories/ | A-018 | GET customers/dashboard/categories/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-020 | GET customers/suggested/products/ | A-020 | GET customers/suggested/products/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-021 | GET customers/suggested/medicines/ | A-021 | GET customers/suggested/medicines/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-022 | GET customers/suggested/diet-plans/ | A-022 | GET customers/suggested/diet-plans/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-023 | GET customers/doctors/?suggested=true | A-019 | GET customers/doctors/?suggested=true | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-024 | GET customers/products/ | A-026 | GET customers/products/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-025 | GET customers/product-categories/ | A-028 | GET customers/product-categories/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-026 | GET customers/products/discovery/ | A-027 | GET customers/products/discovery/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-027 | GET customers/health-categories/ | — | — | MISSING | GET customers/health-categories/ is not in the web API inventory. | P1 |
| A-028 | GET user/health-categories/ | — | — | MISSING | GET user/health-categories/ is not in the web API inventory. Native category-doctor screen calls it. | P1 |
| A-029 | GET user/health-diseases/ | — | — | MISSING | GET user/health-diseases/ is not in the web API inventory. | P1 |
| A-030 | GET customers/banners/ | A-023 | GET customers/banners/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-031 | GET customers/doctors/ | A-035 | GET customers/doctors/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-032 | POST favorites/doctors/?doctor_id= | A-036 | POST favorites/doctors/?doctor_id= | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-033 | GET customers/doctors/recent/ | A-037 | GET customers/doctors/recent/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-034 | GET customers/doctors/consultation-history/ | — | — | PARTIAL | GET customers/doctors/consultation-history/ is not in the web API inventory. The consultation-history page exists, so the page may call a different path. | P1 |
| A-035 | GET customers/doctors/consultation-receipt/ | consultService | GET customers/doctors/consultation-receipt/?consultation_id= | MATCH | Medical receipt calls this GET with consultation_id and reads the same fee and payment fields as the app. | — |
| A-036 | GET customers/doctor-slip/ | consultService | GET customers/doctor-slip/?doctor_id= | MATCH | Doctor slip calls this GET with doctor_id. The response consultations and doctor fields drive the single-visit and multiple-visit layouts. | — |
| A-037 | POST payments/customer/consultation/payment/book-slot/ | A-038 | POST payments/customer/consultation/payment/book-slot/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-038 | POST payments/customer/consultation/payment/verify-payment/ | A-040 | POST payments/customer/consultation/payment/verify-payment/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-039 | GET payments/customer/consultation/fee-quote/ | A-039 | GET payments/customer/consultation/fee-quote/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-040 | POST customers/doctors/appointments/action/ | A-041 | POST customers/doctors/appointments/action/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-041 | GET notifications/ | A-075 | GET notifications/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-042 | POST notifications/ | A-076 | POST notifications/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-043 | POST notifications/push/welcome/ | — | — | N/A-PLATFORM | Welcome push is OneSignal on the device. Web alternative is the browser Notification permission already used on OTP. There is no welcome-push endpoint on the web. | P2 |
| A-044 | GET cart/ | A-042 | GET cart/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-045 | POST cart/ | A-043 | POST cart/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-046 | GET promotions/coupons/ | A-053 | GET promotions/coupons/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-047 | POST promotions/coupons/validate/ | A-054 | POST promotions/coupons/validate/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-048 | GET promotions/rewards/ | A-055 | GET promotions/rewards/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-049 | GET yoga/sessions/ | A-024 | GET yoga/sessions/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-050 | GET yoga/sessions/:id | A-025 | GET yoga/sessions/:id | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-051 | GET patients/ | A-056 | GET patients/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-052 | POST patients/ | A-057 | POST patients/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-053 | PATCH patients/?id= | A-058 | PATCH patients/?id= | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-054 | DELETE patients/?id= | A-059 | DELETE patients/?id= | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-055 | POST patients/switch/?id= | A-060 | POST patients/switch/?id= | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-056 | GET customers/medical-records/ | A-061 | GET customers/medical-records/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-057 | POST customers/medical-records/ | A-062 | POST customers/medical-records/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-058 | DELETE customers/medical-records/?id= | A-063 | DELETE customers/medical-records/?id= | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-059 | GET patients/diet-plans/ | A-064 | GET patients/diet-plans/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-060 | POST patients/diet-plans/start/ | A-065 | POST patients/diet-plans/start/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-061 | POST patients/diet-plans/water/ | A-066 | POST patients/diet-plans/water/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-062 | GET patients/diet-plans/progress/ | A-067 | GET patients/diet-plans/progress/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-063 | POST patients/diet-plans/progress/ | A-068 | POST patients/diet-plans/progress/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-064 | GET patients/diet-plans/status/ | A-069 | GET patients/diet-plans/status/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-065 | POST order/fee-quote/ | A-044 | POST order/fee-quote/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-066 | GET order/ | A-045 | GET order/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-067 | POST order/ | A-046 | POST order/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-068 | POST order/verify-payment/ | A-047 | POST order/verify-payment/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-069 | GET order/:orderId/ | A-048 | GET order/:id/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-070 | POST order/:orderId/cancel/ | A-049 | POST order/:id/cancel/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-071 | GET order/:orderId/unicommerce-poll/ | A-050 | GET order/:id/unicommerce-poll/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-072 | GET order/transactions/ | A-051 | GET order/transactions/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-073 | GET payments/customer/history/ | A-052 | GET payments/customer/history/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-074 | GET customers/search/ | — | — | PARTIAL | GET customers/search/ is not in the web API inventory. The /search page exists. | P1 |
| A-075 | GET customers/search/recent/ | — | — | MISSING | GET customers/search/recent/ is not in the web API inventory. | P2 |
| A-076 | DELETE customers/search/recent/ | — | — | MISSING | DELETE customers/search/recent/ is not in the web API inventory. | P2 |
| A-077 | GET policies/customer/required/ | — | — | PARTIAL | GET policies/customer/required/ is not in the web API inventory. Web policy calls use policies/legal/required/. | P1 |
| A-078 | GET policies/legal/required/ | A-073 | GET policies/legal/required/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-079 | POST policies/legal/accept/ | A-074 | POST policies/legal/accept/ | MATCH | OTP calls accept with type all after login and after register. A failed accept still stores the local policy flag. | — |
| A-080 | POST customers/prescription-requests/ | A-071 | POST customers/prescription-requests/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-081 | GET customers/faqs/ | A-072 | GET customers/faqs/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-082 | GET customers/brands/ | A-070 | GET customers/brands/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-083 | GET review/ | A-029 | GET review/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-084 | POST favorites/products/?variant_id= | A-030 | POST favorites/products/?variant_id= | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-085 | GET reviews/product/ | A-031 | GET reviews/product/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-086 | GET reviews/user/ | A-032 | GET reviews/user/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-087 | PATCH reviews/:reviewId/ | A-033 | PATCH reviews/:id/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-088 | DELETE reviews/:reviewId/ | A-034 | DELETE reviews/:id/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-089 | GET doctors/appointments/:id/call/status/ | A-077 | GET doctors/appointments/:id/call/status/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-090 | POST doctors/appointments/:id/call/start/ | A-078 | POST doctors/appointments/:id/call/start/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-091 | POST doctors/appointments/:id/call/token/ | A-079 | POST doctors/appointments/:id/call/token/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-092 | POST doctors/appointments/:id/call/events/ | A-080 | POST doctors/appointments/:id/call/events/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-093 | POST doctors/appointments/:id/call/left/ | A-081 | POST doctors/appointments/:id/call/left/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-094 | GET communication/appointments/:id/messages/ | A-082 | GET communication/appointments/:id/messages/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-095 | POST communication/appointments/:id/messages/ | A-083 | POST communication/appointments/:id/messages/ | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-096 | WS communication socket | A-084 | WS chat socket | MATCH | Same realtime chat socket. The native inventory calls it the communication socket. The web inventory calls it the chat socket and proxies /ws during development. | — |
| A-097 | GET Google Geocoding and Places | A-085 | GET Google Geocoding and Places | MATCH | Same method and path on both clients. Response fields were only compared for the auth calls in the finished audit batches. | — |
| A-098 | GET catalogs/homepage/ | — | — | MISSING | GET catalogs/homepage/ is not in the web API inventory. Native notes say the caller still needs confirmation. | P3 |
