/**
 * Diet plan helpers — list / details / plan_json meals + frontend nutrition.
 */

export type DietMeal = {
  id: string;
  dayKey: string;
  mealKey: string;
  type: string;
  time: string;
  title: string;
  subtitle: string;
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  /** Display labels for list UI (always strings) */
  dietItems: string[];
  /** Structured items when API sends { name, notes, quantity } */
  dietItemDetails: DietFoodItem[];
  preparationSteps: string[];
  image?: any;
  status: 'log' | 'done';
  raw?: any;
};

export type DietFoodItem = {
  name: string;
  notes: string;
  quantity: string;
  label: string;
};

export type DietPlanSummary = {
  id: string;
  name: string;
  title: string;
  season?: string | null;
  prakriti?: string | null;
  is_common?: boolean;
  is_paid?: boolean;
  price?: number;
  short_description?: string;
  patient_diet_plan_id?: string | null;
  patient_assignment_status?: string | null;
  started_at?: string | null;
  repeat_count?: number | null;
  ended_at?: string | null;
  health_diseases?: { id: string; name: string }[];
  [key: string]: any;
};

export type DietNutrition = {
  goalKcal: number;
  eatenKcal: number;
  burnedKcal: number;
  leftKcal: number;
  carbsPct: number;
  proteinPct: number;
  fatPct: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  waterMl: number;
  waterGoalMl: number;
  mealsDone: number;
  mealsTotal: number;
  mealProgressPct: number;
};

export type DietProgressItem = {
  day: string;
  meal: string;
  status: string;
  completed_at?: string | null;
};

const FALLBACK_MEAL_IMAGE = require('../assets/images/login/7.jpg');

const MEAL_ORDER = ['morning', 'breakfast', 'midday', 'lunch', 'dinner'] as const;

const MEAL_LABELS: Record<string, string> = {
  morning: 'MORNING',
  breakfast: 'BREAKFAST',
  midday: 'MIDDAY',
  lunch: 'LUNCH',
  dinner: 'DINNER',
};

const MEAL_TIMES: Record<string, string> = {
  morning: '07:00 AM',
  breakfast: '08:30 AM',
  midday: '11:00 AM',
  lunch: '01:15 PM',
  dinner: '07:45 PM',
};

/** API may send diet as strings OR { name, notes, quantity } objects. */
export const normalizeDietFoodItem = (item: any): DietFoodItem | null => {
  if (item == null) return null;

  if (typeof item === 'string' || typeof item === 'number') {
    const name = String(item).trim();
    if (!name) return null;
    return { name, notes: '', quantity: '', label: name };
  }

  if (typeof item === 'object') {
    const name = String(
      item.name ?? item.title ?? item.food ?? item.item ?? '',
    ).trim();
    const quantity = String(
      item.quantity ?? item.qty ?? item.amount ?? '',
    ).trim();
    const notes = String(item.notes ?? item.note ?? item.description ?? '').trim();

    const parts = [
      name,
      quantity ? `(${quantity})` : '',
      notes,
    ].filter(Boolean);
    const label = parts.join(' ').trim();
    if (!label) return null;

    return { name: name || label, notes, quantity, label };
  }

  return null;
};

export const normalizeDietFoodItems = (diet: any): DietFoodItem[] => {
  if (!Array.isArray(diet)) return [];
  return diet
    .map(normalizeDietFoodItem)
    .filter((item): item is DietFoodItem => !!item?.label);
};

const toSafeText = (value: any): string => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'object') {
    return (
      normalizeDietFoodItem(value)?.label ||
      String(value.name ?? value.title ?? value.label ?? '')
    );
  }
  return '';
};

export type DietGalleryItem = {
  image_url: string;
  caption?: string;
  is_cover?: boolean;
  media_url?: string;
};

/** Plan-level gallery: API uses diet_plan_gallery (list) and/or diet_gallery (detail). */
const getPlanGalleryArray = (item?: any): any[] => {
  if (Array.isArray(item?.diet_plan_gallery) && item.diet_plan_gallery.length) {
    return item.diet_plan_gallery;
  }
  if (Array.isArray(item?.diet_gallery) && item.diet_gallery.length) {
    return item.diet_gallery;
  }
  if (Array.isArray(item?.gallery) && item.gallery.length) {
    return item.gallery;
  }
  return [];
};

