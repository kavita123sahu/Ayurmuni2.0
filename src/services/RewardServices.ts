import { apiClient } from './APIconfig';
import { parseRewardBalance, parseRewardList } from '../utils/rewardUtils';

/** GET /promotions/rewards/ */
export const getRewards = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
}) => {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value == null || value === '') return;
    qs.set(key, String(value));
  });
  const encoded = qs.toString();
  return apiClient(`promotions/rewards/${encoded ? `?${encoded}` : ''}`, {
    method: 'GET',
  });
};

export const fetchRewards = async () => {
  try {
    const response = await getRewards({ page: 1, page_size: 50 });
    if (response?.success === false) {
      return { rewards: [], balance: null as number | null };
    }
    return {
      rewards: parseRewardList(response),
      balance: parseRewardBalance(response),
    };
  } catch {
    return { rewards: [], balance: null as number | null };
  }
};
