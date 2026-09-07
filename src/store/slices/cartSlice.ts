import { createSlice, createAsyncThunk, PayloadAction, createAction } from '@reduxjs/toolkit';
import * as _CART_SERVICES from '../../services/CartService';
import { fetchWithCache, invalidateCache } from '../../services/apiCache';
import { isAuthenticated } from '../../services/guestAuth';
import { enrichCartItemImages } from '../../utils/imageUtils';
import {
  computeCartItemsSubtotal,
  mergeCartLineWithApiItem,
  normalizeCartLineItem,
} from '../../utils/cartPriceUtils';
import { notifyCartItemAdded } from '../../utils/cartEvents';
import { resolveProductImageUri } from '../../utils/imageUtils';

const CART_CACHE_KEY = 'cart_data';

const maybeNotifyCartAdded = (
  variantId: string,
  quantity: number,
  previousQty: number,
  source: string | undefined,
  cartItem: any | null,
) => {
  if (source === 'prescribed') {
    return;
  }
  if (Number(quantity) <= Number(previousQty)) {
    return;
  }

  const productName =
    cartItem?.variant?.variant_title ??
    cartItem?.variant?.title ??
    cartItem?.product_name ??
    cartItem?.name ??
    'Item';

  notifyCartItemAdded({
    variantId: String(variantId),
    quantity: Number(quantity),
    productName: String(productName),
    image: resolveProductImageUri(cartItem) || undefined,
  });
};

type CartData = {
  my_cart?: { items?: any[]; subtotal?: number };
  prescription_cart?: { items?: any[]; subtotal?: number };
};

export type CartLineItem = {
  variant_id: string;
  quantity: number;
  source?: 'cart' | 'prescribed';
};

type CartState = {
  cartData: CartData;
  itemCount: number;
  variantQuantities: Record<string, number>;
  loading: boolean;
  addingVariantId: string | null;
  error: string | null;
};

type QueueCartLineSyncResult =
  | { skipped: true }
  | {
    variantId: string;
    quantity: number;
    cartItemId: string;
    source: 'prescribed';
    cartItem: null;
    message: string;
  }
  | {
    variantId: string;
    quantity: number;
    cartItemId: string;
    source: 'cart';
    cartItem: any;
    message: any;
  };

const getVariantIdFromItem = (item: any): string =>
  String(
    item?.variant_id ??
      item?.variant?.variant_id ??
      item?.variant?.id ??
      '',
  );

const computeMetrics = (data: CartData) => {
  const items = data?.my_cart?.items ?? [];
  const variantQuantities: Record<string, number> = {};
  let itemCount = 0;

  items.forEach((item: any) => {
    const qty = Number(item.quantity) || 0;
    itemCount += qty;
    const vid = getVariantIdFromItem(item);
    if (vid) {
      variantQuantities[vid] = qty;
    }
  });

  return { itemCount, variantQuantities };
};

const normalizeCartItemsImages = (data: CartData): CartData => {
  const myItems = (data?.my_cart?.items ?? []).map((item: any) =>
    normalizeCartLineItem(enrichCartItemImages(item)),
  );
  const prescriptionGroups = (data?.prescription_cart?.items ?? []).map(
    (group: any) => ({
      ...group,
      items: (group?.items ?? []).map((item: any) =>
        normalizeCartLineItem(enrichCartItemImages(item)),
      ),
    }),
  );

  return {
    ...data,
    my_cart: {
      ...data.my_cart,
      items: myItems,
      subtotal: computeCartItemsSubtotal(myItems),
    },
    prescription_cart: data.prescription_cart
      ? {
        ...data.prescription_cart,
        items: prescriptionGroups,
        subtotal: prescriptionGroups.reduce(
          (sum, group) => sum + computeCartItemsSubtotal(group?.items ?? []),
          0,
        ),
      }
      : data.prescription_cart,
  };
};

const getCartLineId = (item: any): string =>
  String(item?.id ?? item?.cart_item_id ?? '');

