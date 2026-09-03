import { PDFDocument, StandardFonts, rgb } from './pdfLibBridge';
import type { PdfPage, PdfFont } from './pdfLibBridge';
import { sanitizePdfText } from './pdfTextUtils';

export const PAGE_W = 595.28;
export const PAGE_H = 841.89;
const MARGIN = 28;
const PAD = 6;
const BORDER = rgb(0, 0, 0);
const MIN_Y = MARGIN + 24;

export type PdfAddressBlock = {
  title: string;
  lines: string[];
};

export type PdfMetaField = {
  label: string;
  value: string;
};

export type PdfLineItem = {
  sno: number;
  description: string;
  qty?: string | number;
  rate?: string | number;
  taxableValue?: string | number;
  tax?: string | number;
  total?: string | number;
};

export type PdfTextSection = {
  title: string;
  lines: string[];
  bullet?: boolean;
};

export type StructuredDocumentPdfInput = {
  documentHeading?: string;
  from: PdfAddressBlock;
  billTo: PdfAddressBlock;
  shipTo?: PdfAddressBlock | null;
  leftMeta: PdfMetaField[];
  rightMeta: PdfMetaField[];
  lineItems: PdfLineItem[];
  totals: PdfMetaField[];
  sections?: PdfTextSection[];
  declaration?: string[];
  footerNote?: string;
  signatoryFor?: string;
  showSignature?: boolean;
  hideDeclaration?: boolean;
};

const fmt = (value: string | number | undefined | null) => {
  if (value == null || value === '') return '-';
  return sanitizePdfText(String(value));
};

const wrapLines = (
  text: string,
  font: PdfFont,
  size: number,
  maxWidth: number,
): string[] => {
  const words = sanitizePdfText(text || '-').split(/\s+/).filter(Boolean);
  if (!words.length) return ['-'];

  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const drawBorderBox = (
  page: PdfPage,
  x: number,
  y: number,
  w: number,
  h: number,
) => {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    borderColor: BORDER,
    borderWidth: 0.8,
  });
};

const drawWrappedBlock = (
  page: PdfPage,
  font: PdfFont,
  bold: PdfFont,
  x: number,
  topY: number,
  width: number,
  block: PdfAddressBlock,
  titleSize = 10,
  bodySize = 9,
  lineHeight = 11,
) => {
  let y = topY - PAD - titleSize;
  page.drawText(sanitizePdfText(block.title), { x: x + PAD, y, size: titleSize, font: bold });
  y -= lineHeight;

  for (const line of block.lines.filter(Boolean)) {
    const wrapped = wrapLines(line, font, bodySize, width - PAD * 2);
    for (const row of wrapped) {
      page.drawText(row, { x: x + PAD, y, size: bodySize, font });
      y -= lineHeight;
    }
  }

  return y;
};

const estimateBlockHeight = (
  font: PdfFont,
  width: number,
  block: PdfAddressBlock,
  bodySize = 9,
  lineHeight = 11,
) => {
  let lines = 1;
  for (const line of block.lines.filter(Boolean)) {
    lines += wrapLines(line, font, bodySize, width - PAD * 2).length;
  }
  return PAD * 2 + 10 + lines * lineHeight + 4;
};

const drawMetaColumn = (
  page: PdfPage,
  font: PdfFont,
  bold: PdfFont,
  x: number,
  topY: number,
  width: number,
  fields: PdfMetaField[],
) => {
  let y = topY - PAD - 9;
  for (const field of fields) {
    page.drawText(sanitizePdfText(`${field.label}: `), {
      x: x + PAD,
      y,
      size: 9,
      font: bold,
    });
    const labelW = bold.widthOfTextAtSize(`${field.label}: `, 9);
    const valueLines = wrapLines(field.value, font, 9, width - PAD * 2 - labelW);
    valueLines.forEach((row, index) => {
      page.drawText(row, {
        x: x + PAD + (index === 0 ? labelW : 0),
        y: y - index * 11,
        size: 9,
        font,
      });
    });
    y -= Math.max(1, valueLines.length) * 11 + 2;
  }
};

