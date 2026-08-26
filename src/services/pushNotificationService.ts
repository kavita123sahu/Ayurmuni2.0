// import { OneSignal, LogLevel } from 'react-native-onesignal';

// const ONE_SIGNAL_APP_ID = '3e543921-8737-4c95-92ae-1578d40d99f0';

// let isInitialized = false;

// /**
//  * Initialize OneSignal
//  */
// export const initializeOneSignal = async () => {
//   try {
//     console.log('====================================');
//     console.log('🔵 OneSignal initialization started');
//     console.log('====================================');

//     if (isInitialized) {
//       console.log('⚠️ OneSignal already initialized');
//       return;
//     }

//     /**
//      * Enable logs while integrating.
//      * Remove/reduce this in production.
//      */
//     OneSignal.Debug.setLogLevel(LogLevel.Verbose);

//     /**
//      * IMPORTANT:
//      * Use your REAL OneSignal App ID here.
//      */
//     console.log('🔵 OneSignal App ID:', ONE_SIGNAL_APP_ID);

//     OneSignal.initialize(ONE_SIGNAL_APP_ID);

//     isInitialized = true;

//     console.log('✅ OneSignal.initialize() completed');

//     /**
//      * Listen for subscription changes.
//      *
//      * This is important because FCM token / subscription ID
//      * may not be available immediately.
//      */
//     OneSignal.User.pushSubscription.addEventListener(
//       'change',
//       async event => {
//         console.log('====================================');
//         console.log('🟢 OneSignal subscription changed');
//         console.log('====================================');

//         console.log('Subscription event:', event);

//         try {
//           const subscriptionId =
//             await OneSignal.User.pushSubscription.getIdAsync();

//           const token =
//             await OneSignal.User.pushSubscription.getTokenAsync();

//           const optedIn =
//             await OneSignal.User.pushSubscription.getOptedInAsync();

//           console.log('🆔 Subscription ID:', subscriptionId);
//           console.log('🔥 FCM/APNS Token:', token);
//           console.log('🔔 Opted In:', optedIn);
//         } catch (error) {
//           console.log(
//             '❌ Error reading subscription after change:',
//             error,
//           );
//         }
//       },
//     );

//     /**
//      * Ask notification permission.
//      */
//     const permission =
//       await OneSignal.Notifications.requestPermission(true);

//     console.log('🔔 Notification permission:', permission);

//     /**
//      * Read current subscription.
//      *
//      * It can still be null here if OneSignal hasn't
//      * finished registering the device.
//      */
//     await printCurrentSubscription();

//     console.log('====================================');
//     console.log('✅ OneSignal initialization finished');
//     console.log('====================================');
//   } catch (error) {
//     console.log('====================================');
//     console.log('❌ OneSignal initialization ERROR');
//     console.log(error);
//     console.log('====================================');
//   }
// };

// /**
//  * Get current OneSignal subscription information.
//  */
// export const getOneSignalPushData = async () => {
//   try {
//     console.log('====================================');
//     console.log('🔵 Getting OneSignal push data');
//     console.log('====================================');

//     const subscriptionId =
//       await OneSignal.User.pushSubscription.getIdAsync();

//     const token =
//       await OneSignal.User.pushSubscription.getTokenAsync();

//     const optedIn =
//       await OneSignal.User.pushSubscription.getOptedInAsync();

//     console.log('🆔 OneSignal Subscription ID:', subscriptionId);
//     console.log('🔥 FCM/APNS Token:', token);
//     console.log('🔔 Opted In:', optedIn);

//     return {
//       subscriptionId: subscriptionId || null,
//       fcmToken: token || null,
//       optedIn,
//     };
//   } catch (error) {
//     console.log('❌ Get OneSignal push data error:', error);

//     return {
//       subscriptionId: null,
//       fcmToken: null,
//       optedIn: false,
//     };
//   }
// };

// /**
//  * Print current subscription for debugging.
//  */
// export const printCurrentSubscription = async () => {
//   try {
//     const data = await getOneSignalPushData();

//     console.log('====================================');
//     console.log('📱 CURRENT ONESIGNAL DATA');
//     console.log('====================================');
//     console.log('Subscription ID:', data.subscriptionId);
//     console.log('FCM/APNS Token:', data.fcmToken);
//     console.log('Opted In:', data.optedIn);
//     console.log('====================================');

