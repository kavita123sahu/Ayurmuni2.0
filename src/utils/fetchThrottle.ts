/**
 * Simple in-memory throttle for focus/interval API refreshes.
 * Returns true when enough time has passed since the last successful run for `key`.
 */
const lastRunAt = new Map<string, number>();

export const shouldRunThrottled = (
  key: string,
  minIntervalMs: number,
): boolean => {
  const now = Date.now();
  const last = lastRunAt.get(key) ?? 0;
  if (now - last < minIntervalMs) {
    return false;
  }
  lastRunAt.set(key, now);
  return true;
};

/** Mark a key as freshly run (e.g. after a forced refresh). */
export const markThrottledRun = (key: string) => {
  lastRunAt.set(key, Date.now());
};

export const clearThrottle = (key?: string) => {
  if (key) {
    lastRunAt.delete(key);
    return;
  }
  lastRunAt.clear();
};
