import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  StatusBar,
  FlatList,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Header from '../../components/Header';
import { ExpandableSearch } from '../../components/SearchBar';
import SectionHeader from '../../components/SectionHeader';
import RecentDoctors from '../../components/RecentDoctors';
import CategoryList from '../../components/CategoryList';
import TopDoctorsCard from '../home/TopDoctorsCard';
import ProductCard from '../../components/ProductCard';
import {
  DoctorCardSkeleton,
  HomeCategorySkeleton,
  TopDoctorsCardSkeleton,
  ProductGridSkeleton,
} from '../../simmerScreen/ShimmerHook';
import { RootStackParamList } from '../../../type';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { useConsultData } from '../../hooks/useConsultData';
import PromoCard from '../../components/PromoCard';
import { RecentConsultHistory } from '../../services/ConsultServce';
import { useDebounce } from '../../hooks/useDebaunce';
import { matchesSearch } from '../../utils/searchUtils';
import { getConsultationScheduleLabels } from '../../utils/appointmentUtils';
import { getScreenPaddingH, SPACING } from '../../constants/responsive';
import {
  navigateToCategoryProducts,
  navigateToProductDetails,
  navigateToSearchScreen,
} from '../../navigation/productNavigation';
import { useCategoryProducts } from '../../hooks/useCategoryProducts';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { syncCartQuantity } from '../../store/slices/cartSlice';
import { TogglewishlistProduct } from '../../services/ProductServices';
import { showSuccessToast } from '../../config/Key';
import { requireAuth } from '../../services/guestAuth';
import {
  canAddProductQty,
  isProductOutOfStock,
} from '../../utils/productStockUtils';

const SCREEN_PAD = getScreenPaddingH();
const GRID_GAP = 10;
const CARD_W =
  (Dimensions.get('window').width - SCREEN_PAD * 2 - GRID_GAP) / 2;
const PRODUCT_PAGE = 6;

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

