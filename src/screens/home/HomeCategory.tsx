import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import { HORIZONTAL_SCROLL_CONTENT, SCREEN_PADDING_H } from '../../constants/layout';
import { navigateToCategoryProducts } from '../../navigation/productNavigation';
import { resolveServiceCategoryKey } from '../../utils/serviceCategoryUtils';

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

/** Filled Tabler icons for every service tile (no outline). */
const CATEGORY_ICONS: Record<string, TablerIconName> = {
  all: 'apps-filled',
  consult: 'medical-cross-filled',
  medicine: 'pill-filled',
  products: 'package-filled',
  yoga: 'barbell-filled',
  diet: 'salad-filled',
};

const SERVICE_ROUTES: Record<string, string> = {
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

const resolveCategoryIcon = (item: Category): TablerIconName => {
  if (item.id === 'all') return CATEGORY_ICONS.all;
  const serviceKey = resolveServiceCategoryKey(item);
  if (serviceKey && CATEGORY_ICONS[serviceKey]) {
    return CATEGORY_ICONS[serviceKey];
  }
  const nameKey = item?.name?.trim().toLowerCase() ?? '';
  return CATEGORY_ICONS[nameKey] ?? 'category-filled';
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
  const iconName = resolveCategoryIcon(item);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Animated.View style={[styles.tile, active && styles.tileActive, animStyle]}>
        <TablerIcon name={iconName} size={22} color={Colors.primaryColor} />
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

      const nameKey = item?.name?.trim().toLowerCase() ?? '';
      const serviceKey = resolveServiceCategoryKey(item) ?? nameKey;
      const route =
        SERVICE_ROUTES[serviceKey] || SERVICE_ROUTES[nameKey] || null;

      // Doctor / consult service → Consult tab/screen (never CategoryProducts)
      if (serviceKey === 'consult' || route === 'ConsultScreen') {
        navigation.navigate('ConsultScreen' as never);
        return;
      }

      if (route) {
        navigation.navigate(route as never);
        return;
      }

      navigateToCategoryProducts(navigation, {
        categoryName: item.name,
        categoryId: item.id,
        categoryMode: 'product',
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
