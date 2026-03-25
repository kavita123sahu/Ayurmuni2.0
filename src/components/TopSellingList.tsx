import React from 'react';
import { FlatList, View, Text, Image, StyleSheet } from 'react-native';
import { Product } from '../types';

const TopSellingList = ({ data }: { data: Product[] }) => {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={item.image} style={styles.img} />

          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>Cold pressed</Text>

          <Text style={styles.price}>₹ {item.price}</Text>
        </View>
      )}
    />
  );
};

export default TopSellingList;

const styles = StyleSheet.create({
  card: {
    width: 150,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  img: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  name: {
    fontWeight: '600',
    marginTop: 5,
  },
  sub: {
    fontSize: 11,
    color: '#888',
  },
  price: {
    color: '#0D614E',
    fontWeight: '700',
    marginTop: 5,
  },
});