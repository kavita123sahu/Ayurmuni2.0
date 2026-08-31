import { OneSignal, LogLevel } from 'react-native-onesignal';
import { PermissionsAndroid, Platform } from 'react-native';
import { apiClient } from './APIconfig';

const ONE_SIGNAL_APP_ID =
  '3e543921-8737-4c95-92ae-1578d40d99f0';

let initialized = false;

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });

export type OneSignalPushReady = {
  subscriptionId: string;
  fcmToken: string;
  optedIn: boolean;
};

/**
 * Initialize OneSignal
 * Call this once when the application starts.
 */
export const initializeOneSignal = async () => {
  try {
    if (initialized) {
      return;
    }

    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(ONE_SIGNAL_APP_ID);
    initialized = true;

    try {
      OneSignal.User.pushSubscription.optIn();
    } catch {
      // ignore
    }

    OneSignal.User.pushSubscription.addEventListener(
      'change',
      async () => {
        try {
          await getOneSignalPushData();
        } catch {
          // ignore
        }
      },
    );
  } catch {
    // ignore init errors — callers retry via wait helpers
  }
};

/**
 * Request OS notification permission (after themed UI prompt).
 */
export const requestNotificationPermission = async (
  fallbackToSettings = true,
): Promise<boolean> => {
  try {
    if (!initialized) {
      await initializeOneSignal();
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const androidGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (androidGranted !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }
    }

    const granted = await OneSignal.Notifications.requestPermission(
      fallbackToSettings,
    );

    if (granted) {
      try {
        OneSignal.User.pushSubscription.optIn();
      } catch {
        // ignore
      }
    }

    return Boolean(granted);
  } catch {
    return false;
  }
};

/**
 * Ask for device notification permission on every cold start
 * (covers users who skipped the OTP prompt).
 */
