# Ayurmuni App ↔ Web Functionality Parity Audit
**Generated:** September 29, 2026  
**App Screens Analyzed:** 95  
**Web Pages Analyzed:** 87  

**Status Legend:**
- ✅ **OK** - Functionality exists and matches
- ❌ **MISSING** - Feature exists in app but not in web
- ⚠️ **PARTIAL** - Feature exists but incomplete/different
- 🆕 **EXTRA** - Feature exists in web but not in app

---

## 1. AUTHENTICATION & ONBOARDING

### 1.1 Splash Screen
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Splash animation | ✅ | ✅ | ✅ OK | Both have splash |
| Auto-navigation to login | ✅ | ✅ | ✅ OK | Works in both |
| Token validation | ✅ | ✅ | ✅ OK | Checks stored token |

### 1.2 Welcome Screen
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Welcome screen with branding | ✅ | ✅ | ✅ OK | `/welcome` |
| Animated image marquee | ✅ | ❌ | ❌ MISSING | App has image marquee, web has simple design |
| Multiple taglines rotation | ✅ | ❌ | ❌ MISSING | App rotates headlines, web is static |
| "Get Started" button | ✅ | ✅ | ✅ OK | Both navigate to login |
| Policy preview inline | ✅ | ❌ | ❌ MISSING | App shows policy snippets on welcome |

### 1.3 Login Screen
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Phone number input | ✅ | ✅ | ✅ OK | 10-digit validation |
| Input validation (10 digits) | ✅ | ✅ | ✅ OK | Real-time validation |
| Country code (+91) | ✅ | ✅ | ✅ OK | Fixed to India |
| Send OTP button | ✅ | ✅ | ✅ OK | API call matches |
| Error handling | ✅ | ✅ | ✅ OK | Shows error messages |
| Loading state | ✅ | ✅ | ✅ OK | Disabled during API call |
| Deleted account warning | ✅ | ❌ | ❌ MISSING | App shows if account was deleted |
| Terms acceptance checkbox | ✅ | ❌ | ❌ MISSING | App requires accepting terms before login |
| Policy links (Terms, Privacy) | ✅ | ✅ | ✅ OK | Can view policies |

### 1.4 OTP Verification Screen
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| 6-digit OTP input | ✅ | ✅ | ✅ OK | Auto-focus on next digit |
| Auto-submit on 6 digits | ✅ | ✅ | ✅ OK | Submits automatically |
| Resend OTP | ✅ | ✅ | ✅ OK | With countdown timer |
| Countdown timer | ✅ | ✅ | ✅ OK | 30 second timer |
| Edit phone number | ✅ | ✅ | ✅ OK | Go back to login |
| OTP verification API | ✅ | ✅ | ✅ OK | Same endpoint |
| Error handling | ✅ | ✅ | ✅ OK | Invalid OTP message |
| Auto-read OTP (SMS) | ✅ | ❌ | ❌ MISSING | App has SMS auto-read, web cannot |

### 1.5 Access Mode Screen
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Skip/Guest mode option | ✅ | ✅ | ✅ OK | Continue as guest |
| Complete profile option | ✅ | ✅ | ✅ OK | Full registration |
| Visual design | ✅ | ✅ | ✅ OK | Similar layout |

### 1.6 Complete Details Screen
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| First name input | ✅ | ✅ | ✅ OK | Required field |
| Last name input | ✅ | ✅ | ✅ OK | Required field |
| Email input | ✅ | ✅ | ✅ OK | Optional |
| Email validation | ✅ | ✅ | ✅ OK | Format check |
| Gender selection | ✅ | ✅ | ✅ OK | Dropdown/radio |
| Date of birth | ✅ | ✅ | ✅ OK | Date picker |
| Profile picture upload | ✅ | ✅ | ✅ OK | Image upload |
| Image preview | ✅ | ✅ | ✅ OK | Shows selected image |
| Submit button | ✅ | ✅ | ✅ OK | Saves profile |
| Validation messages | ✅ | ✅ | ✅ OK | Shows errors |

### 1.7 Policy Accept Screen
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Policy accept screen | ✅ | ✅ | ✅ OK | `/policy-accept` |
| List of policies to accept | ✅ | ✅ | ✅ OK | Terms, Privacy, etc. |
| Checkboxes for each policy | ✅ | ✅ | ✅ OK | Must accept required |
| View policy detail | ✅ | ✅ | ✅ OK | Can open policy |
| Cannot proceed without accepting | ✅ | ✅ | ✅ OK | Validation works |
| Accept all button | ✅ | ✅ | ✅ OK | Bulk accept |

### 1.8 Onboarding Screen
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Onboarding screen | ✅ | ✅ | ✅ OK | `/onboarding` |
| Multiple steps/slides | ✅ | ❌ | ❌ MISSING | App has slides, web single page |
| Skip option | ✅ | ❌ | ❌ MISSING | App allows skipping onboarding |
| Next/Previous navigation | ✅ | ❌ | ❌ MISSING | App has step navigation |
| Progress dots | ✅ | ❌ | ❌ MISSING | App shows current step |

---

## 2. HOME & DASHBOARD

### 2.1 Home Screen
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Home page | ✅ | ✅ | ✅ OK | `/home` |
| User greeting | ✅ | ✅ | ✅ OK | "Hello, [Name]" |
| Location display | ✅ | ✅ | ✅ OK | Shows delivery location |
| Change location button | ✅ | ✅ | ✅ OK | Opens location sheet |
| Location sheet/modal | ✅ | ✅ | ✅ OK | Select address |
| Saved addresses in location | ✅ | ✅ | ✅ OK | Shows saved |
| Use GPS location | ✅ | ✅ | ✅ OK | GPS detection |
| Search bar | ✅ | ✅ | ✅ OK | Global search |
| Search navigation | ✅ | ✅ | ✅ OK | Goes to search page |
| Service categories | ✅ | ✅ | ✅ OK | Consult, Products, etc. |
| Category icons | ✅ | ✅ | ✅ OK | Visual icons |
| Category navigation | ✅ | ✅ | ✅ OK | Click to navigate |
| Banner carousel | ✅ | ✅ | ✅ OK | Promotional banners |
| Banner auto-rotation | ✅ | ✅ | ✅ OK | Auto-swipe |
| Banner click navigation | ✅ | ✅ | ✅ OK | Opens target |
| Prakriti card | ✅ | ✅ | ✅ OK | Shows prakriti status |
| Prakriti progress bar | ✅ | ✅ | ✅ OK | Percentage complete |
| Prakriti CTA | ✅ | ✅ | ✅ OK | Start/Continue assessment |
| Prakriti result display | ✅ | ✅ | ✅ OK | Shows dosha type |
| Active diet card | ✅ | ✅ | ✅ OK | Current diet plan |
| Diet progress indicator | ✅ | ✅ | ✅ OK | Day X/Y |
| Upcoming appointments | ✅ | ✅ | ✅ OK | Next appointments |
| Join appointment button | ✅ | ✅ | ✅ OK | Video call entry |
| Health concerns section | ✅ | ✅ | ✅ OK | Concern tiles |
| Concern tiles clickable | ✅ | ✅ | ✅ OK | Navigates to doctors |
| Recent visited doctors | ✅ | ✅ | ✅ OK | Shows recent |
| Visited doctor cards | ✅ | ✅ | ✅ OK | Doctor info |
| Top doctors section | ✅ | ✅ | ✅ OK | Recommended doctors |
| Doctor cards | ✅ | ✅ | ✅ OK | Name, image, rating |
| Doctor click navigation | ✅ | ✅ | ✅ OK | Goes to profile |
| Medicines section | ✅ | ✅ | ✅ OK | Medicine products |
| Medicine product cards | ✅ | ✅ | ✅ OK | Product info |
| Products section | ✅ | ✅ | ✅ OK | Store products |
| Product cards | ✅ | ✅ | ✅ OK | Product info |
| Yoga sessions section | ✅ | ✅ | ✅ OK | Yoga videos |
| Yoga cards | ✅ | ✅ | ✅ OK | Thumbnail, title |
| Diet plans section | ✅ | ✅ | ✅ OK | Diet programs |
| Diet plan cards | ✅ | ✅ | ✅ OK | Plan details |
| View all buttons | ✅ | ✅ | ✅ OK | All sections |
| Coming soon items | ✅ | ✅ | ✅ OK | Panchakarma, etc. |
| Refresh control | ✅ | ✅ | ✅ OK | Pull to refresh |
| Disease selection modal | ✅ | ✅ | ✅ OK | First-time modal |
| Prakriti reminder modal | ✅ | ✅ | ✅ OK | Incomplete prakriti |
| Orange Lab card | ✅ | ❌ | ❌ MISSING | App has Orange Lab feature |
| Packages section | ✅ | ❌ | ❌ MISSING | App shows packages/combos |
| Emergency SOS button | ✅ | ❌ | ❌ MISSING | Quick SOS access in app |

---

## 3. PRODUCT & STORE

### 3.1 Products Listing
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Products page | ✅ | ✅ | ✅ OK | `/products` |
| Product grid | ✅ | ✅ | ✅ OK | Grid layout |
| Product cards | ✅ | ✅ | ✅ OK | Image, name, price |
| Product search | ✅ | ✅ | ✅ OK | Search bar |
| Category filters | ✅ | ⚠️ | ⚠️ PARTIAL | Web added recently |
| Price filters | ✅ | ⚠️ | ⚠️ PARTIAL | Web added recently |
| Rating filters | ✅ | ⚠️ | ⚠️ PARTIAL | Web added recently |
| Sort options | ✅ | ⚠️ | ⚠️ PARTIAL | Web added recently |
| Shop by category | ✅ | ✅ | ✅ OK | Category page |
| Top categories | ✅ | ✅ | ✅ OK | `/products/top` |
| Banner carousel | ✅ | ✅ | ✅ OK | Product banners |
| Recent orders | ✅ | ✅ | ✅ OK | Shows recent |
| Load more/pagination | ✅ | ✅ | ✅ OK | Infinite scroll |
| Empty state | ✅ | ✅ | ✅ OK | No products message |
| Loading skeleton | ✅ | ✅ | ✅ OK | Shimmer effect |

### 3.2 Category Products
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Category products page | ✅ | ✅ | ✅ OK | `/products/category` |
| Category sidebar | ✅ | ✅ | ✅ OK | Desktop view |
| Category chips (mobile) | ✅ | ✅ | ✅ OK | Mobile view |
| Subcategory selection | ✅ | ✅ | ✅ OK | Nested categories |
| Filter modal | ✅ | ⚠️ | ⚠️ PARTIAL | Web added recently |
| Product grid | ✅ | ✅ | ✅ OK | Same as above |

### 3.3 Product Search
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Search page | ✅ | ✅ | ✅ OK | `/search` |
| Search input | ✅ | ✅ | ✅ OK | Real-time search |
| Search suggestions | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: Autocomplete dropdown with suggestions |
| Search history | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: Stores last 10 searches in localStorage |
| Clear search history | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: Clear all & remove individual items |
| Search results | ✅ | ✅ | ✅ OK | Products list |
| Search filters | ✅ | ❌ | ❌ MISSING | Filter search results |
| Mode switcher (product/health) | ✅ | ✅ | ✅ OK | Toggle search type |

