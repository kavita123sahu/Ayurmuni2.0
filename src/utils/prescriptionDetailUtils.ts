import { formatSlipDate, hasPrescribedData } from './doctorSlipUtils';

/** Turn API diet / do / don't payloads into clean string lists. */
export const asAdviceList = (value: any): string[] => {
  if (value == null) return [];

  if (typeof value === 'string') {
    return value
      .split(/\n|•|;|\|/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (item == null) return '';
        if (typeof item === 'string' || typeof item === 'number') {
          return String(item).trim();
        }
        return String(
          item.name ??
            item.title ??
            item.text ??
            item.advice ??
            item.instruction ??
            item.description ??
            '',
        ).trim();
      })
      .filter(Boolean);
  }

  if (typeof value === 'object') {
    return asAdviceList(
      value.items ??
        value.list ??
        value.values ??
        value.advice ??
        value.text ??
        null,
    );
  }

  return [];
};

export const getPrescriptionRoot = (payload: any): any => {
  if (!payload || typeof payload !== 'object') return null;
  return (
    payload.prescription ||
    payload.appointment?.prescription ||
    payload.data?.prescription ||
    null
  );
};

/** Normalize patient/consultation OR doctor-slip consultation into one shape. */
export const normalizePrescriptionPayload = (raw: any) => {
  if (!raw || typeof raw !== 'object') {
    return {
      appointmentId: null as string | null,
      consultationId: null as string | null,
      doctor: null as any,
      patient: null as any,
      appointment: null as any,
      prescription: null as any,
      issuedOn: null as string | null,
      status: null as string | null,
    };
  }

  // doctor-slip style consultation item
  const isSlipItem =
    !!raw.prescription ||
    !!raw.appointment_date ||
    !!raw.consultation_id;

  const appointment = raw.appointment || (isSlipItem ? raw : null);
  const doctor = raw.doctor || null;
  const patient =
    appointment?.patient || raw.patient || raw.appointment?.patient || null;
  const prescription = getPrescriptionRoot(raw) || getPrescriptionRoot(appointment);

  const appointmentId = String(
    appointment?.appointment_id ||
      raw.appointment_id ||
      appointment?.id ||
      '',
  ).trim() || null;

  const consultationId = String(
    appointment?.consultation_id ||
      raw.consultation_id ||
      '',
  ).trim() || null;

  const issuedOn =
    appointment?.appointment_date ||
    raw.appointment_date ||
    raw.date ||
    prescription?.issued_on ||
    prescription?.created_at ||
    null;

  const status =
    appointment?.appointment_status ||
    raw.appointment_status ||
    prescription?.status ||
    null;

  return {
    appointmentId,
    consultationId,
    doctor,
    patient,
    appointment: appointment || raw,
    prescription,
    issuedOn,
    status,
  };
};

export const getMedicineItems = (prescription: any): any[] => {
  if (!prescription) return [];
  if (Array.isArray(prescription.items)) return prescription.items;
  if (Array.isArray(prescription.medicines)) return prescription.medicines;
  if (Array.isArray(prescription.medicine_items)) {
    return prescription.medicine_items;
  }
  if (Array.isArray(prescription.prescribed_medicines)) {
    return prescription.prescribed_medicines;
  }
  return [];
};

/** Prefer selling / unit / mrp style fields from medicine item. */
export const getMedicinePrice = (medicine: any): string | number | null => {
  if (!medicine || typeof medicine !== 'object') return null;
  const candidates = [
    medicine.selling_price,
    medicine.price,
    medicine.mrp,
    medicine.amount,
    medicine.unit_price,
    medicine.total_price,
  ];
  for (const c of candidates) {
    if (c != null && String(c).trim() !== '') return c;
  }
  return null;
};

const isBareNumber = (value: string) => /^\d+(\.\d+)?$/.test(value.trim());

/** "200" → "200 mg"; leave already-labeled values alone. */
export const formatMedicineDosage = (value?: string | number | null): string => {
  if (value == null || String(value).trim() === '') return '';
  const raw = String(value).trim();
  if (!isBareNumber(raw)) return raw;
  return `${raw} mg`;
};

/** "2" → "2 times / day" */
export const formatMedicineFrequency = (
  value?: string | number | null,
): string => {
  if (value == null || String(value).trim() === '') return '';
  const raw = String(value).trim();
  const lower = raw.toLowerCase();
  if (
    lower.includes('day') ||
    lower.includes('time') ||
    lower.includes('hour') ||
    lower.includes('/')
  ) {
    return raw;
  }
  if (isBareNumber(raw)) {
    const n = Number(raw);
    return n === 1 ? '1 time / day' : `${n} times / day`;
  }
  return raw;
};

/** "7" → "7 days" */
export const formatMedicineDuration = (
  value?: string | number | null,
): string => {
  if (value == null || String(value).trim() === '') return '';
  const raw = String(value).trim();
  const lower = raw.toLowerCase();
  if (
    lower.includes('day') ||
    lower.includes('week') ||
    lower.includes('month')
  ) {
    return raw;
  }
  if (isBareNumber(raw)) {
    const n = Number(raw);
    return n === 1 ? '1 day' : `${n} days`;
  }
  return raw;
};

