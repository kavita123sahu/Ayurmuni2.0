import {
    useEffect,
    useState,
    useCallback,
    useRef,
    useMemo,
} from 'react';

import * as _CONSULT_SERVICES
    from '../services/ConsultServce';
import { Images } from '../common/Images';
import { isAuthenticated } from '../services/guestAuth';
import { filterUpcomingAppointments } from '../utils/appointmentUtils';
import {
    getHealthCategories,
    mapProductCategory,
    normalizeApiList,
} from '../services/ProductServices';

export type SlotItem = {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    consultation_type: string;
    amount: number;
    status: string;
    displayTime?: string;
};
const doctorRecent = [{ id: '1', image: Images.doctorImage, name: 'Dr. Arjun R Nair', speciality: 'Cardiologist', date: '12 May', }, { id: '2', image: Images.doctorImage, name: 'Dr. Priya Sharma', speciality: 'Dermatologist', date: '18 May', }, { id: '3', image: Images.doctorImage, name: 'Dr. Rahul Mehta', speciality: 'Neurologist', date: '22 May', },];


export const useConsultData = () => {

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [categories, setCategories] =
        useState<any[]>([]);

    const [recentDoctors, setRecentDoctors] =
        useState<any[]>([]);

    const [topDoctors, setTopDoctors] =
        useState<any[]>([]);

    const [favDoctor, setFavDoctors] =
        useState<any[]>([]);


    const fetchAllData =
        useCallback(async () => {

            try {

                setLoading(true);

                const [
                    categoryRes,
                    topDoctorRes,
                    AllfavDoctor
                ]: any = await Promise.all([
                    getHealthCategories(),
                    _CONSULT_SERVICES.getTopDoctor(),
                    _CONSULT_SERVICES.AllDoctorData(),

                ]);

                console.log('ALLtopDoctorResDOCTOR DATA ==>', topDoctorRes);

                setRecentDoctors(doctorRecent);

                setFavDoctors(AllfavDoctor?.data?.results || []);

                const healthCats = normalizeApiList(categoryRes)
                    .map(mapProductCategory)
                    .filter(item => item.id);

                setCategories(
                    healthCats.length
                        ? healthCats
                        : categoryRes?.data || [],
                );

                setTopDoctors(
                    topDoctorRes?.data?.results || [],
                );

            } catch (error) {

                console.log(
                    'CONSULT API ERROR ===>',
                    error,
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }
        }, []);



    useEffect(() => {
        fetchAllData();
    }, []);

    const onRefresh =
        useCallback(() => {

            setRefreshing(true);

            fetchAllData();

        }, [fetchAllData]);

    return {
        loading,
        refreshing,
        categories,
        topDoctors,
        favDoctor,
        recentDoctors,
        onRefresh,
    };
};



export const useDoctorSlots = (
    payload?: Record<string, any>,
) => {

    const [slots, setSlots] =
        useState<Record<string, any> | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<any>(null);

    const fetchSlots = async () => {

        try {

            setLoading(true);

            const response =
                await _CONSULT_SERVICES
                    .getDoctorSlots(payload || {});

            console.log(
                'API RESPONSE ====',
                response.data,
            );

            setSlots(response?.data);

        } catch (err) {

            console.log(
                'FETCH SLOT ERROR ====',
                err,
            );

            setError(err);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchSlots();

    }, []); // 👈 only once

    return {
        slots,
        loading,
        error,
        refetch: fetchSlots,
    };
};



export const groupSlotsByTime = (
    slots: SlotItem[] = [],
) => {

    const grouped: Record<
        string,
        SlotItem[]
    > = {

        Morning: [],
        Afternoon: [],
        Evening: [],
    };

    slots.forEach(
        (item: SlotItem) => {

            const hour = Number(
                item?.start_time
                    ?.split(':')[0],
            );

            const formattedTime =
                new Date(
                    `2026-01-01T${item?.start_time}`,
                ).toLocaleTimeString(
                    'en-US',
                    {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    },
                );

            const slotData = {
                ...item,
                displayTime:
                    formattedTime,
            };

            if (hour < 12) {

                grouped.Morning.push(
                    slotData,
                );

            } else if (hour < 17) {

                grouped.Afternoon.push(
                    slotData,
                );

            } else {

                grouped.Evening.push(
                    slotData,
                );
            }
        },
    );

    return Object.entries(
        grouped,
    ).filter(
        ([_, value]) =>
            value.length > 0,
    );
};

export type DoctorListFilters = {
    specialization?: string;
    experience?: string;
    from_date?: string;
    to_date?: string;
    search?: string;
    page?: number;
    page_size?: number;
    suggested?: boolean;
    /** Filter doctors by health category (concern) */
    health_category_id?: string;
    /** Filter doctors by disease subcategory */
    health_disease_id?: string;
};

export const useAllDoctors = (selectedFilters: DoctorListFilters = {}) => {
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [doctorData, setDoctorData] = useState<any[]>([]);
    const requestIdRef = useRef(0);

    const getAllDoctors = useCallback(async (options?: { isRefresh?: boolean }) => {
        const reqId = ++requestIdRef.current;
        try {
            if (!options?.isRefresh) {
                setLoading(true);
            }

            // Only send defined filters — never force empty specialization (avoids fetching all)
            const payload: DoctorListFilters = {
                page: selectedFilters.page ?? 1,
                page_size: selectedFilters.page_size ?? 20,
            };

            if (selectedFilters.health_disease_id) {
                payload.health_disease_id = selectedFilters.health_disease_id;
            } else if (selectedFilters.health_category_id) {
                payload.health_category_id = selectedFilters.health_category_id;
            } else if (selectedFilters.specialization) {
                payload.specialization = selectedFilters.specialization;
            }

            if (selectedFilters.experience) {
                payload.experience = selectedFilters.experience;
            }
            if (selectedFilters.from_date) {
                payload.from_date = selectedFilters.from_date;
            }
            if (selectedFilters.to_date) {
                payload.to_date = selectedFilters.to_date;
            }
            if (selectedFilters.search?.trim()) {
                payload.search = selectedFilters.search.trim();
            }
            if (selectedFilters.suggested) {
                payload.suggested = selectedFilters.suggested;
            }

            const res = await _CONSULT_SERVICES.getFilterTopDoctor(payload);

            if (reqId !== requestIdRef.current) return;

            setDoctorData(res?.data?.results || []);
        } catch (e) {
            if (reqId !== requestIdRef.current) return;
            console.log('ALL_DOCTOR_ERROR', e);
            setDoctorData([]);
        } finally {
            if (reqId === requestIdRef.current) {
                if (!options?.isRefresh) {
                    setLoading(false);
                }
            }
        }
    }, [
        selectedFilters.specialization,
        selectedFilters.health_category_id,
        selectedFilters.health_disease_id,
        selectedFilters.experience,
        selectedFilters.from_date,
        selectedFilters.to_date,
        selectedFilters.search,
        selectedFilters.page,
        selectedFilters.page_size,
        selectedFilters.suggested,
    ]);

    useEffect(() => {
        getAllDoctors();
    }, [getAllDoctors]);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        await getAllDoctors({ isRefresh: true });
        setRefreshing(false);
    }, [getAllDoctors]);

    return { loading, refreshing, doctorData, refetch: getAllDoctors, refresh };
};




