/**
 * Banner redirect_url / redirect_link → React Navigation screen + params.
 * Examples:
 *   DoctorProfile
 *   DoctorProfile/0b104d12-3614-48db-9b8c-55e78987fe58
 *   ProductDetails/<variantId>
 *   CategoryProducts  (or any banner with service_category / subcategory)
 *   DietScreen → all diet plans list
 *   DietPlanDetail/<planId> → plan detail + continue tracking when active
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
  categoryproducts: 'CategoryProducts',
  categoryproduct: 'CategoryProducts',
  category: 'CategoryProducts',
  shop: 'CategoryProducts',
  shopbycategory: 'CategoryProducts',
  dietscreen: 'DietScreen',
  diet: 'DietScreen',
  dietplan: 'DietScreen',
  dietplans: 'DietScreen',
  alldiets: 'DietScreen',
  dietplandetail: 'DietPlanDetail',
  dietdetail: 'DietPlanDetail',
  dietplanddetails: 'DietPlanDetail',
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

const pickId = (...values: any[]) =>
  firstParam(values.map(v => (v == null ? '' : String(v))));

/** Build CategoryProducts params for merged Products + Medicine browse. */
export const buildBothCategoryProductsParams = (bannerItem?: any) => {
  const serviceCategoryId = pickId(
    bannerItem?.service_category_id,
    bannerItem?.serviceCategoryId,
    bannerItem?.service_category?.id,
  );
  const categoryId = pickId(
    bannerItem?.product_category_id,
    bannerItem?.category_id,
    bannerItem?.categoryId,
    bannerItem?.parent_category_id,
  );
  const productSubcategoryId = pickId(
    bannerItem?.product_subcategory_id,
    bannerItem?.subcategory_id,
    bannerItem?.sub_category_id,
    bannerItem?.subcategoryId,
  );
  /** Prefer explicit brand id fields from banner (never treat title as category). */
  const brandId = pickId(
    bannerItem?.brandID,
    bannerItem?.brandId,
    bannerItem?.brand_id,
    bannerItem?.brand_name_id,
    bannerItem?.brand?.id,
    bannerItem?.brand?.brand_id,
    bannerItem?.brand?.brand_name_id,
  );
  const categoryName = String(
    bannerItem?.category_name ||
      bannerItem?.title ||
      bannerItem?.name ||
      bannerItem?.banner_title ||
      'Shop all',
  ).trim();

  /** Brand banner with no category/subcategory → filter by brand id only. */
  const brandOnly =
    Boolean(brandId) && !categoryId && !productSubcategoryId;

  return {
    categoryMode: (brandOnly ? 'product' : 'both') as 'product' | 'both',
    ...(serviceCategoryId ? { serviceCategoryId } : {}),
    ...(categoryId && !brandOnly ? { categoryId } : {}),
    ...(productSubcategoryId && !brandOnly ? { productSubcategoryId } : {}),
    ...(brandId ? { brand_name_id: brandId, brandId } : {}),
    ...(brandOnly ? { brandOnly: true } : {}),
    // Never pass banner title as categoryName for brand-only landings
    ...(!brandOnly && categoryName ? { categoryName } : {}),
    ...(!brandOnly && (bannerItem?.description || bannerItem?.category_desc)
      ? {
          categoryDesc: String(
            bannerItem?.description || bannerItem?.category_desc || '',
          ),
        }
      : {}),
  };
};

const bannerHasShopTarget = (bannerItem?: any): boolean => {
  if (!bannerItem || typeof bannerItem !== 'object') return false;
  return Boolean(
    pickId(
      bannerItem?.service_category_id,
      bannerItem?.serviceCategoryId,
      bannerItem?.service_category?.id,
      bannerItem?.product_category_id,
      bannerItem?.category_id,
      bannerItem?.categoryId,
      bannerItem?.product_subcategory_id,
      bannerItem?.subcategory_id,
      bannerItem?.sub_category_id,
      bannerItem?.brandID,
      bannerItem?.brandId,
      bannerItem?.brand_id,
      bannerItem?.brand_name_id,
      bannerItem?.brand?.id,
    ),
  );
};

/**
 * Build navigation target from banner.redirect_url (+ optional banner payload).
 */
