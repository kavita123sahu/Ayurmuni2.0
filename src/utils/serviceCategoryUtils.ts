export type ServiceCategoryKey = 'medicine' | 'products' | 'consult';

const SERVICE_NAME_ALIASES: Record<ServiceCategoryKey, string[]> = {
  medicine: [
    'medicine',
    'medicines',
    'medicine store',
    'medicines store',
    'ayurvedic medicine',
    'ayurvedic medicines',
    'ayurveda medicine',
    'ayurveda medicines',
    'pharmacy',
    'pharma',
  ],
  products: [
    'products',
    'product',
    'store',
    'shop',
    'store products',
    'product store',
    'ayurvedic products',
  ],
  consult: [
    'consult',
    'consultation',
    'consultations',
    'doctor',
    'doctors',
    'teleconsult',
    'online consult',
    'ayurveda consult',
  ],
};

const normalizeName = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const getCategoryName = (item: any): string =>
  normalizeName(
    item?.name ??
      item?.category_name ??
      item?.title ??
      item?.service_name ??
      item?.label ??
      '',
  );

const getCategoryId = (item: any): string | null => {
  const id =
    item?.id ??
    item?.service_category_id ??
    item?.category_id ??
    item?.uuid ??
    null;
  return id != null && String(id).trim() !== '' ? String(id) : null;
};

/** Flatten dashboard category payloads into a list */
export const normalizeServiceCategories = (input: any): any[] => {
  if (Array.isArray(input)) {
    return input;
  }

  if (!input || typeof input !== 'object') {
    return [];
  }

  if (Array.isArray(input.data)) {
    return input.data;
  }
  if (Array.isArray(input.results)) {
    return input.results;
  }
  if (Array.isArray(input.categories)) {
    return input.categories;
  }

  const data = input.data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.categories)) return data.categories;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.service_categories)) return data.service_categories;
  }

  return [];
};

export const getServiceCategoryId = (
  categories: any[] | undefined | null,
  key: ServiceCategoryKey,
): string | null => {
  const list = normalizeServiceCategories(categories);
  const aliases = SERVICE_NAME_ALIASES[key];

  // Exact name match first
  const exact = list.find(item => {
    const name = getCategoryName(item);
    return aliases.includes(name);
  });
  if (exact) {
    return getCategoryId(exact);
  }

  // Partial / contains match (e.g. "Ayurveda Medicines")
  const partial = list.find(item => {
    const name = getCategoryName(item);
    if (!name) {
      return false;
    }
    return aliases.some(
      alias => name === alias || name.includes(alias) || alias.includes(name),
    );
  });
  if (partial) {
    return getCategoryId(partial);
  }

  // Match by slug / code / type fields
  const byMeta = list.find(item => {
    const meta = normalizeName(
      item?.slug ?? item?.code ?? item?.type ?? item?.service_type ?? '',
    );
    return aliases.includes(meta) || aliases.some(a => meta.includes(a));
  });
  if (byMeta) {
    return getCategoryId(byMeta);
  }

  return null;
};

export const getServiceCategoryIds = (categories: any[] | undefined | null) => ({
  medicine: getServiceCategoryId(categories, 'medicine'),
  products: getServiceCategoryId(categories, 'products'),
  consult: getServiceCategoryId(categories, 'consult'),
});
