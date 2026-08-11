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

/** Consult-first service card when home only exposes consultation. */
const ConsultServiceHero = ({
  service,
  navigation,
}: {
  service?: Category | null;
  navigation: any;
}) => {
  const title = service?.name?.trim() || 'Consult';
  const openConsult = useCallback(() => {
    navigation?.navigate?.('ConsultScreen');
  }, [navigation]);

  return (
    <Pressable
      onPress={openConsult}
      style={({ pressed }) => [styles.heroCard, pressed && styles.heroPressed]}
    >
      <View style={styles.heroLeft}>
        <View style={styles.heroIconWrap}>
          {service?.image_url ? (
            <Image
              source={{ uri: service.image_url }}
              style={styles.heroServiceImage}
              resizeMode="contain"
            />
          ) : (
            <TablerIcon name="stethoscope" size={22} color="#FFFFFF" />
          )}
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>Our service</Text>
          <Text style={styles.heroTitle} numberOfLines={1}>
            Doctor Consultation
          </Text>
          <Text style={styles.heroSub} numberOfLines={2}>
            Book verified Ayurvedic doctors for online care — quick, private,
            and personalized.
          </Text>
        </View>
      </View>

      <View style={styles.heroCta}>
        <Text style={styles.heroCtaText}>Book</Text>
        <TablerIcon name="chevron-right" size={16} color="#FFFFFF" />
      </View>
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

  // Phase-1 / consult-only: single home service → focused CTA (keep strip code below)
  const showMultiServiceStrip = services.length > 1;

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

  // ——— Single service (consult-only): useful service banner ———
  if (!showMultiServiceStrip) {
    return (
      <View style={[styles.wrapper, sticky && styles.wrapperSticky]}>
        <ConsultServiceHero service={services[0]} navigation={navigation} />
      </View>
    );
  }

  // ——— Multi service strip (original UI — do not remove) ———
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
    height: TILE_SIZE / 1.5,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    marginBottom: -2,
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
    // marginTop: 2,
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

  /* Consult-only hero */
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D614E',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  heroPressed: {
    opacity: 0.94,
  },
  heroLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroServiceImage: {
    width: 28,
    height: 28,
    tintColor: '#FFFFFF',
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroEyebrow: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: Fonts.PoppinsMedium,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroSub: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: Fonts.PoppinsRegular,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroCtaText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
