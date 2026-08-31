/** Match diet/yoga/product-like payloads to a health concern or disease. */
export const itemMatchesHealthConcern = (
  item: any,
  opts: {
    healthCategoryId?: string | null;
    healthDiseaseId?: string | null;
    categoryName?: string | null;
    diseaseName?: string | null;
  },
): boolean => {
  if (!item) return false;

  const categoryId = String(opts.healthCategoryId || '').trim();
  const diseaseId = String(opts.healthDiseaseId || '').trim();
  const categoryName = String(opts.categoryName || '')
    .trim()
    .toLowerCase();
  const diseaseName = String(opts.diseaseName || '')
    .trim()
    .toLowerCase();

  if (!categoryId && !diseaseId && !categoryName && !diseaseName) {
    return true;
  }

  const ids = new Set<string>();
  const names = new Set<string>();

  const pushId = (value: unknown) => {
    const id = String(value ?? '').trim();
    if (id) ids.add(id);
  };
  const pushName = (value: unknown) => {
    const name = String(value ?? '').trim().toLowerCase();
    if (name) names.add(name);
  };

  pushId(item?.health_category_id);
  pushId(item?.health_disease_id);
  pushId(item?.category_id);
  pushId(item?.disease_id);
  pushName(item?.health_category_name);
  pushName(item?.category_name);
  pushName(item?.disease_name);
  pushName(item?.health_disease_name);

  const collect = (list: unknown) => {
    if (!Array.isArray(list)) return;
    list.forEach((entry: any) => {
      if (typeof entry === 'string' || typeof entry === 'number') {
        pushId(entry);
        pushName(entry);
        return;
      }
      pushId(entry?.id);
      pushId(entry?.health_category_id);
      pushId(entry?.health_disease_id);
      pushName(entry?.name);
      pushName(entry?.title);
    });
  };

  collect(item?.health_categories);
  collect(item?.health_category);
  collect(item?.categories);
  collect(item?.health_diseases);
  collect(item?.diseases);
  collect(item?.tags);

  if (diseaseId && ids.has(diseaseId)) return true;
  if (categoryId && ids.has(categoryId)) return true;
  if (diseaseName && [...names].some(n => n.includes(diseaseName) || diseaseName.includes(n))) {
    return true;
  }
  if (
    categoryName &&
    [...names].some(n => n.includes(categoryName) || categoryName.includes(n))
  ) {
    return true;
  }

  // If API already filtered and item has no health metadata, keep it.
  const hasHealthMeta =
    ids.size > 0 ||
    names.size > 0 ||
    item?.health_category_id != null ||
    item?.health_disease_id != null ||
    Array.isArray(item?.health_diseases) ||
    Array.isArray(item?.health_categories);

  return !hasHealthMeta;
};