export const resolveBannerNavigation = (
  redirectUrl?: string | null,
  bannerItem?: any,
): { screen: string; params?: Record<string, any> } | null => {
  const fromItem =
    redirectUrl ||
    bannerItem?.redirect_link ||
    bannerItem?.redirect_url ||
    bannerItem?.link ||
    bannerItem?.deep_link ||
    bannerItem?.deeplink ||
    '';

  const raw = String(fromItem || '').trim();

  // Absolute http(s) links are handled by caller via Linking
  if (raw && /^https?:\/\//i.test(raw)) {
    return { screen: '__external__', params: { url: raw } };
  }

  // Banner tied to a service / product / subcategory → merged shop
  if (bannerHasShopTarget(bannerItem)) {
    const shopScreens = new Set([
      '',
      'CategoryProducts',
      'ProductsScreen',
      'MedicineScreen',
      'Home',
    ]);
    let screenFromUrl = '';
    if (raw) {
      const cleanUrl = raw.replace(/^\/+|\/+$/g, '');
      const [routeRaw] = cleanUrl.split('/');
      screenFromUrl = normalizeRouteName(routeRaw);
    }
    // Don't override doctor / diet / order deep links
    if (!screenFromUrl || shopScreens.has(screenFromUrl)) {
      return {
        screen: 'CategoryProducts',
        params: buildBothCategoryProductsParams(bannerItem),
      };
    }
  }

  if (!raw) return null;

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
    bannerItem?.diet_plan_id,
    bannerItem?.plan_id,
    bannerItem?.planId,
    id ? '' : bannerItem?.id,
  ]);

  const entityId = id || payloadId;

  /** Diet plan id only from path or explicit diet fields — never banner media `id`. */
  const dietPlanId = firstParam([
    id,
    bannerItem?.diet_plan_id,
    bannerItem?.plan_id,
    bannerItem?.planId,
  ]);

  const dietPlanDetailParams = (planId: string) => ({
    planId,
    item: {
      id: planId,
      diet_plan_id: planId,
    },
    /** Open continue-tracking UI when this plan is the active assignment. */
    preferTracking: true,
  });

  /** Banner DietScreen → catalog list only (no detail / tracking). */
  const dietListParams = {
    listType: 'all' as const,
    viewAll: true,
    listOnly: true,
  };

  switch (screen) {
    case 'DoctorProfile': {
      if (!entityId) {
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
      if (!entityId) {
        return {
          screen: 'CategoryProducts',
          params: buildBothCategoryProductsParams(bannerItem),
        };
      }
      return {
        screen: 'ProductDetails',
        params: { varientID: entityId },
      };
    }
    case 'CategoryProducts':
    case 'ProductsScreen':
    case 'MedicineScreen': {
      const base = buildBothCategoryProductsParams(bannerItem);
      const hasCategoryTarget = Boolean(
        base.categoryId ||
          base.productSubcategoryId ||
          pickId(
            bannerItem?.product_category_id,
            bannerItem?.category_id,
            bannerItem?.categoryId,
            bannerItem?.product_subcategory_id,
            bannerItem?.subcategory_id,
            bannerItem?.sub_category_id,
          ),
      );
      const pathBrandId =
        entityId &&
        !base.brand_name_id &&
        (!hasCategoryTarget || Boolean(base.brandOnly))
          ? entityId
          : '';

      return {
        screen: 'CategoryProducts',
        params: {
          ...base,
          ...(pathBrandId
            ? {
                brand_name_id: pathBrandId,
                brandId: pathBrandId,
                brandOnly: true,
              }
            : entityId && !base.categoryId && !base.brand_name_id
              ? { categoryId: entityId }
              : {}),
        },
      };
    }
    case 'DietScreen': {
      // "DietScreen" → all plans list only (no showDetailView / tracking)
      // "DietScreen/<planId>" or diet_plan_id → detail
      if (!dietPlanId) {
        return {
          screen: 'DietScreen',
          params: dietListParams,
        };
      }
      return {
        screen: 'DietPlanDetail',
        params: dietPlanDetailParams(dietPlanId),
      };
    }
    case 'DietPlanDetail': {
      if (!dietPlanId) {
        return {
          screen: 'DietScreen',
          params: dietListParams,
        };
      }
      return {
        screen: 'DietPlanDetail',
        params: dietPlanDetailParams(dietPlanId),
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
      const symptoms = Array.isArray(bannerItem?.symptoms)
        ? bannerItem.symptoms
            .map((s: any) => String(s || '').trim())
            .filter(Boolean)
        : [];
      return {
        screen: 'CategoryDoctor',
        params: {
          categoryId: entityId,
          categoryName: String(
            bannerItem?.name ||
              bannerItem?.title ||
              bannerItem?.category_name ||
              'Concern',
          ),
          categoryDesc: String(bannerItem?.description || '').trim() || undefined,
          categorySubscription:
            String(bannerItem?.subscription || bannerItem?.subtitle || '').trim() ||
            undefined,
          categorySymptoms: symptoms,
          categoryImage:
            bannerItem?.image_url ||
            bannerItem?.image ||
            bannerItem?.banner_image ||
            undefined,
          categoryTag: bannerItem?.service_category_name || undefined,
        },
      };
    }
    case 'AllDoctors':
    case 'Rewards':
    case 'Home':
      return { screen };
    default: {
      if (!entityId) return { screen };
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
