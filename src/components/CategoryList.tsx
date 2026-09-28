import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import { navigateToCategoryProducts } from '../navigation/productNavigation';
import { HORIZONTAL_SCROLL_CONTENT } from '../constants/layout';
import { parseHealthSymptoms } from '../services/ProductServices';

const { width } = Dimensions.get('window');

/** Wider tiles so long single words (e.g. Hypertension) fit on one line. */
const CATEGORY_TILE_WIDTH = Math.min(75, Math.round(width / 3.15));
const CONCERN_TILE_WIDTH = Math.min(96, Math.round(width / 3.55));
const CIRCLE_RATIO = 0.78;
const AUTO_STEP_PX = 0.7;
const AUTO_TICK_MS = 20;
const RESUME_AFTER_MS = 1800;

interface Category {
  id: string;
  name: string;
  description?: string;
  subscription?: string;
  symptoms?: string[];
  image_url: any;
  service_category_name?: string;
  _homeLoopKey?: string;
}

const getTileSource = (imageUrl: any): ImageSourcePropType =>
  imageUrl && typeof imageUrl === 'string'
    ? { uri: imageUrl }
    : Images.cardiology;

const TileCard = ({
  name,
  imageUrl,
  textStyle,
  circleSize,
}: {
  name: string;
  imageUrl: any;
  textStyle: any;
  circleSize: number;
}) => {
  const source = getTileSource(imageUrl);

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconCircle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
          },
        ]}
      >
        <Image
          source={source}
          style={[
            styles.cardImage,
            { width: circleSize, height: circleSize },
          ]}
          resizeMode="contain"
        />
      </View>

      <Text
        style={textStyle}
        numberOfLines={2}
        ellipsizeMode="clip"
      >
        {name}
      </Text>
    </View>
  );
};

