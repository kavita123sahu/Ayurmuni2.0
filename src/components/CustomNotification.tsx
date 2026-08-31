import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Images } from '../common/Images';
import { Fonts } from '../common/Fonts';

/** In-app banner only — auto-hides. Device tray notifications stay until swipe. */
const AUTO_HIDE_MS = 5000;

export type NotificationData = {
  title?: string;
  message?: string;
  headings?: string;
  contents?: string;
  name?: string;
  image?: string;
  type?: string;
  route?: string;
  screen?: string;
  event?: string;
  order_id?: string;
  appointment_id?: string;
  product_id?: string;
  diet_id?: string;
  doctor_id?: string;
  promotion_id?: string;
  [key: string]: any;
};

export type CustomNotificationRef = {
  show: (data: NotificationData) => void;
  hide: () => void;
};

type Props = {
  onPress?: (data: NotificationData) => void;
};

const formatNow = () => {
  try {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'now';
  }
};

const CustomNotification = forwardRef<CustomNotificationRef, Props>(
  ({ onPress }, ref) => {
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
    const [notification, setNotification] = useState<NotificationData | null>(
      null,
    );
    const [shownAt, setShownAt] = useState('now');

    const translateY = useRef(new Animated.Value(-160)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const hide = useCallback(() => {
      clearTimer();
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -160,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setVisible(false);
          setNotification(null);
        }
      });
    }, [opacity, translateY]);

    const show = useCallback(
      (data: NotificationData) => {
        clearTimer();
        setNotification(data);
        setShownAt(formatNow());
        setVisible(true);

        translateY.setValue(-160);
        opacity.setValue(0);

        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            damping: 18,
            stiffness: 190,
            mass: 0.8,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 160,
            useNativeDriver: true,
          }),
        ]).start();

        timerRef.current = setTimeout(hide, AUTO_HIDE_MS);
      },
      [hide, opacity, translateY],
    );

    useImperativeHandle(ref, () => ({ show, hide }), [show, hide]);

    if (!visible || !notification) {
      return null;
    }

    const appName =
      String(notification.name ?? '').trim() || 'Ayurmuni';
    const headings =
      String(
        notification.headings ??
          notification.title ??
          '',
      ).trim() || 'New notification';
    const contents =
      String(
        notification.contents ??
          notification.message ??
          '',
      ).trim() || 'Tap to open';

    const handlePress = () => {
      clearTimer();
      const data = notification;
      hide();
      setTimeout(() => onPress?.(data), 220);
    };

    return (
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.overlay,
          {
            top: Math.max(insets.top, 8) + 8,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
          <Image source={Images.logoRound} style={styles.logo} />

          <View style={styles.textBlock}>
            <View style={styles.topRow}>
              <Text style={styles.appName} numberOfLines={1}>
                {appName}
              </Text>
              <Text style={styles.time}>{shownAt}</Text>
            </View>

            <Text style={styles.headings} numberOfLines={1}>
              {headings}
            </Text>
            <Text style={styles.contents} numberOfLines={2}>
              {contents}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  },
);

export default CustomNotification;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 999999,
    elevation: 999999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E8ECE9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 12,
  },
  cardPressed: {
    opacity: 0.94,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  appName: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  time: {
    marginLeft: 8,
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
  headings: {
    fontSize: 14,
    lineHeight: 18,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  contents: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
});