const HOME_UPCOMING_LIMIT = 5;

/** Lightweight fetch for home — upcoming only, no pagination. */
export const useUpcomingAppointmentsPreview = (limit = HOME_UPCOMING_LIMIT) => {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<any[]>([]);

    const fetchPreview = useCallback(async (options?: { silent?: boolean }) => {
        try {
            if (!(await isAuthenticated())) {
                setAppointments([]);
                return;
            }

            if (!options?.silent) {
                setLoading(true);
            }

            const res = await _CONSULT_SERVICES.getConsultHistory({
                page: 1,
                page_size: limit,
                appointment_status: 'upcoming',
            });

            const results = res?.data?.results || [];
            setAppointments(filterUpcomingAppointments(results, limit));
        } catch (e) {
            console.log('UPCOMING_PREVIEW_ERROR', e);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchPreview();
    }, [fetchPreview]);

    const refreshPreview = useCallback(
        () => fetchPreview({ silent: true }),
        [fetchPreview],
    );

    return {
        loading,
        appointments,
        refreshPreview,
    };
};

export const useAppointmentHistory = (filters?: {
  appointment_status?: string;
  follow_up?: string;
}) => {
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [AppointData, setAppointData] = useState<any[]>([]);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const pageRef = useRef(1);
    const hasMoreRef = useRef(true);
    const loadingMoreRef = useRef(false);
    const appointDataRef = useRef<any[]>([]);

    const filterKey = useMemo(
        () =>
            JSON.stringify({
                appointment_status: filters?.appointment_status ?? '',
                follow_up: filters?.follow_up ?? '',
            }),
        [filters?.appointment_status, filters?.follow_up],
    );

    const getAllAppointment = useCallback(
        async (pageNo = 1, isLoadMore = false) => {
            try {
                if (!(await isAuthenticated())) {
                    setAppointData([]);
                    appointDataRef.current = [];
                    setHasMore(false);
                    hasMoreRef.current = false;
                    setLoading(false);
                    setLoadingMore(false);
                    loadingMoreRef.current = false;
                    return;
                }

                if (isLoadMore) {
                    if (loadingMoreRef.current || !hasMoreRef.current) {
                        return appointDataRef.current;
                    }
                    loadingMoreRef.current = true;
                    setLoadingMore(true);
                } else {
                    setLoading(true);
                }

                const parsed = JSON.parse(filterKey) as {
                    appointment_status?: string;
                    follow_up?: string;
                };

                const res = await _CONSULT_SERVICES.getConsultHistory({
                    page: pageNo,
                    page_size: 20,
                    ...(parsed.appointment_status
                        ? { appointment_status: parsed.appointment_status }
                        : {}),
                    ...(parsed.follow_up
                        ? { follow_up: parsed.follow_up }
                        : {}),
                });
                console.log('APPOINTMENT_HISTORY_DATA', res?.data);

                const results = res?.data?.results || [];
                const nextExists = !!res?.data?.next;
                const canLoadMore = nextExists && results.length > 0;

                setAppointData(prev => {
                    const merged = isLoadMore ? [...prev, ...results] : results;
                    appointDataRef.current = merged;
                    return merged;
                });

                pageRef.current = pageNo;
                hasMoreRef.current = canLoadMore;
                setHasMore(canLoadMore);
                setPage(pageNo);

                return appointDataRef.current;
            } catch (e) {
                console.log('ALL_DOCTOR_APPOINT_ERROR', e);
                return appointDataRef.current;
            } finally {
                setLoading(false);
                setLoadingMore(false);
                loadingMoreRef.current = false;
            }
        },
        [filterKey],
    );

    const loadMore = useCallback(() => {
        if (loadingMoreRef.current || !hasMoreRef.current) {
            return;
        }
        getAllAppointment(pageRef.current + 1, true);
    }, [getAllAppointment]);

    const refreshUpcoming = useCallback(async () => {
        try {
            setRefreshing(true);
            pageRef.current = 1;
            hasMoreRef.current = true;
            setPage(1);
            setHasMore(true);
            await getAllAppointment(1, false);
        } catch (e) {
            console.log('REFRESH_APPOINTMENT_ERROR', e);
        } finally {
            setRefreshing(false);
        }
    }, [getAllAppointment]);

    useEffect(() => {
        pageRef.current = 1;
        hasMoreRef.current = true;
        setPage(1);
        setHasMore(true);
        getAllAppointment(1);
    }, [getAllAppointment]);

    return {
        loading,
        loadingMore,
        refreshing,
        AppointData,
        refreshUpcoming,
        loadMore,
        hasMore,
    };
};




