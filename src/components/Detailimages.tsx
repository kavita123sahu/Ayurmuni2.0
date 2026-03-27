import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');

const DEFAULT_WIDTH = width - 48;
const DEFAULT_HEIGHT = 300;
const SPACING = 12;

type Props = {
  images: any[];
  itemWidth?: number;
  itemHeight?: number;
  showIndicator?: boolean; 
};

const Detailimages: React.FC<Props> = ({
  images,
  itemWidth,
  itemHeight,
  showIndicator = true, 
}) => {

  const finalWidth = itemWidth ?? DEFAULT_WIDTH;
  const finalHeight = itemHeight ?? DEFAULT_HEIGHT;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!images || images.length === 0 || !isAutoPlay) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % images.length;

        flatListRef.current?.scrollToOffset({
          offset: nextIndex * (finalWidth + SPACING),
          animated: true,
        });

        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlay, images, finalWidth]);

  if (!images || images.length === 0) return null;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}

        snapToInterval={finalWidth + SPACING}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={false}
        scrollEventThrottle={16}

        contentContainerStyle={{
          paddingLeft: 24,
          paddingRight: 24,
        }}

        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (finalWidth + SPACING)
          );
          setActiveIndex(index);
        }}

        onTouchStart={() => setIsAutoPlay(false)}

        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}

        renderItem={({ item }) => (
          <Image
            source={typeof item === 'string' ? { uri: item } : item}
            style={{
              width: finalWidth,
              height: finalHeight,
              borderRadius: 24,
              marginRight: SPACING,
            }}
          />
        )}
      />

      {showIndicator && (
        <View style={styles.indicatorContainer}>
          {images.map((_, index) => {
            const inputRange = [
              (index - 1) * (finalWidth + SPACING),
              index * (finalWidth + SPACING),
              (index + 1) * (finalWidth + SPACING),
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [6, 18, 6],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
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

export default Detailimages;

const styles = StyleSheet.create({
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D614E',
    marginHorizontal: 4,
  },
});