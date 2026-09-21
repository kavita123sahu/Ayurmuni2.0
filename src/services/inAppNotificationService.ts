import { OneSignal, NotificationWillDisplayEvent } from 'react-native-onesignal';
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

export const showInAppNotification = (data: NotificationData) => {
  const payload = normalizeNotificationPayload(data);
  // In-app banner only — never also post a native HeadsUp (that doubles OS banners).
  notificationRef?.show(payload);
};

export const normalizeNotificationPayload = (
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
    prescription_id:
      raw?.prescription_id ??
      raw?.prescriptionId ??
      raw?.data?.prescription_id,
    diet_id: raw?.diet_id ?? raw?.dietId ?? raw?.data?.diet_id,
    medicine_id: raw?.medicine_id ?? raw?.medicineId ?? raw?.data?.medicine_id,
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
    (event: NotificationWillDisplayEvent) => {
      const notification = event.getNotification();

      // OneSignal already posts the system tray / heads-up once.
      // Do NOT also call HeadsUpNotification.show or CustomNotification —
      // that was causing 2 banners for 1 delivered push.
      notification.display();
    },
  );

  OneSignal.Notifications.addEventListener('click', (event: any) => {
    const payload = mapOneSignalPayload(event.notification);
    // Always hand off — router queues if nav is not ready yet
    handleNotificationNavigation(navigationRef, payload);
  });
};