const galleryItemUrl = (g: any): string =>
  String(
    g?.image_url || g?.media_url || g?.url || g?.image || '',
  ).trim();

/** Prefer cover from diet_plan_gallery / diet_gallery, else legacy fields. */
export const getDietPlanCoverUrl = (item?: any): string => {
  const gallery = getPlanGalleryArray(item);

  const cover =
    gallery.find((g: any) => g?.is_cover && galleryItemUrl(g)) ||
    gallery.find((g: any) => galleryItemUrl(g));

  const uri =
    galleryItemUrl(cover) ||
    item?.thumbnail_url ||
    item?.image_url ||
    item?.cover_image ||
    item?.banner_url ||
    (typeof item?.image === 'string' ? item.image : null) ||
    '';

  return String(uri || '').trim();
};

/** Full plan gallery for detail carousel (Detailimages-compatible). */
export const getDietPlanGallery = (item?: any): DietGalleryItem[] => {
  const gallery = getPlanGalleryArray(item);

  const fromGallery = gallery
    .map((g: any) => {
      const url = galleryItemUrl(g);
      return {
        image_url: url,
        caption: String(g?.caption || ''),
        is_cover: Boolean(g?.is_cover),
        media_url: url,
      };
    })
    .filter((g: any) => !!g.image_url);

  if (fromGallery.length) {
    return [...fromGallery].sort(
      (a, b) => Number(b.is_cover) - Number(a.is_cover),
    );
  }

  const fallback = getDietPlanCoverUrl(item);
  return fallback
    ? [{ image_url: fallback, caption: '', is_cover: true, media_url: fallback }]
    : [];
};

export const resolveDietImage = (item?: any) => {
  const uri = getDietPlanCoverUrl(item);
  if (uri) return { uri };
  if (item?.image && typeof item.image === 'object') return item.image;
  return FALLBACK_MEAL_IMAGE;
};

/** Meal-level gallery from plan_json.*.diet_gallery */
export const getMealGalleryUrl = (mealRaw?: any): string => {
  if (!mealRaw || typeof mealRaw !== 'object') return '';

  const gallery = Array.isArray(mealRaw?.diet_gallery)
    ? mealRaw.diet_gallery
    : Array.isArray(mealRaw?.gallery)
      ? mealRaw.gallery
      : [];

  const first = gallery.find((g: any) => galleryItemUrl(g));
  const fromGallery = galleryItemUrl(first);
  if (fromGallery) return fromGallery;

  return String(
    mealRaw?.image_url ||
      mealRaw?.thumbnail_url ||
      (typeof mealRaw?.image === 'string' ? mealRaw.image : '') ||
      '',
  ).trim();
};

export const resolveMealImage = (mealRaw?: any) => {
  const uri = getMealGalleryUrl(mealRaw);
  if (uri) return { uri };
  return FALLBACK_MEAL_IMAGE;
};

/**
 * Progress plan_json often omits diet_gallery — copy meal images from catalog detail.
 */
export const mergePlanJsonWithGalleries = (
  catalogJson: any,
  progressJson: any,
): any => {
  if (!progressJson || typeof progressJson !== 'object') {
    return catalogJson || progressJson;
  }
  if (!catalogJson || typeof catalogJson !== 'object') {
    return progressJson;
  }

  const merged: Record<string, any> = { ...progressJson };

  Object.keys(progressJson).forEach(dayKey => {
    const pDay = progressJson[dayKey];
    const cDay = catalogJson[dayKey];
    if (!pDay || typeof pDay !== 'object' || Array.isArray(pDay) || !cDay) {
      return;
    }

    const dayMerged: Record<string, any> = { ...pDay };
    Object.keys(pDay).forEach(mealKey => {
      const pMeal = pDay[mealKey];
      const cMeal = cDay?.[mealKey];
      if (!pMeal || typeof pMeal !== 'object' || Array.isArray(pMeal)) return;
      if (!cMeal || typeof cMeal !== 'object') return;

      const hasGallery = !!getMealGalleryUrl(pMeal);
      if (!hasGallery && getMealGalleryUrl(cMeal)) {
        dayMerged[mealKey] = {
          ...pMeal,
          diet_gallery: cMeal.diet_gallery || cMeal.gallery,
        };
      }
    });
    merged[dayKey] = dayMerged;
  });

  return merged;
};

