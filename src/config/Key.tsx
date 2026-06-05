import Toast from "react-native-toast-message";
import { Fonts } from "../common/Fonts";
import { Platform } from "react-native";

export const BaseUrl = {
    url: 'https://clikshop.co.in/api/v1/',
    urlV3: 'https://clikshop.co.in/api/v3/',
    base: 'https://clikshop.co.in/',
    base_url: 'https://ayurmuni.aimantra.info/'
    // https://aghast-cognition-earflap.ngrok-free.dev/
    // https://6057-203-110-81-106.ngrok-free.app/
    // 'https://ayurmuni.aimantra.info/',
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


const formatDate = (
    dateString: string,
) => {

    return new Date(
        dateString,
    ).toLocaleDateString(
        'en-US',
        {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        },
    );
};  