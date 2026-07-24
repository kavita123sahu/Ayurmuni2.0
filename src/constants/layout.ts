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

export const HOME_HEADER_CONTENT_HEIGHT = 64;
export const HOME_SEARCH_BAR_HEIGHT = 40;
/** Gap below status bar when search sticks on scroll */
export const HOME_STICKY_TOP_GAP = 8;
/** Gap between search bar and category row */
export const HOME_HEADER_SEARCH_GAP = HOME_SECTION_GAP;
export const HOME_CATEGORY_GAP = HOME_SECTION_GAP;
/** Blinkit-style category row (tile + label) */
export const HOME_CATEGORY_ROW_HEIGHT = 82;
export const HOME_HEADER_BOTTOM_GAP = 0;

const homeStickyChromeHeight =
  HOME_STICKY_TOP_GAP +
  HOME_SEARCH_BAR_HEIGHT +
  HOME_HEADER_SEARCH_GAP +
  HOME_CATEGORY_ROW_HEIGHT +
  HOME_HEADER_BOTTOM_GAP;

export const getHomeHeaderTotalHeight = (insets: EdgeInsets) =>
  HOME_HEADER_CONTENT_HEIGHT +
  HOME_CATEGORY_GAP +
  HOME_CATEGORY_ROW_HEIGHT +
  (insets.top || 0);

/** Collapsed: search + categories pinned */
export const getHomeHeaderCollapsedHeight = (insets: EdgeInsets) =>
  homeStickyChromeHeight + (insets.top || 0);

export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_SIDE_GAP = 12;
export const TAB_BAR_BOTTOM_OFFSET = 10;

export const getTabBarTotalHeight = (insets: EdgeInsets) =>
  TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_OFFSET + (insets.bottom || 0) + 8;

export const getScreenBottomPadding = (insets: EdgeInsets) =>
  getTabBarTotalHeight(insets) + 12;

export const getDetailBottomPadding = (insets: EdgeInsets) =>
  (insets.bottom || 0) + 24;

export const getScreenPaddingH = () =>
  SCREEN_W < 360 ? 16 : SCREEN_PADDING_H;
