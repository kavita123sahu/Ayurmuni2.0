import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');

const DEFAULT_WIDTH = width * 0.84;
const DEFAULT_HEIGHT = 240;
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

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const SIDE_GAP = (width - finalWidth) / 2;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}

        // ✅ SNAP
        snapToInterval={finalWidth + SPACING}
        snapToAlignment="start"
        decelerationRate={0.98}
        disableIntervalMomentum={true}

        bounces={false}

        // ✅ START LEFT + LAST FIX
        contentContainerStyle={{
          paddingLeft: 0,
          paddingRight: SIDE_GAP,
        }}

        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (finalWidth + SPACING)
          );
          setActiveIndex(index);
        }}

        // ✅ SMOOTH ANIMATION DRIVER
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}

        scrollEventThrottle={16}

        renderItem={({ item, index }) => (
          <View
            style={{
              marginLeft: index === 0 ? 0 : SPACING,
            }}
          >
            <Image
              source={typeof item === 'string' ? { uri: item } : item}
              style={{
                width: finalWidth,
                height: finalHeight,
                borderRadius: 24,
                resizeMode: 'contain'
              }}
            />
          </View>
        )}
      />

      {/* 🔥 SMOOTH INDICATOR */}
      {showIndicator && (
        <View style={styles.indicatorContainer}>
          {images.map((_, index) => {
            const inputRange = [
              (index - 1) * (finalWidth + SPACING),
              index * (finalWidth + SPACING),
              (index + 1) * (finalWidth + SPACING),
            ];

            const widthAnim = scrollX.interpolate({
              inputRange,
              outputRange: [6, 18, 6],
              extrapolate: 'clamp',
            });

            const opacityAnim = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            const colorAnim = scrollX.interpolate({
              inputRange,
              outputRange: ['#A0C4B8', '#0D614E', '#A0C4B8'],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: widthAnim,
                    opacity: opacityAnim,
                    backgroundColor: colorAnim,
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
    marginHorizontal: 4,
  },
});