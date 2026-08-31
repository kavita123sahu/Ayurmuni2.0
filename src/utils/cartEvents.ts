import {
  CartEvents,
  CART_ITEM_ADDED,
  CartItemAddedPayload,
} from '../common/Utils';

export const notifyCartItemAdded = (payload: CartItemAddedPayload) => {
  if (!payload?.variantId) return;
  CartEvents.emit(CART_ITEM_ADDED, payload);
};