const ConsultHome = () => {

  const navigation =
    useNavigation<NavigationProp>();

  const {
    loading,
    refreshing,
    categories,
    topDoctors,
    onRefresh,
  } = useConsultData();

  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const debouncedSearch = useDebounce(search, 400);
  const [recentLoading, setRecentLoading] = useState(false);

  const productFilter = useMemo(() => {
    const q = debouncedSearch.trim();
    return q ? { search: q } : {};
  }, [debouncedSearch]);

  const {
    products: productList,
    setProducts: setProductList,
    loading: productsLoading,
    loadingMore: productsLoadingMore,
    refresh: refreshProducts,
    loadMore: loadMoreProducts,
  } = useCategoryProducts(productFilter, [], {
    enabled: true,
    pageSize: PRODUCT_PAGE,
  });

  const filteredHistory = useMemo(() => {
    const q = debouncedSearch.trim();
    if (!q) return history;
    return history.filter((item: any) =>
      matchesSearch(
        q,
        item?.doctor?.doctor_name,
        item?.concern,
        item?.status,
      ),
    );
  }, [history, debouncedSearch]);

  const filteredTopDoctors = useMemo(() => {
    const q = debouncedSearch.trim();
    if (!q) return topDoctors;
    return topDoctors.filter((doctor: any) =>
      matchesSearch(
        q,
        doctor?.full_name,
        doctor?.qualification,
        doctor?.specialization_name,
      ),
    );
  }, [topDoctors, debouncedSearch]);

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
    [dispatch],
  );
     const handleSearchPress = useCallback(() => {
    navigateToSearchScreen(navigation);
  }, [navigation]);

  const handleWishlist = useCallback(
    async (item: any) => {
      if (!(await requireAuth('Please login to save wishlist items'))) return;
      const old = item?.is_wishlist_item;
      setProductList(prev =>
        prev.map(p =>
          p.variant_id === item.variant_id
            ? { ...p, is_wishlist_item: !old }
            : p,
        ),
      );
      try {
        await TogglewishlistProduct(item.variant_id, 'POST');
      } catch {
        setProductList(prev =>
          prev.map(p =>
            p.variant_id === item.variant_id
              ? { ...p, is_wishlist_item: old }
              : p,
          ),
        );
      }
    },
    [setProductList],
  );

  const renderProduct = useCallback(
    ({ item }: { item: any }) => {
      const variantId = String(item?.variant_id);
      const cartQty = variantQuantities[variantId] ?? 0;
      return (
        <View style={styles.productCardWrap}>
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

  const fetchConsultHistory =
    useCallback(
      async (
        payload: object,
      ) => {

        try {

          setRecentLoading(true);

          const response =
            await RecentConsultHistory();

          console.log(
            'CONSULTHISTORY => ',
            response?.data?.results,
          );
          setHistory((response?.data?.results || []).slice(0, 3));

          // setHistory(
          //   response?.data?.results ||
          //   [],
          // );

        } catch (error) {

          console.log(
            'CONSULT HISTORY ERROR => ',
            error,
          );

        } finally {

          setRecentLoading(false);
        }
      },

      [],
    );

  useEffect(() => {
    fetchConsultHistory({});
  }, [fetchConsultHistory]);

  const openDoctorSlot = useCallback(
    (item: any) => {
      navigation.navigate('DoctorSlot', {
        doctorDetails: {
          ...item.doctor,
          id: item.doctor?.doctor_id,
          is_favorite: (item.doctor as any)?.is_favorite,
          total_patients: (item.doctor as any)?.total_patients,
          full_name: item.doctor?.doctor_name,
          profile_image: item.doctor?.doctor_image,
          designation: (item.doctor as any)?.qualification,
        },
      });
    },
    [navigation],
  );

  const renderRecentDoctor =
    useCallback(
      ({ item }: any) => {
        const consultationId =
          item?.consultation_id || item?.appointment_id || item?.id;
        const schedule = getConsultationScheduleLabels(item);

        return (
          <RecentDoctors
            image={{
              uri: item?.doctor?.doctor_image,
            }}
            name={item?.doctor?.doctor_name}
            speciality={
              item?.doctor?.doctor_designation ||
              item?.doctor?.qualification ||
              item?.doctor?.doctor_specialization ||
              ''
            }
            day={schedule.dayLabel || schedule.weekday}
            date={schedule.dateLabel}
            time={schedule.timeLabel}
            status={schedule.status}
            onPressReceipt={
              consultationId
                ? () =>
                    navigation.navigate('MedicalReceipt', {
                      consultationId,
                    })
                : undefined
            }
            onPressReschedule={() => openDoctorSlot(item)}
            onPressBookAgain={() => openDoctorSlot(item)}
          />
        );
      },
      [navigation, openDoctorSlot],
    );


  return (
    <SafeAreaView
      style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          Colors.background
        }
      />

      {/* HEADER */}

      <Header
        title="Doctors Consultation"
        subtitle="Find best doctor"
        onBack={() =>
          navigation.goBack()
        }
        onSearchPress={handleSearchPress}
        // onSearchPress={() => setSearchExpanded(true)}
        onRefreshPress={onRefresh}
      />


      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => String(item?.id)}
        renderItem={renderRecentDoctor}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              onRefresh();
              refreshProducts();
              fetchConsultHistory({});
            }}
            colors={[Colors.primaryColor]}
          />
        }

        ListHeaderComponent={
          <>

            <ExpandableSearch
              value={search}
              onChangeText={setSearch}
              placeholder="Search doctors, concerns..."
              showTrigger={false}
              expanded={searchExpanded}
              onExpandedChange={setSearchExpanded}
            />

            <PromoCard
              title="Consult with Specialists"
              desc="Over 50+ Medical Experts"
              imageLeftIconName="consult"
              image={require('../../assets/images/doctorbanner.png')}
              buttontext="Book an appointment online"
              approved
              showButton
              onPress={() => navigation.navigate('AllDoctors')}
            // onPress={()}
            />

            {/* <SectionHeader
              title="Recent Consultation"
              actionText="View History"
              onPress={() => navigation.navigate('ConsultHistory')}
            />

            {loading && <DoctorCardSkeleton />} */}

            {(loading || filteredHistory?.length > 0) && (
              <>
                <SectionHeader
                  title="Recent Consultation"
                  actionText="View History"
                  onPress={() => navigation.navigate('ConsultHistory')}
                />

                {loading && <DoctorCardSkeleton />}
              </>
            )}


          </>
        }
        ListEmptyComponent={() => (
          null

          // <EmptyState
          //   image={Images.doctorImage}
          //   title="No consulation  found"
          //   subtitle="Try adjusting your filters or search."
          //   imageSize={48}
          // />
        )}

        ListFooterComponent={
          loading ? (
            <>
              <HomeCategorySkeleton />
              <TopDoctorsCardSkeleton />
              <View style={{ height: 120 }} />
            </>
          ) : (
            <>
              <SectionHeader title="Consult by Concern" />

              <CategoryList
                data={categories}
                navigation={navigation}
                doctor
              />

              {filteredTopDoctors?.length > 0 && (
                <>
                  <SectionHeader
                    title="Top Doctors"
                    actionText="View all"
                    onPress={() => navigation.navigate('AllDoctors')}
                  />

                  <TopDoctorsCard
                    data={filteredTopDoctors}
                    navigation={navigation}
                  />
                </>
              )}

              {(productsLoading || productList.length > 0) && (
                <>
                  <SectionHeader
                    title="Suggested Products"
                    actionText={productList.length > 0 ? 'View all' : ''}
                    onPress={() =>
                      navigateToCategoryProducts(navigation, {
                        categoryMode: 'product',
                        categoryName: 'All Products',
                      })
                    }
                  />
                  {productsLoading && productList.length === 0 ? (
                    <ProductGridSkeleton
                      cardWidth={CARD_W}
                      gap={GRID_GAP}
                      count={6}
                    />
                  ) : (
                    <FlatList
                      data={productList}
                      keyExtractor={(item, i) =>
                        String(item.variant_id || i)
                      }
                      numColumns={2}
                      scrollEnabled={false}
                      renderItem={renderProduct}
                      columnWrapperStyle={styles.productColumn}
                      ListFooterComponent={
                        productsLoadingMore ? (
                          <ProductGridSkeleton
                            cardWidth={CARD_W}
                            gap={GRID_GAP}
                            count={2}
                          />
                        ) : null
                      }
                      ListEmptyComponent={
                        <Text style={styles.emptyProducts}>
                          No products available
                        </Text>
                      }
                    />
                  )}
                </>
              )}

              <View style={{ height: 120 }} />
            </>
          )
        }

        contentContainerStyle={styles.content}
      />

    </SafeAreaView>
  );
};

export default memo(
  ConsultHome,
);

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FDFDFB',
    paddingHorizontal: getScreenPaddingH(),
  },

  content: {
    paddingBottom: SPACING.xxl,
  },

  productColumn: {
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productCardWrap: {
    width: CARD_W,
  },
  emptyProducts: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      '#FDFDFB',
  },

});