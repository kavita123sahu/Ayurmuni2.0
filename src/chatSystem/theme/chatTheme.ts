/**
 * ============================================================================
 * THEME ADAPTER  ⚠️  INTEGRATION POINT — REQUIRED BEFORE THIS COMPILES CLEANLY
 * ============================================================================
 * Every chat component imports ONLY from this file, never from a hardcoded
 * color/spacing value. To make the chat UI match your app pixel-for-pixel,
 * replace the right-hand side of each constant below with the equivalent
 * token from your existing theme/design-system file.
 *
 * Example, if your app has `theme/colors.ts` + `theme/typography.ts`:
 *
 *   import { colors } from '../../../theme/colors';
 *   import { typography } from '../../../theme/typography';
 *   import { spacing } from '../../../theme/spacing';
 *
 *   export const chatColors = {
 *     background: colors.background,
 *     bubbleOutgoing: colors.primary,
 *     bubbleIncoming: colors.surface,
 *     ...
 *   };
 *
 * Nothing below is meant to be final — it's a placeholder mapping so the
 * module is runnable out of the box. Swap every value for your real tokens.
 * ============================================================================
 */

export const chatColors = {
  background: '#F5F6FA',
  bubbleOutgoing: '#4F46E5', // patient bubble — map to your primary brand color
  bubbleIncoming: '#FFFFFF', // doctor bubble
  textOnOutgoing: '#FFFFFF',
  textOnIncoming: '#1F2333',
  textSecondary: '#8A8FA3',
  border: '#E7E8F0',
  danger: '#E5484D',
  success: '#22C55E',
  warning: '#F5A524',
  inputBackground: '#FFFFFF',
  dateChipBackground: '#E7E8F0',
  dateChipText: '#6B7080',
  skeletonBase: '#E7E8F0',
  skeletonHighlight: '#F2F3F8',
  connectionBannerBg: '#FEF3C7',
  connectionBannerText: '#92400E',
};

export const chatTypography = {
  messageText: { fontSize: 15, fontFamily: undefined as string | undefined, lineHeight: 21 },
  timeText: { fontSize: 11, fontFamily: undefined as string | undefined },
  dateChip: { fontSize: 12, fontFamily: undefined as string | undefined },
  senderName: { fontSize: 12, fontFamily: undefined as string | undefined },
  emptyTitle: { fontSize: 17, fontFamily: undefined as string | undefined },
  emptySubtitle: { fontSize: 14, fontFamily: undefined as string | undefined },
};

export const chatSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  bubbleRadius: 16,
  bubbleRadiusTail: 4,
  avatarSize: 32,
};