type LineSyncPayload = {
  variantId: string;
  quantity: number;
  source?: 'cart' | 'prescribed';
  cartItemId?: string;
  currentQuantity?: number;
  prescriptionRequired?: boolean;
};

const lineSyncKey = (payload: LineSyncPayload): string =>
  `${payload.source ?? 'cart'}:${payload.cartItemId || payload.variantId}`;

const findSeedCartItemByVariant = (
  data: CartData,
  variantId: string,
): any | null => {
  const vid = String(variantId);
  for (const item of data?.my_cart?.items ?? []) {
    if (getVariantIdFromItem(item) === vid) {
      return item;
    }
  }
  for (const group of data?.prescription_cart?.items ?? []) {
    for (const item of group?.items ?? []) {
      if (getVariantIdFromItem(item) === vid) {
        return item;
      }
    }
  }
  return null;
};

const lineSyncTimers = new Map<string, ReturnType<typeof setTimeout>>();
const lastConfirmedQty = new Map<string, number>();
const pendingSyncPayloads = new Map<string, LineSyncPayload>();

const findCartLineQuantity = (
  data: CartData,
  payload: LineSyncPayload,
): number | null => {
  const lineId = String(payload.cartItemId ?? '');
  const variantId = String(payload.variantId ?? '');

  if (payload.source === 'prescribed') {
    for (const group of data?.prescription_cart?.items ?? []) {
      for (const item of group?.items ?? []) {
        const matchesLine = !!lineId && getCartLineId(item) === lineId;
        const matchesVariant =
          !lineId && !!variantId && getVariantIdFromItem(item) === variantId;
        if (matchesLine || matchesVariant) {
          return Number(item.quantity) || 0;
        }
      }
    }
    return null;
  }

  for (const item of data?.my_cart?.items ?? []) {
    const matchesLine = !!lineId && getCartLineId(item) === lineId;
    const matchesVariant =
      !lineId && !!variantId && getVariantIdFromItem(item) === variantId;
    if (matchesLine || matchesVariant) {
      return Number(item.quantity) || 0;
    }
  }
  return null;
};

const seedLastConfirmedQuantities = (data: CartData) => {
  lastConfirmedQty.clear();

  for (const item of data?.my_cart?.items ?? []) {
    const key = lineSyncKey({
      variantId: getVariantIdFromItem(item),
      quantity: Number(item.quantity) || 0,
      source: 'cart',
      cartItemId: getCartLineId(item),
    });
    lastConfirmedQty.set(key, Number(item.quantity) || 0);
  }

  for (const group of data?.prescription_cart?.items ?? []) {
    for (const item of group?.items ?? []) {
      const key = lineSyncKey({
        variantId: getVariantIdFromItem(item),
        quantity: Number(item.quantity) || 0,
        source: 'prescribed',
        cartItemId: getCartLineId(item),
      });
      lastConfirmedQty.set(key, Number(item.quantity) || 0);
    }
  }
};

