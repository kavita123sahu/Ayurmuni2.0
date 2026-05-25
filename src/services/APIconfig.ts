import { Utils } from "../common/Utils";
import { BaseUrl } from "../config/Key";


export const apiClient = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    try {
        const token = await Utils.getData('_TOKEN');

        console.log('API CALL ===>', token, endpoint, options);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        };

        const response = await fetch(BaseUrl.base_url + endpoint, {
            ...options,
            headers,
        });

        return response;
    } catch (error) {
        throw error;
    }
};



export const apiClient1 = async (
    endpoint: string,
    options: RequestInit = {},
) => {

    try {

        const token = await Utils.getData('_TOKEN');

        /*
            CHECK FORM DATA
        */

        const isFormData =
            options?.body instanceof FormData;

        /*
            HEADERS
        */

        const headers: any = {
            Accept: 'application/json',

            'ngrok-skip-browser-warning':
                'true',

            ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {}),

            /*
                JSON HEADER ONLY
                IF NOT FORM DATA
            */

            ...(!isFormData && {
                'Content-Type':
                    'application/json',
            }),

            ...(options.headers || {}),
        };

        /*
            API CALL
        */

        const response = await fetch(
            BaseUrl.base_url + endpoint,
            {
                ...options,
                headers,
            },
        );

        /*
            JSON RESPONSE
        */

        const data = await response.json();

        /*
            ERROR RESPONSE
        */

        if (!response.ok) {

            return {
                success: false,
                status: response.status,
                message:
                    data?.message ||
                    'Something went wrong',
                data,
            };
        }

        /*
            SUCCESS RESPONSE
        */

        return {
            success: true,
            status: response.status,
            ...data,
        };

    } catch (error: any) {

        console.log(
            'API CLIENT ERROR ===>',
            error,
        );

        return {
            success: false,
            message:
                error?.message ||
                'Network Error',
        };
    }
};