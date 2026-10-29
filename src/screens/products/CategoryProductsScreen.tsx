
//   const productFilter = useMemo(() => {
//     if (categoryMode === 'health') {
//       const healthId =
//         selectedSubcategoryId ??
//         activeCategoryId ??
//         routeParams.healthCategoryId ??
//         null;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import ProductCard, { GRID_CARD_HEIGHT } from '../../components/ProductCard';
import ProductSearchFilterBar, {
  BrandFilterOption,
} from '../../components/ProductSearchFilterBar';
import { Colors } from '../../common/Colors';
import { useHomeData } from '../../hooks/UseHomeData';
import { TopSellingListSkeleton } from '../../simmerScreen/ShimmerHook';
import { getScreenBottomPadding } from '../../constants/layout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { syncCartQuantity } from '../../store/slices/cartSlice';
import { canAddProductWithoutPrescription } from '../../utils/prescriptionUtils';
import { getAddQtyBlockMessage } from '../../utils/productStockUtils';
import {
  applyWishlistCache,
  seedWishlistCacheFromList,
  toggleWishlistItem,
  useWishlistSync,
} from '../../hooks/useWishlistSync';
import { showSuccessToast } from '../../config/Key';
import { Fonts } from '../../common/Fonts';
import { requireAuth } from '../../services/guestAuth';
import { Images } from '../../common/Images';
import { safeGoBack } from '../../navigation/navigationUtils';
import { navigateToProductDetails } from '../../navigation/productNavigation';
import {
  useCategoryProducts,
  type CategoryProductFilter,
} from '../../hooks/useCategoryProducts';
import {
  getProduct,
  hasMoreProductPages,
  isCatalogItemPurchasable,
  mapCatalogProductItem,
  normalizeApiList,
  PRODUCT_PAGE_SIZE,
} from '../../services/ProductServices';
import { useFocusEffect } from '@react-navigation/native';
import { shouldRunThrottled } from '../../utils/fetchThrottle';
import {
  ProductCategoryItem,
  useProductCategories,
} from '../../hooks/useProductCategories';
import { useHealthCategories } from '../../hooks/useHealthCategories';
import { useBrands } from '../../hooks/useBrands';
import {
  applyProductFilters,
  getPriceRangeBounds,
  toProductApiSort,
  ProductSortKey,
  PriceRangeKey,
  ProductRatingKey,
  DoshaKey,
} from '../../utils/productSearchUtils';
import { renderCategoryName } from '../../common/DataInterface';
import TablerIcon from '../../components/TablerIcon';
import PromoCard from '../../components/PromoCard';
import { getServiceCategoryId } from '../../utils/serviceCategoryUtils';

const { width: SCREEN_W } = Dimensions.get('window');
const CATEGORY_PANEL_WIDTH = 78;
const CONTENT_PADDING = 14;
const GRID_GAP = 8;
const PRODUCT_PANEL_WIDTH = SCREEN_W - CATEGORY_PANEL_WIDTH;
const GRID_CARD_WIDTH = (PRODUCT_PANEL_WIDTH - CONTENT_PADDING - GRID_GAP) / 2;

type CategoryRail = 'product' | 'health';

type CategoryItem = Omit<
  ProductCategoryItem,
  'symptoms' | 'parent_id' | 'service_category_name'
> &
  Partial<
    Pick<ProductCategoryItem, 'symptoms' | 'parent_id' | 'service_category_name'>
  > & {
    isAll?: boolean;
    /** Which catalog this sidebar row filters (both-mode). */
    rail?: CategoryRail;
    /** Real API category id when `id` is rail-prefixed. */
    sourceId?: string;
  };

const ALL_CATEGORY: CategoryItem = {
  id: 'all',
  name: 'All',
  parent_id: '',
  image_url: '',
  description: '',
  subscription: '',
  isAll: true,
};

const toRailCategory = (
  item: ProductCategoryItem,
  rail: CategoryRail,
): CategoryItem => {
  const sourceId = String(item?.id || '');
  return {
    ...item,
    id: `${rail}:${sourceId}`,
    sourceId,
    rail,
  };
};

