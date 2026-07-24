import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import RecentProductsList from '../../components/RecentProductsList';
import CategoryList from '../../components/CategoryList';
import TopSellingList from '../../components/TopSellingList';
import SectionHeader from '../../components/SectionHeader';
import ActionCards from '../../components/ActionCards';
import BrandList from '../../components/BrandList';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../common/Colors';
import { useHomeData } from '../../hooks/UseHomeData';
import { useOrders } from '../../hooks/useOrders';
import { getScreenBottomPadding } from '../../constants/layout';
import { RootStackParamList } from '../../../type';
import { TablerIconName } from '../../components/TablerIcon';
import { Images } from '../../common/Images';
import { safeGoBack } from '../../navigation/navigationUtils';
import { navigateToSearchScreen } from '../../navigation/productNavigation';
import { useBrands } from '../../hooks/useBrands';
import { useHealthConcernCategories } from '../../hooks/useHealthConcernCategories';

type ActionItem = {
  id: string;
  title: string;
  subtitle: string;
  iconName: TablerIconName;
  screen: keyof RootStackParamList;
};

const MedicineScreen = (props: any) => {
  const navigation = useNavigation<any>();
  const stackNav = navigation.getParent?.() || navigation;
  const insets = useSafeAreaInsets();
  const bottomPadding = getScreenBottomPadding(insets);

  const { productData, setProductData, loadingProducts, refreshHomeData, categories: dashboardCategories } =
    useHomeData();

  const medicineCategoryId = useMemo(() => {
    const list = Array.isArray(dashboardCategories) ? dashboardCategories : [];
    const medicine = list.find(
      (item: any) => String(item?.name ?? '').trim().toLowerCase() === 'medicine',
    );
    return medicine?.id ? String(medicine.id) : null;
  }, [dashboardCategories]);

  const {
    categories: healthConcerns,
    loading: healthConcernsLoading,
    refresh: refreshHealthConcerns,
  } = useHealthConcernCategories(medicineCategoryId);

  const { brands, refresh: refreshBrands } = useBrands();
  const { recentProducts, loading: ordersLoading, refresh: refreshOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  // const handleSearchPress = useCallback(() => {
  //   stackNav.navigate('SearchScreen');
  // }, [stackNav]);

  
  const handleSearchPress = useCallback(() => {
    navigateToSearchScreen(navigation);
  }, [navigation]);

  const handleViewOrderHistory = useCallback(() => {
    navigation.navigate('OrderHistory');
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshHomeData(),
        refreshOrders(),
        refreshBrands(),
        refreshHealthConcerns(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshHomeData, refreshOrders, refreshBrands, refreshHealthConcerns]);

  const actionItems: ActionItem[] = useMemo(
    () => [
      {
        id: '1',
        title: 'Order With Prescription',
        subtitle: 'Upload & Get Verified',
        iconName: 'upload',
        screen: 'Prescription',
      },
      {
        id: '2',
        title: 'Search & Buy Online',
        subtitle: 'Browse 50k+ Products',
        iconName: 'search',
        screen: 'SearchScreen',
      },
    ],
    [],
  );



  const safeHealthConcerns = Array.isArray(healthConcerns) ? healthConcerns : [];
  const safeProducts = Array.isArray(productData) ? productData : [];

  const handleActionPress = useCallback(
    (item: { screen?: keyof RootStackParamList }) => {
      // Guests can open & browse these screens; the actual submit/upload
      // inside is gated by requireAuth at the action point.
      if (item?.screen) {
        stackNav.navigate(item.screen);
      }
    },
    [stackNav],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Header
        title="Medicine Store"
        backIcon={Images.backIcon}
        onBack={() => safeGoBack(props.navigation)}
        subtitle="Health & Wellness"
        onSearchPress={handleSearchPress}
        // onRefreshPress={onRefresh}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primaryColor]}
            tintColor={Colors.primaryColor}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        nestedScrollEnabled
      >
        <ActionCards data={actionItems} onpress={handleActionPress} />

        {(ordersLoading || recentProducts.length > 0) && (
          <>
            <SectionHeader
              title="Recent Orders"
              actionText="View History"
              onPress={handleViewOrderHistory}
            />
            {ordersLoading ? (
              <View style={styles.ordersLoading}>
                <ActivityIndicator size="small" color={Colors.primaryColor} />
              </View>
            ) : (
              <RecentProductsList data={recentProducts} navigation={navigation} />
            )}
          </>
        )}

        <SectionHeader title="Shop by Concern" />
        {healthConcernsLoading && safeHealthConcerns.length === 0 ? (
          <View style={styles.ordersLoading}>
            <ActivityIndicator size="small" color={Colors.primaryColor} />
          </View>
        ) : (
          <CategoryList
            data={safeHealthConcerns}
            navigation={navigation}
            mode="health"
          />
        )}

        <SectionHeader title="Trusted Brands" />
        {brands.length > 0 && (
          <BrandList data={brands} />

        )}

        {safeProducts.length > 0 && (
          <>
            <SectionHeader
              title="Medicines"
              actionText="View all"
              onPress={() => navigateToSearchScreen(navigation)}
            />
            <TopSellingList
              data={safeProducts}
              navigation={navigation}
              setProductData={setProductData}
              nested
            />
          </>
        )}

        {loadingProducts && safeProducts.length === 0 ? (
          <SectionHeader title="Medicines" />
        ) : null}

        {safeProducts.length > 0 && (
          <>
            <SectionHeader
              title="Ayurveda"
              actionText="View all"
              onPress={() => navigateToSearchScreen(navigation)}
            />
            <TopSellingList
              data={safeProducts}
              navigation={navigation}
              setProductData={setProductData}
              nested
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default React.memo(MedicineScreen);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FDFDFB',
  },
  scrollContent: {
    paddingTop: 4,
  },
  ordersLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
