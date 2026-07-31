import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as _PATIENT from '../services/PatientServices';
import {
  calculateDietNutrition,
  extractDietPlanDetail,
  isDietPlanStarted,
  mapDietPlanSummary,
  buildDietDayChips,
  extractProgressPayload,
  getPlanJsonDays,
  mapPlanJsonMeals,
  normalizeDietPlanList,
  normalizeProgressList,
  nowIso,
  resolveCurrentDayKey,
  DietDayChip,
  DietMeal,
  DietNutrition,
  DietPlanSummary,
  DietProgressItem,
} from '../utils/dietPlanUtils';
import { showSuccessToast } from '../config/Key';
import { requireAuth } from '../services/guestAuth';
import type { DietPlanStatusAction } from '../services/PatientServices';

type Options = {
  /** Open this plan detail when screen mounts */
  initialPlanId?: string | null;
  /**
   * List query:
   * - null/undefined → GET /patients/diet-plans/ (common + doctor-suggested)
   * - 'all' → GET ?type=all
   */
  listType?: 'all' | null;
};

export const useDietPlans = (options: Options = {}) => {
  const { initialPlanId = null, listType = 'all' } = options;

  const [plans, setPlans] = useState<DietPlanSummary[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    initialPlanId,
  );
  const [planDetail, setPlanDetail] = useState<any | null>(null);
  const [progress, setProgress] = useState<DietProgressItem[]>([]);
  const [currentDayKey, setCurrentDayKey] = useState('day_1');
  const [todayDayKey, setTodayDayKey] = useState('day_1');
  const [showAllDays, setShowAllDays] = useState(false);
  const [meals, setMeals] = useState<DietMeal[]>([]);
  const [mealsByDay, setMealsByDay] = useState<
    { dayKey: string; label: string; meals: DietMeal[] }[]
  >([]);
  const [waterMl, setWaterMl] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [starting, setStarting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [loggingMealId, setLoggingMealId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const currentDayKeyRef = useRef(currentDayKey);
  const hasInitializedDayRef = useRef(false);
  currentDayKeyRef.current = currentDayKey;

  const nutrition: DietNutrition = useMemo(
    () =>
      calculateDietNutrition(meals, planDetail, currentDayKey, {
        waterMl,
      }),
    [meals, planDetail, currentDayKey, waterMl],
  );

  const rebuildMeals = useCallback(
    (
      detail: any,
      progressList: DietProgressItem[],
      preferredDayKey?: string | null,
      forceDay = false,
    ) => {
      if (!detail) {
        setMeals([]);
        setMealsByDay([]);
        return;
      }
      const todayKey = resolveCurrentDayKey(detail, progressList);
      setTodayDayKey(todayKey);

      const days = getPlanJsonDays(detail);
      const allDays = days.map(dayKey => {
        const dayNumber = Number(String(dayKey).replace(/\D/g, '')) || 0;
        return {
          dayKey,
          label: `Day ${dayNumber || dayKey}`,
          meals: mapPlanJsonMeals(detail, dayKey, progressList),
        };
      });
      setMealsByDay(allDays);

      // Preserve user's selected day across refresh (unless forced / first load)
      const requestedRaw = forceDay
        ? preferredDayKey || todayKey
        : preferredDayKey ||
          currentDayKeyRef.current ||
          todayKey;
      const requested = String(requestedRaw || '').toLowerCase();
      const dayKey =
        days.find(d => d.toLowerCase() === requested) ||
        days.find(d => d.toLowerCase() === String(todayKey).toLowerCase()) ||
        days[0] ||
        'day_1';

      currentDayKeyRef.current = dayKey;
      setCurrentDayKey(dayKey);
      setMeals(mapPlanJsonMeals(detail, dayKey, progressList));
    },
    [],
  );

  const selectDay = useCallback(
    (dayKey: string) => {
      if (!dayKey) return;
      setShowAllDays(false);
      currentDayKeyRef.current = dayKey;
      setCurrentDayKey(dayKey);
      if (!planDetail) return;
      setMeals(mapPlanJsonMeals(planDetail, dayKey, progress));
    },
    [planDetail, progress],
  );

  const selectAllDays = useCallback(() => {
    setShowAllDays(true);
  }, []);

  const planDays: DietDayChip[] = useMemo(
    () => buildDietDayChips(planDetail, progress, todayDayKey),
    [planDetail, progress, todayDayKey],
  );

  const loadProgress = useCallback(async (patientDietPlanId?: string | null) => {
    try {
      const res = await _PATIENT.getDietPlanProgress(
        patientDietPlanId || undefined,
      );
      if (res?.success === false) {
        return {
          progressList: [] as DietProgressItem[],
          planJson: null,
          startedAt: null,
          assignmentId: null,
          dietPlanId: null,
          status: null,
          raw: res,
        };
      }
      const payload = extractProgressPayload(res);
      console.log('DIET_PROGRESS_PARSED =>', payload.progressList);
      return { ...payload, raw: res };
    } catch (e) {
      console.log('DIET_PROGRESS_ERROR', e);
      return {
        progressList: [] as DietProgressItem[],
        planJson: null,
        startedAt: null,
        assignmentId: null,
        dietPlanId: null,
        status: null,
        raw: null,
      };
    }
  }, []);

  const loadList = useCallback(async () => {
    try {
      setLoadingList(true);
      const res = await _PATIENT.getDietPlans(
        listType ? { type: listType } : undefined,
      );
      if (res?.success === false) {
        setPlans([]);
        return;
      }
      setPlans(normalizeDietPlanList(res));
    } catch (e) {
      console.log('DIET_LIST_ERROR', e);
      setPlans([]);
    } finally {
      setLoadingList(false);
    }
  }, [listType]);

  const loadDetail = useCallback(
    async (planId: string) => {
      if (!planId) return null;
      try {
        setLoadingDetail(true);
        const detailRes = await _PATIENT.getDietPlans({ id: planId });
        let detail =
          extractDietPlanDetail(detailRes) ||
          mapDietPlanSummary({ id: planId });

        const assignmentId = detail?.patient_diet_plan_id || null;
        const progressPayload = await loadProgress(assignmentId);

        // Merge plan_json / started_at from progress API when present
        if (progressPayload.planJson && !detail?.plan_json) {
          detail = { ...detail, plan_json: progressPayload.planJson };
        } else if (progressPayload.planJson) {
          detail = { ...detail, plan_json: progressPayload.planJson };
        }
        if (progressPayload.startedAt) {
          detail = { ...detail, started_at: progressPayload.startedAt };
        }
        if (progressPayload.assignmentId) {
          detail = {
            ...detail,
            patient_diet_plan_id: progressPayload.assignmentId,
          };
        }
        if (progressPayload.status) {
          detail = {
            ...detail,
            patient_assignment_status: progressPayload.status,
          };
        }

        const progressList = progressPayload.progressList;
        setPlanDetail(detail);
        setProgress(progressList);
        const todayKey = resolveCurrentDayKey(detail, progressList);
        const forceToday = !hasInitializedDayRef.current;
        if (forceToday) hasInitializedDayRef.current = true;
        rebuildMeals(
          detail,
          progressList,
          forceToday ? todayKey : currentDayKeyRef.current || todayKey,
          forceToday,
        );
        return detail;
      } catch (e) {
        console.log('DIET_DETAIL_ERROR', e);
        setPlanDetail(null);
        setMeals([]);
        return null;
      } finally {
        setLoadingDetail(false);
      }
    },
    [loadProgress, rebuildMeals],
  );

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (initialPlanId) {
      setSelectedPlanId(String(initialPlanId));
    }
  }, [initialPlanId]);

  useEffect(() => {
    if (selectedPlanId) {
      loadDetail(selectedPlanId);
    } else {
      setPlanDetail(null);
      setMeals([]);
      setProgress([]);
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

  const selectPlan = useCallback((planId: string | null) => {
    setSelectedPlanId(planId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlanId(null);
    setPlanDetail(null);
    setMeals([]);
    setMealsByDay([]);
    setShowAllDays(false);
    hasInitializedDayRef.current = false;
  }, []);

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
        showSuccessToast(res?.message || 'Diet plan started', 'success');
        await loadList();
        await loadDetail(String(id));
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
      if (!(await requireAuth('Please login to track meals'))) return;
      if (!isDietPlanStarted(planDetail)) {
        showSuccessToast('Start the plan before logging meals', 'error');
        return;
      }

      try {
        setLoggingMealId(meal.id);
        const markingDone = meal.status !== 'done';
        const completedAt = markingDone ? nowIso() : null;
        const payload = {
          day: meal.dayKey,
          meal: meal.mealKey,
          status: markingDone ? 'completed' : 'pending',
          completed_at: completedAt,
        };

        const res = await _PATIENT.updateDietPlanProgress(payload);
        if (res?.success === false) {
          showSuccessToast(res?.message || 'Unable to update progress', 'error');
          return;
        }

        // Optimistic local update so check shows immediately
        const optimistic: DietProgressItem[] = (() => {
          const day = String(meal.dayKey).toLowerCase();
          const mealKey = String(meal.mealKey).toLowerCase();
          const filtered = progress.filter(
            p =>
              !(
                String(p.day).toLowerCase() === day &&
                String(p.meal).toLowerCase() === mealKey
              ),
          );
          if (markingDone) {
            return [
              ...filtered,
              {
                day,
                meal: mealKey,
                status: 'completed',
                completed_at: completedAt,
              },
            ];
          }
          return filtered;
        })();

        setProgress(optimistic);
        setMeals(prev =>
          prev.map(m =>
            m.id === meal.id
              ? { ...m, status: markingDone ? 'done' : 'log' }
              : m,
          ),
        );

        // Re-fetch progress_json so checked state persists after leave/return
        const assignmentId = planDetail?.patient_diet_plan_id || null;
        const fromApi = await loadProgress(assignmentId);
        const apiList = fromApi.progressList || [];
        const fromPatch = normalizeProgressList(res);
        const merged =
          apiList.length > 0
            ? apiList
            : fromPatch.length > 0
              ? fromPatch
              : optimistic;
        setProgress(merged);
        if (planDetail) {
          const nextDetail =
            fromApi.planJson || fromApi.startedAt
              ? {
                  ...planDetail,
                  ...(fromApi.planJson ? { plan_json: fromApi.planJson } : {}),
                  ...(fromApi.startedAt
                    ? { started_at: fromApi.startedAt }
                    : {}),
                }
              : planDetail;
          setPlanDetail(nextDetail);
          rebuildMeals(nextDetail, merged);
        }

        showSuccessToast(
          markingDone ? 'Meal completed' : 'Meal unmarked',
          'success',
        );
      } catch (e: any) {
        showSuccessToast(e?.message || 'Unable to update progress', 'error');
      } finally {
        setLoggingMealId(null);
      }
    },
    [planDetail, progress, loadProgress, rebuildMeals],
  );

  const adjustWater = useCallback((deltaMl: number) => {
    setWaterMl(prev => Math.max(0, prev + deltaMl));
  }, []);

  const selectedSummary =
    plans.find(p => p.id === selectedPlanId) ||
    (planDetail ? mapDietPlanSummary(planDetail) : null);

  const isStarted =
    isDietPlanStarted(selectedSummary) || isDietPlanStarted(planDetail);

  const patientDietPlanId =
    planDetail?.patient_diet_plan_id ||
    selectedSummary?.patient_diet_plan_id ||
    null;

  const updateStatus = useCallback(
    async (
      action: DietPlanStatusAction,
      stop_reason?: string,
      patientId?: string | null,
    ) => {
      const id = patientId || patientDietPlanId;
      if (!id) {
        showSuccessToast('No active assignment found for this plan', 'error');
        return false;
      }
      if (!(await requireAuth('Please login to update diet plan'))) return false;

      try {
        setUpdatingStatus(true);
        const payload: { action: DietPlanStatusAction; stop_reason?: string } = {
          action,
        };
        if (stop_reason) payload.stop_reason = stop_reason;

        const res = await _PATIENT.updateDietPlanStatus(id, payload);
        console.log("swicthpannnresposnee", res);
        if (res?.success === false) {
          showSuccessToast(res?.message || 'Unable to update plan status', 'error');
          return false;
        }
        showSuccessToast(
          res?.message ||
            (action === 'pause'
              ? 'Plan paused'
              : action === 'resume'
                ? 'Plan resumed'
                : action === 'stop'
                  ? 'Plan stopped'
                  : 'Plan completed'),
          'success',
        );
        await loadList();
        if (selectedPlanId) {
          await loadDetail(selectedPlanId);
        }
        return true;
      } catch (e: any) {
        showSuccessToast(e?.message || 'Unable to update plan status', 'error');
        return false;
      } finally {
        setUpdatingStatus(false);
      }
    },
    [patientDietPlanId, loadList, loadDetail, selectedPlanId],
  );

  /** Pause/stop current assignment so user can pick another plan */
  const switchPlan = useCallback(
    async (action: 'pause' | 'stop' = 'pause', stop_reason?: string) => {
      const ok = await updateStatus(action, stop_reason);
      if (ok) {
        clearSelection();
      }
      return ok;
    },
    [updateStatus, clearSelection],
  );

  return {
    plans,
    selectedPlanId,
    selectPlan,
    clearSelection,
    planDetail,
    selectedSummary,
    meals,
    mealsByDay,
    nutrition,
    waterMl,
    currentDayKey,
    todayDayKey,
    planDays,
    showAllDays,
    selectDay,
    selectAllDays,
    progress,
    isStarted,
    patientDietPlanId,
    loadingList,
    loadingDetail,
    starting,
    updatingStatus,
    loggingMealId,
    refreshing,
    refresh,
    startPlan,
    logMeal,
    adjustWater,
    updateStatus,
    switchPlan,
  };
};
