import axios, { AxiosInstance } from 'axios';

// ⚠️ Apna actual backend base URL yahan set karo
// Better hoga isko .env / config file se lena, hardcode na karo production me
export const BASE_URL = 'https://YOUR_BASE_URL';

export type CallStatus = 'not_started' | 'in_progress' | 'ended';

export interface TokenResponse {
  token: string;
  channel_name: string;
  app_id: string;
  uid: number;
}

export interface StatusResponse {
  status: CallStatus;
  [key: string]: any;
}

export interface CallEventPayload {
  event_type: 'joined' | 'left';
  metadata: Record<string, any>;
}

// Auth token attach karne ke liye — apna actual token-fetch logic yahan dalna
// (AsyncStorage, Redux store, ya jo bhi tumhare app me use ho raha hai)
let authTokenGetter: () => Promise<string | null> = async () => null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  authTokenGetter = getter;
}

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

client.interceptors.request.use(async (config) => {
  const token = await authTokenGetter();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log('[CallApi] Request failed:', err?.response?.status, err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export const CallApi = {
  /** Agora token + channel_name + app_id fetch karta hai */
  getToken: async (appointmentId: string): Promise<TokenResponse> => {
    const res = await client.get<TokenResponse>(
      `/doctors/appointments/${appointmentId}/call/token/`
    );
    return res.data;
  },

  /** Doctor call start karta hai — status NOT_STARTED -> IN_PROGRESS */
  startCall: async (appointmentId: string): Promise<StatusResponse> => {
    const res = await client.post<StatusResponse>(
      `/doctors/appointments/${appointmentId}/call/start/`
    );
    return res.data;
  },

  /** Patient ye poll karta hai jab tak doctor call start na kare */
  getStatus: async (appointmentId: string): Promise<StatusResponse> => {
    const res = await client.get<StatusResponse>(
      `/doctors/appointments/${appointmentId}/call/status/`
    );
    return res.data;
  },

  /** Agora join/leave hone par backend ko inform karo */
  sendEvent: async (appointmentId: string, payload: CallEventPayload): Promise<void> => {
    await client.post(`/doctors/appointments/${appointmentId}/call/events/`, payload);
  },

  /** Doctor call end karta hai — status -> ENDED */
  endCall: async (appointmentId: string): Promise<StatusResponse> => {
    const res = await client.post<StatusResponse>(
      `/doctors/appointments/${appointmentId}/call/end/`
    );
    return res.data;
  },
};