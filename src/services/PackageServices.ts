import { apiClient } from './APIconfig';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type PackageButtonAction = 'book_consultation' | 'purchase_package';
export type PackagePurchaseType = 'open_plan' | 'prepaid_package';

/** GET packages/plans/ → results[] */
export type PackagePlan = {
  id: string;
  name: string;
  description: string;
  category_code: string;
  category_name: string;
  image_url: string;
  purchase_type: PackagePurchaseType;
  button_action: PackageButtonAction;
  can_be_purchased: boolean;
  available_to_all_users: boolean;
  original_price: string;
  selling_price: string;
  validity_days: number | null;
  billing_mode: string;
  billing_period: string | null;
  billing_interval: number | null;
  billing_cycle_count: number | null;
  benefits: { includes: string[] };
};

/** packages/purchase/ and packages/my/ → purchase record */
export type PackagePurchase = {
  id: string;
  package: string;
  package_name_snapshot: string;
  package_snapshot: {
    id: string;
    name: string;
    description: string;
    category_name: string;
    validity_days: number | null;
    image_url: string;
    tags?: string[];
  };
  benefits_snapshot: { includes: string[] };
  original_price: string;
  paid_price: string;
  currency: string;
  billing_mode: string;
  status: string;
  patient_id: string | null;
  starts_at: string | null;
  expires_at: string | null;
  paid_at: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_subscription_id: string | null;
  created_at: string;
};

/** GET packages/my/ → data[] */
export type MyPlanBenefit = {
  label: string;
  role: string;
  status: string;
  quantity_total: number | null;
  quantity_remaining: number | null;
};

export type MyPlan = {
  id: string;
  package_id: string;
  name: string;
  status: string;
  billing_mode: string;
  autopay_status: string;
  cancel_at_period_end: boolean;
  original_price: string;
  paid_price: string;
  currency: string;
  starts_at: string | null;
  expires_at: string | null;
  benefits: MyPlanBenefit[];
};

export type PackageCheckout = {
  type: 'order' | 'subscription';
  razorpay_order_id: string | null;
  razorpay_subscription_id: string | null;
};

export type PurchasePackagePayload = {
  package_id: string;
  patient_id?: string | null;
};

export type VerifyPackagePaymentPayload = {
  purchase_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type MyPackagesQuery = {
  status?: string;
  search?: string;
  page?: number;
  id?: string;
  /** Confirm Booking only — plans usable with this doctor. Profile → My Plans omits it. */
  doctor_id?: string;
};

/* -------------------------------------------------------------------------- */
/*                                    APIs                                    */
/* -------------------------------------------------------------------------- */

/** GET packages/plans/?page=1 */
export const getPackagePlans = async (page: number = 1) => {
  try {
    const url = `packages/plans/?page=${page}`;
    console.log('PACKAGE_PLANS_URL =>', url);

    const response = await apiClient(url, {
      method: 'GET',
    });

    console.log('PACKAGE_PLANS_RESPONSE =>', JSON.stringify(response));
    return response;
  } catch (error) {
    console.log('PACKAGE_PLANS_ERROR =>', error);
    throw error;
  }
};

/** POST packages/purchase/  { package_id, patient_id? } */
export const purchasePackage = async (payload: PurchasePackagePayload) => {
  try {
    const body: PurchasePackagePayload = { package_id: payload.package_id };
    if (payload.patient_id) {
      body.patient_id = payload.patient_id;
    }
    console.log('PACKAGE_PURCHASE_PAYLOAD =>', body);

    const response = await apiClient('packages/purchase/', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    console.log('PACKAGE_PURCHASE_RESPONSE =>', JSON.stringify(response));
    return response;
  } catch (error) {
    console.log('PACKAGE_PURCHASE_ERROR =>', error);
    throw error;
  }
};

/** POST packages/verify-payment/  { purchase_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } */
export const verifyPackagePayment = async (payload: VerifyPackagePaymentPayload) => {
  try {
    const body = {
      purchase_id: payload.purchase_id,
      razorpay_order_id: payload.razorpay_order_id,
      razorpay_payment_id: payload.razorpay_payment_id,
      razorpay_signature: payload.razorpay_signature,
    };
    console.log('PACKAGE_VERIFY_PAYLOAD =>', body);

    const response = await apiClient('packages/verify-payment/', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    console.log('PACKAGE_VERIFY_RESPONSE =>', JSON.stringify(response));
    return response;
  } catch (error) {
    console.log('PACKAGE_VERIFY_ERROR =>', error);
    throw error;
  }
};

/** GET packages/my/?status=active&search=&page=1&id=&doctor_id= */
export const getMyPackages = async (params: MyPackagesQuery = {}) => {
  try {
    let url = `packages/my/?page=${params.page ?? 1}`;
    if (params.status) url += `&status=${encodeURIComponent(params.status)}`;
    if (params.search) url += `&search=${encodeURIComponent(params.search)}`;
    if (params.id) url += `&id=${encodeURIComponent(params.id)}`;
    if (params.doctor_id) url += `&doctor_id=${encodeURIComponent(params.doctor_id)}`;


    const response = await apiClient(url, {
      method: 'GET',
    });

    console.log('MY_PACKAGES_RESPONSE =>', JSON.stringify(response));
    return response;
  } catch (error) {
    console.log('MY_PACKAGES_ERROR =>', error);
    throw error;
  }
};
