import { useCallback, useEffect, useState } from 'react';
import {
  isGuestUser,
  isAuthenticated,
  requireAuth,
  guardAuthenticatedAction,
  navigateToLogin,
} from '../services/guestAuth';

export const useAuth = () => {
  const [guest, setGuest] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const [guestFlag, authFlag] = await Promise.all([
      isGuestUser(),
      isAuthenticated(),
    ]);
    setGuest(guestFlag && !authFlag);
    setLoggedIn(authFlag);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ready,
    isGuest: guest,
    isLoggedIn: loggedIn,
    refresh,
    requireAuth,
    guardAction: guardAuthenticatedAction,
    goToLogin: navigateToLogin,
  };
};
