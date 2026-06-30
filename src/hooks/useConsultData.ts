import {
    useEffect,
    useState,
    useCallback,
    useRef,
} from 'react';

import * as _CONSULT_SERVICES
    from '../services/ConsultServce';
import { Images } from '../common/Images';

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

                console.log('ALL DOCTOR DATA ==>', AllfavDoctor);

                setRecentDoctors(doctorRecent);

                setFavDoctors(AllfavDoctor?.data?.results || []);

                setCategories(
                    categoryRes?.data || [],
                );

                setTopDoctors(
                    topDoctorRes?.data || [],
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

    const [loading, setLoading] = useState(false);
    const [AppointData, setAppointData] = useState<any[]>([]);

    const [refreshing, setRefreshing] = useState(false);

    const getAllAppointment = useCallback(async () => {
        try {
            setLoading(true);

            const res = await _CONSULT_SERVICES.getConsultHistory({});
            console.log("consulresposne", res);

            setAppointData(res?.data?.results || []);
            setLoading(false);

        } catch (e) {
            console.log("ALL_DOCTOR_APPOINT_ERROR", e);
        } finally {
            setLoading(false);
        }
    }, []);


    const refreshUpcoming = useCallback(async () => {
        try {
            setRefreshing(true);

            await Promise.all([
                getAllAppointment()
            ]);

        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        getAllAppointment();
    }, [getAllAppointment]);

    return { loading, AppointData, refreshUpcoming };
};




