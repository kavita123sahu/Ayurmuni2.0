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

/** GET current diet plan progress */
export const getDietPlanProgress = async (patient_diet_plan_id?: string | number) => {
    try {
        const qs =
            patient_diet_plan_id != null && String(patient_diet_plan_id).trim() !== ''
                ? `?id=${encodeURIComponent(String(patient_diet_plan_id))}`
                : '';
        const response = await apiClient(`patients/diet-plans/progress/${qs}`, {
            method: 'GET',
        });
        console.log('DIET_PROGRESS_GET =>', response);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * PATCH diet plan progress
 * payload: { day: "day_1", meal: "morning", status: "completed", completed_at: "2026-07-15T07:15:00Z" }
 */
export const updateDietPlanProgress = async (payload: {
    day: string;
    meal: string;
    status: 'completed' | 'pending' | string;
    completed_at?: string | null;
}) => {
    try {
        const body: Record<string, any> = {
            day: payload.day,
            meal: payload.meal,
            status: payload.status,
        };
        // Always send completed_at when completing (required by API)
        if (payload.status === 'completed') {
            body.completed_at =
                payload.completed_at ||
                new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
        } else if (payload.completed_at !== undefined) {
            body.completed_at = payload.completed_at;
        }

        console.log('DIET_PROGRESS_PATCH =>', body);
        const response = await apiClient('patients/diet-plans/progress/', {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
        console.log('DIET_PROGRESS_PATCH_RES =>', response);
        return response;
    } catch (error) {
        throw error;
    }
};

export type DietPlanStatusAction = 'pause' | 'resume' | 'stop' | 'complete';

/**
 * Update patient diet plan assignment status
 * /patients/diet-plans/status/?id={{patient_diet_plan_id}}
 */
export const updateDietPlanStatus = async (
    patient_diet_plan_id: string | number,
    payload: {
        action: DietPlanStatusAction;
        stop_reason?: string;
    },
) => {
    try {
        const id = encodeURIComponent(String(patient_diet_plan_id));
        const response = await apiClient(
            `patients/diet-plans/status/?id=${id}`,
            {
                method: 'POST',
                body: JSON.stringify(payload),
            },
        );
        return response;
    } catch (error) {
        throw error;
    }
};
