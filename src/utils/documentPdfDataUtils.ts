import type { PdfAddressBlock } from './documentPdfLayout';

const pick = (...values: any[]) => {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
};

const joinAddress = (address: any): string => {
  if (!address || typeof address !== 'object') {
    return typeof address === 'string' ? address.trim() : '';
  }
  return [
    address.address_line_1,
    address.address_line_2,
    address.line1,
    address.line2,
    address.street,
    address.city,
    address.state,
    address.zipcode,
    address.pincode,
    address.postal_code,
    address.country,
  ]
    .map(v => (v != null ? String(v).trim() : ''))
    .filter(Boolean)
    .join(', ');
};

/** Same seller block as order invoice PDF (used when API omits wellness fields). */
export const INVOICE_SELLER_FALLBACK = {
  wellness_name: 'Tru Indya Wellness Private Limited',
  company_name: 'Tru Indya Wellness Private Limited',
  seller_address:
    '3rd Floor, Tower 3A, DLF Corporate Greens, Sector 74A, Narsinghpur, Gurugram, Haryana - 122004, India',
  seller_phone: '+91 72678 72000',
  gstin: '',
  company_email: 'info@ayurmuni.in',
};

export const mergeWithInvoiceSellerDefaults = (source: any) => {
  const fallbackWellness = {
    name: INVOICE_SELLER_FALLBACK.wellness_name,
    company_name: INVOICE_SELLER_FALLBACK.company_name,
    address: INVOICE_SELLER_FALLBACK.seller_address,
    phone: INVOICE_SELLER_FALLBACK.seller_phone,
    gstin: INVOICE_SELLER_FALLBACK.gstin,
    email: INVOICE_SELLER_FALLBACK.company_email,
  };

  return {
    ...INVOICE_SELLER_FALLBACK,
    ...source,
    wellness:
      source?.wellness ??
      source?.wellness_info ??
      source?.seller ??
      fallbackWellness,
  };
};

/** Seller / wellness block — mirrors order invoice PDF fields when present in API. */
export const buildWellnessFromBlock = (source: any): PdfAddressBlock => {
  const merged = mergeWithInvoiceSellerDefaults(source);
  const wellness =
    merged.wellness ??
    merged.wellness_info ??
    merged.seller ??
    merged.vendor ??
    merged.company ??
    merged.clinic ??
    {};

  const name = pick(
    wellness?.name,
    wellness?.company_name,
    wellness?.wellness_name,
    wellness?.business_name,
    merged?.wellness_name,
    merged?.company_name,
    merged?.seller_name,
    merged?.vendor_name,
    INVOICE_SELLER_FALLBACK.wellness_name,
  );

  const address = joinAddress(
    wellness?.address ??
      merged?.seller_address ??
      merged?.company_address ??
      wellness,
  );

  const phone = pick(
    wellness?.phone,
    wellness?.phone_number,
    wellness?.tel,
    merged?.seller_phone,
    merged?.company_phone,
    INVOICE_SELLER_FALLBACK.seller_phone,
  );

  const gstin = pick(
    wellness?.gstin,
    wellness?.gst_number,
    wellness?.gst_no,
    merged?.gstin,
    merged?.gst_number,
    INVOICE_SELLER_FALLBACK.gstin,
  );

  const email = pick(
    wellness?.email,
    merged?.seller_email,
    merged?.company_email,
    INVOICE_SELLER_FALLBACK.company_email,
  );

  const lines = [name];
  if (address) lines.push(address);
  if (phone) lines.push(`Tel: ${phone}`);
  if (gstin) lines.push(`GSTIN: ${gstin}`);
  if (email) lines.push(email);

  return {
    title: 'From',
    lines,
  };
};

export const buildBillToBlock = (source: any): PdfAddressBlock => {
  const patient =
    source?.patient ??
    source?.billing_address ??
    source?.customer ??
    source?.user ??
    {};

  const name = pick(
    source?.patient_name,
    patient?.patient_name,
    patient?.name,
    patient?.full_name,
    source?.customer_name,
    source?.billing_name,
  );

  const address = joinAddress(
    patient?.address ??
      patient?.billing_address ??
      source?.billing_address ??
      source?.patient_address,
  );

  const phone = pick(
    patient?.phone_number,
    patient?.phone,
    source?.patient_phone,
    source?.billing_phone,
  );

  const email = pick(patient?.email, source?.patient_email);

  const lines = [name || '-'];
  if (address) lines.push(address);
  if (phone) lines.push(`Phone: ${phone}`);
  if (email) lines.push(`Email: ${email}`);

  return { title: 'Bill To', lines };
};

export const buildShipToBlock = (source: any): PdfAddressBlock | null => {
  const ship =
    source?.ship_to ??
    source?.shipping_address ??
    source?.delivery_address ??
    null;

  const hospitalName = pick(
    source?.hospital_name,
    source?.clinic_name,
    source?.clinic?.name,
    ship?.name,
  );

  const address = joinAddress(
    ship ??
      source?.clinic_address ??
      source?.hospital_address,
  );

  const lines = [hospitalName, address].filter(Boolean);
  if (!lines.length) return null;

  return {
    title: ship?.title ? String(ship.title) : 'Ship To',
    lines,
  };
};
