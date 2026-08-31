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
  HOME_CATEGORY_GAP,
  HOME_CATEGORY_ROW_HEIGHT,
  HOME_HEADER_BOTTOM_GAP,
  HOME_STICKY_TOP_GAP,
  TAB_BAR_HEIGHT,
} from '../constants/layout';

type ScrollHideContextType = {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  headerContentAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  searchBarAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  categoryAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  headerShellAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  tabBarAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  chromeVisible: SharedValue<number>;
  scrollY: SharedValue<number>;
};

const ScrollHideContext = createContext<ScrollHideContextType | null>(null);

const HIDE_THRESHOLD = 6;
const SHOW_AT_TOP = 20;
const TAB_SLIDE = TAB_BAR_HEIGHT + 12;
const COLLAPSE_DISTANCE = 68;
const springConfig = {
  damping: 24,
  stiffness: 260,
  mass: 0.75,
};

export const ScrollHideProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const insets = useSafeAreaInsets();
  const lastY = useRef(0);
  const visible = useSharedValue(1);
  const scrollY = useSharedValue(0);

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
    maxHeight: interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE],
      [HOME_HEADER_CONTENT_HEIGHT, 0],
      Extrapolation.CLAMP,
    ),
    opacity: interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE * 0.7],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    overflow: 'hidden' as const,
  }));

  /** Search stays visible from first paint so users can find it without scrolling. */
  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: HOME_SEARCH_BAR_HEIGHT,
    opacity: 1,
    marginTop: interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE],
      [HOME_CATEGORY_GAP, HOME_STICKY_TOP_GAP],
      Extrapolation.CLAMP,
    ),
    marginBottom: HOME_HEADER_SEARCH_GAP,
    overflow: 'hidden' as const,
  }));

  const categoryAnimatedStyle = useAnimatedStyle(() => ({}));

  const headerShellAnimatedStyle = useAnimatedStyle(() => {
    const headerH = interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE],
      [HOME_HEADER_CONTENT_HEIGHT, 0],
      Extrapolation.CLAMP,
    );
    const stickyTopGap = interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE],
      [HOME_CATEGORY_GAP, HOME_STICKY_TOP_GAP],
      Extrapolation.CLAMP,
    );

    // Total chrome: safe-area + header + always-visible search + categories
    return {
      height:
        (insets.top || 0) +
        headerH +
        stickyTopGap +
        HOME_SEARCH_BAR_HEIGHT +
        HOME_HEADER_SEARCH_GAP +
        HOME_CATEGORY_ROW_HEIGHT +
        HOME_HEADER_BOTTOM_GAP,
    };
  });

  const tabBarAnimatedStyle = useAnimatedStyle(() => {
    const scrollHide = interpolate(
      scrollY.value,
      [0, 48, 140],
      [0, TAB_SLIDE * 0.42, TAB_SLIDE],
      Extrapolation.CLAMP,
    );
    const directionHide = (1 - visible.value) * TAB_SLIDE;
    const translateY = Math.max(scrollHide, directionHide);

    return {
      transform: [{ translateY }],
      opacity:
        interpolate(
          scrollY.value,
          [0, 48, 140],
          [1, 0.72, 0],
          Extrapolation.CLAMP,
        ) * visible.value,
    };
  });

  return (
    <ScrollHideContext.Provider
      value={{
        onScroll,
        headerContentAnimatedStyle,
        searchBarAnimatedStyle,
        categoryAnimatedStyle,
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
      categoryAnimatedStyle: {},
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
