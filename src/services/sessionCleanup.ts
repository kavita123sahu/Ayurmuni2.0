import { Utils } from '../common/Utils';
import { invalidateCache } from './apiCache';
import { store } from '../store/store';
import { resetHomeState } from '../store/slices/homeSlice';
import { clearCartState } from '../store/slices/cartSlice';

type ClearSessionOptions = {
  /** Extra cleanup that needs React context (e.g. LocationContext). */
  clearLocationSession?: () => Promise<void> | void;
};

/**
 * Clears persisted auth + in-memory session caches so a new login
 * never inherits the previous user's address / profile / cart.
 */
export async function clearAppSession(
  options?: ClearSessionOptions,
): Promise<void> {
  try {
    await options?.clearLocationSession?.();
  } catch {
    // continue clearing
  }

  invalidateCache();
  store.dispatch(resetHomeState());
  store.dispatch(clearCartState());
  await Utils.clearAllData();
}
