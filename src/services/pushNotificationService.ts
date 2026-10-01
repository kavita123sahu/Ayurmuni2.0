import { OneSignal, LogLevel } from 'react-native-onesignal';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { apiClient } from './APIconfig';

// const ONE_SIGNAL_APP_ID =
//   '3e543921-8737-4c95-92ae-1578d40d99f0';


const ONE_SIGNAL_APP_ID =
  '5c79696d-81e8-46a7-922d-b0b08eef4e57';

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

    console.log(
      '[OneSignal] Initializing with App ID:',
      ONE_SIGNAL_APP_ID,
    );

    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    OneSignal.initialize(ONE_SIGNAL_APP_ID);

    initialized = true;

    console.log(
      '[OneSignal] SDK initialized successfully',
    );

    ensureHeadsUpChannels();
  } catch (error) {
    console.error(
      '[OneSignal] SDK initialization FAILED:',
      error,
    );

    initialized = false;
    throw error;
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
        console.log(
          '[OneSignal] Calling pushSubscription.optIn()',
        );

        OneSignal.User.pushSubscription.optIn();

        console.log(
          '[OneSignal] pushSubscription.optIn() called',
        );
      } catch (error) {
        console.error(
          '[OneSignal] optIn failed:',
          error,
        );

        return false;
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
export const ensureDeviceNotificationsEnabled =
  async (): Promise<boolean> => {
    try {
      await initializeOneSignal();

      // Android 13+
      if (
        Platform.OS === 'android' &&
        Platform.Version >= 33
      ) {
        const status =
          await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );

        console.log(
          '[OneSignal] Android notification permission:',
          status,
        );

        if (!status) {
          const result =
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );

          console.log(
            '[OneSignal] Permission request result:',
            result,
          );

          if (
            result !==
            PermissionsAndroid.RESULTS.GRANTED
          ) {
            return false;
          }
        }
      }

      const permission =
        await OneSignal.Notifications.getPermissionAsync();

      console.log(
        '[OneSignal] OneSignal notification permission:',
        permission,
      );

      if (!permission) {
        return requestNotificationPermission(false);
      }

      // Explicitly opt-in to push subscription
      console.log(
        '[OneSignal] Calling pushSubscription.optIn()',
      );

      OneSignal.User.pushSubscription.optIn();

      ensureHeadsUpChannels();

      // Give SDK a little time to create/update subscription
      await wait(1500);

      const pushData =
        await getOneSignalPushData();

      console.log(
        '[OneSignal] Subscription after optIn:',
        {
          subscriptionId:
            pushData.subscriptionId,
          optedIn:
            pushData.optedIn,
          hasFcmToken:
            Boolean(pushData.fcmToken),
        },
      );

      return Boolean(
        pushData.optedIn &&
        pushData.subscriptionId &&
        pushData.fcmToken,
      );
    } catch (error) {
      console.error(
        '[OneSignal] ensureDeviceNotificationsEnabled FAILED:',
        error,
      );

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
    console.log(
      '[OneSignal] Calling pushSubscription.optIn()',
    );

    OneSignal.User.pushSubscription.optIn();

    console.log(
      '[OneSignal] pushSubscription.optIn() called',
    );
  } catch (error) {
    console.error(
      '[OneSignal] optIn failed:',
      error,
    );

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
) => {
  try {
    if (
      userId === undefined ||
      userId === null ||
      userId === ''
    ) {
      console.warn(
        '[OneSignal] Invalid userId',
        userId,
      );

      return null;
    }

    // =========================================================
    // 1. Initialize OneSignal
    // =========================================================

    await initializeOneSignal();

    const externalId = String(userId);

    console.log(
      '[OneSignal] Preparing login for External ID:',
      externalId,
    );

    // =========================================================
    // 2. Make sure device has a push subscription
    // =========================================================

    const subscription =
      await waitForPushSubscriptionReady({
        timeoutMs: 45_000,
        intervalMs: 600,
      });

    console.log(
      '[OneSignal] Subscription before login:',
      subscription,
    );

    if (!subscription) {
      console.warn(
        '[OneSignal] Push subscription not ready before login',
      );

      return null;
    }

    // =========================================================
    // 3. ONE AND ONLY ONE OneSignal.login()
    // =========================================================

    console.log(
      '[OneSignal] >>> OneSignal.login() ONCE:',
      externalId,
    );

    OneSignal.login(externalId);

    // =========================================================
    // 4. Wait until External ID association is visible
    // =========================================================

    const associated =
      await waitForExternalIdAssociation(
        externalId,
        {
          timeoutMs: 20_000,
          intervalMs: 500,
        },
      );

    console.log(
      '[OneSignal] External ID associated:',
      associated,
    );

    if (!associated) {
      console.warn(
        '[OneSignal] External ID association failed',
      );

      return null;
    }

    // =========================================================
    // 5. Read final local subscription state
    // =========================================================

    const finalSubscription =
      await getOneSignalPushData();

    console.log(
      '[OneSignal] Final subscription:',
      finalSubscription,
    );

    if (
      !finalSubscription?.subscriptionId ||
      !finalSubscription?.fcmToken ||
      !finalSubscription?.optedIn
    ) {
      console.warn(
        '[OneSignal] Final subscription is incomplete',
        finalSubscription,
      );

      return null;
    }

    // =========================================================
    // 6. Return success
    // =========================================================

    return {
      externalId,
      subscriptionId:
        finalSubscription.subscriptionId,
      fcmToken:
        finalSubscription.fcmToken,
      optedIn:
        finalSubscription.optedIn,
      associated: true,
    };

  } catch (error) {
    console.error(
      '[OneSignal] loginOneSignalUser failed:',
      error,
    );

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
) => {
  try {
    console.log('[WelcomePush] START:', userId);

    // 1. Notification permission + local subscription
    const notificationReady =
      await ensureDeviceNotificationsEnabled();

    console.log(
      '[WelcomePush] Notification ready:',
      notificationReady,
    );

    if (!notificationReady) {
      console.warn(
        '[WelcomePush] Device notification subscription is NOT ready',
      );

      return {
        success: false,
        reason: 'notification_not_ready',
      };
    }

    // 2. OneSignal.login() ONLY ONCE
    console.log(
      '[WelcomePush] Calling OneSignal.login ONCE:',
      String(userId),
    );

    const loginResult =
      await loginOneSignalUser(userId);

    if (!loginResult) {
      console.warn(
        '[WelcomePush] OneSignal login/association failed',
      );

      return {
        success: false,
        reason: 'onesignal_login_failed',
      };
    }

    console.log(
      '[WelcomePush] OneSignal login successful:',
      loginResult,
    );

    // 3. Give OneSignal cloud sync 5 seconds
    // console.log(
    //   '[WelcomePush] Waiting 5000ms for OneSignal cloud sync...',
    // );

    await new Promise<void>(resolve =>
      setTimeout(resolve, 5000),
    );

    // 4. Check final subscription state
    const status =
      await getPushAssociationStatus(userId);

    console.log(
      '[WelcomePush] STATUS BEFORE welcome API:',
      status,
    );

    // 5. DO NOT call API until subscription is ready
    if (!status.readyForWelcome) {
      console.warn(
        '[WelcomePush] Subscription is not ready. Welcome API will NOT be called.',
        status,
      );

      return {
        success: false,
        reason: 'subscription_not_ready',
        status,
      };
    }

    // 6. Now call welcome API
    console.log(
      '[WelcomePush] Calling welcome API...',
    );

    const response =
      await welcome_notification();

    console.log(
      '[WelcomePush] welcome API response:',
      response,
    );

    return {
      ...response,
      statusBefore: status,
    };

  } catch (error: any) {
    console.error(
      '[WelcomePush] Flow failed:',
      error,
    );

    return {
      success: false,
      reason: 'exception',
      error,
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
