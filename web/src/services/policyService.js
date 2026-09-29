import { apiClient } from './apiClient';

export const getRequiredPolicies = async (policyType) => {
  const endpoint = policyType
    ? `policies/customer/required/?policy_type=${encodeURIComponent(policyType)}`
    : 'policies/customer/required/';

  return apiClient(endpoint, {
    method: 'GET',
  });
};

export const acceptPolicies = async (body) => {
  return apiClient(
    'policies/legal/accept/',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    true,
  );
};

export const getPoliciesList = (response) => {
  const data = response?.data ?? response;
  return Array.isArray(data?.policies) ? data.policies : [];
};
