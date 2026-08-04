import { Utils } from "../common/Utils";
import { BaseUrl } from "../config/Key";
import * as _AUTH_SERVICES from "./AuthService";


let isRefreshing = false;

let refreshPromise: Promise<string | null> | null =
    null;

/*
|--------------------------------------------------------------------------
| CLEAR SESSION
|--------------------------------------------------------------------------
*/


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


        // Backend sometimes returns 401 "User not found" on refresh —
        // do not treat that as a successful rotation; keep existing access token.
        if (!response.ok || !data?.success) {
            console.log(
                'TOKEN REFRESH FAILED =>',
                response.status,
                data?.message || responseText,
            );
            return null;
        }

        /*
        --------------------------------------------------
        CHECK RESPONSE KEYS
        --------------------------------------------------
        */

        const accessToken = data?.data?.access;
        const newRefreshToken = data?.data?.refresh;

        console.log('accessTokenaccessTokenaccessToken',accessToken)

        if (!accessToken) {
            return null;
        }

        await Utils.storeData('_TOKEN', accessToken);

        if (newRefreshToken) {
            await Utils.storeData(
                '_REFRESH_TOKEN',
                newRefreshToken,
            );
        }

        console.log(
            'NEW TOKEN SAVED =>',
            accessToken,
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

    refreshPromise = refreshAccessToken();
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


export const apiClient = async (
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true,
) => {
    try {
        let token = null;

        // ✅ Sirf auth wali APIs me token lo
        if (requireAuth) {
            token = await Utils.getData('_TOKEN');
        }

        console.log("requireAuthrequireAuth", requireAuth)
        console.log(
            'API REQUEST =>',
            endpoint,
            token,
            options,
        );

        let response = await makeRequest(
            endpoint,
            options,
            token,
        );

        // Refresh only on 401 — 403 is often "not allowed for this resource", not expired token.
        if (requireAuth && response.status === 401) {
            console.log('TOKEN EXPIRED => REFRESHING');
            const freshToken =
                await getFreshToken();

            if (!freshToken) {
                return {
                    success: false,
                    logout: true,
                    message: 'Session expired',
                };
            }

            token = freshToken;

            response = await makeRequest(
                endpoint,
                options,
                freshToken,
            );

            console.log(
                'RETRY STATUS =>',
                response.status,
            );
        }

        let data = null;

        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                message:
                    data?.message ||
                    data?.detail ||
                    'Something went wrong',
                data,
            };
        }

        return {
            success: true,
            status: response.status,
            ...(data || {}),
        };
    }

    catch (error: any) {
        return {
            success: false,
            message:
                error?.message ||
                'Network Error',
        };
    }
};