const patchMyCartItemQuantity = (
  data: CartData,
  variantId: string,
  quantity: number,
  cartItemFromApi?: any | null,
  cartItemId?: string,
): CartData => {
  const items = [...(data?.my_cart?.items ?? [])];
  const lineId = String(cartItemId ?? cartItemFromApi?.id ?? '');
  const index = items.findIndex(item => {
    if (lineId && getCartLineId(item) === lineId) return true;
    if (lineId) return false;
    return getVariantIdFromItem(item) === variantId;
  });

  if (quantity <= 0) {
    if (index >= 0) {
      items.splice(index, 1);
    }
  } else if (index >= 0) {
    const existing = items[index];
    items[index] = enrichCartItemImages(
      mergeCartLineWithApiItem(existing, cartItemFromApi, quantity, variantId),
      variantId,
    );
  } else if (lineId) {
    // Line id was supplied but not found — do not invent a new My Cart row
    // (prescribed qty bumps must stay on the prescription card only).
    return data;
  } else {
    const seed = findSeedCartItemByVariant(data, variantId);
    items.push(
      cartItemFromApi
        ? enrichCartItemImages(
          normalizeCartLineItem({
            ...cartItemFromApi,
            id: cartItemFromApi.id,
            variant_id:
              getVariantIdFromItem(cartItemFromApi) || variantId,
            quantity: Number(cartItemFromApi.quantity ?? quantity),
          }),
          variantId,
        )
        : enrichCartItemImages(
          normalizeCartLineItem({
            variant_id: variantId,
            quantity,
            variant: seed?.variant
              ? { ...seed.variant }
              : {
                  variant_id: variantId,
                  selling_price:
                    seed?.selling_price ?? seed?.variant?.selling_price,
                  mrp: seed?.mrp ?? seed?.variant?.mrp,
                  variant_title:
                    seed?.variant?.variant_title ??
                    seed?.variant?.title ??
                    seed?.product_name,
                  brand_name: seed?.variant?.brand_name,
                  size: seed?.variant?.size,
                },
            selling_price:
              seed?.selling_price ?? seed?.variant?.selling_price,
            mrp: seed?.mrp ?? seed?.variant?.mrp,
            product_name:
              seed?.variant?.variant_title ??
              seed?.variant?.title ??
              seed?.product_name ??
              seed?.name,
            prescription_required: false,
          }),
          variantId,
        ),
    );
  }

  return {
    ...data,
    my_cart: {
      ...data.my_cart,
      items,
      subtotal: computeCartItemsSubtotal(items),
    },
  };
};

const patchPrescribedItemQuantity = (
  data: CartData,
  quantity: number,
  cartItemId?: string,
  variantId?: string,
): CartData => {
  const groups = (data?.prescription_cart?.items ?? []).map((group: any) => ({
    ...group,
    items: (group?.items ?? [])
      .map((item: any) => {
        const matchesLine =
          !!cartItemId && getCartLineId(item) === String(cartItemId);
        const matchesVariant =
          !cartItemId &&
          !!variantId &&
          getVariantIdFromItem(item) === String(variantId);
        if (!matchesLine && !matchesVariant) return item;
        if (quantity <= 0) return null;
        return normalizeCartLineItem({
          ...item,
          quantity: Number(quantity),
          // Keep unit prices so line selling/MRP totals update with qty
          selling_price:
            item?.selling_price ?? item?.variant?.selling_price,
          mrp: item?.mrp ?? item?.variant?.mrp,
          price:
            item?.selling_price ??
            item?.variant?.selling_price ??
            item?.price,
        });
      })
      .filter(Boolean),
  }));

  return {
    ...data,
    prescription_cart: {
      ...data.prescription_cart,
      items: groups,
      subtotal: groups.reduce(
        (sum, group) => sum + computeCartItemsSubtotal(group?.items ?? []),
        0,
      ),
    },
  };
};

const patchCartItemQuantity = (
  data: CartData,
  variantId: string,
  quantity: number,
  cartItemFromApi?: any | null,
  options?: { source?: 'cart' | 'prescribed'; cartItemId?: string },
): CartData => {
  const source = options?.source ?? 'cart';
  const cartItemId = String(
    options?.cartItemId ?? cartItemFromApi?.id ?? '',
  );

  if (source === 'prescribed') {
    return patchPrescribedItemQuantity(
      data,
      quantity,
      cartItemId,
      variantId,
    );
  }

  return patchMyCartItemQuantity(
    data,
    variantId,
    quantity,
    cartItemFromApi,
    cartItemId,
  );
};

