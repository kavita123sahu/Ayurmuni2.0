import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Product } from '../types';

interface Props {
  data: Product[];
}

const RecentProductsList: React.FC<Props> = ({ data }) => {
  return (
    <FlatList
      data={data}
      scrollEnabled={false}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>

          <View style={styles.imageBox}>
            <Image source={item.image} style={styles.img} />
          </View>

          <View style={styles.rightSection}>

            <View>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>

              <Text style={styles.sub}>
                Last Ordered: 17 February
              </Text>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.price}>
                ₹ {item.price.toFixed(2)}
              </Text>

              <TouchableOpacity style={styles.btn}>
                <Text style={styles.btnText}>Reorder</Text>
              </TouchableOpacity>
            </View>

          </View>

        </View>
      )}
    />
  );
};

export default RecentProductsList;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth:1,
    padding: 14,
    borderColor:'#F1F5F9',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
  },

  imageBox: {
    width: 86,
    height: 86,
    borderRadius: 18,
    backgroundColor: '#0D614E1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  img: {
    width: 62,
    height: 68,
    resizeMode: 'contain',
  },

  rightSection: {
    flex: 1,
    justifyContent: 'space-between', // 🔥 key
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },

  sub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '400',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  price: {
    fontSize: 18,
    fontWeight: '400',
    color: '#0D614E',
  },

  btn: {
    backgroundColor: '#0D614E',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },

  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
  },
});