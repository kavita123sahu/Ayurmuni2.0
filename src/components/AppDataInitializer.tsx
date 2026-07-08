import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { fetchCart } from '../store/slices/cartSlice';
import { fetchHomeData } from '../store/slices/homeSlice';
import { isAuthenticated } from '../services/guestAuth';

const AppDataInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchHomeData(false));
    isAuthenticated().then(loggedIn => {
      if (loggedIn) {
        dispatch(fetchCart(false));
      }
    });
  }, [dispatch]);

  return null;
};

export default AppDataInitializer;
