import React, { useState } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '../common/Vector';

const WishlistButton = () => {
  const [liked, setLiked] = useState(false);
  const scale = new Animated.Value(1);

  const handlePress = () => {
    setLiked(!liked);

    // 🔥 Animation
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={25}
         
          color={liked ? '#EF4444' : '#ffffff'} // red / grey
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default WishlistButton;

const styles = StyleSheet.create({
  container: {
  position: 'absolute',
    top: -0,
    right: 4,
    zIndex: 25,
    // backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
  },
  wishlist: {
  
  top: 8,
  right: 8,
  zIndex: 10,
}
});