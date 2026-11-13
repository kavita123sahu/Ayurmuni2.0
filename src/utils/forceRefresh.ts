import { invalidateCache } from '../services/apiCache';
import {
  clearThrottle,
  invalidateProfileThrottles,
} from './fetchThrottle';
import { Utils } from '../common/Utils';

/**
 * Clear in-memory API caches + focus throttles so pull-to-refresh
 * and post-assessment reloads cannot serve stale payloads.
 */
export const bumpGlobalRefresh = () => {
  invalidateCache();
  clearThrottle();
  invalidateProfileThrottles();
  // Drop cached prakriti label so HomeHeader reloads from API
  void Utils.removeData('PRAKRITI_RESULT_NAME');
};