//     return data;
//   } catch (error) {
//     console.log('❌ printCurrentSubscription error:', error);
//     return null;
//   }
// };

// /**
//  * Associate OneSignal subscription with your backend user.
//  *
//  * IMPORTANT:
//  * userId should come from your backend after successful login.
//  */
// export const loginOneSignalUser = async (
//   userId: string | number,
// ) => {
//   try {
//     const externalId = String(userId);

//     console.log('====================================');
//     console.log('🔵 OneSignal user login');
//     console.log('External ID:', externalId);
//     console.log('====================================');

//     OneSignal.login(externalId);

//     console.log(
//       '✅ OneSignal.login() called successfully',
//     );

//     /**
//      * Give OneSignal a moment to associate the user,
//      * then read the subscription again.
//      */
//     await new Promise(resolve => setTimeout(resolve, 500));

//     const pushData = await getOneSignalPushData();

//     console.log('After OneSignal.login():');
//     console.log('External ID:', externalId);
//     console.log('Subscription ID:', pushData.subscriptionId);
//     console.log('Token:', pushData.fcmToken);

//     return {
//       externalId,
//       ...pushData,
//     };
//   } catch (error) {
//     console.log('❌ OneSignal user login error:', error);

//     return {
//       externalId: null,
//       subscriptionId: null,
//       fcmToken: null,
//       optedIn: false,
//     };
//   }
// };

// /**
//  * Logout OneSignal user.
//  */
// export const logoutOneSignalUser = () => {
//   try {
//     console.log('🔵 OneSignal logout');

//     OneSignal.logout();

//     console.log('✅ OneSignal logout successful');
//   } catch (error) {
//     console.log('❌ OneSignal logout error:', error);
//   }
// };

// const wait = (ms: number) =>
//   new Promise(resolve => setTimeout(resolve, ms));

// /**
//  * Wait for the latest FCM token + subscription, then return login API fields.
//  */
// export const getLatestPushLoginPayload = async (): Promise<{
//   fcm_token?: string;
//   onesignal_subscription_id?: string;
// }> => {
//   await initializeOneSignal();

//   let latest = await getOneSignalPushData();

//   for (let attempt = 0; attempt < 8 && !latest.fcmToken; attempt += 1) {
//     await wait(400);
//     latest = await getOneSignalPushData();
//   }

//   console.log('====================================');
//   console.log('📤 Login API push payload');
//   console.log('fcm_token:', latest.fcmToken);
//   console.log('onesignal_subscription_id:', latest.subscriptionId);
//   console.log('====================================');

//   return {
//     ...(latest.fcmToken ? { fcm_token: latest.fcmToken } : {}),
//     ...(latest.subscriptionId
//       ? { onesignal_subscription_id: latest.subscriptionId }
//       : {}),
//   };
// };


import { OneSignal, LogLevel } from 'react-native-onesignal';
import { apiClient } from './APIconfig';

const ONE_SIGNAL_APP_ID =
  '3e543921-8737-4c95-92ae-1578d40d99f0';

let initialized = false;

/**
 * Initialize OneSignal
 * Call this once when the application starts.
 */
