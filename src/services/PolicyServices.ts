import { apiClient } from './APIconfig';

/**
 * GET /policies/customer/required/
 * - with policyType → ?policy_type=privacy_policy
 * - without → all policies
 * Requires auth token.
 */
export const getRequiredPolicies = async (
  policyType?: string | null,
) => {
  try {
    const endpoint = policyType
      ? `policies/customer/required/?policy_type=${encodeURIComponent(policyType)}`
      : 'policies/customer/required/';

    const response = await apiClient(endpoint, {
      method: 'GET',
    });

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * GET /policies/legal/required/
 * Public (no token) — used on Login before auth.
 * policy_type: terms_and_conditions | privacy_policy
 */
export const getLegalRequiredPolicies = async (
  policyType?: string | null,
) => {
  const endpoint = policyType
    ? `policies/legal/required/?policy_type=${encodeURIComponent(policyType)}`
    : 'policies/legal/required/';

  return apiClient(
    endpoint,
    {
      method: 'GET',
    },
    false,
  );
};

/**
 * POST /policies/customer/accept/
 * body: { type: 'all' } | { policy_type: 'privacy_policy' }
 * (Legal accept for customer role — same endpoint used by Terms gate)
 */
export const acceptPolicies = async (body: {
  type?: 'all';
  policy_type?: string;
}) => {
  return apiClient(
    'policies/legal/accept/',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    true,
  );
};

/** Parse list from required / legal API response (flexible shapes). */
export const getPoliciesList = (response: any) => {
  if (!response) return [];

  const candidates = [
    response?.data?.policies,
    response?.policies,
    response?.data?.data?.policies,
    response?.data,
    response?.results,
    response?.data?.results,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) {
      // list of policy entries, or accidental raw content blocks
      if (
        item.length === 0 ||
        item[0]?.policy != null ||
        item[0]?.policy_type != null ||
        item[0]?.title != null ||
        item[0]?.content != null ||
        item[0]?.name != null
      ) {
        return item;
      }
    }
  }

  // Single policy wrapped as { data: { policy: {...} } } or { data: {...} }
  const single =
    response?.data?.policy ??
    response?.policy ??
    (response?.data &&
    (response.data.policy_type ||
      response.data.content ||
      response.data.title)
      ? response.data
      : null);

  if (single) return [single];

  return [];
};

/** Resolve policy document + content blocks from a list entry or raw doc. */
export const getPolicyDocument = (entry: any) => {
  if (!entry) return null;
  const doc = entry?.policy ?? entry;
  if (!doc || typeof doc !== 'object') return null;
  return doc;
};

export const normalizePolicyContent = (content: any): any[] => {
  if (Array.isArray(content)) return content;
  if (typeof content === 'string' && content.trim()) {
    return [{ type: 'paragraph', text: content.trim() }];
  }
  return [];
};
