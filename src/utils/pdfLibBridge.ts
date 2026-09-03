/**
 * React Native-safe pdf-lib entry.
 * Uses the self-contained UMD bundle to avoid tslib `_extends` runtime errors.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const PDFLib = require('pdf-lib/dist/pdf-lib.js');

export const PDFDocument = PDFLib.PDFDocument;
export const StandardFonts = PDFLib.StandardFonts;
export const rgb = PDFLib.rgb;

export type PdfFont = {
  widthOfTextAtSize: (text: string, size: number) => number;
};

export type PdfPage = {
  drawText: (
    text: string,
    options: {
      x: number;
      y: number;
      size: number;
      font: PdfFont;
    },
  ) => void;
  drawRectangle: (options: Record<string, unknown>) => void;
  drawLine: (options: Record<string, unknown>) => void;
};
