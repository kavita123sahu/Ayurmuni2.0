type PrescriptionModalOptions = {
  message?: string;
  variantId?: string | null;
  productName?: string | null;
};

type PrescriptionModalHandler = (options?: PrescriptionModalOptions) => void;

let showHandler: PrescriptionModalHandler | null = null;
let consultHandler: (() => void) | null = null;
let uploadHandler: ((options?: PrescriptionModalOptions) => void) | null = null;

export const registerPrescriptionModal = (
  show: PrescriptionModalHandler,
  onConsult: () => void,
  onUpload?: (options?: PrescriptionModalOptions) => void,
) => {
  showHandler = show;
  consultHandler = onConsult;
  uploadHandler = onUpload || null;
};

export const unregisterPrescriptionModal = () => {
  showHandler = null;
  consultHandler = null;
  uploadHandler = null;
};

export const showPrescriptionModal = (options?: PrescriptionModalOptions) => {
  showHandler?.(options);
};

export const navigatePrescriptionConsult = () => {
  consultHandler?.();
};

export const navigatePrescriptionUpload = (
  options?: PrescriptionModalOptions,
) => {
  uploadHandler?.(options);
};
