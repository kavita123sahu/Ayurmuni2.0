import type { EdgeInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const SCREEN = { width: SCREEN_W, height: SCREEN_H };

export const SCREEN_PADDING_H = 20;
export const SECTION_GAP = 18;
export const HOME_SECTION_GAP = 16;
export const HOME_SECTION_HEADER_MB = 10;

export const CARD_PADDING = 14;
export const CARD_RADIUS = 16;

/** Profile row (~50 ring) + equal vertical padding (8+8) */
export const HOME_HEADER_CONTENT_HEIGHT = 66;
export const HOME_SEARCH_BAR_HEIGHT = 44;
/** Gap below status bar when search sticks on scroll */
export const HOME_STICKY_TOP_GAP = 8;
/** Gap between search bar and category row */
export const HOME_HEADER_SEARCH_GAP = 8;
/** Equal gap under header row / above categories */
export const HOME_CATEGORY_GAP = 8;
/** Blinkit-style category row (icon + label) */
export const HOME_CATEGORY_ROW_HEIGHT = 58;
/** Equal bottom padding under category row in header chrome */
export const HOME_HEADER_BOTTOM_GAP = 8;

const homeStickyChromeHeight =
  HOME_STICKY_TOP_GAP +
  HOME_SEARCH_BAR_HEIGHT +
  HOME_HEADER_SEARCH_GAP +
  HOME_CATEGORY_ROW_HEIGHT +
  HOME_HEADER_BOTTOM_GAP;

export const getHomeHeaderTotalHeight = (insets: EdgeInsets) =>
  (insets.top || 0) +
  HOME_HEADER_CONTENT_HEIGHT +
  HOME_CATEGORY_GAP +
  HOME_SEARCH_BAR_HEIGHT +
  HOME_HEADER_SEARCH_GAP +
  HOME_CATEGORY_ROW_HEIGHT +
  HOME_HEADER_BOTTOM_GAP;

/** Collapsed: search + categories pinned */
export const getHomeHeaderCollapsedHeight = (insets: EdgeInsets) =>
  homeStickyChromeHeight + (insets.top || 0);

export const TAB_BAR_HEIGHT = 62;
export const TAB_CART_FAB_SIZE = 58;
export const TAB_CONSULT_FAB_SIZE = 56;
/** How far the center cart FAB sticks above the pill bar */
export const TAB_FAB_OVERHANG = 14;
export const TAB_BAR_SIDE_GAP = 12;
export const TAB_BAR_BOTTOM_OFFSET = 8;

/**
 * Exact clearance for tab chrome (bar + small FAB overhang + safe inset).
 * Use as contentContainerStyle.paddingBottom only — not list marginBottom
 * (margin creates a visible empty "patti" strip).
 */
export const getTabBarTotalHeight = (insets: EdgeInsets) => {
  const bottomPad = Math.max(insets.bottom || 0, 8) + TAB_BAR_BOTTOM_OFFSET;
  return TAB_BAR_HEIGHT + TAB_FAB_OVERHANG + bottomPad;
};

export const getScreenBottomPadding = (insets: EdgeInsets) =>
  getTabBarTotalHeight(insets);

export const getDetailBottomPadding = (insets: EdgeInsets) =>
  (insets.bottom || 0) + 24;

export const getScreenPaddingH = () =>
  SCREEN_W < 360 ? 16 : SCREEN_PADDING_H;

/** Break out of screen padding so horizontal lists scroll edge-to-edge. */
export const getHorizontalScrollBleedStyle = () => ({
  marginHorizontal: -getScreenPaddingH(),
  width: SCREEN.width,
});

/** Standard horizontal list insets — flush left, breathing room on the right. */
export const HORIZONTAL_SCROLL_CONTENT = {
  paddingLeft: 0,
  paddingRight: SCREEN_PADDING_H,
} as const;