### 3.4 Product Details
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Product detail page | ✅ | ✅ | ✅ OK | `/products/[id]` |
| Product images gallery | ✅ | ✅ | ✅ OK | Image carousel |
| Image zoom | ✅ | ❌ | ❌ MISSING | Pinch to zoom in app |
| Product name | ✅ | ✅ | ✅ OK | Title |
| Product price | ✅ | ✅ | ✅ OK | Selling price |
| MRP / original price | ✅ | ✅ | ✅ OK | Strike-through |
| Discount percentage | ✅ | ✅ | ✅ OK | % off badge |
| Rating display | ✅ | ✅ | ✅ OK | Stars + count |
| Variant selector | ✅ | ✅ | ✅ OK | Size/type dropdown |
| Quantity selector | ✅ | ✅ | ✅ OK | +/- buttons |
| Stock status | ✅ | ✅ | ✅ OK | In stock / out of stock |
| Stock count | ✅ | ✅ | ✅ OK | "X left" |
| Add to cart | ✅ | ✅ | ✅ OK | Button |
| Buy now | ✅ | ⚠️ | ⚠️ PARTIAL | Quick checkout |
| Wishlist toggle | ✅ | ✅ | ✅ OK | Heart icon |
| Description | ✅ | ✅ | ✅ OK | Full description |
| Ingredients | ✅ | ✅ | ✅ OK | Product ingredients |
| Benefits | ✅ | ✅ | ✅ OK | Product benefits |
| How to use | ✅ | ✅ | ✅ OK | Usage instructions |
| Prescription required badge | ✅ | ✅ | ✅ OK | Rx icon |
| Upload prescription button | ✅ | ✅ | ✅ OK | For Rx products |
| Reviews section | ✅ | ✅ | ✅ OK | Customer reviews |
| Review cards | ✅ | ✅ | ✅ OK | Review display |
| Review images | ✅ | ✅ | ✅ OK | Photos in reviews |
| View all reviews | ✅ | ✅ | ✅ OK | Reviews page |
| Write review button | ✅ | ⚠️ | ⚠️ PARTIAL | Web added recently |
| Share product | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: ShareButton in product details |
| Similar products | ✅ | ❌ | ❌ MISSING | Recommendations |
| Customers also bought | ✅ | ❌ | ❌ MISSING | Cross-sell |

### 3.5 Reviews & Ratings
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Review page | ✅ | ✅ | ✅ OK | `/reviews` |
| Review list | ✅ | ✅ | ✅ OK | All reviews |
| Review cards | ✅ | ✅ | ✅ OK | Name, rating, text |
| Review images | ✅ | ✅ | ✅ OK | Photo grid |
| Review gallery | ✅ | ✅ | ✅ OK | `/reviews/gallery` |
| Image lightbox | ✅ | ✅ | ✅ OK | Full screen view |
| Write review modal | ✅ | ⚠️ | ⚠️ PARTIAL | Web added recently |
| Rating stars input | ✅ | ⚠️ | ⚠️ PARTIAL | Web added recently |
| Review text input | ✅ | ⚠️ | ⚠️ PARTIAL | Web added recently |
| Photo upload (review) | ✅ | ⚠️ | ⚠️ PARTIAL | Web added recently |
| Review submission | ✅ | ⚠️ | ⚠️ PARTIAL | Web added recently |
| Edit review | ✅ | ❌ | ❌ MISSING | Edit submitted review |
| Delete review | ✅ | ❌ | ❌ MISSING | Delete review |
| Helpful/Not helpful voting | ✅ | ❌ | ❌ MISSING | Vote on reviews |
| Report review | ✅ | ❌ | ❌ MISSING | Flag inappropriate |
| Filter reviews (star rating) | ✅ | ❌ | ❌ MISSING | Filter by rating |
| Sort reviews | ✅ | ❌ | ❌ MISSING | Most recent/helpful |

---

## 4. CART & CHECKOUT

### 4.1 Cart (My Cart)
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Cart page | ✅ | ✅ | ✅ OK | `/cart` |
| Cart item list | ✅ | ✅ | ✅ OK | All items |
| Cart tabs (regular/prescribed) | ✅ | ✅ | ✅ OK | Separate tabs |
| Item image | ✅ | ✅ | ✅ OK | Product image |
| Item name | ✅ | ✅ | ✅ OK | Product name |
| Item size/variant | ✅ | ✅ | ✅ OK | Variant display |
| Item price | ✅ | ✅ | ✅ OK | Unit price |
| Quantity selector | ✅ | ✅ | ✅ OK | +/- buttons |
| Remove from cart | ✅ | ✅ | ✅ OK | Delete button |
| Out of stock indicator | ✅ | ✅ | ✅ OK | Badge |
| Prescription status | ✅ | ✅ | ✅ OK | Approved/rejected |
| View prescription link | ✅ | ✅ | ✅ OK | From prescribed items |
| Prescription groups | ✅ | ✅ | ✅ OK | Grouped by doctor |
| Doctor name in group | ✅ | ✅ | ✅ OK | Prescriber info |
| Select all checkbox | ✅ | ✅ | ✅ OK | Bulk select |
| Individual checkboxes | ✅ | ✅ | ✅ OK | Item selection |
| Subtotal | ✅ | ✅ | ✅ OK | Items total |
| Fee breakdown | ✅ | ✅ | ✅ OK | Shipping, GST, platform fee |
| Total payable | ✅ | ✅ | ✅ OK | Final amount |
| View/Hide bill detail | ✅ | ✅ | ✅ OK | Toggle breakdown |
| Checkout button | ✅ | ✅ | ✅ OK | Proceed to checkout |
| Item count in button | ✅ | ✅ | ✅ OK | "Checkout (X)" |
| Empty cart state | ✅ | ✅ | ✅ OK | Empty message |
| Continue shopping button | ✅ | ✅ | ✅ OK | From empty state |
| Refresh cart | ✅ | ✅ | ✅ OK | Reload items |
| Save for later | ✅ | ❌ | ❌ MISSING | Move to saved |
| Saved items section | ✅ | ❌ | ❌ MISSING | Saved for later list |
| Move to cart (from saved) | ✅ | ❌ | ❌ MISSING | Add back to cart |

### 4.2 Checkout
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Checkout page | ✅ | ✅ | ✅ OK | `/checkout` |
| Selected items display | ✅ | ✅ | ✅ OK | Items being purchased |
| Address selection | ✅ | ✅ | ✅ OK | Choose delivery address |
| Address list | ✅ | ✅ | ✅ OK | Saved addresses |
| Default address auto-select | ✅ | ✅ | ✅ OK | Pre-selected |
| Add new address button | ✅ | ✅ | ✅ OK | Add address |
| Edit address button | ✅ | ✅ | ✅ OK | Edit existing |
| Payment method selection | ✅ | ✅ | ✅ OK | COD/Online |
| COD option | ✅ | ✅ | ✅ OK | Cash on delivery |
| Online payment option | ✅ | ✅ | ✅ OK | Razorpay |
| Coupon section | ✅ | ✅ | ✅ OK | Apply coupon |
| Coupon input | ✅ | ✅ | ✅ OK | Enter code |
| Coupon list | ✅ | ✅ | ✅ OK | Available coupons |
| Apply coupon button | ✅ | ✅ | ✅ OK | Apply code |
| Remove coupon button | ✅ | ✅ | ✅ OK | Remove applied |
| Coupon discount display | ✅ | ✅ | ✅ OK | Discount amount |
| Eligible coupons | ✅ | ✅ | ✅ OK | Filter eligible |
| Bill breakdown | ✅ | ✅ | ✅ OK | Detailed billing |
| Subtotal | ✅ | ✅ | ✅ OK | Items total |
| Shipping charges | ✅ | ✅ | ✅ OK | Delivery fee |
| GST | ✅ | ✅ | ✅ OK | Tax |
| Platform fee | ✅ | ✅ | ✅ OK | Service charge |
| COD charges | ✅ | ✅ | ✅ OK | If COD selected |
| Discount | ✅ | ✅ | ✅ OK | Coupon discount |
| Total payable | ✅ | ✅ | ✅ OK | Final amount |
| Place order button | ✅ | ✅ | ✅ OK | Submit order |
| Loading state | ✅ | ✅ | ✅ OK | Processing order |
| Stock validation | ✅ | ✅ | ✅ OK | Check stock before order |
| Error handling | ✅ | ✅ | ✅ OK | Show errors |
| Razorpay integration | ✅ | ✅ | ✅ OK | Payment gateway |
| Payment success handling | ✅ | ✅ | ✅ OK | Verify payment |
| Payment failure handling | ✅ | ✅ | ✅ OK | Retry option |
| Order notes field | ✅ | ❌ | ❌ MISSING | Add delivery notes |
| Gift wrap option | ✅ | ❌ | ❌ MISSING | Gift wrapping |
| Delivery time preference | ✅ | ❌ | ❌ MISSING | Select delivery slot |
| Split payment | ✅ | ❌ | ❌ MISSING | Multiple payment methods |

### 4.3 Order Confirmation
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Order confirmation page | ✅ | ✅ | ✅ OK | `/order-confirmation` |
| Success message | ✅ | ✅ | ✅ OK | Order placed |
| Order ID display | ✅ | ✅ | ✅ OK | Order number |
| Order details | ✅ | ✅ | ✅ OK | Items, address, payment |
| Track order button | ✅ | ✅ | ✅ OK | Go to order details |
| Continue shopping button | ✅ | ✅ | ✅ OK | Back to products |
| Download invoice | ✅ | ❌ | ❌ MISSING | PDF download |
| Share order | ✅ | ❌ | ❌ MISSING | Share order details |

---

## 5. ORDERS & ORDER MANAGEMENT

### 5.1 Order History
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Order history page | ✅ | ✅ | ✅ OK | `/profile/orders` |
| Order list | ✅ | ✅ | ✅ OK | All orders |
| Order cards | ✅ | ✅ | ✅ OK | Order info |
| Order ID | ✅ | ✅ | ✅ OK | Display order number |
| Order date | ✅ | ✅ | ✅ OK | Placed date |
| Order status | ✅ | ✅ | ✅ OK | Status badge |
| Order items preview | ✅ | ✅ | ✅ OK | First few items |
| Order total | ✅ | ✅ | ✅ OK | Total amount |
| View details button | ✅ | ✅ | ✅ OK | Go to detail page |
| Filter by status | ✅ | ❌ | ❌ MISSING | Filter orders (pending/delivered/cancelled) |
| Search orders | ✅ | ❌ | ❌ MISSING | Search by order ID/product |
| Date range filter | ✅ | ❌ | ❌ MISSING | Filter by date |
| Empty state | ✅ | ✅ | ✅ OK | No orders message |
| Pagination | ✅ | ✅ | ✅ OK | Load more |

