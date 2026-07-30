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

export const getTransactions = async (params?: { page?: number; page_size?: number }) => {
    try {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', String(params.page));
        if (params?.page_size) query.set('page_size', String(params.page_size));
        const path = query.toString()
            ? `order/transactions/?${query.toString()}`
            : 'order/transactions/';

        const response = await apiClient(path, {
            method: 'GET',
        });
        return response;
    } catch (error) {
        throw error;
    }
}

