import React, { useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';

const ITEM_WIDTH = 76;
const TILE_SIZE = 68;

interface Category {
  id: string;
  name: string;
  image_url: string;
}

const CATEGORY_ICONS: Record<string, TablerIconName> = {
  consult: 'stethoscope',
  medicine: 'pill',
  products: 'package',
  yoga: 'user',
  diet: 'heart',
};

const CATEGORY_ROUTES: Record<string, string> = {
  consult: 'Consult',
  medicine: 'MedicineScreen',
  products: 'ProductsScreen',
  yoga: 'YogaScreen',
  diet: 'DietScreen',
};

const CategoryTile = ({
  item,
  onPress,
}: {
  item: Category;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconName =
    CATEGORY_ICONS[item?.name?.trim().toLowerCase()] ?? 'package';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 14, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
      style={styles.item}
    >
      <Animated.View style={[styles.tile, animStyle]}>
        {item?.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.tileImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.iconFallback}>
            <TablerIcon name={iconName} size={28} color={Colors.primaryColor} />
          </View>
        )}
      </Animated.View>
      <Text numberOfLines={2} style={styles.label}>
        {item.name}
      </Text>
    </Pressable>
  );
};

const HomeCategory = ({ data = [], navigation }: any) => {
  const handlePress = useCallback(
    (item: Category) => {
      const route = CATEGORY_ROUTES[item?.name?.trim().toLowerCase()];
      if (route) {
        navigation.navigate(route as never);
        return;
      }
      navigation.navigate('TopCategories', { category: item });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Category }) => (
      <CategoryTile item={item} onPress={() => handlePress(item)} />
    ),
    [handlePress],
  );

  if (!data?.length) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Shop by category</Text>
      <FlatList
        horizontal
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH + 10}
        snapToAlignment="start"
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH + 10,
          offset: (ITEM_WIDTH + 10) * index,
          index,
        })}
      />
    </View>
  );
};

export default React.memo(HomeCategory);

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 4,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  container: {
    paddingRight: 12,
    paddingHorizontal: 4,
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginRight: 10,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 16,
    backgroundColor: Colors.BGIcon,
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#D8ECE6',
  },
  tileImage: {
    width: '50%',
    height: '50%',
  },
  iconFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BGIcon,
  },
  label: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 14,
    height: 28,
    textAlign: 'center',
    color: '#374151',
    fontFamily: Fonts.PoppinsMedium,
    width: ITEM_WIDTH,
  },
});
