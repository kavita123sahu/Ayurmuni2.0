/** Strip characters that crash pdf-lib StandardFonts (WinAnsi). */
export const sanitizePdfText = (input: unknown): string => {
  return String(input ?? '')
    .replace(/[\u2018\u2019\u201A\u201B`´]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/[\u2022\u2023\u2043\u2219]/g, '-')
    .replace(/[\u00A0]/g, ' ')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
};
