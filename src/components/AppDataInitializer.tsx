import { useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { fetchCart } from '../store/slices/cartSlice';
import { fetchHomeData } from '../store/slices/homeSlice';
import { isAuthenticated } from '../services/guestAuth';

/**
 * Warm home/cart after first interactions so Splash/nav aren't blocked.
 */
const AppDataInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      dispatch(fetchHomeData(false));
      isAuthenticated().then(loggedIn => {
        if (loggedIn) {
          dispatch(fetchCart(false));
        }
      });
    });
    return () => task.cancel();
  }, [dispatch]);

  return null;
};

export default AppDataInitializer;
