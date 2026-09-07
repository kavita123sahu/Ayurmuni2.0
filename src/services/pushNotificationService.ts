import { OneSignal, LogLevel } from 'react-native-onesignal';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { apiClient } from './APIconfig';

const ONE_SIGNAL_APP_ID =
  '3e543921-8737-4c95-92ae-1578d40d99f0';

let initialized = false;

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });

const HeadsUpNative = NativeModules.HeadsUpNotification as
  | {
      show?: (payload: { title?: string; message?: string }) => void;
      ensureChannels?: () => void;
    }
  | undefined;

/** WhatsApp-style system tray / heads-up banner (Android). */
export const showDeviceHeadsUpNotification = (payload: {
  title?: string;
  message?: string;
}) => {
  try {
    if (Platform.OS === 'android' && HeadsUpNative?.show) {
      HeadsUpNative.show({
        title: payload.title || 'Ayurmuni',
        message: payload.message || 'You have a new notification',
      });
    }
  } catch {
    // ignore native failures
  }
};

export const ensureHeadsUpChannels = () => {
  try {
    if (Platform.OS === 'android' && HeadsUpNative?.ensureChannels) {
      HeadsUpNative.ensureChannels();
    }
  } catch {
    // ignore
  }
};

export type OneSignalPushReady = {
  subscriptionId: string;
  fcmToken: string;
  optedIn: boolean;
};

/**
 * Initialize OneSignal once. Does not request OS permission.
 */
export const initializeOneSignal = async () => {
  try {
    if (initialized) {
      return;
    }

    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(ONE_SIGNAL_APP_ID);
    initialized = true;
    ensureHeadsUpChannels();
  } catch {
    // ignore init errors — callers retry via wait helpers
  }
};

/**
 * Request OS notification permission (OTP / Settings only — not app start).
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
      ensureHeadsUpChannels();
    }

    return Boolean(granted);
  } catch {
    return false;
  }
};

/**
 * Ensure permission + opt-in. Call only after OTP / Settings — never on cold start.
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
    ensureHeadsUpChannels();
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

    const readyAfterLogin =
      (await waitForPushSubscriptionReady({
        timeoutMs: 25_000,
        intervalMs: 600,
      })) ?? readyBeforeLogin;

    try {
      OneSignal.User.pushSubscription.optIn();
    } catch {
      // ignore
    }

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
 * Full welcome-push pipeline for newly created customers.
 *
 * Timing (critical):
 * 1) permission + OneSignal.login + local subscription ready
 * 2) HARD setTimeout ≥4s after that (OneSignal cloud still "Unsubscribed" before this)
 * 3) only then POST notifications/push/welcome/
 * 4) if backend still says unsubscribed → wait another 4s and retry once
 */
export const completeWelcomePushFlow = async (
  userId: string | number,
): Promise<{
  success: boolean;
  reason?: string;
  response?: any;
}> => {
  const WELCOME_SETTLE_MS = 4_000;

  try {
    await initializeOneSignal();

    const permissionOk = await ensureDeviceNotificationsEnabled();
    if (!permissionOk) {
      return { success: false, reason: 'permission_denied' };
    }

    const loginResult = await loginOneSignalUser(userId);
    if (!loginResult) {
      return { success: false, reason: 'onesignal_login_failed' };
    }

    if (!loginResult.associated) {
      return { success: false, reason: 'external_id_not_associated' };
    }

    // Force opt-in again — login can briefly leave push as Unsubscribed.
    try {
      OneSignal.User.pushSubscription.optIn();
    } catch {
      // ignore
    }

    // Confirm local SDK has subscription + token BEFORE the settle clock.
    const readyBeforeSettle = await waitForPushSubscriptionReady({
      timeoutMs: 45_000,
      intervalMs: 500,
    });

    if (
      !readyBeforeSettle?.optedIn ||
      !readyBeforeSettle.subscriptionId ||
      !readyBeforeSettle.fcmToken
    ) {
      const latest = await getOneSignalPushData();
      console.log('⚠️ [WelcomePush] Not ready before settle:', latest);
      return {
        success: false,
        reason: latest.optedIn
          ? 'subscription_missing_before_settle'
          : 'still_unsubscribed_before_settle',
      };
    }

    // HARD wait — do not call welcome API until this finishes.
    // Backend OneSignal lookup stays "Unsubscribed" if we hit too early.
    const settleStartedAt = Date.now();
    console.log(
      `⏳ [WelcomePush] Subscription ready locally. Hard wait ${WELCOME_SETTLE_MS}ms before welcome API...`,
      {
        subscriptionId: readyBeforeSettle.subscriptionId,
        startedAt: settleStartedAt,
      },
    );
    await wait(WELCOME_SETTLE_MS);
    console.log('⏳ [WelcomePush] Settle finished', {
      waitedMs: Date.now() - settleStartedAt,
      minRequiredMs: WELCOME_SETTLE_MS,
    });

    const settled = await getOneSignalPushData();
    if (!settled.optedIn || !settled.subscriptionId || !settled.fcmToken) {
      console.log('⚠️ [WelcomePush] Lost subscription after settle:', settled);
      return {
        success: false,
        reason: settled.optedIn
          ? 'subscription_missing_after_settle'
          : 'still_unsubscribed_after_settle',
      };
    }

    const callWelcome = async () => {
      console.log('🟢 [WelcomePush] Calling welcome API (after ≥4s settle)', {
        subscriptionId: settled.subscriptionId,
        waitedMs: Date.now() - settleStartedAt,
      });
      return welcome_notification();
    };

    let response = await callWelcome();

    const looksUnsubscribed = (res: any) => {
      const msg = String(
        res?.message ?? res?.data?.message ?? res?.error ?? '',
      ).toLowerCase();
      return (
        msg.includes('unsubscrib') ||
        msg.includes('not subscrib') ||
        msg.includes('no subscription') ||
        msg.includes('subscription')
      );
    };

    // Backend may still lag — one more hard 4s + retry.
    if (response?.success === false && looksUnsubscribed(response)) {
      console.log(
        '⏳ [WelcomePush] Backend still unsubscribed — waiting another 4s then retry...',
      );
      await wait(WELCOME_SETTLE_MS);
      try {
        OneSignal.User.pushSubscription.optIn();
      } catch {
        // ignore
      }
      response = await callWelcome();
    }

    if (response?.success === false) {
      console.log('❌ [WelcomePush] welcome API failed:', response);
      return {
        success: false,
        reason: 'welcome_api_failed',
        response,
      };
    }

    console.log('🎉 [WelcomePush] Welcome API success', response);
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
