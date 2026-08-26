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
    const safeCartItemId = String(cart_item_id ?? '').trim();
    console.log('varinttquantity', variant_id, quantity, safeCartItemId || null, source);
    try {
        const query = new URLSearchParams();
        query.set('variant_id', String(variant_id));
        query.set('quantity', String(quantity));
        // Only send cart_item_id when updating an existing my_cart / prescribed line.
        if (safeCartItemId) {
            query.set('cart_item_id', safeCartItemId);
        }
        // Source is only meaningful for prescribed-cart operations.
        if (source === 'prescribed') {
            query.set('source', source);
        }

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
