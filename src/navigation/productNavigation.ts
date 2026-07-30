import { resolveImageUri } from '../utils/imageUtils';
import { navigateToStackScreen } from './navigationUtils';

export const navigateToSearchScreen = (
  navigation: any,
  params?: {
    categoryId?: string;
    categoryName?: string;
    serviceCategoryId?: string;
    categoryMode?: 'health' | 'product';
  },
) => {
  navigateToStackScreen(navigation, 'SearchScreen', params ?? {});
};

export const navigateToCategoryProducts = (
  navigation: any,
  params?: {
    categoryId?: string;
    categoryName?: string;
    categoryMode?: 'health' | 'product';
    productSubcategoryId?: string;
    healthCategoryId?: string;
    healthDiseaseId?: string;
    brand_name_id?: string;
    brandName?: string;
    serviceCategoryId?: string;
  },
) => {
  navigateToStackScreen(navigation, 'CategoryProducts', params ?? {});
};

export const navigateToProductDetails = (
  navigation: any,
  variantId: string | number | undefined | null,
) => {
  if (variantId === undefined || variantId === null || variantId === '') {
    return;
  }

  navigateToStackScreen(navigation, 'ProductDetails', {
    varientID: variantId,
  });
};

export const navigateToCheckout = (
  navigation: any,
  selectedProducts: Array<{
    id?: string;
    cart_item_id?: string;
    variant_id?: string;
    quantity?: number;
    price?: number;
    name?: string;
    image?: unknown;
    discount?: number;
    gift_wrap?: boolean;
    source?: 'cart' | 'prescribed';
  }>,
  totalSubtotal?: number,
) => {
  if (!selectedProducts.length) {
    return;
  }

  const normalizedProducts = selectedProducts.map(item => {
    // Cart line id from API (data.item.id) — NOT variant.variant_id
    const cartItemId = String(item.id ?? item.cart_item_id ?? '');
    const variantId = String(item.variant_id ?? '');

    return {
      id: cartItemId,
      cart_item_id: cartItemId,
      variant_id: variantId,
      quantity: Number(item.quantity ?? 1),
      price: Number(item.price ?? 0),
      name: item.name ?? '',
      image: resolveImageUri(item.image),
      discount: item.discount ?? 0,
      gift_wrap: Boolean(item.gift_wrap),
      source: item.source,
    };
  });

  const checkoutSubtotal =
    totalSubtotal ??
    normalizedProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

  navigateToStackScreen(navigation, 'Checkout', {
    selectedProducts: normalizedProducts,
    totalSubtotal: checkoutSubtotal,
  });
};

export const navigateToMyCart = (navigation: any) => {
  navigateToStackScreen(navigation, 'MyCart');
};

export const navigateToCheckoutWithProduct = (
  navigation: any,
  item: {
    variantId?: string;
    id?: string;
    name: string;
    price: number;
    image?: any;
  },
) => {
  const variantId = String(item.variantId ?? item.id ?? '');
  if (!variantId) {
    return;
  }

  const imageUri = resolveImageUri(item.image);

  const selectedProducts = [
    {
      id: variantId,
      variant_id: variantId,
      quantity: 1,
      price: Number(item.price ?? 0),
      name: item.name,
      image: imageUri,
      discount: 0,
    },
  ];

  navigateToStackScreen(navigation, 'Checkout', {
    selectedProducts,
    totalSubtotal: Number(item.price ?? 0),
  });
};