/** Flatten API error shapes like { id: ['…'] } or message: ['…'] */
export const extractDietApiError = (
  res: any,
  fallback = 'Something went wrong',
): string => {
  const pickString = (value: any): string => {
    if (typeof value === 'string') return value.trim();
    return '';
  };
  /** DRF validation: only arrays are field errors (avoid treating UUID `id` as message). */
  const pickFieldError = (value: any): string => {
    if (Array.isArray(value) && value.length) return String(value[0]).trim();
    return '';
  };

  const GENERIC = new Set([
    'something went wrong',
    'network error',
    'session expired',
  ]);

  const bodies = [res?.data, res].filter(
    (b): b is Record<string, any> =>
      !!b && typeof b === 'object' && !Array.isArray(b),
  );

  for (const body of bodies) {
    for (const key of ['diet_plan_id', 'id', 'non_field_errors']) {
      const msg = pickFieldError(body[key]);
      if (msg) return msg;
    }
    const detail = pickString(body.detail) || pickFieldError(body.detail);
    if (detail) return detail;
    const err = pickString(body.error) || pickFieldError(body.error);
    if (err) return err;
  }

  for (const body of bodies) {
    const msg =
      pickString(body.message) || pickFieldError(body.message);
    if (msg && !GENERIC.has(msg.toLowerCase())) return msg;
  }

  return fallback;
};

export const isDietPlanStarted = (plan?: any): boolean => {
  if (!plan) return false;
  const status = String(
    plan?.patient_assignment_status || plan?.status || '',
  ).toLowerCase();
  if (
    status.includes('pause') ||
    status.includes('stop') ||
    status.includes('complete') ||
    status.includes('cancel')
  ) {
    return false;
  }
  if (plan?.patient_diet_plan_id && status) {
    if (status === 'active' || status.includes('start')) return true;
  }
  return (
    status === 'active' ||
    status.includes('started') ||
    status.includes('in_progress') ||
    status.includes('ongoing')
  );
};

