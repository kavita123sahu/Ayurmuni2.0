import { useCallback, useEffect, useState } from 'react';
import {
  isAuthenticated,
  requireAuth,
  guardAuthenticatedAction,
  navigateToLogin,
} from '../services/guestAuth';

export const useAuth = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    setLoggedIn(await isAuthenticated());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ready,
    isLoggedIn: loggedIn,
    refresh,
    requireAuth,
    guardAction: guardAuthenticatedAction,
    goToLogin: navigateToLogin,
  };
};
