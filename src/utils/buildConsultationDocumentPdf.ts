import {

  createStructuredDocumentPdf,

  type PdfTextSection,

  type StructuredDocumentPdfInput,

} from './documentPdfLayout';

import {

  buildBillToBlock,

  buildShipToBlock,

  buildWellnessFromBlock,
  INVOICE_SELLER_FALLBACK,
  mergeWithInvoiceSellerDefaults,
} from './documentPdfDataUtils';

import {

  getClinicalAdvisory,

  getDiagnosisText,

  getDietAdvice,

  getDoList,

  getDontList,

  getMedicineItems,

  getMedicinePrice,

  getMedicineScheduleChips,

  getSuggestionList,

  getSymptomDescription,

  normalizePrescriptionPayload,

} from './prescriptionDetailUtils';

import {
  formatAppointmentId,
  formatConsultationId,
  formatPrescriptionId,
  formatReceiptId,
} from './formatDisplayId';



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



const wellnessSource = (source: any) =>

  mergeWithInvoiceSellerDefaults({

    ...source,

    wellness:

      source?.wellness ??

      source?.wellness_info ??

      (pick(

        source?.clinic_name,

        source?.hospital_name,

        source?.info?.hospital_name,

        source?.info?.clinic_name,

      )

        ? {

            name: pick(

              source?.clinic_name,

              source?.hospital_name,

              source?.info?.hospital_name,

              source?.info?.clinic_name,

            ),

            address: pick(

              source?.clinic_address,

              source?.hospital_address,

              source?.info?.clinic_address,

            ),

            phone: pick(source?.clinic_phone, source?.hospital_phone),

            gstin: pick(source?.clinic_gstin, source?.gstin),

          }

        : undefined),

  });



