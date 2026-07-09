import React, { createContext, useCallback, useContext, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';
import {
  HOME_HEADER_CONTENT_HEIGHT,
  TAB_BAR_HEIGHT,
} from '../constants/layout';

type ScrollHideContextType = {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  headerContentAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  tabBarAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  chromeVisible: SharedValue<number>;
};

const ScrollHideContext = createContext<ScrollHideContextType | null>(null);

const HIDE_THRESHOLD = 6;
const SHOW_AT_TOP = 24;
const HEADER_SLIDE = HOME_HEADER_CONTENT_HEIGHT + 4;
const TAB_SLIDE = TAB_BAR_HEIGHT + 12;

const springConfig = {
  damping: 22,
  stiffness: 240,
  mass: 0.8,
};

export const ScrollHideProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const lastY = useRef(0);
  const visible = useSharedValue(1);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const diff = y - lastY.current;

      if (y <= SHOW_AT_TOP) {
        visible.value = withSpring(1, springConfig);
      } else if (diff > HIDE_THRESHOLD) {
        visible.value = withSpring(0, springConfig);
      } else if (diff < -HIDE_THRESHOLD) {
        visible.value = withSpring(1, springConfig);
      }

      lastY.current = y;
    },
    [visible],
  );

  const headerContentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -(1 - visible.value) * HEADER_SLIDE }],
    opacity: 0.35 + visible.value * 0.65,
  }));

  const tabBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - visible.value) * TAB_SLIDE }],
    opacity: 0.4 + visible.value * 0.6,
  }));

  return (
    <ScrollHideContext.Provider
      value={{
        onScroll,
        headerContentAnimatedStyle,
        tabBarAnimatedStyle,
        chromeVisible: visible,
      }}
    >
      {children}
    </ScrollHideContext.Provider>
  );
};

export const useScrollHide = () => {
  const ctx = useContext(ScrollHideContext);
  if (!ctx) {
    return {
      onScroll: () => {},
      headerContentAnimatedStyle: {},
      tabBarAnimatedStyle: {},
      headerAnimatedStyle: {},
      chromeVisible: null,
    };
  }
  return {
    ...ctx,
    headerAnimatedStyle: ctx.headerContentAnimatedStyle,
  };
};

export default ScrollHideContext;
