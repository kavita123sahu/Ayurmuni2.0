import { Dimensions, PixelRatio } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** Fixed typography — same px on every device (no font scaling). */
export const TYPO = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 20,
  subtitle: 13,
  body: 14,
  caption: 11,
  tab: 12,
  button: 14,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  card: 16,
  pill: 24,
} as const;

export const BUTTON = {
  height: 48,
  heightSm: 44,
  radius: 14,
} as const;

/** Banner slides keep the same aspect ratio on all screen widths. */
export const BANNER = {
  aspectRatio: 2.35,
  getHeight: (width: number) =>
    PixelRatio.roundToNearestPixel(width / BANNER.aspectRatio),
};

export const SCREEN = {
  width: SCREEN_W,
  height: SCREEN_H,
};

/** Horizontal padding — 16 on narrow phones, 20 otherwise. */
export const getScreenPaddingH = () => (SCREEN_W < 360 ? 16 : 20);

/** Content width inside standard horizontal padding. */
export const getContentWidth = (paddingH = getScreenPaddingH()) =>
  SCREEN_W - paddingH * 2;

/** Sticky footer offset above safe area. */
export const getStickyBottom = (insets: EdgeInsets, offset = 16) =>
  (insets.bottom || 0) + offset;

/** List bottom padding when a sticky CTA sits above the tab bar / home indicator. */
export const getListBottomPadding = (insets: EdgeInsets, ctaHeight = BUTTON.height) =>
  getStickyBottom(insets, 16) + ctaHeight + SPACING.lg;

/** Fixed diet-tracking layout — same px on every device. */
export const DIET_UI = {
  mealCardHeight: 100,
  mealImageWidth: 92,
  mealImageHeight: 100,
  vitalityCircle: 112,
  vitalityCircleBorder: 8,
  hydrationIcon: 40,
  hydrationAction: 38,
  mealDetailHeroHeight: 200,
  detailHeroHeight: 200,
  detailCardOverlap: 20,
} as const;
