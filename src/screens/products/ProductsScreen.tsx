// screens/ProductsScreen.tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import PromoCard from '../../components/PromoCard';
import RecentProductsList from '../../components/RecentProductsList';
import CategoryList from '../../components/CategoryList';
import TopSellingList from '../../components/TopSellingList';
import SectionHeader from '../../components/SectionHeader';
import { useNavigation } from '@react-navigation/native';


const ProductsScreen = () => {

  const navigation = useNavigation();
  const productImage = require('../../assets/images/RecentsImage.png');
  const categoryImage = require('../../assets/images/CategiryImage.png');

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
    { id: '1', name: 'Seeds', icon: categoryImage },
    { id: '2', name: 'Grains', icon: categoryImage },
    { id: '3', name: 'Fats & Oils', icon: categoryImage },
    { id: '4', name: 'Drinks', icon: categoryImage },
    { id: '5', name: 'Seeds', icon: categoryImage },
    { id: '6', name: 'Grains', icon: categoryImage },
    { id: '7', name: 'Fats & Oils', icon: categoryImage },
    { id: '8', name: 'Drinks', icon: categoryImage },
  ];

  const topSelling = [
    {
      id: '1',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '2',
      name: 'Face Cream',
      subtitle: 'Acne Clear  Cream',
      price: 399,
      oldPrice: 699,
      image: productImage,
      tag: '15% OFF',
    },
    {
      id: '3',
      name: 'Organic Rice',
      subtitle: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 250,
      image: productImage,
      tag: 'Hot',
    },
    {
      id: '4',
      name: 'Face Cream',
      subtitle: 'Acne Clear  Cream',
      price: 399,
      oldPrice: 699,
      image: productImage,
      tag: '15% OFF',
    },
    {
      id: '5',
      name: 'Organic Rice',
      subtitle: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 250,
      image: productImage,
      tag: 'Hot',
    },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FDFDFB' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >

        <Header
          title="Products"
          subtitle="Choose best product"
          backIcon={require('../../assets/images/BackButoon.png')}
          onBack={() => { }}
        />

        <SearchBar
          placeholder="Search seeds, oils..."
          icon={require('../../assets/images/search.png')}
        />

        <PromoCard
          title="Up to 40% OFF on\nSupplements"
          desc="Keep your immunity strong this season."
          tag="SUMMER SALE"
          image={require('../../assets/images/cosmetic.png')}
          arrowIcon={require('../../assets/images/arrow.png')}
          onPress={() => { }}
          showButton={true}
        />

        <SectionHeader title="Recent Products" actionText="View History" />
        <RecentProductsList data={recentProducts} />

        <SectionHeader title="Top Category" />
        <CategoryList data={categories} navigation={navigation} />

        <SectionHeader title="Top Selling Products" actionText="View all" />
        <TopSellingList data={topSelling} />

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductsScreen;