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
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import { ExpandableSearch } from '../../components/SearchBar';
import PromoCard from '../../components/PromoCard';
import SectionHeader from '../../components/SectionHeader';
import ProductCard from '../../components/ProductCard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import { Images } from '../../common/Images';
import TablerIcon from '../../components/TablerIcon';
import AllDoctorCard from '../../components/AllDoctorCard';
import { Fonts } from '../../common/Fonts';
import { useAllDoctors } from '../../hooks/useConsultData';
import {
  ProductGridSkeleton,
  DiseaseChipSkeleton,
  TopDoctorsCardSkeleton,
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
import {
  getScreenBottomPadding,
  FILTER_CHIP_PADDING_H,
  FILTER_CHIP_PADDING_V,
  FILTER_CHIP_RADIUS,
} from '../../constants/layout';
import {
  DOCTOR_GRID,
  getDoctorGridCardWidth,
} from '../../constants/doctorGridLayout';
import {
  canAddProductQty,
  isProductOutOfStock,
} from '../../utils/productStockUtils';
import { canAddProductWithoutPrescription } from '../../utils/prescriptionUtils';
import SuggestedCard from '../../components/SuggestedCard';
import * as _PATIENT from '../../services/PatientServices';
import * as _YOGA_SERVICES from '../../services/YogaServices';
import { normalizeDietPlanList } from '../../utils/dietPlanUtils';
import { mapDietPlanForHome } from '../../store/slices/homeSlice';
import { normalizeYogaSessionList } from '../../utils/yogaUtils';
import { itemMatchesHealthConcern } from '../../utils/healthConcernMatch';

const { width: SCREEN_W } = Dimensions.get('window');
const H_PAD = 20;
const GRID_GAP = 10;
const CARD_W = getDoctorGridCardWidth();
const PRODUCT_CARD_W = (SCREEN_W - H_PAD * 2 - GRID_GAP) / 2;
const DIET_YOGA_PREVIEW = 6;

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
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [yogaSessions, setYogaSessions] = useState<any[]>([]);
  const [dietLoading, setDietLoading] = useState(false);
  const [yogaLoading, setYogaLoading] = useState(false);

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
    if (!concernId && !debouncedSearch.trim()) {
      return {};
    }

    return {
      ...(concernId
        ? {
            health_category_id: concernId,
            ...(selectedDiseaseId
              ? { health_disease_id: selectedDiseaseId }
              : {}),
          }
        : {}),
      ...(debouncedSearch.trim()
        ? { search: debouncedSearch.trim() }
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

  const selectedDiseaseName = useMemo(
    () => diseases.find(d => d.id === selectedDiseaseId)?.name,
    [diseases, selectedDiseaseId],
  );

  const concernMatch = useMemo(
    () => ({
      healthCategoryId: concernId || null,
      healthDiseaseId: selectedDiseaseId,
      categoryName: categoryName || null,
      diseaseName: selectedDiseaseName || null,
      strict: Boolean(concernId),
    }),
    [concernId, selectedDiseaseId, categoryName, selectedDiseaseName],
  );

  const filterByConcern = useCallback(
    (list: any[]) =>
      (Array.isArray(list) ? list : []).filter(item =>
        itemMatchesHealthConcern(item, concernMatch),
      ),
    [concernMatch],
  );

  const diseaseIdSet = useMemo(
    () => new Set(diseases.map(d => String(d.id)).filter(Boolean)),
    [diseases],
  );

  const doctorMatchesConcern = useCallback(
    (doctor: any) => {
      if (filterByConcern([doctor]).length > 0) return true;
      if (!concernId || selectedDiseaseId) return false;
      const docDiseases = doctor?.health_diseases;
      if (!Array.isArray(docDiseases)) return false;
      return docDiseases.some((entry: any) =>
        diseaseIdSet.has(String(entry?.id ?? entry)),
      );
    },
    [concernId, selectedDiseaseId, filterByConcern, diseaseIdSet],
  );

  const doctorList = useMemo(() => {
    const raw = Array.isArray(doctorData) ? doctorData : [];
    if (!concernId) return raw;
    return raw.filter(doctorMatchesConcern);
  }, [doctorData, concernId, doctorMatchesConcern]);

  const hasDoctors = doctorList.length > 0;
  const showDiseases =
    Boolean(concernId) && (diseasesLoading || diseases.length > 0);

  const loadConcernDiet = useCallback(async () => {
    if (!concernId && !debouncedSearch.trim()) {
      setDietPlans([]);
      return;
    }
    setDietLoading(true);
    try {
      const res = await _PATIENT.getDietPlans({
        type: 'all',
        page: 1,
        page_size: 24,
        ...(selectedDiseaseId
          ? { health_disease_id: selectedDiseaseId }
          : concernId
            ? { health_category_id: concernId }
            : {}),
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      });
      const list = filterByConcern(normalizeDietPlanList(res))
        .map(mapDietPlanForHome)
        .filter(item => item.id)
        .slice(0, DIET_YOGA_PREVIEW);
      setDietPlans(list);
    } catch {
      setDietPlans([]);
    } finally {
      setDietLoading(false);
    }
  }, [concernId, selectedDiseaseId, debouncedSearch, filterByConcern]);

  const loadConcernYoga = useCallback(async () => {
    if (!concernId && !debouncedSearch.trim()) {
      setYogaSessions([]);
      return;
    }
    setYogaLoading(true);
    try {
      const res = await _YOGA_SERVICES.getYogaSession({
        ...(selectedDiseaseId
          ? { health_disease_id: selectedDiseaseId }
          : concernId
            ? { health_category_id: concernId }
            : {}),
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      });
      const list = filterByConcern(normalizeYogaSessionList(res)).slice(
        0,
        DIET_YOGA_PREVIEW,
      );
      setYogaSessions(list);
    } catch {
      setYogaSessions([]);
    } finally {
      setYogaLoading(false);
    }
  }, [concernId, selectedDiseaseId, debouncedSearch, filterByConcern]);

  useEffect(() => {
    loadConcernDiet();
    loadConcernYoga();
  }, [loadConcernDiet, loadConcernYoga]);

  const productSectionTitle = selectedDiseaseName
    ? `${selectedDiseaseName} Products`
    : `${categoryName || 'Related'} Products`;

  const dietSectionTitle = selectedDiseaseName
    ? `${selectedDiseaseName} Diet Plans`
    : `${categoryName || 'Related'} Diet Plans`;

  const yogaSectionTitle = selectedDiseaseName
    ? `${selectedDiseaseName} Yoga`
    : `${categoryName || 'Related'} Yoga`;

  const scopedProducts = useMemo(
    () => (concernId ? filterByConcern(products) : products),
    [products, concernId, filterByConcern],
  );

  const onRefresh = useCallback(async () => {
    await Promise.all([
      refreshDoctors(),
      refreshProducts(),
      refreshDiseases(),
      loadConcernDiet(),
      loadConcernYoga(),
    ]);
  }, [
    refreshDoctors,
    refreshProducts,
    refreshDiseases,
    loadConcernDiet,
    loadConcernYoga,
  ]);

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

  const handleViewAllDiet = useCallback(() => {
    navigation.navigate('DietScreen', {
      listType: 'all',
      health_category_id: concernId || undefined,
      health_disease_id: selectedDiseaseId || undefined,
      categoryName: categoryName || undefined,
    });
  }, [navigation, concernId, selectedDiseaseId, categoryName]);

  const handleViewAllYoga = useCallback(() => {
    navigation.navigate('YogaScreen', {
      health_category_id: concernId || undefined,
      health_disease_id: selectedDiseaseId || undefined,
      categoryName: categoryName || undefined,
    });
  }, [navigation, concernId, selectedDiseaseId, categoryName]);

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

  const StickyFilters = useMemo(
    () => (
      <View>
        <ExpandableSearch
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search doctors or products..."
          showTrigger={false}
          expanded={searchExpanded}
          onExpandedChange={setSearchExpanded}
        />
        {showDiseases ? (
          <View style={styles.diseaseSection}>
            <Text style={styles.diseaseTitle}>Diseases</Text>
            {diseasesLoading && diseases.length === 0 ? (
              <DiseaseChipSkeleton />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.diseaseRow}
                keyboardShouldPersistTaps="handled"
              >
                <TouchableOpacity
                  style={[
                    styles.diseaseChip,
                    !selectedDiseaseId && styles.diseaseChipActive,
                  ]}
                  onPress={() => setSelectedDiseaseId(null)}
                  activeOpacity={0.85}
                >
                  <View style={styles.diseaseChipIconWrap}>
                    <TablerIcon
                      name="plus"
                      size={16}
                      color={!selectedDiseaseId ? Colors.primaryColor : '#64748B'}
                    />
                  </View>
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
                  const imageUri =
                    item?.image_url && typeof item.image_url === 'string'
                      ? item.image_url
                      : '';
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
                      <View style={styles.diseaseChipIconWrap}>
                        {imageUri ? (
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.diseaseChipImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Image
                            source={Images.cardiology}
                            style={styles.diseaseChipImage}
                            resizeMode="cover"
                          />
                        )}
                      </View>
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
      </View>
    ),
    [
      searchText,
      searchExpanded,
      showDiseases,
      diseasesLoading,
      diseases,
      selectedDiseaseId,
    ],
  );

  const ListHeader = useCallback(
    () => (
      <>
        <PromoCard
          title={`${categoryName || 'Health'} Care`}
          desc="Specialists & remedies for this health concern"
          imageLeftIconName="plus-bag"
          image={require('../../assets/images/doctorbanner.png')}
          buttontext="Book an appointment online"
          showButton={false}
        />

        <SectionHeader
          title={`${categoryName || 'Related'} Doctors`}
          actionText={doctorList.length > 0 ? 'View all' : ''}
          onPress={doctorList.length > 0 ? handleViewAllDoctors : undefined}
        />

        {doctorsLoading && !hasDoctors ? (
          <TopDoctorsCardSkeleton count={4} />
        ) : hasDoctors ? (
          <View style={styles.doctorGrid}>
            {doctorList.map((item: any, index: number) => (
              <View key={String(item?.id ?? item?.doctor_id ?? `doc-${index}`)} style={styles.doctorCardWrap}>
                <AllDoctorCard
                  item={item}
                  variant="grid"
                  cardWidth={CARD_W}
                  onPress={() => handleDoctorPress(item)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.sectionEmptyBox}>
            <Text style={styles.emptyTitle}>No doctors found</Text>
            <Text style={styles.emptySub}>
              No specialists are linked to this concern yet.
            </Text>
          </View>
        )}

        <SectionHeader
          title={dietSectionTitle}
          actionText={dietPlans.length > 0 ? 'View all' : ''}
          onPress={dietPlans.length > 0 ? handleViewAllDiet : undefined}
        />
        {dietLoading && dietPlans.length === 0 ? (
          <View style={styles.inlineSkeleton}>
            <TopDoctorsCardSkeleton count={2} />
          </View>
        ) : dietPlans.length > 0 ? (
          <SuggestedCard
            data={dietPlans}
            navigation={navigation}
            home
            edgeScroll
          />
        ) : (
          <View style={styles.sectionEmptyBox}>
            <Text style={styles.emptyTitle}>No diet plans</Text>
            <Text style={styles.emptySub}>
              Diet plans for this concern will appear here.
            </Text>
          </View>
        )}

        <SectionHeader
          title={yogaSectionTitle}
          actionText={yogaSessions.length > 0 ? 'View all' : ''}
          onPress={yogaSessions.length > 0 ? handleViewAllYoga : undefined}
        />
        {yogaLoading && yogaSessions.length === 0 ? (
          <View style={styles.inlineSkeleton}>
            <TopDoctorsCardSkeleton count={2} />
          </View>
        ) : yogaSessions.length > 0 ? (
          <SuggestedCard
            data={yogaSessions}
            navigation={navigation}
            home
            edgeScroll
          />
        ) : (
          <View style={styles.sectionEmptyBox}>
            <Text style={styles.emptyTitle}>No yoga sessions</Text>
            <Text style={styles.emptySub}>
              Yoga sessions for this concern will appear here.
            </Text>
          </View>
        )}

        <SectionHeader title={productSectionTitle} />
        {productsLoading && scopedProducts.length === 0 ? (
          <View style={styles.inlineSkeleton}>
            <TopDoctorsCardSkeleton count={2} />
          </View>
        ) : scopedProducts.length > 0 ? (
          <SuggestedCard
            data={scopedProducts}
            navigation={navigation}
            home
            edgeScroll
          />
        ) : (
          <View style={styles.sectionEmptyBox}>
            <Text style={styles.emptyTitle}>No products</Text>
            <Text style={styles.emptySub}>
              Products for this concern will appear here.
            </Text>
          </View>
        )}

        {/* {!productsLoading && products.length > 0 ? (
          <Text style={styles.resultCount}>
            {products.length} product{products.length === 1 ? '' : 's'}
          </Text>
        ) : null} */}
      </>
    ),
    [
      categoryName,
      doctorList.length,
      doctorsLoading,
      hasDoctors,
      doctorList,
      handleDoctorPress,
      handleViewAllDoctors,
      dietSectionTitle,
      dietPlans,
      dietLoading,
      handleViewAllDiet,
      yogaSectionTitle,
      yogaSessions,
      yogaLoading,
      handleViewAllYoga,
      productSectionTitle,
      productsLoading,
      scopedProducts,
      navigation,
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
            gridWidth={PRODUCT_CARD_W}
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
        subtitle="Doctors, products, diet & yoga"
        onBack={() => navigation.goBack()}
        onSearchPress={() => setSearchExpanded(true)}
        // onRefreshPress={onRefresh}
        showCart
      />

      {showProductSkeleton && products.length === 0 && !hasDoctors ? (
        <View style={styles.pad}>
          {StickyFilters}
          <ListHeader />
          <ProductGridSkeleton cardWidth={PRODUCT_CARD_W} gap={GRID_GAP} count={6} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {StickyFilters}
          <FlatList
          data={products}
          keyExtractor={(item, i) => String(item.variant_id || i)}
          numColumns={2}
          renderItem={renderProduct}
          ListHeaderComponent={ListHeader}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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
                cardWidth={PRODUCT_CARD_W}
                gap={GRID_GAP}
                count={2}
              />
            ) : null
          }
        />
        </View>
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
    width: PRODUCT_CARD_W,
    marginBottom: 4,
  },
  doctorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: DOCTOR_GRID.gap,
    marginBottom: 8,
  },
  doctorCardWrap: {
    width: CARD_W,
  },
  inlineSkeleton: {
    marginBottom: 8,
  },
  diseaseSection: {
    marginBottom: 6,
    marginTop: 2,
  },
  diseaseTitle: {
    
        // fontSize: TYPO.lg + 1,
    fontSize: 17,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
  },
  diseaseRow: {
    gap: 8,
    paddingRight: 4,
    paddingBottom: 2,
    paddingHorizontal: 0,
  },
  diseaseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 68,
    maxWidth: 160,
    paddingHorizontal: FILTER_CHIP_PADDING_H,
    paddingVertical: FILTER_CHIP_PADDING_V,
    borderRadius: FILTER_CHIP_RADIUS,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  diseaseChipIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diseaseChipImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  sectionEmptyBox: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
  emptySub: {
    marginTop: 4,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
  },
});