export const getDietRepeatCount = (plan?: any): number => {
  if (!plan) return 0;
  const raw =
    plan?.repeat_count ??
    plan?.patient_repeat_count ??
    plan?.times_repeated ??
    0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

/** Human label: first run vs repeat #N */
export const getDietRunLabel = (plan?: any): string => {
  const count = getDietRepeatCount(plan);
  if (count <= 0) return 'First time';
  return `Repeat #${count}`;
};

/** Display status for diet plan list cards */
export type DietListStatus =
  | 'active'
  | 'paused'
  | 'completed'
  | 'stopped'
  | 'not_started';

export const getDietListStatus = (plan?: any): DietListStatus => {
  const status = String(
    plan?.patient_assignment_status || plan?.status || '',
  ).toLowerCase();
  if (status.includes('complete')) return 'completed';
  if (status.includes('pause')) return 'paused';
  if (status.includes('stop') || status.includes('cancel')) return 'stopped';
  if (
    status === 'active' ||
    status.includes('start') ||
    status.includes('in_progress') ||
    status.includes('ongoing')
  ) {
    return 'active';
  }
  if (plan?.patient_diet_plan_id && !status) return 'paused';
  return 'not_started';
};

export const isNoActiveDietPlanError = (res: any): boolean => {
  if (!res) return false;
  const code = String(
    res?.code || res?.data?.code || res?.errors?.code || '',
  ).toLowerCase();
  if (code === 'no_active_plan') return true;
  const msg = String(res?.message || res?.data?.message || '').toLowerCase();
  if (msg.includes('no active diet') || msg.includes('not currently active')) {
    return true;
  }
  const idErr = res?.errors?.id || res?.data?.errors?.id;
  if (Array.isArray(idErr)) {
    return idErr.some((e: any) =>
      String(e || '')
        .toLowerCase()
        .includes('not currently active'),
    );
  }
  return res?.status === 404 && msg.includes('diet');
};

export const mapDietPlanSummary = (item: any): DietPlanSummary => {
  const diseases = Array.isArray(item?.health_diseases)
    ? item.health_diseases
    : [];
  const diseaseNames = diseases
    .map((d: any) => d?.name)
    .filter(Boolean)
    .join(', ');

  return {
    ...item,
    id: String(item?.id ?? ''),
    name: String(item?.name ?? item?.title ?? 'Diet Plan'),
    title: String(item?.name ?? item?.title ?? 'Diet Plan'),
    short_description: diseaseNames || item?.season || item?.prakriti || '',
    health_diseases: diseases,
    patient_diet_plan_id: item?.patient_diet_plan_id ?? null,
    patient_assignment_status: item?.patient_assignment_status ?? null,
    started_at: item?.started_at ?? null,
    repeat_count:
      item?.repeat_count ??
      item?.patient_repeat_count ??
      item?.times_repeated ??
      0,
  };
};

export const normalizeDietPlanList = (response: any): DietPlanSummary[] => {
  if (!response) return [];
  if (Array.isArray(response)) {
    return response.map(mapDietPlanSummary).filter(p => p.id);
  }

  const data = response?.data ?? response?.results ?? response;
  if (Array.isArray(data)) {
    return data.map(mapDietPlanSummary).filter(p => p.id);
  }

  if (data && typeof data === 'object') {
    const list =
      data.results ||
      data.diet_plans ||
      data.plans ||
      data.items ||
      data.all ||
      data.catalog ||
      null;
    if (Array.isArray(list)) {
      return list.map(mapDietPlanSummary).filter(p => p.id);
    }
    if (data.id || data.name) {
      return [mapDietPlanSummary(data)];
    }
  }

  const numericKeys = Object.keys(response)
    .filter(key => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b));
  if (numericKeys.length > 0) {
    return numericKeys
      .map(key => mapDietPlanSummary(response[key]))
      .filter(p => p.id);
  }

  return [];
};

export const extractDietPlanDetail = (response: any): any | null => {
  if (!response) return null;
  if (response.success === false) return null;
  const data = response?.data ?? response;
  if (!data || typeof data !== 'object') return null;
  if (data.success === false && !data.plan_json && !data.name) return null;
  if (Array.isArray(data)) return data[0] ?? null;
  if (data?.diet_plan) return data.diet_plan;
  if (data?.plan) return data.plan;
  if (data?.id || data?.name || data?.plan_json) return data;
  return null;
};

const nutritionValue = (nutrition: any, key: string): number => {
  const node = nutrition?.[key];
  if (node == null) return 0;
  if (typeof node === 'number') return node;
  const v = Number(node?.value ?? node);
  return Number.isFinite(v) ? v : 0;
};

export const getPlanJsonDays = (plan: any): string[] => {
  const json = plan?.plan_json ?? plan?.data?.plan_json;
  if (!json || typeof json !== 'object') return [];
  // Keep original keys from plan_json (day_1, day_2, ...)
  return Object.keys(json)
    .filter(k => /^day_\d+$/i.test(k))
    .sort((a, b) => {
      const na = Number(a.replace(/\D/g, '')) || 0;
      const nb = Number(b.replace(/\D/g, '')) || 0;
      return na - nb;
    });
};

const COMPLETED_STATUSES = new Set([
  'completed',
  'complete',
  'done',
  'logged',
  'true',
  '1',
]);

const isCompletedStatus = (status: unknown): boolean => {
  if (status === true || status === 1) return true;
  const s = String(status ?? '').toLowerCase().trim();
  return COMPLETED_STATUSES.has(s);
};

