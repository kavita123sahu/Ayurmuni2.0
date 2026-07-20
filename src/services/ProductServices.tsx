import { apiClient } from "./APIconfig";

export const getProduct = async () => {
    try {
        const response = await apiClient('customers/products/', {
            method: 'GET'
        });
        console.log(response,"resposneprouctcc");
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

export const getReviewsAll = async (
    payload: object,
) => {
    try {

        const cleanPayload =
            Object.fromEntries(
                Object.entries(payload)
                    .filter(
                        ([_, value]) =>
                            value !== undefined &&
                            value !== null &&
                            value !== '',
                    ),
            );

        const query =
            new URLSearchParams(
                cleanPayload as any,
            ).toString();

        console.log(
            'Review Query Params:',
            query,
        );

        const response =
            await apiClient(
                `review/?${query}`,
                {
                    method: 'GET',
                },
            );

        return response;

    } catch (error) {
        throw error;
    }
};

export const TogglewishlistProduct = async (variant_ID: number, method: 'POST') => {
    try {
        const response = await apiClient(`favorites/products/?variant_id=${variant_ID}`, {
            method: method
        });

        return response;
    } catch (error) {
        throw error;
    }
}