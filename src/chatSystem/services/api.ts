import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// ✅ Your actual API base
const API_BASE = 'https://aghast-cognition-earflap.ngrok-free.dev';
const WS_BASE = API_BASE.replace('https', 'wss');

export { API_BASE, WS_BASE };