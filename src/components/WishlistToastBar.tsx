import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TablerIcon from './TablerIcon';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import {
  WishlistEvents,
  WISHLIST_UPDATED,
  WishlistUpdatedPayload,
} from '../common/Utils';
import {
  adjustWishlistCount,
  getWishlistCount,
  subscribeWishlistCount,
} from '../utils/wishlistCount';
import { navigationRef } from '../navigation/navigationRef';

const AUTO_HIDE_MS = 5000;

const WishlistToastBar = () => {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(getWishlistCount());
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateY = useRef(new Animated.Value(100)).current;

  const hide = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  }, [translateY]);

  const show = useCallback(() => {
    setVisible(true);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(hide, AUTO_HIDE_MS);
  }, [hide, translateY]);

  useEffect(() => subscribeWishlistCount(setCount), []);

  useEffect(() => {
    const sub = WishlistEvents.addListener(
      WISHLIST_UPDATED,
      (...args: unknown[]) => {
        const payload = args[0] as WishlistUpdatedPayload | undefined;
        if (!payload?.variantId) return;

        adjustWishlistCount(payload.isWishlisted ? 1 : -1);
        if (payload.isWishlisted) {
          show();
        }
      },
    );

    return () => {
      sub.remove();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [show]);

  const openWishlist = () => {
    hide();
    if (navigationRef.isReady()) {
      navigationRef.navigate('HomeStack', { screen: 'Wishlist' });
    }
  };

  if (!visible || count <= 0) {
    return null;
  }

  const itemLabel = count === 1 ? 'item' : 'items';

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          bottom: Math.max(insets.bottom, 10) + 68,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.bar}
        onPress={openWishlist}
      >
        <View style={styles.iconWrap}>
          <TablerIcon name="heart-filled" size={15} color="#FFFFFF" />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>View wishlist</Text>
          <Text style={styles.subtitle}>
            {count} {itemLabel}
          </Text>
        </View>

        <TablerIcon name="chevron-right" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default WishlistToastBar;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignSelf: 'center',
    left: 16,
    right: 16,
    zIndex: 999,
    elevation: 12,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primaryColor,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#0D614E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Fonts.PoppinsRegular,
  },
});
