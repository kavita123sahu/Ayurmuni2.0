import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../common/Colors';
import { Ionicons } from '../common/Vector';
interface FavouriteButtonProps {
  isFavourite: boolean;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  activeColor?: string;
  inactiveColor?: string;
}

const FavouriteButton = ({
  isFavourite,
  onPress,
  size = 24,
  style,
  activeColor = '#FF3B30',
  inactiveColor = Colors.primaryColor,
}: FavouriteButtonProps) => {
  const scaleAnim = useRef(
    new Animated.Value(1),
  ).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={style}
      onPress={handlePress}>
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
          ],
        }}>
        <Ionicons
          name={
            isFavourite
              ? 'heart'
              : 'heart-outline'
          }
          size={size}
          color={
            isFavourite
              ? activeColor
              : inactiveColor
          }
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default FavouriteButton;