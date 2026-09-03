export {
  stripHtmlToPlainText,
  createPlainTextPdfBytes,
  createPdfBytesFromText,
} from './pdfPlainTextFallback';

export {
  createStructuredDocumentPdf,
  type StructuredDocumentPdfInput,
} from './documentPdfLayout';

export {
  createMedicalReceiptPdfBytes,
  createAppointmentPdfBytes,
  createPrescriptionPdfBytes,
} from './buildConsultationDocumentPdf';
