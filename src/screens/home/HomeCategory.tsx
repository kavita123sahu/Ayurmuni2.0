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
import { SCREEN_PADDING_H } from '../../constants/layout';
import { navigateToCategoryProducts } from '../../navigation/productNavigation';

const SCREEN_W = Dimensions.get('window').width;
const VISIBLE_COUNT = 5;
const ITEM_GAP = 10;
const ITEM_WIDTH =
  (SCREEN_W - SCREEN_PADDING_H * 2 - ITEM_GAP * (VISIBLE_COUNT - 1)) /
  VISIBLE_COUNT;
const TILE_SIZE = Math.min(64, ITEM_WIDTH - 4);

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
  yoga: 'user',
  diet: 'heart',
};

const CATEGORY_ROUTES: Record<string, string> = {
  consult: 'ConsultScreen',
  medicine: 'MedicineScreen',
  products: 'ProductsScreen',
  yoga: 'YogaScreen',
  diet: 'DietScreen',
};

const CATEGORY_BG: Record<string, string> = {
  all: '#EAF7F2',
  consult: '#E8F5E9',
  medicine: '#FFF4E5',
  products: '#E8F1FF',
  yoga: '#F3E8FF',
  diet: '#FFE8EC',
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
  const tileBg = CATEGORY_BG[key] ?? '#F0FAF7';

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Animated.View
        style={[
          styles.tile,
          // { backgroundColor: tileBg },
          active && styles.tileActive,
          animStyle,
        ]}
      >
        {item?.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.tileImage}
            resizeMode="contain"
          />
        ) : (
          <TablerIcon name={iconName} size={26} color={Colors.primaryColor} />
        )}
      </Animated.View>

      <Text numberOfLines={1} style={[styles.label, active && styles.labelActive]}>
        {item.name}
      </Text>

      {active ? <View style={styles.activeBar} /> : <View style={styles.activeSpacer} />}
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

  const listData = useMemo(() => [ALL_ITEM, ...data], [data]);

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

  if (!listData.length) {
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
        initialNumToRender={6}
        maxToRenderPerBatch={6}
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
    paddingRight: 0,
    paddingVertical: 0,
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginRight: ITEM_GAP,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    borderColor: 'transparent',
  },
  tileActive: {
    borderColor: Colors.primaryColor,
  },
  tileImage: {
    width: '58%',
    height: '58%',
  },
  label: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    height: 14,
    textAlign: 'center',
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    width: ITEM_WIDTH,
  },
  labelActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  activeBar: {
    marginTop: 4,
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primaryColor,
  },
  activeSpacer: {
    marginTop: 4,
    height: 3,
  },
});
