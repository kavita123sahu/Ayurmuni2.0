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

/** Full local status: subscription + External ID (what backend needs). */
export const getPushAssociationStatus = async (userId?: string | number) => {
  const push = await getOneSignalPushData();
  let externalId: string | null = null;
  try {
    externalId = (await OneSignal.User.getExternalId()) || null;
  } catch {
    externalId = null;
  }

  const expected = userId != null && userId !== '' ? String(userId) : null;
  const associated = Boolean(
    expected && externalId && String(externalId) === expected,
  );
  const subscribedLocally = isPushReady(push);

  return {
    ...push,
    externalId,
    expectedUserId: expected,
    associated,
    subscribedLocally,
    /** Local SDK ready AND External ID linked to this user */
    readyForWelcome: subscribedLocally && associated,
  };
};

const welcomeNeedsRetry = (res: any) => {
  const msg = String(
    res?.message ?? res?.data?.message ?? res?.error ?? '',
  ).toLowerCase();
  return (
    msg.includes('unsubscrib') ||
    msg.includes('not subscrib') ||
    msg.includes('no subscription') ||
    msg.includes('onesignal.login') ||
    msg.includes('ensure the device is subscribed') ||
    msg.includes('not delivered')
  );
};

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
 * Full welcome-push pipeline.
 *
 * Backend error said: subscribe via OneSignal.login(user_id).
 * Local subscriptionId alone is NOT enough — we require:
 *   optedIn + subscriptionId + token + External ID === userId
 * Status is logged BEFORE and AFTER the welcome API.
 */
