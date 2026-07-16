import { Utils } from '../common/Utils';
import { navigationRef } from '../navigation/navigationRef';
import { showSuccessToast } from '../config/Key';

export async function isAuthenticated(): Promise<boolean> {
  const token = await Utils.getData('_TOKEN');
  return !!token;
}

export async function onLoginSuccess(): Promise<void> {
  await Utils.removeData('_IS_GUEST');
}

export function navigateToLogin(message?: string): void {
  if (message) {
    showSuccessToast(message, 'error');
  }
  if (navigationRef.isReady()) {
    // @ts-expect-error nested auth stack screen
    navigationRef.navigate('AuthStack', { screen: 'Login' });
  }
}

export async function requireAuth(
  message = 'Please login to continue',
): Promise<boolean> {
  if (await isAuthenticated()) {
    return true;
  }
  navigateToLogin(message);
  return false;
}

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
