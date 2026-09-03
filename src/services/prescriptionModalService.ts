type PrescriptionModalOptions = {
  message?: string;
};

type PrescriptionModalHandler = (options?: PrescriptionModalOptions) => void;

let showHandler: PrescriptionModalHandler | null = null;
let consultHandler: (() => void) | null = null;

export const registerPrescriptionModal = (
  show: PrescriptionModalHandler,
  onConsult: () => void,
) => {
  showHandler = show;
  consultHandler = onConsult;
};

export const unregisterPrescriptionModal = () => {
  showHandler = null;
  consultHandler = null;
};

export const showPrescriptionModal = (options?: PrescriptionModalOptions) => {
  showHandler?.(options);
};

export const navigatePrescriptionConsult = () => {
  consultHandler?.();
};
