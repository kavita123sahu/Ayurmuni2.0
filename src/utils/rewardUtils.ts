import { normalizeCoupon, type Coupon } from './couponUtils';

export type Reward = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  points: number | null;
  status: string;
  trigger: string;
  payout_type: string;
  expires_at: string | null;
  source: string;
  created_at: string | null;
  coupon: Coupon | null;
};

const pickList = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.rewards)) return data.rewards;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.coupons)) return data.coupons;
  return [];
};

export const parseRewardBalance = (response: any): number | null => {
  const data = response?.data ?? response ?? {};
  const value =
    data.balance ??
    data.points ??
    data.coins ??
    data.total_points ??
    data.reward_points ??
    data.wallet_points;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const normalizeReward = (raw: any): Reward | null => {
  if (!raw || typeof raw !== 'object') return null;

  // Nested coupon from rewards API (referral grants, etc.)
  const coupon = normalizeCoupon(raw.coupon) || null;

  const title = String(
    raw.rule_name ||
      raw.title ||
      raw.name ||
      coupon?.title ||
      coupon?.code ||
      '',
  ).trim();
  if (!title && !coupon) return null;

  const pointsRaw =
    raw.points ?? raw.coins ?? raw.reward_points ?? raw.amount ?? null;

  const trigger = String(raw.trigger || '').toLowerCase();
  const source = String(
    raw.source || coupon?.source || trigger || 'reward',
  ).toLowerCase();

  return {
    id: String(raw.id || coupon?.id || title),
    title: title || 'Reward',
    description: String(
      coupon?.description ||
        raw.description ||
        raw.subtitle ||
        '',
    ).trim(),
    image_url:
      coupon?.image_url ||
      raw.image_url ||
      raw.image ||
      null,
    points:
      pointsRaw == null || pointsRaw === ''
        ? null
        : Number(pointsRaw) || null,
    status: String(raw.status || 'granted'),
    trigger,
    payout_type: String(raw.payout_type || (coupon ? 'coupon' : '')).toLowerCase(),
    expires_at: coupon?.expires_at || raw.expires_at || null,
    source,
    created_at: raw.created_at || null,
    coupon,
  };
};

export const parseRewardList = (response: any): Reward[] => {
  const seen = new Set<string>();
  return pickList(response)
    .map(normalizeReward)
    .filter((item): item is Reward => {
      if (!item) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
};
