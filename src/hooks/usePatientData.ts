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




import { pick } from '@react-native-documents/picker';
import { AddMedicalRecord } from '../services/PatientServices';
import {
    launchCamera,
} from 'react-native-image-picker';
import { Alert } from 'react-native';

type FileItem = {
    id: string;
    name: string;
    uri: string;
    type: string;
    status?: 'pending' | 'uploading' | 'uploaded' | 'error';
    file_url?: string;
};

export const useMedicalRecord = () => {

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [patientsRecord, setPatientRecord] =
        useState<any[]>([]);

    const fetchPatientsRecord =
        useCallback(async () => {

            try {

                setLoading(true);

                const response = await _PATIENT_SERVICES.getAllMedicalRecord();

                console.log('patinerecordsss', response);

                const data = response?.data || [];

                setPatientRecord(data);


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

        fetchPatientsRecord();

    }, [fetchPatientsRecord]);

    const onRefresh =
        useCallback(() => {

            setRefreshing(true);

            fetchPatientsRecord();

        }, [fetchPatientsRecord]);



    return {
        loading,
        refreshing,
        patientsRecord,
        fetchPatientsRecord,
        onRefresh,
    };
};


export const useMedicalUpload = (
    fetchPatientsRecord?: () => void,
    onRecordSelected?: (recordId: string) => void,
) => {

    const [uploading, setUploading] = useState(false);
    const [pickedFile, setPickedFile] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const selectFile = async () => {
        try {
            const result = await pick({
                mode: 'open',
                type: ['image/*', 'application/pdf'],
            });

            const file = result?.[0];
            if (!file) return;

            setPickedFile(file);
            setModalVisible(true);

        } catch (error) {
            console.log('PICK FILE ERROR =>', error);
        }
    };

    const CameraUpload = async () => {
        try {
            const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                saveToPhotos: false,
            });

            if (!result.assets?.length) return;

            const file = result.assets[0];
            setPickedFile({
                uri: file.uri,
                name: file.fileName || `photo_${Date.now()}.jpg`,
                type: file.type || 'image/jpeg',
            });
            setModalVisible(true);

        } catch (error) {
            console.log('CAMERA ERROR =>', error);
        }
    };

    // Modal ke Submit button se ye call hoga
    const submitRecord = async (payload: {
        description: string;
        medical_record_type: string;
    }) => {
        if (!pickedFile) return;

        try {
            setUploading(true);

            // 1. Upload Image
            const formData = new FormData();
            formData.append('image', {
                uri: pickedFile.uri,
                name: pickedFile.name,
                type: pickedFile.type,
            } as any);
            formData.append('dir', 'customer_avatar');

            const uploadResponse = await _PROFILE_SERVICES.UploadProfilePhoto(formData);
            const fileUrl = uploadResponse?.data?.url;

            // 2. Add Medical Record
            const recordResponse = await AddMedicalRecord({
                medical_record_type: payload.medical_record_type,
                file_type: pickedFile.type?.includes('pdf') ? 'pdf' : 'image',
                description: payload.description,
                file_url: fileUrl,
            });

            const recordId = recordResponse?.data?.id;

            if (recordId) {
                onRecordSelected?.(recordId);
            }

            // 3. Refresh List
            await fetchPatientsRecord?.();

            // 4. Close Modal
            setModalVisible(false);
            setPickedFile(null);

        } catch (error) {
            console.log('UPLOAD ERROR =>', error);
        } finally {
            setUploading(false);
        }
    };
    const closeUploadModal = () => {
        if (uploading) return;
        setModalVisible(false);
        setPickedFile(null);
    };

    const removeFile = async (recordId: string) => {
        try {
            setUploading(true);
            await _PATIENT_SERVICES.deleteMedicalRecord(recordId);
            await fetchPatientsRecord?.();
        } catch (error) {
            console.log('REMOVE FILE ERROR =>', error);
        } finally {
            setUploading(false);
        }
    };

    return {
        uploading,
        pickedFile,
        modalVisible,
        selectFile,
        CameraUpload,
        removeFile,
        submitRecord,
        closeUploadModal,
    };
};