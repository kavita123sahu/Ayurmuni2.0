import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
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
const ITEM_GAP = 5;
const ITEM_WIDTH = Math.floor((SCREEN_W - 16) / 5.15);
const TILE_W = Math.min(52, ITEM_WIDTH - 6);
const TILE_H = 40;

interface Category {
  id: string;
  name: string;
  image_url: string;
  redirect_url: string
}

/** Title-case first letter of each word for service category labels. */
const formatCategoryLabel = (name?: string) => {
  const raw = String(name || '').trim();
  if (!raw) return '';
  return raw
    .split(/\s+/)
    .map(word =>
      word
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word,
    )
    .join(' ');
};

/** Filled Tabler icons for every service tile (no outline). */
const CATEGORY_ICONS: Record<string, TablerIconName> = {
  all: 'view-all',
  'view all': 'view-all',
  viewall: 'view-all',
  consult: 'medical-cross-filled',
  consultation: 'medical-cross-filled',
  consultations: 'medical-cross-filled',
  doctor: 'medical-cross-filled',
  doctors: 'medical-cross-filled',
  medicine: 'pill-filled',
  medicines: 'pill-filled',
  products: 'package-filled',
  product: 'package-filled',
  yoga: 'barbell-filled',
  diet: 'salad-filled',
  'diet plan': 'salad-filled',
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

const resolveCategoryImageUri = (item: Category): string => {
  const raw =
    item?.image_url ||
    (item as any)?.image ||
    (item as any)?.icon_url ||
    (item as any)?.media_url ||
    '';
  return typeof raw === 'string' ? raw.trim() : '';
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
  const imageUri = resolveCategoryImageUri(item);
  const showImage = item.id !== 'all' && imageUri.length > 0;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Animated.View style={[styles.tile, active && styles.tileActive, animStyle]}>
        {showImage ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.tileImage}
            resizeMode="contain"
          />
        ) : (
          <TablerIcon name={iconName} size={22} color={Colors.primaryColor} />
        )}
      </Animated.View>

      <Text
        numberOfLines={2}
        ellipsizeMode="tail"
        style={[styles.label, active && styles.labelActive]}
      >
        {formatCategoryLabel(item.name)}
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

  console.log("servicesservicesservices", services)
  const listData = useMemo(() => [ALL_ITEM, ...services], [services]);

  // const listData = useMemo(() => [...services], [services]);

  const handlePress = useCallback(

    (item: Category) => {
      console.log("itessssssssssssss", item)
      setActiveId(item.id);

      const redirectUrl = item?.redirect_url?.trim();

      if (redirectUrl) {
        navigation.navigate(redirectUrl as never);
        return;
      }

      const nameKey = item?.name?.trim().toLowerCase() ?? '';
      const serviceKey = resolveServiceCategoryKey(item) ?? nameKey;
      const route =
        SERVICE_ROUTES[serviceKey] || SERVICE_ROUTES[nameKey] || null;

      if (route) {
        navigation.navigate(route as never);
        return;
      }
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
    width: ITEM_WIDTH - 16,
    alignItems: 'center',
    marginRight: ITEM_GAP,
  },
  tile: {
    width: TILE_W - 6,
    height: TILE_H - 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileImage: {
    width: TILE_W - 10,
    height: TILE_H - 10,
  },
  tileActive: {
    opacity: 1,
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 12,
    minHeight: 24,
    textAlign: 'center',
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
    width: '100%',
    paddingHorizontal: 1,
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
