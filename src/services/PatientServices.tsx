import { apiClient} from "./APIconfig";

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