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
import * as ProfileServices from './ProfileServices';

export const ACCESS_KEYS = {
  TOKEN: '_TOKEN',
  REFRESH: '_REFRESH_TOKEN',
  IS_GUEST: '_IS_GUEST',
  USER_INFO: '_USER_INFO',
  USER_ID: '_USER_ID',
} as const;

export type AccessLevel = 'logged_out' | 'guest' | 'full';

type ProfileLike = {
  is_onboarded?: boolean;
  is_profile?: boolean | string | number;
  is_customer_profile_created?: boolean | string | number;
  /** Backend alias used on some payloads */
  customer_created?: boolean | string | number;
  prakriti_progress?: number | string | null;
  first_name?: string | null;
  customer_id?: string | number | null;
  id?: string | number | null;
  [key: string]: unknown;
} | null;

const truthy = (v: unknown) =>
  v === true || v === 'true' || v === 1 || v === '1';

const falsy = (v: unknown) =>
  v === false || v === 'false' || v === 0 || v === '0';

const profileCreatedFlag = (profile?: ProfileLike) =>
  profile?.is_customer_profile_created ??
  profile?.customer_created ??
  profile?.is_profile;

const hasCustomerIdentity = (profile?: ProfileLike) =>
  Boolean(
    profile &&
      String(profile.first_name ?? '').trim() &&
      (profile.customer_id || profile.id),
  );

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
export function isProfileComplete(profile?: ProfileLike): boolean {
  if (!profile) return false;

  // Explicit profile flags from backend (any alias)
  if (truthy(profileCreatedFlag(profile))) return true;
  if (profile.is_onboarded === true) return true;
  if (Number(profile.prakriti_progress) >= 100) return true;
  // Completed customer onboarding (name + id) — clears stuck guest flag
  if (hasCustomerIdentity(profile)) return true;
  return false;
}

/** True when backend says customer profile is not ready → treat as guest. */
export function shouldStayGuest(profile?: ProfileLike): boolean {
  if (!profile) return true;
  // Never demote a clearly completed onboarding profile
  if (isProfileComplete(profile)) return false;
  if (falsy(profileCreatedFlag(profile))) return true;
  return true;
}

/**
 * Keep local access flag in sync with profile API.
 * Completed identity / true flags always win over stale `false` flags.
 */
export async function syncAccessFromProfile(
  profile?: ProfileLike,
): Promise<AccessLevel> {
  if (!(await isAuthenticated())) return 'logged_out';

  if (isProfileComplete(profile)) {
    await promoteToFullUser();
    return 'full';
  }

  // Explicit incomplete only when there is no completed identity evidence
  if (profile && falsy(profileCreatedFlag(profile)) && !hasCustomerIdentity(profile)) {
    await markAsGuest();
    return 'guest';
  }

  if (await isGuestUser()) {
    return 'guest';
  }

  await markAsGuest();
  return 'guest';
}

/** Persist onboarding / profile payload and upgrade access immediately. */
export async function persistProfileAndSyncAccess(
  profile?: ProfileLike,
): Promise<AccessLevel> {
  if (profile && typeof profile === 'object') {
    const prev = (await Utils.getData(ACCESS_KEYS.USER_INFO)) || {};
    const merged = { ...prev, ...profile };
    await Utils.storeData(ACCESS_KEYS.USER_INFO, merged);
    return syncAccessFromProfile(merged);
  }
  return syncAccessFromProfile(profile);
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

/**
 * Same readiness check ProfileScreen uses before showing guest vs full UI.
 * Fetches fresh profile when needed and promotes guest → full when complete.
 */
export async function resolveAccessLikeProfile(): Promise<{
  level: AccessLevel;
  profile: any | null;
  isComplete: boolean;
}> {
  if (!(await isAuthenticated())) {
    return { level: 'logged_out', profile: null, isComplete: false };
  }

  const cached = (await Utils.getData(ACCESS_KEYS.USER_INFO)) || null;
  let profile: any = cached;

  try {
    const res: any = await ProfileServices.user_profile();
    if (res?.data) {
      // Merge so onboarding fields are not wiped if API lags on flags
      profile = { ...(cached || {}), ...res.data };
      await Utils.storeData(ACCESS_KEYS.USER_INFO, profile);
    }
  } catch {
    // Fall back to cached USER_INFO
  }

  // Explicit completed profile always wins (never keep stuck guest flag)
  if (isProfileComplete(profile)) {
    await promoteToFullUser();
    return { level: 'full', profile, isComplete: true };
  }

  const level = await syncAccessFromProfile(profile);
  if (level === 'full' || isProfileComplete(profile)) {
    await promoteToFullUser();
    return { level: 'full', profile, isComplete: true };
  }

  return {
    level,
    profile,
    isComplete: false,
  };
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
 * - Guest with incomplete profile → CompleteDetails UI
 * - Guest but profile already created (like ProfileScreen) → allow + promote
 * - Full user → allow
 */
export async function requireAuth(
  message = 'Complete your details to proceed',
): Promise<boolean> {
  if (!(await isAuthenticated())) {
    navigateToLogin('Please verify OTP to continue');
    return false;
  }

  // Always re-check profile when guest — do not wait for ProfileScreen
  if (await isGuestUser()) {
    const { isComplete } = await resolveAccessLikeProfile();
    if (isComplete) {
      return true;
    }

    const guestMessage =
      !message || /login/i.test(message)
        ? 'Complete your profile and prakriti assessment to continue.'
        : message;
    navigateToCompleteDetails(guestMessage);
    return false;
  }

  // Even full users: if cache is empty, soft-sync once (no modal)
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
