import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
  ImageSourcePropType,
} from 'react-native';
import { Colors } from '../common/Colors';

const { width } = Dimensions.get('window');

const SPACING = 10;
const AUTO_SLIDE_MS = 4500;

type Props = {
  images: any[];
  itemWidth?: number;
  itemHeight?: number;
  showIndicator?: boolean;
  DynamicResize?: 'cover' | 'contain';
  autoSlide?: boolean;
};

const Detailimages: React.FC<Props> = ({
  images,
  itemWidth,
  itemHeight,
  DynamicResize = 'cover',
  showIndicator = true,
  autoSlide = true,
}) => {
  const finalWidth = itemWidth ?? width - 40;
  const finalHeight = itemHeight ?? 156;

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
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
    if (!autoSlide || safeImages.length <= 1) return;

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
  }, [autoSlide, safeImages.length, slideSize]);

  if (safeImages.length === 0) return null;

  return (
    <View style={styles.wrapper}>
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
        contentContainerStyle={styles.listContent}
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
            <View
              style={[
                styles.slide,
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
                  resizeMode={DynamicResize}
                />
              ) : (
                <View style={styles.placeholder} />
              )}
            </View>
          );
        }}
      />

      {showIndicator && safeImages.length > 1 && (
        <View style={styles.indicatorContainer}>
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
                      index === activeIndex ? Colors.primaryColor : '#C5D9D2',
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

export default React.memo(Detailimages);

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 6,
    marginBottom: 10,
  },
  listContent: {
    paddingRight: SPACING,
  },
  slide: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    // overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E8EDF2',
    // shadowColor: '#0D614E',
    // shadowOffset: { width: 0, height: 3 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
});