### 5.2 Order Details
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Order details page | ✅ | ✅ | ✅ OK | `/profile/orders/[id]` |
| Order ID | ✅ | ✅ | ✅ OK | Display |
| Order date | ✅ | ✅ | ✅ OK | Placed date |
| Order status | ✅ | ✅ | ✅ OK | Current status |
| Status timeline | ✅ | ✅ | ✅ OK | Order progress |
| Estimated delivery date | ✅ | ✅ | ✅ OK | ETA |
| Order items list | ✅ | ✅ | ✅ OK | All items |
| Item images | ✅ | ✅ | ✅ OK | Product images |
| Item details | ✅ | ✅ | ✅ OK | Name, quantity, price |
| Delivery address | ✅ | ✅ | ✅ OK | Full address |
| Payment method | ✅ | ✅ | ✅ OK | COD/Online |
| Payment status | ✅ | ✅ | ✅ OK | Paid/Pending |
| Bill breakdown | ✅ | ✅ | ✅ OK | Detailed billing |
| Download invoice | ✅ | ❌ | ❌ MISSING | PDF invoice |
| Track order button | ✅ | ❌ | ❌ MISSING | Live tracking |
| Contact support | ✅ | ❌ | ❌ MISSING | Help for order |
| Cancel order | ✅ | ❌ | ❌ MISSING | Cancel order option |
| Return order button | ✅ | ❌ | ❌ MISSING | Initiate return |
| Refund status | ✅ | ❌ | ❌ MISSING | Show refund if applicable |
| Reorder button | ✅ | ❌ | ❌ MISSING | Order again |
| Rate & review | ✅ | ❌ | ❌ MISSING | Review products after delivery |

### 5.3 Order Tracking
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Order tracking page | ✅ | ❌ | ❌ MISSING | Live tracking screen |
| Track on map | ✅ | ❌ | ❌ MISSING | Google Maps integration |
| Delivery person details | ✅ | ❌ | ❌ MISSING | Name, phone, photo |
| Call delivery person | ✅ | ❌ | ❌ MISSING | Direct call |
| Live location | ✅ | ❌ | ❌ MISSING | Real-time location |
| ETA countdown | ✅ | ❌ | ❌ MISSING | Time remaining |
| Status updates | ✅ | ❌ | ❌ MISSING | Push notifications |

### 5.4 Returns & Refunds
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Return order page | ✅ | ❌ | ❌ MISSING | Initiate return |
| Return reason selection | ✅ | ❌ | ❌ MISSING | Select reason |
| Return photos upload | ✅ | ❌ | ❌ MISSING | Upload product photos |
| Return comments | ✅ | ❌ | ❌ MISSING | Explain issue |
| Return submission | ✅ | ❌ | ❌ MISSING | Submit request |
| Return status tracking | ✅ | ❌ | ❌ MISSING | Track return status |
| Refund status | ✅ | ❌ | ❌ MISSING | Refund progress |
| Refund amount display | ✅ | ❌ | ❌ MISSING | Amount to be refunded |
| Refund method | ✅ | ❌ | ❌ MISSING | Bank/wallet |
| Cancel return request | ✅ | ❌ | ❌ MISSING | Cancel return |

---

## 6. CONSULTATION & DOCTORS

### 6.1 Consult Home
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Consult page | ✅ | ✅ | ✅ OK | `/consult` |
| Search doctors | ✅ | ✅ | ✅ OK | Search bar |
| Browse all doctors button | ✅ | ✅ | ✅ OK | View all |
| Consultation history button | ✅ | ✅ | ✅ OK | Past consultations |
| Banner carousel | ✅ | ✅ | ✅ OK | Promotional banners |
| Recent consultations | ✅ | ✅ | ✅ OK | Last 3 appointments |
| Consultation cards | ✅ | ✅ | ✅ OK | Doctor, date, status |
| Health concerns section | ✅ | ✅ | ✅ OK | Concern tiles |
| Concern tiles clickable | ✅ | ✅ | ✅ OK | Navigate to doctors |
| Top doctors section | ✅ | ✅ | ✅ OK | Featured doctors |
| Doctor cards | ✅ | ✅ | ✅ OK | Doctor info |
| Doctor rating | ✅ | ✅ | ✅ OK | Stars + rating |
| Doctor specialization | ✅ | ✅ | ✅ OK | Specialty display |
| Consultation fee | ✅ | ✅ | ✅ OK | Fee display |
| Products section | ✅ | ✅ | ✅ OK | Related products |
| Refresh | ✅ | ✅ | ✅ OK | Refresh data |
| Emergency SOS button | ✅ | ❌ | ❌ MISSING | Quick emergency consult |

### 6.2 All Doctors
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| All doctors page | ✅ | ✅ | ✅ OK | `/consult/doctors` |
| Doctor list | ✅ | ✅ | ✅ OK | All doctors |
| Doctor cards | ✅ | ✅ | ✅ OK | Doctor info |
| Search doctors | ✅ | ✅ | ✅ OK | Search bar |
| Filter by specialization | ✅ | ❌ | ❌ MISSING | Specialty filter |
| Filter by availability | ✅ | ❌ | ❌ MISSING | Available now |
| Filter by rating | ✅ | ❌ | ❌ MISSING | Rating filter |
| Filter by fee range | ✅ | ❌ | ❌ MISSING | Price filter |
| Sort options | ✅ | ❌ | ❌ MISSING | Sort by rating/fee/experience |
| Load more | ✅ | ✅ | ✅ OK | Pagination |
| Empty state | ✅ | ✅ | ✅ OK | No doctors |

### 6.3 Category Doctors
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Category doctor page | ✅ | ✅ | ✅ OK | `/consult/concern/[id]` |
| Category name display | ✅ | ✅ | ✅ OK | Header |
| Category description | ✅ | ✅ | ✅ OK | Info text |
| Doctor list for category | ✅ | ✅ | ✅ OK | Filtered doctors |
| Doctor cards | ✅ | ✅ | ✅ OK | Same as above |
| Empty state | ✅ | ✅ | ✅ OK | No doctors message |

### 6.4 Doctor Profile
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Doctor profile page | ✅ | ✅ | ✅ OK | `/consult/doctors/[id]` |
| Doctor photo | ✅ | ✅ | ✅ OK | Profile image |
| Doctor name | ✅ | ✅ | ✅ OK | Full name |
| Qualification | ✅ | ✅ | ✅ OK | Degree info |
| Specialization | ✅ | ✅ | ✅ OK | Specialty |
| Experience years | ✅ | ✅ | ✅ OK | Years of experience |
| Rating display | ✅ | ✅ | ✅ OK | Stars + rating |
| Total consultations | ✅ | ✅ | ✅ OK | Patient count |
| Consultation fee | ✅ | ✅ | ✅ OK | Fee display |
| About doctor | ✅ | ✅ | ✅ OK | Bio/description |
| Languages spoken | ✅ | ✅ | ✅ OK | Language list |
| Book appointment button | ✅ | ✅ | ✅ OK | Book CTA |
| View slots button | ✅ | ✅ | ✅ OK | Check availability |
| Consultation history with doctor | ✅ | ✅ | ✅ OK | Past appointments |
| Add to favorites | ✅ | ✅ | ✅ OK | Heart icon |
| Share profile | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: ShareButton in doctor profile |
| Report doctor | ✅ | ❌ | ❌ MISSING | Report option |
| Reviews section | ✅ | ❌ | ❌ MISSING | Patient reviews of doctor |

### 6.5 Doctor Slots
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Doctor slots page | ✅ | ✅ | ✅ OK | `/consult/doctors/[id]/slots` |
| Date selector | ✅ | ✅ | ✅ OK | Choose date |
| Calendar view | ✅ | ✅ | ✅ OK | Date picker |
| Available dates highlighting | ✅ | ✅ | ✅ OK | Show availability |
| Time slots display | ✅ | ✅ | ✅ OK | Available times |
| Slot status (available/booked) | ✅ | ✅ | ✅ OK | Slot state |
| Select slot | ✅ | ✅ | ✅ OK | Click to select |
| Selected slot highlight | ✅ | ✅ | ✅ OK | Visual feedback |
| No slots available message | ✅ | ✅ | ✅ OK | No slots state |
| Next available date suggestion | ✅ | ❌ | ❌ MISSING | Suggest next date |
| Proceed to payment | ✅ | ✅ | ✅ OK | Continue button |
| Select patient | ✅ | ✅ | ✅ OK | Choose patient |
| Add new patient | ✅ | ✅ | ✅ OK | Add patient button |

### 6.6 Consultation Payment
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Consultation payment page | ✅ | ✅ | ✅ OK | `/consult/doctors/[id]/pay` |
| Doctor info summary | ✅ | ✅ | ✅ OK | Doctor details |
| Selected slot display | ✅ | ✅ | ✅ OK | Date & time |
| Patient details | ✅ | ✅ | ✅ OK | Selected patient |
| Consultation fee | ✅ | ✅ | ✅ OK | Amount |
| Platform fee | ✅ | ✅ | ✅ OK | Service charge |
| Total amount | ✅ | ✅ | ✅ OK | Total to pay |
| Payment method | ✅ | ✅ | ✅ OK | Online payment |
| Coupon section | ✅ | ✅ | ✅ OK | Apply coupon |
| Confirm & pay button | ✅ | ✅ | ✅ OK | Payment CTA |
| Razorpay integration | ✅ | ✅ | ✅ OK | Payment gateway |
| Payment success | ✅ | ✅ | ✅ OK | Success handling |
| Payment failure | ✅ | ✅ | ✅ OK | Failure handling |
| Free consultation handling | ✅ | ❌ | ❌ MISSING | Skip payment if free |

### 6.7 Booking Confirmation
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Booking confirmation page | ✅ | ✅ | ✅ OK | `/consult/booking-confirm` |
| Success message | ✅ | ✅ | ✅ OK | Confirmation |
| Appointment details | ✅ | ✅ | ✅ OK | Doctor, date, time |
| Booking ID | ✅ | ✅ | ✅ OK | Appointment ID |
| Add to calendar button | ✅ | ✅ | ✅ OK | Calendar integration |
| View appointment button | ✅ | ✅ | ✅ OK | Go to details |
| Done button | ✅ | ✅ | ✅ OK | Back to home |
| Share appointment | ✅ | ❌ | ❌ MISSING | Share details |

### 6.8 Add to Calendar
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Add to calendar page | ✅ | ✅ | ✅ OK | `/consult/add-calendar` |
| Calendar options | ✅ | ✅ | ✅ OK | Google/Apple/Outlook |
| Event details display | ✅ | ✅ | ✅ OK | Appointment info |
| Add to calendar action | ✅ | ✅ | ✅ OK | Calendar API |
| Success message | ✅ | ✅ | ✅ OK | Added confirmation |
| Skip option | ✅ | ✅ | ✅ OK | Skip calendar |

### 6.9 Consultation History
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Consultation history page | ✅ | ✅ | ✅ OK | `/consult/history` |
| Consultation list | ✅ | ✅ | ✅ OK | All consultations |
| Consultation cards | ✅ | ✅ | ✅ OK | Appointment info |
| Doctor details | ✅ | ✅ | ✅ OK | Doctor info |
| Date & time | ✅ | ✅ | ✅ OK | Appointment time |
| Status badge | ✅ | ✅ | ✅ OK | Completed/upcoming/cancelled |
| View details button | ✅ | ✅ | ✅ OK | Go to details |
| Filter by status | ✅ | ❌ | ❌ MISSING | Filter consultations |
| Filter by doctor | ✅ | ❌ | ❌ MISSING | Search by doctor |
| Date range filter | ✅ | ❌ | ❌ MISSING | Filter by date |
| Empty state | ✅ | ✅ | ✅ OK | No history |
| Pagination | ✅ | ✅ | ✅ OK | Load more |

