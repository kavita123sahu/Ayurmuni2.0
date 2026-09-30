# Website spacing audit (STEP 1)

**Scope:** `/web` only. Spacing and sizing. No UI edits in this file.  
**Date:** 2026-09-30.

The site does **not** use Tailwind. Spacing is CSS custom properties in `web/src/design/tokens.css`, consumed by `components.css`, `shell.css`, page CSS under `web/src/design/pages/`, plus leftover rules in `styles.css` / `ui.css` / `desktop.css`.

STEP 2–3 should map the requested Tailwind rules onto these tokens and classes.

## Token legend (current)

| Token | Value | Tailwind-ish |
| --- | --- | --- |
| `--am-space-1` | 4px | `p-1` |
| `--am-space-2` | 8px | `p-2` |
| `--am-space-3` | 12px | `p-3` |
| `--am-space-4` | 16px | `p-4` |
| `--am-space-5` | 20px | ~`p-5` |
| `--am-space-6` | 24px | `p-6` |
| `--am-space-8` | 32px | `p-8` |
| `--am-space-10` | 40px | `p-10` |
| `--am-space-12` | 48px | `p-12` / `py-12` |
| `--am-space-16` | 64px | `py-16` |
| `--am-space-20` | 80px | `py-20` |
| `--am-gutter` | 16 / 24 / 32 / 40px | `px-4` → `px-10` by breakpoint |
| `--am-control-h` | 48px (46px ≥901px) | `h-12` |
| `--am-tap-min` | 44px | min tap |
| `--am-header-h` | 64 / 76 / 80px | navbar height |
| `--am-tabbar-h` | 64px | bottom nav |
| `--am-text-2xs` | 11px | |
| `--am-text-xs` | 12px | `text-xs` |
| `--am-text-sm` | 14px | `text-sm` |
| `--am-text-body` | 15px (16px ≥901px) | body |
| `--am-text-base` | 16px | `text-base` |
| `--am-text-md` | 18px | |
| `--am-text-lg` | 20px | `text-lg` |
| `--am-text-xl` | 24px | `text-xl` |
| `--am-text-2xl` | clamp 26–32px | page titles |
| `--am-text-3xl` | clamp 30–44px | heroes |
| `--am-radius-sm` | 8px | `rounded-lg` |
| `--am-radius-md` | 12px | `rounded-xl` |
| `--am-radius-lg` | 16px | `rounded-2xl` |
| `--am-radius-xl` | 24px | `rounded-3xl` |
| `--am-radius-2xl` | 32px | larger than `rounded-3xl` |
| `--am-shadow-xs` | light | |
| `--am-shadow-sm` | light | `shadow-sm` |
| `--am-shadow-md` | medium | `shadow-md` |
| `--am-shadow-lg` | heavy | `shadow-lg` |

Legacy aliases inflate some values: `--space-5` = 24px, `--space-6` = 32px, `--radius-lg` = 24px, `--shadow-card` = md.

---

## Shared chrome

### Navbar (`SiteHeader` / `.site-header`)

| Property | Current |
| --- | --- |
| Height | `--am-header-h` 64px / 76px / 80px |
| Inner padding | `0 12px`; ≥640px `0 gutter` (16–40px) |
| Inner gap | 8px; ≥640px 12px |
| Brand image | 40 / 48 / 52px tall |
| Nav link | min-height 44px, pad `0 12px`, 14px; ≥1440px pad `0 16px` |
| Mobile menu | pad 8px 12px 16px; links min-height 48px, 16px type |
| Profile link | min-height 44px, pad `0 12px` |
| Icon / cart | 44×44 |

### Bottom tab bar (phones)

| Property | Current |
| --- | --- |
| Height | 64px |
| Inset | 8px from edges + safe area |
| Radius | 24px (`radius-xl`) |
| Shadow | `shadow-lg` |
| Item font | 11px |
| Icon well | 48×28px |
| Body pad-bottom | 64 + 32px + safe area |

### Footer (`SiteFooter`)

