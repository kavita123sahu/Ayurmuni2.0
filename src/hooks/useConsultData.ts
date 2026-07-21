import {
    useEffect,
    useState,
    useCallback,
    useRef,
} from 'react';

import * as _CONSULT_SERVICES
    from '../services/ConsultServce';
import { Images } from '../common/Images';
import { isAuthenticated } from '../services/guestAuth';

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
                    // _CONSULT_SERVICES.getConsultCategory(),
                    _CONSULT_SERVICES.getConsultCategory(),
                    _CONSULT_SERVICES.getTopDoctor(),
                    _CONSULT_SERVICES.AllDoctorData(),

                ]);

                console.log('ALLtopDoctorResDOCTOR DATA ==>', topDoctorRes);

                setRecentDoctors(doctorRecent);

                setFavDoctors(AllfavDoctor?.data?.results || []);

                setCategories(
                    categoryRes?.data || [],
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

export const useAllDoctors = (selectedFilters: any) => {


    console.log("selectedfilerpayload", selectedFilters);

    const [loading, setLoading] = useState(false);
    const [doctorData, setDoctorData] = useState<any[]>([]);





    const getAllDoctors = useCallback(async () => {
        try {
            setLoading(true);

            const payload = {
                specialization: selectedFilters.speciality || '',
                experience: selectedFilters.experience || '',
                from_date: selectedFilters.availabilityFrom || '',
                to_date: selectedFilters.availabilityTo || '',
            };
            console.log("payloadddddddddddd", payload);

            const res = await _CONSULT_SERVICES.getFilterTopDoctor(payload);

            setDoctorData(res?.data?.results || []);
        } catch (e) {
            console.log("ALL_DOCTOR_ERROR", e);
        } finally {
            setLoading(false);
        }
    }, [
        selectedFilters?.speciality?.id,
        selectedFilters?.availabilityFrom,
        selectedFilters?.availabilityTo,
        selectedFilters?.experience,
    ]);

    useEffect(() => {
        getAllDoctors();
    }, [getAllDoctors]);

    return { loading, doctorData, refetch: getAllDoctors };
};




export const useAppointmentHistory = () => {
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

                const res = await _CONSULT_SERVICES.getConsultHistory({
                    page: pageNo,
                });
                console.log("APPOINTMENT_HISTORY_DATA", res?.data);

                const results = res?.data?.results || [];
                const nextExists = !!res?.data?.next;

                setAppointData(prev => {
                    const merged = isLoadMore ? [...prev, ...results] : results;
                    appointDataRef.current = merged;
                    return merged;
                });

                pageRef.current = pageNo;
                hasMoreRef.current = nextExists;
                setHasMore(nextExists);
                setPage(pageNo);

                return appointDataRef.current;
            } catch (e) {
                console.log("ALL_DOCTOR_APPOINT_ERROR", e);
                return appointDataRef.current;
            } finally {
                setLoading(false);
                setLoadingMore(false);
                loadingMoreRef.current = false;
            }
        },
        [],
    );

    const loadMore = useCallback(() => {
        if (loadingMoreRef.current || !hasMoreRef.current) {
            return;
        }
        getAllAppointment(pageRef.current + 1, true);
    }, [getAllAppointment]);

    const prefetchUntil = useCallback(
        async (
            shouldStop: (items: any[]) => boolean,
            maxPages = 10,
        ) => {
            let attempts = 0;

            while (
                hasMoreRef.current &&
                attempts < maxPages &&
                !shouldStop(appointDataRef.current)
            ) {
                attempts += 1;
                await getAllAppointment(pageRef.current + 1, true);
            }

            return appointDataRef.current;
        },
        [getAllAppointment],
    );

    const refreshUpcoming = useCallback(async () => {
        try {
            setRefreshing(true);
            pageRef.current = 1;
            hasMoreRef.current = true;
            setPage(1);
            setHasMore(true);
            await getAllAppointment(1, false);
        } catch (e) {
            console.log("REFRESH_APPOINTMENT_ERROR", e);
        } finally {
            setRefreshing(false);
        }
    }, [getAllAppointment]);

    useEffect(() => {
        getAllAppointment(1);
    }, [getAllAppointment]);

    return {
        loading,
        loadingMore,
        refreshing,
        AppointData,
        refreshUpcoming,
        loadMore,
        prefetchUntil,
        hasMore,
    };
};