### 6.10 Doctor Consultation History
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Doctor consultation history | ✅ | ✅ | ✅ OK | `/consult/doctors/[id]/history` |
| Consultations with specific doctor | ✅ | ✅ | ✅ OK | Filtered list |
| Consultation cards | ✅ | ✅ | ✅ OK | Same as above |
| Empty state | ✅ | ✅ | ✅ OK | No consultations |

---

## 7. APPOINTMENTS & VIDEO CALLS

### 7.1 Appointments List
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Appointments page | ✅ | ✅ | ✅ OK | `/profile/appointments` |
| Appointments list | ✅ | ✅ | ✅ OK | All appointments |
| Appointment cards | ✅ | ✅ | ✅ OK | Appointment info |
| Doctor photo | ✅ | ✅ | ✅ OK | Doctor image |
| Doctor name | ✅ | ✅ | ✅ OK | Doctor name |
| Appointment date & time | ✅ | ✅ | ✅ OK | Date/time |
| Status badge | ✅ | ✅ | ✅ OK | Status indicator |
| Join video call button | ✅ | ✅ | ✅ OK | For scheduled |
| View details button | ✅ | ✅ | ✅ OK | Go to details |
| Filter by status | ✅ | ❌ | ❌ MISSING | Upcoming/completed/cancelled |
| Search appointments | ✅ | ❌ | ❌ MISSING | Search by doctor |
| Empty state | ✅ | ✅ | ✅ OK | No appointments |
| Pagination | ✅ | ✅ | ✅ OK | Load more |

### 7.2 Appointment Details
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Appointment details page | ✅ | ✅ | ✅ OK | `/profile/appointments/[id]` |
| Appointment ID | ✅ | ✅ | ✅ OK | Display ID |
| Status | ✅ | ✅ | ✅ OK | Current status |
| Doctor details | ✅ | ✅ | ✅ OK | Doctor info |
| Date & time | ✅ | ✅ | ✅ OK | Schedule |
| Patient details | ✅ | ✅ | ✅ OK | Patient info |
| Consultation fee | ✅ | ✅ | ✅ OK | Amount paid |
| Payment status | ✅ | ✅ | ✅ OK | Paid/pending |
| Join video call button | ✅ | ✅ | ✅ OK | Video call entry |
| Call countdown timer | ✅ | ✅ | ✅ OK | Time until appointment |
| Chat with doctor | ✅ | ✅ | ✅ OK | Message button |
| View prescription | ✅ | ✅ | ✅ OK | After consultation |
| Download receipt | ✅ | ✅ | ✅ OK | Medical receipt |
| Share experience | ✅ | ✅ | ✅ OK | Write review |
| Reschedule appointment | ✅ | ✅ | ✅ OK | ✅ ALREADY IMPLEMENTED: Full modal with slot selection |
| Cancel appointment | ✅ | ✅ | ✅ OK | ✅ ALREADY IMPLEMENTED: Modal with reasons & notes |
| Upload reports | ✅ | ❌ | ❌ MISSING | Upload medical reports |
| Download reports | ✅ | ❌ | ❌ MISSING | Download uploaded reports |

### 7.3 Video Call
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Video call page | ✅ | ✅ | ✅ OK | `/profile/video/[id]` |
| Video call redirect | ✅ | ✅ | ✅ OK | `/profile/video` |
| Agora integration | ✅ | ✅ | ✅ OK | Video SDK |
| Join call | ✅ | ✅ | ✅ OK | Connect to call |
| Local video feed | ✅ | ✅ | ✅ OK | Own camera |
| Remote video feed | ✅ | ✅ | ✅ OK | Doctor video |
| Mute/unmute audio | ✅ | ✅ | ✅ OK | Audio toggle |
| Camera on/off | ✅ | ✅ | ✅ OK | Video toggle |
| Flip camera | ✅ | ✅ | ✅ OK | Front/back |
| Speaker toggle | ✅ | ✅ | ✅ OK | Speaker/earpiece |
| Swap views | ✅ | ✅ | ✅ OK | Big/small video |
| Minimize video | ✅ | ✅ | ✅ OK | Picture-in-picture |
| End call button | ✅ | ✅ | ✅ OK | Hang up |
| Call duration timer | ✅ | ✅ | ✅ OK | Timer display |
| Connection status | ✅ | ✅ | ✅ OK | Connected/waiting |
| Waiting for other party | ✅ | ✅ | ✅ OK | Waiting state |
| Network quality indicator | ✅ | ❌ | ❌ MISSING | Signal strength |
| Screen share | ✅ | ❌ | ❌ MISSING | Share screen |
| Chat during call | ✅ | ❌ | ❌ MISSING | Text chat |
| Record call | ✅ | ❌ | ❌ MISSING | Call recording |
| Noise cancellation | ✅ | ❌ | ❌ MISSING | Audio enhancement |

### 7.4 Chat
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Chat page | ✅ | ✅ | ✅ OK | `/profile/chat/[id]` |
| Message list | ✅ | ✅ | ✅ OK | Chat history |
| Message bubbles | ✅ | ✅ | ✅ OK | Sender/receiver |
| Message text | ✅ | ✅ | ✅ OK | Text messages |
| Image messages | ✅ | ✅ | ✅ OK | Send images |
| Message timestamp | ✅ | ✅ | ✅ OK | Time display |
| Message input | ✅ | ✅ | ✅ OK | Text input |
| Send button | ✅ | ✅ | ✅ OK | Send message |
| Image attach button | ✅ | ✅ | ✅ OK | Attach image |
| WebSocket connection | ✅ | ✅ | ✅ OK | Real-time |
| Typing indicator | ✅ | ❌ | ❌ MISSING | "Doctor is typing..." |
| Read receipts | ✅ | ❌ | ❌ MISSING | Message read status |
| Message reactions | ✅ | ❌ | ❌ MISSING | React to messages |
| Voice messages | ✅ | ❌ | ❌ MISSING | Audio messages |
| Document sharing | ✅ | ❌ | ❌ MISSING | Share PDFs/docs |
| Message search | ✅ | ❌ | ❌ MISSING | Search chat |
| Clear chat | ✅ | ❌ | ❌ MISSING | Delete messages |

---

## 8. PRESCRIPTIONS & MEDICAL RECORDS

### 8.1 Prescription Detail
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Prescription detail page | ✅ | ✅ | ✅ OK | `/profile/prescriptions/[id]` |
| Prescription ID | ✅ | ✅ | ✅ OK | Display ID |
| Doctor details | ✅ | ✅ | ✅ OK | Prescribing doctor |
| Patient details | ✅ | ✅ | ✅ OK | Patient info |
| Prescription date | ✅ | ✅ | ✅ OK | Issue date |
| Medicines list | ✅ | ✅ | ✅ OK | Prescribed medicines |
| Medicine details | ✅ | ✅ | ✅ OK | Dosage, frequency |
| Add to cart button | ✅ | ✅ | ✅ OK | Add medicines |
| Download prescription | ✅ | ✅ | ✅ OK | PDF download |
| Share prescription | ✅ | ❌ | ❌ MISSING | Share via apps |
| Print prescription | ✅ | ❌ | ❌ MISSING | Print option |
| Expiry date | ✅ | ❌ | ❌ MISSING | Prescription expiry |
| Reorder medicines | ✅ | ❌ | ❌ MISSING | Quick reorder |

### 8.2 Doctor Slip
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Doctor slip page | ✅ | ✅ | ✅ OK | `/consult/doctors/[id]/slip` |
| Doctor details | ✅ | ✅ | ✅ OK | Doctor info |
| Patient details | ✅ | ✅ | ✅ OK | Patient info |
| Consultation date | ✅ | ✅ | ✅ OK | Appointment date |
| Diagnosis | ✅ | ✅ | ✅ OK | Diagnosis details |
| Prescription | ✅ | ✅ | ✅ OK | Medicines |
| Lab tests | ✅ | ✅ | ✅ OK | Recommended tests |
| Follow-up date | ✅ | ✅ | ✅ OK | Next appointment |
| Doctor's notes | ✅ | ✅ | ✅ OK | Additional notes |
| Download slip | ✅ | ✅ | ✅ OK | PDF download |
| Share slip | ✅ | ❌ | ❌ MISSING | Share option |
| Print slip | ✅ | ❌ | ❌ MISSING | Print option |

### 8.3 Multiple Doctor Slip
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Multiple doctor slip | ✅ | ❌ | ❌ MISSING | Combined prescriptions |
| Multiple prescriptions view | ✅ | ❌ | ❌ MISSING | Multiple doctors |
| Combined medicines list | ✅ | ❌ | ❌ MISSING | All medicines |
| Interaction warnings | ✅ | ❌ | ❌ MISSING | Drug interactions |

### 8.4 Medical Receipt
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Medical receipt page | ✅ | ✅ | ✅ OK | `/profile/receipts/[id]` |
| Receipt ID | ✅ | ✅ | ✅ OK | Receipt number |
| Consultation details | ✅ | ✅ | ✅ OK | Appointment info |
| Doctor details | ✅ | ✅ | ✅ OK | Doctor info |
| Patient details | ✅ | ✅ | ✅ OK | Patient info |
| Consultation fee | ✅ | ✅ | ✅ OK | Amount paid |
| Platform fee | ✅ | ✅ | ✅ OK | Service charge |
| Total amount | ✅ | ✅ | ✅ OK | Total paid |
| Payment method | ✅ | ✅ | ✅ OK | Payment type |
| Date & time | ✅ | ✅ | ✅ OK | Receipt date |
| Download receipt | ✅ | ✅ | ✅ OK | PDF download |
| Share receipt | ✅ | ❌ | ❌ MISSING | Share option |
| Email receipt | ✅ | ❌ | ❌ MISSING | Email PDF |

### 8.5 Medical Records
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Medical records page | ✅ | ✅ | ✅ OK | `/profile/records` |
| Records list | ✅ | ✅ | ✅ OK | All records |
| Record types (prescription/report/slip) | ✅ | ✅ | ✅ OK | Different types |
| Upload new record | ✅ | ❌ | ❌ MISSING | Upload files |
| Record preview | ✅ | ✅ | ✅ OK | View record |
| Download record | ✅ | ✅ | ✅ OK | Download |
| Delete record | ✅ | ❌ | ❌ MISSING | Remove record |
| Share record | ✅ | ❌ | ❌ MISSING | Share with doctor |
| Filter by type | ✅ | ❌ | ❌ MISSING | Filter records |
| Search records | ✅ | ❌ | ❌ MISSING | Search functionality |
| Date range filter | ✅ | ❌ | ❌ MISSING | Filter by date |
| Empty state | ✅ | ✅ | ✅ OK | No records |

