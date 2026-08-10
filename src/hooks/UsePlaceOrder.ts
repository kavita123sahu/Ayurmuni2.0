import { useState, useCallback } from 'react';
import { PlaceOrderResponse } from '../common/DataInterface';
import * as _ORDER_SERVICES from '../services/OrderService';
import {
  buildCodOrderPayload,
  buildPrepaidOrderPayload,
  OrderCartLine,
} from '../utils/orderPayload';

type CartItem = OrderCartLine & {
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
  /** Only for prepaid when already known from Razorpay */
  payment_method?: string | null;
  shipping_method?: 'STD' | 'EXPRESS';
};

export const usePlaceOrder = () => {
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const placeOrder = useCallback(
    async (
      cartItems: CartItem[],
      config: ChargeConfig,
    ): Promise<PlaceOrderResponse | null> => {
      setIsPlacing(true);
      setOrderError(null);

      const isCod = config.payment_type === 'cod';

      const payload = isCod
        ? buildCodOrderPayload({
          delivery_address_id: config.delivery_address_id,
          cartItems,
          shipping_charges: config.shipping_charges,
          cod_charges: config.cod_charges,
          shipping_method: config.shipping_method ?? 'STD',
        })
        : buildPrepaidOrderPayload({
          delivery_address_id: config.delivery_address_id,
          cartItems,
          shipping_charges: config.shipping_charges,
          cod_charges: 0,
          shipping_method: config.shipping_method ?? 'STD',
          prepaid_amount: config.prepaid_amount ?? 0,
          // Online: never send payment_method on place-order
        });

      console.log('ORDER_PAYLOAD =>', JSON.stringify(payload, null, 2));

      try {
        const response = await _ORDER_SERVICES.place_order_API(payload);
        console.log('ORDER_RESPONSE =>', response);
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
    [],
  );

  return { isPlacing, orderError, placeOrder };
};
