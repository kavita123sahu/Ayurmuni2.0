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
 * Uses `route` (or `screen`) + entity ids so taps land on the right screen.
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
  const type = normalizeKey(
    data?.type ?? data?.notification_type ?? data?.category,
  );
  const title = normalizeKey(data?.title ?? data?.message ?? data?.body);
  const orderStatus = String(data?.order_status ?? '').toLowerCase();
  const blob = `${routeKey} ${templateName} ${type} ${event} ${title}`;

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

  const productId = pickId(
    data?.product_id,
    data?.productId,
    data?.variant_id,
    data?.variantId,
    data?.varientID,
  );

  const doctorId = pickId(
    data?.doctor_id,
    data?.doctorId,
    data?.doctor?.id,
    data?.doctor?.doctor_id,
  );

  const prescriptionId = pickId(
    data?.prescription_id,
    data?.prescriptionId,
    data?.prescription?.id,
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
      goHomeStack(nav, 'Appointments');
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
    if (productId) {
      goHomeStack(nav, 'ProductDetails', { varientID: String(productId) });
      return;
    }
    goHomeStack(nav, 'TabStack', { screen: 'Products' });
  };

  const goMedicine = () => {
    if (productId) {
      goHomeStack(nav, 'ProductDetails', { varientID: String(productId) });
      return;
    }
    goHomeStack(nav, 'MedicineScreen');
  };

  const goPrescription = () => {
    if (prescriptionId || appointmentId) {
      goHomeStack(nav, 'PrescriptionDetail', {
        appointment_id: appointmentId,
        consultation_id: data?.consultation_id ?? appointmentId,
        prescription_id: prescriptionId,
        PrisData: data,
        ...(data || {}),
      });
      return;
    }
    goHomeStack(nav, 'Prescription');
  };

  const goMedicalReceipt = () => {
    goHomeStack(nav, 'MedicalReceipt', {
      appointment_id: appointmentId,
      consultation_id: data?.consultation_id ?? appointmentId,
      ...(data || {}),
    });
  };

  const goDoctor = () => {
    if (doctorId) {
      goHomeStack(nav, 'DoctorProfile', {
        doctorData: {
          id: doctorId,
          doctor_id: doctorId,
          ...(data?.doctor || {}),
        },
      });
      return;
    }
    goHomeStack(nav, 'TabStack', { screen: 'Consult' });
  };

  const goFollowUp = () => {
    // Follow-up reminders → appointment details when possible
    if (appointmentId) {
      goAppointment();
      return;
    }
    goHomeStack(nav, 'Appointments');
  };

  const goVideoCall = () => {
    goHomeStack(nav, 'PatientVideoCallScreen', {
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
      routeKey === 'follow' ||
      routeKey === 'followup' ||
      routeKey === 'followups' ||
      routeKey === 'reminder'
    ) {
      goFollowUp();
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
      routeKey === 'dietplanscreen' ||
      routeKey === 'meal' ||
      routeKey === 'nutrition'
    ) {
      goDiet();
      return;
    }

    if (
      routeKey === 'productdetails' ||
      routeKey === 'product' ||
      routeKey === 'productdetail' ||
      routeKey === 'products' ||
      routeKey === 'productsscreen'
    ) {
      goProduct();
      return;
    }

    if (
      routeKey === 'medicine' ||
      routeKey === 'medicines' ||
      routeKey === 'medicinescreen' ||
      routeKey === 'pharmacy'
    ) {
      goMedicine();
      return;
    }

    if (
      routeKey === 'prescriptiondetail' ||
      routeKey === 'prescriptiondetails' ||
      routeKey === 'prescription'
    ) {
      goPrescription();
      return;
    }

    if (routeKey === 'medicalreceipt' || routeKey === 'receipt') {
      goMedicalReceipt();
      return;
    }

    if (
      routeKey === 'doctor' ||
      routeKey === 'doctorprofile' ||
      routeKey === 'doctors'
    ) {
      goDoctor();
      return;
    }

    if (
      routeKey === 'videocall' ||
      routeKey === 'call' ||
      routeKey === 'patientvideocallscreen'
    ) {
      goVideoCall();
      return;
    }

    if (routeKey === 'wishlist') {
      goHomeStack(nav, 'Wishlist');
      return;
    }

    if (
      routeKey === 'rewards' ||
      routeKey === 'mycoupons' ||
      routeKey === 'coupon' ||
      routeKey === 'offer' ||
      routeKey === 'promotion'
    ) {
      goHomeStack(nav, 'Rewards');
      return;
    }

    if (
      routeKey === 'payment' ||
      routeKey === 'payments' ||
      routeKey === 'paymentsscreen' ||
      routeKey === 'transaction'
    ) {
      goHomeStack(nav, 'PaymentsScreen');
      return;
    }

    if (routeKey === 'cart' || routeKey === 'mycart') {
      goHomeStack(nav, 'MyCart');
      return;
    }

    if (routeKey === 'notifications' || routeKey === 'notificationscreen') {
      goHomeStack(nav, 'Notifications');
      return;
    }

    if (routeKey === 'yoga' || routeKey === 'yogascreen') {
      goHomeStack(nav, 'YogaScreen');
      return;
    }

    if (routeKey === 'medicalrecords' || routeKey === 'medicalhistory') {
      goHomeStack(nav, 'MedicalRecords');
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

  // 2) Template / title / type keyword hints
  if (templateName || type || title) {
    if (
      templateName === 'customerwelcome' ||
      templateName.includes('welcome') ||
      type === 'welcome'
    ) {
      goHome();
      return;
    }
    if (
      blob.includes('followup') ||
      blob.includes('follow') ||
      type === 'follow' ||
      type === 'followup' ||
      type === 'reminder'
    ) {
      goFollowUp();
      return;
    }
    if (
      blob.includes('prescription') ||
      type === 'prescription' ||
      type === 'rx'
    ) {
      goPrescription();
      return;
    }
    if (blob.includes('receipt') || type === 'receipt') {
      goMedicalReceipt();
      return;
    }
    if (
      blob.includes('medicine') ||
      blob.includes('pharmacy') ||
      type === 'medicine'
    ) {
      goMedicine();
      return;
    }
    if (
      blob.includes('product') ||
      type === 'product' ||
      type === 'catalog'
    ) {
      goProduct();
      return;
    }
    if (
      blob.includes('diet') ||
      blob.includes('meal') ||
      blob.includes('nutrition') ||
      blob.includes('water') ||
      type === 'diet'
    ) {
      goDiet();
      return;
    }
    if (
      blob.includes('order') ||
      type === 'order' ||
      orderStatus.length > 0
    ) {
      goOrderDetails();
      return;
    }
    if (
      blob.includes('appointment') ||
      blob.includes('consult') ||
      blob.includes('booking') ||
      type === 'appointment' ||
      type === 'consultation'
    ) {
      goAppointment();
      return;
    }
    if (
      blob.includes('chat') ||
      blob.includes('message') ||
      type === 'chat' ||
      type === 'message'
    ) {
      goChat();
      return;
    }
    if (
      blob.includes('doctor') ||
      type === 'doctor' ||
      type === 'mentor'
    ) {
      goDoctor();
      return;
    }
    if (
      blob.includes('reward') ||
      blob.includes('coupon') ||
      blob.includes('offer') ||
      type === 'reward' ||
      type === 'coupon' ||
      type === 'offer' ||
      type === 'promotion'
    ) {
      goHomeStack(nav, 'Rewards');
      return;
    }
    if (blob.includes('wishlist') || type === 'wishlist') {
      goHomeStack(nav, 'Wishlist');
      return;
    }
    if (
      blob.includes('payment') ||
      blob.includes('refund') ||
      type === 'payment'
    ) {
      goHomeStack(nav, 'PaymentsScreen');
      return;
    }
    if (blob.includes('call') || type === 'videocall' || type === 'call') {
      goVideoCall();
      return;
    }
    if (blob.includes('cart') || type === 'cart') {
      goHomeStack(nav, 'MyCart');
      return;
    }
  }

  // 3) Event / entity ids
  if (event === 'user.registered' || event.includes('welcome')) {
    goHome();
    return;
  }

  if (event.startsWith('order.') || orderId) {
    goOrderDetails();
    return;
  }

  if (
    event.startsWith('appointment.') ||
    event.startsWith('consult') ||
    appointmentId
  ) {
    goAppointment();
    return;
  }

  if (event.startsWith('diet.') || event.includes('diet')) {
    goDiet();
    return;
  }

  if (productId) {
    goProduct();
    return;
  }

  if (prescriptionId) {
    goPrescription();
    return;
  }

  if (doctorId) {
    goDoctor();
    return;
  }

  // Last resort: open notifications list so the user can still act
  goHomeStack(nav, 'Notifications');
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
