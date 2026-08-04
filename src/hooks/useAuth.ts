import { useCallback, useEffect, useState } from 'react';
import {
  AccessLevel,
  getAccessLevel,
  isAuthenticated,
  isGuestUser,
  requireAuth,
  guardAuthenticatedAction,
  navigateToLogin,
  navigateToCompleteDetails,
} from '../services/guestAuth';

export const useAuth = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('logged_out');
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const [auth, guest, level] = await Promise.all([
      isAuthenticated(),
      isGuestUser(),
      getAccessLevel(),
    ]);
    setLoggedIn(auth);
    setIsGuest(guest);
    setAccessLevel(level);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ready,
    /** Has API token (guest or full). */
    isLoggedIn: loggedIn,
    /** Token + guest flag — browse OK, actions gated. */
    isGuest,
    accessLevel,
    /** True only for full users (actions allowed). */
    canPerformActions: loggedIn && !isGuest,
    refresh,
    requireAuth,
    guardAction: guardAuthenticatedAction,
    goToLogin: navigateToLogin,
    goToCompleteDetails: navigateToCompleteDetails,
  };
};
