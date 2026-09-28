import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  AppStateStatus,
  Easing,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';

type Props = {
  children: React.ReactNode;
  /** Pixels per second — keep modest to avoid jank. */
  speed?: number;
  /** Gap between the duplicated tracks for a seamless loop. */
  gap?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Pause when app is backgrounded (saves CPU). */
  pauseInBackground?: boolean;
};

/**
 * Lightweight infinite horizontal marquee.
 * Native-driver only; measures once; duplicates the track for a seamless loop.
 */
const InfiniteMarquee = ({
  children,
  speed = 34,
  gap = 28,
  style,
  contentContainerStyle,
  pauseInBackground = true,
}: Props) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const appState = useRef(AppState.currentState);

  const stop = useCallback(() => {
    animRef.current?.stop();
    animRef.current = null;
  }, []);

  const start = useCallback(
    (width: number) => {
      if (width <= 0) return;
      stop();
      translateX.setValue(0);
      const duration = Math.max(8000, (width / Math.max(speed, 1)) * 1000);
      const anim = Animated.loop(
        Animated.timing(translateX, {
          toValue: -(width + gap),
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
          isInteraction: false,
        }),
      );
      animRef.current = anim;
      anim.start();
    },
    [gap, speed, stop, translateX],
  );

  useEffect(() => {
    if (trackWidth > 0) start(trackWidth);
    return stop;
  }, [trackWidth, start, stop]);

  useEffect(() => {
    if (!pauseInBackground) return undefined;
    const onChange = (next: AppStateStatus) => {
      const prev = appState.current;
      appState.current = next;
      if (prev.match(/active/) && next.match(/inactive|background/)) {
        stop();
      } else if (prev.match(/inactive|background/) && next === 'active') {
        start(trackWidth);
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [pauseInBackground, start, stop, trackWidth]);

  return (
    <View style={[styles.clip, style]} collapsable={false}>
      <Animated.View style={[styles.row, { transform: [{ translateX }] }]}>
        <View
          style={[styles.track, contentContainerStyle, { marginRight: gap }]}
          onLayout={e => {
            const w = Math.ceil(e.nativeEvent.layout.width);
            if (w > 0 && Math.abs(w - trackWidth) > 2) {
              setTrackWidth(w);
            }
          }}
        >
          {children}
        </View>
        <View
          style={[styles.track, contentContainerStyle]}
          pointerEvents="box-none"
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

export default memo(InfiniteMarquee);

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
});
