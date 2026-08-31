import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TablerIcon from './TablerIcon';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import {
  CartEvents,
  CART_ITEM_ADDED,
  CartItemAddedPayload,
} from '../common/Utils';
import { navigationRef } from '../navigation/navigationRef';
import { navigateToStackScreen } from '../navigation/navigationUtils';
import { useAppSelector } from '../store/hooks';
import { selectCartCount } from '../store/slices/cartSlice';

const AUTO_HIDE_MS = 4500;

const CartAddedToastBar = () => {
  const insets = useSafeAreaInsets();
  const cartCount = useAppSelector(selectCartCount);
  const [visible, setVisible] = useState(false);
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState<string | undefined>();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateY = useRef(new Animated.Value(120)).current;

  const hide = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 120,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setVisible(false);
        setProductName('');
        setProductImage(undefined);
      }
    });
  }, [translateY]);

  const show = useCallback(
    (payload: CartItemAddedPayload) => {
      setProductName(payload.productName?.trim() || 'Item');
      setProductImage(payload.image);
      setVisible(true);

      Animated.timing(translateY, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start();

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(hide, AUTO_HIDE_MS);
    },
    [hide, translateY],
  );

  useEffect(() => {
    const sub = CartEvents.addListener(
      CART_ITEM_ADDED,
      (...args: unknown[]) => {
        const payload = args[0] as CartItemAddedPayload | undefined;
        if (!payload?.variantId) return;
        show(payload);
      },
    );

    return () => {
      sub.remove();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [show]);

  const openCart = () => {
    hide();
    if (navigationRef.isReady()) {
      navigateToStackScreen(navigationRef, 'MyCart');
    }
  };

  if (!visible) {
    return null;
  }

  const count = Math.max(cartCount, 1);
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
      <TouchableOpacity activeOpacity={0.92} style={styles.card} onPress={openCart}>
        <View style={styles.thumbWrap}>
          {productImage ? (
            <Image source={{ uri: productImage }} style={styles.thumb} />
          ) : (
            <TablerIcon name="shopping-cart" size={18} color={Colors.primaryColor} />
          )}
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            Added to cart
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {productName} · {count} {itemLabel}
          </Text>
        </View>

        <View style={styles.actionWrap}>
          <Text style={styles.actionText}>View cart</Text>
          <TablerIcon name="chevron-right" size={14} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CartAddedToastBar;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignSelf: 'center',
    left: 14,
    right: 14,
    zIndex: 998,
    elevation: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  thumbWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    marginTop: 1,
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  actionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primaryColor,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  actionText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
