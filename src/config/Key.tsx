import Toast from "react-native-toast-message";
import { Fonts } from "../common/Fonts";
import { Platform } from "react-native";

export const BaseUrl = {
    base_url: "https://ayurmuni.aimantra.info/"
    // https://aghast-cognition-earflap.ngrok-free.dev/
    // https://6057-203-110-81-106.ngrok-free.app/
    // https://6057-203-110-81-106.ngrok-free.app/
    // base_url: 'https://ayurmuni.aimantra.info/'
    //"https://ayurmuni-backend.onrender.com/"
    //"https://ayurmunistaging.aimantra.info"
    // https://scarce-derby-voice.ngrok-free.dev
};

export const Method = {
    GET: 'GET',
    POST: 'POST',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
    PUT: 'PUT'
}

export const ZUGOKey = {
    ZEGO_APP_ID: '712416091',
    ZEGO_APP_SIGN: 'c6de6e9ebf00826ca6a1834aaf6db203e722d67f5976cb9ede3f023db73232e8'
}

export const APP_ID = 'YOUR_AGORA_APP_ID';

/** Google Maps SDK key (Android/iOS native maps) */
export const GOOGLE_MAPS_API_KEY = 'AIzaSyC6Z-IW1Fr-o4eqzCxgAbjHRa7tmU31RKA';

/** Google Places / Geocoding API key */
export const GOOGLE_PLACES_API_KEY = 'AIzaSyClCQ_htPKkUayS7yWuY9kNj54gIQSnXiE';

export interface ApiResponse {
    status_code: number;
    message: string;
    status: string;
    is_new_user?: boolean;
    user_id?: string
}

export const showSuccessToast = (
    message: string,
    type: 'success' | 'error',
) => {

    Toast.show({
        type,
        text2: message,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: Platform.OS === 'ios' ? 50 : 60,

        text2Style: {
            textAlign: 'center',
            fontFamily: Fonts.PoppinsMedium,
            fontSize: 16,
            color:
                type === 'success'
                    ? '#0D614E'
                    : '#F43F5E',
        },
    });
};

