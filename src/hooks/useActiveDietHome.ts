import { useCallback, useState } from 'react';
import * as PatientServices from '../services/PatientServices';
import { isAuthenticated } from '../services/guestAuth';
import {
  extractDietPlanDetail,
  getDietListStatus,
  getDietPlanCoverUrl,
  getMealGalleryUrl,
  getPlanJsonDays,
  normalizeDietPlanList,
  normalizeProgressList,
  resolveCurrentDayKey,
} from '../utils/dietPlanUtils';

export type ActiveDietHomePreview = {
  planId: string;
  title: string;
  subtitle: string;
  currentDay: number;
  totalDays: number;
  progressPercent: number;
  focusLabel: string;
  thumbnailUrl?: string | null;
};

const MEAL_SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];

const isMealDone = (status: unknown): boolean => {
  if (status === true || status === 1) return true;
  const value = String(status ?? '').toLowerCase().trim();
  return ['completed', 'complete', 'done', 'logged', 'true', '1'].includes(value);
};

const computeProgressPercent = (
  totalDays: number,
  progressList: ReturnType<typeof normalizeProgressList>,
): number => {
  const totalMeals = Math.max(totalDays * MEAL_SLOTS.length, 1);
  const completed = progressList.filter(item => isMealDone(item.status)).length;
  return Math.min(100, Math.round((completed / totalMeals) * 100));
};

const resolveHomeDietImage = (
  active: any,
  detail: any,
  dayKey: string,
): string | null => {
  const cover =
    getDietPlanCoverUrl(detail) ||
    getDietPlanCoverUrl(active);
  if (cover) return cover;

  const day = detail?.plan_json?.[dayKey];
  if (day && typeof day === 'object') {
    for (const slot of MEAL_SLOTS) {
      const meal = day[slot];
      const url = getMealGalleryUrl(meal);
      if (url) return url;
    }
  }

  return (
    active?.thumbnail_url ||
    detail?.thumbnail_url ||
    detail?.cover_image ||
    detail?.image_url ||
    null
  );
};

const readDayFocus = (detail: any, dayKey: string): string => {
  const day = detail?.plan_json?.[dayKey];
  if (!day || typeof day !== 'object') return 'Stay on track today';
  const focus =
    day.focus ||
    day.theme ||
    day.title ||
    day.description ||
    day.notes;
  return focus ? String(focus) : 'Stay on track today';
};

export const useActiveDietHome = () => {
  const [preview, setPreview] = useState<ActiveDietHomePreview | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!(await isAuthenticated())) {
      setPreview(null);
      return;
    }

    setLoading(true);
    try {
      const listRes = await PatientServices.getDietPlans({ page: 1 });
      const plans = normalizeDietPlanList(listRes);
      const active = plans.find(plan => getDietListStatus(plan) === 'active');

      if (!active?.patient_diet_plan_id) {
        setPreview(null);
        return;
      }

      const detailRes = await PatientServices.getDietPlans({ id: active.id });
      const detail = extractDietPlanDetail(detailRes) ?? active;

      let progressList: ReturnType<typeof normalizeProgressList> = [];
      try {
        const progressRes = await PatientServices.getDietPlanProgress(
          active.patient_diet_plan_id,
        );
        progressList = normalizeProgressList(progressRes);
      } catch {
        progressList = [];
      }

      const days = getPlanJsonDays(detail);
      const totalDays = days.length || 7;
      const currentDayKey = resolveCurrentDayKey(detail, progressList);
      const currentDay = Number(String(currentDayKey).replace(/\D/g, '')) || 1;

      setPreview({
        planId: String(active.id),
        title: String(active.title || active.name || 'Your Diet Plan'),
        subtitle: String(
          active.short_description ||
            detail?.short_description ||
            'Personalized nutrition plan',
        ),
        currentDay: Math.min(currentDay, totalDays),
        totalDays,
        progressPercent: computeProgressPercent(totalDays, progressList),
        focusLabel: readDayFocus(detail, currentDayKey),
        thumbnailUrl: resolveHomeDietImage(active, detail, currentDayKey),
      });
    } catch {
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { preview, loading, refresh };
};