const CategoryProductsScreen = (props: any) => {
  const routeParams = props?.route?.params ?? {};
  const rawMode = String(routeParams.categoryMode || '').toLowerCase();
  // medicine → product catalog filtered by medicine service_category_id
  // both → merged Products + Medicine (health) category rails
  // brandOnly / brand_name_id from banner → filter products by brand; sidebar = API only

  const isBrandLanding = Boolean(
    routeParams.brandOnly ||
    ((routeParams.brand_name_id ||
      routeParams.brandId ||
      routeParams.brandID) &&
      !routeParams.categoryId &&
      !routeParams.healthCategoryId),
  );

  const categoryMode: 'health' | 'product' | 'both' =
    rawMode === 'health'
      ? 'health'
      : rawMode === 'both'
        ? 'both'
        : rawMode === 'medicine' || rawMode === 'product'
          ? 'product'
          : routeParams.healthCategoryId && !routeParams.categoryId
            ? 'health'
            : 'product';

  const initialCategoryId =
    isBrandLanding
      ? 'all'
      : routeParams.categoryId
        ? String(routeParams.categoryId)
        : routeParams.healthCategoryId
          ? String(routeParams.healthCategoryId)
          : 'all';
  const initialSubcategoryId = isBrandLanding
    ? null
    : routeParams.productSubcategoryId
      ? String(routeParams.productSubcategoryId)
      : routeParams.healthDiseaseId
        ? String(routeParams.healthDiseaseId)
        : null;
  /** Banner brand id only — never use categoryName as brand. */
  const initialBrandId = routeParams.brand_name_id
    ? String(routeParams.brand_name_id)
    : routeParams.brandId
      ? String(routeParams.brandId)
      : routeParams.brandID
        ? String(routeParams.brandID)
        : null;
  const serviceCategoryId = routeParams.serviceCategoryId
    ? String(routeParams.serviceCategoryId)
    : null;

  const insets = useSafeAreaInsets();
  const bottomPadding = getScreenBottomPadding(insets);
  const {
    categories: dashboardCategories,
    medicineProducts,
    storeProducts,
    productData,
  } = useHomeData();
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

  const [sortBy, setSortBy] = useState<ProductSortKey>('relevance');
  const [brandIds, setBrandIds] = useState<string[]>(
    initialBrandId ? [initialBrandId] : [],
  );
  /** Names resolved from brands list by id — not from banner categoryName */
  const [brandNames, setBrandNames] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRangeKey>('all');
  const [ratingFilter, setRatingFilter] = useState<ProductRatingKey>('all');
  const [doshaFilter, setDoshaFilter] = useState<DoshaKey>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState(() => {
    if (isBrandLanding || initialCategoryId === 'all') return 'all';
    if (rawMode === 'both') {
      if (routeParams.healthCategoryId) {
        return `health:${String(routeParams.healthCategoryId)}`;
      }
      if (routeParams.categoryId) {
        return `product:${String(routeParams.categoryId)}`;
      }
    }
    return initialCategoryId;
  });
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(
    initialSubcategoryId,
  );

  const useHealthRail = categoryMode === 'health';
  const useBothRail = categoryMode === 'both';

  const productsServiceId = useMemo(
    () => getServiceCategoryId(dashboardCategories, 'products'),
    [dashboardCategories],
  );
  const medicineServiceId = useMemo(
    () => getServiceCategoryId(dashboardCategories, 'medicine'),
    [dashboardCategories],
  );

  // Product browse (or products half of both-mode merge)
  const productTopServiceId = useBothRail
    ? productsServiceId
    : useHealthRail
      ? null
      : serviceCategoryId;

  const {
    categories: productTopCategories,
    loading: productTopLoading,
    refresh: refreshProductTop,
  } = useProductCategories(null, productTopServiceId, {
    enabled: !useHealthRail,
  });

  // Medicine side of both-mode = health concerns (same format as product categories)
  const healthTopServiceId = useHealthRail
    ? serviceCategoryId
    : useBothRail
      ? medicineServiceId
      : null;

  const {
    categories: healthTopCategories,
    loading: healthTopLoading,
    refresh: refreshHealthTop,
  } = useHealthCategories(null, healthTopServiceId);

  const topCategories = useMemo<CategoryItem[]>(() => {
    if (useHealthRail) return healthTopCategories;
    if (!useBothRail) return productTopCategories;

    const merged: CategoryItem[] = [];
    const seen = new Set<string>();

    const pushUnique = (
      list: ProductCategoryItem[],
      rail: CategoryRail,
    ) => {
      (Array.isArray(list) ? list : []).forEach(item => {
        const sourceId = String(item?.id || '');
        if (!sourceId) return;
        const key = `${rail}:${sourceId}`;
        if (seen.has(key)) return;
        seen.add(key);
        merged.push(toRailCategory(item, rail));
      });
    };

    pushUnique(productTopCategories, 'product');
    pushUnique(healthTopCategories, 'health');
    return merged;
  }, [
    useHealthRail,
    useBothRail,
    healthTopCategories,
    productTopCategories,
  ]);

  const topCategoriesLoading = useHealthRail
    ? healthTopLoading
    : useBothRail
      ? productTopLoading || healthTopLoading
      : productTopLoading;

  const refreshTopCategories = useCallback(() => {
    if (useHealthRail) {
      refreshHealthTop();
      return;
    }
    refreshProductTop();
    if (useBothRail) {
      refreshHealthTop();
    }
  }, [
    useHealthRail,
    useBothRail,
    refreshHealthTop,
    refreshProductTop,
  ]);

  const selectedCategoryMeta = useMemo(() => {
    if (selectedCategoryId === 'all') return null;
    if (useBothRail) {
      const fromList = topCategories.find(
        item => item.id === selectedCategoryId,
      );
      if (fromList) return fromList;
      // Route / stale selection before list loads
      if (selectedCategoryId.startsWith('product:')) {
        return {
          id: selectedCategoryId,
          sourceId: selectedCategoryId.slice('product:'.length),
          rail: 'product' as CategoryRail,
        };
      }
      if (selectedCategoryId.startsWith('health:')) {
        return {
          id: selectedCategoryId,
          sourceId: selectedCategoryId.slice('health:'.length),
          rail: 'health' as CategoryRail,
        };
      }
    }
    return {
      id: selectedCategoryId,
      sourceId: selectedCategoryId,
      rail: (useHealthRail ? 'health' : 'product') as CategoryRail,
    };
  }, [selectedCategoryId, useBothRail, useHealthRail, topCategories]);

  const activeCategoryId =
    selectedCategoryId === 'all'
      ? null
      : selectedCategoryMeta?.sourceId || selectedCategoryId;
  const activeRail: CategoryRail | null =
    selectedCategoryId === 'all'
      ? null
      : selectedCategoryMeta?.rail || (useHealthRail ? 'health' : 'product');

  const loadProductSubs =
    !!activeCategoryId &&
    (useBothRail ? activeRail === 'product' : !useHealthRail);
  const loadHealthSubs =
    !!activeCategoryId &&
    (useBothRail ? activeRail === 'health' : useHealthRail);

  const {
    categories: productSubcategories,
    loading: productSubLoading,
    refresh: refreshProductSub,
  } = useProductCategories(
    loadProductSubs ? activeCategoryId : null,
    useBothRail ? null : !useHealthRail ? serviceCategoryId : null,
    { enabled: loadProductSubs },
  );

  const {
    categories: healthSubcategories,
    loading: healthSubLoading,
    refresh: refreshHealthSub,
  } = useHealthCategories(
    loadHealthSubs ? activeCategoryId : null,
    useBothRail
      ? medicineServiceId
      : useHealthRail
        ? serviceCategoryId
        : null,
  );

  const subcategories = loadHealthSubs
    ? healthSubcategories
    : productSubcategories;
  const subcategoriesLoading = loadHealthSubs
    ? healthSubLoading
    : productSubLoading;
  const refreshSubcategories = loadHealthSubs
    ? refreshHealthSub
    : refreshProductSub;

  const { brands: brandRecords } = useBrands();

  const apiBrandNameId =
    brandIds.length === 0
      ? null
      : brandIds.length === 1
        ? brandIds[0]
        : brandIds.join(',');

  const isBrandAllView =
    isBrandLanding && selectedCategoryId === 'all' && !!apiBrandNameId;
  /** Shop-all / brand-all in both mode — need products + medicines services. */
  const isBothAllView = useBothRail && selectedCategoryId === 'all';

  const baseProductFilter = useMemo((): CategoryProductFilter => {
    // Brand / Shop-all → unscoped first page; dual-service merge fills medicines
    if (isBrandAllView || isBothAllView) {
      return {
        id: null,
        product_subcategory_id: null,
        brand_name_id: apiBrandNameId,
        service_category_id: null,
      };
    }

    if (useHealthRail || activeRail === 'health') {
      return {
        health_category_id: activeCategoryId,
        health_disease_id: selectedSubcategoryId,
        brand_name_id: apiBrandNameId,
        service_category_id: useBothRail ? null : serviceCategoryId,
      };
    }

    if (useBothRail) {
      // Product/health row → category filter; omit service so both catalogs can match
      return {
        id: activeRail === 'product' ? activeCategoryId : null,
        product_subcategory_id:
          activeRail === 'product' ? selectedSubcategoryId : null,
        brand_name_id: apiBrandNameId,
        service_category_id: null,
      };
    }

    return {
      id: activeCategoryId,
      product_subcategory_id: selectedSubcategoryId,
      brand_name_id: apiBrandNameId,
      service_category_id: serviceCategoryId,
    };
  }, [
    isBrandAllView,
    isBothAllView,
    useHealthRail,
    useBothRail,
    activeRail,
    activeCategoryId,
    selectedSubcategoryId,
    apiBrandNameId,
    serviceCategoryId,
  ]);

  const productFilter = useMemo((): CategoryProductFilter => {
    const { min_price, max_price } = getPriceRangeBounds(priceRange);
    return {
      ...baseProductFilter,
      min_price,
      max_price,
      min_rating: ratingFilter === 'all' ? null : ratingFilter,
      dosha_type: doshaFilter === 'all' ? null : doshaFilter,
      sort: toProductApiSort(sortBy),
    };
  }, [baseProductFilter, priceRange, ratingFilter, doshaFilter, sortBy]);

  const fallbackCatalog = useMemo(() => {
    const store = Array.isArray(storeProducts) ? storeProducts : [];
    const medicine = Array.isArray(medicineProducts) ? medicineProducts : [];
    const home = Array.isArray(productData) ? productData : [];

    if (useHealthRail || activeRail === 'health') {
      return medicine.length ? medicine : store.length ? store : home;
    }

    if (useBothRail || isBrandAllView) {
      const seen = new Set<string>();
      const merged: any[] = [];
      [...store, ...medicine, ...home].forEach(item => {
        const key = String(
          item?.variant_id ?? item?.id ?? item?.product_id ?? '',
        );
        if (key && seen.has(key)) return;
        if (key) seen.add(key);
        merged.push(item);
      });
      return merged;
    }

    // Shop by Category (products) → store catalog
    return store.length ? store : home.length ? home : medicine;
  }, [
    isBrandAllView,
    useHealthRail,
    useBothRail,
    activeRail,
    medicineProducts,
    storeProducts,
    productData,
  ]);

  const {
    products: fetchedProducts,
    loading: baseLoading,
    loadingMore,
    refreshing,
    refresh,
    loadMore,
  } = useCategoryProducts(productFilter, fallbackCatalog, {
    // Skip unscoped page in both-All — dual-service merge is the source of truth
    enabled: !isBothAllView,
  });
  const [products, setProducts] = useState<any[]>([]);

  /**
   * Both-mode All (Trusted Brands / Browse more / brand tap):
   * Fetch products + medicines in parallel, show each page as it arrives,
   * then load more on scroll (do not wait for a full merge).
   */
  const [bothAllProducts, setBothAllProducts] = useState<any[]>([]);
  const [bothAllLoading, setBothAllLoading] = useState(false);
  const [bothAllLoadingMore, setBothAllLoadingMore] = useState(false);
  const [bothAllRefreshing, setBothAllRefreshing] = useState(false);
  const [bothAllHasMore, setBothAllHasMore] = useState(true);
  const [bothAllNonce, setBothAllNonce] = useState(0);
  const bothAllSeenRef = useRef(new Set<string>());
  const bothAllServiceHasMoreRef = useRef(new Map<string, boolean>());
  const bothAllPageRef = useRef(1);
  const bothAllSharedRef = useRef<Record<string, unknown>>({});
  const bothAllServiceIdsRef = useRef<string[]>([]);
  const bothAllLoadLockRef = useRef(false);

  const bothAllKey = useMemo(
    () =>
      isBothAllView
        ? JSON.stringify({
          brand: apiBrandNameId || null,
          productsServiceId: productsServiceId || null,
          medicineServiceId: medicineServiceId || null,
          price: getPriceRangeBounds(priceRange),
          rating: ratingFilter === 'all' ? null : ratingFilter,
          dosha: doshaFilter === 'all' ? null : doshaFilter,
          sort: toProductApiSort(sortBy),
          nonce: bothAllNonce,
        })
        : '',
    [
      isBothAllView,
      apiBrandNameId,
      productsServiceId,
      medicineServiceId,
      priceRange,
      ratingFilter,
      doshaFilter,
      sortBy,
      bothAllNonce,
    ],
  );

  const mapBothAllItems = useCallback((response: any) => {
    return normalizeApiList(response)
      .map(mapCatalogProductItem)
      .filter(Boolean)
      .filter(isCatalogItemPurchasable);
  }, []);

  const appendBothAllItems = useCallback((items: any[]) => {
    const seen = bothAllSeenRef.current;
    const added: any[] = [];
    items.forEach((item: any) => {
      const key = String(item?.variant_id ?? item?.id ?? '');
      if (!key || seen.has(key)) return;
      seen.add(key);
      added.push(item);
    });
    if (added.length === 0) return;
    setBothAllProducts(prev => [...prev, ...added]);
  }, []);

  useEffect(() => {
    if (!bothAllKey) {
      setBothAllProducts([]);
      setBothAllLoading(false);
      setBothAllLoadingMore(false);
      setBothAllRefreshing(false);
      setBothAllHasMore(false);
      bothAllSeenRef.current = new Set();
      bothAllServiceHasMoreRef.current = new Map();
      bothAllPageRef.current = 1;
      bothAllServiceIdsRef.current = [];
      return;
    }

    const parsed = JSON.parse(bothAllKey) as {
      brand: string | null;
      productsServiceId: string | null;
      medicineServiceId: string | null;
      price: { min_price: number | null; max_price: number | null };
      rating: number | string | null;
      dosha: string | null;
      sort: string | null;
    };

    const serviceIds = [
      parsed.productsServiceId,
      parsed.medicineServiceId,
    ].filter(Boolean) as string[];

    // Wait until dashboard service ids are known
    if (!serviceIds.length) {
      setBothAllLoading(true);
      return;
    }

    const shared: Record<string, unknown> = {
      page_size: PRODUCT_PAGE_SIZE,
    };
    if (parsed.brand) shared.brand_name_id = parsed.brand;
    if (parsed.price?.min_price != null) shared.min_price = parsed.price.min_price;
    if (parsed.price?.max_price != null) shared.max_price = parsed.price.max_price;
    if (parsed.rating != null && parsed.rating !== '') {
      shared.min_rating = parsed.rating;
    }
    if (parsed.dosha) shared.dosha_type = parsed.dosha;
    if (parsed.sort) shared.sort = parsed.sort;

    bothAllSharedRef.current = shared;
    bothAllServiceIdsRef.current = serviceIds;
    bothAllSeenRef.current = new Set();
    bothAllPageRef.current = 1;
    bothAllLoadLockRef.current = false;
    const hasMoreMap = new Map<string, boolean>();
    serviceIds.forEach(id => hasMoreMap.set(id, true));
    bothAllServiceHasMoreRef.current = hasMoreMap;

    let cancelled = false;
    setBothAllLoading(true);
    setBothAllLoadingMore(false);
    setBothAllProducts([]);
    setBothAllHasMore(true);

    const fetchServicePage = async (serviceId: string, page: number) => {
      const res = await getProduct({
        ...shared,
        page,
        service_category_id: serviceId,
      });
      if (cancelled) return;
      const items = mapBothAllItems(res);
      const more = hasMoreProductPages(res, items.length, PRODUCT_PAGE_SIZE);
      hasMoreMap.set(serviceId, more);
      appendBothAllItems(items);
      // Show the first page as soon as either service returns
      setBothAllLoading(false);
      setBothAllRefreshing(false);
    };

    Promise.allSettled(
      serviceIds.map(serviceId =>
        fetchServicePage(serviceId, 1).catch(() => {
          if (!cancelled) hasMoreMap.set(serviceId, false);
        }),
      ),
    ).then(() => {
      if (cancelled) return;
      setBothAllLoading(false);
      setBothAllRefreshing(false);
      setBothAllHasMore([...hasMoreMap.values()].some(Boolean));
    });

    return () => {
      cancelled = true;
    };
  }, [bothAllKey, mapBothAllItems, appendBothAllItems]);

  const loadBothAllMore = useCallback(async () => {
    if (
      !isBothAllView ||
      bothAllLoading ||
      bothAllLoadingMore ||
      bothAllRefreshing ||
      !bothAllHasMore ||
      bothAllLoadLockRef.current
    ) {
      return;
    }

    const serviceIds = bothAllServiceIdsRef.current;
    const hasMoreMap = bothAllServiceHasMoreRef.current;
    const toFetch = serviceIds.filter(id => hasMoreMap.get(id));
    if (toFetch.length === 0) {
      setBothAllHasMore(false);
      return;
    }

    bothAllLoadLockRef.current = true;
    setBothAllLoadingMore(true);
    const nextPage = bothAllPageRef.current + 1;
    const shared = bothAllSharedRef.current;

    try {
      await Promise.allSettled(
        toFetch.map(async serviceId => {
          try {
            const res = await getProduct({
              ...shared,
              page: nextPage,
              page_size: PRODUCT_PAGE_SIZE,
              service_category_id: serviceId,
            });
            const items = mapBothAllItems(res);
            const more = hasMoreProductPages(
              res,
              items.length,
              PRODUCT_PAGE_SIZE,
            );
            hasMoreMap.set(serviceId, more);
            appendBothAllItems(items);
          } catch {
            hasMoreMap.set(serviceId, false);
          }
        }),
      );
      bothAllPageRef.current = nextPage;
      setBothAllHasMore([...hasMoreMap.values()].some(Boolean));
    } finally {
      setBothAllLoadingMore(false);
      bothAllLoadLockRef.current = false;
    }
  }, [
    isBothAllView,
    bothAllLoading,
    bothAllLoadingMore,
    bothAllRefreshing,
    bothAllHasMore,
    mapBothAllItems,
    appendBothAllItems,
  ]);

  const loading = isBothAllView ? bothAllLoading : baseLoading;
  const listRefreshing = isBothAllView ? bothAllRefreshing : refreshing;
  const listLoadingMore = isBothAllView ? bothAllLoadingMore : loadingMore;
  const handleEndReached = isBothAllView ? loadBothAllMore : loadMore;

  useEffect(() => {
    if (!isBothAllView) {
      seedWishlistCacheFromList(fetchedProducts);
      setProducts(applyWishlistCache(fetchedProducts));
      return;
    }
    // Progressive: publish as soon as either service page arrives
    if (bothAllProducts.length > 0) {
      seedWishlistCacheFromList(bothAllProducts);
      setProducts(applyWishlistCache(bothAllProducts));
      return;
    }
    if (bothAllLoading || bothAllRefreshing) {
      return;
    }
    const filteredFallback = fallbackCatalog.filter(isCatalogItemPurchasable);
    seedWishlistCacheFromList(filteredFallback);
    setProducts(applyWishlistCache(filteredFallback));
  }, [
    fetchedProducts,
    bothAllProducts,
    bothAllLoading,
    bothAllRefreshing,
    isBothAllView,
    fallbackCatalog,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (!shouldRunThrottled('category-products-focus-refresh', 30_000)) {
        return;
      }
      if (isBothAllView) {
        setBothAllNonce(n => n + 1);
        return;
      }
      refresh();
    }, [isBothAllView, refresh]),
  );

  const prevCategoryRef = useRef(selectedCategoryId);

  useEffect(() => {
    if (prevCategoryRef.current !== selectedCategoryId) {
      setSelectedSubcategoryId(null);
      prevCategoryRef.current = selectedCategoryId;
    }
  }, [selectedCategoryId]);

  const categoryList = useMemo(() => {
    // Brand banner landing → sidebar shows API categories only (no injected categoryName)
    const base: CategoryItem[] = [ALL_CATEGORY, ...topCategories].filter(
      item => item.id,
    );

    if (isBrandLanding) {
      return base;
    }

    // Keep the tapped concern visible on the left even before top list loads
    const routeHealthId = routeParams.healthCategoryId
      ? String(routeParams.healthCategoryId)
      : '';
    if (
      (useHealthRail || useBothRail) &&
      routeHealthId &&
      routeHealthId !== 'all'
    ) {
      const healthKey = useBothRail
        ? `health:${routeHealthId}`
        : routeHealthId;
      if (!base.some(item => item.id === healthKey)) {
        base.splice(1, 0, {
          id: healthKey,
          sourceId: routeHealthId,
          rail: 'health',
          name: String(routeParams.categoryName || 'Concern'),
          parent_id: '',
          image_url: '',
          description: String(routeParams.categoryDesc || ''),
          subscription: String(routeParams.categorySubscription || ''),
        });
      }
    }

    // Same for product Shop by Category
    const routeProductId = routeParams.categoryId
      ? String(routeParams.categoryId)
      : '';
    if (
      (!useHealthRail || useBothRail) &&
      routeProductId &&
      routeProductId !== 'all'
    ) {
      const productKey = useBothRail
        ? `product:${routeProductId}`
        : routeProductId;
      if (!base.some(item => item.id === productKey)) {
        base.splice(1, 0, {
          id: productKey,
          sourceId: routeProductId,
          rail: 'product',
          name: String(routeParams.categoryName || 'Category'),
          parent_id: '',
          image_url: '',
          description: String(routeParams.categoryDesc || ''),
          subscription: String(routeParams.categorySubscription || ''),
        });
      }
    }

    return base;
  }, [
    topCategories,
    useHealthRail,
    useBothRail,
    isBrandLanding,
    routeParams.healthCategoryId,
    routeParams.categoryId,
    routeParams.categoryName,
    routeParams.categoryDesc,
    routeParams.categorySubscription,
  ]);

  const brandOptions = useMemo<BrandFilterOption[]>(() => {
    const fromApi = (Array.isArray(brandRecords) ? brandRecords : [])
      .map((item: any) => ({
        id: String(item?.id ?? item?.brand_id ?? item?.brand_name_id ?? ''),
        name: String(item?.brand_name ?? item?.name ?? '').trim(),
      }))
      .filter(item => item.id && item.name);

    if (fromApi.length > 0) {
      return fromApi.sort((a, b) => a.name.localeCompare(b.name));
    }

    const names = products
      .map(item => ({
        id: String(
          item?.brand_name_id ??
          item?.brand_id ??
          item?.brand?.id ??
          item?.brand_name ??
          '',
        ),
        name: String(item?.brand_name ?? item?.brand?.name ?? '').trim(),
      }))
      .filter(item => item.id && item.name);

    const unique = new Map<string, BrandFilterOption>();
    names.forEach(item => {
      if (!unique.has(item.id)) {
        unique.set(item.id, item);
      }
    });

    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [brandRecords, products]);

  /** Resolve banner brand name from list once — never re-lock user's brand choice */
  const bannerBrandAppliedRef = useRef(false);
  useEffect(() => {
    if (!initialBrandId || bannerBrandAppliedRef.current) return;
    if (brandOptions.length === 0) return;
    const match = brandOptions.find(
      b => String(b.id) === String(initialBrandId),
    );
    bannerBrandAppliedRef.current = true;
    if (match?.name) {
      setBrandNames([match.name]);
    }
  }, [initialBrandId, brandOptions]);

  const selectedBrandLabel = useMemo(() => {
    if (brandIds.length === 0) return '';
    if (brandNames.length > 0) return brandNames[0];
    return (
      brandOptions.find(b => String(b.id) === String(brandIds[0]))?.name || ''
    );
  }, [brandIds, brandNames, brandOptions]);

  const filteredProducts = useMemo(
    () =>
      applyProductFilters({
        products,
        sortBy,
        brandIds: brandIds.length > 0 ? brandIds : null,
        brandNames: brandNames.length > 0 ? brandNames : null,
        priceRange,
        minRating: ratingFilter,
      }),
    [products, sortBy, brandIds, brandNames, priceRange, ratingFilter],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (sortBy !== 'relevance') count += 1;
    if (brandIds.length > 0 || brandNames.length > 0) count += 1;
    if (priceRange !== 'all') count += 1;
    if (ratingFilter !== 'all') count += 1;
    if (doshaFilter !== 'all') count += 1;
    return count;
  }, [sortBy, brandIds, brandNames, priceRange, ratingFilter, doshaFilter]);

  const clearFilters = useCallback(() => {
    setSortBy('relevance');
    setBrandIds([]);
    setBrandNames([]);
    setPriceRange('all');
    setRatingFilter('all');
    setDoshaFilter('all');
  }, []);

  const productGridRef = useRef<FlatList>(null);

  const handleRefresh = useCallback(async () => {
    // Keep selected filters — only refresh catalog data
    productGridRef.current?.scrollToOffset?.({ offset: 0, animated: true });
    refreshTopCategories();
    if (activeCategoryId) {
      refreshSubcategories();
    }
    if (isBothAllView) {
      setBothAllRefreshing(true);
      setBothAllNonce(n => n + 1);
      return;
    }
    await refresh();
  }, [
    refreshTopCategories,
    refreshSubcategories,
    refresh,
    activeCategoryId,
    isBothAllView,
  ]);

  const handleCartUpdate = useCallback(
    async (item: any, newQty: number) => {
      if (!(await requireAuth('Please login to add items to cart'))) return;
      const variantId = String(item?.variant_id);
      if (!variantId) return;
      const currentQty = Number(variantQuantities[variantId] ?? 0);
      if (newQty > currentQty) {
        const stockMsg = getAddQtyBlockMessage(item, newQty);
        if (stockMsg) {
          showSuccessToast(stockMsg, 'error');
          return;
        }
      }
      if (newQty > currentQty && !canAddProductWithoutPrescription(item)) {
        return;
      }
      const result = await dispatch(
        syncCartQuantity({
          variantId,
          quantity: newQty,
          currentQuantity: currentQty,
          prescriptionRequired: item?.prescription_required,
        }),
      );
      if (syncCartQuantity.rejected.match(result)) {
        showSuccessToast(
          (result.payload as string) || 'Failed to update cart',
          'error',
        );
      }
    },
    [dispatch, variantQuantities],
  );

  useWishlistSync(setProducts);

  const handleWishlist = useCallback(async (item: any) => {
    const result = await toggleWishlistItem(item);
    if (result === 'error') {
      showSuccessToast('Unable to update wishlist', 'error');
    }
  }, []);

  const renderProductItem = useCallback(
    ({ item }: { item: any }) => {
      const variantId = String(item?.variant_id);
      const cartQty = variantQuantities[variantId] ?? 0;
      return (
        <View style={styles.cardWrap}>
          <ProductCard
            item={item}
            variant="grid"
            gridWidth={GRID_CARD_WIDTH}
            cartQty={cartQty}
            isAdding={addingVariantId === variantId}
            onPress={() =>
              navigateToProductDetails(props.navigation, item?.variant_id)
            }
            onAdd={() => handleCartUpdate(item, cartQty + 1)}
            onIncrement={() => handleCartUpdate(item, cartQty + 1)}
            onDecrement={() => handleCartUpdate(item, Math.max(0, cartQty - 1))}
            onWishlist={() => handleWishlist(item)}
          />
        </View>
      );
    },
    [variantQuantities, addingVariantId, props.navigation, handleCartUpdate, handleWishlist],
  );

  const renderCategoryItem = useCallback(
    ({ item }: { item: CategoryItem }) => {
      const active = item.id === selectedCategoryId;
      return (
        <TouchableOpacity
          style={[styles.categoryItem, active && styles.categoryItemActive]}
          onPress={() => setSelectedCategoryId(item.id)}
          activeOpacity={0.85}
        >
          <View style={[styles.categoryIconWrap, active && styles.categoryIconWrapActive]}>

            {item.isAll ? (
              <TablerIcon
                name="list"
                size={26}
                color={Colors.primaryColor}
              />
            ) : item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.categoryIcon}
                resizeMode="cover"
              />
            ) : (
              <TablerIcon
                name="photo"
                size={26}
                color={Colors.primaryColor}
              />
            )}

          </View>
          <Text
            style={[styles.categoryLabel, active && styles.categoryLabelActive]}
            numberOfLines={2}
          >
            {renderCategoryName(item.name, styles.categoryLabel)}
            {/* {item.name} */}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedCategoryId],
  );

  const selectedCategoryName = categoryList.find(item => item.id === selectedCategoryId)?.name ?? 'All';

  const selectedSubcategoryName = subcategories.find(item => item.id === selectedSubcategoryId)?.name ?? '';

  const subtitle = selectedSubcategoryName || selectedCategoryName;

  const promoTitle =
    selectedCategoryId !== 'all'
      ? selectedCategoryName
      : String(routeParams.categoryName || '').trim();
  const promoDesc = String(
    (selectedCategoryId !== 'all'
      ? categoryList.find(item => item.id === selectedCategoryId)?.description
      : null) ||
    routeParams.categoryDesc ||
    '',
  ).trim();
  const promoSubscription = String(
    (selectedCategoryId !== 'all'
      ? categoryList.find(item => item.id === selectedCategoryId)?.subscription
      : null) ||
    routeParams.categorySubscription ||
    '',
  ).trim();
  const showPromoCard = Boolean(
    promoTitle && (promoDesc || promoSubscription || selectedCategoryId !== 'all'),
  );

  const showSubcategories = Boolean(activeCategoryId);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.headerWrap}>
        <Header
          title={
            selectedBrandLabel ||
            routeParams.brandName ||
            (!isBrandLanding ? routeParams.categoryName : undefined) ||
            (useHealthRail
              ? 'Shop by Concern'
              : useBothRail
                ? 'Shop all'
                : 'Shop by Category')
          }
          backIcon={Images.backIcon}
          onBack={() => safeGoBack(props.navigation)}
          subtitle={
            selectedBrandLabel || routeParams.brandName
              ? 'Brand products'
              : subtitle
          }
          onRefreshPress={handleRefresh}
          refreshing={listRefreshing}
          showCart
        />
      </View>

      <View style={styles.body}>
        <View style={styles.categoryPanel}>
          {topCategoriesLoading && topCategories.length === 0 ? (
            <ActivityIndicator
              size="small"
              color={Colors.primaryColor}
              style={styles.categoryLoader}
            />
          ) : (
            <FlatList
              data={categoryList}
              keyExtractor={item => item.id}
              renderItem={renderCategoryItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoryListContent}
            />
          )}
        </View>

        <View style={styles.productPanel}>

          <ProductSearchFilterBar
            sortBy={sortBy}
            onSortChange={setSortBy}
            brandIds={brandIds}
            brandNames={brandNames}
            onBrandChange={brands => {
              setBrandIds(brands.map(brand => brand.id));
              setBrandNames(brands.map(brand => brand.name));
            }}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            rating={ratingFilter}
            onRatingChange={setRatingFilter}
            dosha={doshaFilter}
            onDoshaChange={setDoshaFilter}
            brands={brandOptions}
            activeFilterCount={activeFilterCount}
            onClearFilters={clearFilters}
          />

          {showSubcategories && (
            <View style={styles.subcategorySection}>
              {subcategoriesLoading && subcategories.length === 0 ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.primaryColor}
                  style={{ marginVertical: 8 }}
                />
              ) : subcategories.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.subcategoryRow}
                >
                  <TouchableOpacity
                    style={[
                      styles.subcategoryChip,
                      !selectedSubcategoryId && styles.subcategoryChipActive,
                    ]}
                    onPress={() => setSelectedSubcategoryId(null)}
                  >
                    <View style={styles.subcategoryChipIconWrap}>
                      <TablerIcon
                        name="list"
                        size={14}
                        color={
                          !selectedSubcategoryId
                            ? Colors.primaryColor
                            : '#64748B'
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.subcategoryChipText,
                        !selectedSubcategoryId && styles.subcategoryChipTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>

                  {subcategories.map(item => {
                    const active = selectedSubcategoryId === item.id;
                    const imageUri =
                      item?.image_url && typeof item.image_url === 'string'
                        ? item.image_url
                        : '';
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.subcategoryChip,
                          active && styles.subcategoryChipActive,
                        ]}
                        onPress={() => setSelectedSubcategoryId(item.id)}
                      >
                        <View style={styles.subcategoryChipIconWrap}>
                          {imageUri ? (
                            <Image
                              source={{ uri: imageUri }}
                              style={styles.subcategoryChipImage}
                              resizeMode="cover"
                            />
                          ) : (
                            null
                          )}
                        </View>
                        <Text
                          style={[
                            styles.subcategoryChipText,
                            active && styles.subcategoryChipTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : null}
            </View>
          )}

          {!loading && (
            <Text style={styles.resultCount}>
              {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
            </Text>
          )}

          {loading && products.length === 0 ? (
            <TopSellingListSkeleton />
          ) : (
            <FlatList
              ref={productGridRef}
              data={filteredProducts}
              keyExtractor={(item, i) => String(item.variant_id || i)}
              numColumns={2}
              renderItem={renderProductItem}
              style={styles.productList}
              contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
              columnWrapperStyle={styles.columnWrap}
              showsVerticalScrollIndicator={false}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.35}
              refreshControl={
                <RefreshControl
                  refreshing={listRefreshing}
                  onRefresh={handleRefresh}
                  colors={[Colors.primaryColor]}
                  tintColor={Colors.primaryColor}
                />
              }
              ListFooterComponent={
                listLoadingMore ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.primaryColor}
                    style={styles.loader}
                  />
                ) : null
              }
              ListEmptyComponent={
                loading ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.primaryColor}
                    style={styles.loader}
                  />
                ) : (
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyTitle}>No products in this category</Text>
                    <Text style={styles.emptyText}>
                      Try another category or adjust filters.
                    </Text>
                  </View>
                )
              }
            />
          )}
        </View>
      </View>

    </SafeAreaView>
  );
};

