
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


