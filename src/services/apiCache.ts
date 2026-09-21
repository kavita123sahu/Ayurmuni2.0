type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();
/** Bumps on force so a stale in-flight response cannot overwrite fresh cache. */
const generations = new Map<string, number>();

const DEFAULT_TTL = 60_000;

export const getCached = <T>(key: string, ttl = DEFAULT_TTL): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
};

export const setCached = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const invalidateCache = (key?: string): void => {
  if (key) {
    cache.delete(key);
    inflight.delete(key);
    generations.set(key, (generations.get(key) ?? 0) + 1);
    return;
  }
  cache.clear();
  inflight.clear();
  generations.clear();
};

export const fetchWithCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttl?: number; force?: boolean },
): Promise<T> => {
  const ttl = options?.ttl ?? DEFAULT_TTL;

  if (options?.force) {
    cache.delete(key);
    inflight.delete(key);
    generations.set(key, (generations.get(key) ?? 0) + 1);
  } else {
    const cached = getCached<T>(key, ttl);
    if (cached !== null) return cached;

    const pending = inflight.get(key);
    if (pending) {
      return pending as Promise<T>;
    }
  }

  const gen = generations.get(key) ?? 0;

  const request = fetcher()
    .then(data => {
      if ((generations.get(key) ?? 0) === gen) {
        const isEmptyArray = Array.isArray(data) && data.length === 0;
        if (isEmptyArray || data == null) {
          // Empty / null means no data — drop any stale entry so UI clears
          cache.delete(key);
        } else {
          setCached(key, data);
        }
        inflight.delete(key);
      }
      return data;
    })
    .catch(err => {
      if ((generations.get(key) ?? 0) === gen) {
        inflight.delete(key);
      }
      throw err;
    });

  inflight.set(key, request);
  return request;
};