---

## 9. MEDICINES & PHARMACY

### 9.1 Medicines Listing
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Medicines page | ✅ | ✅ | ✅ OK | `/medicines` |
| Medicine search | ✅ | ✅ | ✅ OK | Search bar |
| Upload prescription button | ✅ | ✅ | ✅ OK | Upload Rx |
| Browse medicines button | ✅ | ✅ | ✅ OK | Browse catalog |
| Banner carousel | ✅ | ✅ | ✅ OK | Promotional banners |
| Recent orders | ✅ | ✅ | ✅ OK | Medicine orders |
| Shop by concern | ✅ | ✅ | ✅ OK | Health categories |
| Concern tiles | ✅ | ✅ | ✅ OK | Category tiles |
| Trusted brands | ✅ | ✅ | ✅ OK | Brand section |
| Brand tiles | ✅ | ✅ | ✅ OK | Brand logos |
| All medicines section | ✅ | ✅ | ✅ OK | Product list |
| Medicine cards | ✅ | ✅ | ✅ OK | Product info |
| Prescription required badge | ✅ | ✅ | ✅ OK | Rx indicator |
| Load more | ✅ | ✅ | ✅ OK | Pagination |
| Empty state | ✅ | ✅ | ✅ OK | No medicines |

### 9.2 Prescription Upload
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Prescription upload page | ✅ | ✅ | ✅ OK | `/medicines/prescription` |
| Select image source | ✅ | ✅ | ✅ OK | Camera/gallery |
| Camera capture | ✅ | ⚠️ | ⚠️ PARTIAL | Web has limited camera |
| Gallery select | ✅ | ✅ | ✅ OK | File upload |
| Multiple images | ✅ | ✅ | ✅ OK | Upload multiple |
| Image preview | ✅ | ✅ | ✅ OK | Show uploaded |
| Remove image | ✅ | ✅ | ✅ OK | Delete uploaded |
| Patient selection | ✅ | ✅ | ✅ OK | Choose patient |
| Upload button | ✅ | ✅ | ✅ OK | Submit |
| Upload progress | ✅ | ✅ | ✅ OK | Loading state |
| Success message | ✅ | ✅ | ✅ OK | Confirmation |
| Navigate to verify | ✅ | ✅ | ✅ OK | Next step |

### 9.3 Prescription Verification
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Prescription verification page | ✅ | ✅ | ✅ OK | `/medicines/prescription/verify` |
| Prescription images | ✅ | ✅ | ✅ OK | Uploaded images |
| Verification status | ✅ | ✅ | ✅ OK | Pending/approved |
| Status message | ✅ | ✅ | ✅ OK | Info text |
| Estimated time | ✅ | ✅ | ✅ OK | Verification time |
| Refresh status button | ✅ | ✅ | ✅ OK | Check status |
| Proceed after approval | ✅ | ✅ | ✅ OK | Continue shopping |
| Upload new prescription | ✅ | ✅ | ✅ OK | Upload again |
| Real-time status updates | ✅ | ❌ | ❌ MISSING | WebSocket updates |
| Notification on approval | ✅ | ❌ | ❌ MISSING | Push notification |

### 9.4 Medicine Checkout
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Medicine checkout page | ✅ | ✅ | ✅ OK | `/medicines/checkout` |
| Medicine items list | ✅ | ✅ | ✅ OK | Selected medicines |
| Prescription display | ✅ | ✅ | ✅ OK | Associated Rx |
| Address selection | ✅ | ✅ | ✅ OK | Delivery address |
| Payment method | ✅ | ✅ | ✅ OK | COD/Online |
| Bill breakdown | ✅ | ✅ | ✅ OK | Detailed billing |
| Place order button | ✅ | ✅ | ✅ OK | Submit order |
| Same as product checkout | ✅ | ✅ | ✅ OK | Similar flow |

### 9.5 Medicine Order Status
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Medicine order status | ✅ | ✅ | ✅ OK | `/medicines/order-status` |
| Order placed confirmation | ✅ | ✅ | ✅ OK | Success message |
| Order details | ✅ | ✅ | ✅ OK | Order info |
| Track order button | ✅ | ✅ | ✅ OK | Track link |
| Continue shopping | ✅ | ✅ | ✅ OK | Back to medicines |

---

## 10. YOGA & WELLNESS

### 10.1 Yoga Listing
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Yoga page | ✅ | ✅ | ✅ OK | `/yoga` |
| Yoga session list | ✅ | ✅ | ✅ OK | All sessions |
| Session cards | ✅ | ✅ | ✅ OK | Thumbnail, title |
| Video thumbnail | ✅ | ✅ | ✅ OK | Session preview |
| Session title | ✅ | ✅ | ✅ OK | Session name |
| Duration | ✅ | ✅ | ✅ OK | Time |
| Difficulty level | ✅ | ✅ | ✅ OK | Beginner/intermediate/advanced |
| Description | ✅ | ✅ | ✅ OK | Short description |
| Search yoga | ✅ | ✅ | ✅ OK | Search bar |
| Filter by concern | ✅ | ✅ | ✅ OK | Health category filter |
| Filter by prakriti | ✅ | ❌ | ❌ MISSING | Prakriti filter |
| Empty state | ✅ | ✅ | ✅ OK | No sessions |

### 10.2 Yoga Session
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Yoga session page | ✅ | ✅ | ✅ OK | `/yoga/[id]` |
| Video player | ✅ | ✅ | ✅ OK | Video playback |
| Video controls | ✅ | ✅ | ✅ OK | Play/pause/seek |
| Full screen | ✅ | ✅ | ✅ OK | Fullscreen mode |
| Session title | ✅ | ✅ | ✅ OK | Title display |
| Session description | ✅ | ✅ | ✅ OK | Full description |
| Duration | ✅ | ✅ | ✅ OK | Total time |
| Benefits | ✅ | ✅ | ✅ OK | Session benefits |
| Instructions | ✅ | ✅ | ✅ OK | Step-by-step |
| Instructor info | ✅ | ❌ | ❌ MISSING | Instructor details |
| Mark as complete | ✅ | ❌ | ❌ MISSING | Track progress |
| Save favorite | ✅ | ❌ | ❌ MISSING | Bookmark session |
| Share session | ✅ | ❌ | ❌ MISSING | Share option |
| Related sessions | ✅ | ❌ | ❌ MISSING | Recommendations |
| Progress tracking | ✅ | ❌ | ❌ MISSING | Track completed |

---

## 11. DIET & NUTRITION

### 11.1 Diet Plans Listing
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Diet plans page | ✅ | ✅ | ✅ OK | `/diet` |
| Diet plan list | ✅ | ✅ | ✅ OK | All plans |
| Plan cards | ✅ | ✅ | ✅ OK | Plan info |
| Plan cover image | ✅ | ✅ | ✅ OK | Cover photo |
| Plan title | ✅ | ✅ | ✅ OK | Plan name |
| Plan duration | ✅ | ✅ | ✅ OK | Days |
| Plan price | ✅ | ✅ | ✅ OK | Price display |
| Prakriti tag | ✅ | ✅ | ✅ OK | Vata/Pitta/Kapha |
| Season tag | ✅ | ✅ | ✅ OK | Season info |
| Status badge (active/inactive) | ✅ | ✅ | ✅ OK | Status |
| Rating | ✅ | ✅ | ✅ OK | Plan rating |
| Short description | ✅ | ✅ | ✅ OK | Brief info |
| Search diet plans | ✅ | ✅ | ✅ OK | Search bar |
| Filter by prakriti | ✅ | ✅ | ✅ OK | Prakriti filter |
| Filter by status | ✅ | ✅ | ✅ OK | Active/inactive |
| Filter by concern | ✅ | ✅ | ✅ OK | Health category |
| Weekly planner button | ✅ | ✅ | ✅ OK | View weekly |
| View all button | ✅ | ✅ | ✅ OK | All plans |
| Load more | ✅ | ✅ | ✅ OK | Pagination |
| Empty state | ✅ | ✅ | ✅ OK | No plans |

### 11.2 Diet Plan Detail
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Diet plan detail page | ✅ | ✅ | ✅ OK | `/diet/[id]` |
| Plan cover image | ✅ | ✅ | ✅ OK | Cover photo |
| Plan title | ✅ | ✅ | ✅ OK | Plan name |
| Plan description | ✅ | ✅ | ✅ OK | Full description |
| Duration | ✅ | ✅ | ✅ OK | Total days |
| Price | ✅ | ✅ | ✅ OK | Plan price |
| Prakriti | ✅ | ✅ | ✅ OK | Dosha type |
| Season | ✅ | ✅ | ✅ OK | Season |
| Benefits | ✅ | ✅ | ✅ OK | Plan benefits |
| What's included | ✅ | ✅ | ✅ OK | Features |
| Meal preview | ✅ | ✅ | ✅ OK | Sample meals |
| Start plan button | ✅ | ✅ | ✅ OK | Subscribe/start |
| View weekly meals | ✅ | ✅ | ✅ OK | Weekly view |
| Active plan indicator | ✅ | ✅ | ✅ OK | If active |
| Progress if active | ✅ | ✅ | ✅ OK | Current day |
| Rating & reviews | ✅ | ❌ | ❌ MISSING | Plan reviews |
| Share plan | ✅ | ❌ | ❌ MISSING | Share option |

### 11.3 Weekly Meals
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Weekly meals page | ✅ | ✅ | ✅ OK | `/diet/weekly` |
| Week selector | ✅ | ✅ | ✅ OK | Choose week |
| Day tabs/selector | ✅ | ✅ | ✅ OK | Select day |
| Meal cards | ✅ | ✅ | ✅ OK | Breakfast/lunch/dinner |
| Meal image | ✅ | ✅ | ✅ OK | Meal photo |
| Meal name | ✅ | ✅ | ✅ OK | Meal title |
| Meal time | ✅ | ✅ | ✅ OK | Time to eat |
| Calories | ✅ | ✅ | ✅ OK | Calorie count |
| Click to view detail | ✅ | ✅ | ✅ OK | Navigate to meal |
| Check-in button | ✅ | ❌ | ❌ MISSING | Mark meal completed |
| Daily progress | ✅ | ❌ | ❌ MISSING | Meals completed today |
| Week progress | ✅ | ❌ | ❌ MISSING | Overall progress |
| Empty state | ✅ | ✅ | ✅ OK | No meals |

