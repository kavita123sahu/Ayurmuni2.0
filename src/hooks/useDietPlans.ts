import { useCallback, useEffect, useMemo, useState } from 'react';
import * as _PATIENT from '../services/PatientServices';
import {
  calculateDietNutrition,
  extractDietPlanDetail,
  isDietPlanStarted,
  mapDietMeals,
  mapDietPlanSummary,
  normalizeDietPlanList,
  todayDateString,
  DietMeal,
  DietNutrition,
  DietPlanSummary,
} from '../utils/dietPlanUtils';
import { showSuccessToast } from '../config/Key';
import { requireAuth } from '../services/guestAuth';

type Options = {
  initialPlanId?: string | null;
  listType?: 'all' | null;
};

export const useDietPlans = (options: Options = {}) => {
  const { initialPlanId = null, listType = 'all' } = options;

  const [plans, setPlans] = useState<DietPlanSummary[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    initialPlanId,
  );
  const [planDetail, setPlanDetail] = useState<any | null>(null);
  const [meals, setMeals] = useState<DietMeal[]>([]);
  const [waterMl, setWaterMl] = useState(0);
  const [locallyStartedIds, setLocallyStartedIds] = useState<string[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [starting, setStarting] = useState(false);
  const [loggingMealId, setLoggingMealId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const nutrition: DietNutrition = useMemo(
    () =>
      calculateDietNutrition(meals, planDetail, {
        waterMl,
        burnedKcal: Number(planDetail?.calories_burned ?? 0),
      }),
    [meals, planDetail, waterMl],
  );

  const loadList = useCallback(async () => {
    try {
      setLoadingList(true);
      const res = await _PATIENT.getDietPlans(
        listType ? { type: listType } : undefined,
      );
      const list = normalizeDietPlanList(res);
      setPlans(list);

      setSelectedPlanId(prev => {
        if (initialPlanId) return String(initialPlanId);
        if (prev && list.some(p => p.id === prev)) return prev;
        if (list.length === 0) return null;
        const active =
          list.find(p => isDietPlanStarted(p)) || list[0];
        return active.id;
      });
    } catch (e) {
      console.log('DIET_LIST_ERROR', e);
      setPlans([]);
    } finally {
      setLoadingList(false);
    }
  }, [listType, initialPlanId]);

  const loadDetail = useCallback(async (planId: string) => {
    if (!planId) return;
    try {
      setLoadingDetail(true);
      const res = await _PATIENT.getDietPlans({ id: planId });
      const detail =
        extractDietPlanDetail(res) || mapDietPlanSummary({ id: planId });
      setPlanDetail(detail);
      setMeals(mapDietMeals(detail));
      setWaterMl(
        Number(detail?.water_consumed_ml ?? detail?.hydration_ml ?? 0) || 0,
      );
    } catch (e) {
      console.log('DIET_DETAIL_ERROR', e);
      setPlanDetail(null);
      setMeals([]);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedPlanId) {
      loadDetail(selectedPlanId);
    }
  }, [selectedPlanId, loadDetail]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadList();
      if (selectedPlanId) {
        await loadDetail(selectedPlanId);
      }
    } finally {
      setRefreshing(false);
    }
  }, [loadList, loadDetail, selectedPlanId]);

  const startPlan = useCallback(
    async (planId?: string) => {
      const id = planId || selectedPlanId;
      if (!id) return false;
      if (!(await requireAuth('Please login to start a diet plan'))) return false;

      try {
        setStarting(true);
        const res = await _PATIENT.startDietPlan(id);
        if (res?.success === false) {
          showSuccessToast(res?.message || 'Unable to start plan', 'error');
          return false;
        }
        showSuccessToast(
          res?.message || 'Plan started — track meals & hydration below',
          'success',
        );
        setLocallyStartedIds(prev =>
          prev.includes(String(id)) ? prev : [...prev, String(id)],
        );
        setSelectedPlanId(String(id));
        await loadDetail(String(id));
        await loadList();
        return true;
      } catch (e: any) {
        showSuccessToast(e?.message || 'Unable to start plan', 'error');
        return false;
      } finally {
        setStarting(false);
      }
    },
    [selectedPlanId, loadDetail, loadList],
  );

  const logMeal = useCallback(
    async (meal: DietMeal) => {
      if (!selectedPlanId) return;
      if (!(await requireAuth('Please login to track meals'))) return;

      try {
        setLoggingMealId(meal.id);
        const nextStatus = meal.status === 'done' ? 'log' : 'done';
        const deltaCarbs = meal.carbs || 0;
        const deltaProtein = meal.protein || 0;
        const deltaFat = meal.fat || 0;
        const calories =
          nextStatus === 'done'
            ? nutrition.eatenKcal + meal.kcal
            : Math.max(0, nutrition.eatenKcal - meal.kcal);

        const res = await _PATIENT.updateDietPlanProgress({
          diet_plan_id: selectedPlanId,
          meal_id: meal.id,
          calories_consumed: calories,
          carbs_g: Math.max(
            0,
            nutrition.carbsG + (nextStatus === 'done' ? deltaCarbs : -deltaCarbs),
          ),
          protein_g: Math.max(
            0,
            nutrition.proteinG +
              (nextStatus === 'done' ? deltaProtein : -deltaProtein),
          ),
          fat_g: Math.max(
            0,
            nutrition.fatG + (nextStatus === 'done' ? deltaFat : -deltaFat),
          ),
          water_ml: waterMl,
          date: todayDateString(),
          action: nextStatus === 'done' ? 'log' : 'unlog',
        });

        if (res?.success === false) {
          showSuccessToast(res?.message || 'Unable to update meal', 'error');
          return;
        }

        setMeals(prev =>
          prev.map(m =>
            m.id === meal.id ? { ...m, status: nextStatus } : m,
          ),
        );
        showSuccessToast(
          nextStatus === 'done' ? 'Meal logged' : 'Meal unmarked',
          'success',
        );
      } catch (e: any) {
        showSuccessToast(e?.message || 'Unable to update meal', 'error');
      } finally {
        setLoggingMealId(null);
      }
    },
    [selectedPlanId, nutrition, waterMl],
  );

  const adjustWater = useCallback(
    async (deltaMl: number) => {
      if (!selectedPlanId) return;
      if (!(await requireAuth('Please login to track hydration'))) return;

      const next = Math.max(0, waterMl + deltaMl);
      setWaterMl(next);

      try {
        await _PATIENT.updateDietPlanProgress({
          diet_plan_id: selectedPlanId,
          water_ml: next,
          calories_consumed: nutrition.eatenKcal,
          date: todayDateString(),
        });
      } catch {
        // keep optimistic UI
      }
    },
    [selectedPlanId, waterMl, nutrition.eatenKcal],
  );

  const selectedSummary =
    plans.find(p => p.id === selectedPlanId) ||
    (planDetail ? mapDietPlanSummary(planDetail) : null);

  const isStarted =
    locallyStartedIds.includes(String(selectedPlanId || '')) ||
    isDietPlanStarted(selectedSummary) ||
    isDietPlanStarted(planDetail);

  return {
    plans,
    selectedPlanId,
    setSelectedPlanId,
    planDetail,
    selectedSummary,
    meals,
    nutrition,
    waterMl,
    isStarted,
    loadingList,
    loadingDetail,
    starting,
    loggingMealId,
    refreshing,
    refresh,
    startPlan,
    logMeal,
    adjustWater,
  };
};
