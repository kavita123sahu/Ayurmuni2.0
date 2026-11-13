import React, { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
} from 'react-native-reanimated';

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 4;
const DOUBLE_TAP_SCALE = 2.5;
const TIMING = { duration: 220 };

export type ZoomableImageHandle = {
  /** Animate to an absolute scale (clamped to ZOOM_MIN..ZOOM_MAX). */
  zoomTo: (scale: number) => void;
  getScale: () => number;
};

type Props = {
  source: ImageSourcePropType;
  width: number;
  height: number;
  /** Fires when a zoom settles, with the final scale. */
  onScaleChange?: (scale: number) => void;
};

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

const ZoomableImage = forwardRef<ZoomableImageHandle, Props>(
  ({ source, width, height, onScaleChange }, ref) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const savedTx = useSharedValue(0);
    const savedTy = useSharedValue(0);
    // Rendered image height inside the frame (resizeMode contain); used for vertical pan limits.
    const contentH = useSharedValue(height);

    const notify = useCallback(
      (value: number) => onScaleChange?.(value),
      [onScaleChange],
    );

    const settle = useCallback(
      (target: number) => {
        'worklet';
        const s = clamp(target, ZOOM_MIN, ZOOM_MAX);
        const maxX = Math.max(0, (width * s - width) / 2);
        const maxY = Math.max(0, (contentH.value * s - height) / 2);
        scale.value = withTiming(s, TIMING);
        tx.value = withTiming(s === 1 ? 0 : clamp(tx.value, -maxX, maxX), TIMING);
        ty.value = withTiming(s === 1 ? 0 : clamp(ty.value, -maxY, maxY), TIMING);
        savedScale.value = s;
        runOnJS(notify)(s);
      },
      [width, height, contentH, scale, tx, ty, savedScale, notify],
    );

    useImperativeHandle(
      ref,
      () => ({
        zoomTo: (target: number) => {
          const s = clamp(target, ZOOM_MIN, ZOOM_MAX);
          const maxX = Math.max(0, (width * s - width) / 2);
          const maxY = Math.max(0, (contentH.value * s - height) / 2);
          scale.value = withTiming(s, TIMING);
          tx.value = withTiming(s === 1 ? 0 : clamp(tx.value, -maxX, maxX), TIMING);
          ty.value = withTiming(s === 1 ? 0 : clamp(ty.value, -maxY, maxY), TIMING);
          savedScale.value = s;
          notify(s);
        },
        getScale: () => savedScale.value,
      }),
      [width, height, contentH, scale, tx, ty, savedScale, notify],
    );

    const gesture = useMemo(() => {
      const pinch = Gesture.Pinch()
        .onStart(() => {
          savedScale.value = scale.value;
        })
        .onUpdate(e => {
          // Slight rubber-band past the limits; settle() snaps back.
          scale.value = clamp(savedScale.value * e.scale, ZOOM_MIN * 0.85, ZOOM_MAX * 1.15);
        })
        .onEnd(() => {
          settle(scale.value);
        });

      // Pan only claims the touch when zoomed, so the pager can swipe at 1x.
      const pan = Gesture.Pan()
        .averageTouches(true)
        .manualActivation(true)
        .onTouchesMove((_e, state) => {
          if (savedScale.value > 1.01) state.activate();
          else state.fail();
        })
        .onStart(() => {
          savedTx.value = tx.value;
          savedTy.value = ty.value;
        })
        .onUpdate(e => {
          const maxX = Math.max(0, (width * scale.value - width) / 2);
          const maxY = Math.max(0, (contentH.value * scale.value - height) / 2);
          tx.value = clamp(savedTx.value + e.translationX, -maxX, maxX);
          ty.value = clamp(savedTy.value + e.translationY, -maxY, maxY);
        })
        .onEnd(e => {
          const maxX = Math.max(0, (width * scale.value - width) / 2);
          const maxY = Math.max(0, (contentH.value * scale.value - height) / 2);
          tx.value = withDecay({ velocity: e.velocityX, clamp: [-maxX, maxX] });
          ty.value = withDecay({ velocity: e.velocityY, clamp: [-maxY, maxY] });
        });

      const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onEnd(() => {
          settle(savedScale.value > 1.01 ? 1 : DOUBLE_TAP_SCALE);
        });

      return Gesture.Simultaneous(pinch, pan, doubleTap);
    }, [width, height, contentH, scale, savedScale, tx, ty, savedTx, savedTy, settle]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: tx.value },
        { translateY: ty.value },
        { scale: scale.value },
      ],
    }));

    return (
      <View style={[styles.frame, { width, height }]}>
        {/* Sits behind the image, so cached images never flash a spinner. */}
        <ActivityIndicator style={styles.loader} color="rgba(255,255,255,0.6)" />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[{ width, height }, animatedStyle]}>
            <Image
              source={source}
              style={{ width, height }}
              resizeMode="contain"
              fadeDuration={0}
              onLoad={e => {
                const { width: w, height: h } = e.nativeEvent.source ?? {};
                if (w && h) contentH.value = Math.min(height, (width * h) / w);
              }}
            />
          </Animated.View>
        </GestureDetector>
      </View>
    );
  },
);

ZoomableImage.displayName = 'ZoomableImage';

export default React.memo(ZoomableImage);

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    position: 'absolute',
  },
});
