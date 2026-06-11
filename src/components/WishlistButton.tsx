import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '../common/Vector';
import { Colors } from '../common/Colors';

interface WishlistButtonProps {
  isWishlisted: boolean;
  onPress: () => void;
}

const WishlistButton = ({
  isWishlisted,
  onPress,
}: WishlistButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.25,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <Ionicons
          name={
            isWishlisted
              ? 'heart'
              : 'heart-outline'
          }
          size={16}
          color={
            isWishlisted
              ? Colors.primaryColor
              : '#666'
          }
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default WishlistButton;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 99,
  },

  iconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 1,

    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.15,
    // shadowRadius: 4,
  },
});