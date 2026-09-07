import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  fetchUnreadNotificationCount,
  publishUnreadCount,
} from '../hooks/useNotification';

/** Badge sync — slow on purpose; OneSignal handles realtime push UI. */
const POLL_MS = 90_000;

/**
 * Keeps the unread badge in sync while the app is open.
 * Does NOT show an in-app or device popup — OneSignal owns push UI
 * (custom modal in foreground, system tray in background).
 *
 * One API call per tick (no duplicate list fetch).
 */
const InAppNotificationWatcher = () => {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const refreshBadge = async () => {
      if (appStateRef.current !== 'active' || inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      try {
        const count = await fetchUnreadNotificationCount();
        publishUnreadCount(count);
      } catch {
        // ignore
      } finally {
        inFlightRef.current = false;
      }
    };

    refreshBadge();
    const interval = setInterval(refreshBadge, POLL_MS);

    const sub = AppState.addEventListener('change', nextState => {
      const wasBackground = appStateRef.current !== 'active';
      appStateRef.current = nextState;
      // Refresh once when returning to foreground — not while staying idle
      if (wasBackground && nextState === 'active') {
        refreshBadge();
      }
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  return null;
};

export default InAppNotificationWatcher;