const removeVariantsFromCartData = (
  data: CartData,
  items: CartLineItem[],
): CartData => {
  const variantIds = new Set(items.map(item => String(item.variant_id)));

  const myCartItems = (data?.my_cart?.items ?? []).filter(
    item => !variantIds.has(getVariantIdFromItem(item)),
  );

  const prescriptionGroups = (data?.prescription_cart?.items ?? [])
    .map((prescription: any) => ({
      ...prescription,
      items: (prescription?.items ?? []).filter(
        (item: any) => !variantIds.has(getVariantIdFromItem(item)),
      ),
    }))
    .filter((prescription: any) => (prescription?.items ?? []).length > 0);

  return {
    ...data,
    my_cart: {
      ...data.my_cart,
      items: myCartItems,
    },
    prescription_cart: {
      ...data.prescription_cart,
      items: prescriptionGroups,
    },
  };
};

const initialState: CartState = {
  cartData: {},
  itemCount: 0,
  variantQuantities: {},
  loading: false,
  addingVariantId: null,
  error: null,
};

type FetchCartArg = boolean | { force?: boolean; silent?: boolean } | undefined;

const parseFetchCartArg = (arg: FetchCartArg) => {
  if (typeof arg === 'boolean') {
    return { force: arg, silent: false };
  }
  return { force: arg?.force ?? false, silent: arg?.silent ?? false };
};

export const fetchCart = createAsyncThunk<CartData, FetchCartArg>(
  'cart/fetch',
  async (arg, { rejectWithValue }) => {
    const { force } = parseFetchCartArg(arg);
    try {
      if (!(await isAuthenticated())) {
        return {};
      }
      const response = await fetchWithCache(
        CART_CACHE_KEY,
        async () => {
          const res = await _CART_SERVICES.getAllCart();
          console.log('CartServiceResponse', res);
          return res?.data ?? {};
        },
        { ttl: 30_000, force },
      );
      return response as CartData;
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to fetch cart');
    }
  },
);

export const addToCart = createAsyncThunk(
  'cart/add',
  async (
    {
      variantId,
      quantity,
      source = 'cart',
      cartItemId,
      skipOptimistic = false,
      currentQuantity,
      prescriptionRequired = false,
    }: {
      variantId: string | number;
      quantity: number;
      source?: 'cart' | 'prescribed';
      cartItemId?: string;
      skipOptimistic?: boolean;
      currentQuantity?: number;
      prescriptionRequired?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      if (!(await isAuthenticated())) {
        return rejectWithValue('LOGIN_REQUIRED');
      }

      const previousQty = Number(currentQuantity) || 0;
      if (
        source !== 'prescribed' &&
        Boolean(prescriptionRequired) &&
        Number(quantity) > previousQty
      ) {
        return rejectWithValue('Prescription required');
      }

      // Prescribed lines: same cart URL as my_cart (no source= query).
      // Never remove (qty 0). Client still patches prescription_cart locally.
      if (source === 'prescribed') {
        if (Boolean(prescriptionRequired)) {
          return rejectWithValue('Prescription required');
        }
        if (Number(quantity) <= 0) {
          return rejectWithValue('Cannot remove prescribed item');
        }

        const prescribedCartItemId =
          String(cartItemId ?? '').trim() || undefined;
        if (!prescribedCartItemId) {
          return rejectWithValue('Missing prescribed cart item id');
        }

        const prescribedResponse = await _CART_SERVICES.AddupdateCart({
          variant_id: String(variantId),
          quantity,
          cart_item_id: prescribedCartItemId,
        });

        const prescribedCartItem =
          prescribedResponse?.data?.item ??
          prescribedResponse?.data?.cart_item ??
          prescribedResponse?.item ??
          null;

        if (prescribedResponse?.success === false) {
          return rejectWithValue(
            prescribedResponse?.message ?? 'Failed to update prescribed item',
          );
        }

        invalidateCache(CART_CACHE_KEY);
        return {
          variantId: String(variantId),
          quantity: Number(prescribedCartItem?.quantity ?? quantity),
          cartItemId: prescribedCartItemId,
          source: 'prescribed' as const,
          cartItem: prescribedCartItem,
          message: prescribedResponse?.message,
        };
      }

      const safeCartItemId = String(cartItemId ?? '').trim() || undefined;

      const response = await _CART_SERVICES.AddupdateCart({
        variant_id: String(variantId),
        quantity,
        cart_item_id: safeCartItemId,
      });

      // Accept success flag or a returned cart item payload.
      const cartItem =
        response?.data?.item ??
        response?.data?.cart_item ??
        response?.item ??
        null;

      if (response?.success === false) {
        return rejectWithValue(response?.message ?? 'Failed to update cart');
      }

      invalidateCache(CART_CACHE_KEY);

      maybeNotifyCartAdded(
        String(variantId),
        Number(cartItem?.quantity ?? quantity),
        previousQty,
        source,
        cartItem,
      );

      return {
        variantId: String(variantId),
        quantity: Number(cartItem?.quantity ?? quantity),
        cartItemId: String(safeCartItemId ?? cartItem?.id ?? ''),
        source: source === 'prescribed' ? 'prescribed' : 'cart',
        cartItem,
        message: response?.message,
      };
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to update cart');
    }
  },
);