/** Day index from started_at (1-based), clamped to available plan_json days */
export const resolveCurrentDayKey = (
  plan: any,
  progress?: DietProgressItem[] | null,
): string => {
  const days = getPlanJsonDays(plan);
  if (days.length === 0) return 'day_1';

  // Prefer progress current day if API sends incomplete meals for a day
  if (Array.isArray(progress) && progress.length) {
    const last = progress[progress.length - 1];
    const lastDay = String(last?.day || '').toLowerCase();
    const matchedDay = days.find(d => d.toLowerCase() === lastDay);
    if (matchedDay) {
      const dayMeals = progress.filter(
        p => String(p.day).toLowerCase() === lastDay,
      );
      const allDone = MEAL_ORDER.every(m =>
        dayMeals.some(
          p =>
            String(p.meal).toLowerCase() === m &&
            isCompletedStatus(p.status),
        ),
      );
      if (!allDone) return matchedDay;
      const idx = days.findIndex(d => d.toLowerCase() === lastDay);
      if (idx >= 0 && idx < days.length - 1) return days[idx + 1];
      return matchedDay;
    }
  }

  const startedAt = plan?.started_at;
  if (startedAt) {
    const start = new Date(startedAt);
    if (!Number.isNaN(start.getTime())) {
      const now = new Date();
      const startDay = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
      );
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.max(
        0,
        Math.floor((today.getTime() - startDay.getTime()) / 86400000),
      );
      const dayIndex = Math.min(diffDays, days.length - 1);
      return days[dayIndex] || days[0];
    }
  }

  return days[0];
};

const mapProgressRow = (p: any): DietProgressItem | null => {
  if (!p || typeof p !== 'object') return null;
  const day = String(p.day ?? p.day_key ?? p.day_name ?? '')
    .toLowerCase()
    .trim();
  const meal = String(p.meal ?? p.meal_type ?? p.meal_key ?? p.slot ?? '')
    .toLowerCase()
    .trim();
  if (!day || !meal) return null;

  let status = String(p.status ?? '').toLowerCase().trim();
  if (!status && (p.completed || p.is_completed || p.is_logged || p.logged)) {
    status = 'completed';
  }
  if (!status && p.completed_at) {
    status = 'completed';
  }

  return {
    day,
    meal,
    status: status || 'pending',
    completed_at: p.completed_at ?? null,
  };
};

const parseDayMealObject = (data: any): DietProgressItem[] => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
  const items: DietProgressItem[] = [];

  Object.keys(data).forEach(dayRaw => {
    if (!/^day_\d+$/i.test(dayRaw)) return;
    const day = dayRaw.toLowerCase();
    const meals = data[dayRaw];
    if (!meals || typeof meals !== 'object' || Array.isArray(meals)) return;

    Object.keys(meals).forEach(mealRaw => {
      const meal = mealRaw.toLowerCase();
      const val = meals[mealRaw];
      let status = '';
      let completed_at: string | null = null;

      if (typeof val === 'string' || typeof val === 'boolean' || typeof val === 'number') {
        status = String(val);
      } else if (val && typeof val === 'object') {
        status = String(val.status ?? (val.completed || val.is_completed ? 'completed' : ''));
        completed_at = val.completed_at ?? null;
        if (!status && completed_at) status = 'completed';
      }

      if (status || completed_at) {
        items.push({
          day,
          meal,
          status: status || 'completed',
          completed_at,
        });
      }
    });
  });

  return items;
};

/**
 * Parse GET /patients/diet-plans/progress/ response.
 * Completed meals live under data.progress_json:
 * { day_1: { morning: { status: "completed", completed_at }, ... }, ... }
 */
