import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  FlatList,
  Text,
  RefreshControl,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import { ExpandableSearch } from '../../components/SearchBar';
import PromoCard from '../../components/PromoCard';
import SectionHeader from '../../components/SectionHeader';
import ProductCard from '../../components/ProductCard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import AllDoctorCard from '../../components/AllDoctorCard';
import { Fonts } from '../../common/Fonts';
import { useAllDoctors } from '../../hooks/useConsultData';
import {
  AllDoctorCardSkeleton,
  ProductGridSkeleton,
  DiseaseChipSkeleton,
} from '../../simmerScreen/ShimmerHook';
import { useDebounce } from '../../hooks/useDebaunce';
import { useCategoryProducts } from '../../hooks/useCategoryProducts';
import { useHealthCategories } from '../../hooks/useHealthCategories';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { syncCartQuantity } from '../../store/slices/cartSlice';
import { TogglewishlistProduct } from '../../services/ProductServices';
import { showSuccessToast } from '../../config/Key';
import { requireAuth } from '../../services/guestAuth';
import { navigateToProductDetails } from '../../navigation/productNavigation';
import { getScreenBottomPadding } from '../../constants/layout';
import {
  canAddProductQty,
  isProductOutOfStock,
} from '../../utils/productStockUtils';
import { canAddProductWithoutPrescription } from '../../utils/prescriptionUtils';

const { width: SCREEN_W } = Dimensions.get('window');
const H_PAD = 20;
const GRID_GAP = 10;
const CARD_W = (SCREEN_W - H_PAD * 2 - GRID_GAP) / 2;
const DOCTOR_PREVIEW_COUNT = 4;

/**
 * Consult by Concern → details:
 * - Specialists for health category
 * - Disease subcategories from customers/health-categories/?id=
 * - Products filtered by health_category_id (+ disease when selected)
 */