/** Instant UI patch — use queueCartLineSync from screens for qty changes. */
export const applyCartLineQuantity = createAction<LineSyncPayload>(
  'cart/applyLineQuantity',
);

export const setAddingVariantId = createAction<string | null>(
  'cart/setAddingVariantId',
);

/** Optimistic qty update + debounced API sync (one request per line). */
// export const queueCartLineSync = createAsyncThunk(
//   'cart/queueLineSync',
//   async (payload: LineSyncPayload, { dispatch, getState }) => {
//     const key = lineSyncKey(payload);

//     if (!lastConfirmedQty.has(key)) {
//       const state = getState() as { cart: CartState };
//       const current = findCartLineQuantity(state.cart.cartData, payload);
//       if (current != null) {
//         lastConfirmedQty.set(key, current);
//       }
//     }

//     pendingSyncPayloads.set(key, payload);
//     dispatch(applyCartLineQuantity(payload));

//     if (lineSyncTimers.has(key)) {
//       clearTimeout(lineSyncTimers.get(key)!);
//     }

//     return new Promise((resolve, reject) => {
//       lineSyncTimers.set(
//         key,
//         setTimeout(async () => {
//           lineSyncTimers.delete(key);
//           const latest = pendingSyncPayloads.get(key);
//           pendingSyncPayloads.delete(key);

//           if (!latest) {
//             resolve({ skipped: true });
//             return;
//           }

//           const result = await dispatch(
//             addToCart({
//               variantId: latest.variantId,
//               quantity: latest.quantity,
//               source: latest.source,
//               cartItemId: latest.cartItemId,
//               skipOptimistic: true,
//               currentQuantity: latest.currentQuantity,
//               prescriptionRequired: latest.prescriptionRequired,
//             }),
//           );

//           if (addToCart.fulfilled.match(result)) {
//             lastConfirmedQty.set(key, latest.quantity);
//             if (latest.quantity <= 0) {
//               lastConfirmedQty.delete(key);
//             }
//             resolve(result.payload);
//             return;
//           }

//           const rollbackQty = lastConfirmedQty.get(key);
//           if (rollbackQty !== undefined) {
//             dispatch(
//               applyCartLineQuantity({
//                 ...latest,
//                 quantity: rollbackQty,
//               }),
//             );
//           } else {
//             await dispatch(fetchCart({ force: true, silent: true }));
//           }
//           reject(result.payload);
//         }, 400),
//       );
//     });
//   },
// );