export const normalizeProgressList = (response: any): DietProgressItem[] => {
  if (!response) return [];

  const root = response?.data ?? response;

  // Primary shape from API: data.progress_json.day_N.meal.status
  const fromProgressJson = parseDayMealObject(root?.progress_json);
  if (fromProgressJson.length) return fromProgressJson;
  const fromTopLevel = parseDayMealObject(response?.progress_json);
  if (fromTopLevel.length) return fromTopLevel;

  const pools = [
    root?.progress,
    root?.meal_progress,
    root?.items,
    root?.results,
    response?.progress,
    response?.meal_progress,
    response?.results,
    root,
    response,
  ];

  for (const pool of pools) {
    if (Array.isArray(pool)) {
      const items = pool
        .map(mapProgressRow)
        .filter(Boolean) as DietProgressItem[];
      if (items.length) return items;
    }
  }

  for (const pool of pools) {
    if (pool && typeof pool === 'object' && !Array.isArray(pool)) {
      const candidates = [
        parseDayMealObject(pool.progress_json),
        parseDayMealObject(pool),
        parseDayMealObject(pool.progress),
        parseDayMealObject(pool.days),
        parseDayMealObject(pool.plan_progress),
        parseDayMealObject(pool.meal_progress),
      ];
      for (const items of candidates) {
        if (items.length) return items;
      }
    }
  }

  return [];
};

/** Extra fields from progress API payload */
export const extractProgressPayload = (response: any) => {
  const data = response?.data ?? response;
  if (!data || typeof data !== 'object') {
    return {
      progressList: [] as DietProgressItem[],
      planJson: null as any,
      startedAt: null as string | null,
      assignmentId: null as string | null,
      dietPlanId: null as string | null,
      status: null as string | null,
    };
  }

  return {
    progressList: normalizeProgressList(response),
    planJson: data.plan_json ?? null,
    startedAt: data.started_at ?? null,
    assignmentId: data.id ? String(data.id) : null,
    dietPlanId: data.diet_plan_id ? String(data.diet_plan_id) : null,
    status: data.status ? String(data.status) : null,
  };
};

export const isMealCompleted = (
  progress: DietProgressItem[],
  dayKey: string,
  mealKey: string,
): boolean => {
  const day = String(dayKey || '').toLowerCase();
  const meal = String(mealKey || '').toLowerCase();
  return progress.some(
    p =>
      String(p.day || '').toLowerCase() === day &&
      String(p.meal || '').toLowerCase() === meal &&
      isCompletedStatus(p.status),
  );
};

export type DietDayChip = {
  dayKey: string;
  label: string;
  dayNumber: number;
  isToday: boolean;
  mealsTotal: number;
  mealsDone: number;
  progressPct: number;
};

/** Build day chips for plan_json + progress_json */
export const buildDietDayChips = (
  plan: any,
  progress: DietProgressItem[] = [],
  todayDayKey?: string | null,
): DietDayChip[] => {
  const days = getPlanJsonDays(plan);
  const today = String(todayDayKey || resolveCurrentDayKey(plan, progress)).toLowerCase();

  return days.map(dayKey => {
    const meals = mapPlanJsonMeals(plan, dayKey, progress);
    const mealsTotal = meals.length;
    const mealsDone = meals.filter(m => m.status === 'done').length;
    const dayNumber = Number(String(dayKey).replace(/\D/g, '')) || 0;
    return {
      dayKey,
      label: `Day ${dayNumber || dayKey}`,
      dayNumber,
      isToday: String(dayKey).toLowerCase() === today,
      mealsTotal,
      mealsDone,
      progressPct:
        mealsTotal > 0 ? Math.round((mealsDone / mealsTotal) * 100) : 0,
    };
  });
};

