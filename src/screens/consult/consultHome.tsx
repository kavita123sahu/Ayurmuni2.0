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
import { Images } from '../../common/Images';
import TopDoctorsCard from '../home/TopDoctorsCard';
import { doctorsData } from '../../common/DataInterface';


const ConsultScreen = () => {

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
    { id: '1', name: 'General', icon: categoryImage },
    { id: '2', name: 'Cardiology', icon: categoryImage },
    { id: '3', name: 'Dentistry', icon: categoryImage },
    { id: '4', name: 'Neurology', icon: categoryImage }
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

    <SafeAreaView style={{
      flex: 1, marginBottom: 30,
      paddingHorizontal: 20, backgroundColor: '#FDFDFB'
    }}>

      <Header
        title="Doctors Consultation"
        subtitle="Find best doctor"
        backIcon={Images.backIcon}
        onBack={() => { navigation.goBack() }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >

        <SearchBar
          placeholder="Search seeds, oils..."
          icon={require('../../assets/images/search.png')}
        />

        <PromoCard
          title="Consult with Specialists"
          desc="Over 50+ Medical Experts"
          tag="SUMMER SALE"
          image={require('../../assets/images/cosmetic.png')}
          arrowIcon={require('../../assets/images/arrow.png')}
          onPress={() => { }}
          showButton={true}
        />

        <SectionHeader title="Recent Consultations" actionText="View History" />

        <RecentProductsList data={recentProducts} />

        <SectionHeader title="Consult by Concern" />

        <CategoryList data={categories} navigation={navigation} />

        <SectionHeader title="Top Doctors" actionText="View all" />

        <TopDoctorsCard data={doctorsData} navigation={navigation} />

      </ScrollView>
    </SafeAreaView>
  );
};

export default ConsultScreen;