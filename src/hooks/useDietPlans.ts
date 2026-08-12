import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as _PATIENT from '../services/PatientServices';
import {
  calculateDietNutrition,
  extractDietApiError,
  extractDietPlanDetail,
  isDietPlanStarted,
  isNoActiveDietPlanError,
  mapDietPlanSummary,
  buildDietDayChips,
  extractProgressPayload,
  getPlanJsonDays,
  mapPlanJsonMeals,
  mergePlanJsonWithGalleries,
  normalizeDietPlanList,
  normalizeProgressList,
  nowIso,
  resolveCurrentDayKey,
  getDietListStatus,
  mergePlanAssignmentFields,
  DietDayChip,
  DietMeal,
  DietNutrition,
  DietPlanSummary,
  DietProgressItem,
} from '../utils/dietPlanUtils';
import { showSuccessToast } from '../config/Key';
import { requireAuth } from '../services/guestAuth';
import type { DietPlanStatusAction } from '../services/PatientServices';
import { DIET_PLAN_PAGE_SIZE } from '../services/PatientServices';
import type { DietPlanListParams } from '../services/PatientServices';

export type DietListFilters = {
  search?: string;
  prakriti?: string;
  health_disease_id?: string | number;
  is_paid?: boolean | string;
  duration?: string | number;
  calories?: string | number;
  sort?: 'popularity' | 'latest' | string;
};

type Options = {
  /** Open this plan detail when screen mounts */
  initialPlanId?: string | null;
  /**
   * List query:
   * - null/undefined → GET /patients/diet-plans/ (common + doctor-suggested)
   * - 'all' → GET ?type=all
   */
  listType?: 'all' | null;
  /** Server-side list filters (search / prakriti / paid / sort / …) */
  listFilters?: DietListFilters;
};

const normalizeListFilters = (filters?: DietListFilters): DietListFilters => {
  if (!filters) return {};
  const search = String(filters.search || '').trim();
  const prakriti = String(filters.prakriti || '').trim();
  const health_disease_id =
    filters.health_disease_id != null &&
    String(filters.health_disease_id).trim() !== ''
      ? filters.health_disease_id
      : undefined;
  const duration =
    filters.duration != null && String(filters.duration).trim() !== ''
      ? filters.duration
      : undefined;
  const calories =
    filters.calories != null && String(filters.calories).trim() !== ''
      ? filters.calories
      : undefined;
  const sort = String(filters.sort || '').trim() || undefined;
  const is_paid =
    filters.is_paid === true ||
    filters.is_paid === false ||
    filters.is_paid === 'true' ||
    filters.is_paid === 'false'
      ? filters.is_paid
      : undefined;

  return {
    ...(search ? { search } : {}),
    ...(prakriti && prakriti.toLowerCase() !== 'all' ? { prakriti } : {}),
    ...(health_disease_id != null ? { health_disease_id } : {}),
    ...(is_paid != null ? { is_paid } : {}),
    ...(duration != null ? { duration } : {}),
    ...(calories != null ? { calories } : {}),
    ...(sort ? { sort } : {}),
  };
};

const filtersKey = (filters?: DietListFilters) =>
  JSON.stringify(normalizeListFilters(filters));

