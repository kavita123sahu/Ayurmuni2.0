import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StatusBar,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Linking,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { SearchScreenHeader } from '../../components/SearchBar';
import ProductCard, { GRID_CARD_HEIGHT } from '../../components/ProductCard';
import { Colors } from '../../common/Colors';
import { ProductGridSkeleton } from '../../simmerScreen/ShimmerHook';
import { getScreenBottomPadding, SCREEN_PADDING_H } from '../../constants/layout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { syncCartQuantity } from '../../store/slices/cartSlice';
import { TogglewishlistProduct } from '../../services/ProductServices';
import { showSuccessToast } from '../../config/Key';
import { Fonts } from '../../common/Fonts';
import { requireAuth } from '../../services/guestAuth';
import { safeGoBack } from '../../navigation/navigationUtils';
import {
  navigateToCategoryProducts,
  navigateToProductDetails,
} from '../../navigation/productNavigation';
import { useDebounce } from '../../hooks/useDebaunce';
import { useCategoryProducts } from '../../hooks/useCategoryProducts';
import {
  getAddQtyBlockMessage,
} from '../../utils/productStockUtils';
import { canAddProductWithoutPrescription } from '../../utils/prescriptionUtils';
import {
  useGlobalSearch,
  useRecentSearches,
} from '../../hooks/useGlobalSearch';
import {
  GlobalSearchHit,
  GlobalSearchGrouped,
  emptyGrouped,
  countGlobalSearchHits,
  getRecentSearchResults,
} from '../../services/GlobalSearchService';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';

type ListRow =
  | { kind: 'section'; key: string; title: string; count: number }
  | { kind: 'hit'; key: string; hit: GlobalSearchHit }
  | { kind: 'product_grid'; key: string; item: any };

const SECTION_META: Array<{
  key: keyof GlobalSearchGrouped;
  title: string;
  icon: TablerIconName;
}> = [
    { key: 'products', title: 'Products', icon: 'package' },
    { key: 'medicines', title: 'Ayurveda Medicines', icon: 'leaf' },
    { key: 'brands', title: 'Brands', icon: 'ingredient' },
    { key: 'doctors', title: 'Doctors', icon: 'user' },
    { key: 'yoga_sessions', title: 'Yoga Sessions', icon: 'flame' },
    { key: 'diet_plans', title: 'Diet Plans', icon: 'leaf' },
  ];

const hitIcon = (type: GlobalSearchHit['type']): TablerIconName => {
  switch (type) {
    case 'doctor':
      return 'user';
    case 'brand':
      return 'ingredient';
    case 'category':
      return 'report';
    case 'yoga_session':
      return 'flame';
    case 'diet_plan':
      return 'leaf';
    case 'medicine':
      return 'leaf';
    default:
      return 'package';
  }
};

const ProductSearchScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const bottomPadding = getScreenBottomPadding(insets);
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

  const hPad = SCREEN_PADDING_H;
  const gridGap = 10;
  const gridCardWidth = (screenW - hPad * 2 - gridGap) / 2;
  const isCompact = screenW < 360;

  const [searchText, setSearchText] = useState('');
  /** 'live' = typed query API; 'recent' = /search/recent/?id= */
  const [searchSource, setSearchSource] = useState<'idle' | 'live' | 'recent'>(
    'idle',
  );
  const [activeRecentId, setActiveRecentId] = useState<string | null>(null);
  const [recentOverride, setRecentOverride] = useState<GlobalSearchGrouped | null>(
    null,
  );
  const [recentLoadingHit, setRecentLoadingHit] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);
  const recentRequestRef = useRef(0);

  const debouncedSearch = useDebounce(searchText, 350);
  const query = debouncedSearch.trim();

  const isRecentMode = searchSource === 'recent';
  const isLiveMode = searchSource === 'live' && query.length > 0;
  const isSearching = isRecentMode || isLiveMode || recentLoadingHit;

  const {
    loading: globalLoading,
    loadingMore: globalLoadingMore,
    refreshing: globalRefreshing,
    error: globalError,
    results: liveResults,
    total: liveTotal,
    refresh: refreshGlobal,
    reload: reloadGlobal,
    loadMore: loadMoreGlobal,
    commitRecentSearch,
  } = useGlobalSearch(query, isLiveMode);

  const results = isRecentMode && recentOverride ? recentOverride : liveResults;
  const total =
    isRecentMode && recentOverride
      ? countGlobalSearchHits(recentOverride)
      : liveTotal;

  const {
    loading: recentLoading,
    items: recentItems,
    refresh: refreshRecent,
    clearAll: clearRecentSearches,
    removeOne: removeRecentSearch,
  } = useRecentSearches(true);

  const [clearingRecent, setClearingRecent] = useState(false);

  useEffect(() => {
    if (searchSource === 'idle') {
      refreshRecent();
    }
  }, [searchSource]); // eslint-disable-line react-hooks/exhaustive-deps

  useFocusEffect(
    useCallback(() => {
      refreshRecent();
    }, [refreshRecent]),
  );

  const onSearchChange = useCallback((text: string) => {
    setSearchText(text);
    setActiveRecentId(null);
    setRecentOverride(null);
    setRecentError(null);
    setRecentLoadingHit(false);
    // Typing → live suggestions (save_recent stays false in useGlobalSearch)
    setSearchSource(text.trim() ? 'live' : 'idle');
  }, []);

  /** Keyboard submit only runs search — does NOT save recent (click saves). */
  const onSearchSubmit = useCallback(() => {
    const q = searchText.trim();
    if (!q) return;
    setSearchSource('live');
  }, [searchText]);

  const onClearRecent = useCallback(async () => {
    if (clearingRecent) return;
    try {
      setClearingRecent(true);
      await clearRecentSearches();
    } catch (e: any) {
      showSuccessToast(e?.message || 'Unable to clear recent searches', 'error');
      refreshRecent();
    } finally {
      setClearingRecent(false);
    }
  }, [clearingRecent, clearRecentSearches, refreshRecent]);

  // Idle browse is always global (no medicine/product service bias).
  // Typed search uses useGlobalSearch (products + medicines + more).
  const productFilter = useMemo(() => {
    if (isSearching) return { search: undefined };
    return {};
  }, [isSearching]);

  const {
    products,
    setProducts,
    loading: browseLoading,
    loadingMore,
    refreshing: browseRefreshing,
    refresh: refreshBrowse,
    loadMore,
  } = useCategoryProducts(productFilter, [], {
    enabled: searchSource === 'idle',
  });

  const applyRecentSearch = useCallback(
    async (item: { id: string; query: string }) => {
      const reqId = ++recentRequestRef.current;
      const chipQuery = String(item.query || '').trim();

      // Lock to recent mode BEFORE updating text so live search never races
      setSearchSource('recent');
      setActiveRecentId(item.id);
      setRecentOverride(null);
      setRecentError(null);
      setRecentLoadingHit(true);
      setSearchText(chipQuery);

      try {
        const res = await getRecentSearchResults(item.id);
        if (reqId !== recentRequestRef.current) return;

        const nextQuery = (res.query || chipQuery).trim();
        if (nextQuery) setSearchText(nextQuery);

        const grouped = res.grouped || emptyGrouped();
        const hitCount = countGlobalSearchHits(grouped);

        if (hitCount === 0 && nextQuery) {
          // Recent id returned empty — fall back to live search for that query
          setRecentOverride(null);
          setActiveRecentId(null);
          setSearchSource('live');
          setSearchText(nextQuery);
          return;
        }

        setRecentOverride(grouped);
        setSearchSource('recent');
      } catch (e: any) {
        if (reqId !== recentRequestRef.current) return;
        setRecentError(e?.message || 'Unable to load recent search');
        // Fall back to live search by query text
        setRecentOverride(null);
        setActiveRecentId(null);
        setSearchSource(chipQuery ? 'live' : 'idle');
        if (chipQuery) setSearchText(chipQuery);
      } finally {
        if (reqId === recentRequestRef.current) {
          setRecentLoadingHit(false);
        }
      }
    },
    [],
  );

  const onRefresh = useCallback(() => {
    if (isRecentMode && activeRecentId) {
      applyRecentSearch({ id: activeRecentId, query: searchText });
      return;
    }
    if (isLiveMode) refreshGlobal();
    else {
      refreshBrowse();
      refreshRecent();
    }
  }, [
    isRecentMode,
    activeRecentId,
    searchText,
    isLiveMode,
    applyRecentSearch,
    refreshGlobal,
    refreshBrowse,
    refreshRecent,
  ]);

  const handleCartUpdate = useCallback(
    async (item: any, newQty: number) => {
      if (!(await requireAuth('Please login to add items to cart'))) return;
      const variantId = String(item?.variant_id);
      if (!variantId) return;

      const stockMsg = getAddQtyBlockMessage(item, newQty);
      if (stockMsg) {
        showSuccessToast(stockMsg, 'error');
        return;
      }

      const currentQty = Number(variantQuantities[variantId] ?? 0);
      if (newQty > currentQty && !canAddProductWithoutPrescription(item)) {
        return;
      }

      const result = await dispatch(
        syncCartQuantity({ variantId, quantity: newQty }),
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

  const handleWishlist = useCallback(
    async (item: any) => {
      if (!(await requireAuth('Please login to save wishlist items'))) return;
      const old = item?.is_wishlist_item;
      setProducts((prev: any[]) =>
        prev.map(p =>
          p.variant_id === item.variant_id
            ? { ...p, is_wishlist_item: !old }
            : p,
        ),
      );
      try {
        await TogglewishlistProduct(item.variant_id, 'POST');
      } catch {
        setProducts((prev: any[]) =>
          prev.map(p =>
            p.variant_id === item.variant_id
              ? { ...p, is_wishlist_item: old }
              : p,
          ),
        );
      }
    },
    [setProducts],
  );

  const openHit = useCallback(
    (hit: GlobalSearchHit) => {
      // Only clicked suggestions are saved to recent search
      const typed = String(searchText || query || '').trim();
      const clicked =
        String(hit.title || '').trim() || typed;
      if (clicked) {
        commitRecentSearch(clicked).then(() => refreshRecent());
      }

      const raw = hit.raw || {};
      switch (hit.type) {
        case 'product':
        case 'medicine': {
          navigateToProductDetails(
            props.navigation,
            raw.variant_id ?? raw.product_id ?? raw.id ?? hit.id,
          );
          break;
        }
        case 'doctor': {
          props.navigation.navigate('DoctorProfile', {
            doctorData: {
              ...raw,
              id: raw.id ?? raw.doctor_id ?? hit.id,
            },
          });
          break;
        }
        case 'brand': {
          navigateToCategoryProducts(props.navigation, {
            categoryMode: 'product',
            brandOnly: true,
            brand_name_id: String(raw.brand_id ?? raw.brand_name_id ?? raw.id ?? hit.id),
            brandId: String(raw.brand_id ?? raw.brand_name_id ?? raw.id ?? hit.id),
          });
          break;
        }
        case 'category': {
          navigateToCategoryProducts(props.navigation, {
            categoryId: String(
              raw.id ?? raw.category_id ?? raw.product_category_id ?? hit.id,
            ),
            categoryName: hit.title,
            categoryMode: raw.health_category_id ? 'health' : 'product',
            healthCategoryId: raw.health_category_id
              ? String(raw.health_category_id)
              : undefined,
          });
          break;
        }
        case 'yoga_session': {
          props.navigation.navigate('YogaScreen', {
            item: raw,
            sessionId: raw.id ?? raw.yoga_session_id ?? hit.id,
          });
          break;
        }
        case 'diet_plan': {
          const planId = String(raw.id ?? raw.diet_plan_id ?? hit.id ?? '').trim();
          props.navigation.navigate('DietPlanDetail', {
            planId,
            item: {
              ...raw,
              id: raw.id ?? hit.id,
              diet_plan_id: raw.diet_plan_id ?? raw.id ?? hit.id,
              name: raw.name || hit.title,
            },
          });
          break;
        }
        case 'banner': {
          const url = String(
            raw.redirect_url || raw.link || raw.url || '',
          ).trim();
          if (url) Linking.openURL(url).catch(() => undefined);
          break;
        }
        default:
          break;
      }
    },
    [props.navigation, searchText, query, commitRecentSearch, refreshRecent],
  );

  const searchRows: ListRow[] = useMemo(() => {
    if (!isSearching) return [];
    const rows: ListRow[] = [];
    SECTION_META.forEach(section => {
      const hits = (results[section.key] || []).filter(
        hit =>
          hit &&
          hit.id &&
          hit.title &&
          String(hit.title).trim().length > 0,
      );
      if (!hits.length) return;
      rows.push({
        kind: 'section',
        key: `sec-${section.key}`,
        title: section.title,
        count: hits.length,
      });
      hits.forEach(hit => {
        rows.push({
          kind: 'hit',
          key: `${section.key}-${hit.id}-${hit.title}`,
          hit,
        });
      });
    });
    return rows;
  }, [isSearching, results]);

  const browseRows: ListRow[] = useMemo(() => {
    if (isSearching) return [];
    return products.map((item: any, i: number) => ({
      kind: 'product_grid' as const,
      key: String(item.variant_id || i),
      item,
    }));
  }, [isSearching, products]);

  const listData = isSearching ? searchRows : browseRows;

  const renderHit = (hit: GlobalSearchHit) => (
    <TouchableOpacity
      style={styles.hitRow}
      activeOpacity={0.85}
      onPress={() => openHit(hit)}
    >
      <View style={styles.hitThumb}>
        {hit.image ? (
          <Image source={{ uri: hit.image }} style={styles.hitImage} />
        ) : (
          <TablerIcon
            name={hitIcon(hit.type)}
            size={20}
            color={Colors.primaryColor}
          />
        )}
      </View>
      <View style={styles.hitTextWrap}>
        <Text style={styles.hitTitle} numberOfLines={2}>
          {hit.title}
        </Text>
        {!!hit.subtitle && (
          <Text style={styles.hitSub} numberOfLines={1}>
            {hit.subtitle}
          </Text>
        )}
      </View>
      <View style={styles.hitBadge}>
        <Text style={styles.hitBadgeText} numberOfLines={1}>
          {hit.type.replace('_', ' ')}
        </Text>
      </View>
      <TablerIcon name="chevron-right" size={16} color="#94A3B8" />
    </TouchableOpacity>
  );

  const renderItem = useCallback(
    ({ item }: { item: ListRow }) => {
      if (item.kind === 'section') {
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <Text style={styles.sectionCount}>{item.count}</Text>
          </View>
        );
      }
      if (item.kind === 'hit') {
        return renderHit(item.hit);
      }

      const product = item.item;
      const variantId = String(product?.variant_id);
      const cartQty = variantQuantities[variantId] ?? 0;
      return (
        <View style={[styles.cardWrap, { width: gridCardWidth }]}>
          <ProductCard
            item={product}
            variant="grid"
            gridWidth={gridCardWidth}
            cartQty={cartQty}
            isAdding={addingVariantId === variantId}
            onPress={() =>
              navigateToProductDetails(props.navigation, product?.variant_id)
            }
            onAdd={() => handleCartUpdate(product, cartQty + 1)}
            onIncrement={() => handleCartUpdate(product, cartQty + 1)}
            onDecrement={() =>
              handleCartUpdate(product, Math.max(0, cartQty - 1))
            }
            onWishlist={() => handleWishlist(product)}
          />
        </View>
      );
    },
    [
      variantQuantities,
      addingVariantId,
      props.navigation,
      handleCartUpdate,
      handleWishlist,
      gridCardWidth,
    ],
  );

  const loading =
    recentLoadingHit ||
    (isLiveMode
      ? globalLoading && total === 0
      : searchSource === 'idle'
        ? browseLoading && products.length === 0
        : false);
  const refreshing = isRecentMode
    ? recentLoadingHit
    : isLiveMode
      ? globalRefreshing
      : browseRefreshing;
  const displayError = isRecentMode ? recentError : globalError;

  const resultLabel = isSearching
    ? recentLoadingHit || globalLoading
      ? 'Searching…'
      : `${total} suggestion${total === 1 ? '' : 's'}`
    : `${products.length} product${products.length === 1 ? '' : 's'}`;

  const RecentSearchesBlock = () => {
    if (searchSource !== 'idle') return null;
    if (recentLoading && recentItems.length === 0) {
      return (
        <View style={styles.recentLoading}>
          <ActivityIndicator size="small" color={Colors.primaryColor} />
        </View>
      );
    }

    return (
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent searches</Text>
          {recentItems.length > 0 ? (
            <TouchableOpacity
              onPress={onClearRecent}
              disabled={clearingRecent}
              hitSlop={8}
              activeOpacity={0.85}
            >
              {clearingRecent ? (
                <ActivityIndicator size="small" color={Colors.primaryColor} />
              ) : (
                <Text style={styles.recentClear}>Clear</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
        {recentItems.length === 0 ? (
          <Text style={styles.recentEmpty}>
            Tap a suggestion while searching to save it here
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentChipRow}
            keyboardShouldPersistTaps="handled"
          >
            {recentItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.recentChip,
                  isCompact && styles.recentChipCompact,
                ]}
                activeOpacity={0.85}
                onPress={() => applyRecentSearch(item)}
                onLongPress={() => {
                  removeRecentSearch({
                    id: item.id,
                    query: item.query,
                  }).catch(() => undefined);
                }}
              >
                <TablerIcon
                  name="search"
                  size={12}
                  color={Colors.primaryColor}
                />
                <Text
                  style={[
                    styles.recentChipText,
                    isCompact && styles.recentChipTextCompact,
                  ]}
                  numberOfLines={1}
                >
                  {item.query}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const SuggestionsHint = () => {
    if (!isLiveMode || recentLoadingHit) return null;
    return (
      <Text style={styles.suggestionsHint}>
        Suggestions — tap one to open and save in Recent
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.headerBackground} />

      <View style={styles.headerWrap}>
        <SearchScreenHeader
          onBack={() => safeGoBack(props.navigation)}
          placeholder="Search ashwagandha, doctors, yoga…"
          value={searchText}
          onChangeText={onSearchChange}
          onSubmitEditing={onSearchSubmit}
          autoFocus
        />
        <View style={{ paddingHorizontal: hPad }}>
          <RecentSearchesBlock />
          <SuggestionsHint />
          {!loading && (
            <Text style={styles.resultCount}>{resultLabel}</Text>
          )}
        </View>
      </View>

      {loading ? (
        <ProductGridSkeleton
          cardWidth={gridCardWidth}
          gap={gridGap}
          count={6}
          paddingHorizontal={hPad}
        />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={item => item.key}
          numColumns={isSearching ? 1 : 2}
          key={isSearching ? 'search' : 'browse'}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: hPad, paddingBottom: bottomPadding },
          ]}
          columnWrapperStyle={
            isSearching
              ? undefined
              : { gap: gridGap, justifyContent: 'space-between' }
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={Keyboard.dismiss}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primaryColor]}
              tintColor={Colors.primaryColor}
            />
          }
          onEndReached={
            isRecentMode ? undefined : isLiveMode ? loadMoreGlobal : loadMore
          }
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            !isRecentMode && (isLiveMode ? globalLoadingMore : loadingMore) ? (
              <ActivityIndicator
                size="small"
                color={Colors.primaryColor}
                style={styles.footerLoader}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              {isSearching && displayError ? (
                <>
                  <Text style={styles.emptyTitle}>Search failed</Text>
                  <Text style={styles.emptyText}>{displayError}</Text>
                  <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => {
                      if (isRecentMode && activeRecentId) {
                        applyRecentSearch({
                          id: activeRecentId,
                          query: searchText,
                        });
                      } else {
                        reloadGlobal();
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.retryText}>Try again</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.emptyTitle}>
                    {isSearching ? 'No matches found' : 'No products yet'}
                  </Text>
                  <Text style={styles.emptyText}>
                    {isSearching
                      ? `Nothing matched "${query || searchText}". Try products, brands, doctors, yoga, or diet plans.`
                      : 'Start typing or pick a recent search.'}
                  </Text>
                </>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ProductSearchScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerWrap: {
    backgroundColor: Colors.headerBackground,
    paddingBottom: 4,
  },
  recentSection: {
    marginTop: 10,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },
  recentClear: {
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  recentEmpty: {
    fontSize: 12,
    lineHeight: 17,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    paddingBottom: 4,
  },
  suggestionsHint: {
    marginTop: 8,
    marginBottom: 2,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  recentLoading: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  recentChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 4,
    paddingVertical: 2,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 220,
    minHeight: 34,
  },
  recentChipCompact: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 32,
    maxWidth: 180,
  },
  recentChipText: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
    flexShrink: 1,
  },
  recentChipTextCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  resultCount: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  listContent: {
    paddingTop: 10,
    flexGrow: 1,
  },
  cardWrap: {
    marginBottom: 10,
    height: GRID_CARD_HEIGHT,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  sectionCount: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  hitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    gap: 8,
  },
  hitThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.onfillColor,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hitImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  hitTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  hitTitle: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  hitSub: {
    marginTop: 2,
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
  },
  hitBadge: {
    maxWidth: 86,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  hitBadgeText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    textTransform: 'capitalize',
  },
  footerLoader: {
    marginVertical: 16,
  },
  loaderWrap: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 10,
  },
  loaderText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
    lineHeight: 19,
  },
  retryBtn: {
    marginTop: 14,
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: '#FFF',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
  },
});

// type ListRow =
//   | { kind: 'section'; key: string; title: string; count: number }
//   | { kind: 'hit'; key: string; hit: GlobalSearchHit }
//   | { kind: 'product_grid'; key: string; item: any };