| Region | Padding / gap | Type |
| --- | --- | --- |
| Trust strip | 32px vertical, gutter horizontal; gap 20×16; ≥901px gap 24px | 14px / 12px |
| Inner grid | 40px top, 32px bottom, gutter; ≥901px top 48px, gap 32px | |
| Brand logo | 52px tall, mb 16px | tagline 20px, body 14px |
| Column h2 | mb 12px, 12px caps | links min-height 36px, 14px |
| Legal bar | 20px top, 24px bottom | 12px |

### Page header (`PageHeader` / `.am-page-header`)

| Property | Current |
| --- | --- |
| Margin-bottom | 24px (`space-6`) — **target mb-2/3** |
| Stack gap | 12px |
| Back | min-height 44px, 14px |
| Title | `--am-text-2xl` (~26–32px) |
| Subtitle | 14px |

### Section header (`.am-section-header`)

| Property | Current |
| --- | --- |
| Margin-bottom | 16px; ≥901px **24px** |
| Title | 24px; ≥901px ~26–32px |
| Desc | 14px; ≥901px **16px** |

### Container (`.am-container`)

Inline padding = `--am-gutter` (16 / 24 / 32 / 40). **Target px-3 / px-4 (12 / 16).**

---

## Shared UI kit (`web/src/design/components.css`)

### Buttons (`.am-btn`)

| Size | Height | Pad | Font |
| --- | --- | --- | --- |
| default | 48px (`h-12`) | 0 20px | 14px |
| sm | 40px | 0 16px | 14px |
| lg | 52px | 0 24px | 16px |
| link | min 44px | 0 4px | 14px |
| Radius | 12px (`radius-md`) | | |
| Primary shadow | `shadow-xs` | | |

**Target:** h-9 / py-1.5, text-sm. Keep ≥36px on mobile.

Legacy `.cta` in `styles.css`: same 48px height.

### Icon button

44×44 default; sm 36×36 with 4px hit expansion.

### Inputs (`.am-input`)

| Property | Current |
| --- | --- |
| Height | 48px |
| Pad | 0 16px |
| Font | 16px (`text-base`) |
| Radius | 12px |

**Target:** h-9 (36px). Keep 16px font on iOS if zoom is a concern; otherwise 14px.

Search field (`.am-search`): min-height 48px, inner input **44px**, 16px type, pill radius.

### Cards (`.am-card`)

| Variant | Pad | Radius | Shadow |
| --- | --- | --- | --- |
| pad-sm | 12px | 16px | none / sm if elevated |
| pad-md | 16px; ≥901px **20px** | 16px | |
| pad-lg | 24px; ≥901px **32px** | 16px | |
| elevated | | | `shadow-sm`; hover `shadow-md` + translateY(-2px) |

**Target:** p-3/p-4, `rounded-lg` (8px), `shadow-sm` only.

### Chips / tabs

Chip min-height **44px** (40px ≥901px hover), pad `0 16px`, 14px.  
Tabs: similar 44px row.

### Modal (`.am-modal`)

| Region | Current |
| --- | --- |
| Align | bottom sheet on mobile; centered ≥640px with 24px outer pad |
| Panel radius | 24px top (sheet) / 24px all (dialog) |
| Shadow | `shadow-lg` |
| Header | 20px 20px 0 |
| Body | 16px 20px 20px |
| Footer | 16px 20px 20px, gap 12px |
| Title | 20px |
| Close | 44×44 |

### Toast

Pad 12px 8px 12px 16px, radius 12px, **shadow-lg**, 14px. Close 32×32.

### Empty state

Pad **40px 24px** (compact 24×16). Icon 56×56. Title 20px, desc 14px.

### Product card (`.am-product-card`)

| Property | Current |
| --- | --- |
| Radius | 16px |
| Shadow | xs; hover md |
| Image | **aspect-ratio 1** (square), inner pad 12px |
| Body pad | 12px 12px 0, gap 4px |
| Name | 14px, 2 lines |
| Price | 16px |
| Add / stepper | min-height **44px**, pad 12px around action |
| Wish | 44×44 |

**Target:** image height −30–40% (e.g. aspect 4/3 or 5/4), radius 8px.

Legacy `.pcard-img` in `styles.css`: **fixed 132px** height, radius 12px. Grid gap 12px.

### Doctor card (`.am-doctor-card`)

