import { apiClient } from "./APIconfig";

export const getYogaSession = async () => {
    try {
        const response = await apiClient('yoga/sessions/', {
            method: 'GET',
        });
        return response;
    } catch (error) {
        throw error;
    }
}