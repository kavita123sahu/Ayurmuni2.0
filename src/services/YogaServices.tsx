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
};

export const getYogaSessionDetail = async (id: string | number) => {
    const sid = String(id).trim();
    try {
        return await apiClient(`yoga/sessions/${sid}/`, {
            method: 'GET',
        });
    } catch {
        return await apiClient(`yoga/sessions/?id=${encodeURIComponent(sid)}`, {
            method: 'GET',
        });
    }
};