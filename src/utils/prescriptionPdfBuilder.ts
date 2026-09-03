import { createStructuredDocumentPdf, type PdfTextSection, type StructuredDocumentPdfInput } from './documentPdfLayout';
import { formatRupee } from './currencyUtils';
import {
  buildBillToBlock,
  buildShipToBlock,
  buildWellnessFromBlock,
  mergeWithInvoiceSellerDefaults,
} from './documentPdfDataUtils';
import {
  formatConsultationId,
  formatPrescriptionId,
} from './formatDisplayId';
import { getDoctorLocationLine } from './doctorSlipUtils';
import {
  formatIssuedLabel,
  getAllergiesList,
  getClinicalAdvisory,
  getConcernText,
  getDiagnosisText,
  getDietAdvice,
  getDoList,
  getDontList,
  getFollowUpInfo,
  getMedicineItems,
  getMedicinePrice,
  getMedicineScheduleChips,
  getPastIllnessText,
  getFamilyHistoryText,
  getPaymentAmount,
  getRecommendedDietPlans,
  getSuggestionList,
  getSymptomDescription,
  normalizePrescriptionPayload,
} from './prescriptionDetailUtils';

const pick = (...values: any[]) => {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
};

const money = (value: number | string | undefined | null) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return num.toFixed(2);
};

const medicineLineTotal = (med: any): string => {
  const price = getMedicinePrice(med);
  const qty = Number(pick(med?.quantity, med?.qty, 1));
  if (price == null) return '-';
  const num = Number(price);
  if (!Number.isFinite(num)) return String(price);
  const q = Number.isFinite(qty) ? qty : 1;
  return money(num * q);
};

const buildMedicineTableRow = (med: any, index: number) => {
  const name = pick(
    med?.medicine_name,
    med?.name,
    med?.product_name,
    med?.title,
  ) || `Medicine ${index + 1}`;

  const subtitle = pick(
    med?.product_name,
    med?.description,
    med?.brand_name,
    med?.composition,
  );
  const subtitleLine =
    subtitle && subtitle.toLowerCase() !== name.toLowerCase()
      ? ` (${subtitle})`
      : '';

  const chips = getMedicineScheduleChips(med);
  const schedule = chips.map(c => `${c.caption}: ${c.label}`).join(', ');
  const instruction = pick(
    med?.instruction,
    med?.instructions,
    med?.notes,
    med?.advice,
  );

  const description = [name + subtitleLine, schedule, instruction]
    .filter(Boolean)
    .join(' | ');

  const price = getMedicinePrice(med);
  const qtyStr = pick(med?.quantity, med?.qty) || '1';
  const rate = price != null ? money(price) : '-';
  const lineTotal = medicineLineTotal(med);

  return {
    sno: index + 1,
    description,
    qty: qtyStr,
    rate,
    taxableValue: rate,
    tax: '0.00',
    total: lineTotal,
    lineTotalNum: lineTotal !== '-' ? Number(lineTotal) : 0,
  };
};

