import { apiClient } from "./APIconfig";

export const getProduct = async () => {
    try {
        const response = await apiClient('customers/products/', {
            method: 'GET'
        });
        return response;
    } catch (error) {
        throw error;
    }
}


export const getProductByVariant = async (variantID: string) => {
    try {
        const response = await apiClient(`customers/products/?variant_id=${variantID}`, {
            method: 'GET'
        });
        return response;
    } catch (error) {
        throw error;
    }
}
