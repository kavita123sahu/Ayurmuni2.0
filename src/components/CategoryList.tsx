import React, { useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import { navigateToCategoryProducts } from '../navigation/productNavigation';

const { width } = Dimensions.get('window');

const ITEM_SIZE = width / 5;

interface Category {
  id: string;
  name: string;
  image_url: any;
}

const CategoryList = ({ data = [], navigation, doctor, mode = 'product' }: any) => {
  const handlePress = useCallback(
    (item: Category) => {
      if (doctor) {
        navigation.navigate('CategoryDoctor', {
          categoryName: item.name,
          categoryId: item.id,
        });
        return;
      }

      if (mode === 'health') {
        navigateToCategoryProducts(navigation, {
          categoryName: item.name,
          healthCategoryId: item.id,
          categoryMode: 'health',
        });
        return;
      }

      navigateToCategoryProducts(navigation, {
        categoryId: item.id,
        categoryName: item.name,
        categoryMode: 'product',
      });
    },
    [navigation, doctor, mode],
  );

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.item, { width: ITEM_SIZE }]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.circle, { width: ITEM_SIZE - 10, height: ITEM_SIZE - 10 }]}>
        <Image
          source={
            item?.image_url && typeof item.image_url === 'string'
              ? { uri: item.image_url }
              : Images.cardiology
          }
          style={styles.icon}
        />
      </View>

      <Text style={styles.text}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      horizontal
      data={data}
      nestedScrollEnabled
      scrollEnabled={data.length > 4}
      keyExtractor={(item, index) => String(item?.id ?? index)}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={5}
      getItemLayout={(_, index) => ({
        length: ITEM_SIZE,
        offset: ITEM_SIZE * index,
        index,
      })}
    />
  );
};

export default React.memo(CategoryList);

const styles = StyleSheet.create({
  container: {
    paddingLeft: -10,
  },
  item: {
    alignItems: 'center',
    marginHorizontal: 2,
  },
  circle: {
    borderRadius: 24,
    backgroundColor: '#0D614E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  text: {
    marginTop: 6,
    fontSize: 12,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    width: ITEM_SIZE - 8,
  },
});