Pad 16px, gap 12px, radius 16px, **shadow-sm** (hover md + lift). Photo **64×64**. Name 14–16px. CTA 14px.

### Media card (yoga / diet / visited)

Radius 16px, shadow xs (hover md + lift). Image **aspect 16/10**. Body pad 12px 16px 16px. Title 14px, desc 12px.

### Dummy offer card (`.do-card`)

Radius 16px, shadow xs. Image **aspect 4/3**. Hero min-height **148px**.

### Tile (health concerns)

Grid minmax 104px, gap 12px. Tile pad 12×8, radius 16px. Image **64×64**.

### Rail

Gap 12px, item ~220px / product ~200px, pad 4px 0 12px.

### Grids

Product: 2 col, gap 12px; ≥768px gap **16px**, minmax 200px.  
Doctor: minmax 280px, same gaps.

### Consult card

Pad 16px, gap 12px, radius 16px, shadow xs (hover md). Photo 48×48.

### Banner carousel

Aspect **16/7**.

---

## Pages (by route)

Padding below is page shell unless noted. “catalog-page” = 20px 20px 36px desktop, **16px 12px 28px** ≤640px. Title 22px, subtitle 13px, head mb 16px.

### Auth / onboarding

| Route | Page | Shell | Notes |
| --- | --- | --- | --- |
| `/` | Splash | `.sx-splash` | Full viewport, pad 32px + gutter. |
| `/welcome` | Welcome | `.au-welcome` | Media ~42vh. Panel pad **20px gutter 32px**, gap 20px. Logo 48×48. Title ~26–32px. Body 14px. |
| `/login` | Login | `.au-auth` | Form pad **20px gutter 32px**. Inputs 48px. |
| `/otp` | OtpVerify | `.au-auth` | OTP boxes ~48px. `.otp-row` gap 10px, mb 16px. |
| `/access-mode` | AccessMode | `.au-access` | Pad **24px gutter 32px**. Cards gap 12px. Title clamp ~28–38px. |
| `/onboarding` | Onboarding | auth form | Same 48px controls; photo picker large. |
| `/assessment` | AssessmentType | `.assess` | Hero pad **22×22×28**. Sheet radius **28px**, pad 22×18×24. Cards pad **20px**, min-height **168px**, radius 22px, mb 14px. h1 30px. |
| `/assessment-prakriti`, `/patient-faq` | PatientFAQ | quest + catalog mix | Quest stage pad 16px, radius 20px. Options gap 10px, pad 10px, radius 14px, thumbs 48×48. |
| `/assessment-medical`, `/medical-history` | Questionnaire | quest | Same quest metrics. Footer CTAs 48px. |
| `/prakriti-profile` | PrakritiProfile | auth / result | Large result type. |
| `/complete-details` | CompleteDetails | gate | Centered card, 48px buttons. |
| `/terms` | redirects to PolicyDetail | | |
| `/policy-detail` | PolicyDetail | `.sx-page.sx-narrow` | See static. |
| `/network-error` | NetworkError | `.network-error-page` | Pad 32×16. Card pad **32×24**, radius **24px**, max-w 420, min-height 60vh wrapper. |

### Home

| Region | Padding / gap | Type / size |
| --- | --- | --- |
| `.hm-page` | pb 32px | |
| Hero inner | **24px gutter 32px**, gap 24px | title 3xl, lede **16px**, copy gap 16px |
| Search | 48px control | |
| `.hm-body` | **24px gutter 0**, **gap 40px** (section stack) | **target space-y-3** |
| Services grid | pad 12px, gap 8px, radius 16px, **shadow-md** | tiles min-height **96px**, pad 8px |
| Join / promo cards | pad 16–20px | |
| Appointment row | pad 12px, gap 12px, radius 12px | avatar 40×40, 14px / 12px |
| Coming soon | pad 20px, radius 16px | title 20px, mb 12px |
| Desktop tweaks | some hero pad 16px / 24px | |

### Store / products

