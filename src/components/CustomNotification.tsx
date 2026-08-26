import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const {width: SCREEN_WIDTH} =
  Dimensions.get('window');

const AUTO_HIDE_TIME = 4000;

export type NotificationData = {
  title?: string;
  message?: string;
  image?: string;

  type?: string;

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

const CustomNotification = forwardRef<
  CustomNotificationRef,
  Props
>(({onPress}, ref) => {
  const [visible, setVisible] =
    useState(false);

  const [expanded, setExpanded] =
    useState(false);

  const [notification, setNotification] =
    useState<NotificationData | null>(null);

  const translateY = useRef(
    new Animated.Value(-180),
  ).current;

  const opacity = useRef(
    new Animated.Value(0),
  ).current;

  const scale = useRef(
    new Animated.Value(0.96),
  ).current;

  const timerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

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
        toValue: -180,
        duration: 240,
        easing: Easing.out(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),

      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(scale, {
        toValue: 0.96,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setExpanded(false);
      setNotification(null);
    });
  }, [
    opacity,
    scale,
    translateY,
  ]);

  const show = useCallback(
    (data: NotificationData) => {
      clearTimer();

      console.log(
        '🔔 Showing custom notification:',
        data,
      );

      setNotification(data);
      setExpanded(false);
      setVisible(true);

      translateY.setValue(-180);
      opacity.setValue(0);
      scale.setValue(0.96);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 180,
          mass: 0.8,
          useNativeDriver: true,
        }),

        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),

        Animated.spring(scale, {
          toValue: 1,
          damping: 18,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]).start();

      // Automatically disappear after 4 seconds
      timerRef.current = setTimeout(() => {
        hide();
      }, AUTO_HIDE_TIME);
    },
    [
      hide,
      opacity,
      scale,
      translateY,
    ],
  );

  useImperativeHandle(
    ref,
    () => ({
      show,
      hide,
    }),
    [show, hide],
  );

  if (!visible || !notification) {
    return null;
  }

  const toggleExpanded = () => {
    clearTimer();

    setExpanded(prev => !prev);

    // Give user enough time to read
    timerRef.current = setTimeout(() => {
      hide();
    }, 7000);
  };

  const handleNotificationPress = () => {
    console.log(
      '🔔 Custom notification pressed',
      notification,
    );

    clearTimer();

    const data = notification;

    hide();

    // Give closing animation time
    setTimeout(() => {
      onPress?.(data);
    }, 250);
  };

  const handleActionPress = () => {
    handleNotificationPress();
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        {
          opacity,
          transform: [
            {
              translateY,
            },
            {
              scale,
            },
          ],
        },
      ]}>

      <View style={styles.shadowWrapper}>
        <View style={styles.card}>

          {/* ========================= */}
          {/* HEADER */}
          {/* ========================= */}

          <View style={styles.header}>

            {/* App Icon */}
            <View style={styles.appIcon}>
              {notification.image ? (
                <Image
                  source={{
                    uri: notification.image,
                  }}
                  style={styles.appIconImage}
                />
              ) : (
                <Text style={styles.appIconText}>
                  A
                </Text>
              )}
            </View>

            {/* App + time */}
            <View style={styles.headerContent}>
              <View style={styles.titleRow}>

                <Text
                  numberOfLines={1}
                  style={styles.appName}>
                  Ayurmuni
                </Text>

                <Text style={styles.time}>
                  now
                </Text>

              </View>

              <Text
                numberOfLines={1}
                style={styles.notificationTitle}>
                {notification.title ||
                  'New Notification'}
              </Text>
            </View>

            {/* Expand Button */}
            <Pressable
              onPress={toggleExpanded}
              hitSlop={12}
              style={styles.expandButton}>

              <Text
                style={[
                  styles.arrow,
                  expanded &&
                    styles.arrowExpanded,
                ]}>
                ⌄
              </Text>

            </Pressable>
          </View>

          {/* ========================= */}
          {/* MESSAGE */}
          {/* ========================= */}

          <Pressable
            onPress={handleNotificationPress}
            style={styles.messageContainer}>

            <Text
              numberOfLines={
                expanded ? undefined : 2
              }
              style={styles.message}>

              {notification.message ||
                'You have a new notification.'}

            </Text>

          </Pressable>

          {/* ========================= */}
          {/* IMAGE */}
          {/* ========================= */}

          {expanded &&
            notification.image && (
              <Pressable
                onPress={
                  handleNotificationPress
                }
                style={styles.imageWrapper}>

                <Image
                  source={{
                    uri: notification.image,
                  }}
                  style={styles.notificationImage}
                  resizeMode="cover"
                />

              </Pressable>
            )}

          {/* ========================= */}
          {/* EXPANDED ACTION */}
          {/* ========================= */}

          {expanded && (
            <View style={styles.footer}>

              <Pressable
                onPress={handleActionPress}
                style={styles.actionButton}>

                <Text
                  style={
                    styles.actionText
                  }>
                  VIEW
                </Text>

              </Pressable>

              <Pressable
                onPress={hide}
                style={styles.closeButton}>

                <Text
                  style={
                    styles.closeText
                  }>
                  Dismiss
                </Text>

              </Pressable>

            </View>
          )}

        </View>
      </View>
    </Animated.View>
  );
});

