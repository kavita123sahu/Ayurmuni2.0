import { Utils } from '../common/Utils';
import { getPatientList } from './PatientServices';

export type CustomerDetails = {
  id: string | null;
  name: string;
  email: string;
  phone: string;
};

export type PatientDetails = {
  id: string;
  name: string;
  phone: string;
};

/** Values passed to Razorpay `prefill` (name / email / contact). */
export type RazorpayPrefill = {
  name: string;
  email: string;
  contact: string;
};

export type PayerDetails = {
  customer: CustomerDetails;
  patient: PatientDetails | null;
  prefill: RazorpayPrefill;
};

const DEFAULT_NAME = 'AyurMuni Customer';
const DEFAULT_EMAIL = 'customer@ayurmuni.com';
const DEFAULT_CONTACT = '919999999999';

const digitsOnly = (value: unknown) => String(value ?? '').replace(/\D/g, '');

const fullName = (first?: string, last?: string, fallback?: string) =>
  `${first ?? ''} ${last ?? ''}`.trim() || String(fallback ?? '').trim();

/** Razorpay contact → `91XXXXXXXXXX`. */
export const toRazorpayContact = (phone: string) => {
  const digits = digitsOnly(phone);
  return digits.length >= 10 ? `91${digits.slice(-10)}` : DEFAULT_CONTACT;
};

/** Logged-in customer from the `_USER_INFO` cache. */
export const getCustomerDetails = async (): Promise<CustomerDetails> => {
  const user: any = (await Utils.getData('_USER_INFO')) || {};
  return {
    id: user?.id ? String(user.id) : null,
    name: fullName(user?.first_name, user?.last_name, user?.full_name),
    email: String(user?.email ?? '').trim(),
    phone: digitsOnly(user?.phone_number ?? user?.mobile),
  };
};

/** Active patient profile (`is_active_profile`) from `patients/`, or null. */
export const getActivePatientDetails = async (): Promise<PatientDetails | null> => {
  try {
    const res: any = await getPatientList();
    const list: any[] = res?.data?.results ?? [];
    const active = list.find(item => item?.is_active_profile);
    if (!active?.id) return null;
    return {
      id: String(active.id),
      name: fullName(active?.first_name, active?.last_name, active?.full_name ?? active?.name),
      phone: digitsOnly(active?.phone_number ?? active?.phone),
    };
  } catch {
    return null;
  }
};

/**
 * Customer + active patient + Razorpay prefill, shared by every payment flow.
 * Customer details win; patient details fill the gaps.
 */
export const getPayerDetails = async (): Promise<PayerDetails> => {
  const [customer, patient] = await Promise.all([
    getCustomerDetails(),
    getActivePatientDetails(),
  ]);

  return {
    customer,
    patient,
    prefill: {
      name: customer.name || patient?.name || DEFAULT_NAME,
      email: customer.email || DEFAULT_EMAIL,
      contact: toRazorpayContact(customer.phone || patient?.phone || ''),
    },
  };
};
