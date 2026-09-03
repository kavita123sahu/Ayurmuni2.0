import { OneSignal } from 'react-native-onesignal';
import type {
  NotificationClickEvent,
  NotificationWillDisplayEvent,
} from 'react-native-onesignal';
import {
  handleNotificationNavigation,
  refreshUnreadBadge,
} from '../screens/notifications/notificationRouter';
import { navigationRef } from '../navigation/navigationRef';

let listenersAttached = false;

export type PushNotificationData = {
  name?: string;
  headings?: string;
  contents?: string;
  title?: string;
  message?: string;
  route?: string;
  screen?: string;
  event?: string;
  type?: string;
  order_id?: string;
  order_status?: string;
  appointment_id?: string;
  product_id?: string;
  diet_id?: string;
  doctor_id?: string;
  [key: string]: any;
};

const pickLocalized = (value: any): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return String(value.en ?? value.EN ?? Object.values(value)[0] ?? '');
  }
  return String(value);
};

/**
 * Normalize OneSignal / template payload so navigation has
 * route, screen, event, order_status, headings, contents, etc.
 */
export const normalizeNotificationPayload = (
  raw: PushNotificationData,
): PushNotificationData => {
  const nested =
    (raw?.data && typeof raw.data === 'object' ? raw.data : {}) as Record<
      string,
      any
    >;

  const headings = pickLocalized(
    raw?.headings ?? nested?.headings ?? raw?.title,
  );
  const contents = pickLocalized(
    raw?.contents ?? nested?.contents ?? raw?.message ?? raw?.body,
  );

  const templateName = String(
    raw?.name ?? nested?.name ?? raw?.template ?? nested?.template ?? '',
  ).trim();

  return {
    ...nested,
    ...raw,
    name: templateName || 'Ayurmuni',
    headings: headings || 'New notification',
    contents: contents || 'Tap to open',
    title: headings || raw?.title,
    message: contents || raw?.message,
    route: String(
      raw?.route ?? nested?.route ?? raw?.screen ?? nested?.screen ?? '',
    ),
    screen: String(
      raw?.screen ?? nested?.screen ?? raw?.route ?? nested?.route ?? '',
    ),
    event: String(raw?.event ?? nested?.event ?? ''),
    type: String(
      raw?.type ??
        nested?.type ??
        raw?.notification_type ??
        nested?.notification_type ??
        '',
    ),
    order_id: raw?.order_id ?? nested?.order_id ?? raw?.orderId,
    order_status: raw?.order_status ?? nested?.order_status,
    appointment_id:
      raw?.appointment_id ?? nested?.appointment_id ?? raw?.appointmentId,
    product_id: raw?.product_id ?? nested?.product_id ?? raw?.productId,
    diet_id: raw?.diet_id ?? nested?.diet_id ?? raw?.dietId,
    doctor_id: raw?.doctor_id ?? nested?.doctor_id ?? raw?.doctorId,
  };
};

const mapOneSignalPayload = (notification: any): PushNotificationData => {
  const additional =
    (notification?.additionalData as Record<string, any>) ??
    (notification?.additional_data as Record<string, any>) ??
    {};

  return normalizeNotificationPayload({
    headings: notification?.title ?? additional?.headings,
    contents:
      notification?.body ??
      additional?.contents ??
      additional?.message ??
      additional?.body,
    title: notification?.title,
    message: notification?.body,
    ...additional,
  });
};

/**
 * Device-only push UI (Android/iOS system notification).
 * No custom in-app modal. Click still routes via template `data`.
 */
export const setupOneSignalInAppListeners = () => {
  if (listenersAttached) {
    return;
  }
  listenersAttached = true;

  OneSignal.Notifications.addEventListener(
    'foregroundWillDisplay',
    (event: NotificationWillDisplayEvent) => {
      // Show default device notification even while app is open.
      try {
        event.getNotification().display();
      } catch {
        // If display() fails, not calling preventDefault still shows it.
      }
      refreshUnreadBadge();
    },
  );

  OneSignal.Notifications.addEventListener(
    'click',
    (event: NotificationClickEvent) => {
    const payload = mapOneSignalPayload(event.notification);
    if (navigationRef.isReady()) {
      handleNotificationNavigation(navigationRef, payload);
    }
    refreshUnreadBadge();
  });
};

/** @deprecated Custom in-app modal removed — device notifications only. */
export const registerInAppNotificationRef = (_ref: unknown) => {};
export const showInAppNotification = (_data: PushNotificationData) => {};