export const useDietPlans = (options: Options = {}) => {
  /** Default: suggested (no type). Pass listType: 'all' for View all catalog. */
  const { initialPlanId = null, listType = null, listFilters } = options;
  const normalizedFilters = useMemo(
    () => normalizeListFilters(listFilters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtersKey(listFilters)],
  );
  const hasServerFilters = Object.keys(normalizedFilters).length > 0;
  // Search / filter across full catalog; suggested list stays default when idle
  const effectiveListType =
    listType === 'all' || hasServerFilters ? ('all' as const) : null;

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
  const [completionJson, setCompletionJson] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const currentDayKeyRef = useRef(currentDayKey);
  const plansRef = useRef<DietPlanSummary[]>([]);
  const hasInitializedDayRef = useRef(false);
  const loadingMoreLockRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);
  const listRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);
  const loadDetailRef = useRef<(planId: string) => Promise<any | null>>(
    async () => null,
  );
  currentDayKeyRef.current = currentDayKey;

  useEffect(() => {
    plansRef.current = plans;
  }, [plans]);

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

  const emptyProgress = useCallback(
    (raw: any = null) => ({
      progressList: [] as DietProgressItem[],
      planJson: null as any,
      startedAt: null as string | null,
      assignmentId: null as string | null,
      dietPlanId: null as string | null,
      status: null as string | null,
      raw,
    }),
    [],
  );

  const loadProgress = useCallback(
    async (patientDietPlanId?: string | null) => {
      try {
        // Never hit progress without assignment id — API returns no_active_plan 404
        if (
          patientDietPlanId == null ||
          String(patientDietPlanId).trim() === ''
        ) {
          return emptyProgress();
        }

        const res = await _PATIENT.getDietPlanProgress(patientDietPlanId);
        if (res?.success === false) {
          // Paused / no active assignment — silent empty (do not toast)
          if (isNoActiveDietPlanError(res)) {
            console.log('DIET_PROGRESS_NO_ACTIVE => silent');
            return emptyProgress(res);
          }
          return emptyProgress(res);
        }
        const payload = extractProgressPayload(res);
        console.log('DIET_PROGRESS_PARSED =>', payload.progressList);
        return { ...payload, raw: res };
      } catch (e) {
        console.log('DIET_PROGRESS_ERROR', e);
        return emptyProgress();
      }
    },
    [emptyProgress],
  );

  const fetchListPage = useCallback(
    async (pageToLoad: number, mode: 'replace' | 'append') => {
      if (mode === 'append') {
        if (loadingMoreLockRef.current || !hasMoreRef.current) return;
        loadingMoreLockRef.current = true;
        setLoadingMore(true);
      } else {
        setLoadingMore(false);
        loadingMoreLockRef.current = false;
        listRequestIdRef.current += 1;
        // Soft filter reload: keep rows visible; UI shows a thin spinner header
        setLoadingList(true);
      }

      const requestId = listRequestIdRef.current;

      try {
        const query: DietPlanListParams = {
          ...(effectiveListType ? { type: effectiveListType } : {}),
          ...normalizedFilters,
          page: pageToLoad,
          page_size: DIET_PLAN_PAGE_SIZE,
        };

        const res = await _PATIENT.getDietPlans(query);

        // Only for View-all catalog: fill missing assignment status from suggested list.
        // Suggested list itself already includes patient_assignment_status — no second call.
        let assignmentOverlay: DietPlanSummary[] = [];
        if (effectiveListType === 'all') {
          try {
            const assignRes = await _PATIENT.getDietPlans({
              page: 1,
              page_size: 100,
            });
            if (assignRes?.success !== false) {
              assignmentOverlay = normalizeDietPlanList(assignRes);
            }
          } catch {
            /* non-blocking */
          }
        }

        // Ignore stale responses when filters/search changed mid-flight
        if (requestId !== listRequestIdRef.current) {
          return;
        }

        if (res?.success === false) {
          if (mode === 'replace') {
            setPlans([]);
            setHasMore(false);
            hasMoreRef.current = false;
          }
          return;
        }

        const mapped =
          assignmentOverlay.length > 0
            ? mergePlanAssignmentFields(
                normalizeDietPlanList(res),
                assignmentOverlay,
              )
            : normalizeDietPlanList(res);
        let more = _PATIENT.hasMoreDietPlanPages(
          res,
          mapped.length,
          DIET_PLAN_PAGE_SIZE,
          pageToLoad,
        );

        setPlans(prev => {
          if (mode !== 'append') return mapped;
          const seen = new Set(prev.map(p => String(p.id)));
          const unique = mapped.filter(p => {
            const id = String(p.id);
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
          });
          if (unique.length === 0 || mapped.length < DIET_PLAN_PAGE_SIZE) {
            more = false;
          }
          return [...prev, ...unique];
        });

        if (mode === 'replace' && mapped.length < DIET_PLAN_PAGE_SIZE) {
          more = false;
        }

        setPage(pageToLoad);
        pageRef.current = pageToLoad;
        setHasMore(more);
        hasMoreRef.current = more;
      } catch (e) {
        if (requestId !== listRequestIdRef.current) {
          return;
        }
        console.log('DIET_LIST_ERROR', e);
        if (mode === 'replace') {
          setPlans([]);
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } finally {
        if (mode === 'append') {
          loadingMoreLockRef.current = false;
        }
        if (requestId === listRequestIdRef.current) {
          setLoadingList(false);
          setLoadingMore(false);
          if (mode !== 'append') {
            loadingMoreLockRef.current = false;
          }
        }
      }
    },
    [effectiveListType, normalizedFilters],
  );

  const loadList = useCallback(async () => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    setPage(1);
    setHasMore(true);
    await fetchListPage(1, 'replace');
  }, [fetchListPage]);

  const loadMore = useCallback(() => {
    if (
      loadingList ||
      loadingMore ||
      !hasMoreRef.current ||
      loadingMoreLockRef.current
    ) {
      return;
    }
    fetchListPage(pageRef.current + 1, 'append');
  }, [fetchListPage, loadingList, loadingMore]);

  const loadDetail = useCallback(
    async (planId: string) => {
      if (!planId) return null;
      const requestId = ++detailRequestIdRef.current;

      try {
        setLoadingDetail(true);

        /**
         * Detail must be catalog diet_plan_id only:
         * GET /patients/diet-plans/?id={{diet_plan_id}}
         * Never call with patient_diet_plan_id / type=all.
         */
        let catalogPlanId = String(planId).trim();
        const listSummary =
          plansRef.current.find(p => String(p.id) === catalogPlanId) ||
          plansRef.current.find(
            p => String(p.patient_diet_plan_id || '') === catalogPlanId,
          ) ||
          null;

        // If caller accidentally passed assignment id, map back to catalog id
        if (
          listSummary &&
          String(listSummary.patient_diet_plan_id || '') === catalogPlanId &&
          String(listSummary.id) !== catalogPlanId
        ) {
          catalogPlanId = String(listSummary.id);
        }

        const detailRes = await _PATIENT.getDietPlans({ id: catalogPlanId });
        if (requestId !== detailRequestIdRef.current) return null;

        let detail = extractDietPlanDetail(detailRes);

        if (!detail || detailRes?.success === false) {
          console.log('DIET_DETAIL_FAILED =>', detailRes);
          if (listSummary) {
            detail = { ...listSummary };
          } else {
            showSuccessToast(
              extractDietApiError(detailRes, 'Diet plan not found.'),
              'error',
            );
            detail = mapDietPlanSummary({ id: catalogPlanId });
          }
        } else {
          // Detail API is source of truth for assignment status.
          // Only fill missing assignment fields from list — never overwrite detail status.
          detail = {
            ...(listSummary || {}),
            ...detail,
            patient_diet_plan_id:
              detail?.patient_diet_plan_id ??
              listSummary?.patient_diet_plan_id ??
              null,
            patient_assignment_status:
              detail?.patient_assignment_status ??
              listSummary?.patient_assignment_status ??
              null,
            started_at: detail?.started_at ?? listSummary?.started_at ?? null,
            ended_at: detail?.ended_at ?? listSummary?.ended_at ?? null,
            stop_reason:
              detail?.stop_reason ?? listSummary?.stop_reason ?? null,
            repeat_count:
              detail?.repeat_count ?? listSummary?.repeat_count ?? 0,
          };
        }

        const assignmentFromDetail = detail?.patient_diet_plan_id
          ? String(detail.patient_diet_plan_id)
          : '';
        const rawCatalogId = String(
          detail?.diet_plan_id || detail?.id || catalogPlanId,
        );
        const safeCatalogId =
          rawCatalogId && rawCatalogId !== assignmentFromDetail
            ? rawCatalogId
            : catalogPlanId;

        const catalogPlanJson = detail?.plan_json || null;
        detail = {
          ...detail,
          id: safeCatalogId,
        };

        const assignmentId = detail?.patient_diet_plan_id || null;
        let progressList: DietProgressItem[] = [];
        const listStatus = getDietListStatus(detail);

        /**
         * Progress only for active assignments.
         * Status comes from detail.patient_assignment_status — do NOT call
         * status/?id= here (that uses a different id and caused double loads).
         */
        if (assignmentId && listStatus === 'active') {
          const progressPayload = await loadProgress(assignmentId);
          if (requestId !== detailRequestIdRef.current) return null;

          if (isNoActiveDietPlanError(progressPayload.raw)) {
            detail = {
              ...detail,
              patient_assignment_status:
                detail?.patient_assignment_status || 'paused',
            };
            progressList = [];
          } else {
            const sameAssignment =
              !progressPayload.assignmentId ||
              String(progressPayload.assignmentId) === String(assignmentId);
            const sameDietPlan =
              !progressPayload.dietPlanId ||
              String(progressPayload.dietPlanId) === String(safeCatalogId);

            if (sameAssignment && sameDietPlan) {
              if (progressPayload.planJson) {
                detail = {
                  ...detail,
                  plan_json: mergePlanJsonWithGalleries(
                    catalogPlanJson,
                    progressPayload.planJson,
                  ),
                };
              }
              if (progressPayload.startedAt) {
                detail = { ...detail, started_at: progressPayload.startedAt };
              }
              progressList = progressPayload.progressList;
            } else {
              console.log('DIET_PROGRESS_SKIP_MISMATCH', {
                planId: safeCatalogId,
                assignmentId,
                progressAssignment: progressPayload.assignmentId,
                progressDiet: progressPayload.dietPlanId,
              });
            }
          }
        }

        if (requestId !== detailRequestIdRef.current) return null;

        setPlanDetail(detail);
        setProgress(progressList);

        // Force list card to match detail assignment (fixes Resume vs Stopped mismatch)
        setPlans(prev =>
          prev.map(p =>
            String(p.id) === String(safeCatalogId)
              ? {
                  ...p,
                  patient_diet_plan_id:
                    detail.patient_diet_plan_id ?? p.patient_diet_plan_id,
                  patient_assignment_status:
                    detail.patient_assignment_status ??
                    p.patient_assignment_status,
                  started_at: detail.started_at ?? p.started_at,
                  ended_at: detail.ended_at ?? p.ended_at,
                  stop_reason: detail.stop_reason ?? p.stop_reason,
                  repeat_count: detail.repeat_count ?? p.repeat_count,
                }
              : p,
          ),
        );

        if (isDietPlanStarted(detail)) {
          const todayKey = resolveCurrentDayKey(detail, progressList);
          const forceToday = !hasInitializedDayRef.current;
          if (forceToday) hasInitializedDayRef.current = true;
          rebuildMeals(
            detail,
            progressList,
            forceToday ? todayKey : currentDayKeyRef.current || todayKey,
            forceToday,
          );
        } else {
          setMeals([]);
          setMealsByDay([]);
          setShowAllDays(false);
        }
        return detail;
      } catch (e) {
        if (requestId !== detailRequestIdRef.current) return null;
        console.log('DIET_DETAIL_ERROR', e);
        setPlanDetail(null);
        setMeals([]);
        return null;
      } finally {
        if (requestId === detailRequestIdRef.current) {
          setLoadingDetail(false);
        }
      }
    },
    [loadProgress, rebuildMeals],
  );

  loadDetailRef.current = loadDetail;

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (initialPlanId) {
      setSelectedPlanId(prev =>
        prev === String(initialPlanId) ? prev : String(initialPlanId),
      );
    }
  }, [initialPlanId]);

  // Only re-fetch when selected plan changes — not when loadDetail identity changes
  useEffect(() => {
    if (selectedPlanId) {
      loadDetailRef.current(selectedPlanId);
    } else {
      detailRequestIdRef.current += 1;
      setPlanDetail(null);
      setMeals([]);
      setProgress([]);
    }
  }, [selectedPlanId]);

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
    hasInitializedDayRef.current = false;
    setPlanDetail(null);
    setMeals([]);
    setMealsByDay([]);
    setProgress([]);
    setShowAllDays(false);
    setCompletionJson(null);
    setSelectedPlanId(planId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlanId(null);
    setPlanDetail(null);
    setMeals([]);
    setMealsByDay([]);
    setProgress([]);
    setShowAllDays(false);
    setCompletionJson(null);
    hasInitializedDayRef.current = false;
  }, []);

  const startPlan = useCallback(
    async (planId?: string) => {
      /**
       * Start expects catalog diet plan id only.
       * Never send patient_diet_plan_id — backend returns
       * { id: ['This diet plan is not available for the patient.'] }.
       */
      const summary = plans.find(p => String(p.id) === String(planId || selectedPlanId));
      const assignmentId = String(
        planDetail?.patient_diet_plan_id ||
          summary?.patient_diet_plan_id ||
          '',
      ).trim();

      const rawDetailId = String(planDetail?.id || '').trim();
      const detailCatalogId = String(planDetail?.diet_plan_id || '').trim();
      const safeDetailId =
        rawDetailId && rawDetailId !== assignmentId ? rawDetailId : '';

      const id = String(
        planId ||
          selectedPlanId ||
          detailCatalogId ||
          safeDetailId ||
          '',
      ).trim();

      if (!id || id === assignmentId) {
        showSuccessToast('Invalid diet plan id', 'error');
        return false;
      }
      if (!(await requireAuth('Please login to start a diet plan'))) return false;

      const resumeAssignment = async (patientAssignmentId: string) => {
        const resumeRes = await _PATIENT.updateDietPlanStatus(
          patientAssignmentId,
          { action: 'resume' },
        );
        if (resumeRes?.success === false) {
          showSuccessToast(
            extractDietApiError(resumeRes, 'Unable to resume plan'),
            'error',
          );
          return false;
        }
        showSuccessToast(
          typeof resumeRes?.message === 'string' && resumeRes.message.trim()
            ? resumeRes.message.trim()
            : 'Plan resumed',
          'success',
        );
        await loadList();
        await loadDetail(id);
        return true;
      };

      try {
        setStarting(true);

        const assignmentStatus = String(
          planDetail?.patient_assignment_status ||
            summary?.patient_assignment_status ||
            '',
        ).toLowerCase();

        // Same plan already paused → resume (resume only works from paused)
        if (assignmentId && assignmentStatus.includes('pause')) {
          return await resumeAssignment(assignmentId);
        }

        // Completed → must use repeat API, not start
        if (assignmentId && assignmentStatus.includes('complete')) {
          showSuccessToast(
            'This plan is completed. Use Repeat this plan to start a new run.',
            'error',
          );
          return false;
        }

        // Stopped / fresh → start API (do NOT resume a stopped assignment)
        console.log('DIET_START_PAYLOAD =>', { id, diet_plan_id: id });
        const res = await _PATIENT.startDietPlan(id);
        if (res?.success === false) {
          const errMsg = extractDietApiError(
            res,
            'Unable to start diet plan',
          );
          const lower = errMsg.toLowerCase();

          // Same paused assignment mis-detected as "not available"
          if (
            assignmentId &&
            assignmentStatus.includes('pause') &&
            lower.includes('not available')
          ) {
            const resumed = await resumeAssignment(assignmentId);
            if (resumed) return true;
          }

          // Another plan is already active — always show clear message
          if (
            lower.includes('already has an active') ||
            (lower.includes('already') && lower.includes('active')) ||
            (lower.includes('active diet') && !lower.includes('no active'))
          ) {
            showSuccessToast(
              errMsg.includes('active')
                ? errMsg
                : 'Patient already has an active diet plan.',
              'error',
            );
            await loadList();
            return false;
          }

          showSuccessToast(errMsg, 'error');
          return false;
        }
        showSuccessToast(
          typeof res?.message === 'string' && res.message.trim()
            ? res.message.trim()
            : 'Diet plan started',
          'success',
        );
        await loadList();
        await loadDetail(id);
        return true;
      } catch (e: any) {
        const errMsg = extractDietApiError(
          e,
          e?.message || 'Unable to start plan',
        );
        const lower = errMsg.toLowerCase();
        if (
          lower.includes('already has an active') ||
          (lower.includes('already') && lower.includes('active'))
        ) {
          showSuccessToast(
            errMsg.includes('active')
              ? errMsg
              : 'Patient already has an active diet plan.',
            'error',
          );
        } else {
          showSuccessToast(errMsg, 'error');
        }
        return false;
      } finally {
        setStarting(false);
      }
    },
    [selectedPlanId, planDetail, plans, loadDetail, loadList],
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
          if (isNoActiveDietPlanError(res)) {
            // Plan was paused/completed elsewhere — refresh list, no error toast spam
            await loadList();
            if (selectedPlanId) await loadDetail(selectedPlanId);
            showSuccessToast(
              'This diet plan is not active. Resume or start it to track meals.',
              'error',
            );
            return;
          }
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
    [planDetail, progress, loadProgress, rebuildMeals, loadList, loadDetail, selectedPlanId],
  );

  const adjustWater = useCallback((deltaMl: number) => {
    setWaterMl(prev => Math.max(0, prev + deltaMl));
  }, []);

  const selectedSummary =
    plans.find(p => p.id === selectedPlanId) ||
    (planDetail && String(planDetail.id) === String(selectedPlanId)
      ? mapDietPlanSummary(planDetail)
      : null);

  /**
   * Tracking UI only when THIS selected plan is active.
   * Prefer list status for pause/stop so a stale progress merge can't open tracking.
   */
  const isStarted = useMemo(() => {
    const statusOf = (plan?: any) =>
      String(plan?.patient_assignment_status || plan?.status || '').toLowerCase();

    const summaryStatus = statusOf(selectedSummary);
    const detailStatus = statusOf(planDetail);
    const blocked = (s: string) =>
      s.includes('pause') ||
      s.includes('stop') ||
      s.includes('complete') ||
      s.includes('cancel');

    if (blocked(summaryStatus) || blocked(detailStatus)) {
      return false;
    }

    // Detail must belong to the selected catalog plan (free + subscription)
    if (planDetail && selectedPlanId) {
      const detailPlanId = String(planDetail.id || planDetail.diet_plan_id || '');
      if (detailPlanId && detailPlanId !== String(selectedPlanId)) {
        return isDietPlanStarted(selectedSummary);
      }
    }

    return isDietPlanStarted(planDetail) || isDietPlanStarted(selectedSummary);
  }, [planDetail, selectedSummary, selectedPlanId]);

  const patientDietPlanId = useMemo(() => {
    const fromSummary = selectedSummary?.patient_diet_plan_id || null;
    const fromDetail =
      planDetail && String(planDetail.id) === String(selectedPlanId)
        ? planDetail?.patient_diet_plan_id
        : null;
    return fromDetail || fromSummary || null;
  }, [planDetail, selectedSummary, selectedPlanId]);

  /** Keep last known assignment id so Repeat still works after complete refresh. */
  const lastAssignmentIdRef = useRef<string | null>(null);
  /** Explicitly the last COMPLETED assignment — repeat must use this id. */
  const lastCompletedAssignmentIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (patientDietPlanId) {
      lastAssignmentIdRef.current = String(patientDietPlanId);
    }
  }, [patientDietPlanId]);

  const resolveAssignmentId = useCallback(
    (override?: string | null) => {
      const id =
        override ||
        patientDietPlanId ||
        planDetail?.patient_diet_plan_id ||
        selectedSummary?.patient_diet_plan_id ||
        lastAssignmentIdRef.current ||
        null;
      return id ? String(id) : null;
    },
    [patientDietPlanId, planDetail, selectedSummary],
  );

  const updateStatus = useCallback(
    async (
      action: DietPlanStatusAction,
      stop_reason?: string,
      patientId?: string | null,
      options?: { silent?: boolean },
    ) => {
      // Repeat must use the COMPLETED assignment id (never a new/active one).
      const id =
        action === 'repeat'
          ? String(
              patientId ||
                lastCompletedAssignmentIdRef.current ||
                (getDietListStatus(planDetail || selectedSummary) ===
                'completed'
                  ? resolveAssignmentId()
                  : '') ||
                '',
            ).trim() || null
          : resolveAssignmentId(patientId);

      if (!id) {
        showSuccessToast(
          action === 'repeat'
            ? 'Complete this plan first, then you can repeat it.'
            : 'No diet plan assignment found',
          'error',
        );
        return false;
      }
      if (!(await requireAuth('Please login to update diet plan'))) return false;

      try {
        setUpdatingStatus(true);
        const payload: { action: DietPlanStatusAction; stop_reason?: string } = {
          action,
        };
        // stop_reason only for stop / complete
        if (
          stop_reason &&
          (action === 'stop' || action === 'complete')
        ) {
          payload.stop_reason = stop_reason;
        }

        const res = await _PATIENT.updateDietPlanStatus(id, payload);
        if (res?.success === false) {
          // Always surface backend message (no frontend-only status copy).
          const errMsg = extractDietApiError(
            res,
            typeof res?.message === 'string' && res.message.trim()
              ? res.message.trim()
              : 'Unable to update plan status',
          );

          if (isNoActiveDietPlanError(res) && action !== 'repeat') {
            await loadList();
            if (selectedPlanId) await loadDetail(selectedPlanId);
          }
          showSuccessToast(errMsg, 'error');
          return false;
        }

        // New assignment after reset / repeat
        const nextAssignment =
          res?.data?.patient_diet_plan_id ||
          res?.patient_diet_plan_id ||
          res?.data?.patient_assignment_id ||
          res?.data?.new_patient_diet_plan_id ||
          null;
        if (nextAssignment && (action === 'repeat' || action === 'reset')) {
          lastAssignmentIdRef.current = String(nextAssignment);
          if (action === 'repeat') {
            lastCompletedAssignmentIdRef.current = null;
          }
        }

        if (action === 'complete') {
          const json =
            res?.complete_json ??
            res?.data?.complete_json ??
            res?.completeJson ??
            res?.data?.completeJson ??
            res?.complete ??
            null;
          setCompletionJson(json);
          lastAssignmentIdRef.current = String(id);
          lastCompletedAssignmentIdRef.current = String(id);

          setPlanDetail((prev: any) =>
            prev
              ? {
                  ...prev,
                  patient_assignment_status: 'completed',
                  patient_diet_plan_id: prev.patient_diet_plan_id || id,
                  ended_at: prev.ended_at || new Date().toISOString(),
                }
              : prev,
          );
          setPlans(prev =>
            prev.map(p =>
              String(p.patient_diet_plan_id) === String(id) ||
              String(p.id) === String(selectedPlanId)
                ? {
                    ...p,
                    patient_assignment_status: 'completed',
                    patient_diet_plan_id: p.patient_diet_plan_id || id,
                  }
                : p,
            ),
          );
        }

        if (action === 'repeat' || action === 'reset') {
          setPlanDetail((prev: any) =>
            prev
              ? {
                  ...prev,
                  patient_assignment_status: 'active',
                  patient_diet_plan_id:
                    nextAssignment || prev.patient_diet_plan_id || id,
                  ended_at: null,
                }
              : prev,
          );
          setPlans(prev =>
            prev.map(p =>
              String(p.patient_diet_plan_id) === String(id) ||
              String(p.id) === String(selectedPlanId)
                ? {
                    ...p,
                    patient_assignment_status: 'active',
                    patient_diet_plan_id:
                      nextAssignment || p.patient_diet_plan_id || id,
                  }
                : p,
            ),
          );
        }

        if (action === 'pause') {
          setPlanDetail((prev: any) =>
            prev ? { ...prev, patient_assignment_status: 'paused' } : prev,
          );
          setPlans(prev =>
            prev.map(p =>
              String(p.patient_diet_plan_id) === String(id) ||
              String(p.id) === String(selectedPlanId)
                ? { ...p, patient_assignment_status: 'paused' }
                : p,
            ),
          );
        }

        if (action === 'stop') {
          setPlanDetail((prev: any) =>
            prev
              ? {
                  ...prev,
                  patient_assignment_status: 'stopped',
                  ended_at: prev.ended_at || new Date().toISOString(),
                }
              : prev,
          );
          setPlans(prev =>
            prev.map(p =>
              String(p.patient_diet_plan_id) === String(id) ||
              String(p.id) === String(selectedPlanId)
                ? {
                    ...p,
                    patient_assignment_status: 'stopped',
                  }
                : p,
            ),
          );
        }

        if (action === 'resume') {
          setPlanDetail((prev: any) =>
            prev ? { ...prev, patient_assignment_status: 'active' } : prev,
          );
          setPlans(prev =>
            prev.map(p =>
              String(p.patient_diet_plan_id) === String(id) ||
              String(p.id) === String(selectedPlanId)
                ? { ...p, patient_assignment_status: 'active' }
                : p,
            ),
          );
        }

        if (!options?.silent) {
          const backendMsg =
            typeof res?.message === 'string' ? res.message.trim() : '';
          const fallbackMsg =
            action === 'pause'
              ? 'Plan paused'
              : action === 'resume'
                ? 'Plan resumed'
                : action === 'stop'
                  ? 'Plan stopped'
                  : action === 'reset'
                    ? 'Plan reset'
                    : action === 'repeat'
                      ? 'Plan repeated'
                      : 'Plan completed';
          // Prefer backend message whenever present
          showSuccessToast(backendMsg || fallbackMsg, 'success');
        }
        await loadList();
        if (selectedPlanId) {
          await loadDetail(selectedPlanId);
        }
        return true;
      } catch (e: any) {
        showSuccessToast(
          extractDietApiError(e, e?.message || 'Unable to update plan status'),
          'error',
        );
        return false;
      } finally {
        setUpdatingStatus(false);
      }
    },
    [
      resolveAssignmentId,
      loadList,
      loadDetail,
      selectedPlanId,
      selectedSummary,
      planDetail,
    ],
  );

  /** Currently active assignment (only one allowed at a time). */
  const activePlan = useMemo(() => {
    return plans.find(p => getDietListStatus(p) === 'active') || null;
  }, [plans]);

  /**
   * If another plan is active, resume needs a confirm (pause active → resume this).
   * Returns { needsConfirm, activePlan } when a modal should open.
   */
  const prepareResume = useCallback(() => {
    const resumeId = resolveAssignmentId();
    if (!resumeId) {
      showSuccessToast(
        'We couldn’t find this plan assignment. Open it from your list and try again.',
        'error',
      );
      return { needsConfirm: false as const, canResume: false as const };
    }
    const otherActive =
      activePlan &&
      String(activePlan.patient_diet_plan_id || '') !== String(resumeId)
        ? activePlan
        : null;

    if (otherActive?.patient_diet_plan_id) {
      return {
        needsConfirm: true as const,
        canResume: true as const,
        activePlan: otherActive,
        resumeId: String(resumeId),
      };
    }
    return {
      needsConfirm: false as const,
      canResume: true as const,
      resumeId: String(resumeId),
    };
  }, [activePlan, resolveAssignmentId]);

  /** Start another plan while one is already active → confirm pause first. */
  const prepareStart = useCallback(() => {
    const catalogId = selectedPlanId;
    if (!catalogId) {
      return { needsConfirm: false as const, canStart: false as const };
    }
    const otherActive =
      activePlan && String(activePlan.id) !== String(catalogId) ? activePlan : null;

    if (otherActive?.patient_diet_plan_id) {
      return {
        needsConfirm: true as const,
        canStart: true as const,
        activePlan: otherActive,
        startPlanId: String(catalogId),
      };
    }
    return {
      needsConfirm: false as const,
      canStart: true as const,
      startPlanId: String(catalogId),
    };
  }, [activePlan, selectedPlanId]);

  /** Pause the active plan, then resume the target via status API. */
  const pauseActiveAndResume = useCallback(
    async (activeAssignmentId: string | number, resumeAssignmentId: string | number) => {
      if (!(await requireAuth('Please login to update diet plan'))) return false;

      try {
        setUpdatingStatus(true);

        const pauseRes = await _PATIENT.updateDietPlanStatus(activeAssignmentId, {
          action: 'pause',
        });
        if (pauseRes?.success === false) {
          showSuccessToast(
            extractDietApiError(pauseRes, 'Unable to pause the active plan'),
            'error',
          );
          return false;
        }

        const resumeRes = await _PATIENT.updateDietPlanStatus(resumeAssignmentId, {
          action: 'resume',
        });
        if (resumeRes?.success === false) {
          showSuccessToast(
            extractDietApiError(resumeRes, 'Unable to resume this plan'),
            'error',
          );
          await loadList();
          return false;
        }

        const backendMsg =
          (typeof resumeRes?.message === 'string' && resumeRes.message.trim()) ||
          (typeof pauseRes?.message === 'string' && pauseRes.message.trim()) ||
          '';
        showSuccessToast(backendMsg || 'Plan resumed', 'success');
        await loadList();
        if (selectedPlanId) {
          await loadDetail(selectedPlanId);
        }
        return true;
      } catch (e: any) {
        showSuccessToast(
          extractDietApiError(e, e?.message || 'Unable to switch diet plan'),
          'error',
        );
        return false;
      } finally {
        setUpdatingStatus(false);
      }
    },
    [loadList, loadDetail, selectedPlanId],
  );

  /** Pause active assignment, then start the selected catalog plan (free or paid). */
  const pauseActiveAndStart = useCallback(
    async (activeAssignmentId: string | number, catalogPlanId: string) => {
      if (!(await requireAuth('Please login to start a diet plan'))) return false;

      try {
        setUpdatingStatus(true);
        setStarting(true);

        const pauseRes = await _PATIENT.updateDietPlanStatus(activeAssignmentId, {
          action: 'pause',
        });
        if (pauseRes?.success === false) {
          showSuccessToast(
            pauseRes?.message || 'Unable to pause the active plan',
            'error',
          );
          return false;
        }

        console.log('DIET_START_PAYLOAD =>', {
          diet_plan_id: String(catalogPlanId),
        });
        const startRes = await _PATIENT.startDietPlan(String(catalogPlanId));
        if (startRes?.success === false) {
          showSuccessToast(
            extractDietApiError(
              startRes,
              'This diet plan is not available for the patient.',
            ),
            'error',
          );
          await loadList();
          return false;
        }

        showSuccessToast(
          typeof startRes?.message === 'string' && startRes.message.trim()
            ? startRes.message.trim()
            : 'Active plan paused. New plan started.',
          'success',
        );
        await loadList();
        await loadDetail(String(catalogPlanId));
        return true;
      } catch (e: any) {
        showSuccessToast(e?.message || 'Unable to switch diet plan', 'error');
        return false;
      } finally {
        setUpdatingStatus(false);
        setStarting(false);
      }
    },
    [loadList, loadDetail],
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

  /** True when every meal in the plan is logged complete */
  const isPlanFullyComplete = useMemo(() => {
    if (!planDetail || !isStarted) return false;
    const days = getPlanJsonDays(planDetail);
    if (!days.length) return false;
    return days.every(dayKey => {
      const dayMeals = mapPlanJsonMeals(planDetail, dayKey, progress);
      return (
        dayMeals.length > 0 && dayMeals.every(m => m.status === 'done')
      );
    });
  }, [planDetail, progress, isStarted]);

  const listStatus = useMemo(
    () => getDietListStatus(planDetail || selectedSummary),
    [selectedSummary, planDetail],
  );

  const completePlan = useCallback(async () => {
    return updateStatus('complete');
  }, [updateStatus]);

  const resetPlan = useCallback(
    async (stop_reason?: string) => {
      return updateStatus('reset', stop_reason);
    },
    [updateStatus],
  );

  const repeatPlan = useCallback(async () => {
    const status = getDietListStatus(planDetail || selectedSummary);
    const assignmentId =
      lastCompletedAssignmentIdRef.current ||
      (status === 'completed' ? resolveAssignmentId() : null);
    if (!assignmentId) {
      // Let the status API respond if we somehow have a stale id later
      return updateStatus('repeat');
    }
    return updateStatus('repeat', undefined, assignmentId);
  }, [updateStatus, resolveAssignmentId, selectedSummary, planDetail]);

  const pausePlan = useCallback(async () => {
    return updateStatus('pause');
  }, [updateStatus]);

  const stopPlan = useCallback(
    async (stop_reason?: string) => {
      return updateStatus('stop', stop_reason || 'Stopped by user');
    },
    [updateStatus],
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
    isPlanFullyComplete,
    listStatus,
    completionJson,
    patientDietPlanId,
    activePlan,
    loadingList,
    loadingDetail,
    loadingMore,
    hasMore,
    starting,
    updatingStatus,
    loggingMealId,
    refreshing,
    refresh,
    loadMore,
    startPlan,
    logMeal,
    adjustWater,
    updateStatus,
    completePlan,
    resetPlan,
    repeatPlan,
    pausePlan,
    stopPlan,
    prepareResume,
    prepareStart,
    pauseActiveAndResume,
    pauseActiveAndStart,
    switchPlan,
  };
};
