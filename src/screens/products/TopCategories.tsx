import React from 'react';
import { View, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import PromoCard from '../../components/PromoCard';
import SectionHeader from '../../components/SectionHeader';
import TopSellingList from '../../components/TopSellingList';

const TopCategories = (props: any) => {

  const route = useRoute<any>();

  const navigation = useNavigation<any>();

  const { categoryName } = route.params;
  const productImage = require('../../assets/images/RecentsImage.png');


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
    {
      id: '6',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '7',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '8',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '9',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '10',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '11',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '12',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '13',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '14',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '15',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '16',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '17',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '18',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '19',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '20',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    {
      id: '21',
      name: 'Foxtail millet',
      subtitle: 'Acne Clear  Cream',
      subname: 'Acne Clear  Cream',
      oldPrice: 699.00,
      price: 649,
      image: productImage,
      tag: 'Bestselling',
    },
    


  ];


  return (
    <View style={{ flex: 1, backgroundColor: '#FDFDFB' }}>

      <Header
        title={categoryName}
        subtitle="Organic product"
        backIcon={require('../../assets/images/BackButoon.png')}
        onBack={() => navigation.goBack()}
      />

      <SearchBar
        placeholder="Search seeds, oils..."
        icon={require('../../assets/images/search.png')}
      />
      <PromoCard
        title="The Wellness Essentials"
        desc="Discover our loved organic selections, cold-pressed to preserve nature’s power."
        tag="CURATED EXCELLENCE"
        image={require('../../assets/images/cosmetic.png')}
        showButton={false}
      />
      <SectionHeader title="Top  Selling Products" actionText="View all" />
      <TopSellingList data={topSelling} isGrid={true} />
    </View>
  );
};

export default TopCategories;