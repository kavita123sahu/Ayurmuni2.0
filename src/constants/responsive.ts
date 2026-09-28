import { Dimensions, PixelRatio } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

/** Design baseline — iPhone 11 / common mid-size phone */
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const getWindow = () => {
  const win = Dimensions.get('window');
  return {
    width: win?.width > 0 ? win.width : BASE_WIDTH,
    height: win?.height > 0 ? win.height : BASE_HEIGHT,
  };
};

/**
 * Horizontal scale from design width (375).
 * Tightly clamped so every device matches the design phone look.
 */
export const scale = (size: number): number => {
  const n = Number(size);
  if (!Number.isFinite(n)) return 0;
  const { width } = getWindow();
  const next = (width / BASE_WIDTH) * n;
  const clamped = Math.min(Math.max(next, n * 0.95), n * 1.05);
  return PixelRatio.roundToNearestPixel(
    Number.isFinite(clamped) ? clamped : n,
  );
};

/** Vertical scale from design height (812). */
export const verticalScale = (size: number): number => {
  const n = Number(size);
  if (!Number.isFinite(n)) return 0;
  const { height } = getWindow();
  const next = (height / BASE_HEIGHT) * n;
  const clamped = Math.min(Math.max(next, n * 0.95), n * 1.05);
  return PixelRatio.roundToNearestPixel(
    Number.isFinite(clamped) ? clamped : n,
  );
};

/**
 * Moderate scale — preferred for fonts / radii / paddings so UI
 * looks the same across resolutions without extreme jumps.
 */
export const moderateScale = (size: number, factor = 0.3): number => {
  const n = Number(size);
  if (!Number.isFinite(n)) return 0;
  const scaled = scale(n);
  const next = n + (scaled - n) * factor;
  return PixelRatio.roundToNearestPixel(
    Number.isFinite(next) ? next : n,
  );
};

/** Alias used across Medical History / assessment screens. */
export const ms = moderateScale;

/**
 * Fixed design tokens (stable px) — same look on every device.
 * Use scale()/moderateScale() only when a specific view needs proportional sizing.
 * Do NOT bake scale into these constants: StyleSheet is created once at import
 * and NaN/zero window sizes on some launches caused layout crashes.
 */
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
  sm: 10,
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
  getHeight: (width: number) => {
    const w = width > 0 ? width : BASE_WIDTH;
    return PixelRatio.roundToNearestPixel(w / BANNER.aspectRatio);
  },
};

export const SCREEN = {
  get width() {
    return getWindow().width;
  },
  get height() {
    return getWindow().height;
  },
};

/** Horizontal padding — 16 on narrow phones, 20 otherwise. */
export const getScreenPaddingH = (width = getWindow().width) =>
  width < 360 ? 16 : 20;

/** Content width inside standard horizontal padding. */
export const getContentWidth = (
  paddingH = getScreenPaddingH(),
  width = getWindow().width,
) => width - paddingH * 2;

/** Sticky footer offset above safe area. */
export const getStickyBottom = (insets: EdgeInsets, offset = 16) =>
  (insets.bottom || 0) + offset;

/** List bottom padding when a sticky CTA sits above the tab bar / home indicator. */
export const getListBottomPadding = (
  insets: EdgeInsets,
  ctaHeight = BUTTON.height,
) => getStickyBottom(insets, 16) + ctaHeight + SPACING.lg;

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
