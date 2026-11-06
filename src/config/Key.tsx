import Toast from 'react-native-toast-message';
import { Fonts } from '../common/Fonts';
import { Platform } from 'react-native';
import {
    getGoogleMapsApiKey,
    getGooglePlacesApiKey,
} from './thirdParty';

// export const BaseUrl = {
//   base_url: 'https://ayurmuni.aimantra.info/',
// };

export const BaseUrl = {
    // base_url: "https://ayurmuni.aimantra.info/"
    // https://aghast-cognition-earflap.ngrok-free.dev/
    // https://6057-203-110-81-106.ngrok-free.app/ 
    // https://6057-203-110-81-106.ngrok-free.app/
    // 'https://ayurmuni.aimantra.info/' 

    //"https://ayurmuni-backend.onrender.com/"
    //"https://ayurmunistaging.aimantra.info"
    // base_url: "https://scarce-derby-voice.ngrok-free.dev/",
    base_url: "https://ayurmuniproduction.aimantra.info/",
    //https://ranged-reimburse-pentagram.ngrok-free.dev
};

export const Method = {
    GET: 'GET',
    POST: 'POST',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
    PUT: 'PUT',
};

export const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();
export const GOOGLE_PLACES_API_KEY = getGooglePlacesApiKey();

export interface ApiResponse {
    status_code: number;
    message: string;
    status: string;
    is_new_user?: boolean;
    user_id?: string;
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
            color: type === 'success' ? '#0D614E' : '#F43F5E',
        },
    });
};
