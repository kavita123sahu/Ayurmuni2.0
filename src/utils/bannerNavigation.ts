/**
 * Banner redirect_url → React Navigation screen + params.
 * Examples:
 *   DoctorProfile
 *   DoctorProfile/0b104d12-3614-48db-9b8c-55e78987fe58
 *   ProductDetails/<variantId>
 *   AllDoctors
 */

const ROUTE_ALIASES: Record<string, string> = {
  doctorprofile: 'DoctorProfile',
  doctor: 'DoctorProfile',
  doctorprofilescreen: 'DoctorProfile',
  alldoctors: 'AllDoctors',
  doctors: 'AllDoctors',
  consult: 'AllDoctors',
  consulthome: 'AllDoctors',
  productdetails: 'ProductDetails',
  product: 'ProductDetails',
  productdetail: 'ProductDetails',
  medicinescreen: 'MedicineScreen',
  medicine: 'MedicineScreen',
  productsscreen: 'ProductsScreen',
  products: 'ProductsScreen',
  dietscreen: 'DietScreen',
  diet: 'DietScreen',
  dietplan: 'DietScreen',
  orderdetailsscreen: 'OrderDetailsScreen',
  orderdetails: 'OrderDetailsScreen',
  order: 'OrderDetailsScreen',
  appointmentdetails: 'AppointmentDetails',
  appointment: 'AppointmentDetails',
  categorydoctor: 'CategoryDoctor',
  rewards: 'Rewards',
  home: 'Home',
  homescreen: 'Home',
};

const normalizeRouteName = (raw: string): string => {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  const key = trimmed.toLowerCase().replace(/[\s_-]+/g, '');
  return ROUTE_ALIASES[key] || trimmed;
};

const firstParam = (parts: string[]) =>
  parts.map(p => String(p || '').trim()).find(Boolean) || '';

/**
 * Build navigation target from banner.redirect_url (+ optional banner payload).
 */
export const resolveBannerNavigation = (
  redirectUrl?: string | null,
  bannerItem?: any,
): { screen: string; params?: Record<string, any> } | null => {
  const fromItem =
    redirectUrl ||
    bannerItem?.redirect_url ||
    bannerItem?.link ||
    bannerItem?.deep_link ||
    bannerItem?.deeplink ||
    '';

  const raw = String(fromItem || '').trim();
  if (!raw) return null;

  // Absolute http(s) links are handled by caller via Linking
  if (/^https?:\/\//i.test(raw)) {
    return { screen: '__external__', params: { url: raw } };
  }

  const cleanUrl = raw.replace(/^\/+|\/+$/g, '');
  const [routeRaw, ...rest] = cleanUrl.split('/');
  const screen = normalizeRouteName(routeRaw);
  if (!screen) return null;

  const id = firstParam(rest);
  // Also accept entity ids from banner payload when URL has no path id
  const payloadId = firstParam([
    bannerItem?.doctor_id,
    bannerItem?.doctorId,
    bannerItem?.entity_id,
    bannerItem?.reference_id,
    bannerItem?.product_id,
    bannerItem?.variant_id,
    bannerItem?.order_id,
    bannerItem?.appointment_id,
    bannerItem?.target_id,
    id ? '' : bannerItem?.id,
  ]);

  const entityId = id || payloadId;

  switch (screen) {
    case 'DoctorProfile': {
      if (!entityId) {
        // No doctor id → list (same as Consult banner without id)
        return { screen: 'AllDoctors' };
      }
      return {
        screen: 'DoctorProfile',
        params: {
          doctorData: {
            id: entityId,
            doctor_id: entityId,
          },
        },
      };
    }
    case 'ProductDetails': {
      if (!entityId) return { screen: 'ProductsScreen' };
      return {
        screen: 'ProductDetails',
        params: { varientID: entityId },
      };
    }
    case 'DietScreen': {
      if (!entityId) return { screen: 'DietScreen' };
      return {
        screen: 'DietScreen',
        params: {
          item: {
            id: entityId,
            diet_plan_id: entityId,
          },
        },
      };
    }
    case 'OrderDetailsScreen': {
      if (!entityId) return { screen: 'OrderHistory' };
      return {
        screen: 'OrderDetailsScreen',
        params: {
          order: { id: entityId, order_id: entityId },
        },
      };
    }
    case 'AppointmentDetails': {
      if (!entityId) return { screen: 'Notifications' };
      return {
        screen: 'AppointmentDetails',
        params: {
          appointment_id: entityId,
          consultation_id: entityId,
        },
      };
    }
    case 'CategoryDoctor': {
      if (!entityId) return { screen: 'AllDoctors' };
      return {
        screen: 'CategoryDoctor',
        params: {
          concernId: entityId,
          id: entityId,
        },
      };
    }
    case 'AllDoctors':
    case 'MedicineScreen':
    case 'ProductsScreen':
    case 'Rewards':
    case 'Home':
      return { screen };
    default: {
      if (!entityId) return { screen };
      // Generic fallback — pass common id keys
      return {
        screen,
        params: {
          id: entityId,
          doctorData: { id: entityId, doctor_id: entityId },
          varientID: entityId,
        },
      };
    }
  }
};
