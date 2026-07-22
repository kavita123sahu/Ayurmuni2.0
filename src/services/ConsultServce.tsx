
import { BaseUrl, Method } from "../config/Key";
import { Utils } from "../common/Utils";
import { apiClient } from "./APIconfig";
import { formatExperienceParam } from "../utils/searchUtils";

export const filteredParams = (
    params?: Record<string, any>,
) => {

    return Object.fromEntries(
        Object.entries(params || {})
            .filter(
                ([_, value]) =>
                    value !== undefined &&
                    value !== null &&
                    value !== '',
            ),
    );
};

/** Builds query string for GET /customers/doctors/ with correct encoding. */
export const buildDoctorsQueryString = (
    params?: Record<string, any>,
): string => {
    const clean = filteredParams(params);
    if (clean.experience) {
        clean.experience = formatExperienceParam(String(clean.experience));
    }
    return Object.entries(clean)
        .map(
            ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
        )
        .join('&');
};
export const getHomePage = async () => {
    return new Promise(async (resolve, reject) => {
        try {

            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.base_url + 'catalogs/homepage/', fetchParameter);
            resolve(serverResponse);



        }
        catch (error) {
            reject(error);
        }
    })
}


export const getAllDoctor = async (payload: object) => {
    try {
        const query = buildDoctorsQueryString(payload as Record<string, any>);
        const response = await apiClient(
            query ? `customers/doctors/?${query}` : 'customers/doctors/',
            { method: 'GET' },
        );
        return response;
    } catch (error) {
        throw error;
    }
}


export const getTopDoctor = async () => {
    try {
        const response = await apiClient('customers/doctors/', {
            method: 'GET'
        });

        return response;
    } catch (error) {
        throw error;
    }
}



export const ToggleFavDoctor = async (doctorID: string, method: 'POST') => {
    try {
        const response = await apiClient(`favorites/doctors/?doctor_id=${doctorID}`, {
            method: method
        });

        return response;
    } catch (error) {
        throw error;
    }
}


export const AllDoctorData = async () => {
    try {
        const response = await apiClient('customers/doctors/', {
            method: 'GET'
        });
        return response;
    } catch (error) {
        throw error;
    }
}


export const getMedicalReceipt = async (appointmentId: string) => {
    try {
        const response = await apiClient(`customers/doctors/consultation-receipt/?consultation_id=${appointmentId}`, {
            method: 'GET'
        });
        console.log("getPrescriptionAPIresponse", response)

        return response;
    } catch (error) {
        throw error;
    }
}


// export const getAppointmentDetail = async (appointmentId: string) => {


//     const fetchByParam = (param: 'appointment_id' | 'consultation_id') =>
//         apiClient(
//             `customers/patient/consultation/?appointment_id${param}=${encodeURIComponent(id)}`,
//             { method: 'GET' },
//         );

//     let response = await fetchByParam('appointment_id');
//     if (response?.success) {
//         return response;
//     }

//     const message = String(response?.message || '').toLowerCase();
//     const notFound =
//         response?.status === 404 ||
//         message.includes('not found') ||
//         message.includes('does not exist');

//     if (notFound) {
//         response = await fetchByParam('consultation_id');
//     }

//     return response;
// };


export const getAppointmentDetail = async (appointmentId: string) => {
    try {
        const response = await apiClient(`customers/patient/consultation/?appointment_id=${appointmentId}`, {
            method: 'GET'
        });
   
        return response;
    } catch (error) {
        throw error;
    }
}



export const getPrescriptionDetail = async (doctor_id: string) => {
    try {
        const response = await apiClient(`customers/doctor-slip/?doctor_id=${doctor_id}`, {
            method: 'GET'
        });
        console.log("getPrescriptionAPIresponse", response)

        return response;
    } catch (error) {
        throw error;
    }
}

export const RecentConsultHistory = async () => {
    try {

        const response = await apiClient(
            'customers/doctors/consultation-history/',
            {
                method: 'GET',
            },
        );

        return response;
    } catch (error) {
        throw error;
    }
};

export const getConsultHistory = async (payload: any) => {
    try {
        const cleanPayload = Object.fromEntries(
            Object.entries(payload).filter(
                ([_, value]) =>
                    value !== undefined &&
                    value !== null &&
                    value !== '',
            ),
        );

        const query = new URLSearchParams(
            cleanPayload as Record<string, string>,
        ).toString();

        const response = await apiClient(
            `customers/doctors/consultation-history/?${query}`,
            {
                method: 'GET',
            },
        );

        return response;
    } catch (error) {
        throw error;
    }
};


export const getDoctorSlots = async (
    payload: object,
) => {

    try {

        const cleanPayload =
            Object.fromEntries(
                Object.entries(payload)
                    .filter(
                        ([_, value]) =>
                            value !== undefined &&
                            value !== null &&
                            value !== '',
                    ),
            );

        const query =
            new URLSearchParams(
                cleanPayload as any,
            ).toString();

        console.log(
            'Final Query Paramsurllll:',
            query,
        );

        const response =
            await apiClient(
                `customers/doctors/?${query}`,
                {
                    method: 'GET',
                },
            );

        console.log("docotorResposne", response);

        return response;

    } catch (error) {

        throw error;
    }
};


export const appointmentActionAPI = async ({
    appointmentId,
    payload,
}: {
    appointmentId: string;
    payload: {
        action: "reschedule" | "cancel" | "confirm_reschedule";
        availability?: string;
        reschedule_reason?: string;
        cancellation_reason?: string;
    };
}) => {
    try {
        const response = await apiClient(
            `customers/doctors/appointments/action/?id=${appointmentId}`,
            {
                method: "POST",
                body: JSON.stringify(payload),
            }
        );

        return response;
    } catch (error) {
        throw error;
    }
};


export const getFilterTopDoctor = async (
    payload: object,
) => {

    try {
        const query = buildDoctorsQueryString(payload as Record<string, any>);

        const response =
            await apiClient(
                query ? `customers/doctors/?${query}` : 'customers/doctors/',
                {
                    method: 'GET',
                },
            );

        return response;

    } catch (error) {

        throw error;
    }
};


export const getConsultCategory = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + 'user/health-categories/', fetchParameter);
            let response = await serverResponse.json();
            console.log("catggggggggggggggggg", response)
            resolve(response);
        }

        catch (error) {
            reject(error);
        }
    })
}



export const createConsultationPayment = async (data: object) => {
    try {
        const response = await apiClient('payments/customer/consultation/payment/book-slot/', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        return response;
    } catch (error) {
        throw error;
    }
}


export const verifyConsultationPayment = async (data: object) => {
    try {
        const response = await apiClient('payments/customer/consultation/payment/verify-payment/', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        return response;
    } catch (error) {
        throw error;
    }
}


export const getNotification = async (payload: Record<string, string | number | boolean>) => {
    const query = new URLSearchParams(
        Object.entries(payload).reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
        }, {}),
    ).toString();

    return apiClient(`notifications/?${query}`, {
        method: "GET",
    });
};

/** POST actions: read, clear, delete (per API: ?action=read&notification_id=… or &all=true) */
export const manageNotification = async (payload: Record<string, string | number | boolean>) => {
    const query = new URLSearchParams(
        Object.entries(payload).reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
        }, {}),
    ).toString();

    return apiClient(`notifications/?${query}`, {
        method: "POST",
    });
};

