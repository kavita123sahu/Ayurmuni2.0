import {
    useCallback,
    useEffect,
    useState,
} from 'react';
import * as _PATIENT_SERVICES from '../services/PatientServices';
import { Utils } from '../common/Utils';
import *as _PROFILE_SERVICES from '../services/ProfileServices';

export const usePatientData = () => {

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [patients, setPatients] =
        useState<any[]>([]);

    const [selectedPatient, setSelectedPatient] =
        useState<any>(null);

    const fetchPatients =
        useCallback(async () => {

            try {

                setLoading(true);

                const response =
                    await _PATIENT_SERVICES.getPatientList();

                console.log('patient_list_response', response);

                const data = response?.data?.results || [];

                setPatients(data);

                const activePatient = data.find((item: any) => item?.is_active_profile);

                setSelectedPatient(
                    activePatient || null,
                );

            } catch (error) {

                console.log(
                    'PATIENT LIST ERROR ===>',
                    error,
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        }, []);

    useEffect(() => {

        fetchPatients();

    }, [fetchPatients]);

    const onRefresh =
        useCallback(() => {

            setRefreshing(true);

            fetchPatients();

        }, [fetchPatients]);

    const switchPatient =
        async (
            patientId: string,
        ) => {

            try {

                const resposne = await _PATIENT_SERVICES.PatientSwitch(
                    patientId,
                );

                console.log('switch_patient_response', resposne);

                const JSONDATA = await resposne.data;

                console.log('switch_patient_json', JSONDATA);

                Utils.storeData('_USER_ID', JSONDATA?.user_id);
                Utils.storeData('_TOKEN', JSONDATA?.access);
                Utils.storeData('_REFRESH_TOKEN', JSONDATA?.refresh);

                await fetchPatients();

            } catch (error) {

                console.log(
                    'SWITCH PATIENT ERROR ===>',
                    error,
                );

            }
        };

    return {
        loading,
        refreshing,
        patients,
        selectedPatient,
        fetchPatients,
        onRefresh,
        switchPatient,
    };
};




export const usePatientForm = (
    patientId?: string,
) => {

    const [loading, setLoading] =
        useState(false);

    const [patientData, setPatientData] =
        useState<any>(null);

    const getPatientDetail =
        async () => {

            if (!patientId) {
                return;
            }

            try {

                setLoading(true);

                const response =
                    await _PATIENT_SERVICES.GetPatientById(
                        patientId,
                    );
                console.log('patient_detail_response', response);

                setPatientData(
                    response?.data || null,
                );

            } catch (error) {

                console.log(
                    'PATIENT DETAIL ERROR',
                    error,
                );

            } finally {

                setLoading(false);

            }
        };

    useEffect(() => {
        getPatientDetail();
    }, [patientId]);

    return {
        loading,
        patientData,
        getPatientDetail,
    };
};



export const uploadImage = async (
    image: any,
    dir = 'customer_avatar',
) => {
    const formData =
        new FormData();

    formData.append(
        'image',
        {
            uri: image.uri,
            type:
                image.type ||
                'image/jpeg',
            name:
                image.fileName ||
                `image_${Date.now()}.jpg`,
        } as any,
    );

    formData.append('dir', dir);

    const response =
        await _PROFILE_SERVICES.UploadProfilePhoto(
            formData,
        );

    return response;
};