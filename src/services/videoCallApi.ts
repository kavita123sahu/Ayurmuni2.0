// import { PermissionsAndroid, Platform } from 'react-native';

// import { apiClient } from './APIconfig';



// export const FALLBACK_APP_ID = 'b717053bd3f14a819ffd0c7b6490f169';



// /** Reuse the URL prefix that worked last time (fewer 404/403 fan-out requests). */

// let cachedUrlPrefix: string | null = null;



// const CALL_URL_PREFIXES = [

//   'customers/patient/appointments',

//   'customers/doctors/appointments',

//   'doctors/appointments',

// ] as const;



// const extractUrlPrefix = (endpoint: string): string | null => {

//   for (const prefix of CALL_URL_PREFIXES) {

//     if (endpoint.startsWith(`${prefix}/`)) {

//       return prefix;

//     }

//   }

//   return null;

// };



// /** Patient app tries customer paths first, then legacy doctor path from Postman. */

// const buildCallUrls = (appointmentId: string, action: string): string[] => {

//   const orderedPrefixes = cachedUrlPrefix

//     ? [

//         cachedUrlPrefix,

//         ...CALL_URL_PREFIXES.filter(p => p !== cachedUrlPrefix),

//       ]

//     : [...CALL_URL_PREFIXES];



//   return orderedPrefixes.map(

//     prefix => `${prefix}/${appointmentId}/call/${action}/`,

//   );

// };



// /** Wrong path or role — try the next URL. Do not treat as expired auth. */

// const isTryNextUrlError = (status?: number) =>

//   status === 404 || status === 403;



// const unwrapSuccess = (response: any) => {

//   if (response.data !== undefined && response.data !== null) {

//     return response.data;

//   }

//   return response;

// };



// /**

//  * Calls the video API using one or more appointment ids.

//  * Tries appointment id first, then consultation id, and all URL patterns.

//  */

// async function callApiRequest(

//   appointmentIds: string[],

//   action: string,

//   options: RequestInit,

// ) {

//   const uniqueIds = [...new Set(appointmentIds.filter(Boolean))];

//   if (!uniqueIds.length) {

//     throw new Error('Appointment id is missing — cannot start video call.');

//   }



//   let lastError: any = null;



//   for (const id of uniqueIds) {

//     for (const endpoint of buildCallUrls(id, action)) {

//       const response = await apiClient(endpoint, options);



//       if (response.success) {

//         const prefix = extractUrlPrefix(endpoint);

//         if (prefix) {

//           cachedUrlPrefix = prefix;

//         }

//         return unwrapSuccess(response);

//       }



//       lastError = response;



//       // Token is invalid — refreshing will not help other URLs.

//       if (response.status === 401) {

//         break;

//       }



//       if (!isTryNextUrlError(response.status)) {

//         break;

//       }

//     }



//     if (lastError?.status === 401) {

//       break;

//     }

//   }



//   const error: any = new Error(

//     lastError?.message || `Request failed (${lastError?.status ?? 'unknown'})`,

//   );

//   error.status = lastError?.status;

//   error.data = lastError?.data;

//   throw error;

// }



// export async function apiGetCallStatus(...appointmentIds: string[]) {

//   return callApiRequest(appointmentIds, 'status', { method: 'GET' });

// }



// export async function apiStartCall(...appointmentIds: string[]) {

//   try {

//     return await callApiRequest(appointmentIds, 'start', {

//       method: 'POST',

//       body: '{}',

//     });

//   } catch (e: any) {

//     if (e?.data?.call_status === 'in_progress' || e?.status === 409) {

//       return e.data;

//     }

//     throw e;

//   }

// }



// export async function apiGetCallToken(...appointmentIds: string[]) {

//   return callApiRequest(appointmentIds, 'token', {

//     method: 'POST',

//     body: '{}',

//   });

// }



// export async function apiPostCallEvent(

//   appointmentIds: string[],

//   event: 'joined' | 'left' | 'token_requested',

//   sessionId?: string,