| Route | Page | Shell | Cards / lists |
| --- | --- | --- | --- |
| `/products` | Products | `.st-page`: **gap 32px**, pad **20px gutter 32px** | Hero pad **24×20**, radius **24px**, lede 16px. Action tiles min-height **88px**, pad 16px, radius 16px. Product grid as kit. |
| `/products/top` | TopCategories | catalog-page | Category tiles. |
| `/products/category` | CategoryProducts | `.st-page` | Filter chips + product grid. |
| `/search` | ProductSearch | catalog-page + store | Filter bar chips; same grid. |
| `/products/:id` | ProductDetails | `.pd-page`: **gap 24px**, pad **20px gutter 32+96px** | Gallery **1:1**, radius **24px**. Thumbs **64px**. Sticky CTA 48px. |
| `/reviews` | ReviewPage | catalog-page | Review cards; header gap 12px, mb 8px. |
| `/reviews/gallery` | ReviewGallery | catalog-page | Hero max-height **420px**, radius 24px, mb 16px. |
| `/medicines` | Medicines | `.st-page` | Same as products + RX banners. |
| `/medicines/prescription*` | Upload / Verify | catalog-page | Form 48px inputs. |
| `/medicines/checkout` | MedicineCheckout | catalog-page | Checkout-card pad 14px, radius 16px, mb 12px. |
| `/medicines/order-status` | OrderStatus | catalog-page | Status steps. |
| `/labs` | OrangeLab | `.do-page`: pad **20px gutter 32px**, gap 20px | Offer cards 4:3, hero min-height 148px. |
| `/packages` | Packages | `.do-page` | Same. |
| `/wishlist` | Wishlist | catalog-page | Product cards. |

### Cart / checkout / orders

| Route | Page | Shell | Rows |
| --- | --- | --- | --- |
| `/cart` | Cart | `.ct-page`: gap 20px, pad **20px gutter 32+112px** | Line pad **16px**, gap 12px, radius 16px. Thumb **72×72**. Banner pad 12×16. |
| `/checkout` | Checkout | `.co-page`: same as cart | `.co-card` pad **20px**, gap 16px, radius 16px. Address rows py 8px, 14px. |
| `/order-confirmation` | OrderConfirmation | `.or-page` + confirm | Pad **20px gutter 40px**, gap 20px. Badge **72×72**. h1 3xl. Extra top 32px. |
| `/profile/orders` | OrderHistory | `.or-page` | Order cards ~16px pad. |
| `/profile/orders/:id` | OrderDetails | `.or-page` | Same. |

### Consult / doctors / booking

| Route | Page | Shell | Notes |
| --- | --- | --- | --- |
| `/consult` | Consult | `.cs-page`: **gap 32px**, pad **20px gutter 32px** | Hero pad **24×20**, radius **24px**, gap 24px, lede 16px. |
| `/consult/history` | ConsultHistory | catalog-page | `.history-card` pad 14px, radius 16px, mb 12px. Avatar 56×56. |
| `/consult/concern/:id` | CategoryDoctor | `.cs-page` | Tile + doctor grids. |
| `/consult/doctors` | Doctors | `.cs-page` | Doctor cards 16px pad. |
| `/consult/doctors/:id` | DoctorProfile | `.dp-page`: **gap 24px**, pad **20px gutter 32+88px** | Hero pad 20px, radius **24px**, gap 20px. |
| `.../slots`, `.../pay`, booking-confirm, add-calendar | DoctorSlot, ConsultPay, BookingConfirm, AddCalendar | `.bk-page`: gap 20px, pad **20px gutter 32+96px** | `.bk-card` pad **20px**, radius 16px. |
| `.../slip` | DoctorSlip | catalog-page | Receipt card. |
| `.../history` | DoctorConsultationHistory | catalog-page | History cards. |
| `/mentor*` | MentorProfile, ConsultMentor, Checkout, Order, Refund, Exchange | catalog-page | Mentor cards / forms. |

### Profile hub

