import { Alert } from 'react-native';
import { showSuccessToast } from '../config/Key';

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

const PRESCRIPTION_TITLE = 'Prescription required';
const PRESCRIPTION_MSG =
  'You cannot increase the quantity or add this medicine to cart without a doctor’s prescription.';

/** Toast + optional native alert for prescription-gated products */
export const showPrescriptionRequiredMessage = (options?: {
  useAlert?: boolean;
  message?: string;
}) => {
  const message = options?.message || PRESCRIPTION_MSG;
  if (options?.useAlert !== false) {
    Alert.alert(PRESCRIPTION_TITLE, message, [
      { text: 'OK', style: 'default' },
    ]);
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
  options?: { useAlert?: boolean },
): boolean => {
  if (!isPrescriptionRequired(item)) {
    return true;
  }
  showPrescriptionRequiredMessage(options);
  return false;
};