// ) {

//   try {

//     await callApiRequest(appointmentIds, 'events', {

//       method: 'POST',

//       body: JSON.stringify({

//         event_type: event,

//         session_id: sessionId ?? null,

//         metadata: { source: 'agora_sdk' },

//       }),

//     });

//   } catch (e) {

//     console.log(`[API] events(${event}) failed:`, e);

//   }

// }



// /** Server uses POST .../call/end/ (Postman). Kept for optional server sync — not used on patient hang-up. */

// export async function apiEndCall(...appointmentIds: string[]) {

//   try {

//     await callApiRequest(appointmentIds, 'end', {

//       method: 'POST',

//       body: '{}',

//     });

//   } catch (e: any) {

//     if (e?.status === 404) {

//       await callApiRequest(appointmentIds, 'left', {

//         method: 'POST',

//         body: '{}',

//       });

//       return;

//     }

//     throw e;

//   }

// }



// export async function requestCallPermissions(): Promise<boolean> {

//   if (Platform.OS === 'android') {

//     const granted = await PermissionsAndroid.requestMultiple([

//       PermissionsAndroid.PERMISSIONS.CAMERA,

//       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,

//     ]);

//     return (

//       granted[PermissionsAndroid.PERMISSIONS.CAMERA] === 'granted' &&

//       granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted'

//     );

//   }

//   return true;

// }



// export type TokenInfo = {

//   token: string;

//   channelName: string;

//   uid: number;

//   appId: string;

//   expiresAt: number;

// };



// export function buildTokenInfo(tokenRes: any): TokenInfo {

//   const now = Date.now();

//   let expiresAtMs: number;

//   if (typeof tokenRes.expires_at === 'number') {

//     expiresAtMs = tokenRes.expires_at * 1000;

//   } else if (tokenRes.expires_at) {

//     expiresAtMs = new Date(tokenRes.expires_at).getTime();

//   } else {

//     expiresAtMs = now + 23 * 60 * 60 * 1000;

//   }



//   return {

//     token: tokenRes.token,

//     channelName: tokenRes.channel,

//     uid: tokenRes.uid ?? 0,

//     appId: tokenRes.app_id || FALLBACK_APP_ID,

//     expiresAt: expiresAtMs,

//   };

// }



// export type CallStatusResponse = {

//   call_status?: string;

//   doctor_status?: string;

//   patient_status?: string;

//   doctor?: { status?: string; call_status?: string };

//   patient?: { status?: string; call_status?: string };

//   participants?: Array<{ role?: string; status?: string; call_status?: string }>;

// };



// /** True when the remote party has left or the call session is ended on the server. */

// export function isRemoteParticipantLeft(

//   status: CallStatusResponse | null | undefined,

//   localRole: 'doctor' | 'patient' = 'patient',

// ): boolean {

//   if (!status) {

//     return false;

//   }



//   const normalizedCallStatus = String(status.call_status ?? '').toLowerCase();

//   if (normalizedCallStatus === 'ended' || normalizedCallStatus === 'completed') {

//     return true;

//   }



//   const remoteRole = localRole === 'patient' ? 'doctor' : 'patient';

//   const remoteCandidates: Array<string | undefined> = [

//     remoteRole === 'doctor' ? status.doctor_status : status.patient_status,

//     remoteRole === 'doctor' ? status.doctor?.status : status.patient?.status,

//     remoteRole === 'doctor' ? status.doctor?.call_status : status.patient?.call_status,

//   ];



//   const fromList = status.participants?.find(participant => {

//     const role = String(participant.role ?? '').toLowerCase();

//     return role === remoteRole || role === `${remoteRole}s`;

//   });

//   if (fromList?.status) {

//     remoteCandidates.push(fromList.status);

//   }

//   if (fromList?.call_status) {

//     remoteCandidates.push(fromList.call_status);

//   }



//   return remoteCandidates.some(value => String(value ?? '').toLowerCase() === 'left');

// }

