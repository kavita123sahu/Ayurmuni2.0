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
      prescriptionId: null as string | null,
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
    prescriptionId: String(
      prescription?.id ||
        prescription?.prescription_id ||
        raw?.prescription_id ||
        raw?.id ||
        '',
    ).trim() || null,
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
    prescription.diagnosis_advice ||
      prescription.diagnosis ||
      prescription.provisional_diagnosis ||
      prescription.clinical_diagnosis ||
      prescription.condition ||
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
  // Keep diagnosis_advice in getDiagnosisText — do not duplicate here
  return asAdviceList(
    prescription.suggestions ||
      prescription.suggestion ||
      prescription.general_instructions ||
      prescription.patient_instructions ||
      prescription.instructions,
  );
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

/** Normalize free-form clinical text (string / array / object). */
export const getClinicalText = (value: any): string => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }
  const list = asAdviceList(value);
  return list.join(', ').trim();
};

export const getAllergiesList = (prescription: any): string[] => {
  if (!prescription) return [];
  return asAdviceList(
    prescription.allergies ||
      prescription.allergy ||
      prescription.known_allergies ||
      prescription.allergy_history,
  );
};

export const getPastIllnessText = (prescription: any): string =>
  getClinicalText(
    prescription?.history_of_past_illness ||
      prescription?.past_illness ||
      prescription?.past_medical_history ||
      prescription?.medical_history,
  );

export const getFamilyHistoryText = (prescription: any): string =>
  getClinicalText(
    prescription?.family_history ||
      prescription?.family_medical_history ||
      prescription?.hereditary_history,
  );

export const getSymptomDescription = (prescription: any): string =>
  getClinicalText(
    prescription?.symptom_description ||
      prescription?.symptoms ||
      prescription?.chief_complaint ||
      prescription?.presenting_complaint,
  );

export type FollowUpInfo = {
  date: string | null;
  dateLabel: string | null;
  reason: string | null;
  schedule: boolean;
  notes: string | null;
  status: string | null;
  hasContent: boolean;
};