const CategoryDoctor = (props: any) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const bottomPadding = getScreenBottomPadding(insets);
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

  const [searchText, setSearchText] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  /** Selected disease / subcategory id (null = whole health category) */
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(
    null,
  );

  const { categoryName, categoryId } = route.params || {};
  const concernId = categoryId ? String(categoryId) : '';
  const debouncedSearch = useDebounce(searchText, 400);

  // Diseases = children of health category
  const {
    categories: diseases,
    loading: diseasesLoading,
    refresh: refreshDiseases,
  } = useHealthCategories(concernId || null);

  useEffect(() => {
    setSelectedDiseaseId(null);
  }, [concernId]);

  // Doctors: disease → health_disease_id; category All → health_category_id (never unfiltered)
  const apiFilters = useMemo(() => {
    const base: {
      search?: string;
      page_size: number;
      health_disease_id?: string;
      health_category_id?: string;
    } = {
      page_size: 50,
    };

    if (debouncedSearch.trim()) {
      base.search = debouncedSearch.trim();
    }

    if (selectedDiseaseId) {
      base.health_disease_id = selectedDiseaseId;
    } else if (concernId) {
      base.health_category_id = concernId;
    }

    return base;
  }, [concernId, selectedDiseaseId, debouncedSearch]);

  const {
    loading: doctorsLoading,
    doctorData,
    refresh: refreshDoctors,
    refreshing: doctorsRefreshing,
  } = useAllDoctors(apiFilters);

  // Products: always scoped to this health category; narrow by disease when picked
  const productFilter = useMemo(() => {
    if (debouncedSearch.trim()) {
      return { search: debouncedSearch.trim() };
    }

    if (!concernId) {
      return {};
    }

    // Child disease from health-categories/?id=parent → use as health_category_id
    // (same as CategoryProducts health mode)
    return {
      health_category_id: selectedDiseaseId ?? concernId,
      ...(selectedDiseaseId
        ? { health_disease_id: selectedDiseaseId }
        : {}),
    };
  }, [concernId, selectedDiseaseId, debouncedSearch]);

  const {
    products,
    setProducts,
    loading: productsLoading,
    loadingMore,
    refreshing: productsRefreshing,
    refresh: refreshProducts,
    loadMore,
  } = useCategoryProducts(productFilter, [], {
    enabled: Boolean(concernId) || Boolean(debouncedSearch.trim()),
  });

  const previewDoctors = useMemo(
    () =>
      Array.isArray(doctorData)
        ? doctorData.slice(0, DOCTOR_PREVIEW_COUNT)
        : [],
    [doctorData],
  );

  const hasDoctors = previewDoctors.length > 0;
  const showDoctorsSection = doctorsLoading || hasDoctors;
  const showDiseases = Boolean(concernId) && (diseasesLoading || diseases.length > 0);

  const selectedDiseaseName = useMemo(
    () => diseases.find(d => d.id === selectedDiseaseId)?.name,
    [diseases, selectedDiseaseId],
  );

  const productSectionTitle = selectedDiseaseName
    ? `${selectedDiseaseName} Products`
    : 'Related Products';

  const onRefresh = useCallback(async () => {
    await Promise.all([
      refreshDoctors(),
      refreshProducts(),
      refreshDiseases(),
    ]);
  }, [refreshDoctors, refreshProducts, refreshDiseases]);

  const handleDoctorPress = useCallback(
    (item: any) => {
      props.navigation.navigate('DoctorProfile', { doctorData: item });
    },
    [props.navigation],
  );

  const handleViewAllDoctors = useCallback(() => {
    navigation.navigate('AllDoctors', {
      categoryName: categoryName || undefined,
      ...(selectedDiseaseId
        ? { health_disease_id: selectedDiseaseId }
        : { health_category_id: concernId }),
    });
  }, [navigation, concernId, categoryName, selectedDiseaseId]);

  const handleCartUpdate = useCallback(
    async (item: any, newQty: number) => {
      if (!(await requireAuth('Please login to add items to cart'))) return;
      const variantId = String(item?.variant_id);
      if (!variantId) return;
      if (newQty > 0 && isProductOutOfStock(item)) {
        showSuccessToast('This product is out of stock', 'error');
        return;
      }
      if (!canAddProductQty(item, newQty)) {
        showSuccessToast('Not enough stock available', 'error');
        return;
      }
      const currentQty = Number(variantQuantities[variantId] ?? 0);
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

  const handleWishlist = useCallback(
    async (item: any) => {
      if (!(await requireAuth('Please login to save wishlist items'))) return;
      const old = item?.is_wishlist_item;
      setProducts(prev =>
        prev.map(p =>
          p.variant_id === item.variant_id
            ? { ...p, is_wishlist_item: !old }
            : p,
        ),
      );
      try {
        await TogglewishlistProduct(item.variant_id, 'POST');
      } catch {
        setProducts(prev =>
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

  const ListHeader = useCallback(
    () => (
      <>
        <ExpandableSearch
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search doctors or products..."
          showTrigger={false}
          expanded={searchExpanded}
          onExpandedChange={setSearchExpanded}
        />
        <PromoCard
          title={`${categoryName || 'Health'} Care`}
          desc="Specialists & remedies for this health concern"
          imageLeftIconName="plus-bag"
          image={require('../../assets/images/doctorbanner.png')}
          buttontext="Book an appointment online"
          showButton={false}
        />

        {showDiseases ? (
          <View style={styles.diseaseSection}>
            <Text style={styles.diseaseTitle}>All Disease</Text>
            {diseasesLoading && diseases.length === 0 ? (
              <DiseaseChipSkeleton />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.diseaseRow}
              >
                <TouchableOpacity
                  style={[
                    styles.diseaseChip,
                    !selectedDiseaseId && styles.diseaseChipActive,
                  ]}
                  onPress={() => setSelectedDiseaseId(null)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.diseaseChipText,
                      !selectedDiseaseId && styles.diseaseChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>

                {diseases.map((item, index) => {
                  const active = selectedDiseaseId === item.id;
                  return (
                    <TouchableOpacity
                      key={String(item?.id ?? `disease-${index}`)}
                      style={[
                        styles.diseaseChip,
                        active && styles.diseaseChipActive,
                      ]}
                      onPress={() => setSelectedDiseaseId(item.id)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.diseaseChipText,
                          active && styles.diseaseChipTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        ) : null}

        {showDoctorsSection ? (
          <>
            <SectionHeader
              title="Related Doctors"
              actionText={
                doctorData.length > DOCTOR_PREVIEW_COUNT ? 'View all' : ''
              }
              onPress={
                doctorData.length > DOCTOR_PREVIEW_COUNT
                  ? handleViewAllDoctors
                  : undefined
              }
            />

            {doctorsLoading && !hasDoctors ? (
              <AllDoctorCardSkeleton count={3} />
            ) : (
              <View style={styles.doctorsBlock}>
                {previewDoctors.map((item: any, index: number) => (
                  <AllDoctorCard
                    key={String(item?.id ?? item?.doctor_id ?? `doc-${index}`)}
                    item={item}
                    onPress={() => handleDoctorPress(item)}
                  />
                ))}
                {doctorData.length > DOCTOR_PREVIEW_COUNT ? (
                  <Text
                    style={styles.viewAllHint}
                    onPress={handleViewAllDoctors}
                  >
                    View all {doctorData.length} doctors
                  </Text>
                ) : null}
              </View>
            )}
          </>
        ) : null}

        {(productsLoading || products.length > 0) && (
          <>
            <SectionHeader title={productSectionTitle} />
            {!productsLoading && products.length > 0 ? (
              <Text style={styles.resultCount}>
                {products.length} product{products.length === 1 ? '' : 's'}
              </Text>
            ) : null}
          </>
        )}
      </>
    ),
    [
      searchText,
      searchExpanded,
      categoryName,
      showDiseases,
      diseasesLoading,
      diseases,
      selectedDiseaseId,
      showDoctorsSection,
      doctorData.length,
      doctorsLoading,
      hasDoctors,
      previewDoctors,
      handleDoctorPress,
      handleViewAllDoctors,
      productSectionTitle,
      productsLoading,
      products.length,
    ],
  );

  const renderProduct = useCallback(
    ({ item }: { item: any }) => {
      const variantId = String(item?.variant_id);
      const cartQty = variantQuantities[variantId] ?? 0;
      return (
        <View style={styles.cardWrap}>
          <ProductCard
            item={item}
            variant="grid"
            gridWidth={CARD_W}
            cartQty={cartQty}
            isAdding={addingVariantId === variantId}
            onPress={() =>
              navigateToProductDetails(navigation, item.variant_id)
            }
            onAdd={() => handleCartUpdate(item, cartQty + 1)}
            onIncrement={() => handleCartUpdate(item, cartQty + 1)}
            onDecrement={() => handleCartUpdate(item, Math.max(0, cartQty - 1))}
            onWishlist={() => handleWishlist(item)}
          />
        </View>
      );
    },
    [
      variantQuantities,
      addingVariantId,
      navigation,
      handleCartUpdate,
      handleWishlist,
    ],
  );

  const refreshing = doctorsRefreshing || productsRefreshing;
  const showProductSkeleton = productsLoading && products.length === 0;
  const hasActiveProductFilters =
    Boolean(debouncedSearch.trim()) || Boolean(selectedDiseaseId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Header
        title={categoryName || 'Concern'}
        subtitle="Doctors, conditions & products"
        onBack={() => navigation.goBack()}
        onSearchPress={() => setSearchExpanded(true)}
        onRefreshPress={onRefresh}
      />

      {showProductSkeleton && products.length === 0 && !hasDoctors ? (
        <View style={styles.pad}>
          <ListHeader />
          <ProductGridSkeleton cardWidth={CARD_W} gap={GRID_GAP} count={6} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, i) => String(item.variant_id || i)}
          numColumns={2}
          renderItem={renderProduct}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomPadding },
          ]}
          columnWrapperStyle={
            products.length > 0 ? styles.columnWrap : undefined
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primaryColor]}
              tintColor={Colors.primaryColor}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            loadingMore ? (
              <ProductGridSkeleton
                cardWidth={CARD_W}
                gap={GRID_GAP}
                count={2}
              />
            ) : null
          }
          ListEmptyComponent={
            !productsLoading && products.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>
                  {hasActiveProductFilters
                    ? 'No products found'
                    : 'No products available'}
                </Text>
                <Text style={styles.emptySub}>
                  {hasActiveProductFilters
                    ? 'Try clearing search or selecting another disease.'
                    : 'Products will appear here when available.'}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default CategoryDoctor;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: H_PAD,
    backgroundColor: '#FDFDFB',
  },
  pad: { flex: 1 },
  listContent: {
    flexGrow: 1,
  },
  columnWrap: {
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: CARD_W,
    marginBottom: 4,
  },
  doctorsBlock: {
    marginBottom: 4,
    gap: 0,
  },
  viewAllHint: {
    marginTop: 2,
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  diseaseSection: {
    marginBottom: 6,
    marginTop: 2,
  },
  diseaseTitle: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
  },
  diseaseRow: {
    gap: 8,
    paddingRight: 4,
    paddingBottom: 2,
  },
  diseaseChip: {
    minWidth: 68,
    maxWidth: 140,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diseaseChipActive: {
    backgroundColor: '#EAF8F4',
    borderColor: Colors.primaryColor,
  },
  diseaseChipText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
  },
  diseaseChipTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  resultCount: {
    marginBottom: 8,
    marginTop: -2,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  emptyBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  emptySub: {
    marginTop: 4,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
});
