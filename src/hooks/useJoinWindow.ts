import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  getMsUntilJoinWindowChange,
  isAppointmentJoinable,
} from '../utils/appointmentUtils';

/** Only watch slots that open / close within this horizon. */
const WATCH_HORIZON_MS = 6 * 60 * 60 * 1000;
/** RN warns on timers longer than ~60s — re-check in chunks. */
const MAX_TIMER_MS = 55 * 1000;

/**
 * Live "can join" flag for one appointment.
 * Re-renders exactly when the 5-min join window opens / closes and on app resume.
 */
export const useJoinWindow = (appointment: any, windowMinutes = 5): boolean => {
  const [, setTick] = useState(0);
  const joinable = isAppointmentJoinable(appointment, windowMinutes);
  const msUntilChange = getMsUntilJoinWindowChange(appointment, windowMinutes);

  useEffect(() => {
    if (msUntilChange == null || msUntilChange > WATCH_HORIZON_MS) return;
    const timer = setTimeout(
      () => setTick(t => t + 1),
      Math.min(msUntilChange + 500, MAX_TIMER_MS),
    );
    return () => clearTimeout(timer);
  }, [msUntilChange, joinable]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') setTick(t => t + 1);
    });
    return () => sub.remove();
  }, []);

  return joinable;
};