export const getFollowUpInfo = (
  prescription: any,
  appointment?: any,
): FollowUpInfo => {
  const followUp =
    (prescription?.follow_up && typeof prescription.follow_up === 'object'
      ? prescription.follow_up
      : null) ||
    (appointment?.follow_up && typeof appointment.follow_up === 'object'
      ? appointment.follow_up
      : null) ||
    null;

  const dateRaw =
    followUp?.date ||
    followUp?.follow_up_date ||
    appointment?.follow_up_date ||
    null;
  const date = dateRaw ? String(dateRaw).trim() : null;
  const reason = getClinicalText(
    followUp?.reason || followUp?.note || followUp?.notes || followUp?.purpose,
  );
  const notes = getClinicalText(
    followUp?.instructions || followUp?.advice || followUp?.description,
  );
  const status = getClinicalText(followUp?.status || followUp?.appointment_status);
  const schedule = Boolean(
    followUp?.schedule ?? followUp?.scheduled ?? (date || reason || notes),
  );

  return {
    date,
    dateLabel: date ? formatIssuedLabel(date) : null,
    reason: reason || null,
    schedule,
    notes: notes || null,
    status: status || null,
    hasContent: Boolean(date || reason || notes || status || followUp?.schedule),
  };
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

const lineList = (title: string, items: string[]): string[] => {
  if (!items.length) return [];
  return [title, ...items.map(item => `  • ${item}`), ''];
};

const medicineLine = (medicine: any, index: number): string => {
  const name = String(
    medicine?.name ||
      medicine?.medicine_name ||
      medicine?.product_name ||
      medicine?.title ||
      `Medicine ${index + 1}`,
  ).trim();
  const chips = getMedicineScheduleChips(medicine)
    .map(c => `${c.caption}: ${c.label}`)
    .join(' | ');
  const notes = String(
    medicine?.instructions || medicine?.notes || medicine?.advice || '',
  ).trim();
  return [`  ${index + 1}. ${name}`, chips ? `     ${chips}` : '', notes ? `     Notes: ${notes}` : '']
    .filter(Boolean)
    .join('\n');
};

/** Build a readable prescription text file from download API JSON `data`. */
export const buildPrescriptionDownloadText = (data: any): string => {
  const root = data?.data && typeof data.data === 'object' ? data.data : data;
  if (!root || typeof root !== 'object') {
    throw new Error('Prescription data is empty');
  }

  const doctor = root.doctor || {};
  const patient = root.patient || {};
  const appointment = root.appointment || {};
  const prescription = root.prescription || root;

  const doctorName = String(
    doctor.name || doctor.doctor_name || doctor.full_name || '',
  ).trim();
  const specialization = Array.isArray(doctor.doctor_specialization)
    ? doctor.doctor_specialization.join(', ')
    : String(
        doctor.doctor_specialization ||
          doctor.specialization ||
          doctor.speciality ||
          '',
      ).trim();
  const patientName = String(
    patient.name || patient.patient_name || patient.full_name || '',
  ).trim();
  const code = String(
    prescription.prescription_code || root.prescription_code || root.id || '',
  ).trim();
  const issuedOn = formatIssuedLabel(
    appointment.appointment_date ||
      root.issued_on ||
      prescription.created_at ||
      appointment.date ||
      null,
  );

  const medicines = getMedicineItems(prescription);
  const dos = getDoList(prescription);
  const donts = getDontList(prescription);
  const diets = getDietAdvice(prescription);
  const dietPlans = getRecommendedDietPlans(root);
  const suggestions = getSuggestionList(prescription);
  const allergies = getAllergiesList(prescription);
  const followUp = getFollowUpInfo(prescription, appointment);
  const symptoms = getSymptomDescription(prescription);
  const pastIllness = getPastIllnessText(prescription);
  const familyHistory = getFamilyHistoryText(prescription);
  const clinical = getClinicalAdvisory(prescription);
  const diagnosis = getDiagnosisText(prescription);

  const sections: string[] = [
    'AYURMUNI',
    'Digital Prescription',
    '----------------------------------------',
    `Prescription: ${code || '-'}`,
    `Issued on: ${issuedOn}`,
    `Doctor: ${doctorName || '-'}`,
    `Specialization: ${specialization || '-'}`,
    `Patient: ${patientName || '-'}`,
    '----------------------------------------',
    '',
  ];

  if (symptoms) {
    sections.push('Symptoms', `  ${symptoms}`, '');
  }
  if (diagnosis) {
    sections.push('Diagnosis', `  ${diagnosis}`, '');
  }
  if (pastIllness) {
    sections.push('History of past illness', `  ${pastIllness}`, '');
  }
  if (allergies.length) {
    sections.push(...lineList('Allergies', allergies));
  }
  if (familyHistory) {
    sections.push('Family history', `  ${familyHistory}`, '');
  }
  if (clinical) {
    sections.push('Clinical notes', `  ${clinical}`, '');
  }

  if (medicines.length) {
    sections.push('Medicines');
    medicines.forEach((med, i) => sections.push(medicineLine(med, i)));
    sections.push('');
  }

  sections.push(...lineList("Do's", dos));
  sections.push(...lineList("Don'ts", donts));
  sections.push(...lineList('Diet advice', diets));

  if (dietPlans.length) {
    sections.push(
      ...lineList(
        'Recommended diet plans',
        dietPlans.map(d =>
          String(d?.name || d?.title || d?.diet_name || d).trim(),
        ).filter(Boolean),
      ),
    );
  }

  sections.push(...lineList('Advice / suggestions', suggestions));

  if (followUp.hasContent) {
    sections.push('Follow-up');
    if (followUp.dateLabel) sections.push(`  Date: ${followUp.dateLabel}`);
    if (followUp.reason) sections.push(`  Reason: ${followUp.reason}`);
    if (followUp.notes) sections.push(`  Notes: ${followUp.notes}`);
    sections.push('');
  }

  sections.push(
    '----------------------------------------',
    'This is a computer generated prescription.',
  );

  return sections.join('\n');
};
