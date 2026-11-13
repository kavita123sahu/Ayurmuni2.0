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

        if (!refreshToken) {
            return null;
        }

        const payload = {
            refresh: refreshToken,
        };

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

        // Backend sometimes returns 401 "User not found" on refresh —
        // do not treat that as a successful rotation; keep existing access token.
        if (!response.ok || !data?.success) {
            return null;
        }

        /*
        --------------------------------------------------
        CHECK RESPONSE KEYS
        --------------------------------------------------
        */

        const accessToken = data?.data?.access;
        const newRefreshToken = data?.data?.refresh;

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

const performApiRequest = async (
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

        let response = await makeRequest(
            endpoint,
            options,
            token,
        );

        // Refresh only on 401 — 403 is often "not allowed for this resource", not expired token.
        if (requireAuth && response.status === 401) {
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

        const payload =
            data && typeof data === 'object' && !Array.isArray(data)
                ? data
                : {};
        return {
            ...payload,
            // Do not let an absent body `success` wipe the HTTP OK signal;
            // only honor an explicit success:false from the API body.
            success: payload.success === false ? false : true,
            status: response.status,
            ...(data != null &&
            (Array.isArray(data) || typeof data !== 'object')
                ? { data }
                : {}),
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

/**
 * Identical GETs started together share one network call.
 * The slot is dropped as soon as that call finishes — nothing is stored.
 */
const inflightGets = new Map<string, Promise<any>>();

export const apiClient = (
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true,
) => {
    const method = String(options.method || 'GET').toUpperCase();
    const canJoin = method === 'GET' && options.body == null;
    const key = canJoin ? `${requireAuth ? '1' : '0'}:${endpoint}` : '';
    if (key) {
        const pending = inflightGets.get(key);
        if (pending) return pending;
    }

    const run = performApiRequest(endpoint, options, requireAuth);
    if (key) {
        inflightGets.set(key, run);
        void run.finally(() => {
            if (inflightGets.get(key) === run) {
                inflightGets.delete(key);
            }
        });
    }
    return run;
};