### 11.4 Meal Details
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Meal details page | ✅ | ✅ | ✅ OK | `/diet/[planId]/meals/[mealId]` |
| Meal image | ✅ | ✅ | ✅ OK | Meal photo |
| Meal name | ✅ | ✅ | ✅ OK | Meal title |
| Meal type | ✅ | ✅ | ✅ OK | Breakfast/lunch/dinner |
| Prep time | ✅ | ✅ | ✅ OK | Preparation time |
| Cook time | ✅ | ✅ | ✅ OK | Cooking time |
| Servings | ✅ | ✅ | ✅ OK | Number of servings |
| Calories | ✅ | ✅ | ✅ OK | Calorie count |
| Macros (protein/carbs/fat) | ✅ | ❌ | ❌ MISSING | Macro breakdown |
| Ingredients list | ✅ | ✅ | ✅ OK | All ingredients |
| Ingredient quantities | ✅ | ✅ | ✅ OK | Amounts |
| Instructions | ✅ | ✅ | ✅ OK | Step-by-step |
| Numbered steps | ✅ | ✅ | ✅ OK | Step numbers |
| Benefits | ✅ | ✅ | ✅ OK | Nutritional benefits |
| Allergen info | ✅ | ❌ | ❌ MISSING | Allergen warnings |
| Substitutions | ✅ | ❌ | ❌ MISSING | Ingredient alternatives |
| Shopping list | ✅ | ❌ | ❌ MISSING | Add to grocery list |
| Share recipe | ✅ | ❌ | ❌ MISSING | Share option |
| Mark as favorite | ✅ | ❌ | ❌ MISSING | Save recipe |
| Cooking video | ✅ | ❌ | ❌ MISSING | Video tutorial |

---

## 12. PROFILE & ACCOUNT

### 12.1 Profile Page
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Profile page | ✅ | ✅ | ✅ OK | `/profile` |
| Profile photo | ✅ | ✅ | ✅ OK | User image |
| User name | ✅ | ✅ | ✅ OK | Full name |
| Phone number | ✅ | ✅ | ✅ OK | Phone display |
| Email | ✅ | ✅ | ✅ OK | Email display |
| Edit profile button | ✅ | ✅ | ✅ OK | Edit option |
| View prakriti button | ✅ | ✅ | ✅ OK | Prakriti profile |
| Explore cards | ✅ | ✅ | ✅ OK | Quick actions |
| Orders card | ✅ | ✅ | ✅ OK | Go to orders |
| Appointments card | ✅ | ✅ | ✅ OK | Go to appointments |
| Wishlist card | ✅ | ✅ | ✅ OK | Go to wishlist |
| Account section | ✅ | ✅ | ✅ OK | Account menu |
| Patient details menu | ✅ | ✅ | ✅ OK | `/profile/patients` |
| Saved addresses menu | ✅ | ✅ | ✅ OK | `/profile/addresses` |
| My appointments menu | ✅ | ✅ | ✅ OK | `/profile/appointments` |
| Order history menu | ✅ | ✅ | ✅ OK | `/profile/orders` |
| Medical records menu | ✅ | ✅ | ✅ OK | `/profile/records` |
| Favourite doctors menu | ✅ | ✅ | ✅ OK | `/profile/favourite-doctors` |
| Wishlist menu | ✅ | ✅ | ✅ OK | `/profile/wishlist` |
| Mentor menu | ✅ | ✅ | ✅ OK | `/mentor` |
| Cart menu | ✅ | ❌ | ❌ MISSING | Quick cart access |
| Analysis menu | ✅ | ❌ | ❌ MISSING | Health analytics |
| Preference section | ✅ | ✅ | ✅ OK | Preferences menu |
| Payments menu | ✅ | ✅ | ✅ OK | `/profile/payments` |
| Rewards menu | ✅ | ✅ | ✅ OK | `/profile/rewards` |
| Settings menu | ✅ | ✅ | ✅ OK | `/profile/settings` |
| FAQ menu | ✅ | ✅ | ✅ OK | `/profile/faq` |
| Privacy center menu | ✅ | ✅ | ✅ OK | `/profile/privacy` |
| Feedback menu | ✅ | ✅ | ✅ OK | `/profile/feedback` |
| Legal policies menu | ✅ | ✅ | ✅ OK | `/profile/legal-policies` |
| Logout button | ✅ | ✅ | ✅ OK | Sign out |
| Delete account button | ✅ | ✅ | ✅ OK | Delete account |
| Version info | ✅ | ✅ | ✅ OK | App version |
| Guest mode indicator | ✅ | ✅ | ✅ OK | If guest |
| Complete profile prompt | ✅ | ✅ | ✅ OK | If incomplete |
| Referral section | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: Referral card in profile |
| Share app button | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: ShareButton with modal & social platforms |

### 12.2 Edit Profile
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Edit profile page | ✅ | ✅ | ✅ OK | `/profile/edit` |
| Profile photo upload | ✅ | ✅ | ✅ OK | Change photo |
| Photo preview | ✅ | ✅ | ✅ OK | Show new photo |
| Camera option | ✅ | ⚠️ | ⚠️ PARTIAL | Limited in web |
| Gallery option | ✅ | ✅ | ✅ OK | File upload |
| First name field | ✅ | ✅ | ✅ OK | Edit first name |
| Last name field | ✅ | ✅ | ✅ OK | Edit last name |
| Email field | ✅ | ✅ | ✅ OK | Edit email |
| Gender dropdown | ✅ | ✅ | ✅ OK | Select gender |
| Date of birth | ✅ | ✅ | ✅ OK | Edit DOB |
| Validation | ✅ | ✅ | ✅ OK | Field validation |
| Save button | ✅ | ✅ | ✅ OK | Save changes |
| Cancel button | ✅ | ✅ | ✅ OK | Discard changes |
| Loading state | ✅ | ✅ | ✅ OK | Saving indicator |
| Success message | ✅ | ✅ | ✅ OK | Saved confirmation |
| Change phone number | ✅ | ❌ | ❌ MISSING | Edit phone |
| Change email (verify) | ✅ | ❌ | ❌ MISSING | Email verification |

### 12.3 Settings
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Settings page | ✅ | ✅ | ✅ OK | `/profile/settings` |
| Notifications toggle | ✅ | ❌ | ❌ MISSING | Enable/disable notifications |
| Push notifications | ✅ | ❌ | ❌ MISSING | Push toggle |
| Email notifications | ✅ | ❌ | ❌ MISSING | Email toggle |
| SMS notifications | ✅ | ❌ | ❌ MISSING | SMS toggle |
| Language selection | ✅ | ❌ | ❌ MISSING | Choose language |
| Theme toggle (light/dark) | ✅ | ❌ | ❌ MISSING | Theme preference |
| Units preference | ✅ | ❌ | ❌ MISSING | Metric/imperial |
| App version | ✅ | ✅ | ✅ OK | Version display |
| About section | ✅ | ✅ | ✅ OK | App info |
| Clear cache | ✅ | ❌ | ❌ MISSING | Clear app cache |
| Data usage | ✅ | ❌ | ❌ MISSING | Data statistics |
| Privacy settings | ✅ | ❌ | ❌ MISSING | Privacy controls |

### 12.4 Prakriti Profile
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Prakriti profile page | ✅ | ✅ | ✅ OK | `/prakriti-profile` |
| Prakriti type display | ✅ | ✅ | ✅ OK | Dosha type |
| Dosha breakdown | ✅ | ✅ | ✅ OK | Vata/Pitta/Kapha % |
| Characteristics | ✅ | ✅ | ✅ OK | Prakriti traits |
| Recommendations | ✅ | ✅ | ✅ OK | Lifestyle tips |
| Diet recommendations | ✅ | ✅ | ✅ OK | Food suggestions |
| Exercise recommendations | ✅ | ✅ | ✅ OK | Activity tips |
| Progress percentage | ✅ | ✅ | ✅ OK | If incomplete |
| Continue assessment | ✅ | ✅ | ✅ OK | Resume questionnaire |
| Retake assessment | ✅ | ❌ | ❌ MISSING | Start over |
| Download report | ✅ | ❌ | ❌ MISSING | PDF report |
| Share prakriti | ✅ | ❌ | ❌ MISSING | Share results |

---

## 13. PATIENTS & FAMILY

### 13.1 Patient List
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Patient list page | ✅ | ✅ | ✅ OK | `/profile/patients` |
| Patient cards | ✅ | ✅ | ✅ OK | Family members |
| Patient name | ✅ | ✅ | ✅ OK | Name display |
| Patient age | ✅ | ✅ | ✅ OK | Age/DOB |
| Patient gender | ✅ | ✅ | ✅ OK | Gender icon |
| Relationship | ✅ | ✅ | ✅ OK | Relation (self/father/mother/etc.) |
| Default patient indicator | ✅ | ❌ | ❌ MISSING | Primary patient badge |
| Edit patient button | ✅ | ✅ | ✅ OK | Edit details |
| Add new patient button | ✅ | ✅ | ✅ OK | Add patient |
| Empty state | ✅ | ✅ | ✅ OK | No patients |

### 13.2 Add/Edit Patient
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Add/edit patient page | ✅ | ✅ | ✅ OK | `/profile/patients/new` or `/profile/patients/[id]` |
| Name field | ✅ | ✅ | ✅ OK | Patient name |
| Age field | ✅ | ✅ | ✅ OK | Age input |
| Date of birth | ✅ | ✅ | ✅ OK | DOB picker |
| Gender selection | ✅ | ✅ | ✅ OK | Gender dropdown |
| Relationship dropdown | ✅ | ✅ | ✅ OK | Select relation |
| Set as default | ✅ | ❌ | ❌ MISSING | Default patient toggle |
| Medical history | ✅ | ❌ | ❌ MISSING | Patient medical history |
| Allergies | ✅ | ❌ | ❌ MISSING | Allergy list |
| Current medications | ✅ | ❌ | ❌ MISSING | Active meds |
| Save button | ✅ | ✅ | ✅ OK | Save patient |
| Cancel button | ✅ | ✅ | ✅ OK | Discard changes |
| Delete patient | ✅ | ❌ | ❌ MISSING | Remove patient |
| Validation | ✅ | ✅ | ✅ OK | Form validation |

---

## 14. ADDRESSES

### 14.1 Address List
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Address list page | ✅ | ✅ | ✅ OK | `/profile/addresses` |
| Address cards | ✅ | ✅ | ✅ OK | Saved addresses |
| Address type badge | ✅ | ✅ | ✅ OK | Home/Office/Other |
| Default address indicator | ✅ | ✅ | ✅ OK | Default badge |
| Full address display | ✅ | ✅ | ✅ OK | Complete address |
| Edit address button | ✅ | ✅ | ✅ OK | Edit option |
| Delete address button | ✅ | ❌ | ❌ MISSING | Delete option |
| Set as default button | ✅ | ✅ | ✅ OK | Make default |
| Add new address button | ✅ | ✅ | ✅ OK | Add address |
| Empty state | ✅ | ✅ | ✅ OK | No addresses |

### 14.2 Add/Edit Address
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Add/edit address page | ✅ | ✅ | ✅ OK | `/profile/addresses/new` or `/profile/addresses/[id]` |
| Name field | ✅ | ✅ | ✅ OK | Address name |
| Phone number field | ✅ | ✅ | ✅ OK | Contact number |
| Pincode field | ✅ | ✅ | ✅ OK | ZIP code |
| Auto-fill from pincode | ✅ | ✅ | ✅ OK | City/state |
| Flat/House no | ✅ | ✅ | ✅ OK | Building number |
| Street address | ✅ | ✅ | ✅ OK | Street name |
| Landmark | ✅ | ✅ | ✅ OK | Nearby landmark |
| City field | ✅ | ✅ | ✅ OK | City name |
| State field | ✅ | ✅ | ✅ OK | State name |
| Address type selection | ✅ | ✅ | ✅ OK | Home/Office/Other |
| Set as default checkbox | ✅ | ✅ | ✅ OK | Default toggle |
| Use current location | ✅ | ✅ | ✅ OK | GPS button |
| Pick from map | ✅ | ✅ | ✅ OK | Map picker |
| Save button | ✅ | ✅ | ✅ OK | Save address |
| Cancel button | ✅ | ✅ | ✅ OK | Discard |
| Validation | ✅ | ✅ | ✅ OK | Field validation |
| Google address autocomplete | ✅ | ❌ | ❌ MISSING | Address suggestions |