| Route | Page | Shell | Lists |
| --- | --- | --- | --- |
| `/profile` | Profile | `.pf-page`: gap 20px, pad **20px gutter 40px** | Hero pad 20px, radius **24px**, avatar **72×72**. Explore cards pad 16px, gap 12px. Menus gap 20px. **Row pad 16px** (py-4), 14px. Referral section **my 24px**. |
| `/profile/edit` | EditProfile | `.pf-page` | Form fields 48px. |
| `/profile/settings` | Settings | `.pf-page` | Menu rows 16px. |
| `/profile/settings/notifications` | NotificationSettings | `.ns-page`: **gap 24px, pad 24px**, max-w 800 | Quick action pad 12×16. |
| `/profile/addresses` | Addresses | `.pf-page` | Address cards. |
| `/profile/addresses/new\|:id` | AddressForm | `.pf-page` | Inputs 48px. |
| `/profile/appointments` | Appointments | catalog-page | Filters gap 12px, mb 16px. Cards via consult kit. |
| `/profile/appointments/:id` | AppointmentDetails | catalog-page | Detail sections. |
| `/profile/chat/:id` | Chat | `.chat-page` | Header min-height **64px**, pad 10×16, gap 12px. Back 40×40. Bubbles in `styles.css`. Composer ~48px. |
| `/profile/prescriptions/:id` | PrescriptionDetail | catalog-page | File preview. |
| `/share-experience` | ShareExperience | catalog-page | Form + 48px CTA. |
| `/profile/receipts/:id` | MedicalReceipt | catalog-page | Receipt. |
| `/profile/favourite-doctors` | FavDoctors | catalog-page | Doctor cards. |
| `/profile/faq`, `/profile/faq/:id` | HelpCenter, FaqDetail | `.sx-page` | FAQ rows. |
| `/profile/privacy`, `/profile/legal-policies` | PrivacyCenter, LegalPoliciesHub | PolicyHub (sx-page) | List rows ~44px. |
| `/profile/feedback` | FeedbackInformation | `.sx-page.sx-narrow` | Static. |
| `/profile/patients*` | Patients, PatientForm | catalog-page | List / form 48px. |
| `/profile/records` | MedicalRecords | catalog-page | Record rows. |
| `/profile/rewards` | Rewards | `.rw-page`: pad **20px gutter 40px**, gap 20px | How card pad 20px, radius 16px. |
| `/profile/payments` | Payments | catalog-page | Filter chips + txn rows. |
| `/profile/payments/:id` | TransactionDetails | catalog-page | Detail card. |
| `/profile/video/:id` | VideoCall | `.video-call-page` | Pad 16px. Header pad 10px, radius 16px, mb 14px, avatar 46×46. Controls ~48px. |
| `/notifications` | Notifications | catalog-page | List rows. |
| `/location-picker` | LocationPicker | catalog-page | Map + sheet. |

### Yoga / diet

| Route | Page | Shell |
| --- | --- | --- |
| `/yoga` | Yoga | catalog-page + media cards 16/10 |
| `/yoga/:id` | YogaSession | catalog-page; player large |
| `/diet` | Diet | catalog-page |
| `/diet/:planId` | DietPlan | catalog-page |
| `/diet/.../weekly` | WeeklyMeal | catalog-page |
| `/diet/.../meals/:id` | MealDetails | catalog-page |

### Static / support

| Route | Page | Shell |
| --- | --- | --- |
| `/about`, `/contact` | About, Contact | `.sx-page.sx-narrow`: gap 20px, pad **20px gutter 40px** |
| `/profile/faq` | HelpCenter | `.sx-page` |

---

## Shared components (JSX)