export default CategoryProductsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FDFDFB',
  },
  headerWrap: {

    paddingHorizontal: CONTENT_PADDING,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  productPanel: {
    flex: 1,
    paddingLeft: 6,
    marginTop: 5,
    paddingRight: CONTENT_PADDING,
  },
  promoWrap: {
    marginBottom: 4,
  },
  productList: {
    flex: 1,
  },
  categoryPanel: {
    width: CATEGORY_PANEL_WIDTH,
    backgroundColor: '#F8FAFB',
    borderRightWidth: 1,
    borderRightColor: '#EEF2F6',
  },
  categoryLoader: {
    marginTop: 24,
  },
  categoryListContent: {
    paddingVertical: 4,
    paddingBottom: 24,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 3,
    borderRightWidth: 3,
    borderRightColor: 'transparent',
  },
  categoryItemActive: {
    backgroundColor: '#FFFFFF',
    borderRightColor: Colors.primaryColor,
    borderRadius: 5,
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconWrapActive: {
    backgroundColor: '#EAF8F4',
  },
  categoryIcon: {
    borderRadius: 10,
    width: 36,
    height: 36,
    // resizeMode: 'cover',
  },
  categoryLabel: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 11,
    textAlign: 'center',
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    paddingHorizontal: 2,
  },
  categoryLabelActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subcategorySection: {
    marginBottom: 6,
  },
  subcategoryTitle: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 6,
  },
  subcategoryRow: {
    gap: 6,
    paddingRight: 4,
  },
  subcategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    minWidth: 64,
    maxWidth: 140,
    minHeight: 38,

    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  subcategoryChipIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',

    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  subcategoryChipImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },

  subcategoryChipText: {
    flexShrink: 1,

    fontSize: 11,
    lineHeight: 16,

    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',

    includeFontPadding: false,
  },

  subcategoryChipActive: {
    backgroundColor: '#EAF8F4',
    borderColor: Colors.primaryColor,
  },
  subcategoryChipTextActive: {
    color: Colors.primaryColor,
  },
  resultCount: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 6,
  },
  listContent: {
    paddingTop: GRID_GAP,
  },
  columnWrap: {
    gap: GRID_GAP,
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: GRID_CARD_WIDTH,
    height: GRID_CARD_HEIGHT,
    marginBottom: GRID_GAP,
  },
  loader: {
    marginTop: 40,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
});
