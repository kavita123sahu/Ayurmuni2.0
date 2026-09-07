import { NativeModules, Platform } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import type { CustomNotificationRef, NotificationData } from '../components/CustomNotification';
import { handleNotificationNavigation } from '../screens/notifications/notificationRouter';
import { navigationRef } from '../navigation/navigationRef';

let notificationRef: CustomNotificationRef | null = null;
let listenersAttached = false;

export const registerInAppNotificationRef = (
  ref: CustomNotificationRef | null,
) => {
  notificationRef = ref;
};

const showDeviceHeadsUp = (title?: string, message?: string) => {
  if (Platform.OS !== 'android') {
    return;
  }
  NativeModules.HeadsUpNotification?.show({
    title: title || 'Ayurmuni',
    message: message || 'You have a new notification',
  });
};

export const showInAppNotification = (data: NotificationData) => {
  const payload = normalizeNotificationPayload(data);
  notificationRef?.show(payload);
  showDeviceHeadsUp(payload.title, payload.message);
};

const normalizeNotificationPayload = (
  raw: NotificationData,
): NotificationData => {
  const type = String(
    raw?.type ??
    raw?.notification_type ??
    raw?.event_type ??
    '',
  ).toUpperCase();

  return {
    ...raw,
    type: type || raw?.type,
    appointment_id:
      raw?.appointment_id ??
      raw?.appointmentId ??
      raw?.data?.appointment_id,
    order_id: raw?.order_id ?? raw?.orderId ?? raw?.data?.order_id,
    product_id: raw?.product_id ?? raw?.productId ?? raw?.data?.product_id,
    doctor_id: raw?.doctor_id ?? raw?.doctorId ?? raw?.data?.doctor_id,
  };
};

const mapOneSignalPayload = (notification: any): NotificationData => {
  const additional =
    (notification?.additionalData as Record<string, any>) ??
    (notification?.additional_data as Record<string, any>) ??
    {};

  return normalizeNotificationPayload({
    title: notification?.title ?? 'Ayurmuni',
    message:
      notification?.body ??
      notification?.message ??
      additional?.message ??
      additional?.body ??
      '',
    image: notification?.bigPicture ?? additional?.image,
    ...additional,
  });
};

export const setupOneSignalInAppListeners = () => {
  if (listenersAttached) {
    return;
  }
  listenersAttached = true;

  OneSignal.Notifications.addEventListener(
    'foregroundWillDisplay',
    event => {
      // Do not preventDefault — Android shows the system heads-up popup.
      const payload = mapOneSignalPayload(event.getNotification());
      notificationRef?.show(payload);
    },
  );

  OneSignal.Notifications.addEventListener('click', event => {
    const payload = mapOneSignalPayload(event.notification);
    if (navigationRef.isReady()) {
      handleNotificationNavigation(navigationRef, payload);
    }
  });
};
