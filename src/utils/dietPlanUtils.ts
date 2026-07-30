/**
 * Diet plan helpers — list / details / start / progress + frontend nutrition math.
 */

export type DietMeal = {
  id: string;
  type: string;
  time: string;
  title: string;
  subtitle: string;
  kcal: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  image?: any;
  status: 'log' | 'done';
  raw?: any;
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
  description?: string;
  patient_assignment_status?: string | null;
  thumbnail_url?: string;
  image_url?: string;
  duration_days?: number;
  day_number?: number;
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

const FALLBACK_MEAL_IMAGE = require('../assets/images/login/7.jpg');

export const resolveDietImage = (item?: any) => {
  const uri =
    item?.thumbnail_url ||
    item?.image_url ||
    item?.cover_image ||
    item?.banner_url ||
    item?.image ||
    null;
  if (typeof uri === 'string' && uri.trim()) {
    return { uri: uri.trim() };
  }
  if (uri && typeof uri === 'object') return uri;
  return FALLBACK_MEAL_IMAGE;
};

export const isDietPlanStarted = (plan?: any): boolean => {
  if (!plan) return false;
  if (plan?.is_started === true || plan?.started === true) return true;
  const status = String(
    plan?.patient_assignment_status || plan?.status || plan?.assignment_status || '',
  ).toLowerCase();
  return (
    status.includes('active') ||
    status.includes('started') ||
    status.includes('in_progress') ||
    status.includes('ongoing') ||
    status.includes('in-progress')
  );
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
    short_description:
      item?.short_description ||
      item?.description ||
      diseaseNames ||
      item?.season ||
      item?.prakriti ||
      '',
    thumbnail_url: item?.thumbnail_url || item?.image_url || '',
    image_url: item?.image_url || item?.thumbnail_url || '',
    health_diseases: diseases,
    duration_days: Number(item?.duration_days ?? item?.days ?? item?.duration) || undefined,
    day_number: Number(item?.day_number ?? item?.current_day ?? item?.day) || undefined,
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
      data.results || data.diet_plans || data.plans || data.items || null;
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
  const data = response?.data ?? response;
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }
  if (data?.diet_plan) return data.diet_plan;
  if (data?.plan) return data.plan;
  if (data?.id || data?.name || data?.meals) return data;
  return null;
};

const mealTypeLabel = (raw: any, index: number): string => {
  const t = String(
    raw?.meal_type || raw?.type || raw?.slot || raw?.name || '',
  ).toUpperCase();
  if (t) return t;
  const fallback = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];
  return fallback[index % fallback.length];
};

export const mapDietMeals = (plan: any): DietMeal[] => {
  const pools = [
    plan?.meals,
    plan?.today_meals,
    plan?.meal_plan,
    plan?.daily_meals,
    plan?.items,
  ];
  let list: any[] = [];
  for (const pool of pools) {
    if (Array.isArray(pool) && pool.length) {
      list = pool;
      break;
    }
  }

  return list.map((raw, index) => {
    const kcal = Number(
      raw?.calories ?? raw?.kcal ?? raw?.calorie ?? raw?.energy ?? 0,
    );
    return {
      id: String(raw?.id ?? raw?.meal_id ?? `meal-${index}`),
      type: mealTypeLabel(raw, index),
      time: String(raw?.time ?? raw?.meal_time ?? raw?.slot_time ?? ''),
      title: String(raw?.title ?? raw?.name ?? raw?.food_name ?? 'Meal'),
      subtitle: String(
        raw?.subtitle ??
          raw?.description ??
          raw?.ingredients ??
          raw?.short_description ??
          '',
      ),
      kcal: Number.isFinite(kcal) ? kcal : 0,
      carbs: Number(raw?.carbs ?? raw?.carbohydrates ?? raw?.carb_g ?? 0) || 0,
      protein: Number(raw?.protein ?? raw?.proteins ?? raw?.protein_g ?? 0) || 0,
      fat: Number(raw?.fat ?? raw?.fats ?? raw?.fat_g ?? 0) || 0,
      image: resolveDietImage(raw),
      status:
        raw?.is_logged || raw?.logged || raw?.status === 'done' ? 'done' : 'log',
      raw,
    };
  });
};

/** Frontend nutrition totals from logged meals + plan goals */
export const calculateDietNutrition = (
  meals: DietMeal[],
  plan?: any,
  extras?: { waterMl?: number; burnedKcal?: number },
): DietNutrition => {
  const logged = meals.filter(m => m.status === 'done');
  const eatenKcal = logged.reduce((sum, m) => sum + (Number(m.kcal) || 0), 0);
  const carbsG = logged.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0);
  const proteinG = logged.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
  const fatG = logged.reduce((sum, m) => sum + (Number(m.fat) || 0), 0);

  const goalKcal = Number(
    plan?.daily_calorie_goal ??
      plan?.calorie_goal ??
      plan?.calories_goal ??
      plan?.target_calories ??
      plan?.goal_kcal ??
      2200,
  );

  const burnedKcal = Number(
    extras?.burnedKcal ?? plan?.calories_burned ?? plan?.burned_kcal ?? 0,
  );

  const waterMl = Number(
    extras?.waterMl ?? plan?.water_consumed_ml ?? plan?.hydration_ml ?? 0,
  );
  const waterGoalMl = Number(
    plan?.water_goal_ml ?? plan?.hydration_goal_ml ?? 2500,
  );

  const macroTotal = carbsG * 4 + proteinG * 4 + fatG * 9;
  const carbsPct =
    macroTotal > 0 ? Math.round(((carbsG * 4) / macroTotal) * 100) : 0;
  const proteinPct =
    macroTotal > 0 ? Math.round(((proteinG * 4) / macroTotal) * 100) : 0;
  const fatPct =
    macroTotal > 0 ? Math.round(((fatG * 9) / macroTotal) * 100) : 0;

  const leftKcal = Math.max(0, goalKcal - eatenKcal + burnedKcal);
  const mealsDone = logged.length;
  const mealsTotal = meals.length;
  const mealProgressPct =
    mealsTotal > 0 ? Math.round((mealsDone / mealsTotal) * 100) : 0;

  return {
    goalKcal: Number.isFinite(goalKcal) ? goalKcal : 2200,
    eatenKcal,
    burnedKcal,
    leftKcal,
    carbsPct,
    proteinPct,
    fatPct,
    carbsG,
    proteinG,
    fatG,
    waterMl,
    waterGoalMl: Number.isFinite(waterGoalMl) ? waterGoalMl : 2500,
    mealsDone,
    mealsTotal,
    mealProgressPct,
  };
};

export const todayDateString = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
