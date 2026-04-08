import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Fonts } from '../../common/Fonts';
import OrderCard from '../../components/OrderCard';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import { Images } from '../../common/Images';
import { ScreenWrapper } from '../../components/ScreenWrapper';


const DATA = [
    {
        title: 'Medicines Order',
        id: '#ORD-98231',
        status: 'DELIVERED',
        date: '12 Oct 2023',
        amount: '1,240.00',
    },
    {
        title: 'Full Body Checkup',
        id: '#ORD-77420',
        status: 'IN PROGRESS',
        date: '20 Oct 2023',
        amount: '2,999.00',
    },
    {
        title: 'Chronic Care Pack',
        id: '#ORD-45129',
        status: 'DELIVERED',
        date: '05 Sep 2023',
        amount: '850.00',
    },
     {
        title: 'Chronic Care Pack',
        id: '#ORD-45189',
        status: 'DELIVERED',
        date: '05 Sep 2023',
        amount: '850.00',
    },
     {
        title: 'Chronic Care Pack',
        id: '#ORD-95129',
        status: 'DELIVERED',
        date: '05 Sep 2023',
        amount: '850.00',
    },
];

const formatStatus = (status: string): 'DELIVERED' | 'IN PROGRESS' => {
  const s = status?.toUpperCase();

  if (s === 'DELIVERED') return 'DELIVERED';

  return 'IN PROGRESS';
};

const OrderHistory = (props: any) => {

    return (
       <ScreenWrapper>
         <View style={styles.container}>

            <Header
                title="Order History"
                subtitle="Track your medicines & labs"
                backIcon={Images.backIcon}
                onBack={() => { props.navigation.goBack() }}
            />

            <SearchBar
                placeholder="Search order..."
                icon={require('../../assets/images/search.png')}
            />

            <FlatList
                data={DATA}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) =>  <OrderCard
  title={item.title}
  id={item.id}
  status={formatStatus(item.status)} // ✅ FIX
  date={item.date}
  amount={item.amount}
/> }
                showsVerticalScrollIndicator={false}
            />
        </View>
       </ScreenWrapper>
    );
};

export default OrderHistory;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingHorizontal:20,
        backgroundColor: '#F9FAFB',
        paddingBottom:100
    },

    title: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 12,
        color: '#111827',
    },
});