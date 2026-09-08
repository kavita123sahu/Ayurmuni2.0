import { apiClient } from './APIconfig';

/**
 * GET /policies/customer/required/
 * - with policyType → ?policy_type=privacy_policy
 * - without → all policies
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
 * POST /policies/customer/accept/
 * body: { type: 'all' } | { policy_type: 'privacy_policy' }
 * (Legal accept for customer role — same endpoint used by Terms gate)
 */
export const acceptPolicies = async (body: {
  type?: 'all';
  policy_type?: string;
}) => {
  return apiClient(
    'policies/customer/accept/',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    true,
  );
};

/** Parse list from required API response */
export const getPoliciesList = (response: any) => {
  const data = response?.data ?? response;
  return Array.isArray(data?.policies) ? data.policies : [];
};