type PdfLayoutContext = {
  pdfDoc: Awaited<ReturnType<typeof PDFDocument.create>>;
  page: PdfPage;
  font: PdfFont;
  bold: PdfFont;
  cursorY: number;
  contentW: number;
};

const ensureSpace = (ctx: PdfLayoutContext, needed: number) => {
  if (ctx.cursorY - needed >= MIN_Y) return;
  ctx.page = ctx.pdfDoc.addPage([PAGE_W, PAGE_H]);
  ctx.cursorY = PAGE_H - MARGIN;
};

const drawSectionBlock = (
  ctx: PdfLayoutContext,
  section: PdfTextSection,
) => {
  const { font, bold, contentW } = ctx;
  const bodySize = 8;
  const lineHeight = 10;
  const maxTextW = contentW - PAD * 4;
  const title = sanitizePdfText(section.title);

  const bodyLines: string[] = [];
  section.lines.filter(Boolean).forEach(line => {
    const prefix = section.bullet ? '- ' : '';
    wrapLines(`${prefix}${line}`, font, bodySize, maxTextW).forEach(row => {
      bodyLines.push(row);
    });
  });
  if (!bodyLines.length) return;

  let lineIndex = 0;
  let isFirstChunk = true;

  while (lineIndex < bodyLines.length) {
    const titleSpace = isFirstChunk ? 22 : 8;
    const availableH = ctx.cursorY - MIN_Y - titleSpace - PAD;
    if (availableH < lineHeight) {
      ctx.page = ctx.pdfDoc.addPage([PAGE_W, PAGE_H]);
      ctx.cursorY = PAGE_H - MARGIN;
      continue;
    }

    const maxLinesThisPage = Math.max(
      1,
      Math.floor((availableH - PAD) / lineHeight),
    );
    const chunkLines = bodyLines.slice(
      lineIndex,
      lineIndex + maxLinesThisPage,
    );
    const blockH = titleSpace + chunkLines.length * lineHeight + PAD;

    ensureSpace(ctx, blockH + 8);

    const topY = ctx.cursorY;
    drawBorderBox(ctx.page, MARGIN, topY - blockH, contentW, blockH);

    if (isFirstChunk) {
      ctx.page.drawText(title, {
        x: MARGIN + PAD,
        y: topY - 14,
        size: 9,
        font: bold,
      });
      isFirstChunk = false;
    }

    let y = topY - titleSpace;
    chunkLines.forEach(row => {
      ctx.page.drawText(row, {
        x: MARGIN + PAD,
        y,
        size: bodySize,
        font,
      });
      y -= lineHeight;
    });

    ctx.cursorY -= blockH + 8;
    lineIndex += chunkLines.length;
  }
};

