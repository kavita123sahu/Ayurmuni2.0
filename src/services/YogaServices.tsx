import { apiClient } from "./APIconfig";

export type YogaSessionListParams = {
    health_category_id?: string | number;
    health_disease_id?: string | number;
    search?: string;
};

export const getYogaSession = async (params?: YogaSessionListParams) => {
    try {
        const query = new URLSearchParams();
        if (
            params?.health_category_id != null &&
            String(params.health_category_id).trim() !== ''
        ) {
            query.set('health_category_id', String(params.health_category_id));
        }
        if (
            params?.health_disease_id != null &&
            String(params.health_disease_id).trim() !== ''
        ) {
            query.set('health_disease_id', String(params.health_disease_id));
        }
        if (params?.search != null && String(params.search).trim() !== '') {
            query.set('search', String(params.search).trim());
        }

        const qs = query.toString();
        const path = qs ? `yoga/sessions/?${qs}` : 'yoga/sessions/';

        const response = await apiClient(path, {
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
