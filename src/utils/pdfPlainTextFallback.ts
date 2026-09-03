import { PDFDocument, StandardFonts, type PdfFont } from './pdfLibBridge';

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const FONT_SIZE = 11;
const LINE_HEIGHT = 14;

const wrapParagraph = (
  paragraph: string,
  font: PdfFont,
  maxWidth: number,
): string[] => {
  if (!paragraph.trim()) return [''];

  const words = paragraph.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, FONT_SIZE) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
};

export const stripHtmlToPlainText = (html: string): string =>
  html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

export async function createPlainTextPdfBytes(text: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const maxWidth = PAGE_W - MARGIN * 2;

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  for (const paragraph of String(text || '').split('\n')) {
    for (const line of wrapParagraph(paragraph, font, maxWidth)) {
      if (y < MARGIN + LINE_HEIGHT) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
      }
      if (line) {
        page.drawText(line, { x: MARGIN, y, size: FONT_SIZE, font });
      }
      y -= LINE_HEIGHT;
    }
  }

  return pdfDoc.save();
}

/** @deprecated use createPlainTextPdfBytes */
export const createPdfBytesFromText = createPlainTextPdfBytes;
