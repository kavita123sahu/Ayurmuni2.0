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
    item.requires_prescription ??
    item.is_prescription_required ??
    item.variant?.prescription_required ??
    item.product?.prescription_required;

  return raw === true || raw === 1 || raw === '1' || raw === 'true';
};

const PRESCRIPTION_TITLE = 'Prescription required';
const PRESCRIPTION_MSG =
  'This medicine needs a doctor’s prescription. Please consult a doctor to get it prescribed before adding to cart.';

/** Toast + optional native alert for prescription-gated products */
export const showPrescriptionRequiredMessage = (options?: {
  useAlert?: boolean;
}) => {
  if (options?.useAlert !== false) {
    Alert.alert(PRESCRIPTION_TITLE, PRESCRIPTION_MSG, [
      { text: 'OK', style: 'default' },
    ]);
    return;
  }
  showSuccessToast(PRESCRIPTION_MSG, 'error');
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
