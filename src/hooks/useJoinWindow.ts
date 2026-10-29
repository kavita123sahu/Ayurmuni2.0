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
    if (msUntilChange == null) return;
    // Far from the slot — wake once we enter the watch horizon, then tick in chunks
    const delay =
      msUntilChange > WATCH_HORIZON_MS
        ? msUntilChange - WATCH_HORIZON_MS + 500
        : Math.min(msUntilChange + 500, MAX_TIMER_MS);
    const timer = setTimeout(() => setTick(t => t + 1), Math.min(delay, MAX_TIMER_MS));
    return () => clearTimeout(timer);
  }, [msUntilChange, joinable]);

  // While near / inside the join window, poll often so Join appears without refresh
  useEffect(() => {
    if (msUntilChange == null || msUntilChange > WATCH_HORIZON_MS) return;
    const timer = setInterval(() => setTick(t => t + 1), 15_000);
    return () => clearInterval(timer);
  }, [msUntilChange]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') setTick(t => t + 1);
    });
    return () => sub.remove();
  }, []);

  return joinable;
};
