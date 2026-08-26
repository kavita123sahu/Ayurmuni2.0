import { Colors } from '../common/Colors';

/** Shared screen chrome: white header + status bar, grey-green body */
export const SCREEN_THEME = {
  statusBarBackground: Colors.headerBackground,
  statusBarStyle: 'dark-content' as const,
  screenBackground: Colors.background,
  headerBackground: Colors.headerBackground,
} as const;