export type MedicineScheduleChip = {
  key: string;
  label: string;
  caption: string;
};

/** Labeled chips so dose / frequency / duration are readable. */
export const getMedicineScheduleChips = (
  medicine: any,
): MedicineScheduleChip[] => {
  if (!medicine || typeof medicine !== 'object') return [];
  const chips: MedicineScheduleChip[] = [];

  const dosage = formatMedicineDosage(medicine.dosage);
  if (dosage) {
    chips.push({ key: 'dose', caption: 'Dose', label: dosage });
  }

  const frequency = formatMedicineFrequency(medicine.frequency);
  if (frequency) {
    chips.push({ key: 'freq', caption: 'Frequency', label: frequency });
  }

  const duration = formatMedicineDuration(medicine.duration);
  if (duration) {
    chips.push({ key: 'dur', caption: 'Duration', label: duration });
  }

  if (medicine.quantity != null && String(medicine.quantity).trim() !== '') {
    chips.push({
      key: 'qty',
      caption: 'Qty',
      label: String(medicine.quantity),
    });
  }

  return chips;
};

/** Diet plans recommended on the consultation payload (`diets` array). */
export const getRecommendedDietPlans = (payload: any): any[] => {
  if (!payload || typeof payload !== 'object') return [];
  const lists = [
    payload.diets,
    payload.appointment?.diets,
    payload.prescription?.diets,
    payload.recommended_diets,
  ];
  for (const list of lists) {
    if (Array.isArray(list) && list.length) {
      return list.filter(Boolean);
    }
  }
  return [];
};

export const getPaymentAmount = (payload: any): string | number | null => {
  const payment =
    payload?.payment ||
    payload?.appointment?.payment ||
    payload?.consultation?.payment ||
    null;
  if (!payment) return null;
  return (
    payment.consultation_fee ??
    payment.amount ??
    payment.total_amount ??
    payment.paid_amount ??
    null
  );
};

export const getConcernText = (payload: any): string => {
  const normalized = normalizePrescriptionPayload(payload);
  return String(
    normalized.appointment?.concern ||
      payload?.concern ||
      normalized.prescription?.symptom_description ||
      normalized.prescription?.diagnosis ||
      normalized.prescription?.chief_complaint ||
      '',
  ).trim();
};

export const getDiagnosisText = (prescription: any): string => {
  if (!prescription) return '';
  return String(
    prescription.diagnosis ||
      prescription.provisional_diagnosis ||
      prescription.clinical_diagnosis ||
      prescription.condition ||
      prescription.symptom_description ||
      '',
  ).trim();
};

export const getDietAdvice = (prescription: any): string[] => {
  if (!prescription) return [];
  return asAdviceList(
    prescription.diet ||
      prescription.diet_advice ||
      prescription.dietary_advice ||
      prescription.diet_recommendations ||
      prescription.suggested_diet ||
      prescription.diet_plan ||
      prescription.lifestyle?.diet ||
      prescription.lifestyle?.diet_advice,
  );
};

export const getDoList = (prescription: any): string[] => {
  if (!prescription) return [];
  return asAdviceList(
    prescription.dos ||
      prescription.do_list ||
      prescription["do's"] ||
      prescription.do_and_dont?.dos ||
      prescription.do_and_dont?.["do's"] ||
      prescription.dos_and_donts?.dos ||
      prescription.lifestyle?.["do's"] ||
      prescription.lifestyle?.dos,
  );
};

export const getDontList = (prescription: any): string[] => {
  if (!prescription) return [];
  return asAdviceList(
    prescription.donts ||
      prescription.dont_list ||
      prescription["don'ts"] ||
      prescription.do_and_dont?.donts ||
      prescription.do_and_dont?.["don'ts"] ||
      prescription.dos_and_donts?.donts ||
      prescription.lifestyle?.["don'ts"] ||
      prescription.lifestyle?.donts,
  );
};

export const getSuggestionList = (prescription: any): string[] => {
  if (!prescription) return [];
  const fromFields = asAdviceList(
    prescription.suggestions ||
      prescription.suggestion ||
      prescription.general_instructions ||
      prescription.patient_instructions ||
      prescription.instructions,
  );
  const advice = String(prescription.diagnosis_advice || '').trim();
  if (advice && !fromFields.includes(advice)) {
    fromFields.unshift(advice);
  }
  return fromFields;
};

export const getClinicalAdvisory = (prescription: any): string => {
  if (!prescription) return '';
  return String(
    prescription.clinical_notes ||
      prescription.clinical_advisory ||
      prescription.warning ||
      prescription.important_notes ||
      '',
  ).trim();
};

export const formatIssuedLabel = (value?: string | null): string => {
  if (!value) return '—';
  return formatSlipDate(value);
};

export const consultationHasPrescription = (payload: any): boolean => {
  const normalized = normalizePrescriptionPayload(payload);
  if (hasPrescribedData({ prescription: normalized.prescription })) {
    return true;
  }
  if (getRecommendedDietPlans(payload).length > 0) {
    return true;
  }
  return (
    getDietAdvice(normalized.prescription).length > 0 ||
    getDoList(normalized.prescription).length > 0 ||
    getDontList(normalized.prescription).length > 0 ||
    getSuggestionList(normalized.prescription).length > 0
  );
};
