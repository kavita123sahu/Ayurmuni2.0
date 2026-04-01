import React from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import { Fonts } from '../common/Fonts';

type BrandType = {
  id: string;
  name: string;
  image: any;
  onPress?: () => void;
};

type Props = {
  data: BrandType[];
};

const BrandList: React.FC<Props> = ({ data }) => {
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}

      contentContainerStyle={{ paddingBottom: 10 }}

      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}

      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={item.onPress}>

          <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.image} />
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

        </TouchableOpacity>
      )}
    />
  );
};

export default BrandList;

const styles = StyleSheet.create({
  card: {
    width: 120,
    backgroundColor: '#0D614E1A', 
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    height:120
  },

  imageContainer: {
    height: 60,
    width: 60,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    top:4
  },

  image: {
    height: 60,
    width: 60,
    resizeMode: 'contain',
  },

  name: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0D614E',
    top:4
  },
});