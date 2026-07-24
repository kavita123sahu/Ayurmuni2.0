import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";
import { apiClient } from "./APIconfig";


export const place_order_API = async (data: Object) => {
    try {
        const response = await apiClient('order/', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        return response;
    } catch (error) {
        throw error;
    }
}

export const verifyOrderPayment = async (data: object) => {
    try {
        const response = await apiClient('order/verify-payment/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export const getOrders = async () => {
    try {
        const response = await apiClient('order/', {
            method: 'GET',
        });
        return response;
    } catch (error) {
        throw error;
    }
}

