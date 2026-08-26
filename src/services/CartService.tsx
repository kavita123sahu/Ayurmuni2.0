import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";
import { apiClient } from "./APIconfig";


export const AddupdateCart = async ({
    variant_id,
    quantity,
    cart_item_id,
    source,
}: {
    variant_id: string;
    quantity: number;
    cart_item_id?: string;
    source?: 'cart' | 'prescribed';
}) => {
    console.log("varinttquantity", variant_id, quantity, cart_item_id, source)
    try {
        const query = new URLSearchParams();
        query.set('variant_id', variant_id);
        query.set('quantity', String(quantity));
        if (cart_item_id) query.set('cart_item_id', String(cart_item_id));
        if (source) query.set('source', source);

        const response = await apiClient(
            `cart/?${query.toString()}`,
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
