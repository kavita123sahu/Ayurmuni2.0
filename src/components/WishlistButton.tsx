import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import TablerIcon from './TablerIcon';
import { Colors } from '../common/Colors';

interface WishlistButtonProps {
  isWishlisted: boolean;
  onPress: () => void;
}

const WishlistButton = ({ isWishlisted, onPress }: WishlistButtonProps) => {
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
      <Animated.View style={[styles.iconWrapper, { transform: [{ scale }] }]}>
        <TablerIcon
          name={isWishlisted ? 'heart-filled' : 'heart'}
          size={15}
          color={isWishlisted ? Colors.primaryColor : '#94A3B8'}
          strokeWidth={2}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default WishlistButton;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 99,
  },
  iconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
