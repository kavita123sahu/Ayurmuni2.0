import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";
import { apiClient } from "./APIconfig";


export const AddupdateCart = async ({
    variant_id,
    quantity,
    cart_item_id,
    source: _source,
}: {
    variant_id: string;
    quantity: number;
    cart_item_id?: string;
    /** Kept for callers; not sent — API updates by cart_item_id like my_cart. */
    source?: 'cart' | 'prescribed';
}) => {
    const safeCartItemId = String(cart_item_id ?? '').trim();
    try {
        const query = new URLSearchParams();
        query.set('variant_id', String(variant_id));
        query.set('quantity', String(quantity));
        // Same shape as my_cart: variant_id + quantity + cart_item_id (no source=)
        if (safeCartItemId) {
            query.set('cart_item_id', safeCartItemId);
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
