import { Utils } from '../common/Utils';
import { navigationRef } from '../navigation/navigationRef';
import { showSuccessToast } from '../config/Key';

export const GUEST_KEY = '_IS_GUEST';

export async function isGuestUser(): Promise<boolean> {
  const flag = await Utils.getData(GUEST_KEY);
  return flag === true;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await Utils.getData('_TOKEN');
  return !!token;
}

export async function enableGuestMode(): Promise<void> {
  await Utils.storeData(GUEST_KEY, true);
}

export async function clearGuestMode(): Promise<void> {
  await Utils.removeData(GUEST_KEY);
}

export async function onLoginSuccess(): Promise<void> {
  await clearGuestMode();
}

export function navigateToLogin(message?: string): void {
  if (message) {
    showSuccessToast(message, 'error');
  }
  if (navigationRef.isReady()) {
    // Guests keep their explore state; login is a normal push they can back out of.
    // @ts-expect-error nested auth stack screen
    navigationRef.navigate('AuthStack', { screen: 'Login' });
  }
}

/**
 * Gate an ACTION (add to cart, book, purchase, upload) behind auth.
 * Guests browsing the app are only prompted here, never on plain navigation.
 * Returns true when the user is logged in and the action may proceed.
 */
export async function requireAuth(
  message = 'Please login to continue',
): Promise<boolean> {
  if (await isAuthenticated()) {
    return true;
  }
  navigateToLogin(message);
  return false;
}

/** Run action only when authenticated; otherwise prompt login. */
export async function guardAuthenticatedAction(
  message: string,
  action: () => void | Promise<void>,
): Promise<boolean> {
  if (!(await requireAuth(message))) {
    return false;
  }
  await action();
  return true;
}
