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
    const safeVariantId = String(variant_id ?? '').trim();
    const safeCartItemId = String(cart_item_id ?? '').trim();
    const safeQty = Number(quantity);

    if (!safeVariantId) {
        throw new Error('Missing variant id');
    }
    if (!Number.isFinite(safeQty)) {
        throw new Error('Invalid quantity');
    }

    try {
        const query = new URLSearchParams();
        query.set('variant_id', safeVariantId);
        query.set('quantity', String(Math.floor(safeQty)));
        // Same shape as my_cart: variant_id + quantity + cart_item_id (no source=)
        if (safeCartItemId) {
            query.set('cart_item_id', safeCartItemId);
        }

        console.log('AddupdateCart =>', query.toString());
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



/** True when cart/prescription line (or its variant) is marked out of stock by API. */
export const isCartLineOutOfStock = (it: any): boolean => {
    if (!it || typeof it !== 'object') return false;
    if (it._isOutOfStock === true) return true;

    const truthy = (v: unknown) =>
        v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'true';

    if (
        truthy(it.out_of_stock) ||
        truthy(it.is_out_of_stock) ||
        truthy(it.variant?.out_of_stock) ||
        truthy(it.variant?.is_out_of_stock)
    ) {
        return true;
    }

    return false;
};

export const getAllCart = async () => {
    try {
        const response = await apiClient('cart/', {
            method: 'GET'
        });
        // Mutate the response to mark out-of-stock items and unselect them so
        // the store and UI receive items that are safe for checkout.
        try {
            if (response) {
                applyOutOfStockFlags(response);
            }
        } catch (e) {
            console.warn('Failed to apply out-of-stock flags', e);
        }

        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * Try to locate the primary items array inside the API response object.
 * Common candidates: response.data.items, response.data.cart_items, response.data.my_cart
 */
function findItemsArray(response: any): any[] | null {
    if (!response) return null;
    const src = response.data ?? response;
    if (!src || typeof src !== 'object') return null;

    const candidates = ['items', 'cart_items', 'my_cart', 'cart', 'prescription_items', 'prescribed_items'];
    for (const key of candidates) {
        if (Array.isArray(src[key])) return src[key];
    }

    // Fallback: pick the first array in the object that looks like item objects
    for (const key of Object.keys(src)) {
        if (Array.isArray(src[key]) && src[key].length > 0 && typeof src[key][0] === 'object') return src[key];
    }
    return null;
}

/**
 * Normalize the cart response and mark out-of-stock items.
 * Returns an object with allItems, inStockItems, outOfStockItems and checkoutItems (only in-stock).
 */
export function normalizeCartResponse(response: any) {
    const items = findItemsArray(response) ?? [];
    const allItems = items.map((it: any) => {
        const outOfStock = isCartLineOutOfStock(it);
        // Ensure a canonical flag and unselect out-of-stock items for UI/checkout safety
        const normalized = Object.assign({}, it, {
            _isOutOfStock: outOfStock,
            // common selection flags - if present set to false when out of stock
            checked: outOfStock ? false : (it.checked ?? it.selected ?? true),
            selected: outOfStock ? false : (it.selected ?? it.checked ?? true),
        });
        return normalized;
    });

    const outOfStockItems = allItems.filter((i: any) => i._isOutOfStock);
    const inStockItems = allItems.filter((i: any) => !i._isOutOfStock);

    // For checkout we should only include in-stock items (both cart and prescription lists should be normalized similarly)
    const checkoutItems = inStockItems.slice();

    return {
        allItems,
        inStockItems,
        outOfStockItems,
        checkoutItems,
    };
}

/**
 * Given a cart API response, return only the items that are safe to send to checkout (in-stock).
 * This handles both normal cart items and prescription items as they are found by normalizeCartResponse.
 */
export function getCheckoutableItems(cartResponse: any) {
    const normalized = (cartResponse && (cartResponse.normalized ?? (cartResponse.data && cartResponse.data.normalized))) || normalizeCartResponse(cartResponse);
    return normalized.checkoutItems ?? [];
}

/**
 * Small helper to detect whether the response contains any out-of-stock items.
 */
export function hasOutOfStockItems(cartResponse: any): boolean {
    const normalized = (cartResponse && (cartResponse.normalized ?? (cartResponse.data && cartResponse.data.normalized))) || normalizeCartResponse(cartResponse);
    return Array.isArray(normalized.outOfStockItems) && normalized.outOfStockItems.length > 0;
}

/**
 * Apply out-of-stock flags and unselect out-of-stock items in-place on the API response object.
 */
function applyOutOfStockFlags(response: any) {
    const data = response.data ?? response;
    if (!data || typeof data !== 'object') return response;

    const applyToItem = (it: any) => {
        const outOfStock = isCartLineOutOfStock(it);
        const updated = Object.assign({}, it, {
            _isOutOfStock: outOfStock,
            checked: outOfStock ? false : (it.checked ?? it.selected ?? true),
            selected: outOfStock ? false : (it.selected ?? it.checked ?? true),
        });
        return updated;
    };

    if (Array.isArray(data.my_cart?.items)) {
        data.my_cart.items = data.my_cart.items.map(applyToItem);
    }

    if (Array.isArray(data.prescription_cart?.items)) {
        data.prescription_cart.items = data.prescription_cart.items.map((group: any) => ({
            ...group,
            items: (group?.items ?? []).map(applyToItem),
        }));
    }

    // Also attach a normalized summary for convenience
    try {
        response.normalized = normalizeCartResponse(response);
        if (response.data) response.data.normalized = response.normalized;
    } catch (e) {
        // no-op
    }

    return response;
}