| Component | File | Spacing source |
| --- | --- | --- |
| AppShell / AuthShell | `components/AppShell.jsx`, `AuthShell.jsx` | header/footer/tabbar |
| SiteHeader / SiteFooter | `SiteHeader.jsx`, `SiteFooter.jsx` | `shell.css` |
| PageHeader | `PageHeader.jsx` | `.am-page-header` |
| Button / IconButton | `ui/Button.jsx`, `IconButton.jsx` | `.am-btn`, `.am-icon-btn` |
| Field / SearchField / EnhancedSearchField | `ui/Field.jsx`, `SearchField.jsx` | `.am-input`, `.am-search` |
| Card / Tile / Chip / Badge / Tabs | `ui/*` | kit |
| Modal | `ui/Modal.jsx` | `.am-modal` |
| EmptyState / Skeleton / Disclaimer | `ui/*` | kit |
| SectionHeader / Rail / Reveal | `ui/*` | kit |
| ProductCard | `ProductCard.jsx` | `.am-product-card` |
| DoctorCard | `DoctorCard.jsx` | `.am-doctor-card` |
| MediaCard | `ui/MediaCard.jsx` | `.am-media-card` |
| DummyOfferCard | `DummyOfferCard.jsx` | `.do-card` |
| ConsultationCard / Timeline | `consult/*` | `.am-consult-card` |
| BannerCarousel | `BannerCarousel.jsx` | `.am-banner` 16/7 |
| ProductSearchFilterBar | `ProductSearchFilterBar.jsx` | `.st-filter-chip` (store.css) |
| ProductDiscoveryRails | `ProductDiscoveryRails.jsx` | rail + product cards |
| CouponApplyCard | `CouponApplyCard.jsx` | card pad ~16–20px |
| LocationSheet | `LocationSheet.jsx` | modal sheet |
| ReferralCard | `ReferralCard.jsx` | profile / rewards |
| ReviewCard / ReviewSubmitModal | `ui/ReviewCard.jsx`, `ReviewSubmitModal.jsx` | modal + card |
| ShareModal / ShareButton | | modal |
| DiseaseSelectionModal / PrakritiNoteModal | | modal 20px pad |
| ToastHost | `ToastHost.jsx` | `.am-toast` |
| HomeJoinAppointments | `HomeJoinAppointments.jsx` | `.hm-appt` |
| MarqueeCollage | `MarqueeCollage.jsx` | home collage |
| PolicyHubPage / PolicyHubList / PolicyContent | | sx-page list |
| NetworkGuard | | overlay |
| FloatingVideoOverlay / AgoraVideoTile | | video chrome |
| InteractiveMapPicker | | map + 44px controls |
| StepIndicator | `ui/StepIndicator.jsx` | `.am-steps` |
| Rating | `ui/Rating.jsx` | inline |

---

## Compact-rule mapping (for STEP 2–3)

| Requested Tailwind | Current hotspots | Intended token / class |
| --- | --- | --- |
| Section `py-16/20/24` → `py-6/8` | Footer 32–48px; empty 40px; hm-body gap 40px; splash 32px; assess hero 22–28px | `--am-space-6/8` (24/32) → **12/16** usage, or shrink large tokens |
| Container `px-6/8` → `px-3/4` | `--am-gutter` 16–40px | **12 / 16** |
| Card `p-6/8` → `p-3/4` | `.am-card--pad-lg` 24/32; heroes 20–24; `.co-card`/`.bk-card` 20 | **12 / 16** |
| Grid `gap-6/8` → `gap-3/4` | `.st-page`/`.cs-page` gap 32px; `.pd-page`/`.dp-page` 24px; hm-body 40px | **12 / 16** |
| List `py-4` → `py-2` | `.pf-menu__row` 16px; address-row 8px already | **8px** |
| Stacks `space-y-6/8` → `space-y-3` | page `gap: space-5/8` | **12px** |
| Heading `mb-6/8` → `mb-2/3` | `.am-page-header` mb 24px; section-header 16–24px | **8 / 12** |
| Buttons `h-12` → `h-9` | `--am-control-h` 48px; `.am-btn--lg` 52px | **36px** (≥36 mobile) |
| Inputs `h-12` → `h-9` | `.am-input` 48px; search 44–48px | **36px** |
| Card images −30–40% | product 1:1; media 16/10; pcard 132px; do-card 4/3; banners 16/7 | reduce aspect or fixed px |
| `rounded-2xl/3xl` → `rounded-lg` | radius-lg 16, radius-xl 24, assess 22–28, quest 20 | **8px** |
| `text-base` → `text-sm` | ledes, inputs, section desc desktop, prices | **14px** |
| Remove min-heights | assess-card 168; st-action 88; hm-service 96; do-hero 148; chat header 64; network 60vh | drop or cut |
| Shadows lighter | tabbar/footer/toast/cards hover **md/lg** | **shadow-sm** |

**Do not change:** colours, copy, routes, API, state, layout structure (grids/columns stay).

**Touch targets:** keep interactive controls ≥ **36px** tall on 360px viewports (`--am-tap-min` may go 44 → 36, not below).
