/** Title Case: "acid reflux" → "Acid Reflux" */
export const toTitleCase = (value?: string | null): string => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  return raw
    .split(/\s+/)
    .map(word => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/** First word Title Case, rest of words UPPERCASE: "Health concerns" → "Health CONCERNS" */
export const formatSecondWordUpper = (value?: string | null): string => {
  const parts = String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return toTitleCase(parts[0]);
  const first = toTitleCase(parts[0]);
  const rest = parts.slice(1).map(w => w.toUpperCase()).join(' ');
  return `${first} ${rest}`;
};
