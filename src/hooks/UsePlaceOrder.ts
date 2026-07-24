// hooks/usePlaceOrder.ts
// ── Place order hook — call karo, response lo, navigate karo ─────────────────

import { useState, useCallback } from 'react';
import { OrderItem, PlaceOrderPayload, PlaceOrderResponse } from '../common/DataInterface';
// import { OrderService, PlaceOrderPayload, PlaceOrderResponse, OrderItem } from '../services/OrderService';
import * as _ORDER_SERVICES from '../services/OrderService';
// ── Cart item shape (jo cart screen se aata hai) ──────────────────────────────
type CartItem = {
    variant_id: string | number;
    quantity: number;
    price: number;
    discount?: number;
    name?: string;
};

type ChargeConfig = {
    delivery_address_id: string | number;
    shipping_charges: number;
    cod_charges: number;
    prepaid_amount?: number;
    payment_type?: 'cod' | 'prepaid' | 'online';
    payment_method?: 'cash' | 'upi' | 'card' | 'netbanking';
    shipping_method?: 'STD' | 'EXPRESS';
};

type UsePlaceOrderReturn = {
    isPlacing: boolean;
    orderError: string | null;
    placeOrder: (
        cartItems: CartItem[],
        config: ChargeConfig,
    ) => Promise<PlaceOrderResponse | null>;
};

export const usePlaceOrder = (): UsePlaceOrderReturn => {
    const [isPlacing, setIsPlacing] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);

    const placeOrder = useCallback(
        async (
            cartItems: CartItem[],
            config: ChargeConfig,
        ): Promise<PlaceOrderResponse | null> => {

            // if (!cartItems.length || !config.delivery_address_id) return null;
            // if (isPlacing) return null; // debounce

            setIsPlacing(true);
            setOrderError(null);

            // ── Build optimised payload ──────────────────────────────────────────
            const items: OrderItem[] = cartItems.map(item => ({
                variant_id: item.variant_id,
                quantity: item.quantity,
                discount: item.discount ?? 0,
                shipping_charges: 0,
                gift_wrap: false,
            }));

            const itemsTotal = cartItems.reduce(
                (sum, item) => sum + Number(item.price) * Number(item.quantity),
                0,
            );

            const payload: PlaceOrderPayload = {
                delivery_address_id: config.delivery_address_id,
                payment_type: config.payment_type ?? 'cod',
                payment_method: config.payment_method ?? 'cash',
                shipping_method: config.shipping_method ?? 'STD',
                shipping_charges: config.shipping_charges,
                cod_charges: config.cod_charges,
                prepaid_amount:
                    config.payment_type === 'prepaid' || config.payment_type === 'online'
                        ? (config.prepaid_amount ?? itemsTotal + config.shipping_charges)
                        : 0,
                items,
            };
            console.log("orderpaylaod", payload);
            try {
                const response = await _ORDER_SERVICES.place_order_API(payload);
                console.log("orderresposneeeee", response);
                if (!response?.success) {
                    setOrderError(response?.message ?? 'Order placement failed');
                }
                return response;
            } catch (err: any) {
                setOrderError(err?.message ?? 'Order placement failed');
                return null;
            } finally {
                setIsPlacing(false);
            }
        },
        [isPlacing],
    );

    return { isPlacing, orderError, placeOrder };
};