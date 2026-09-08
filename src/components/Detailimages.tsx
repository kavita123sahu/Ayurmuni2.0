import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Animated,
  ImageSourcePropType,
  PixelRatio,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { BANNER, getContentWidth, getScreenPaddingH, SCREEN, TYPO } from '../constants/responsive';
import TablerIcon from './TablerIcon';
import { useNavigation } from '@react-navigation/native';
import ProductImagePreviewModal from './ProductImagePreviewModal';
import { resolveBannerNavigation } from '../utils/bannerNavigation';

const SPACING = 10;
const AUTO_SLIDE_MS = 4500;

type Props = {
  images: any[];
  itemWidth?: number;
  itemHeight?: number;
  aspectRatio?: number;
  showIndicator?: boolean;
  DynamicResize?: 'cover' | 'contain';
  autoSlide?: boolean;
  embedded?: boolean;
  /** Edge-to-edge product gallery (Flipkart / Zepto PDP) */
  fullBleed?: boolean;
  /** Home promo banners vs product gallery */
  mode?: 'product' | 'banner';
  /** Disable fullscreen preview (banner default) */
  enablePreview?: boolean;
  /** Hide the Preview chip (image tap still opens preview) */
  showPreviewChip?: boolean;
};

const getUriFromSource = (source: ImageSourcePropType | null): string | null => {
  if (!source || typeof source === 'number') return null;
  const uri = (source as { uri?: string })?.uri;
  return uri ? String(uri) : null;
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
  fullBleed = false,
  mode = 'product',

  enablePreview,
  showPreviewChip,
}) => {
  const isBanner = mode === 'banner';
  const isFlush = embedded || fullBleed;
  const resizeMode = DynamicResize ?? (isBanner ? 'cover' : 'cover');
  const allowPreview = enablePreview ?? !isBanner;
  const showChip = showPreviewChip ?? allowPreview;

  const paddingH = getScreenPaddingH();
  const fallbackWidth = fullBleed
    ? SCREEN.width
    : (itemWidth ?? getContentWidth(paddingH));
  const [layoutWidth, setLayoutWidth] = useState(0);
  const finalWidth =
    (isBanner || fullBleed) && layoutWidth > 0 ? layoutWidth : fallbackWidth;
  const finalHeight =
    itemHeight ?? PixelRatio.roundToNearestPixel(finalWidth / aspectRatio);

  const slideGap = isFlush ? 0 : SPACING;
  const slideSize = finalWidth + slideGap;

  const navigation = useNavigation<any>();

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const prefetchedRef = useRef<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images],
  );

  const getImageSource = useCallback(
    (item: any): ImageSourcePropType | null => {
      if (!item) return null;

      if (typeof item === 'number') return item;

      if (typeof item === 'string' && item.length > 0) {
        return { uri: item };
      }

      if (item?.uri) return item;

      const uri =
        item?.image_url ||
        item?.media_url ||
        item?.image ||
        item?.url;

      return uri ? { uri: String(uri) } : null;
    },
    [],
  );

  const resolvedImages = useMemo(() => {
    const out: { item: any; source: ImageSourcePropType; uri: string | null }[] =
      [];
    safeImages.forEach(item => {
      const source = getImageSource(item);
      if (source) {
        out.push({ item, source, uri: getUriFromSource(source) });
      }
    });
    return out;
  }, [safeImages, getImageSource]);

  const previewImages = useMemo(
    () =>
      resolvedImages.map(entry => ({
        source: entry.source,
        uri: entry.uri ?? undefined,
      })),
    [resolvedImages],
  );

  useEffect(() => {
    resolvedImages.forEach(entry => {
      if (!entry.uri || prefetchedRef.current.has(entry.uri)) return;
      prefetchedRef.current.add(entry.uri);
      Image.prefetch(entry.uri).catch(() => {
        prefetchedRef.current.delete(entry.uri!);
      });
    });
  }, [resolvedImages]);

  const handleBannerPress = useCallback(
    (item: any) => {
      if (!isBanner) return;

      const target = resolveBannerNavigation(item?.redirect_url, item);

      if (!target) {
        return;
      }

      if (target.screen === '__external__' && target.params?.url) {
        Linking.openURL(String(target.params.url)).catch(() => undefined);
        return;
      }

      if (target.params) {
        navigation.navigate(target.screen, target.params);
      } else {
        navigation.navigate(target.screen);
      }
    },
    [isBanner, navigation],
  );

  useEffect(() => {
    if (!autoSlide || resolvedImages.length <= 1 || previewVisible) return;

    const timer = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % resolvedImages.length;
        flatListRef.current?.scrollToOffset({
          offset: next * slideSize,
          animated: true,
        });
        return next;
      });
    }, AUTO_SLIDE_MS);

    return () => clearInterval(timer);
  }, [autoSlide, resolvedImages.length, slideSize, previewVisible]);

  const openPreview = (index: number) => {
    if (!allowPreview || previewImages.length === 0) return;
    setPreviewIndex(Math.min(index, previewImages.length - 1));
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
  };

  if (resolvedImages.length === 0) return null;

  return (
    <View
      style={[
        styles.wrapper,
        isFlush && styles.wrapperEmbedded,
        fullBleed && styles.wrapperFullBleed,
        isBanner && styles.wrapperBanner,
      ]}
      onLayout={e => {
        if (!isBanner && !fullBleed) return;
        const w = Math.round(e.nativeEvent.layout.width);
        if (w > 0 && w !== layoutWidth) {
          setLayoutWidth(w);
        }
      }}
    >
      <FlatList
        ref={flatListRef}
        data={resolvedImages}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `banner-${index}`}
        snapToInterval={slideSize}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        bounces={false}
        removeClippedSubviews={resolvedImages.length > 4}
        initialNumToRender={Math.min(resolvedImages.length, 6)}
        maxToRenderPerBatch={Math.min(resolvedImages.length, 6)}
        windowSize={Math.min(resolvedImages.length, 5)}
        contentContainerStyle={[
          isFlush ? styles.listContentEmbedded : styles.listContent,
          {
            paddingHorizontal:
              isFlush || isBanner ? 0 : SPACING,
          },
        ]}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / slideSize);
          setActiveIndex(Math.min(index, resolvedImages.length - 1));
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        renderItem={({ item: entry, index }) => {
          // const source = entry.source;
          return (
            <TouchableOpacity
              activeOpacity={
                isBanner ? 0.92 : allowPreview ? 0.92 : 1
              }
              disabled={!isBanner && !allowPreview}
              onPress={() => {
                if (isBanner) {
                  handleBannerPress(entry.item);
                } else {
                  openPreview(index);
                }
              }}
              style={[
                styles.slide,
                isBanner && styles.slideBanner,
                fullBleed && styles.slideFullBleed,
                {
                  marginLeft: index === 0 ? 0 : slideGap,
                  width: finalWidth,
                  height: finalHeight,
                },
              ]}
            >
              {entry?.source ? (
                <Image
                  source={entry.source}
                  style={styles.image}
                  resizeMode={resizeMode}
                />
              ) : (
                <View style={styles.placeholder} />
              )}
            </TouchableOpacity>
          );
        }}
      />

      {allowPreview && showChip ? (
        <TouchableOpacity
          style={styles.previewBtn}
          onPress={() => openPreview(activeIndex)}
          activeOpacity={0.85}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <TablerIcon name="eye" size={14} color="#FFFFFF" />
          <Text style={styles.previewBtnText}>Preview</Text>
        </TouchableOpacity>
      ) : null}

      {showIndicator && resolvedImages.length > 1 && (
        <View
          style={[
            styles.indicatorContainer,
            fullBleed && styles.indicatorPdp,
            isBanner && styles.indicatorBanner,
            embedded && styles.indicatorEmbedded,
          ]}
        >
          {resolvedImages.map((_, index) => {
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
                        ? isBanner || fullBleed
                          ? '#FFFFFF'
                          : Colors.primaryColor
                        : isBanner || fullBleed
                          ? 'rgba(255,255,255,0.45)'
                          : '#C5D9D2',
                  },
                ]}
              />
            );
          })}
        </View>
      )}

      {allowPreview ? (
        <ProductImagePreviewModal
          images={previewImages}
          visible={previewVisible}
          initialIndex={previewIndex}
          onClose={closePreview}
        />
      ) : null}
    </View>
  );
};

export default React.memo(Detailimages);

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 6,
    marginBottom: 10,
    position: 'relative',
  },
  wrapperEmbedded: {
    marginTop: 0,
    marginBottom: 0,
  },
  wrapperBanner: {
    marginTop: 0,
    marginBottom: 6,
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
    borderRadius: 14,
  },
  listContent: {
    paddingRight: SPACING,
  },
  listContentEmbedded: {
    paddingRight: 0,
  },
  slide: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E8EDF2',
  },
  slideBanner: {
    borderRadius: 14,
    borderWidth: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  wrapperFullBleed: {
    backgroundColor: '#FFFFFF',
  },
  slideFullBleed: {
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
  },
  indicatorPdp: {
    position: 'absolute',
    bottom: 10,
    marginTop: 0,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  previewBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 6,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  previewBtnText: {
    color: '#FFFFFF',
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  indicatorOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginTop: 0,
  },
  indicatorBanner: {
    bottom: 12,
  },
  indicatorEmbedded: {
    bottom: 28,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
});