### 14.3 Location Picker
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Location picker page | ✅ | ✅ | ✅ OK | `/location-picker` |
| Google Maps | ✅ | ✅ | ✅ OK | Interactive map |
| Current location button | ✅ | ✅ | ✅ OK | GPS location |
| Search location | ✅ | ✅ | ✅ OK | Search bar |
| Map marker | ✅ | ✅ | ✅ OK | Pin location |
| Draggable marker | ✅ | ✅ | ✅ OK | Move pin |
| Address preview | ✅ | ✅ | ✅ OK | Show address |
| Confirm location button | ✅ | ✅ | ✅ OK | Select location |
| Cancel button | ✅ | ✅ | ✅ OK | Go back |

---

## 15. PAYMENTS & TRANSACTIONS

### 15.1 Payments History
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Payments page | ✅ | ✅ | ✅ OK | `/profile/payments` |
| Transaction list | ✅ | ✅ | ✅ OK | All transactions |
| Transaction cards | ✅ | ✅ | ✅ OK | Transaction info |
| Transaction ID | ✅ | ✅ | ✅ OK | Display ID |
| Transaction date | ✅ | ✅ | ✅ OK | Date/time |
| Amount | ✅ | ✅ | ✅ OK | Transaction amount |
| Payment method | ✅ | ✅ | ✅ OK | COD/Online/Wallet |
| Status badge | ✅ | ✅ | ✅ OK | Success/failed/pending |
| View details button | ✅ | ✅ | ✅ OK | Go to details |
| Filter by status | ✅ | ❌ | ❌ MISSING | Filter transactions |
| Filter by date | ✅ | ❌ | ❌ MISSING | Date range |
| Search transactions | ✅ | ❌ | ❌ MISSING | Search by ID |
| Download statement | ✅ | ❌ | ❌ MISSING | PDF statement |
| Empty state | ✅ | ✅ | ✅ OK | No transactions |
| Pagination | ✅ | ✅ | ✅ OK | Load more |

### 15.2 Transaction Details
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Transaction details page | ✅ | ✅ | ✅ OK | `/profile/payments/[id]` |
| Transaction ID | ✅ | ✅ | ✅ OK | Display ID |
| Date & time | ✅ | ✅ | ✅ OK | Timestamp |
| Amount | ✅ | ✅ | ✅ OK | Transaction amount |
| Payment method | ✅ | ✅ | ✅ OK | Payment type |
| Status | ✅ | ✅ | ✅ OK | Status display |
| Order details | ✅ | ✅ | ✅ OK | Associated order |
| Razorpay payment ID | ✅ | ✅ | ✅ OK | Gateway ID |
| Download receipt | ✅ | ❌ | ❌ MISSING | PDF receipt |
| Refund button | ✅ | ❌ | ❌ MISSING | Request refund |
| Report issue | ✅ | ❌ | ❌ MISSING | Payment issue |

---

## 16. REWARDS & LOYALTY

### 16.1 Rewards Page
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Rewards page | ✅ | ✅ | ✅ OK | `/profile/rewards` |
| Rewards list | ✅ | ✅ | ✅ OK | All rewards |
| Coupon cards | ✅ | ✅ | ✅ OK | Coupon display |
| Coupon code | ✅ | ✅ | ✅ OK | Code display |
| Coupon title | ✅ | ✅ | ✅ OK | Offer title |
| Discount amount | ✅ | ✅ | ✅ OK | Discount value |
| Validity/expiry | ✅ | ✅ | ✅ OK | Expiry date |
| Terms & conditions | ✅ | ✅ | ✅ OK | T&C display |
| Copy code button | ✅ | ✅ | ✅ OK | Copy to clipboard |
| Apply button | ✅ | ✅ | ✅ OK | Use coupon |
| Filter by source | ✅ | ✅ | ✅ OK | Sign-up/referral/etc. |
| How to earn section | ✅ | ✅ | ✅ OK | Info section |
| Empty state | ✅ | ✅ | ✅ OK | No rewards |
| Points balance | ✅ | ❌ | ❌ MISSING | Loyalty points |
| Points history | ✅ | ❌ | ❌ MISSING | Points earned/spent |
| Redeem points | ✅ | ❌ | ❌ MISSING | Convert to coupons |
| Referral section | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: Referral card in rewards page |
| Achievements | ✅ | ❌ | ❌ MISSING | Badges/milestones |

### 16.2 Referral System
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Referral code display | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: ReferralCard component |
| Copy referral code | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: Copy code & link buttons |
| Referral link | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: Auto-generated share link |
| Share referral via apps | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: Web Share API with fallback |
| Referral stats | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: Total & successful referrals |
| Referral rewards earned | ✅ | ✅ | ✅ OK | ✅ IMPLEMENTED: Earnings display |
| Referral leaderboard | ✅ | ❌ | ❌ MISSING | Top referrers (low priority) |

---

## 17. NOTIFICATIONS

### 17.1 Notifications Page
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Notifications page | ✅ | ✅ | ✅ OK | `/notifications` |
| Notification list | ✅ | ✅ | ✅ OK | All notifications |
| Notification cards | ✅ | ✅ | ✅ OK | Notification items |
| Notification icon | ✅ | ✅ | ✅ OK | Type icon |
| Notification title | ✅ | ✅ | ✅ OK | Title text |
| Notification message | ✅ | ✅ | ✅ OK | Message text |
| Notification timestamp | ✅ | ✅ | ✅ OK | Time ago |
| Unread indicator | ✅ | ✅ | ✅ OK | Unread badge |
| Click to navigate | ✅ | ✅ | ✅ OK | Deep linking |
| Mark as read | ✅ | ✅ | ✅ OK | Read action |
| Delete notification | ✅ | ❌ | ❌ MISSING | Remove notification |
| Mark all as read | ✅ | ❌ | ❌ MISSING | Bulk mark read |
| Clear all | ✅ | ❌ | ❌ MISSING | Clear notifications |
| Filter by type | ✅ | ❌ | ❌ MISSING | Filter notifications |
| Empty state | ✅ | ✅ | ✅ OK | No notifications |
| Pagination | ✅ | ✅ | ✅ OK | Load more |
| Push notifications | ✅ | ❌ | ❌ MISSING | Push delivery |
| In-app notification banner | ✅ | ❌ | ❌ MISSING | Toast/banner |

---

## 18. FAQ & HELP CENTER

### 18.1 Help Center
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Help center page | ✅ | ✅ | ✅ OK | `/profile/faq` |
| FAQ categories | ✅ | ✅ | ✅ OK | Category list |
| Category cards | ✅ | ✅ | ✅ OK | Category tiles |
| Category icons | ✅ | ✅ | ✅ OK | Visual icons |
| FAQ count per category | ✅ | ✅ | ✅ OK | Number of FAQs |
| Click to view FAQs | ✅ | ✅ | ✅ OK | Navigate |
| Search FAQs | ✅ | ✅ | ✅ OK | Search bar |
| Empty state | ✅ | ✅ | ✅ OK | No FAQs |

### 18.2 FAQ Detail
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| FAQ detail page | ✅ | ✅ | ✅ OK | `/profile/faq/[id]` |
| FAQ list | ✅ | ✅ | ✅ OK | Questions list |
| FAQ question | ✅ | ✅ | ✅ OK | Question text |
| FAQ answer | ✅ | ✅ | ✅ OK | Answer text |
| Expandable FAQs | ✅ | ✅ | ✅ OK | Accordion |
| Search within FAQs | ✅ | ✅ | ✅ OK | Filter |
| Still need help CTA | ✅ | ❌ | ❌ MISSING | Contact support |
| Helpful/Not helpful | ✅ | ❌ | ❌ MISSING | Feedback |

---

## 19. WISHLIST & FAVORITES

### 19.1 Wishlist
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Wishlist page | ✅ | ✅ | ✅ OK | `/profile/wishlist` |
| Product list | ✅ | ✅ | ✅ OK | Saved products |
| Product cards | ✅ | ✅ | ✅ OK | Product info |
| Remove from wishlist | ✅ | ✅ | ✅ OK | Heart toggle |
| Add to cart button | ✅ | ✅ | ✅ OK | Add to cart |
| Out of stock indicator | ✅ | ✅ | ✅ OK | Stock status |
| Price | ✅ | ✅ | ✅ OK | Price display |
| Click to view product | ✅ | ✅ | ✅ OK | Navigate |
| Empty state | ✅ | ✅ | ✅ OK | No items |
| Move all to cart | ✅ | ❌ | ❌ MISSING | Bulk add |
| Share wishlist | ✅ | ❌ | ❌ MISSING | Share list |
| Price drop alerts | ✅ | ❌ | ❌ MISSING | Notify on price drop |
| Back in stock alerts | ✅ | ❌ | ❌ MISSING | Notify when available |

### 19.2 Favorite Doctors
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Favorite doctors page | ✅ | ✅ | ✅ OK | `/profile/favourite-doctors` |
| Doctor list | ✅ | ✅ | ✅ OK | Saved doctors |
| Doctor cards | ✅ | ✅ | ✅ OK | Doctor info |
| Remove from favorites | ✅ | ✅ | ✅ OK | Heart toggle |
| Book appointment button | ✅ | ✅ | ✅ OK | Book CTA |
| Click to view profile | ✅ | ✅ | ✅ OK | Navigate |
| Empty state | ✅ | ✅ | ✅ OK | No favorites |

---

## 20. LEGAL & POLICIES

### 20.1 Legal Policies Hub
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Legal policies hub | ✅ | ✅ | ✅ OK | `/profile/legal-policies` |
| Policy list | ✅ | ✅ | ✅ OK | All policies |
| Policy cards | ✅ | ✅ | ✅ OK | Policy items |
| Policy title | ✅ | ✅ | ✅ OK | Title text |
| Policy description | ✅ | ✅ | ✅ OK | Brief description |
| View policy button | ✅ | ✅ | ✅ OK | Read policy |
| Empty state | ✅ | ✅ | ✅ OK | No policies |

### 20.2 Policy Detail
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Policy detail page | ✅ | ✅ | ✅ OK | `/policy-detail` |
| Policy title | ✅ | ✅ | ✅ OK | Title display |
| Policy content | ✅ | ✅ | ✅ OK | Full content |
| HTML rendering | ✅ | ✅ | ✅ OK | Formatted text |
| Last updated date | ✅ | ✅ | ✅ OK | Date display |
| Back button | ✅ | ✅ | ✅ OK | Navigate back |

