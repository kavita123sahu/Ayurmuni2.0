import React from 'react';
import { FlatList, View, Text, Image, StyleSheet } from 'react-native';
import { Category } from '../types';

const CategoryList = ({ data }: { data: Category[] }) => {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.circle}>
            <Image source={item.icon} style={styles.icon} />
          </View>
          <Text style={styles.text}>{item.name}</Text>
        </View>
      )}
    />
  );
};

export default CategoryList;

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF7F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 28,
    height: 28,
  },
  text: {
    marginTop: 5,
    fontSize: 12,
  },
});