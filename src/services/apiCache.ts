type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

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
    return;
  }
  cache.clear();
};

export const fetchWithCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttl?: number; force?: boolean },
): Promise<T> => {
  const ttl = options?.ttl ?? DEFAULT_TTL;

  if (!options?.force) {
    const cached = getCached<T>(key, ttl);
    if (cached !== null) return cached;
  }

  const pending = inflight.get(key);
  if (pending && !options?.force) {
    return pending as Promise<T>;
  }

  const request = fetcher()
    .then(data => {
      setCached(key, data);
      inflight.delete(key);
      return data;
    })
    .catch(err => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, request);
  return request;
};
