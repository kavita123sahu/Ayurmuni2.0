export type PendingProductReview = {
  variantId: string;
  orderId: string;
  rating: number;
  review: string;
  image_urls: string[];
};

let pending: PendingProductReview | null = null;

/** Set just before goBack() from Share Experience (product). */
export const setPendingProductReview = (payload: PendingProductReview) => {
  pending = payload;
};

/** Read once on Order Details focus, then clear. */
export const consumePendingProductReview = (): PendingProductReview | null => {
  const next = pending;
  pending = null;
  return next;
};
