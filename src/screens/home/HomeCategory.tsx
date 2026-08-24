import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import { HORIZONTAL_SCROLL_CONTENT, SCREEN_PADDING_H } from '../../constants/layout';
import { navigateToCategoryProducts } from '../../navigation/productNavigation';

const SCREEN_W = Dimensions.get('window').width;
const ITEM_GAP = 8;
const ITEM_WIDTH = Math.floor((SCREEN_W - 16) / 5.15);
const TILE_W = Math.min(52, ITEM_WIDTH - 6);
const TILE_H = 40;

interface Category {
  id: string;
  name: string;
  image_url: string;
}

const CATEGORY_ICONS: Record<string, TablerIconName> = {
  all: 'list',
  consult: 'stethoscope',
  medicine: 'pill',
  products: 'package',
  yoga: 'users',
  diet: 'heart',
};

const CATEGORY_ROUTES: Record<string, string> = {
  consult: 'ConsultScreen',
  medicine: 'MedicineScreen',
  products: 'ProductsScreen',
  yoga: 'YogaScreen',
  diet: 'DietScreen',
};

const ALL_ITEM: Category = {
  id: 'all',
  name: 'All',
  image_url: '',
};

const CategoryTile = ({
  item,
  active,
  onPress,
}: {
  item: Category;
  active: boolean;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);
  const key = item?.name?.trim().toLowerCase() ?? 'all';
  const iconName = CATEGORY_ICONS[key] ?? 'package';

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Animated.View style={[styles.tile, active && styles.tileActive, animStyle]}>
        {item?.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.tileImage}
            resizeMode="contain"
          />
        ) : (
          <TablerIcon name={iconName} size={22} color={Colors.primaryColor} />
        )}
      </Animated.View>

      <Text
        numberOfLines={1}
        style={[styles.label, active && styles.labelActive]}
      >
        {item.name}
      </Text>

      <View style={active ? styles.activeIndicator : styles.activeIndicatorSpacer} />
    </Pressable>
  );
};

type Props = {
  data?: Category[];
  navigation: any;
  sticky?: boolean;
};

const HomeCategory = ({ data = [], navigation, sticky = false }: Props) => {
  const [activeId, setActiveId] = useState('all');

  const services = useMemo(
    () => (Array.isArray(data) ? data.filter(Boolean) : []),
    [data],
  );

  const listData = useMemo(() => [ALL_ITEM, ...services], [services]);

  const handlePress = useCallback(
    (item: Category) => {
      setActiveId(item.id);

      if (item.id === 'all') {
        return;
      }

      const route = CATEGORY_ROUTES[item?.name?.trim().toLowerCase()];
      if (route) {
        navigation.navigate(route as never);
        return;
      }
      navigateToCategoryProducts(navigation, {
        categoryName: item.name,
        healthCategoryId: item.id,
        categoryMode: 'health',
        serviceCategoryId: item.id,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Category }) => (
      <CategoryTile
        item={item}
        active={activeId === item.id}
        onPress={() => handlePress(item)}
      />
    ),
    [activeId, handlePress],
  );

  if (!services.length) {
    return null;
  }

  return (
    <View style={[styles.wrapper, sticky && styles.wrapperSticky]}>
      <FlatList
        horizontal
        data={listData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH + ITEM_GAP,
          offset: (ITEM_WIDTH + ITEM_GAP) * index,
          index,
        })}
      />
    </View>
  );
};

export default React.memo(HomeCategory);

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 0,
    marginBottom: 0,
  },
  wrapperSticky: {
    marginTop: 0,
    marginBottom: 0,
  },
  container: {
    ...HORIZONTAL_SCROLL_CONTENT,
    paddingLeft: SCREEN_PADDING_H,
    paddingVertical: 0,
  },
  item: {
    width: ITEM_WIDTH - 15,
    alignItems: 'center',
    marginRight: ITEM_GAP,
  },
  tile: {
    width: TILE_W - 6,
    height: TILE_H - 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileActive: {
    opacity: 1,
  },
  tileImage: {
    width: TILE_W - 10,
    height: TILE_H - 10,
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    height: 13,
    textAlign: 'center',
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
    width: ITEM_WIDTH,
  },
  labelActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  activeIndicator: {
    marginTop: 4,
    width: 35,
    height: 4,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: Colors.primaryColor,
  },
  activeIndicatorSpacer: {
    marginTop: 4,
    width: 18,
    height: 4,
  },
});