export const ensureDeviceNotificationsEnabled = async (): Promise<boolean> => {
  try {
    await initializeOneSignal();

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const status = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (!status) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      }
    }

    const permission = await OneSignal.Notifications.getPermissionAsync();
    if (!permission) {
      return requestNotificationPermission(false);
    }

    try {
      OneSignal.User.pushSubscription.optIn();
    } catch {
      // ignore
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Get current OneSignal push information.
 */
export const getOneSignalPushData = async () => {
  try {
    const subscriptionId =
      await OneSignal.User.pushSubscription.getIdAsync();

    const fcmToken =
      await OneSignal.User.pushSubscription.getTokenAsync();

    const optedIn =
      await OneSignal.User.pushSubscription.getOptedInAsync();

    return {
      subscriptionId: subscriptionId || null,
      fcmToken: fcmToken || null,
      optedIn: Boolean(optedIn),
    };
  } catch {
    return {
      subscriptionId: null,
      fcmToken: null,
      optedIn: false,
    };
  }
};

const isPushReady = (data: {
  subscriptionId: string | null;
  fcmToken: string | null;
  optedIn: boolean;
}): data is OneSignalPushReady =>
  Boolean(data.optedIn && data.subscriptionId && data.fcmToken);

/**
 * Wait until OneSignal has a real device subscription + FCM/APNS token.
 * Critical for first install / first customer in release builds.
 */
export const waitForPushSubscriptionReady = async (options?: {
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<OneSignalPushReady | null> => {
  await initializeOneSignal();

  const timeoutMs = options?.timeoutMs ?? 45_000;
  const intervalMs = options?.intervalMs ?? 600;
  const startedAt = Date.now();

  try {
    OneSignal.User.pushSubscription.optIn();
  } catch {
    // ignore
  }

  return new Promise(resolve => {
    let settled = false;

    const finish = (result: OneSignalPushReady | null) => {
      if (settled) return;
      settled = true;
      clearInterval(pollTimer);
      try {
        OneSignal.User.pushSubscription.removeEventListener(
          'change',
          onChange,
        );
      } catch {
        // ignore
      }
      resolve(result);
    };

    const check = async () => {
      const data = await getOneSignalPushData();
      if (isPushReady(data)) {
        finish({
          subscriptionId: data.subscriptionId,
          fcmToken: data.fcmToken,
          optedIn: true,
        });
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        finish(null);
      }
    };

    const onChange = () => {
      check();
    };

    try {
      OneSignal.User.pushSubscription.addEventListener('change', onChange);
    } catch {
      // polling still covers readiness
    }

    const pollTimer = setInterval(() => {
      check();
    }, intervalMs);

    check();
  });
};

/**
 * Wait until OneSignal External ID matches the backend user id.
 */
export const waitForExternalIdAssociation = async (
  userId: string | number,
  options?: { timeoutMs?: number; intervalMs?: number },
): Promise<boolean> => {
  const expected = String(userId);
  const timeoutMs = options?.timeoutMs ?? 20_000;
  const intervalMs = options?.intervalMs ?? 500;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const externalId = await OneSignal.User.getExternalId();
      if (externalId && String(externalId) === expected) {
        return true;
      }
    } catch {
      // keep retrying
    }
    await wait(intervalMs);
  }

  return false;
};

/**
 * Connect backend user with OneSignal AFTER device subscription is ready.
 * Does not call welcome API — use completeWelcomePushFlow for that.
 */
export const loginOneSignalUser = async (
  userId: string | number,
): Promise<{
  externalId: string;
  subscriptionId: string | null;
  fcmToken: string | null;
  optedIn: boolean;
  associated: boolean;
} | null> => {
  try {
    if (userId === undefined || userId === null || userId === '') {
      return null;
    }

    await initializeOneSignal();

    // First-install devices often have no token yet — wait before login.
    const readyBeforeLogin = await waitForPushSubscriptionReady({
      timeoutMs: 45_000,
      intervalMs: 600,
    });

    const externalId = String(userId);
    OneSignal.login(externalId);

    const associated = await waitForExternalIdAssociation(externalId, {
      timeoutMs: 20_000,
      intervalMs: 500,
    });

    // Login can briefly reset subscription — wait again before welcome API.
    const readyAfterLogin =
      (await waitForPushSubscriptionReady({
        timeoutMs: 25_000,
        intervalMs: 600,
      })) ?? readyBeforeLogin;

    // Extra settle time so OneSignal backend associates the player.
    await wait(1_500);

    return {
      externalId,
      subscriptionId: readyAfterLogin?.subscriptionId ?? null,
      fcmToken: readyAfterLogin?.fcmToken ?? null,
      optedIn: Boolean(readyAfterLogin?.optedIn),
      associated,
    };
  } catch {
    return null;
  }
};

export const welcome_notification = async () => {
  try {
    const response = await apiClient(
      'notifications/push/welcome/',
      {
        method: 'POST',
      },
      true,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Full welcome-push pipeline for newly created customers:
 * permission → wait subscription/token → login → verify → welcome API
 */
export const completeWelcomePushFlow = async (
  userId: string | number,
): Promise<{
  success: boolean;
  reason?: string;
  response?: any;
}> => {
  try {
    await initializeOneSignal();

    // 1) Permission (first-install release must prompt here)
    const permissionOk = await ensureDeviceNotificationsEnabled();
    if (!permissionOk) {
      return { success: false, reason: 'permission_denied' };
    }

    // 2–4) Wait subscription+token → OneSignal.login → verify association
    // loginOneSignalUser itself waits for a fresh device token before login
    // so the first customer on a clean install is covered.
    const loginResult = await loginOneSignalUser(userId);
    if (!loginResult) {
      return { success: false, reason: 'onesignal_login_failed' };
    }

    if (!loginResult.associated) {
      return { success: false, reason: 'external_id_not_associated' };
    }

    if (
      !loginResult.optedIn ||
      !loginResult.subscriptionId ||
      !loginResult.fcmToken
    ) {
      return { success: false, reason: 'subscription_missing_after_login' };
    }

    // 5) Welcome API only after association + token are confirmed
    const response = await welcome_notification();
    if (response?.success === false) {
      return {
        success: false,
        reason: 'welcome_api_failed',
        response,
      };
    }

    return { success: true, response };
  } catch (error: any) {
    return {
      success: false,
      reason: error?.message ?? 'welcome_flow_error',
    };
  }
};

/**
 * Logout OneSignal user.
 */
export const logoutOneSignalUser = () => {
  try {
    OneSignal.logout();
  } catch {
    // ignore
  }
};

/**
 * Debug helper.
 */
export const printCurrentPushData = async () => {
  return getOneSignalPushData();
};
