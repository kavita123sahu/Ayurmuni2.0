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
  entry?.is_accepted === true;
