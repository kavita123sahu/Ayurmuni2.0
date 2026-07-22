/** Match a keyword against multiple string fields (case-insensitive). */
export const matchesSearch = (
  keyword: string,
  ...fields: (string | null | undefined)[]
): boolean => {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  return fields.some(f => (f ?? '').toLowerCase().includes(q));
};

/** API expects experience as N+ (e.g. 5+). */
export const formatExperienceParam = (value?: string): string => {
  if (!value) return '';
  const v = String(value).trim();
  if (!v) return '';
  return v.endsWith('+') ? v : `${v}+`;
};
