import { utils } from "xlsx";
import { BaseUrl, Method } from "../config/Key";
import { Utils } from "../common/Utils";
import { apiClient } from "./APIconfig";

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

        return response;

    } catch (error) {

        throw error;
    }
}


export const getTopDoctor = async () => {
    try {
        const response = await apiClient('customers/topdoctors/', {
            method: 'GET'
        });

        return response;
    } catch (error) {
        throw error;
    }
}


export const ToggleFavDoctor = async (doctorID: number, method: 'POST') => {
    try {
        const response = await apiClient(`favorites/doctors/?doctor_id=${doctorID}`, {
            method: method
        });

        return response;
    } catch (error) {
        throw error;
    }
}

export const AllFavDoctor = async () => {
    try {
        const response = await apiClient('favorites/doctors/', {
            method: 'GET'
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



export const getDoctorSpecialities = async () => {
    try {
        const response = await apiClient('customers/topdoctors/', {
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

        return response;
    } catch (error) {
        throw error;
    }
}


export const getConsultHistory = async (
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

        return response;

    } catch (error) {

        throw error;
    }
};

export const getFilterTopDoctor = async (
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
            'Final Query Params:',
            query,
        );

        const response =
            await apiClient(
                `customers/doctors/?${query}`,
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

export const getPatient = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            console.log(BaseUrl.base_url + 'healthcare/patient/')

            let serverResponse = await fetch(BaseUrl.base_url + 'healthcare/patient/', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const getBookingOrder = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            console.log(BaseUrl.base_url + '/healthcare/appointments/consultations-with-orders/')

            let serverResponse = await fetch(BaseUrl.base_url + '/healthcare/appointments/consultations-with-orders/', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const addPatient = async (data: Object) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            console.log('Add Patient Fetch Params:', BaseUrl.base_url + 'ecom/patient/', fetchParameter);
            let serverResponse = await fetch(BaseUrl.base_url + 'healthcare/patient/', fetchParameter);
            resolve(serverResponse);
        }

        catch (error) {
            reject(error);
        }
    })
}


export const createConsultationPayment = async (data: object) => {
    try {
        const response = await apiClient('doctors/consultation/payment/', {
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
        const response = await apiClient('doctors/consultation/payment/verify/', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        return response;
    } catch (error) {
        throw error;
    }
}