export default CustomNotification;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',

    top:
      Platform.OS === 'ios'
        ? 52
        : 12,

    left: 10,
    right: 10,

    zIndex: 999999,
    elevation: 999999,
  },

  shadowWrapper: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,

    elevation: 15,
  },

  card: {
    width: SCREEN_WIDTH - 20,

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    overflow: 'hidden',

    borderWidth: 1,
    borderColor: '#E8ECE9',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 13,
    paddingTop: 13,
    paddingBottom: 7,
  },

  appIcon: {
    width: 44,
    height: 44,

    borderRadius: 13,

    backgroundColor: '#2F7D57',

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',
  },

  appIconImage: {
    width: '100%',
    height: '100%',
  },

  appIconText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  headerContent: {
    flex: 1,
    marginLeft: 11,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  appName: {
    flex: 1,

    fontSize: 13,
    fontWeight: '700',

    color: '#66706A',
  },

  time: {
    marginLeft: 7,

    fontSize: 11,

    color: '#9AA19C',
  },

  notificationTitle: {
    marginTop: 2,

    fontSize: 15,
    fontWeight: '700',

    color: '#17211B',
  },

  expandButton: {
    width: 36,
    height: 36,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 18,

    backgroundColor: '#F2F5F3',
  },

  arrow: {
    fontSize: 22,

    color: '#59645D',

    marginTop: -5,
  },

  arrowExpanded: {
    transform: [
      {
        rotate: '180deg',
      },
    ],

    marginTop: 5,
  },

  messageContainer: {
    paddingHorizontal: 13,
    paddingBottom: 13,
  },

  message: {
    fontSize: 13.5,
    lineHeight: 19,

    color: '#59645D',
  },

  imageWrapper: {
    marginHorizontal: 10,
    marginBottom: 10,

    borderRadius: 13,

    overflow: 'hidden',
  },

  notificationImage: {
    width: '100%',
    height: 170,
  },

  footer: {
    flexDirection: 'row',

    alignItems: 'center',

    borderTopWidth: 1,
    borderTopColor: '#EEF1EF',

    paddingHorizontal: 13,
    paddingVertical: 10,
  },

  actionButton: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    height: 38,

    borderRadius: 10,

    backgroundColor: '#2F7D57',
  },

  actionText: {
    color: '#FFFFFF',

    fontSize: 12,
    fontWeight: '800',

    letterSpacing: 0.5,
  },

  closeButton: {
    marginLeft: 8,

    paddingHorizontal: 14,

    height: 38,

    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 12,
    fontWeight: '600',

    color: '#69736D',
  },
});