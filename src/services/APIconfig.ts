import { Utils } from "../common/Utils";
import { BaseUrl } from "../config/Key";
import * as _AUTH_SERVICES from "./AuthService";


// export const apiClient = async (
//     endpoint: string,
//     options: RequestInit = {}
// ) => {
//     try {
//         const token = await Utils.getData('_TOKEN');

//         console.log('API CALL ===>', token, endpoint, options);

//         const headers = {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             'ngrok-skip-browser-warning': 'true',
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//             ...(options.headers || {}),
//         };

//         const response = await fetch(BaseUrl.base_url + endpoint, {
//             ...options,
//             headers,
//         });

//         return response;
//     } catch (error) {
//         throw error;
//     }
// };



// export const apiClient1 = async (
//     endpoint: string,
//     options: RequestInit = {},
// ) => {

//     try {

//         const token = await Utils.getData('_TOKEN');

//         /*
//             CHECK FORM DATA
//         */

//         const isFormData =
//             options?.body instanceof FormData;

//         /*
//             HEADERS
//         */

//         const headers: any = {
//             Accept: 'application/json',

//             'ngrok-skip-browser-warning':
//                 'true',

//             ...(token
//                 ? {
//                     Authorization: `Bearer ${token}`,
//                 }
//                 : {}),

//             /*
//                 JSON HEADER ONLY
//                 IF NOT FORM DATA
//             */

//             ...(!isFormData && {
//                 'Content-Type':
//                     'application/json',
//             }),

//             ...(options.headers || {}),
//         };

//         /*
//             API CALL
//         */

//         const response = await fetch(
//             BaseUrl.base_url + endpoint,
//             {
//                 ...options,
//                 headers,
//             },
//         );

//         /*
//             JSON RESPONSE
//         */

//         const data = await response.json();

//         /*
//             ERROR RESPONSE
//         */

//         if (!response.ok) {

//             return {
//                 success: false,
//                 status: response.status,
//                 message:
//                     data?.message ||
//                     'Something went wrong',
//                 data,
//             };
//         }

//         /*
//             SUCCESS RESPONSE
//         */

//         return {
//             success: true,
//             status: response.status,
//             ...data,
//         };

//     } catch (error: any) {

//         console.log(
//             'API CLIENT ERROR ===>',
//             error,
//         );

//         return {
//             success: false,
//             message:
//                 error?.message ||
//                 'Network Error',
//         };
//     }
// };

let isRefreshing = false;

let refreshPromise: Promise<string | null> | null =
    null;

/*
|--------------------------------------------------------------------------
| CLEAR SESSION
|--------------------------------------------------------------------------
*/

const clearSession = async () => {
    await Utils.removeData('_TOKEN');
    await Utils.removeData('_REFRESH_TOKEN');
};

/*
|--------------------------------------------------------------------------
| REFRESH ACCESS TOKEN
|--------------------------------------------------------------------------
*/

