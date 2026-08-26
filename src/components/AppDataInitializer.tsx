import { useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { fetchCart } from '../store/slices/cartSlice';
import { fetchHomeData } from '../store/slices/homeSlice';
import { isAuthenticated } from '../services/guestAuth';
import * as ProductServices from '../services/ProductServices';
import { setWishlistCount } from '../utils/wishlistCount';

/**
 * Warm home/cart after first interactions so Splash/nav aren't blocked.
 */
const AppDataInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      dispatch(fetchHomeData(false));
      isAuthenticated().then(async loggedIn => {
        if (loggedIn) {
          dispatch(fetchCart(false));
          try {
            const res = await ProductServices.getProduct();
            const items = res?.data?.results || [];
            const count = items.filter(
              (item: any) => item?.is_wishlist_item === true,
            ).length;
            setWishlistCount(count);
          } catch {
            setWishlistCount(0);
          }
        }
      });
    });
    return () => task.cancel();
  }, [dispatch]);

  return null;
};

export default AppDataInitializer;