const buildMedicineDescription = (med: any): string => {

  const name = pick(

    med?.medicine_name,

    med?.name,

    med?.product_name,

    med?.title,

  );

  const chips = getMedicineScheduleChips(med);

  const schedule = chips.map(c => `${c.caption}: ${c.label}`).join(', ');

  const instruction = pick(

    med?.instructions,

    med?.instruction,

    med?.notes,

    med?.advice,

    med?.remark,

  );

  return [name, schedule, instruction].filter(Boolean).join(' | ');

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



export async function createMedicalReceiptPdfBytes(

  receipt: any,

): Promise<Uint8Array> {

  const specializationText = Array.isArray(receipt?.info?.doctor_specialization)

    ? receipt.info.doctor_specialization.join(', ')

    : receipt?.info?.doctor_specialization || '';



  const doctorName = pick(receipt?.info?.doctor_name, receipt?.doctor_name);



  const consultationFee = Number(receipt?.consultation_fees ?? 0);

  const adminFee = Number(receipt?.administrative_charges ?? 0);

  const digitalFee = Number(receipt?.digital_report_access ?? 0);

  const grandTotal = Number(

    receipt?.total_amount ?? consultationFee + adminFee + digitalFee,

  );



  const lineItems = [

    {

      sno: 1,

      description: `Online Consultation${specializationText ? ` - ${specializationText}` : ''}`,

      qty: 1,

      rate: money(consultationFee),

      taxableValue: money(consultationFee),

      tax: '0.00',

      total: money(consultationFee),

    },

  ];



  if (adminFee > 0) {

    lineItems.push({

      sno: lineItems.length + 1,

      description: 'Administrative Charges',

      qty: 1,

      rate: money(adminFee),

      taxableValue: money(adminFee),

      tax: '0.00',

      total: money(adminFee),

    });

  }



  if (digitalFee > 0) {

    lineItems.push({

      sno: lineItems.length + 1,

      description: 'Digital Report Access',

      qty: 1,

      rate: money(digitalFee),

      taxableValue: money(digitalFee),

      tax: '0.00',

      total: money(digitalFee),

    });

  }



  const taxableSum = consultationFee + adminFee + digitalFee;

  const patient = receipt?.patient ?? {};



  const input: StructuredDocumentPdfInput = {

    documentHeading: 'CONSULTATION RECEIPT',

    from: buildWellnessFromBlock(mergeWithInvoiceSellerDefaults(receipt)),

    billTo: buildBillToBlock({

      ...receipt,

      patient_name: receipt?.patient_name || receipt?.patient?.name,

      patient,

    }),

    shipTo:

      buildShipToBlock(receipt) ??

      buildPatientShipTo(patient),

    leftMeta: [

      { label: 'Receipt Date', value: pick(receipt?.date, receipt?.paid_at) || '-' },

      {

        label: 'Receipt Code',

        value: formatReceiptId(
          pick(receipt?.payment_id, receipt?.consultation_id),
        ),

      },

    ],

    rightMeta: [

      {

        label: 'Consultation No',

        value: formatConsultationId(receipt?.consultation_id),

      },

      { label: 'Doctor', value: doctorName || '-' },

      {

        label: 'Payment Method',

        value: pick(receipt?.payment_method, receipt?.payment_type) || '-',

      },

    ],

    lineItems,

    totals: [

      { label: 'Qty', value: String(lineItems.length) },

      { label: 'Rate', value: '-' },

      { label: 'Taxable', value: money(taxableSum) },

      { label: 'IGST', value: '0.00' },

      { label: 'Grand Total', value: money(grandTotal) },

    ],

    signatoryFor: doctorName || INVOICE_SELLER_FALLBACK.wellness_name,

    showSignature: true,

    hideDeclaration: true,

    footerNote:

      'THIS IS A COMPUTER GENERATED RECEIPT. NO PHYSICAL SIGNATURE REQUIRED.',

  };



  return createStructuredDocumentPdf(input);

}



export async function createAppointmentPdfBytes(

  appointment: any,

): Promise<Uint8Array> {

  const slot = appointment?.slot ?? appointment?.appointment ?? {};

  const info = appointment?.info ?? appointment?.doctor ?? {};

  const patient =

    appointment?.patient ?? appointment?.appointment?.patient ?? {};



  const doctorName = pick(

    info?.doctor_name,

    appointment?.doctor_name,

    appointment?.doctor?.doctor_name,

  );

  const specialization = Array.isArray(appointment?.doctor_specialization)

    ? appointment.doctor_specialization.join(', ')

    : pick(

        info?.specialization,

        appointment?.doctor_specialization,

        appointment?.specialization,

      );



  const consultationFee = Number(

    appointment?.consultation_fees ??

      appointment?.consultation_fee ??

      appointment?.amount ??

      appointment?.total_amount ??

      0,

  );



  const hospitalName = pick(

    appointment?.hospital_name,

    info?.hospital_name,

    appointment?.clinic_name,

  );



  const lineItems = [

    {

      sno: 1,

      description: `Appointment with ${doctorName || 'Doctor'}${specialization ? ` (${specialization})` : ''}`,

      qty: 1,

      rate: consultationFee > 0 ? money(consultationFee) : '-',

      taxableValue: consultationFee > 0 ? money(consultationFee) : '-',

      tax: '0.00',

      total: consultationFee > 0 ? money(consultationFee) : '-',

    },

  ];



  const input: StructuredDocumentPdfInput = {

    documentHeading: 'APPOINTMENT CONFIRMATION',

    from: buildWellnessFromBlock(mergeWithInvoiceSellerDefaults(appointment)),

    billTo: buildBillToBlock({

      ...appointment,

      patient_name: pick(

        patient?.patient_name,

        patient?.name,

        appointment?.patient_name,

      ),

      patient,

    }),

    shipTo:

      buildShipToBlock(appointment) ??

      (hospitalName

        ? {

            title: 'Ship To / Clinic',

            lines: [

              hospitalName,

              pick(appointment?.clinic_address, appointment?.hospital_address),

            ].filter(Boolean),

          }

        : buildPatientShipTo(patient)),

    leftMeta: [

      {

        label: 'Appointment Date',

        value:

          pick(slot?.date, appointment?.date, appointment?.appointment_date) ||

          '-',

      },

      {

        label: 'Appointment Code',

        value: formatAppointmentId(
          pick(
            appointment?.consultation_id,
            appointment?.appointment_id,
            appointment?.id,
          ),
        ),

      },

    ],

    rightMeta: [

      {

        label: 'Time',

        value:

          pick(slot?.slot_time, slot?.start_time, appointment?.slot_time) ||

          '-',

      },

      {

        label: 'Status',

        value:

          pick(appointment?.appointment_status, appointment?.status) ||

          'Confirmed',

      },

      {

        label: 'Mode',

        value:

          pick(appointment?.consultation_mode, appointment?.mode) ||

          'Video consultation',

      },

    ],

    lineItems,

    totals: [

      { label: 'Qty', value: '1' },

      {

        label: 'Rate',

        value: consultationFee > 0 ? money(consultationFee) : '-',

      },

      {

        label: 'Taxable',

        value: consultationFee > 0 ? money(consultationFee) : '-',

      },

      { label: 'IGST', value: '0.00' },

      {

        label: 'Grand Total',

        value: consultationFee > 0 ? money(consultationFee) : '-',

      },

    ],

    hideDeclaration: true,

    footerNote: 'This is a computer generated Appointment Confirmation.',

  };



  return createStructuredDocumentPdf(input);

}



export { buildPrescriptionPdfFromData as createPrescriptionPdfBytes } from './prescriptionPdfBuilder';