const buildPatientBillTo = (data: any, patient: any) => {
  const block = buildBillToBlock({
    ...data,
    patient_name: pick(patient?.patient_name, patient?.name),
    patient,
  });

  const demo = [
    patient?.age != null ? `Age ${patient.age}` : '',
    patient?.gender ? String(patient.gender) : '',
    patient?.relation ? String(patient.relation) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  if (demo) {
    block.lines.splice(1, 0, demo);
  }

  return block;
};

const buildPatientShipTo = (patient: any): StructuredDocumentPdfInput['shipTo'] => {
  if (!patient) return null;
  const name = pick(patient?.patient_name, patient?.name);
  const address =
    typeof patient?.address === 'string'
      ? patient.address
      : [
          patient?.address?.address_line_1,
          patient?.address?.city,
          patient?.address?.state,
          patient?.pincode,
        ]
          .filter(Boolean)
          .join(', ');

  const lines = [name, address].filter(Boolean);
  if (!lines.length) return null;
  return { title: 'Ship To', lines };
};

const pushSection = (
  sections: PdfTextSection[],
  title: string,
  lines: string[],
  bullet = false,
) => {
  const filtered = lines.map(l => String(l).trim()).filter(Boolean);
  if (filtered.length) {
    sections.push({ title, lines: filtered, bullet });
  }
};

const buildPaymentMeta = (data: any, appointment: any) => {
  const amount = getPaymentAmount(data);
  const method = pick(
    data?.payment?.payment_method,
    data?.payment?.mode,
    appointment?.payment?.payment_method,
  );
  const status = pick(
    data?.payment?.payment_status,
    data?.payment?.status,
    appointment?.payment?.payment_status,
  );

  const parts = [
    amount != null ? `Amount: ${formatRupee(amount, { decimals: 2 })}` : '',
    method ? `Method: ${method}` : '',
    status ? `Status: ${status}` : '',
  ].filter(Boolean);

  return parts.join(' · ') || '-';
};

/** Full prescription PDF — mirrors PrescriptionDetail screen content. */
export async function buildPrescriptionPdfFromData(
  data: any,
): Promise<Uint8Array> {
  const normalized = normalizePrescriptionPayload(data);
  const prescription = normalized.prescription;
  const doctor = normalized.doctor ?? data?.doctor ?? {};
  const patient = normalized.patient ?? data?.patient ?? {};
  const appointment = normalized.appointment ?? data?.appointment ?? {};

  const doctorName = pick(
    doctor?.doctor_name,
    doctor?.name,
    doctor?.full_name,
    data?.info?.doctor_name,
  );
  const specialization = Array.isArray(doctor?.doctor_specialization)
    ? doctor.doctor_specialization.join(', ')
    : pick(doctor?.doctor_specialization, doctor?.specialization);

  const medicines = getMedicineItems(prescription);
  const medicineRows = medicines.map(buildMedicineTableRow);
  const medicineTotalSum = medicineRows.reduce(
    (sum, row) => sum + row.lineTotalNum,
    0,
  );

  const lineItems =
    medicineRows.length > 0
      ? medicineRows.map(({ lineTotalNum: _t, ...row }) => row)
      : [
          {
            sno: 1,
            description: 'No medicines prescribed',
            qty: '-',
            rate: '-',
            taxableValue: '-',
            tax: '-',
            total: '-',
          },
        ];

  const concernText = getConcernText(data);
  const diagnosisText = getDiagnosisText(prescription);
  const symptomText = getSymptomDescription(prescription);
  const appointmentNotes = pick(
    appointment?.appointment_notes,
    data?.appointment_notes,
  );
  const followUp = getFollowUpInfo(prescription, appointment);
  const dietPlans = getRecommendedDietPlans(data);
  const dietItems = getDietAdvice(prescription);
  const doItems = getDoList(prescription);
  const dontItems = getDontList(prescription);
  const suggestions = getSuggestionList(prescription);
  const clinicalAdvisory = getClinicalAdvisory(prescription);
  const allergies = getAllergiesList(prescription);
  const pastIllnessText = getPastIllnessText(prescription);
  const familyHistoryText = getFamilyHistoryText(prescription);
  const doctorLocation = getDoctorLocationLine(doctor);

  const sections: PdfTextSection[] = [];

  if (concernText) {
    pushSection(sections, 'Chief Complaint', [concernText]);
  }

  if (
    diagnosisText &&
    diagnosisText.toLowerCase() !== concernText.toLowerCase() &&
    diagnosisText.toLowerCase() !== symptomText.toLowerCase()
  ) {
    pushSection(sections, 'Diagnosis', [diagnosisText]);
  }

  if (appointmentNotes) {
    pushSection(sections, 'Notes', [appointmentNotes]);
  }

  if (followUp.hasContent) {
    const followLines = [
      followUp.dateLabel ? `Date: ${followUp.dateLabel}` : '',
      followUp.reason ? `Reason: ${followUp.reason}` : '',
      followUp.notes ? `Notes: ${followUp.notes}` : '',
      followUp.status ? `Status: ${followUp.status}` : '',
    ].filter(Boolean);
    pushSection(sections, 'Follow-up', followLines);
  }

  if (symptomText) {
    pushSection(sections, 'Symptoms', [symptomText]);
  }

  if (allergies.length) {
    pushSection(sections, 'Allergies', allergies, true);
  }

  if (pastIllnessText) {
    pushSection(sections, 'Past Illness', [pastIllnessText]);
  }

  if (familyHistoryText) {
    pushSection(sections, 'Family History', [familyHistoryText]);
  }

  if (dietPlans.length) {
    pushSection(
      sections,
      'Recommended Diet Plans',
      dietPlans.map(d =>
        [
          pick(d?.name, d?.title, d?.diet_name) || 'Diet Plan',
          d?.avg_daily_calories != null
            ? `~${Math.round(Number(d.avg_daily_calories))} kcal/day`
            : '',
          d?.meals_per_day != null ? `${d.meals_per_day} meals/day` : '',
        ]
          .filter(Boolean)
          .join(' · '),
      ),
      true,
    );
  }

  if (dietItems.length) {
    pushSection(sections, 'Diet Advice', dietItems, true);
  }

  if (suggestions.length) {
    pushSection(sections, 'Patient Instructions', suggestions, true);
  }

  if (doItems.length || dontItems.length) {
    if (doItems.length) {
      pushSection(sections, "Do's", doItems, true);
    }
    if (dontItems.length) {
      pushSection(sections, "Don'ts", dontItems, true);
    }
  }

  if (clinicalAdvisory) {
    pushSection(sections, 'Clinical Observations', [clinicalAdvisory]);
  }

  const physicianLines = [
    doctorName || 'Doctor',
    specialization ? `Specialization: ${specialization}` : '',
    doctorLocation ? `Location: ${doctorLocation}` : '',
    pick(doctor?.phone, doctor?.mobile, doctor?.contact_number)
      ? `Phone: ${pick(doctor?.phone, doctor?.mobile, doctor?.contact_number)}`
      : '',
    doctor?.email ? `Email: ${doctor.email}` : '',
  ].filter(Boolean);

  pushSection(sections, 'Prescribing Physician', physicianLines);

  const paymentMeta = buildPaymentMeta(data, appointment);
  const grandTotal =
    medicineTotalSum > 0
      ? money(medicineTotalSum)
      : getPaymentAmount(data) != null
        ? money(getPaymentAmount(data))
        : '-';

  const input: StructuredDocumentPdfInput = {
    documentHeading: 'PRESCRIPTION',
    from: buildWellnessFromBlock(mergeWithInvoiceSellerDefaults(data)),
    billTo: buildPatientBillTo(data, patient),
    shipTo:
      buildShipToBlock({
        ...data,
        delivery_address: patient?.address ?? patient?.delivery_address,
        patient,
      }) ?? buildPatientShipTo(patient),
    leftMeta: [
      {
        label: 'Issued Date',
        value:
          formatIssuedLabel(
            pick(
              appointment?.appointment_date,
              appointment?.date,
              prescription?.issued_on,
              prescription?.created_at,
              normalized.issuedOn,
            ),
          ) || '-',
      },
      {
        label: 'Prescription Code',
        value: formatPrescriptionId(
          pick(
            prescription?.prescription_code,
            prescription?.id,
            normalized.prescriptionId,
          ),
        ),
      },
      {
        label: 'Payment',
        value: paymentMeta,
      },
    ],
    rightMeta: [
      {
        label: 'Consultation No',
        value: formatConsultationId(
          pick(
            appointment?.consultation_id,
            normalized.consultationId,
            appointment?.id,
          ),
        ),
      },
      { label: 'Doctor', value: doctorName || '-' },
      {
        label: 'Specialization',
        value: specialization || '-',
      },
    ],
    lineItems,
    totals: [
      { label: 'Qty', value: String(lineItems.length) },
      { label: 'Rate', value: '-' },
      {
        label: 'Taxable',
        value: grandTotal !== '-' ? grandTotal : '-',
      },
      { label: 'IGST', value: '0.00' },
      { label: 'Grand Total', value: grandTotal },
    ],
    sections,
    signatoryFor: doctorName || 'Doctor',
    showSignature: true,
    hideDeclaration: true,
    footerNote: 'This is a computer generated Prescription.',
  };

  return createStructuredDocumentPdf(input);
}
