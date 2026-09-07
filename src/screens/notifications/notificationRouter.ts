import {
  fetchUnreadNotificationCount,
  publishUnreadCount,
} from '../../hooks/useNotification';
import { buildAppointmentDetailsParams } from '../../utils/appointmentUtils';
import { navigationRef } from '../../navigation/navigationRef';

type NavPayload = Record<string, any>;

let pendingPayload: NavPayload | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const normalizeKey = (value: any) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

const pickId = (...candidates: any[]): string | null => {
  for (const value of candidates) {
    if (value == null || value === '') continue;
    const id = String(value).trim();
    if (id) return id;
  }
  return null;
};

const goHomeStack = (navigation: any, screen: string, params?: object) => {
  navigation.navigate('HomeStack', {
    screen,
    params,
  });
};

/**
 * Navigate from OneSignal / in-app notification payloads.
 * Uses `route` (or `screen`) + entity ids so taps land on the exact order/appointment.
 */
export const handleNotificationNavigation = (
  navigation: any,
  data: NavPayload,
) => {
  const nav = navigation?.isReady ? navigation : navigationRef;
  if (!data) return;

  if (!nav?.isReady?.()) {
    pendingPayload = data;
    schedulePendingFlush();
    return;
  }

  const routeRaw = String(
    data?.route ?? data?.screen ?? data?.deep_link ?? data?.deeplink ?? '',
  ).trim();
  const routeKey = normalizeKey(routeRaw);
  const templateName = normalizeKey(data?.name ?? data?.template);
  const event = String(data?.event ?? data?.event_type ?? '').toLowerCase();
  const type = normalizeKey(data?.type ?? data?.notification_type);
  const orderStatus = String(data?.order_status ?? '').toLowerCase();

  const orderId = pickId(
    data?.order_id,
    data?.orderId,
    data?.order?.id,
    data?.id && (routeKey.includes('order') || type === 'order')
      ? data.id
      : null,
  );

  const appointmentId = pickId(
    data?.appointment_id,
    data?.appointmentId,
    data?.consultation_id,
    data?.consultationId,
    data?.appointment?.id,
    data?.appointment?.appointment_id,
    data?.appointment?.consultation_id,
  );

  const goHome = () => {
    goHomeStack(nav, 'TabStack', { screen: 'Home' });
  };

  const goOrderDetails = () => {
    if (!orderId) {
      goHomeStack(nav, 'OrderHistory');
      return;
    }
    goHomeStack(nav, 'OrderDetailsScreen', {
      order: {
        id: orderId,
        order_id: orderId,
        order_status: data?.order_status,
        order_code: data?.order_code ?? data?.orderCode,
      },
    });
  };

  const goAppointment = () => {
    if (!appointmentId) {
      goHomeStack(nav, 'Notifications');
      return;
    }
    const params = buildAppointmentDetailsParams({
      appointment_id: appointmentId,
      consultation_id:
        data?.consultation_id ?? data?.consultationId ?? appointmentId,
      id: appointmentId,
      rawData: data,
    });
    goHomeStack(nav, 'AppointmentDetails', params);
  };

  const goDiet = () => {
    goHomeStack(nav, 'DietScreen', {
      dietId: data?.diet_id ?? data?.dietId,
      planId: data?.plan_id ?? data?.planId ?? data?.diet_plan_id,
      item: data?.plan_id
        ? { id: String(data.plan_id) }
        : data?.diet_plan_id
          ? { id: String(data.diet_plan_id) }
          : undefined,
    });
  };

  const goChat = () => {
    if (!appointmentId) {
      goHomeStack(nav, 'Notifications');
      return;
    }
    goHomeStack(nav, 'ChatScreen', {
      appointmentId: String(appointmentId),
      role: 'patient',
      doctorName: data?.doctor_name ?? data?.doctorName ?? 'Doctor',
      patientName: data?.patient_name ?? data?.patientName ?? '',
    });
  };

  const goProduct = () => {
    const productId = pickId(
      data?.product_id,
      data?.productId,
      data?.variant_id,
      data?.varientID,
    );
    if (!productId) return;
    goHomeStack(nav, 'ProductDetails', { varientID: String(productId) });
  };

  const goMedicalReceipt = () => {
    goHomeStack(nav, 'MedicalReceipt', {
      appointment_id: appointmentId,
      consultation_id: data?.consultation_id ?? appointmentId,
      ...(data || {}),
    });
  };

  // 1) Explicit route / screen from push template (highest priority)
  if (routeKey) {
    if (
      routeKey === 'home' ||
      routeKey === 'homescreen' ||
      routeKey === 'tabstack' ||
      routeKey.includes('welcome')
    ) {
      goHome();
      return;
    }

    if (
      routeKey === 'orderdetailsscreen' ||
      routeKey === 'orderdetails' ||
      routeKey === 'orderdetail' ||
      routeKey === 'orderscreen' ||
      routeKey === 'order'
    ) {
      goOrderDetails();
      return;
    }

    if (
      routeKey === 'orderhistory' ||
      routeKey === 'orders' ||
      routeKey === 'myorders'
    ) {
      goHomeStack(nav, 'OrderHistory');
      return;
    }

    if (
      routeKey === 'appointmentdetails' ||
      routeKey === 'appointmentdetail' ||
      routeKey === 'appointment' ||
      routeKey === 'appointments' ||
      routeKey === 'consultation' ||
      routeKey === 'consult'
    ) {
      goAppointment();
      return;
    }

    if (
      routeKey === 'chatscreen' ||
      routeKey === 'chat' ||
      routeKey === 'message' ||
      routeKey === 'messages'
    ) {
      goChat();
      return;
    }

    if (
      routeKey === 'dietscreen' ||
      routeKey === 'diet' ||
      routeKey === 'dietplan' ||
      routeKey === 'dietplanscreen'
    ) {
      goDiet();
      return;
    }

    if (
      routeKey === 'productdetails' ||
      routeKey === 'product' ||
      routeKey === 'productdetail'
    ) {
      goProduct();
      return;
    }

    if (
      routeKey === 'medicalreceipt' ||
      routeKey === 'receipt' ||
      routeKey === 'prescription'
    ) {
      goMedicalReceipt();
      return;
    }

    if (routeKey === 'notifications' || routeKey === 'notificationscreen') {
      goHomeStack(nav, 'Notifications');
      return;
    }

    if (routeKey === 'rewards' || routeKey === 'mycoupons') {
      goHomeStack(nav, 'Rewards');
      return;
    }

    // Unknown named route — try as HomeStack screen if it looks like a screen name
    if (/^[a-z]+screen$/i.test(routeRaw) || /^[A-Z]/.test(routeRaw)) {
      try {
        goHomeStack(nav, routeRaw, {
          order_id: orderId,
          appointment_id: appointmentId,
          ...data,
        });
        return;
      } catch {
        // fall through
      }
    }
  }

  // 2) Template name hints
  if (templateName) {
    if (templateName === 'customerwelcome' || templateName.includes('welcome')) {
      goHome();
      return;
    }
    if (templateName.includes('order')) {
      goOrderDetails();
      return;
    }
    if (
      templateName.includes('appointment') ||
      templateName.includes('consult') ||
      templateName.includes('booking')
    ) {
      goAppointment();
      return;
    }
    if (templateName.includes('diet') || templateName.includes('water')) {
      goDiet();
      return;
    }
    if (templateName.includes('chat') || templateName.includes('message')) {
      goChat();
      return;
    }
  }

  // 3) Event / type / ids
  if (event === 'user.registered' || event.includes('welcome')) {
    goHome();
    return;
  }

  if (
    event.startsWith('order.') ||
    type === 'order' ||
    orderStatus.length > 0 ||
    orderId
  ) {
    if (orderId || event.startsWith('order.') || type === 'order' || orderStatus) {
      goOrderDetails();
      return;
    }
  }

  if (
    event.startsWith('appointment.') ||
    event.startsWith('consult') ||
    type === 'appointment' ||
    type === 'consultation' ||
    appointmentId
  ) {
    if (
      appointmentId ||
      event.startsWith('appointment.') ||
      type === 'appointment' ||
      type === 'consultation'
    ) {
      goAppointment();
      return;
    }
  }

  if (event.startsWith('diet.') || type === 'diet') {
    goDiet();
    return;
  }

  if (type === 'message' || type === 'chat') {
    goChat();
    return;
  }

  if (type === 'product') {
    goProduct();
    return;
  }

  goHome();
};

const schedulePendingFlush = () => {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushPendingNotificationNavigation();
  }, 400);
};

/** Call when navigation container becomes ready (or after cold-start push tap). */
export const flushPendingNotificationNavigation = () => {
  if (!pendingPayload) return;
  if (!navigationRef.isReady()) {
    schedulePendingFlush();
    return;
  }
  const payload = pendingPayload;
  pendingPayload = null;
  handleNotificationNavigation(navigationRef, payload);
};

/** Soft badge refresh after a push arrives (optional). */
export const refreshUnreadBadge = async () => {
  try {
    const count = await fetchUnreadNotificationCount();
    publishUnreadCount(count);
  } catch {
    // ignore
  }
};
