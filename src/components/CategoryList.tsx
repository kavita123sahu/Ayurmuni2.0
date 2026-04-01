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

const { width } = Dimensions.get('window');

// 🔥 Dynamic sizing (5 items visible approx)
const ITEM_SIZE = width / 5;

interface Category {
  id: string;
  name: string;
  icon: any;
}

const CategoryList = ({ data = [], navigation }: any) => {

  const handlePress = useCallback((item: Category) => {
    navigation.navigate('TopCategories', {
      categoryName: item.name,
    });
  }, [navigation]);

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.item, { width: ITEM_SIZE }]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.circle, { width: ITEM_SIZE - 10, height: ITEM_SIZE - 10 }]}>
        <Image source={item.icon} style={styles.icon} />
      </View>

      <Text numberOfLines={1} style={styles.text}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(item) => item.id}
<<<<<<< HEAD
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
=======
      contentContainerStyle={{gap:14}}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() => handlePress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.circle}>
            <Image source={item.icon} style={styles.icon} />
          </View>

          <Text style={styles.text}>{item.name}</Text>
        </TouchableOpacity>
      )}
>>>>>>> dev_abhay
    />
  );
};

export default React.memo(CategoryList);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },

  item: {
    alignItems: 'center',
<<<<<<< HEAD
    marginHorizontal: 4,
=======
>>>>>>> dev_abhay
  },

  circle: {
    borderRadius: 20,
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
    fontWeight: '400',
  },
});