import { PermissionsAndroid, Platform } from 'react-native';
import { Utils } from '../common/Utils';
import { BaseUrl } from '../config/Key';
import { apiClient } from './APIconfig';

export const FALLBACK_APP_ID = 'b717053bd3f14a819ffd0c7b6490f169';

const callUrl = (appointmentId: string, action: string) =>
  `${BaseUrl?.base_url}doctors/appointments/${appointmentId}/call/${action}/`;
async function getAuthHeaders() {
  const token = await Utils.getData('_TOKEN');
  console.log("tokentokentoken", token)
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function apiFetch(url: string, options: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    let body: any = null;
    const text = await response.text();
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      const error: any = new Error(body?.message || `Request failed (${response.status})`);
      error.status = response.status;
      error.data = body?.data ?? body;
      throw error;
    }

    if (body && typeof body === 'object' && 'data' in body) {
      return body.data;
    }
    return body;
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      const timeoutError: any = new Error('Request timed out — network dheema ya server slow hai.');
      timeoutError.status = 0;
      throw timeoutError;
    }
    if (e.message === 'Network request failed') {
      const networkError: any = new Error(
        'Network error — internet connection check karo, ya API_BASE_URL galat ho sakta hai.',
      );
      networkError.status = 0;
      throw networkError;
    }
    throw e;
  }
}

export async function apiGetCallStatus(appointmentId: string) {
  const res = await apiClient(
    `doctors/appointments/${appointmentId}/call/status/`,
    {
      method: 'GET',
    },
  );
  console.log("resresresresres", res)
  if (!res.success) {
    throw res;
  }

  return res.data;
}

export async function apiStartCall(appointmentId: string) {
  const res = await apiClient(
    `doctors/appointments/${appointmentId}/call/start/`,
    {
      method: 'POST',
      body: '{}',
    },
  );

  if (!res.success) {
    if (
      res.data?.call_status === 'in_progress' ||
      res.status === 409
    ) {
      return res.data;
    }

    throw res;
  }

  return res.data;
}

export async function apiGetCallToken(appointmentId: string) {
  const res = await apiClient(
    `doctors/appointments/${appointmentId}/call/token/`,
    {
      method: 'POST',
      body: '{}',
    },
  );

  if (!res.success) {
    throw res;
  }

  return res.data;
}
export async function apiPostCallEvent(
  appointmentId: string,
  event: 'joined' | 'left',
  sessionId?: string,
) {
  try {
    const headers = await getAuthHeaders();
    await apiFetch(callUrl(appointmentId, 'events'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event_type: event,
        session_id: sessionId ?? null,
        metadata: { source: 'agora_sdk' },
      }),
    });
  } catch (e) {
    console.log(`[API] events(${event}) failed:`, e);
  }
}

export async function apiEndCall(appointmentId: string) {
  const headers = await getAuthHeaders();
  await apiFetch(callUrl(appointmentId, 'left'), {
    method: 'POST',
    headers,
    body: '{}',
  });
}

export async function requestCallPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    return (
      granted[PermissionsAndroid.PERMISSIONS.CAMERA] === 'granted' &&
      granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted'
    );
  }
  return true;
}

export type TokenInfo = {
  token: string;
  channelName: string;
  uid: number;
  appId: string;
  expiresAt: number;
};

export function buildTokenInfo(tokenRes: any): TokenInfo {
  const now = Date.now();
  let expiresAtMs: number;
  if (typeof tokenRes.expires_at === 'number') {
    expiresAtMs = tokenRes.expires_at * 1000;
  } else if (tokenRes.expires_at) {
    expiresAtMs = new Date(tokenRes.expires_at).getTime();
  } else {
    expiresAtMs = now + 23 * 60 * 60 * 1000;
  }

  return {
    token: tokenRes.token,
    channelName: tokenRes.channel,
    uid: tokenRes.uid ?? 0,
    appId: tokenRes.app_id || FALLBACK_APP_ID,
    expiresAt: expiresAtMs,
  };
}