export async function createStructuredDocumentPdf(
  input: StructuredDocumentPdfInput,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const contentW = PAGE_W - MARGIN * 2;

  const ctx: PdfLayoutContext = {
    pdfDoc,
    page: pdfDoc.addPage([PAGE_W, PAGE_H]),
    font,
    bold,
    cursorY: PAGE_H - MARGIN,
    contentW,
  };

  if (input.documentHeading) {
    ctx.page.drawText(sanitizePdfText(input.documentHeading), {
      x: MARGIN,
      y: ctx.cursorY - 14,
      size: 12,
      font: bold,
    });
    ctx.cursorY -= 24;
  }

  const hasShipTo =
    input.shipTo &&
    (input.shipTo.lines.some(l => String(l).trim()) ||
      input.shipTo.title.trim());

  const colCount = hasShipTo ? 3 : 2;
  const colW = contentW / colCount;
  const fromH = estimateBlockHeight(font, colW, input.from);
  const billH = estimateBlockHeight(font, colW, input.billTo);
  const shipH = hasShipTo
    ? estimateBlockHeight(font, colW, input.shipTo!)
    : 0;
  const topH = Math.max(fromH, billH, shipH, 72);

  const topY = ctx.cursorY;
  drawBorderBox(ctx.page, MARGIN, topY - topH, colW, topH);
  drawBorderBox(ctx.page, MARGIN + colW, topY - topH, colW, topH);
  if (hasShipTo) {
    drawBorderBox(ctx.page, MARGIN + colW * 2, topY - topH, colW, topH);
    drawWrappedBlock(
      ctx.page,
      font,
      bold,
      MARGIN + colW * 2,
      topY,
      colW,
      input.shipTo!,
    );
  }

  drawWrappedBlock(ctx.page, font, bold, MARGIN, topY, colW, input.from);
  drawWrappedBlock(
    ctx.page,
    font,
    bold,
    MARGIN + colW,
    topY,
    colW,
    input.billTo,
  );

  ctx.cursorY -= topH;

  const metaH = Math.max(
    56,
    16 +
      Math.max(input.leftMeta.length, input.rightMeta.length) * 14,
  );
  drawBorderBox(ctx.page, MARGIN, ctx.cursorY - metaH, contentW / 2, metaH);
  drawBorderBox(
    ctx.page,
    MARGIN + contentW / 2,
    ctx.cursorY - metaH,
    contentW / 2,
    metaH,
  );
  drawMetaColumn(ctx.page, font, bold, MARGIN, ctx.cursorY, contentW / 2, input.leftMeta);
  drawMetaColumn(
    ctx.page,
    font,
    bold,
    MARGIN + contentW / 2,
    ctx.cursorY,
    contentW / 2,
    input.rightMeta,
  );
  ctx.cursorY -= metaH;

  const tableHeaders = [
    'S.No',
    'Description of Goods',
    'Qty',
    'Rate',
    'Taxable Value (INR)',
    'IGST (INR)',
    'Total (INR)',
  ];
  const colWidths = [28, 170, 34, 52, 82, 72, 69];
  const headerH = 22;
  const rowH = 20;

  let tableX = MARGIN;
  drawBorderBox(ctx.page, MARGIN, ctx.cursorY - headerH, contentW, headerH);
  tableHeaders.forEach((header, index) => {
    ctx.page.drawText(header, {
      x: tableX + PAD,
      y: ctx.cursorY - headerH + 6,
      size: 8,
      font: bold,
    });
    if (index < tableHeaders.length - 1) {
      tableX += colWidths[index];
      ctx.page.drawLine({
        start: { x: tableX, y: ctx.cursorY - headerH },
        end: { x: tableX, y: ctx.cursorY },
        thickness: 0.6,
        color: BORDER,
      });
    }
  });
  ctx.cursorY -= headerH;

  const items = input.lineItems.length
    ? input.lineItems
    : [
        {
          sno: 1,
          description: '-',
          qty: '-',
          rate: '-',
          taxableValue: '-',
          tax: '-',
          total: '-',
        },
      ];

  for (const item of items) {
    const descLines = wrapLines(
      fmt(item.description),
      font,
      8,
      colWidths[1] - PAD * 2,
    );
    const itemRowH = Math.max(rowH, 8 + descLines.length * 10);

    ensureSpace(ctx, itemRowH + 4);
    drawBorderBox(ctx.page, MARGIN, ctx.cursorY - itemRowH, contentW, itemRowH);

    const values = [
      fmt(item.sno),
      fmt(item.description),
      fmt(item.qty),
      fmt(item.rate),
      fmt(item.taxableValue),
      fmt(item.tax),
      fmt(item.total),
    ];

    let cellX = MARGIN;
    values.forEach((value, index) => {
      if (index === 1) {
        let descY = ctx.cursorY - 12;
        descLines.forEach(line => {
          ctx.page.drawText(line, {
            x: cellX + PAD,
            y: descY,
            size: 8,
            font,
          });
          descY -= 10;
        });
      } else {
        ctx.page.drawText(value, {
          x: cellX + PAD,
          y: ctx.cursorY - itemRowH + 6,
          size: 8,
          font,
        });
      }

      if (index < values.length - 1) {
        cellX += colWidths[index];
        ctx.page.drawLine({
          start: { x: cellX, y: ctx.cursorY - itemRowH },
          end: { x: cellX, y: ctx.cursorY },
          thickness: 0.6,
          color: BORDER,
        });
      }
    });
    ctx.cursorY -= itemRowH;
  }

  const totalRowH = 22;
  ensureSpace(ctx, totalRowH + 10);
  drawBorderBox(ctx.page, MARGIN, ctx.cursorY - totalRowH, contentW, totalRowH);

  let cellX = MARGIN;
  colWidths.forEach((width, index) => {
    if (index > 0) {
      ctx.page.drawLine({
        start: { x: cellX, y: ctx.cursorY - totalRowH },
        end: { x: cellX, y: ctx.cursorY },
        thickness: 0.6,
        color: BORDER,
      });
    }

    if (index === 0) {
      ctx.page.drawText('Total', {
        x: cellX + PAD,
        y: ctx.cursorY - totalRowH + 7,
        size: 9,
        font: bold,
      });
    } else if (index >= 2) {
      const totalIndex = index - 2;
      const value = input.totals[totalIndex]?.value ?? '-';
      ctx.page.drawText(value, {
        x: cellX + PAD,
        y: ctx.cursorY - totalRowH + 7,
        size: 8,
        font: bold,
      });
    }

    cellX += width;
  });

  ctx.cursorY -= totalRowH + 10;

  input.sections?.forEach(section => {
    if (section.lines?.length) drawSectionBlock(ctx, section);
  });

  const signatory = input.signatoryFor?.trim();
  if (input.showSignature && signatory) {
    const sigH = 56;
    ensureSpace(ctx, sigH + 8);
    const sigW = contentW * 0.42;
    drawBorderBox(ctx.page, MARGIN + contentW - sigW, ctx.cursorY - sigH, sigW, sigH);
    ctx.page.drawText(`For ${signatory}`, {
      x: MARGIN + contentW - sigW + PAD,
      y: ctx.cursorY - 16,
      size: 9,
      font: bold,
    });
    ctx.page.drawText('Authorized Signatory', {
      x: MARGIN + contentW - sigW + PAD,
      y: ctx.cursorY - sigH + 10,
      size: 8,
      font,
    });
    ctx.cursorY -= sigH + 8;
  }

  if (!input.hideDeclaration) {
    const declaration =
      input.declaration ??
      [
        '1. This is a computer-generated document and does not require a physical signature.',
        '2. For support, contact Ayurmuni customer care through the mobile app.',
      ];

    const footerH = Math.min(
      110,
      28 +
        declaration.reduce(
          (sum, line) =>
            sum + wrapLines(line, font, 8, contentW - PAD * 2).length * 10,
          0,
        ),
    );

    ensureSpace(ctx, footerH + 20);
    drawBorderBox(ctx.page, MARGIN, ctx.cursorY - footerH, contentW, footerH);

    ctx.page.drawText('Declaration-', {
      x: MARGIN + PAD,
      y: ctx.cursorY - 14,
      size: 9,
      font: bold,
    });

    let declY = ctx.cursorY - 26;
    declaration.forEach(line => {
      wrapLines(line, font, 8, contentW - PAD * 2).forEach(row => {
        ctx.page.drawText(row, { x: MARGIN + PAD, y: declY, size: 8, font });
        declY -= 10;
      });
    });
    ctx.cursorY -= footerH + 12;
  }

  ensureSpace(ctx, 16);
  ctx.page.drawText(
    input.footerNote || 'This is a computer generated document.',
    {
      x: MARGIN,
      y: ctx.cursorY,
      size: 8,
      font,
    },
  );

  return pdfDoc.save();
}
