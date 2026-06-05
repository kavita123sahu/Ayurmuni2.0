import { Utils } from "../common/Utils";
import { ApiResponse, BaseUrl, Method } from "../config/Key";
import { apiClient } from "./APIconfig";


export const send_otp = async (data: Object) => {
    try {
        const response = await apiClient('user/send-otp/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        console.log("response,", response);
        return response;
    } catch (error) {
        throw error;
    }
};





export const verify_otp_login = async (data: Object) => {
    try {
        const response = await apiClient('user/customer/login/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response;
    } catch (error) {
        throw error;
    }
};
export const customer_login = async (data: Object) => {
    try {
        const response = await apiClient('user/customerlogin/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response;
    } catch (error) {
        throw error;
    }
};


export const onBoarding = async (data: any) => {

    try {
        const response = await apiClient('customers/profile/', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        return response;
    } catch (error) {
        throw error;
    }
};


export const refreshAccessToken = async (data: any) => {

    try {
        const response = await apiClient('user/token/refresh/', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        console.log("useryokeke", response);

        return response;
    } catch (error) {
        throw error;
    }
};

export const verify_otp = async (data: Object) => {
    try {
        const response = await apiClient('user/customer/register/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response;
    } catch (error) {
        throw error;
    }
};






