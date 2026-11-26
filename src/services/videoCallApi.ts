import { PermissionsAndroid, Platform } from 'react-native';
import { Utils } from '../common/Utils';
import { BaseUrl } from '../config/Key';
import { getAgoraAppId } from '../config/thirdParty';
import { apiClient } from './APIconfig';

export const FALLBACK_APP_ID = getAgoraAppId();

const callUrl = (appointmentId: string, action: string) =>
  `${BaseUrl?.base_url}doctors/appointments/${appointmentId}/call/${action}/`;

async function getAuthHeaders() {
  const token = await Utils.getData('_TOKEN');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function apiFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs = 15000,
) {
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
      const error: any = new Error(
        body?.message || `Request failed (${response.status})`,
      );
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
      const timeoutError: any = new Error('Request timed out');
      timeoutError.status = 0;
      throw timeoutError;
    }
    if (e.message === 'Network request failed') {
      const networkError: any = new Error('Network error');
      networkError.status = 0;
      throw networkError;
    }
    throw e;
  }
}

export async function apiGetCallStatus(appointmentId: string) {
  const res = await apiClient(
    `doctors/appointments/${appointmentId}/call/status/`,
    { method: 'GET' },
  );
  if (!res.success) throw res;
  return res.data;
}

export async function apiStartCall(appointmentId: string) {
  const res = await apiClient(
    `doctors/appointments/${appointmentId}/call/start/`,
    { method: 'POST', body: '{}' },
  );

  if (!res.success) {
    if (res.data?.call_status === 'in_progress' || res.status === 409) {
      return res.data;
    }
    throw res;
  }

  return res.data;
}

export async function apiGetCallToken(appointmentId: string) {
  const res = await apiClient(
    `doctors/appointments/${appointmentId}/call/token/`,
    { method: 'POST', body: '{}' },
  );
  if (!res.success) throw res;
  return res.data;
}

const joinedAttemptStartByAppointment = new Map<string, number>();
const joinedDeliveryPromises = new Map<string, Promise<any>>();
const joinedDeliveredSuccessfully = new Set<string>();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRetryableJoinedError = (error: any) => {
  const status = error?.status ?? error?.response?.status;
  if (status == null || status === 0) return true;
  return status >= 500;
};

/**
 * Stop retrying joined when presence_sync says not needed / not allowed /
 * slot ended / max retry window elapsed. Without presence_sync, stop once
 * call is no longer in_progress.
 */
const shouldStopJoinedRetry = (status: any, appointmentId: string) => {
  const sync = status?.presence_sync;
  if (!sync) {
    return status?.call_status !== 'in_progress';
  }
  if (!sync.should_report_joined) return true;
  if (!sync.can_report_presence) return true;
  if (sync.slot_ends_at && Date.now() >= new Date(sync.slot_ends_at).getTime()) {
    return true;
  }

  const maxRetrySeconds = sync.joined_event_max_retry_seconds ?? 180;
  const startedAt = joinedAttemptStartByAppointment.get(appointmentId);
  if (
    startedAt &&
    maxRetrySeconds > 0 &&
    (Date.now() - startedAt) / 1000 >= maxRetrySeconds
  ) {
    return true;
  }

  return false;
};

async function postCallEvent(
  appointmentId: string,
  event: 'joined' | 'left',
  sessionId?: string,
) {
  const res = await apiClient(
    `doctors/appointments/${appointmentId}/call/events/`,
    {
      method: 'POST',
      body: JSON.stringify({
        event_type: event,
        session_id: sessionId ?? null,
        metadata: { source: 'agora_sdk' },
      }),
    },
  );

  if (!res?.success) {
    const error: any = new Error(
      res?.message || `Failed to report call event (${event})`,
    );
    error.status = res?.status;
    error.code = res?.data?.code ?? res?.code;
    error.data = res?.data;
    throw error;
  }

  return res.data;
}

/** Soft wrapper for left/misc events — logs failures without throwing. */
export async function apiPostCallEvent(
  appointmentId: string,
  event: 'joined' | 'left',
  sessionId?: string,
) {
  try {
    return await postCallEvent(appointmentId, event, sessionId);
  } catch (e) {
    console.log(`[API] events(${event}) failed:`, e);
    return null;
  }
}

export function clearJoinedDeliveryState(appointmentId?: string | null) {
  if (appointmentId) {
    joinedAttemptStartByAppointment.delete(appointmentId);
    joinedDeliveryPromises.delete(appointmentId);
    joinedDeliveredSuccessfully.delete(appointmentId);
    return;
  }
  joinedAttemptStartByAppointment.clear();
  joinedDeliveryPromises.clear();
  joinedDeliveredSuccessfully.clear();
}

/**
 * Deliver `joined` only after Agora channel join succeeded.
 * Retries on network/5xx; stops when presence_sync says not needed.
 * Dedupes concurrent/reconnect attempts.
 */
export async function reportJoinedEvent(
  appointmentId: string,
  sessionId?: string,
) {
  if (!appointmentId) {
    return { stopped: true as const, reason: 'missing_appointment' };
  }

  if (joinedDeliveredSuccessfully.has(appointmentId)) {
    return { stopped: true as const, reason: 'already_delivered' };
  }

  const inFlight = joinedDeliveryPromises.get(appointmentId);
  if (inFlight) {
    return inFlight;
  }

  const delivery = (async () => {
    if (!joinedAttemptStartByAppointment.has(appointmentId)) {
      joinedAttemptStartByAppointment.set(appointmentId, Date.now());
    }

    let delayMs = 1000;
    const maxDelayMs = 30000;
    // Hard ceiling even if status checks keep failing (matches default presence window).
    const absoluteMaxMs = 180 * 1000;

    while (true) {
      const startedAt = joinedAttemptStartByAppointment.get(appointmentId) || Date.now();
      if (Date.now() - startedAt >= absoluteMaxMs) {
        joinedAttemptStartByAppointment.delete(appointmentId);
        return { stopped: true as const, reason: 'max_retry_window' };
      }

      let status: any;
      try {
        status = await apiGetCallStatus(appointmentId);
        if (shouldStopJoinedRetry(status, appointmentId)) {
          if (
            status?.presence_sync &&
            !status.presence_sync.should_report_joined
          ) {
            joinedDeliveredSuccessfully.add(appointmentId);
          }
          joinedAttemptStartByAppointment.delete(appointmentId);
          return { stopped: true as const, status };
        }
      } catch (statusError) {
        console.log('[API] joined status check failed:', statusError);
      }

      try {
        const data = await postCallEvent(appointmentId, 'joined', sessionId);
        joinedDeliveredSuccessfully.add(appointmentId);
        joinedAttemptStartByAppointment.delete(appointmentId);
        return data;
      } catch (error) {
        console.log('[API] joined event delivery failed:', error);
        if (!isRetryableJoinedError(error)) {
          joinedAttemptStartByAppointment.delete(appointmentId);
          throw error;
        }
        await sleep(delayMs);
        delayMs = Math.min(delayMs * 2, maxDelayMs);
      }
    }
  })();

  joinedDeliveryPromises.set(appointmentId, delivery);
  try {
    return await delivery;
  } finally {
    joinedDeliveryPromises.delete(appointmentId);
  }
}

/**
 * Soft wrapper around reportJoinedEvent for Agora handlers —
 * never throws into the RTC event path.
 */
export async function apiReportJoined(
  appointmentId: string,
  sessionId?: string,
) {
  try {
    return await reportJoinedEvent(appointmentId, sessionId);
  } catch (e) {
    console.log('[API] reportJoined failed:', e);
    return null;
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
