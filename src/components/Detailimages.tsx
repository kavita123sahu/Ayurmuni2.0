import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Animated,
  ImageSourcePropType,
  PixelRatio,
  Modal,
  TouchableOpacity,
  Pressable,
  Text,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { BANNER, getContentWidth, getScreenPaddingH } from '../constants/responsive';
import TablerIcon from './TablerIcon';

const SPACING = 10;
const AUTO_SLIDE_MS = 4500;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Props = {
  images: any[];
  itemWidth?: number;
  itemHeight?: number;
  aspectRatio?: number;
  showIndicator?: boolean;
  DynamicResize?: 'cover' | 'contain';
  autoSlide?: boolean;
  embedded?: boolean;
  /** Home promo banners vs product gallery */
  mode?: 'product' | 'banner';
  /** Disable fullscreen preview (banner default) */
  enablePreview?: boolean;
};

const Detailimages: React.FC<Props> = ({
  images,
  itemWidth,
  itemHeight,
  aspectRatio = BANNER.aspectRatio,
  DynamicResize,
  showIndicator = true,
  autoSlide = true,
  embedded = false,
  mode = 'product',
  enablePreview,
}) => {
  const isBanner = mode === 'banner';
  const resizeMode = DynamicResize ?? (isBanner ? 'cover' : 'cover');
  const allowPreview = enablePreview ?? !isBanner;

  const paddingH = getScreenPaddingH();
  const finalWidth = itemWidth ?? getContentWidth(paddingH);
  const finalHeight =
    itemHeight ?? PixelRatio.roundToNearestPixel(finalWidth / aspectRatio);

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const slideSize = finalWidth + SPACING;

  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images],
  );

  const getImageSource = useCallback((item: any): ImageSourcePropType | null => {
    if (!item) return null;
    if (typeof item === 'number') return item;
    if (typeof item === 'string' && item.length > 0) return { uri: item };
    if (item?.uri) return item;
    const uri =
      item?.media_url || item?.image_url || item?.image || item?.url;
    return uri ? { uri: String(uri) } : null;
  }, []);

  useEffect(() => {
    if (!autoSlide || safeImages.length <= 1 || previewIndex !== null) return;

    const timer = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % safeImages.length;
        flatListRef.current?.scrollToOffset({
          offset: next * slideSize,
          animated: true,
        });
        return next;
      });
    }, AUTO_SLIDE_MS);

    return () => clearInterval(timer);
  }, [autoSlide, safeImages.length, slideSize, previewIndex]);

  const openPreview = (index: number) => {
    if (!allowPreview) return;
    setPreviewIndex(index);
  };

  const closePreview = () => {
    setPreviewIndex(null);
  };

  const previewSource =
    previewIndex !== null ? getImageSource(safeImages[previewIndex]) : null;

  if (safeImages.length === 0) return null;

  return (
    <View
      style={[
        styles.wrapper,
        embedded && styles.wrapperEmbedded,
        isBanner && styles.wrapperBanner,
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={safeImages}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `banner-${index}`}
        snapToInterval={slideSize}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        bounces={false}
        removeClippedSubviews
        contentContainerStyle={[styles.listContent, { paddingHorizontal: !isBanner ? SPACING : undefined }]}
        onMomentumScrollEnd={e => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / slideSize,
          );
          setActiveIndex(Math.min(index, safeImages.length - 1));
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          const source = getImageSource(item);
          return (
            <TouchableOpacity
              activeOpacity={allowPreview ? 0.92 : 1}
              disabled={!allowPreview}
              onPress={() => openPreview(index)}
              style={[
                styles.slide,
                isBanner && styles.slideBanner,
                {
                  marginLeft: index === 0 ? 0 : SPACING,
                  width: finalWidth,
                  height: finalHeight,
                },
              ]}
            >
              {source ? (
                <Image
                  source={source}
                  style={styles.image}
                  resizeMode={resizeMode}
                />
              ) : (
                <View style={styles.placeholder} />
              )}
              {allowPreview ? (
                <View style={styles.tapHint}>
                  <TablerIcon name="eye" size={14} color="#FFFFFF" />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />

      {showIndicator && safeImages.length > 1 && (
        <View
          style={[
            styles.indicatorContainer,
            isBanner && styles.indicatorBanner,
          ]}
        >
          {safeImages.map((_, index) => {
            const inputRange = [
              (index - 1) * slideSize,
              index * slideSize,
              (index + 1) * slideSize,
            ];

            const widthAnim = scrollX.interpolate({
              inputRange,
              outputRange: [6, 18, 6],
              extrapolate: 'clamp',
            });

            const opacityAnim = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={`dot-${index}`}
                style={[
                  styles.dot,
                  {
                    width: widthAnim,
                    opacity: opacityAnim,
                    backgroundColor:
                      index === activeIndex
                        ? isBanner
                          ? '#FFFFFF'
                          : Colors.primaryColor
                        : isBanner
                          ? 'rgba(255,255,255,0.45)'
                          : '#C5D9D2',
                  },
                ]}
              />
            );
          })}
        </View>
      )}

      <Modal
        visible={previewIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={closePreview}
        statusBarTranslucent
      >
        <View style={styles.previewOverlay}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <Pressable style={StyleSheet.absoluteFill} onPress={closePreview} />

          <View style={styles.previewHeader}>
            <Text style={styles.previewCounter}>
              {(previewIndex ?? 0) + 1} / {safeImages.length}
            </Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={closePreview}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <TablerIcon name="x" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {previewSource ? (
            <Image
              source={previewSource}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

export default React.memo(Detailimages);

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 6,
    marginBottom: 10,
  },
  wrapperEmbedded: {
    marginTop: 0,
    marginBottom: 0,
  },
  wrapperBanner: {
    marginTop: 0,
    marginBottom: 4,
  },
  listContent: {

    paddingRight: SPACING,
  },
  slide: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E8EDF2',
  },
  slideBanner: {

    // backgroundColor: '#0B2E26',
    borderRadius: 18,
    borderWidth: 0,
    // elevation: 2,
    // shadowColor: '#0D614E',
    // shadowOpacity: 0.12,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 3 },
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  tapHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  indicatorBanner: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    marginTop: 0,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewHeader: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewCounter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: SCREEN_W,
    height: SCREEN_H * 0.72,
  },
});
