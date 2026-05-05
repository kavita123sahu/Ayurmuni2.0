import React, { useEffect } from 'react';
import { Text, ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Fonts } from '../common/Fonts';

const AnimatedImageBg = Animated.createAnimatedComponent(ImageBackground);

const StyleCard = ({ data, index }: { data: any; index: number }) => {
  const translateY = useSharedValue(50); // start from bottom
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 500 + index * 100 });
    opacity.value = withTiming(1, { duration: 500 + index * 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <AnimatedImageBg
      source={{ uri: data.image }}
      style={[styles.card, animatedStyle]}
      imageStyle={{ borderRadius: 25 }}
    >
      {/* 🔥 Full Overlay */}
    <View style={styles.textWrapper}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.subtitle}>{data.subtitle}</Text>
      </View>
    </AnimatedImageBg>
  );
};

export default StyleCard;

const styles = StyleSheet.create({
  card: {
    height: 220,
    marginBottom: 12,
    backgroundColor: '#E8F3EF',
    borderRadius: 25,
    padding: 20,

    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    borderRadius: 25,
  },

 textWrapper: {
  alignSelf: 'flex-start',
  backgroundColor: 'rgba(0,0,0,0.5)', // 👈 only behind text
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 8,
},

title: {
  color: '#fff',
  fontSize: 16,
  fontFamily: Fonts.PoppinsSemiBold,

  // light shadow for sharpness
  textShadowColor: 'rgba(0,0,0,0.8)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
},

subtitle: {
  color: '#fff',
  fontSize: 12,
  fontFamily: Fonts.PoppinsRegular,
  marginTop: 2,

  textShadowColor: 'rgba(0,0,0,0.8)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,
},
});