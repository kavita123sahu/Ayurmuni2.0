import { apiClient } from "./APIconfig";

export const getPatientList = async () => {
    try {
        const response = await apiClient('patients/', {
            method: 'GET'
        });

        return response;
    } catch (error) {
        throw error;
    }
}


export const AddNewPatient = async (patientData: any) => {
    try {
        const response = await apiClient('patients/', {
            method: 'POST',
            body: JSON.stringify(patientData)
        });
        console.log('add_patient_response', response);
        return response;
    } catch (error) {
        throw error;
    }
}

export const GetPatientById = async (id: string) => {
    try {
        const response = await apiClient(`patients/?id=${id}`, {
            method: 'GET'
        });

        return response;
    } catch (error) {
        throw error;
    }
}


export const updatePatientById = async (id: string, patientData: any) => {
    try {
        const response = await apiClient(`patients/?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(patientData)
        });

        console.log('update_patient_response', response);
        return response;
    } catch (error) {
        throw error;
    }
}


export const PatientSwitch = async (id: string) => {
    try {
        const response = await apiClient(`patients/switch/?id=${id}`, {
            method: 'POST'
        });

        return response;
    } catch (error) {
        throw error;
    }
}

export const getAllMedicalRecord = async () => {
    try {
        const response = await apiClient('customers/medical-records/', {
            method: 'GET',
        });
        console.log("responsemedicalrecord", response);
        return response;
    } catch (error) {
        throw error;
    }
}

export const deleteMedicalRecord = async (recordID: string) => {
    try {
        const response = await apiClient(`customers/medical-records/?id=${recordID}`, {
            method: 'DELETE',
        });
        console.log("resposnedleteeeeeeeeeeeeeeeee", response);
        return response;
    } catch (error) {
        throw error;
    }
}


export const AddMedicalRecord = async (patientData: any) => {
    try {
        const response = await apiClient('customers/medical-records/', {
            method: 'POST',
            body: JSON.stringify(patientData)
        });
        console.log('add_patient_response', response);
        return response;
    } catch (error) {
        throw error;
    }
}
