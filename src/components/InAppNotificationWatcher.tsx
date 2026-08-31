import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as _CONSULT_SERVICE from '../services/ConsultServce';
import {
  fetchUnreadNotificationCount,
  publishUnreadCount,
} from '../hooks/useNotification';

const POLL_MS = 15_000;

/**
 * Keeps the unread badge in sync while the app is open.
 * Does NOT show an in-app or device popup — OneSignal owns push UI
 * (custom modal in foreground, system tray in background).
 */
const InAppNotificationWatcher = () => {
  const lastSeenIdRef = useRef<string | null>(null);
  const primedRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const refreshBadge = async () => {
      if (appStateRef.current !== 'active') {
        return;
      }

      try {
        const count = await fetchUnreadNotificationCount();
        publishUnreadCount(count);

        const res = await _CONSULT_SERVICE.getNotification({
          view: 'list',
          is_read: false,
          page: 1,
          page_size: 1,
        });

        const latest = (res?.data?.results ?? res?.results ?? [])[0];
        if (!latest?.id) {
          return;
        }

        const latestId = String(latest.id);
        if (!primedRef.current) {
          primedRef.current = true;
          lastSeenIdRef.current = latestId;
          return;
        }

        lastSeenIdRef.current = latestId;
      } catch {
        // ignore
      }
    };

    refreshBadge();
    const interval = setInterval(refreshBadge, POLL_MS);

    const sub = AppState.addEventListener('change', nextState => {
      appStateRef.current = nextState;
      if (nextState === 'active') {
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
