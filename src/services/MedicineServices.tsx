import { apiClient } from "./APIconfig";

export const getDiseaseCategory = async (categoryID: string) => {
    try {
        const response = await apiClient(`user/health-diseases/?category_id=${categoryID}`, {
            method: 'GET'
        });
        return response;
    } catch (error) {
        throw error;
    }
}