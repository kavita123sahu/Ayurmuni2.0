import React, { useCallback, useEffect } from 'react';
import { ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import PromoCard from '../../components/PromoCard';
import RecentProductsList from '../../components/RecentProductsList';
import CategoryList from '../../components/CategoryList';
import TopSellingList from '../../components/TopSellingList';
import SectionHeader from '../../components/SectionHeader';
import { useNavigation } from '@react-navigation/native';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import * as _PRODUCT_SERVICES from '../../services/ProductServices';


const ProductsScreen = () => {

  const navigation = useNavigation();
  const productImage = require('../../assets/images/RecentsImage.png');
 
  const recentProducts = [
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
  ];

  const categories = [
    { id: '1', name: 'Seeds', icon: undefined },
    { id: '2', name: 'Grains', icon: undefined },
    { id: '3', name: 'Fats & Oils', icon: undefined },
    { id: '4', name: 'Drinks', icon: undefined },
    { id: '5', name: 'Seeds', icon: undefined },
    { id: '6', name: 'Grains', icon: undefined },
    { id: '7', name: 'Fats & Oils', icon: undefined },
    { id: '8', name: 'Drinks', icon: undefined },
  ];

  const [productData, setProductData] = React.useState([]);
  const [loadingProducts, setloadingProducts] = React.useState(false);

  useEffect(() => {
    fetchProducts
  }, [])


  const fetchProducts = useCallback(async () => {
    try {
      setloadingProducts(true);

      const res =
        await _PRODUCT_SERVICES.getProduct();
      console.log(res, "productttttttttttt");
      setProductData(
        res?.data?.results || [],
      );


    } catch (error) {
      console.log(error);
    } finally {
      setloadingProducts(false);
    }
  }, []);



  return (

    <SafeAreaView style={{
      flex: 1,
      paddingHorizontal: 20, backgroundColor: '#FDFDFB'
    }}>

      <StatusBar barStyle={'dark-content'} backgroundColor={Colors.background} />


      <Header
        title="Products"
        subtitle="Choose best product"
        backIcon={Images.backIcon}
        onBack={() => { navigation.goBack() }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{}}
      >

        <SearchBar
          placeholder="Search seeds, oils..."
          icon={require('../../assets/images/Search.png')}
        />

        <PromoCard
          title="Up to 40% OFF on\nSupplements"
          desc="Keep your immunity strong this season."
          tag="SUMMER SALE"
          buttontext='Shop Now'
          image={require('../../assets/images/cosmetic.png')}
          arrowIcon={require('../../assets/images/arrowRight.png')}
          onPress={() => { }}
          showButton={true}
        />

        <SectionHeader title="Recent Products" actionText="View History" />

        <RecentProductsList data={recentProducts} />

        <SectionHeader title="Top Category" />

        <CategoryList data={categories} navigation={navigation} />

        <SectionHeader title="Top Selling Products" actionText="View all" />

        <TopSellingList data={productData} navigation={navigation} setProductData={() => ""} />

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductsScreen;