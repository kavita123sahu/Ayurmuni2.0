import { formatAppointmentTimeLabel } from './appointmentUtils';

/** True when Rx has medicine line-items. */
export const hasPrescriptionItems = (consultation?: any): boolean =>
  Array.isArray(consultation?.prescription?.items) &&
  consultation.prescription.items.length > 0;

/** True when consultation has any prescribed content (notes and/or medicines). */
export const hasPrescribedData = (consultation?: any): boolean => {
  const rx = consultation?.prescription;
  if (!rx || typeof rx !== 'object') return false;

  if (hasPrescriptionItems(consultation)) return true;

  const textFields = [
    rx.symptom_description,
    rx.history_of_past_illness,
    rx.allergies,
    rx.family_history,
    rx.clinical_notes,
    rx.diagnosis_advice,
    rx.diet_advice,
    rx.dietary_advice,
    rx.follow_up?.date,
    rx.follow_up?.reason,
  ];

  const hasText = textFields.some(
    value => typeof value === 'string' && value.trim().length > 0,
  );
  if (hasText) return true;

  const listFields = [
    rx.diet,
    rx.dos,
    rx.donts,
    rx["do's"],
    rx["don'ts"],
    rx.suggestions,
    rx.do_and_dont?.dos,
    rx.do_and_dont?.donts,
    rx.lifestyle?.["do's"],
    rx.lifestyle?.["don'ts"],
    rx.lifestyle?.diet,
  ];

  return listFields.some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    return false;
  });
};

export const formatSlipDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatSlipTimeRange = (
  start?: string | null,
  end?: string | null,
): string => {
  const startLabel = formatAppointmentTimeLabel(start || undefined);
  const endLabel = formatAppointmentTimeLabel(end || undefined);
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  return startLabel || endLabel || '—';
};

export const getDoctorLocationLine = (doctor?: any): string => {
  if (!doctor) return '';
  const parts = [
    doctor.address_line,
    doctor.city,
    doctor.state,
    doctor.pincode,
  ].filter(Boolean);
  return parts.join(', ');
};

export const getConsultationTitle = (consultation?: any): string => {
  const advice = consultation?.prescription?.diagnosis_advice?.trim?.();
  if (advice) return advice;
  const concern = consultation?.concern?.trim?.();
  if (concern) return concern;
  const symptom = consultation?.prescription?.symptom_description?.trim?.();
  if (symptom) return symptom;
  return 'Consultation visit';
};

export const getPatientMeta = (patient?: any): string => {
  if (!patient) return '';
  const bits = [
    patient.relation ? String(patient.relation) : '',
    patient.age != null ? `${patient.age} yrs` : '',
    patient.gender ? String(patient.gender) : '',
  ].filter(Boolean);
  return bits.join(' · ');
};
