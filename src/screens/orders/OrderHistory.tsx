import React, { useMemo, useState } from 'react';
import { StyleSheet, FlatList, StatusBar } from 'react-native';
import OrderCard from '../../components/OrderCard';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import { Colors } from '../../common/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDebounce } from '../../hooks/useDebaunce';
import { matchesSearch } from '../../utils/searchUtils';

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
    const [searchText, setSearchText] = useState('');
    const debouncedSearch = useDebounce(searchText, 400);

    const filteredOrders = useMemo(() => {
        const q = debouncedSearch.trim();
        if (!q) return DATA;

        return DATA.filter((item) =>
            matchesSearch(q, item.title, item.id, item.status, item.date),
        );
    }, [debouncedSearch]);

    return (

        <SafeAreaView style={styles.container}>

            <StatusBar barStyle={'dark-content'} backgroundColor={Colors.background} />

            <Header
                title="Order History"
                subtitle="Track your medicines & labs"
                onBack={() => { props.navigation.goBack() }}
            />

            <SearchBar
                placeholder="Search order id or title..."
                value={searchText}
                onChangeText={setSearchText}
            />


            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <OrderCard
                        title={item.title}
                        id={item.id}
                        status={formatStatus(item.status)}
                        date={item.date}
                        amount={item.amount}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 100,
                }}
            />
        </SafeAreaView>
    );
};

export default OrderHistory;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: Colors.background,
    },
});
