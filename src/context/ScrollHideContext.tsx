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
const SEARCH_REVEAL_START = 8;

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

  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(
      scrollY.value,
      [SEARCH_REVEAL_START, COLLAPSE_DISTANCE],
      [0, HOME_SEARCH_BAR_HEIGHT],
      Extrapolation.CLAMP,
    ),
    opacity: interpolate(
      scrollY.value,
      [SEARCH_REVEAL_START, COLLAPSE_DISTANCE * 0.85],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    marginTop: interpolate(
      scrollY.value,
      [SEARCH_REVEAL_START, COLLAPSE_DISTANCE],
      [0, HOME_STICKY_TOP_GAP],
      Extrapolation.CLAMP,
    ),
    marginBottom: interpolate(
      scrollY.value,
      [SEARCH_REVEAL_START, COLLAPSE_DISTANCE],
      [0, HOME_HEADER_SEARCH_GAP],
      Extrapolation.CLAMP,
    ),
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
    const searchH = interpolate(
      scrollY.value,
      [SEARCH_REVEAL_START, COLLAPSE_DISTANCE],
      [0, HOME_SEARCH_BAR_HEIGHT],
      Extrapolation.CLAMP,
    );
    const stickyTopGap = interpolate(
      scrollY.value,
      [SEARCH_REVEAL_START, COLLAPSE_DISTANCE],
      [0, HOME_STICKY_TOP_GAP],
      Extrapolation.CLAMP,
    );
    const searchBottomGap = interpolate(
      scrollY.value,
      [SEARCH_REVEAL_START, COLLAPSE_DISTANCE],
      [0, HOME_HEADER_SEARCH_GAP],
      Extrapolation.CLAMP,
    );
    const headerCategoryGap = interpolate(
      scrollY.value,
      [0, SEARCH_REVEAL_START],
      [HOME_CATEGORY_GAP, 0],
      Extrapolation.CLAMP,
    );

    return {
      height:
        (insets.top || 0) +
        stickyTopGap +
        headerH +
        searchH +
        searchBottomGap +
        headerCategoryGap +
        HOME_CATEGORY_ROW_HEIGHT +
        HOME_HEADER_BOTTOM_GAP,
    };
  });

  const tabBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - visible.value) * TAB_SLIDE }],
  }));

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
