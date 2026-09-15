/** Helpers for legal policy acceptance + version update banners. */

export type PolicyAcceptedMap = {
  customer?: boolean;
  doctor?: boolean;
  vendor?: boolean;
};

export const parsePolicyAcceptedCustomer = (payload: any): boolean => {
  const map =
    payload?.policy_accepted ??
    payload?.data?.policy_accepted ??
    payload?.data?.data?.policy_accepted;
  if (!map || typeof map !== 'object') return false;
  return map.customer === true;
};

export const getPolicyDoc = (entry: any) => entry?.policy ?? entry ?? null;

const POLICY_ICON_FALLBACKS = [
  'file',
  'shield',
  'lock',
  'receipt',
  'clipboard-list',
  'world',
] as const;

/** Distinct icon per policy so the All policies list is not one generic medical symbol. */
export const policyIconName = (entry: any, index = 0): string => {
  const doc = getPolicyDoc(entry);
  const key = `${doc?.policy_type || ''} ${doc?.title || ''} ${doc?.name || ''}`
    .toLowerCase();
  if (key.includes('privacy')) return 'lock';
  if (key.includes('term') || key.includes('license')) return 'clipboard-list';
  if (key.includes('refund')) return 'refund';
  if (key.includes('return')) return 'refresh';
  if (key.includes('ship') || key.includes('deliver')) return 'truck';
  if (key.includes('cancel')) return 'alert-circle';
  if (key.includes('cookie')) return 'settings';
  if (key.includes('payment') || key.includes('billing')) return 'payment';
  if (key.includes('consent')) return 'shield';
  if (
    key.includes('medical') ||
    key.includes('disclaimer') ||
    key.includes('health')
  ) {
    return 'stethoscope';
  }
  return POLICY_ICON_FALLBACKS[index % POLICY_ICON_FALLBACKS.length];
};

export const getPolicyVersion = (entry: any): number | null => {
  const doc = getPolicyDoc(entry);
  const n = Number(doc?.version);
  return Number.isFinite(n) ? n : null;
};

export const getAcceptedVersion = (entry: any): number | null => {
  const n = Number(entry?.accepted_version);
  return Number.isFinite(n) ? n : null;
};

/** True when user previously accepted but published version is newer. */
export const isPolicyVersionUpdated = (entry: any): boolean => {
  if (!entry || typeof entry !== 'object') return false;
  const current = getPolicyVersion(entry);
  const accepted = getAcceptedVersion(entry);
  if (current == null || accepted == null) return false;
  return accepted !== current;
};

export const isPolicyAccepted = (entry: any): boolean =>
  entry?.is_accepted === false;
