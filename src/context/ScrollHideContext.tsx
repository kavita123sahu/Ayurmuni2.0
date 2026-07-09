import React, { createContext, useCallback, useContext, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  SharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HOME_HEADER_CONTENT_HEIGHT,
  HOME_SEARCH_BAR_HEIGHT,
  HOME_HEADER_SEARCH_GAP,
  TAB_BAR_HEIGHT,
} from '../constants/layout';

type ScrollHideContextType = {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  headerContentAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  searchBarAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  headerShellAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  tabBarAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  chromeVisible: SharedValue<number>;
  scrollY: SharedValue<number>;
};

const ScrollHideContext = createContext<ScrollHideContextType | null>(null);

const HIDE_THRESHOLD = 6;
const SHOW_AT_TOP = 24;
const TAB_SLIDE = TAB_BAR_HEIGHT + 12;
const COLLAPSE_DISTANCE = 80;

const springConfig = {
  damping: 22,
  stiffness: 240,
  mass: 0.8,
};

export const ScrollHideProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const insets = useSafeAreaInsets();
  const lastY = useRef(0);
  const visible = useSharedValue(1);
  const scrollY = useSharedValue(0);

  const expandedHeaderHeight =
    HOME_HEADER_CONTENT_HEIGHT +
    HOME_SEARCH_BAR_HEIGHT +
    HOME_HEADER_SEARCH_GAP;
  const collapsedHeaderHeight =
    HOME_SEARCH_BAR_HEIGHT + HOME_HEADER_SEARCH_GAP;

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      scrollY.value = y;
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
    [visible, scrollY],
  );

  const headerContentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE * 0.45, COLLAPSE_DISTANCE],
      [1, 0.4, 0],
      Extrapolation.CLAMP,
    ),
    maxHeight: interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE],
      [HOME_HEADER_CONTENT_HEIGHT, 0],
      Extrapolation.CLAMP,
    ),
    overflow: 'hidden' as const,
  }));

  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1,
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          [0, COLLAPSE_DISTANCE],
          [1, 0.97],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const headerShellAnimatedStyle = useAnimatedStyle(() => ({
    height:
      (insets.top || 0) +
      interpolate(
        scrollY.value,
        [0, COLLAPSE_DISTANCE],
        [expandedHeaderHeight, collapsedHeaderHeight],
        Extrapolation.CLAMP,
      ),
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
        searchBarAnimatedStyle,
        headerShellAnimatedStyle,
        tabBarAnimatedStyle,
        chromeVisible: visible,
        scrollY,
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
      searchBarAnimatedStyle: {},
      headerShellAnimatedStyle: {},
      tabBarAnimatedStyle: {},
      headerAnimatedStyle: {},
      chromeVisible: null,
      scrollY: null,
    };
  }
  return {
    ...ctx,
    headerAnimatedStyle: ctx.headerContentAnimatedStyle,
  };
};

export default ScrollHideContext;