export const queueCartLineSync = createAsyncThunk(
  'cart/queueLineSync',
  async (payload: LineSyncPayload, { dispatch, getState }) => {
    const key = lineSyncKey(payload);
    dispatch(setAddingVariantId(String(payload.variantId)));

    if (!lastConfirmedQty.has(key)) {
      const state = getState() as { cart: CartState };
      const current = findCartLineQuantity(state.cart.cartData, payload);

      if (current != null) {
        lastConfirmedQty.set(key, current);
      }
    }

    pendingSyncPayloads.set(key, payload);

    dispatch(applyCartLineQuantity(payload));

    if (lineSyncTimers.has(key)) {
      clearTimeout(lineSyncTimers.get(key)!);
    }

    return new Promise<QueueCartLineSyncResult>((resolve, reject) => {
      lineSyncTimers.set(
        key,
        setTimeout(async () => {
          lineSyncTimers.delete(key);

          const latest = pendingSyncPayloads.get(key);
          pendingSyncPayloads.delete(key);

          if (!latest) {
            resolve({ skipped: true });
            return;
          }

          const result = await dispatch(
            addToCart({
              variantId: latest.variantId,
              quantity: latest.quantity,
              source: latest.source === 'prescribed' ? 'prescribed' : 'cart',
              cartItemId: String(latest.cartItemId ?? '').trim() || undefined,
              skipOptimistic: true,
              currentQuantity: latest.currentQuantity,
              prescriptionRequired: latest.prescriptionRequired,
            }),
          );

          try {
            if (addToCart.fulfilled.match(result)) {
              lastConfirmedQty.set(key, latest.quantity);

              if (latest.quantity <= 0) {
                lastConfirmedQty.delete(key);
              }

              // Prescribed + any response without a cart item → refresh so
              // subtotal / selling / MRP match the server like my_cart lines.
              if (
                latest.source === 'prescribed' ||
                !result.payload?.cartItem
              ) {
                await dispatch(fetchCart({ force: true, silent: true }));
              }

              resolve(result.payload);
              return;
            }

            const rollbackQty = lastConfirmedQty.get(key);

            if (rollbackQty !== undefined) {
              dispatch(
                applyCartLineQuantity({
                  ...latest,
                  quantity: rollbackQty,
                }),
              );
            } else {
              await dispatch(
                fetchCart({
                  force: true,
                  silent: true,
                }),
              );
            }

            reject(result.payload);
          } finally {
            dispatch(setAddingVariantId(null));
          }
        }, 400),
      );
    });
  },
);

/** @deprecated Prefer queueCartLineSync for cart screen qty changes. */
export const syncCartQuantity = createAsyncThunk(
  'cart/syncQuantity',
  async (
    payload: {
      variantId: string | number;
      quantity: number;
      source?: 'cart' | 'prescribed';
      cartItemId?: string;
      currentQuantity?: number;
      prescriptionRequired?: boolean;
    },
    { dispatch },
  ) => {
    return dispatch(
      queueCartLineSync({
        variantId: String(payload.variantId),
        quantity: payload.quantity,
        source: payload.source,
        cartItemId: payload.cartItemId,
        currentQuantity: payload.currentQuantity,
        prescriptionRequired: payload.prescriptionRequired,
      }),
    ).unwrap();
  },
);

