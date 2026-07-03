import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from './chatService';

// ✅ Get base URL
const getBaseUrl = (): string => {
  if (__DEV__) {
    // iOS Simulator
    if (Platform.OS === 'ios') {
      return 'http://localhost:8000';
    }
    // Android Emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000';
    }
    // Physical device — use your computer's IP
    return 'http://192.168.1.100:8000';
  }
  return 'https://your-api.ayurmuni.com';
};

const API_BASE = getBaseUrl();
const WS_BASE = API_BASE.replace('http', 'ws');

// ✅ Fetch wrapper with auth
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await AsyncStorage.getItem('access_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  // ✅ Token refresh on 401
  if (response.status === 401) {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const { access } = await chatService.refreshToken(refreshToken);
        await AsyncStorage.setItem('access_token', access);
        
        // Retry with new token
        headers['Authorization'] = `Bearer ${access}`;
        response = await fetch(url, { ...options, headers });
      } catch (error) {
        // Refresh failed — clear and redirect
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        throw new Error('Session expired');
      }
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }

  return response;
};

export { API_BASE, WS_BASE };