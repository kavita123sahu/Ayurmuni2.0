export type DisplayIdPrefix =
  | 'ORD'
  | 'RCP'
  | 'CON'
  | 'APT'
  | 'PRX'
  | 'INV';

const PREFIX_RE = /^[A-Z]{2,4}-/i;

/**
 * Format a raw UUID/id for display: PREFIX + last 5 alphanumeric chars.
 * e.g. ORD-98231, RCP-a1b2c, CON-67890
 */
export function formatDisplayId(
  prefix: DisplayIdPrefix,
  rawId: string | number | null | undefined,
): string {
  if (rawId == null) return '-';
  const raw = String(rawId).trim();
  if (!raw) return '-';

  if (PREFIX_RE.test(raw)) {
    const upper = raw.toUpperCase();
    const dash = upper.indexOf('-');
    return `${upper.slice(0, dash + 1)}${upper.slice(dash + 1)}`;
  }

  const alphanumeric = raw.replace(/[^a-zA-Z0-9]/g, '');
  const suffix = alphanumeric.slice(-5).toUpperCase();
  if (!suffix) return '-';
  return `${prefix}-${suffix}`;
}

export const formatOrderId = (rawId: string | number | null | undefined) =>
  formatDisplayId('ORD', rawId);

export const formatReceiptId = (rawId: string | number | null | undefined) =>
  formatDisplayId('RCP', rawId);

export const formatConsultationId = (
  rawId: string | number | null | undefined,
) => formatDisplayId('CON', rawId);

export const formatAppointmentId = (
  rawId: string | number | null | undefined,
) => formatDisplayId('APT', rawId);

export const formatPrescriptionId = (
  rawId: string | number | null | undefined,
) => formatDisplayId('PRX', rawId);

/** UI helper: optional leading # */
export const formatDisplayIdHash = (
  prefix: DisplayIdPrefix,
  rawId: string | number | null | undefined,
): string => {
  const formatted = formatDisplayId(prefix, rawId);
  return formatted === '-' ? '-' : `#${formatted}`;
};
