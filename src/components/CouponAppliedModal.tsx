import React, { useEffect, useMemo, useRef } from 'react';
import {
  Text,
  Modal,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  View,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import { formatRupee } from '../utils/currencyUtils';

type Props = {
  visible: boolean;
  code?: string;
  discount?: number;
  title?: string;
  subtitle?: string;
  onClose: () => void;
};

const { width } = Dimensions.get('window');
const CONFETTI_COLORS = ['#0D614E', '#C9A227', '#E8C77B', '#1FA37D', '#FFFFFF'];

const CouponAppliedModal = ({
  visible,
  code,
  discount = 0,
  title,
  subtitle,
  onClose,
}: Props) => {
  const scale = useRef(new Animated.Value(0.4)).current;
  const ring = useRef(new Animated.Value(0.6)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        key: i,
        x: (width / 17) * (i + 0.5) + (i % 2 === 0 ? -12 : 12),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: 40 * i,
        drift: i % 2 === 0 ? -28 : 32,
        size: 6 + (i % 4),
        anim: new Animated.Value(0),
      })),
    [],
  );

  useEffect(() => {
    if (!visible) {
      scale.setValue(0.4);
      ring.setValue(0.6);
      fade.setValue(0);
      particles.forEach(p => p.anim.setValue(0));
      return;
    }

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(ring, {
          toValue: 1.18,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ring, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
      ...particles.map(p =>
        Animated.timing(p.anim, {
          toValue: 1,
          duration: 1100,
          delay: p.delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ]).start();

    const timer = setTimeout(() => onCloseRef.current(), 2600);
    return () => clearTimeout(timer);
  }, [visible, fade, particles, ring, scale]);

  const saveLine =
    discount > 0
      ? `You saved ${formatRupee(discount)}`
      : subtitle || 'Coupon ready to use at checkout';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        {particles.map(p => (
          <Animated.View
            key={p.key}
            style={[
              styles.confetti,
              {
                left: p.x,
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                backgroundColor: p.color,
                opacity: p.anim.interpolate({
                  inputRange: [0, 0.2, 1],
                  outputRange: [0, 1, 0],
                }),
                transform: [
                  {
                    translateY: p.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [120, 520],
                    }),
                  },
                  {
                    translateX: p.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, p.drift],
                    }),
                  },
                  {
                    rotate: p.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        <Animated.View
          style={[styles.card, { opacity: fade, transform: [{ scale }] }]}
        >
          <Animated.View style={[styles.ring, { transform: [{ scale: ring }] }]} />
          <View style={styles.checkWrap}>
            <TablerIcon name="check" size={34} color="#FFFFFF" />
          </View>
          <Text style={styles.yay}>Yay!</Text>
          <Text style={styles.title}>{title || 'Coupon applied'}</Text>
          <Text style={styles.save}>{saveLine}</Text>
          {!!code && (
            <View style={styles.codeChip}>
              <Text style={styles.codeLabel}>Code</Text>
              <Text style={styles.code}>{code}</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CouponAppliedModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 33, 28, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  confetti: {
    position: 'absolute',
    top: 0,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 26,
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    top: 18,
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#D7E8E1',
  },
  checkWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    zIndex: 1,
  },
  yay: {
    fontSize: 28,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  title: {
    marginTop: 2,
    fontSize: 14,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  save: {
    marginTop: 10,
    fontSize: 17,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    lineHeight: 24,
  },
  codeChip: {
    marginTop: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primaryColor,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F3FBF8',
    alignItems: 'center',
    minWidth: 140,
  },
  codeLabel: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 2,
  },
  code: {
    fontSize: 14,
    letterSpacing: 1,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