/** Removes ordered products from cart after successful checkout. */
export const removeOrderedItemsFromCart = createAsyncThunk(
  'cart/removeOrderedItems',
  async (items: CartLineItem[], { dispatch, rejectWithValue }) => {
    try {
      if (!(await isAuthenticated()) || !items.length) {
        return { removed: 0 };
      }

      const uniqueItems = items.filter(item => item.variant_id && item.quantity > 0);

      for (const item of uniqueItems) {
        await _CART_SERVICES.AddupdateCart({
          variant_id: item.variant_id,
          quantity: 0,
        });
      }

      invalidateCache(CART_CACHE_KEY);
      await dispatch(fetchCart({ force: true, silent: true }));
      dispatch(applyOrderedItemRemoval(uniqueItems));
      return { removed: uniqueItems.length };
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to clear cart');
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setVariantQuantity: (
      state,
      action: PayloadAction<{ variantId: string; quantity: number }>,
    ) => {
      const { variantId, quantity } = action.payload;
      if (quantity <= 0) {
        delete state.variantQuantities[variantId];
      } else {
        state.variantQuantities[variantId] = quantity;
      }
      state.cartData = patchCartItemQuantity(state.cartData, variantId, quantity);
      const metrics = computeMetrics(state.cartData);
      state.itemCount = metrics.itemCount;
      state.variantQuantities = metrics.variantQuantities;
    },
    clearCartState: () => initialState,
    applyOrderedItemRemoval: (state, action: PayloadAction<CartLineItem[]>) => {
      state.cartData = removeVariantsFromCartData(state.cartData, action.payload);
      const metrics = computeMetrics(state.cartData);
      state.itemCount = metrics.itemCount;
      state.variantQuantities = metrics.variantQuantities;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCart.pending, (state, action) => {
        const { silent } = parseFetchCartArg(action.meta.arg);
        if (!silent) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        const normalized = normalizeCartItemsImages(action.payload);
        state.cartData = normalized;
        seedLastConfirmedQuantities(normalized);
        const metrics = computeMetrics(normalized);
        state.itemCount = metrics.itemCount;
        state.variantQuantities = metrics.variantQuantities;
      })
      .addCase(applyCartLineQuantity, (state, action) => {
        const { variantId, quantity, source, cartItemId } = action.payload;
        const patchSource = source ?? 'cart';
        state.cartData = patchCartItemQuantity(
          state.cartData,
          String(variantId),
          quantity,
          null,
          { source: patchSource, cartItemId: String(cartItemId ?? '') },
        );
        if (patchSource !== 'prescribed') {
          const id = String(variantId);
          if (quantity <= 0) {
            delete state.variantQuantities[id];
          } else {
            state.variantQuantities[id] = quantity;
          }
          state.itemCount = Object.values(state.variantQuantities).reduce(
            (sum, q) => sum + q,
            0,
          );
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(setAddingVariantId, (state, action) => {
        state.addingVariantId = action.payload;
      })
      .addCase(addToCart.pending, (state, action) => {
        if (action.meta.arg.skipOptimistic) {
          return;
        }
        state.addingVariantId = String(action.meta.arg.variantId);
        const { variantId, quantity, source, cartItemId } = action.meta.arg;
        const id = String(variantId);
        const patchSource = source ?? 'cart';
        state.cartData = patchCartItemQuantity(
          state.cartData,
          id,
          quantity,
          null,
          { source: patchSource, cartItemId },
        );
        if (patchSource !== 'prescribed') {
          if (quantity <= 0) {
            delete state.variantQuantities[id];
          } else {
            state.variantQuantities[id] = quantity;
          }
          state.itemCount = Object.values(state.variantQuantities).reduce(
            (sum, q) => sum + q,
            0,
          );
        }
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.addingVariantId = null;
        const { variantId, quantity, cartItem, cartItemId, source } =
          action.payload as {
            variantId: string;
            quantity: number;
            cartItemId?: string | null;
            source?: 'cart' | 'prescribed';
            cartItem?: any;
            message?: string;
          };
        const id = String(variantId);
        const patchSource = source ?? 'cart';
        state.cartData = patchCartItemQuantity(
          state.cartData,
          id,
          quantity,
          cartItem,
          { source: patchSource, cartItemId: String(cartItemId ?? '') },
        );
        if (patchSource !== 'prescribed') {
          if (quantity <= 0) {
            delete state.variantQuantities[id];
          } else {
            state.variantQuantities[id] = quantity;
          }
          state.itemCount = Object.values(state.variantQuantities).reduce(
            (sum, q) => sum + q,
            0,
          );
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.addingVariantId = null;
        state.error = action.payload as string;
      });
  },
});

export const {
  setVariantQuantity,
  clearCartState,
  applyOrderedItemRemoval,
} = cartSlice.actions;
export const selectCartCount = (state: { cart: CartState }) => state.cart.itemCount;
export const selectVariantQuantity =
  (variantId: string) => (state: { cart: CartState }) =>
    state.cart.variantQuantities[variantId] ?? 0;
export const selectIsAddingVariant =
  (variantId: string) => (state: { cart: CartState }) =>
    state.cart.addingVariantId === variantId;

export default cartSlice.reducer;
