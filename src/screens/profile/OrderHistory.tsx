import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Order } from '../../common/DataInterface';


const DATA: Order[] = [
  {
    id: 'ORD-98231',
    title: 'Medicines Order',
    date: '12 Oct 2023',
    amount: '1,240.00',
    status: 'DELIVERED',
  },
  {
    id: 'ORD-77420',
    title: 'Full Body Checkup',
    date: '20 Oct 2023',
    amount: '2,999.00',
    status: 'IN_PROGRESS',
  },
  {
    id: 'ORD-45129',
    title: 'Chronic Care Pack',
    date: '05 Sep 2023',
    amount: '850.00',
    status: 'DELIVERED',
  },
];

const OrderHistoryScreen = () => {
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    return DATA.filter(item =>
      item.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);



  const OrderCard = (item  : any) => {
  const isDelivered = item.status === 'DELIVERED';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{item.title}</Text>

        <View
          style={[
            styles.status,
            { backgroundColor: isDelivered ? '#DFF5E1' : '#E6F0FF' },
          ]}
        >
          <Text
            style={{
              color: isDelivered ? '#1E8E3E' : '#2F6FED',
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.date}>Ordered on {item.date}</Text>

      <View style={styles.row}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amount}>₹ {item.amount}</Text>
      </View>
    </View>
  );
};




  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order History</Text>

      {/* <SearchBar value={search} onChange={setSearch} /> */}

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <OrderCard item={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },


  //CARD STYLES
   card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  date: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
  },
  amountLabel: {
    marginTop: 10,
    fontSize: 12,
    color: '#999',
  },
  amount: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#0A8F5A',
  },
});