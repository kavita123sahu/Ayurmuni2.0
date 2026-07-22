import type { EdgeInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const SCREEN = { width: SCREEN_W, height: SCREEN_H };

/** Horizontal screen padding used across tab & stack screens */
export const SCREEN_PADDING_H = 20;

/** Standard vertical gap between sections */
export const SECTION_GAP = 18;

/** Home screen: gap between major blocks (categories, banner, doctors, etc.) */
export const HOME_SECTION_GAP = 20;

/** Home screen: space below section titles before list content */
export const HOME_SECTION_HEADER_MB = 12;

/** Inner card padding */
export const CARD_PADDING = 14;

/** Standard border radius for cards */
export const CARD_RADIUS = 16;

export const HOME_HEADER_CONTENT_HEIGHT = 64;
export const HOME_SEARCH_BAR_HEIGHT = 52;
export const HOME_HEADER_SEARCH_GAP = 6;
export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_SIDE_GAP = 12;
export const TAB_BAR_BOTTOM_OFFSET = 10;

export const getHomeHeaderTotalHeight = (insets: EdgeInsets) =>
  HOME_HEADER_CONTENT_HEIGHT +
  HOME_SEARCH_BAR_HEIGHT +
  HOME_HEADER_SEARCH_GAP +
  (insets.top || 0);

export const getTabBarTotalHeight = (insets: EdgeInsets) =>
  TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_OFFSET + (insets.bottom || 0) + 8;

/** Bottom padding for tab-root screens (Home, Products, Profile, Medicine) */
export const getScreenBottomPadding = (insets: EdgeInsets) =>
  getTabBarTotalHeight(insets) + 12;

/** Bottom padding for full-screen stack detail pages (no tab bar) */
export const getDetailBottomPadding = (insets: EdgeInsets) =>
  (insets.bottom || 0) + 24;

/** Responsive horizontal padding — slightly tighter on small phones */
export const getScreenPaddingH = () =>
  SCREEN_W < 360 ? 16 : SCREEN_PADDING_H;