export const completeWelcomePushFlow = async (
  userId: string | number,
): Promise<{
  success: boolean;
  reason?: string;
  response?: any;
  statusBefore?: any;
  statusAfter?: any;
}> => {
  // Cloud lag after login() — REST often still misses the user at 4s.
  const WELCOME_SETTLE_MS = 8_000;

  const logStatus = async (label: string) => {
    const status = await getPushAssociationStatus(userId);
    console.log(`🔎 [WelcomePush] STATUS ${label}`, {
      optedIn: status.optedIn,
      subscriptionId: status.subscriptionId,
      hasToken: Boolean(status.fcmToken),
      externalId: status.externalId,
      expectedUserId: status.expectedUserId,
      associated: status.associated,
      subscribedLocally: status.subscribedLocally,
      readyForWelcome: status.readyForWelcome,
    });
    return status;
  };

  try {
    await initializeOneSignal();

    const permissionOk = await ensureDeviceNotificationsEnabled();
    if (!permissionOk) {
      return { success: false, reason: 'permission_denied' };
    }

    const loginResult = await loginOneSignalUser(userId);
    if (!loginResult) {
      await logStatus('login failed');
      return { success: false, reason: 'onesignal_login_failed' };
    }
    if (!loginResult.associated) {
      await logStatus('external id not associated');
      return { success: false, reason: 'external_id_not_associated' };
    }

    try {
      OneSignal.User.pushSubscription.optIn();
    } catch {
      // ignore
    }

    const readyBeforeSettle = await waitForPushSubscriptionReady({
      timeoutMs: 45_000,
      intervalMs: 500,
    });
    if (!readyBeforeSettle) {
      await logStatus('not subscribed before settle');
      return { success: false, reason: 'still_unsubscribed_before_settle' };
    }

    console.log(
      `⏳ [WelcomePush] Local OK (sub + External ID). Settle ${WELCOME_SETTLE_MS}ms for cloud...`,
      {
        subscriptionId: readyBeforeSettle.subscriptionId,
        externalId: loginResult.externalId,
      },
    );
    await wait(WELCOME_SETTLE_MS);

    // Re-assert login after settle — association can drop briefly
    OneSignal.login(String(userId));
    const stillAssociated = await waitForExternalIdAssociation(userId, {
      timeoutMs: 15_000,
      intervalMs: 500,
    });
    if (!stillAssociated) {
      await logStatus('lost external id after settle');
      return { success: false, reason: 'external_id_lost_after_settle' };
    }

    const statusBefore = await logStatus('BEFORE welcome API');
    if (!statusBefore.readyForWelcome) {
      console.log(
        '🔕 [WelcomePush] Skip API — need subscribe + OneSignal.login(user_id)',
      );
      return {
        success: false,
        reason: statusBefore.associated
          ? 'subscription_incomplete_before_api'
          : 'external_id_missing_before_api',
        statusBefore,
      };
    }

    const callWelcome = async () => {
      const gate = await getPushAssociationStatus(userId);
      if (!gate.readyForWelcome) {
        console.log('🔕 [WelcomePush] Abort API — gate failed', {
          associated: gate.associated,
          subscribedLocally: gate.subscribedLocally,
          subscriptionId: gate.subscriptionId,
          externalId: gate.externalId,
        });
        return {
          success: false,
          message: 'Device not subscribed / External ID missing',
          _aborted_not_ready: true,
        };
      }
      console.log('🟢 [WelcomePush] Calling welcome API', {
        subscriptionId: gate.subscriptionId,
        externalId: gate.externalId,
        associated: gate.associated,
        subscribedLocally: gate.subscribedLocally,
      });
      return welcome_notification();
    };

    let response = await callWelcome();
    let statusAfter = await logStatus('AFTER welcome API (1st)');

    if (response?._aborted_not_ready) {
      return {
        success: false,
        reason: 'not_ready_at_call_time',
        response,
        statusBefore,
        statusAfter,
      };
    }

    // Backend: "Ensure the device is subscribed via OneSignal.login(user_id)"
    if (response?.success === false && welcomeNeedsRetry(response)) {
      console.log(
        '⏳ [WelcomePush] Backend cannot find user — re-login + settle + retry...',
        response?.message,
      );

      OneSignal.login(String(userId));
      try {
        OneSignal.User.pushSubscription.optIn();
      } catch {
        // ignore
      }

      const reAssociated = await waitForExternalIdAssociation(userId, {
        timeoutMs: 20_000,
        intervalMs: 500,
      });
      const reReady = await waitForPushSubscriptionReady({
        timeoutMs: 20_000,
        intervalMs: 500,
      });

      if (!reAssociated || !reReady) {
        statusAfter = await logStatus('retry aborted — still not ready');
        return {
          success: false,
          reason: 'still_not_ready_on_retry',
          response,
          statusBefore,
          statusAfter,
        };
      }

      await wait(WELCOME_SETTLE_MS);
      OneSignal.login(String(userId));
      await waitForExternalIdAssociation(userId, {
        timeoutMs: 10_000,
        intervalMs: 400,
      });

      const statusBeforeRetry = await logStatus('BEFORE welcome API (retry)');
      if (!statusBeforeRetry.readyForWelcome) {
        return {
          success: false,
          reason: 'not_ready_before_retry_api',
          response,
          statusBefore: statusBeforeRetry,
        };
      }

      response = await callWelcome();
      statusAfter = await logStatus('AFTER welcome API (retry)');

      if (response?._aborted_not_ready) {
        return {
          success: false,
          reason: 'not_ready_at_retry_call_time',
          response,
          statusBefore: statusBeforeRetry,
          statusAfter,
        };
      }
    }

    if (response?.success === false) {
      console.log('❌ [WelcomePush] welcome API failed:', response);
      return {
        success: false,
        reason: 'welcome_api_failed',
        response,
        statusBefore,
        statusAfter,
      };
    }

    console.log('🎉 [WelcomePush] Welcome API success', response);
    return { success: true, response, statusBefore, statusAfter };
  } catch (error: any) {
    const statusAfter = await logStatus('after exception');
    return {
      success: false,
      reason: error?.message ?? 'welcome_flow_error',
      statusAfter,
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