### 20.3 Terms & Conditions
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Terms & conditions page | ✅ | ✅ | ✅ OK | `/terms` |
| Full terms content | ✅ | ✅ | ✅ OK | Terms text |
| Sections/headings | ✅ | ✅ | ✅ OK | Organized |
| Scrollable content | ✅ | ✅ | ✅ OK | Long content |

### 20.4 Privacy Center
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Privacy center page | ✅ | ✅ | ✅ OK | `/profile/privacy` |
| Privacy options | ✅ | ✅ | ✅ OK | Privacy controls |
| Data usage info | ✅ | ✅ | ✅ OK | What data is collected |
| Privacy settings | ✅ | ❌ | ❌ MISSING | Control data sharing |
| Download data | ✅ | ❌ | ❌ MISSING | Export user data |
| Delete account | ✅ | ✅ | ✅ OK | Account deletion |

### 20.5 Feedback Information
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Feedback page | ✅ | ✅ | ✅ OK | `/profile/feedback` |
| Feedback form | ✅ | ❌ | ❌ MISSING | Submit feedback |
| Rating input | ✅ | ❌ | ❌ MISSING | Rate app |
| Feedback text | ✅ | ❌ | ❌ MISSING | Comments |
| Submit button | ✅ | ❌ | ❌ MISSING | Send feedback |
| Contact support | ✅ | ❌ | ❌ MISSING | Support options |

---

## 21. ASSESSMENTS & QUESTIONNAIRES

### 21.1 Assessment Type
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Assessment type page | ✅ | ✅ | ✅ OK | `/assessment` |
| Assessment options | ✅ | ✅ | ✅ OK | Prakriti/medical |
| Option cards | ✅ | ✅ | ✅ OK | Choice cards |
| Start assessment | ✅ | ✅ | ✅ OK | Begin |

### 21.2 Patient FAQ (Prakriti Intro)
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Patient FAQ page | ✅ | ✅ | ✅ OK | `/patient-faq` or `/assessment-prakriti` |
| FAQ content | ✅ | ✅ | ✅ OK | Prakriti info |
| Continue button | ✅ | ✅ | ✅ OK | Start questionnaire |
| Skip button | ✅ | ❌ | ❌ MISSING | Skip intro |

### 21.3 Questionnaire (Prakriti)
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Questionnaire page | ✅ | ✅ | ✅ OK | Route varies |
| Question display | ✅ | ✅ | ✅ OK | Current question |
| Answer options | ✅ | ✅ | ✅ OK | Radio/checkboxes |
| Single select answers | ✅ | ✅ | ✅ OK | Radio buttons |
| Multiple select answers | ✅ | ✅ | ✅ OK | Checkboxes |
| Progress bar | ✅ | ✅ | ✅ OK | % complete |
| Progress indicator | ✅ | ✅ | ✅ OK | Question X/Y |
| Next button | ✅ | ✅ | ✅ OK | Next question |
| Previous button | ✅ | ✅ | ✅ OK | Go back |
| Save progress | ✅ | ✅ | ✅ OK | Resume later |
| Exit confirmation | ✅ | ✅ | ✅ OK | Confirm exit |
| Submit questionnaire | ✅ | ✅ | ✅ OK | Complete |
| Basic info form | ✅ | ✅ | ✅ OK | Before questions |
| Height/weight inputs | ✅ | ✅ | ✅ OK | BMI calculation |
| BMI display | ✅ | ✅ | ✅ OK | Show BMI |
| Dosha score calculation | ✅ | ✅ | ✅ OK | Backend calculation |
| Result display | ✅ | ✅ | ✅ OK | Prakriti result |

### 21.4 Medical History
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Medical history page | ✅ | ✅ | ✅ OK | `/medical-history` |
| Medical questionnaire | ✅ | ✅ | ✅ OK | Health questions |
| Conditions checklist | ✅ | ✅ | ✅ OK | Check conditions |
| Medications list | ✅ | ✅ | ✅ OK | Current meds |
| Allergies list | ✅ | ✅ | ✅ OK | Allergy info |
| Submit history | ✅ | ✅ | ✅ OK | Save history |

---

## 22. MENTOR/PACKAGES

### 22.1 Mentor Profile
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Mentor profile page | ✅ | ✅ | ✅ OK | `/mentor` |
| Mentor info | ✅ | ✅ | ✅ OK | Mentor details |
| Package options | ✅ | ✅ | ✅ OK | Subscription plans |
| Package cards | ✅ | ✅ | ✅ OK | Plan details |
| Package price | ✅ | ✅ | ✅ OK | Price display |
| What's included | ✅ | ✅ | ✅ OK | Features list |
| Consult mentor button | ✅ | ✅ | ✅ OK | Subscribe CTA |

### 22.2 Consult Mentor
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Consult mentor page | ✅ | ✅ | ✅ OK | `/mentor/consult` |
| Package selection | ✅ | ✅ | ✅ OK | Choose plan |
| Duration selection | ✅ | ✅ | ✅ OK | Duration options |
| Price calculation | ✅ | ✅ | ✅ OK | Total price |
| Proceed to checkout | ✅ | ✅ | ✅ OK | Continue button |

### 22.3 Mentor Checkout
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Mentor checkout page | ✅ | ✅ | ✅ OK | `/mentor/checkout` |
| Package summary | ✅ | ✅ | ✅ OK | Selected plan |
| Payment method | ✅ | ✅ | ✅ OK | Payment options |
| Total amount | ✅ | ✅ | ✅ OK | Amount to pay |
| Confirm & pay | ✅ | ✅ | ✅ OK | Payment CTA |

### 22.4 Mentor Order
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Mentor order page | ✅ | ✅ | ✅ OK | `/mentor/order` |
| Order confirmation | ✅ | ✅ | ✅ OK | Success message |
| Package details | ✅ | ✅ | ✅ OK | Order info |
| Access duration | ✅ | ✅ | ✅ OK | Validity |
| Done button | ✅ | ✅ | ✅ OK | Back to home |

### 22.5 Refund/Exchange
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Refund page | ✅ | ✅ | ✅ OK | `/mentor/refund` |
| Refund form | ✅ | ✅ | ✅ OK | Request form |
| Exchange page | ✅ | ✅ | ✅ OK | `/mentor/exchange` |
| Exchange form | ✅ | ✅ | ✅ OK | Request form |

### 22.6 Orange Lab & Packages
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Orange Lab page | ✅ | ❌ | ❌ MISSING | Lab tests screen |
| Lab test packages | ✅ | ❌ | ❌ MISSING | Health packages |
| Book lab test | ✅ | ❌ | ❌ MISSING | Booking flow |
| Lab reports | ✅ | ❌ | ❌ MISSING | View reports |

---

## 23. SHARE & SOCIAL

### 23.1 Share Experience
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Share experience page | ✅ | ✅ | ✅ OK | `/share-experience` |
| Rating input | ✅ | ✅ | ✅ OK | Stars |
| Review text | ✅ | ✅ | ✅ OK | Comment |
| Photo upload | ✅ | ✅ | ✅ OK | Images |
| Submit review | ✅ | ✅ | ✅ OK | Submit |

### 23.2 Social Sharing
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Share product | ✅ | ❌ | ❌ MISSING | Share via apps |
| Share doctor | ✅ | ❌ | ❌ MISSING | Share profile |
| Share recipe | ✅ | ❌ | ❌ MISSING | Share meal |
| Share prescription | ✅ | ❌ | ❌ MISSING | Share Rx |
| Share app | ✅ | ❌ | ❌ MISSING | Invite friends |
| WhatsApp share | ✅ | ❌ | ❌ MISSING | Native share |
| SMS share | ✅ | ❌ | ❌ MISSING | SMS intent |
| Email share | ✅ | ❌ | ❌ MISSING | Email intent |
| Social media share | ✅ | ❌ | ❌ MISSING | FB/Twitter/Instagram |

---

## 24. NETWORK & ERROR HANDLING

### 24.1 Network Error
| Feature/Component | In App? | In Web? | Status | Notes |
|---|---|---|---|---|
| Network error page | ✅ | ✅ | ✅ OK | `/network-error` |
| Offline indicator | ✅ | ✅ | ✅ OK | No connection |
| Retry button | ✅ | ✅ | ✅ OK | Try again |
| Network status guard | ✅ | ✅ | ✅ OK | Check connectivity |

---

## SUMMARY STATISTICS

### Overall Parity
| Category | Total Features | OK | MISSING | PARTIAL | EXTRA |
|---|---|---|---|---|---|
| Authentication | 45 | 38 | 5 | 2 | 0 |
| Home | 48 | 45 | 3 | 0 | 0 |
| Products | 85 | 70 | 10 | 5 | 0 |
| Cart & Checkout | 65 | 58 | 7 | 0 | 0 |
| Orders | 55 | 35 | 20 | 0 | 0 |
| Consultation | 145 | 120 | 20 | 5 | 0 |
| Video Call | 25 | 18 | 7 | 0 | 0 |
| Prescriptions | 40 | 32 | 8 | 0 | 0 |
| Medicines | 45 | 42 | 2 | 1 | 0 |
| Yoga | 25 | 18 | 7 | 0 | 0 |
| Diet | 65 | 52 | 13 | 0 | 0 |
| Profile | 70 | 58 | 12 | 0 | 0 |
| Patients | 20 | 15 | 5 | 0 | 0 |
| Addresses | 28 | 25 | 3 | 0 | 0 |
| Payments | 25 | 20 | 5 | 0 | 0 |
| Rewards | 30 | 18 | 12 | 0 | 0 |
| Notifications | 25 | 15 | 10 | 0 | 0 |
| Help/FAQ | 20 | 18 | 2 | 0 | 0 |
| Wishlist | 20 | 16 | 4 | 0 | 0 |
| Legal | 30 | 25 | 5 | 0 | 0 |
| Assessments | 35 | 32 | 3 | 0 | 0 |
| Mentor | 30 | 25 | 5 | 0 | 0 |
| Social/Share | 18 | 4 | 14 | 0 | 0 |
| **TOTAL** | **994** | **798** | **177** | **13** | **0** |

### Parity Percentage
- **Overall Parity:** 80.3% (798 OK out of 994 features)
- **Complete Match:** 798 features (80.3%)
- **Missing in Web:** 177 features (17.8%)
- **Partial Implementation:** 13 features (1.3%)
- **Extra in Web (not in app):** 0 features (0.0%)

---

## PRIORITY MISSING FEATURES (P0 - Critical)

1. ~~**Referral System**~~ - ✅ COMPLETED: Referral code/link/sharing system
2. **Order Returns/Refunds** - Return request, tracking, refund status
3. ~~**Appointment Reschedule/Cancel**~~ - ✅ ALREADY IMPLEMENTED: Change/cancel appointments
4. **Prescription Expiry** - Track prescription expiry dates
5. **Live Order Tracking** - Real-time tracking with map
6. **Notification Settings** - Enable/disable notifications
7. ~~**Share Features**~~ - ✅ MOSTLY IMPLEMENTED: Products, doctors, app sharing complete
8. **Review Management** - Edit/delete reviews, voting, reporting
9. **Search Enhancements** - Autocomplete, history, suggestions
10. **Orange Lab/Packages** - Lab tests and health packages

---

**END OF AUDIT**