const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken =
            await Utils.getData('_REFRESH_TOKEN');

        console.log(
            'REFRESHING TOKEN WITH =>',
            refreshToken,
        );

        if (!refreshToken) {
            return null;
        }

        const payload = {
            refresh: refreshToken,
        };

        console.log(
            'REFRESH PAYLOAD =>',
            payload,
        );

        const response = await fetch(
            `${BaseUrl.base_url}user/token/refresh/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json',
                    Accept:
                        'application/json',
                },
                body: JSON.stringify(
                    payload,
                ),
            },
        );

        console.log(
            'REFRESH STATUS =>',
            response.status,
        );

        const responseText =
            await response.clone().text();

        console.log(
            'REFRESH RAW RESPONSE =>',
            responseText,
        );

        let data = null;

        try {
            data =
                await response.json();
        } catch (error) {
            console.log(
                'REFRESH JSON ERROR =>',
                error,
            );
        }

        console.log(
            'TOKEN_REFRESH_RESPONSE =>',
            data,
        );

        if (!response.ok) {
            return null;
        }

        /*
        --------------------------------------------------
        CHECK RESPONSE KEYS
        --------------------------------------------------
        */

        const accessToken =
            data?.access ||
            data?.access_token;

        const newRefreshToken =
            data?.refresh ||
            data?.refresh_token;

        console.log(
            'NEW ACCESS TOKEN =>',
            accessToken,
        );

        console.log(
            'NEW REFRESH TOKEN =>',
            newRefreshToken,
        );

        if (!accessToken) {
            return null;
        }

        await Utils.storeData(
            '_TOKEN',
            accessToken,
        );

        if (newRefreshToken) {
            await Utils.storeData(
                '_REFRESH_TOKEN',
                newRefreshToken,
            );
        }

        console.log(
            'TOKENS SAVED SUCCESSFULLY',
        );

        return accessToken;
    } catch (error) {
        console.log(
            'REFRESH TOKEN ERROR =>',
            error,
        );

        return null;
    }
};

/*
|--------------------------------------------------------------------------
| SINGLE REFRESH QUEUE
|--------------------------------------------------------------------------
*/

const getFreshToken = async () => {
    if (
        isRefreshing &&
        refreshPromise
    ) {
        return refreshPromise;
    }

    isRefreshing = true;

    refreshPromise =
        refreshAccessToken();

    console.log("resfrsporimisee", refreshPromise);


    try {
        return await refreshPromise;
    } finally {
        isRefreshing = false;
        refreshPromise = null;
    }
};

/*
|--------------------------------------------------------------------------
| FETCH REQUEST
|--------------------------------------------------------------------------
*/

const makeRequest = async (
    endpoint: string,
    options: RequestInit,
    token?: string,
) => {
    const isFormData =
        options?.body instanceof FormData;

    const headers = {
        Accept: 'application/json',

        ...(token && {
            Authorization: `Bearer ${token}`,
        }),

        ...(!isFormData && {
            'Content-Type':
                'application/json',
        }),

        ...(options.headers || {}),
    };

    return fetch(
        BaseUrl.base_url + endpoint,
        {
            ...options,
            headers,
        },
    );
};

/*
|--------------------------------------------------------------------------
| API CLIENT
|--------------------------------------------------------------------------
*/

export const apiClient = async (
    endpoint: string,
    options: RequestInit = {},
) => {
    try {
        let token =
            await Utils.getData('_TOKEN');

        console.log(
            'API REQUEST111111111 =>',
            endpoint,
            token,
            options,
        );


        let response =
            await makeRequest(
                endpoint,
                options,
                token,
            );

        /*
        --------------------------------------------------
        TOKEN EXPIRED
        --------------------------------------------------
        */

        console.log(
            'API REQUEST =>',
            endpoint,
            token,
            response.status,
        );

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            console.log(
                'TOKEN EXPIRED => REFRESHING',
            );

            const freshToken =
                await getFreshToken();

            console.log("freshTokenfreshToken", freshToken)

            if (!freshToken) {
                // await clearSession();

                return {
                    success: false,
                    logout: true,
                    message:
                        'Session expired',
                };
            }

            /*
            --------------------------------------------------
            RETRY ORIGINAL REQUEST
            --------------------------------------------------
            */

            response =
                await makeRequest(
                    endpoint,
                    options,
                    freshToken,
                );
        }

        /*
        --------------------------------------------------
        SAFE JSON PARSE
        --------------------------------------------------
        */

        let data = null;

        try {
            data =
                await response.json();
        } catch {
            data = null;
        }


        console.log(
            'APIRESPONSE =>',
            data,
            response
        );
        /*
        --------------------------------------------------
        ERROR RESPONSE
        --------------------------------------------------
        */

        if (!response.ok) {
            return {
                success: false,
                status:
                    response.status,
                message:
                    data?.message ||
                    data?.detail ||
                    'Something went wrong',
                data,
            };
        }

        /*
        --------------------------------------------------
        SUCCESS RESPONSE
        --------------------------------------------------
        */

        return {
            success: true,
            status:
                response.status,
            ...(data || data),
        };
    } catch (error: any) {
        console.log(
            'API ERROR =>',
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