export const initializeOneSignal = async () => {
  try {
    console.log('====================================');
    console.log('🔵 OneSignal initialization started');
    console.log('====================================');

    if (initialized) {
      console.log('⚠️ OneSignal already initialized');
      return;
    }

    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    console.log(
      '🔵 OneSignal App ID:',
      ONE_SIGNAL_APP_ID,
    );

    OneSignal.initialize(ONE_SIGNAL_APP_ID);

    initialized = true;

    console.log(
      '✅ OneSignal.initialize() completed',
    );

    /**
     * IMPORTANT
     *
     * FCM token may not be available immediately.
     *
     * This listener waits for OneSignal subscription
     * changes and gets the token when it becomes available.
     */
    OneSignal.User.pushSubscription.addEventListener(
      'change',
      async event => {
        console.log('====================================');
        console.log('🟢 OneSignal subscription changed');
        console.log('====================================');

        console.log('Subscription event:', event);

        try {
          const subscriptionId =
            await OneSignal.User.pushSubscription.getIdAsync();

          const fcmToken =
            await OneSignal.User.pushSubscription.getTokenAsync();

          const optedIn =
            await OneSignal.User.pushSubscription.getOptedInAsync();

          console.log(
            '🆔 Subscription ID:',
            subscriptionId,
          );

          console.log(
            '🔥 FCM Token:',
            fcmToken,
          );

          console.log(
            '🔔 Opted In:',
            optedIn,
          );

          /**
           * Do NOT call Login API here.
           *
           * Login is already handled separately.
           *
           * We only monitor the push subscription here.
           */
        } catch (error) {
          console.log(
            '❌ Error reading OneSignal subscription:',
            error,
          );
        }
      },
    );

    /**
     * Do not request system permission here.
     * Register flow shows a themed prompt, then calls requestNotificationPermission().
     */
    await printCurrentPushData();

    console.log('====================================');
    console.log('✅ OneSignal initialization finished');
    console.log('====================================');
  } catch (error) {
    console.log(
      '❌ OneSignal initialization error:',
      error,
    );
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

    const granted = await OneSignal.Notifications.requestPermission(
      fallbackToSettings,
    );

    console.log('🔔 Notification permission result:', granted);
    return Boolean(granted);
  } catch (error) {
    console.log('❌ Notification permission request error:', error);
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

    console.log('====================================');
    console.log('📱 OneSignal Push Data');
    console.log('====================================');

    console.log(
      '🆔 Subscription ID:',
      subscriptionId,
    );

    console.log(
      '🔥 FCM Token:',
      fcmToken,
    );

    console.log(
      '🔔 Opted In:',
      optedIn,
    );

    console.log('====================================');

    return {
      subscriptionId: subscriptionId || null,
      fcmToken: fcmToken || null,
      optedIn,
    };
  } catch (error) {
    console.log(
      '❌ Get OneSignal push data error:',
      error,
    );

    return {
      subscriptionId: null,
      fcmToken: null,
      optedIn: false,
    };
  }
};

/**
 * Connect your backend user with OneSignal.
 *
 * Your backend user_id becomes the OneSignal External ID.
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
      console.log(
        '❌ Cannot OneSignal.login(): userId missing',
      );

      return null;
    }

    const externalId = String(userId);

    console.log('====================================');
    console.log('🔵 OneSignal User Login');
    console.log('====================================');

    console.log(
      '👤 Backend User ID:',
      userId,
    );

    console.log(
      '🆔 OneSignal External ID:',
      externalId,
    );

    OneSignal.login(externalId);

    console.log(
      '✅ OneSignal.login() completed',
    );

    /**
     * Small delay to allow association.
     */
    // await new Promise(resolve =>
    //   setTimeout(resolve, 500),
    // );

    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), 500);
    });
    const pushData =
      await getOneSignalPushData();

    console.log(
      '📱 Push data after OneSignal login:',
      pushData,
    );

    return {
      externalId,
      subscriptionId:
        pushData.subscriptionId,
      fcmToken:
        pushData.fcmToken,
      optedIn:
        pushData.optedIn,
    };
  } catch (error) {
    console.log(
      '❌ OneSignal user login error:',
      error,
    );

    return null;
  }
};

/**
 * Logout OneSignal user.
 */
export const logoutOneSignalUser = () => {
  try {
    OneSignal.logout();

    console.log(
      '✅ OneSignal logout successful',
    );
  } catch (error) {
    console.log(
      '❌ OneSignal logout error:',
      error,
    );
  }
};

/**
 * Debug helper.
 */
export const printCurrentPushData = async () => {
  const data =
    await getOneSignalPushData();

  console.log('====================================');
  console.log('📱 CURRENT ONESIGNAL DATA');
  console.log('====================================');

  console.log(
    'Subscription ID:',
    data.subscriptionId,
  );

  console.log(
    'FCM Token:',
    data.fcmToken,
  );

  console.log(
    'Opted In:',
    data.optedIn,
  );

  console.log('====================================');

  return data;
};


export const welcome_notification = async () => {
  try {
    const response = await apiClient(
      'notifications/push/welcome/',
      {
        method: 'POST',
      },
      true, // Bearer token/auth enabled
    );

    console.log('Welcome notification response:', response);

    return response;
  } catch (error) {
    throw error;
  }
};
