import React, { useCallback, useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import RecentProductsList from '../../components/RecentProductsList';
import CategoryList from '../../components/CategoryList';
import TopSellingList from '../../components/TopSellingList';
import SectionHeader from '../../components/SectionHeader';
import ActionCards from '../../components/ActionCards';
import BrandList from '../../components/BrandList';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../common/Colors';
import { useHomeData } from '../../hooks/UseHomeData';
import { getScreenBottomPadding } from '../../constants/layout';
import { RootStackParamList } from '../../../type';
import { TablerIconName } from '../../components/TablerIcon';
import TablerIcon from '../../components/TablerIcon';
import { Images } from '../../common/Images';
import { safeGoBack } from '../../navigation/navigationUtils';

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

  const { categories, productData, setProductData, loadingProducts } =
    useHomeData();

  const productImage = require('../../assets/images/RecentsImage.png');

  const recentProducts = useMemo(
    () => [
      {
        id: '1',
        name: 'Foxtail millet (Kangni)',
        price: 649,
        image: productImage,
        lastOrdered: '17 February',
      },
      {
        id: '2',
        name: 'Groundnut oil',
        price: 499,
        image: productImage,
        lastOrdered: '17 February',
      },
    ],
    [productImage],
  );

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

  const brandData = useMemo(
    () => [
      { id: '1', name: 'Baidyanath', iconName: 'pill' as TablerIconName },
      { id: '2', name: 'Himalaya', iconName: 'store' as TablerIconName },
      { id: '3', name: 'Dabur', iconName: 'pill' as TablerIconName },
    ],
    [],
  );

  const safeCategories = Array.isArray(categories) ? categories : [];
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

      <Header title="Medicine Store" backIcon={Images.backIcon} onBack={() => safeGoBack(props.navigation)} subtitle="Health & Wellness" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        nestedScrollEnabled
      >
        <SearchBar placeholder="Search seeds, oils..." />

        <ActionCards data={actionItems} onpress={handleActionPress} />

        <SectionHeader title="Recent Orders" actionText="View History" />
        <RecentProductsList data={recentProducts} />

        <SectionHeader title="Shop by Concern" />
        <CategoryList
          data={safeCategories}
          navigation={stackNav}
        />

        <SectionHeader title="Trusted Brands" />
        <BrandList data={brandData} />

        {safeProducts.length > 0 && (
          <>
            <SectionHeader title="Medicines" actionText="View all" />
            <TopSellingList
              data={safeProducts}
              navigation={stackNav}
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
            <SectionHeader title="Ayurveda" actionText="View all" />
            <TopSellingList
              data={safeProducts}
              navigation={stackNav}
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
});