const CategoryList = ({
  data = [],
  navigation,
  doctor,
  mode = 'product',
  serviceCategoryId,
  variant = 'default',
  edgeScroll = false,
  /** Auto-loop scroll for health-concern rails (home / medicine). */
  autoScroll = undefined as boolean | undefined,
}: any) => {
  const isConcern = doctor || variant === 'concern';
  const itemWidth = isConcern ? CONCERN_TILE_WIDTH : CATEGORY_TILE_WIDTH;
  const circleSize = Math.round(itemWidth * CIRCLE_RATIO);
  const enableAuto =
    typeof autoScroll === 'boolean' ? autoScroll : isConcern;

  const listRef = useRef<FlatList>(null);
  const offsetRef = useRef(0);
  // Total scrollable content width (single pass, data is NOT duplicated).
  const contentWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);

  const handlePress = useCallback(
    (item: Category) => {
      const categoryDesc = String(item?.description || '').trim() || undefined;
      const categorySubscription =
        String(item?.subscription || '').trim() || undefined;

      if (doctor) {
        const symptoms = parseHealthSymptoms(item?.symptoms);

        navigation.navigate('CategoryDoctor', {
          categoryName: item.name,
          categoryId: item.id,
          categoryDesc,
          categorySubscription,
          categorySymptoms: symptoms,
          categoryImage: item?.image_url || undefined,
          categoryTag: item?.service_category_name || undefined,
        });
        return;
      }

      if (mode === 'health') {
        navigateToCategoryProducts(navigation, {
          categoryName: item.name,
          healthCategoryId: item.id,
          categoryMode: 'health',
          serviceCategoryId: serviceCategoryId || undefined,
          categoryDesc,
          categorySubscription,
        });
        return;
      }

      navigateToCategoryProducts(navigation, {
        categoryId: item.id,
        categoryName: item.name,
        categoryMode: 'product',
        serviceCategoryId: serviceCategoryId || undefined,
        categoryDesc,
        categorySubscription,
      });
    },
    [navigation, doctor, mode, serviceCategoryId],
  );

  const list = useMemo(
    () => (Array.isArray(data) ? data.filter(Boolean) : []),
    [data],
  );

  // Data is shown only once now — no duplication. Auto-scroll loops by
  // snapping back to offset 0 once it reaches the end of the content.
  const scrollData = list;

  const pauseAuto = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
      resumeTimerRef.current = null;
    }, RESUME_AFTER_MS);
  }, []);

  useEffect(() => {
    if (!enableAuto || list.length < 3) return undefined;

    const tick = setInterval(() => {
      if (pausedRef.current || draggingRef.current) return;
      const contentW = contentWidthRef.current;
      if (contentW <= 0 || !listRef.current) return;

      // Max offset is content width minus the visible viewport — once we
      // pass it there's nothing left to scroll, so snap back to the start.
      const maxOffset = Math.max(contentW - width, 0);

      offsetRef.current += AUTO_STEP_PX;
      if (offsetRef.current >= maxOffset) {
        offsetRef.current = 0;
        listRef.current.scrollToOffset({
          offset: 0,
          animated: false,
        });
        return;
      }
      listRef.current.scrollToOffset({
        offset: offsetRef.current,
        animated: false,
      });
    }, AUTO_TICK_MS);

    return () => {
      clearInterval(tick);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [enableAuto, list.length]);

  const onContentSizeChange = useCallback(
    (w: number) => {
      if (!enableAuto || list.length < 3) return;
      contentWidthRef.current = w;
    },
    [enableAuto, list.length],
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!draggingRef.current) return;
      offsetRef.current = e.nativeEvent.contentOffset.x;
    },
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Category; index: number }) => (
      <TouchableOpacity
        style={[styles.item, { width: itemWidth }, edgeScroll && styles.itemEdge]}
        onPress={() => {
          pauseAuto();
          handlePress(item);
          scheduleResume();
        }}
        onPressIn={pauseAuto}
        delayPressIn={0}
        activeOpacity={0.82}
      >
        <TileCard
          name={item.name}
          imageUrl={item?.image_url}
          textStyle={isConcern ? styles.concernText : styles.text}
          circleSize={circleSize}
        />
      </TouchableOpacity>
    ),
    [
      circleSize,
      edgeScroll,
      handlePress,
      isConcern,
      itemWidth,
      pauseAuto,
      scheduleResume,
    ],
  );

  if (list.length === 0) {
    return null;
  }

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={scrollData}
      nestedScrollEnabled
      scrollEnabled
      keyExtractor={(item, index) =>
        `${String(item?._homeLoopKey ?? item?.id ?? index)}-${index}`
      }
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        isConcern && styles.concernContainer,
        edgeScroll && styles.edgeContainer,
      ]}
      initialNumToRender={Math.min(8, scrollData.length)}
      maxToRenderPerBatch={6}
      windowSize={5}
      removeClippedSubviews
      getItemLayout={(_, index) => {
        const stride = itemWidth + 4;
        return {
          length: stride,
          offset: stride * index,
          index,
        };
      }}
      onContentSizeChange={onContentSizeChange}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onScrollBeginDrag={() => {
        draggingRef.current = true;
        pauseAuto();
      }}
      onScrollEndDrag={() => {
        draggingRef.current = false;
        scheduleResume();
      }}
      onMomentumScrollEnd={e => {
        offsetRef.current = e.nativeEvent.contentOffset.x;
        draggingRef.current = false;
        scheduleResume();
      }}
      onTouchStart={pauseAuto}
    />
  );
};

export default React.memo(CategoryList);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingBottom: 4,
  },

  concernContainer: {
    paddingRight: 4,
    gap: 0,
  },

  edgeContainer: {
    ...HORIZONTAL_SCROLL_CONTENT,
    paddingHorizontal: 0,
  },

  item: {
    alignItems: 'center',
    marginHorizontal: 2,
  },

  itemEdge: {
    marginHorizontal: 2,
  },

  card: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },

  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F4F2',
    marginBottom: 6,
  },

  cardImage: {
    borderRadius: 50,
  },

  text: {
    fontSize: 12,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    width: '100%',
    lineHeight: 16,
    includeFontPadding: false,
  },

  concernText: {
    fontSize: 11,
    lineHeight: 14,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 2,
    includeFontPadding: false,
  },
});