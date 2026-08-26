import { apiClient } from './APIconfig';

export type FaqCategory =
  | 'general'
  | 'account'
  | 'appointments'
  | 'orders'
  | 'payments'
  | 'products'
  | 'diet_plans'
  | 'yoga'
  | 'medical_records'
  | 'prakriti'
  | string;

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category?: FaqCategory | null;
  category_label?: string | null;
  image?: string | null;
  image_url?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  read_time?: string | number | null;
  read_minutes?: number | null;
  steps?: string[] | null;
  note?: string | null;
  is_active?: boolean;
  [key: string]: any;
};

export const FAQ_CATEGORIES: Array<{
  key: FaqCategory;
  title: string;
  iconName:
    | 'help'
    | 'user'
    | 'calendar'
    | 'receipt'
    | 'credit-card'
    | 'package'
    | 'leaf'
    | 'flame'
    | 'report'
    | 'ingredient';
}> = [
  { key: 'general', title: 'General', iconName: 'help' },
  { key: 'account', title: 'Account', iconName: 'user' },
  { key: 'appointments', title: 'Appointments', iconName: 'calendar' },
  { key: 'orders', title: 'Orders', iconName: 'receipt' },
  { key: 'payments', title: 'Payments', iconName: 'credit-card' },
  { key: 'products', title: 'Products', iconName: 'package' },
  { key: 'diet_plans', title: 'Diet Plans', iconName: 'leaf' },
  { key: 'yoga', title: 'Yoga', iconName: 'flame' },
  { key: 'medical_records', title: 'Records', iconName: 'report' },
  { key: 'prakriti', title: 'Prakriti', iconName: 'ingredient' },
];

const pickList = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.faqs)) return data.faqs;
  if (Array.isArray(data?.items)) return data.items;
  if (data && typeof data === 'object' && (data.id || data.question)) {
    return [data];
  }
  return [];
};

export const normalizeFaqItem = (raw: any): FaqItem | null => {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id || raw.faq_id || raw.uuid || '').trim();
  const question = String(
    raw.question || raw.title || raw.heading || '',
  ).trim();
  if (!id && !question) return null;

  const stepsRaw = raw.steps || raw.step_list || raw.instructions || null;
  let steps: string[] | null = null;
  if (Array.isArray(stepsRaw)) {
    steps = stepsRaw
      .map((s: any) =>
        typeof s === 'string'
          ? s.trim()
          : String(s?.text || s?.title || s?.step || '').trim(),
      )
      .filter(Boolean);
  } else if (typeof stepsRaw === 'string' && stepsRaw.trim()) {
    steps = stepsRaw
      .split(/\n|•|;/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  return {
    ...raw,
    id: id || question,
    question: question || 'Untitled question',
    answer: String(
      raw.answer || raw.description || raw.content || raw.body || '',
    ).trim(),
    category: raw.category || raw.faq_category || null,
    category_label: raw.category_label || raw.category_name || null,
    image: raw.image || raw.image_url || raw.banner || null,
    image_url: raw.image_url || raw.image || raw.banner || null,
    updated_at: raw.updated_at || raw.modified_at || raw.updated_on || null,
    created_at: raw.created_at || raw.created_on || null,
    read_time: raw.read_time || raw.read_minutes || raw.reading_time || null,
    read_minutes: raw.read_minutes ?? raw.read_time ?? null,
    steps,
    note: raw.note || raw.important_note || raw.tip || null,
    is_active: raw.is_active !== false,
  };
};

/** GET /customers/faqs/ — all active FAQs, optional category / id filters. */
export const getFaqs = async (params?: {
  category?: FaqCategory | null;
  id?: string | null;
}) => {
  try {
    const qs = new URLSearchParams();
    if (params?.id) qs.set('id', String(params.id));
    if (params?.category) qs.set('category', String(params.category));
    const query = qs.toString();
    const endpoint = query
      ? `customers/faqs/?${query}`
      : 'customers/faqs/';

    const response = await apiClient(endpoint, { method: 'GET' });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getFaqList = async (category?: FaqCategory | null) => {
  const response = await getFaqs({ category: category || undefined });
  return pickList(response)
    .map(normalizeFaqItem)
    .filter(Boolean) as FaqItem[];
};

export const getFaqDetail = async (id: string) => {
  const response = await getFaqs({ id });
  const list = pickList(response)
    .map(normalizeFaqItem)
    .filter(Boolean) as FaqItem[];
  if (list.length) return list[0];

  const data = response?.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return normalizeFaqItem(data);
  }
  return null;
};
