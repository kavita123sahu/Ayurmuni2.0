import { BaseUrl } from '../../config/Key';

/** Strip trailing slashes so WS paths don't become `//ws/...` */
const normalizeBase = (url: string) => String(url || '').replace(/\/+$/, '');

const API_BASE = normalizeBase(BaseUrl.base_url);

/**
 * https → wss, http → ws (never leave a trailing slash).
 * Bug before: `https`.replace('https','ws') → `ws://` and then `/ws` → `//ws`.
 */
const WS_BASE = normalizeBase(API_BASE)
  .replace(/^https:/i, 'wss:')
  .replace(/^http:/i, 'ws:');

export { API_BASE, WS_BASE };
