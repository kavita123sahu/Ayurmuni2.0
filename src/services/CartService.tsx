import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";
import { apiClient } from "./APIconfig";


export const AddupdateCart = async ({
    variant_id,
    quantity,
}: {
    variant_id: string;
    quantity: number;
}) => {
    console.log("varinttquantity", variant_id, quantity)
    try {
        const response = await apiClient(
            `cart/?variant_id=${variant_id}&quantity=${quantity}`,
            {
                method: 'POST',
            }
        );

        return response;
    } catch (error) {
        throw error;
    }
};



export const getAllCart = async () => {
    try {
        const response = await apiClient('cart/', {
            method: 'GET'
        });
        return response;
    } catch (error) {
        throw error;
    }
}
