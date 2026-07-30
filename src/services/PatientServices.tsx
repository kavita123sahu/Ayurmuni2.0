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

export const deletePatientById = async (id: string) => {
    try {
        const response = await apiClient(`patients/?id=${id}`, {
            method: 'DELETE',
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

export const getDietPlans = async (params?: {
    id?: string | number;
    type?: 'all' | string;
}) => {
    try {
        const query = new URLSearchParams();
        if (params?.id != null && String(params.id).trim() !== '') {
            query.set('id', String(params.id));
        }
        if (params?.type) {
            query.set('type', String(params.type));
        }
        const qs = query.toString();
        const path = qs
            ? `patients/diet-plans/?${qs}`
            : 'patients/diet-plans/';

        const response = await apiClient(path, {
            method: 'GET',
        });
        console.log('DIET_PLANS_API =>', response);
        return response;
    } catch (error) {
        console.log('DIET_PLANS_API_ERROR =>', error);
        throw error;
    }
};

/** Start a diet plan for the patient */
export const startDietPlan = async (diet_plan_id: string | number) => {
    try {
        const response = await apiClient('patients/diet-plans/start/', {
            method: 'POST',
            body: JSON.stringify({ diet_plan_id }),
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/** Track / update diet plan progress */
export const updateDietPlanProgress = async (payload: {
    diet_plan_id: string | number;
    meal_id?: string | number;
    calories_consumed?: number;
    water_ml?: number;
    carbs_g?: number;
    protein_g?: number;
    fat_g?: number;
    date?: string;
    [key: string]: any;
}) => {
    try {
        const response = await apiClient('patients/diet-plans/progress/', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return response;
    } catch (error) {
        throw error;
    }
};
