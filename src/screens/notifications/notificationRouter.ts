import {
  fetchUnreadNotificationCount,
  publishUnreadCount,
} from '../../hooks/useNotification';

/**
 * Navigate from OneSignal / in-app notification payloads.
 * Prefer `route` / `screen` / template `name` from push templates.
 */
export const handleNotificationNavigation = (
  navigationRef: any,
  data: any,
) => {
  if (!data || !navigationRef?.isReady?.()) {
    return;
  }

  const route = String(
    data?.route ??
      data?.screen ??
      data?.type ??
      data?.notification_type ??
      '',
  ).trim();

  const templateName = String(data?.name ?? '').trim().toLowerCase();
  const event = String(data?.event ?? '').toLowerCase();
  const orderStatus = String(data?.order_status ?? '').toLowerCase();

  const goHome = () => {
    navigationRef.navigate('HomeStack', {
      screen: 'TabStack',
      params: { screen: 'Home' },
    });
  };

  const goOrderDetails = () => {
    const orderId =
      data?.order_id ?? data?.orderId ?? data?.id ?? null;
    navigationRef.navigate('HomeStack', {
      screen: 'OrderDetailsScreen',
      params: {
        order: orderId ? { id: String(orderId) } : data?.order ?? {},
      },
    });
  };

  const goDiet = () => {
    navigationRef.navigate('HomeStack', {
      screen: 'DietScreen',
      params: {
        dietId: data?.diet_id ?? data?.dietId,
        planId: data?.plan_id ?? data?.planId ?? data?.diet_plan_id,
        item: data?.plan_id
          ? { id: String(data.plan_id) }
          : data?.diet_plan_id
            ? { id: String(data.diet_plan_id) }
            : undefined,
      },
    });
  };

  const goChat = () => {
    const appointmentId = data?.appointment_id ?? data?.appointmentId;
    if (!appointmentId) {
      navigationRef.navigate('HomeStack', { screen: 'Notifications' });
      return;
    }
    navigationRef.navigate('HomeStack', {
      screen: 'ChatScreen',
      params: {
        appointmentId: String(appointmentId),
        role: 'patient',
        doctorName: data?.doctor_name ?? 'Doctor',
        patientName: data?.patient_name ?? '',
      },
    });
  };

  const goAppointment = () => {
    const appointmentId = data?.appointment_id ?? data?.appointmentId;
    if (!appointmentId) return;
    navigationRef.navigate('HomeStack', {
      screen: 'AppointmentDetails',
      params: { appointmentId: String(appointmentId) },
    });
  };

  const goProduct = () => {
    const productId =
      data?.product_id ?? data?.productId ?? data?.variant_id ?? data?.varientID;
    if (!productId) return;
    navigationRef.navigate('HomeStack', {
      screen: 'ProductDetails',
      params: { varientID: String(productId) },
    });
  };

  // Template name (OneSignal `name` field) — highest priority for Ayurmuni templates
  if (templateName) {
    if (templateName === 'customer_welcome') {
      goHome();
      return;
    }

    if (
      templateName.startsWith('order_status_') ||
      templateName.includes('order_status')
    ) {
      goOrderDetails();
      return;
    }

    if (
      templateName.startsWith('diet_') ||
      templateName.startsWith('diet_plan_') ||
      templateName.includes('diet_water')
    ) {
      goDiet();
      return;
    }
  }

  // Template route / screen (preferred)
  const normalizedRoute = route.toLowerCase();

  if (
    normalizedRoute === 'home' ||
    event === 'user.registered' ||
    normalizedRoute.includes('welcome')
  ) {
    goHome();
    return;
  }

  if (
    normalizedRoute === 'orderdetailsscreen' ||
    normalizedRoute === 'order_details' ||
    normalizedRoute.includes('order') ||
    event.startsWith('order.') ||
    orderStatus.length > 0
  ) {
    goOrderDetails();
    return;
  }

  if (
    normalizedRoute === 'dietscreen' ||
    normalizedRoute.includes('diet') ||
    event.startsWith('diet.')
  ) {
    goDiet();
    return;
  }

  if (
    normalizedRoute === 'message' ||
    normalizedRoute === 'chat' ||
    normalizedRoute === 'chatscreen'
  ) {
    goChat();
    return;
  }

  if (
    normalizedRoute === 'appointment' ||
    normalizedRoute === 'appointmentdetails'
  ) {
    goAppointment();
    return;
  }

  if (
    normalizedRoute === 'product' ||
    normalizedRoute === 'productdetails'
  ) {
    goProduct();
    return;
  }

  if (normalizedRoute === 'notifications') {
    navigationRef.navigate('HomeStack', { screen: 'Notifications' });
    return;
  }

  // Legacy type switch fallback
  const type = String(data?.type ?? '').toUpperCase();
  switch (type) {
    case 'ORDER':
      goOrderDetails();
      break;
    case 'MESSAGE':
    case 'CHAT':
      goChat();
      break;
    case 'APPOINTMENT':
      goAppointment();
      break;
    case 'PRODUCT':
      goProduct();
      break;
    case 'DIET':
      goDiet();
      break;
    case 'GENERAL':
    default:
      goHome();
      break;
  }
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