/** Map plan_json day meals into MealCard-ready list */
export const mapPlanJsonMeals = (
  plan: any,
  dayKey: string,
  progress: DietProgressItem[] = [],
): DietMeal[] => {
  const planJson = plan?.plan_json || {};
  const resolvedDayKey =
    Object.keys(planJson).find(
      k => k.toLowerCase() === String(dayKey || '').toLowerCase(),
    ) || dayKey;
  const dayData = planJson?.[resolvedDayKey];
  if (!dayData || typeof dayData !== 'object') return [];

  const mealKeys = [
    ...MEAL_ORDER.filter(k => dayData[k]),
    ...Object.keys(dayData).filter(
      k => !MEAL_ORDER.includes(k as any) && dayData[k]?.diet,
    ),
  ];

  return mealKeys.map(mealKey => {
    const raw = dayData[mealKey] || {};
    const dietItemDetails = normalizeDietFoodItems(raw.diet);
    const dietItems = dietItemDetails.map(item => item.label);
    const steps: string[] = Array.isArray(raw.preparation_steps)
      ? raw.preparation_steps.map(toSafeText).filter(Boolean)
      : [];
    const nutrition = raw.nutrition || {};
    const kcal = nutritionValue(nutrition, 'total_calories');
    const carbs = nutritionValue(nutrition, 'carbs');
    const protein = nutritionValue(nutrition, 'protein');
    const fat = nutritionValue(nutrition, 'fat');
    const done = isMealCompleted(progress, dayKey, mealKey);
    const mealImage = resolveMealImage(raw);

    return {
      id: `${dayKey}-${mealKey}`,
      dayKey,
      mealKey,
      type: MEAL_LABELS[mealKey] || mealKey.toUpperCase(),
      time: MEAL_TIMES[mealKey] || '',
      title:
        dietItemDetails[0]?.name ||
        dietItems[0] ||
        MEAL_LABELS[mealKey] ||
        mealKey,
      subtitle:
        dietItemDetails
          .slice(1)
          .map(d => d.name)
          .filter(Boolean)
          .join(' · ') ||
        dietItems.slice(1).join(' · ') ||
        steps[0] ||
        '',
      kcal,
      carbs,
      protein,
      fat,
      dietItems,
      dietItemDetails,
      preparationSteps: steps,
      image: mealImage,
      status: done ? 'done' : 'log',
      raw,
    };
  });
};

/** Day goal = sum of all meal calories for that day */
export const calculateDayGoalKcal = (plan: any, dayKey: string): number => {
  const meals = mapPlanJsonMeals(plan, dayKey, []);
  const total = meals.reduce((sum, m) => sum + (m.kcal || 0), 0);
  return total > 0 ? total : 2200;
};

export const calculateDietNutrition = (
  meals: DietMeal[],
  plan?: any,
  dayKey?: string,
  extras?: { waterMl?: number; burnedKcal?: number },
): DietNutrition => {
  const logged = meals.filter(m => m.status === 'done');
  const eatenKcal = logged.reduce((sum, m) => sum + (Number(m.kcal) || 0), 0);
  const carbsG = logged.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0);
  const proteinG = logged.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
  const fatG = logged.reduce((sum, m) => sum + (Number(m.fat) || 0), 0);

  const goalKcal =
    (dayKey && plan ? calculateDayGoalKcal(plan, dayKey) : 0) ||
    meals.reduce((sum, m) => sum + (m.kcal || 0), 0) ||
    2200;

  const burnedKcal = Number(extras?.burnedKcal ?? 0);
  const waterMl = Number(extras?.waterMl ?? 0);
  const waterGoalMl = 2500;

  const macroTotal = carbsG * 4 + proteinG * 4 + fatG * 9;
  const carbsPct =
    macroTotal > 0 ? Math.round(((carbsG * 4) / macroTotal) * 100) : 0;
  const proteinPct =
    macroTotal > 0 ? Math.round(((proteinG * 4) / macroTotal) * 100) : 0;
  const fatPct =
    macroTotal > 0 ? Math.round(((fatG * 9) / macroTotal) * 100) : 0;

  const mealsDone = logged.length;
  const mealsTotal = meals.length;

  return {
    goalKcal,
    eatenKcal,
    burnedKcal,
    leftKcal: Math.max(0, goalKcal - eatenKcal + burnedKcal),
    carbsPct,
    proteinPct,
    fatPct,
    carbsG,
    proteinG,
    fatG,
    waterMl,
    waterGoalMl,
    mealsDone,
    mealsTotal,
    mealProgressPct:
      mealsTotal > 0 ? Math.round((mealsDone / mealsTotal) * 100) : 0,
  };
};

/** ISO timestamp without ms — e.g. 2026-07-15T07:15:00Z */
export const nowIso = () =>
  new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
