import type { TablerIconName } from '../TablerIcon';
import type { PackagePlan } from '../../services/PackageServices';

export const PLAN_GOLD = '#E8C27A';

export type PlanTheme = {
  tint: string;
  accent: string;
  soft: string;
  icon: TablerIconName;
  gradient: string[];
};

const THEMES: PlanTheme[] = [
  {
    tint: '#E8F4EF',
    accent: '#0D614E',
    soft: '#CFE6DC',
    icon: 'stethoscope',
    gradient: ['#0A4A3C', '#0D614E', '#178A6E'],
  },
  {
    tint: '#FFF4E5',
    accent: '#B45309',
    soft: '#FDE3BF',
    icon: 'salad-filled',
    gradient: ['#5B3A0A', '#8A5A12', '#B7791F'],
  },
  {
    tint: '#EEF2FF',
    accent: '#4338CA',
    soft: '#D9DEFC',
    icon: 'heart-handshake',
    gradient: ['#26206B', '#3730A3', '#4F46E5'],
  },
  {
    tint: '#FDECF3',
    accent: '#BE185D',
    soft: '#F9D2E2',
    icon: 'leaf',
    gradient: ['#6B1239', '#9D174D', '#BE185D'],
  },
  {
    tint: '#E6F6FB',
    accent: '#0E7490',
    soft: '#C7EAF3',
    icon: 'shield',
    gradient: ['#0B3F4F', '#0E6070', '#0E7490'],
  },
];

const hash = (value: string) =>
  value.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);

/** Stable colour theme per category so the same category always looks the same. */
export const getPlanTheme = (plan: Pick<PackagePlan, 'category_code' | 'category_name'>) => {
  const key = (plan.category_code || plan.category_name || 'plan').toLowerCase();
  if (key.includes('consult')) return THEMES[0];
  if (key.includes('diet') || key.includes('nutri')) return THEMES[1];
  if (key.includes('care')) return THEMES[2];
  return THEMES[hash(key) % THEMES.length];
};

export const toAmount = (value: string | number | null | undefined) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const getDiscountPercent = (plan: Pick<PackagePlan, 'original_price' | 'selling_price'>) => {
  const original = toAmount(plan.original_price);
  const selling = toAmount(plan.selling_price);
  if (original <= 0 || selling >= original) return 0;
  return Math.round(((original - selling) / original) * 100);
};

/** "90 days validity" / "Monthly autopay" / "Single visit" */
export const getPlanDurationLabel = (plan: PackagePlan) => {
  if (plan.billing_mode && plan.billing_mode !== 'one_time' && plan.billing_period) {
    const every = plan.billing_interval && plan.billing_interval > 1 ? `${plan.billing_interval} ` : '';
    return `Autopay · every ${every}${plan.billing_period}`;
  }
  if (plan.validity_days) {
    if (plan.validity_days % 30 === 0 && plan.validity_days >= 30) {
      const months = plan.validity_days / 30;
      return `${months} month${months > 1 ? 's' : ''} validity`;
    }
    return `${plan.validity_days} days validity`;
  }
  return plan.purchase_type === 'open_plan' ? 'Pay per consult' : 'One-time plan';
};

export const isCarePlan = (plan: PackagePlan) =>
  plan.purchase_type === 'prepaid_package' && plan.can_be_purchased;

export const getPlanCtaLabel = (plan: PackagePlan) =>
  plan.button_action === 'book_consultation' || !plan.can_be_purchased
    ? 'Book consultation'
    : 'Buy now';
