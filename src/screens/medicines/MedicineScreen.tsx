import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import RecentProductsList from '../../components/RecentProductsList';
import CategoryList from '../../components/CategoryList';
import TopSellingList from '../../components/TopSellingList';
import SectionHeader from '../../components/SectionHeader';
// import { useNavigation } from '@react-navigation/native';
import ActionCards from '../../components/ActionCards';
import { Images } from '../../common/Images';
import BrandList from '../../components/BrandList';
import { useNavigation } from '@react-navigation/native';


const MedicineScreen = () => {



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


    const Medicines = [
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

            <Header
                title="Products"
                subtitle="Medicine Store"
                backIcon={require('../../assets/images/BackButton.png')}
                onBack={() => { }}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
            >

                <SearchBar
                    placeholder="Search seeds, oils..."
                    icon={require('../../assets/images/search.png')}
                />

                <ActionCards
                    data={[
                        {
                            id: '1',
                            title: 'Order With Prescription',
                            subtitle: 'Upload & Get Verified',
                            icon: Images.prescriptionIcon,
                            bgIcon: Images.uploadBgIcon,
                        },
                        {
                            id: '2',
                            title: 'Search & Buy Online',
                            subtitle: 'Browse 50k+ Products',
                            icon: Images.searchIcon2,
                            bgIcon: Images.searchBgIcon,
                        },
                    ]}
                />

                <SectionHeader title="Recent Orders" actionText="View History" />
                <RecentProductsList data={recentProducts} />

                <SectionHeader title="Shop by Concern" />
                <CategoryList data={categories} />

                <SectionHeader title="Trusted Brands" />
               
               
               <BrandList
                    data={[
                        {
                            id: '1',
                            name: 'Baidyanath',
                            image: Images.brands,
                        },
                        {
                            id: '2',
                            name: 'Himalaya',
                            image: Images.brands,
                        },
                        {
                            id: '3',
                            name: 'Baidyanath',
                            image: Images.brands,
                        },
                    ]}
                />



                <SectionHeader title="Medicines" actionText="View all" />
                <TopSellingList data={Medicines} navigation={navigation}/>

                <SectionHeader title="Ayurveda" actionText="View all" />
                <TopSellingList data={Medicines} navigation={navigation}/>

            </ScrollView>
        </SafeAreaView>
    );
};

export default MedicineScreen;