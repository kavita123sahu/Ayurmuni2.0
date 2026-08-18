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

export const DIET_PLAN_PAGE_SIZE = 20;

export type DietPlanListParams = {
    id?: string | number;
    type?: 'all' | string;
    page?: number;
    page_size?: number;
    search?: string;
    health_disease_id?: string | number;
    prakriti?: string;
    is_paid?: boolean | string;
    duration?: string | number;
    calories?: string | number;
    sort?: 'popularity' | 'latest' | string;
};

export const getDietPlans = async (params?: DietPlanListParams) => {
    try {
        const query = new URLSearchParams();
        if (params?.id != null && String(params.id).trim() !== '') {
            query.set('id', String(params.id));
        }
        if (params?.type) {
            query.set('type', String(params.type));
        }
        if (params?.page != null) {
            query.set('page', String(params.page));
        }
        // if (params?.page_size != null) {
        //     query.set('page_size', String(params.page_size));
        // }
        if (params?.search != null && String(params.search).trim() !== '') {
            query.set('search', String(params.search).trim());
        }
        if (
            params?.health_disease_id != null &&
            String(params.health_disease_id).trim() !== ''
        ) {
            query.set('health_disease_id', String(params.health_disease_id));
        }
        if (params?.prakriti != null && String(params.prakriti).trim() !== '') {
            query.set('prakriti', String(params.prakriti).trim());
        }
        if (params?.is_paid != null && params.is_paid !== '') {
            query.set('is_paid', String(params.is_paid));
        }
        if (params?.duration != null && String(params.duration).trim() !== '') {
            query.set('duration', String(params.duration));
        }
        if (params?.calories != null && String(params.calories).trim() !== '') {
            query.set('calories', String(params.calories));
        }
        if (params?.sort != null && String(params.sort).trim() !== '') {
            query.set('sort', String(params.sort).trim());
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

/** Whether diet-plans list response has another page */
export const hasMoreDietPlanPages = (
    response: any,
    resultsLength: number,
    pageSize: number = DIET_PLAN_PAGE_SIZE,
    pageLoaded?: number,
) => {
    const data = response?.data ?? response;

    if (Array.isArray(data)) {
        // Bare array — assume more only if this page looks full
        return resultsLength >= pageSize;
    }

    if (data && typeof data === 'object') {
        if ('next' in data) {
            return data.next != null && data.next !== '';
        }
        if (data?.pagination?.next != null) {
            return Boolean(data.pagination.next);
        }
        if (data?.links?.next != null) {
            return Boolean(data.links.next);
        }

        const total =
            typeof data.count === 'number'
                ? data.count
                : typeof data.total === 'number'
                    ? data.total
                    : typeof data.total_count === 'number'
                        ? data.total_count
                        : null;
        const page =
            pageLoaded ??
            (typeof data.page === 'number'
                ? data.page
                : typeof data.current_page === 'number'
                    ? data.current_page
                    : null);

        if (total != null && page != null) {
            return page * pageSize < total;
        }
        if (total != null) {
            // Caller may pass cumulative length via resultsLength when appending —
            // for single-page check, full page means likely more.
            return resultsLength >= pageSize;
        }
    }

    return resultsLength >= pageSize;
};

/** Start a diet plan for the patient (catalog diet plan id, not assignment id). */
export const startDietPlan = async (
    diet_plan_id: string | number,
    options?: { daily_water_intake_goal?: number },
) => {
    try {
        const id = String(diet_plan_id).trim();
        const body: Record<string, string | number> = {
            diet_plan_id: id,
            id,
        };
        if (
            options?.daily_water_intake_goal != null &&
            Number.isFinite(Number(options.daily_water_intake_goal)) &&
            Number(options.daily_water_intake_goal) > 0
        ) {
            body.daily_water_intake_goal = Math.round(
                Number(options.daily_water_intake_goal),
            );
        }
        const response = await apiClient('patients/diet-plans/start/', {
            method: 'POST',
            body: JSON.stringify(body),
        });
        console.log('DIET_START_API =>', { diet_plan_id: id, body, response });
        return response;
    } catch (error) {
        console.log('DIET_START_API_ERROR =>', error);
        throw error;
    }
};

/** PATCH daily water intake for the active diet assignment. */
export const updateDietPlanWater = async (payload: {
    day: string;
    intake_ml: number;
}) => {
    try {
        const body = {
            day: String(payload.day || 'day_1'),
            intake_ml: Math.max(0, Math.round(Number(payload.intake_ml) || 0)),
        };
        console.log('DIET_WATER_PATCH =>', body);
        const response = await apiClient('patients/diet-plans/water/', {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
        console.log('DIET_WATER_PATCH_RES =>', response);
        return response;
    } catch (error) {
        console.log('DIET_WATER_PATCH_ERROR =>', error);
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

export type DietPlanStatusAction =
    | 'pause'
    | 'resume'
    | 'stop'
    | 'complete'
    | 'reset'
    | 'repeat';

/**
 * Update patient diet plan assignment status
 * /patients/diet-plans/status/?id={{patient_diet_plan_id}}
 *
 * Actions:
 * - pause / resume / stop / complete / reset / repeat
 * - stop_reason optional (stop / complete)
 * - reset: same assignment progress restart (repeat_count unchanged)
 * - repeat: after completed → new active (repeat_count increments)
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
        console.log('DIET_STATUS_API =>', { id: patient_diet_plan_id, payload, response });
        return response;
    } catch (error) {
        console.log('DIET_STATUS_API_ERROR =>', error);
        throw error;
    }
};

