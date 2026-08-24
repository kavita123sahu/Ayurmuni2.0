type Listener = (count: number) => void;

let wishlistCount = 0;
const listeners = new Set<Listener>();

export const getWishlistCount = (): number => wishlistCount;

export const setWishlistCount = (count: number): void => {
  wishlistCount = Math.max(0, Math.round(count));
  listeners.forEach(listener => listener(wishlistCount));
};

export const adjustWishlistCount = (delta: number): number => {
  setWishlistCount(wishlistCount + delta);
  return wishlistCount;
};

export const subscribeWishlistCount = (listener: Listener): (() => void) => {
  listeners.add(listener);
  listener(wishlistCount);
  return () => listeners.delete(listener);
};
