import { showSuccessToast } from '../config/Key';
import { showPrescriptionModal } from '../services/prescriptionModalService';

/**
 * API flag on product / variant list responses.
 * true → medicine needs a doctor prescription; block self-serve add to cart.
 */
export const isPrescriptionRequired = (item: any): boolean => {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const raw =
    item.prescription_required ??
    item.variant?.prescription_required ??
    item.product?.prescription_required;

  return raw === true || raw === 1 || raw === '1' || raw === 'true';
};

const PRESCRIPTION_MSG =
  'This medicine needs a valid prescription before it can be added to cart.';

const resolveVariantId = (item: any): string | undefined => {
  const id = String(
    item?.variant_id ??
      item?.variant?.variant_id ??
      item?.variant?.id ??
      item?.id ??
      '',
  ).trim();
  return id || undefined;
};

const resolveProductName = (item: any): string | undefined => {
  const name = String(
    item?.name ||
      item?.product_name ||
      item?.title ||
      item?.variant?.name ||
      item?.product?.name ||
      '',
  ).trim();
  return name || undefined;
};

/** Custom modal (Consult / Upload Rx) or toast for prescription-gated products */
export const showPrescriptionRequiredMessage = (options?: {
  useAlert?: boolean;
  message?: string;
  item?: any;
  variantId?: string;
  productName?: string;
}) => {
  const message = options?.message || PRESCRIPTION_MSG;
  if (options?.useAlert !== false) {
    showPrescriptionModal({
      message,
      variantId:
        options?.variantId ||
        (options?.item ? resolveVariantId(options.item) : undefined),
      productName:
        options?.productName ||
        (options?.item ? resolveProductName(options.item) : undefined),
    });
    return;
  }
  showSuccessToast(message, 'error');
};

/**
 * Returns false when add should be blocked (prescription required).
 * Call before add-to-cart / first quantity bump from product lists.
 */
export const canAddProductWithoutPrescription = (
  item: any,
  options?: { useAlert?: boolean; message?: string },
): boolean => {
  if (!isPrescriptionRequired(item)) {
    return true;
  }
  showPrescriptionRequiredMessage({
    ...options,
    item,
  });
  return false;
};
