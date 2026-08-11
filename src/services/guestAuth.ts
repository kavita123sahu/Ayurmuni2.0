/**
 * Access levels (developer reference)
 * -----------------------------------
 * 1) LOGGED_OUT  — no `_TOKEN`
 *    → Welcome / Login / OTP
 *
 * 2) GUEST       — has `_TOKEN` + `_IS_GUEST === true`
 *    → Can browse Home + catalogs (APIs use token)
 *    → Actions (cart, book, wishlist, …) blocked → CompleteDetails screen
 *
 * 3) FULL_USER   — has `_TOKEN` + `_IS_GUEST` cleared
 *    → After customer profile + prakriti (or server `is_onboarded`)
 *    → All actions allowed
 *
 * Flow after OTP verify:
 *   store tokens → markAsGuest() → AccessMode screen
 *     ├─ Continue as Guest → Home (browse)
 *     └─ Complete profile  → Terms → Onboarding → Assessment
 */

import { Utils } from '../common/Utils';
import { navigationRef } from '../navigation/navigationRef';
import { showSuccessToast } from '../config/Key';

export const ACCESS_KEYS = {
  TOKEN: '_TOKEN',
  REFRESH: '_REFRESH_TOKEN',
  IS_GUEST: '_IS_GUEST',
  USER_INFO: '_USER_INFO',
  USER_ID: '_USER_ID',
} as const;

export type AccessLevel = 'logged_out' | 'guest' | 'full';

export async function isAuthenticated(): Promise<boolean> {
  const token = await Utils.getData(ACCESS_KEYS.TOKEN);
  return !!token;
}

/** Browse-only session: token exists but profile/prakriti not finished. */
export async function isGuestUser(): Promise<boolean> {
  if (!(await isAuthenticated())) return false;
  const flag = await Utils.getData(ACCESS_KEYS.IS_GUEST);
  return flag === true || flag === 'true';
}

export async function getAccessLevel(): Promise<AccessLevel> {
  if (!(await isAuthenticated())) return 'logged_out';
  if (await isGuestUser()) return 'guest';
  return 'full';
}

/** Call right after OTP success — user may browse, actions stay gated. */
export async function markAsGuest(): Promise<void> {
  await Utils.storeData(ACCESS_KEYS.IS_GUEST, true);
}

/** Call when customer profile + prakriti are done (or server says onboarded). */
export async function promoteToFullUser(): Promise<void> {
  await Utils.removeData(ACCESS_KEYS.IS_GUEST);
}

/** True when profile looks finished enough to leave guest mode. */
export function isProfileComplete(profile?: {
  is_onboarded?: boolean;
  /** Some APIs return this key instead of is_onboarded. */
  is_profile?: boolean | string | number;
  /** Alternate backend flag for customer profile readiness. */
  is_customer_profile_created?: boolean | string | number;
  prakriti_progress?: number | string | null;
  first_name?: string | null;
  customer_id?: string | number | null;
  id?: string | number | null;
} | null): boolean {
  if (!profile) return false;

  const truthy = (v: unknown) =>
    v === true || v === 'true' || v === 1 || v === '1';

  // Explicit profile flags from backend
  if (truthy(profile.is_profile)) return true;
  if (truthy(profile.is_customer_profile_created)) return true;
  if (profile.is_onboarded === true) return true;
  if (Number(profile.prakriti_progress) >= 100) return true;
  // Completed customer onboarding (name + id) — clears stuck guest flag
  if (profile.first_name && (profile.customer_id || profile.id)) return true;
  return false;
}

/** True when backend says customer profile is not ready → treat as guest. */
export function shouldStayGuest(profile?: {
  is_profile?: boolean | string | number;
  is_customer_profile_created?: boolean | string | number;
  is_onboarded?: boolean;
} | null): boolean {
  if (!profile) return true;
  const falsy = (v: unknown) =>
    v === false || v === 'false' || v === 0 || v === '0';

  // Explicit false flags force guest even if other fields exist
  if (falsy(profile.is_profile)) return true;
  if (falsy(profile.is_customer_profile_created)) return true;
  return !isProfileComplete(profile);
}

/**
 * Keep local access flag in sync with profile API.
 * - is_profile / is_customer_profile_created false → guest
 * - completed / onboarded / has customer profile → full user
 * - otherwise incomplete → guest
 */
export async function syncAccessFromProfile(profile?: {
  is_onboarded?: boolean;
  is_profile?: boolean | string | number;
  is_customer_profile_created?: boolean | string | number;
  prakriti_progress?: number | string | null;
  first_name?: string | null;
  customer_id?: string | number | null;
  id?: string | number | null;
} | null): Promise<AccessLevel> {
  if (!(await isAuthenticated())) return 'logged_out';

  const falsy = (v: unknown) =>
    v === false || v === 'false' || v === 0 || v === '0';

  // Explicit incomplete profile flags win — force guest mode
  if (
    profile &&
    (falsy(profile.is_profile) || falsy(profile.is_customer_profile_created))
  ) {
    await markAsGuest();
    return 'guest';
  }

  if (isProfileComplete(profile)) {
    await promoteToFullUser();
    return 'full';
  }

  if (await isGuestUser()) {
    return 'guest';
  }

  await markAsGuest();
  return 'guest';
}

/** Legacy name used after OTP — now means “session started”; stays guest until promoted. */
export async function onLoginSuccess(): Promise<void> {
  // Intentionally do NOT clear guest here.
  // OTP always lands as guest until AccessMode / onboarding upgrade.
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

/** Opens the single “Complete details to proceed” gate UI. */
export function navigateToCompleteDetails(message?: string): void {
  if (!navigationRef.isReady()) return;

  // @ts-expect-error nested home stack screen
  navigationRef.navigate('HomeStack', {
    screen: 'CompleteDetails',
    params: {
      reason:
        message ||
        'Complete your profile and prakriti assessment to continue.',
    },
  });
}

/**
 * Gate for purchase / book / wishlist / other mutations.
 * - No token → Login
 * - Guest     → CompleteDetails UI
 * - Full user → allow
 */
export async function requireAuth(
  message = 'Complete your details to proceed',
): Promise<boolean> {
  if (!(await isAuthenticated())) {
    navigateToLogin('Please verify OTP to continue');
    return false;
  }

  if (await isGuestUser()) {
    const guestMessage =
      !message || /login/i.test(message)
        ? 'Complete your profile and prakriti assessment to continue.'
        : message;
    navigateToCompleteDetails(guestMessage);
    return false;
  }

  return true;
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

/** Where to send user when they tap “Complete details”. */
export async function getOnboardingEntryScreen(): Promise<
  'Onboarding' | 'AssessmentType'
> {
  const info = await Utils.getData(ACCESS_KEYS.USER_INFO);
  const hasProfile =
    !!(info?.first_name || info?.customer_id || info?.id);

  return hasProfile ? 'AssessmentType' : 'Onboarding';
}
