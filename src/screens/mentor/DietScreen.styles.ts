import { StyleSheet } from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { BUTTON, DIET_UI, RADIUS, SPACING, TYPO } from '../../constants/responsive';

export const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#FDFDFB' },

  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    paddingBottom: 40,
    paddingTop: SPACING.sm,
    gap: SPACING.md,
  },

  searchWrap: {
    marginTop: 2,
    marginBottom: 6,
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
    paddingVertical: 0,
  },
  statusTabRow: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F6',
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  statusTab: {
    flex: 1,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTabSelected: {
    backgroundColor: '#FFFFFF',
  },
  statusTabText: {
    fontSize: TYPO.subtitle,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  statusTabTextSelected: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  prakritiRow: {
    gap: 6,
    paddingRight: 4,
    alignItems: 'center',
  },
  prakritiChip: {
    height: 30,
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
  },
  prakritiChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: Colors.primaryColor,
  },
  prakritiChipText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  prakritiChipTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 130,
  },
  filterChipText: {
    maxWidth: 96,
  },
  clearFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  clearFilterChipText: {
    fontSize: 11,
    color: '#B45309',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  filterModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  filterModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '58%',
    paddingBottom: 12,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterModalTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  filterModalList: {
    paddingHorizontal: 8,
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d3eee2',
    marginVertical: 2,
  },
  filterOptionRowActive: {
    backgroundColor: '#ECFDF5',
  },
  filterOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
    paddingRight: 10,
  },
  filterOptionTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  filterEmptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },

  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8EEF2',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    minHeight: 22,
  },

  planPopularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },

  planPopularText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#EA580C',
  },

  planCardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },

  planCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF2F6',
  },

  planFooterMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    minWidth: 0,
  },

  planFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  planFooterText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },

  planFooterRatingText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#B45309',
  },

  planCardFree: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8EEF2',
  },

  planCardPaid: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8EEF2',
  },

  planThumbWrap: {
    position: 'relative',
    flexShrink: 0,
  },

  planThumb: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.cardBackground,
  },

  planPremiumBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  planPremiumBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#5E4200',
    letterSpacing: 0.4,
  },

  planBody: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },

  planTitle: {
    fontSize: TYPO.md,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },

  planSubtitle: {
    fontSize: TYPO.sm,
    lineHeight: 17,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginTop: 3,
  },

  planStatusSlot: {
    flexShrink: 0,
    marginLeft: SPACING.sm,
  },

  planPrakritiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.sm - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginTop: SPACING.xs + 2,
  },

  planPrakritiBadgeText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#047857',
    textTransform: 'capitalize',
  },

  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryColor,
  },

  activePillText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },

  listFooter: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  listFooterText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  listEndText: {
    textAlign: 'center',
    paddingVertical: 14,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  completedPill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  completedPillText: {
    fontSize: 10,
    color: '#4338CA',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  stoppedPill: {
    backgroundColor: '#FEF2F2',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stoppedPillText: {
    fontSize: 10,
    color: '#B91C1C',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  notStartedPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  notStartedPillText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  congratsCard: {
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
  },
  congratsEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  congratsTitle: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#065F46',
    marginBottom: 6,
  },
  congratsSub: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#047857',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 20,
  },
  completeRunMeta: {
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: '#D1FAE5',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completeRunMetaText: {
    fontSize: 12,
    color: '#065F46',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  completeTrackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1FAE5',
  },
  completeTrackKey: {
    flex: 1,
    fontSize: 12,
    color: '#047857',
    fontFamily: Fonts.PoppinsMedium,
  },
  completeTrackVal: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    textAlign: 'right',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  completeBanner: {
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
  },
  completeBannerEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  completeBannerTitle: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#92400E',
    marginBottom: 4,
    textAlign: 'center',
  },
  completeBannerSub: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#B45309',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  completeModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  completeModalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completeModalHeader: {
    paddingTop: 22,
    paddingBottom: 10,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  completeModalEmoji: {
    fontSize: 34,
    marginBottom: 6,
  },
  completeModalTitle: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 6,
  },
  completeModalSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#0F766E',
    textAlign: 'center',
    lineHeight: 18,
  },
  completeModalBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  completeTrackingBlock: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 14,
  },
  completeTrackingTitle: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#065F46',
    marginBottom: 10,
  },
  completeEmptyText: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: 18,
  },
  completeKvRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  completeKvLabel: {
    width: 150,
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: '#0F172A',
    opacity: 0.85,
  },
  completeKvValue: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#0F172A',
    opacity: 0.75,
  },
  completeModalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  completeModalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeModalBtnGhost: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completeModalBtnGhostText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    color: '#334155',
  },
  completeModalBtnPrimary: {
    backgroundColor: Colors.primaryColor,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
  },
  completeModalBtnPrimaryText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    color: '#FFFFFF',
  },
  resumePill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resumePillText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#4338CA',
  },
  pausedPill: {
    backgroundColor: '#FFF4E5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  pausedPillText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#B45309',
  },

  planMeta: {
    fontSize: TYPO.sm,
    lineHeight: 17,
    fontFamily: Fonts.PoppinsRegular,
    color: '#6B7C76',
    marginTop: SPACING.xs,
  },

  doctorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 4,
    marginBottom: 2,
    maxWidth: '100%',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  doctorBadgeText: {
    flexShrink: 1,
    fontSize: 11,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  doctorSuggestCard: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  doctorSuggestIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  doctorSuggestCopy: {
    flex: 1,
    minWidth: 0,
  },

  doctorSuggestLabel: {
    fontSize: 9,
    color: '#0F766E',
    fontFamily: Fonts.PoppinsMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  doctorSuggestName: {
    fontSize: 12,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  prakritiThumbBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    maxWidth: '90%',
    backgroundColor: 'rgba(13, 97, 78, 0.92)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  prakritiThumbBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  prakritiTag: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },

  prakritiTagText: {
    color: '#047857',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  viewAllBanner: {
    marginHorizontal: 5,
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  viewAllBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  viewAllBannerText: {
    flexShrink: 1,
    fontSize: 13,
    color: '#0F766E',
    fontFamily: Fonts.PoppinsMedium,
  },

  viewAllBannerAction: {
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  planTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
    marginTop: SPACING.sm,
  },

  tag: {
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.sm - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },

  tagText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsMedium,
    color: '#475569',
    textTransform: 'capitalize',
  },

  freeTag: {
    backgroundColor: '#E6F4F0',
  },

  freeTagText: {
    color: Colors.primaryColor,
  },

  paidTag: {
    backgroundColor: '#F8EBC4',
  },

  paidTagText: {
    color: '#8B6914',
  },

  planChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    marginLeft: SPACING.sm,
    flexShrink: 0,
  },

  planChevronFree: {
    backgroundColor: '#F1F5F9',
  },

  planChevronPaid: {
    backgroundColor: '#F1F5F9',
  },

  detailScrollContent: {
    paddingTop: 4,
    paddingBottom: 32,
  },

  detailHeroWrap: {
    width: '100%',
    height: DIET_UI.detailHeroHeight,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
  },

  detailImage: {
    width: '100%',
    height: DIET_UI.detailHeroHeight,
    borderRadius: RADIUS.lg,
    backgroundColor: Colors.cardBackground,
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md + 2,
    paddingBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8EEF2',
    marginTop: -DIET_UI.detailCardOverlap,
    width: '100%',
    alignSelf: 'center',
    zIndex: 2,
    elevation: 3,
  },

  detailSection: {
    marginTop: SPACING.md,
    gap: SPACING.md,
    width: '100%',
  },

  continueTrackingBtn: {
    marginTop: SPACING.md,
    height: BUTTON.height,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },

  continueTrackingText: {
    fontSize: TYPO.button,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  detailTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm + 2,
  },

  detailTag: {
    backgroundColor: '#E6F2F2',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
  },

  detailTagText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    textTransform: 'capitalize',
  },

  detailPriceTag: {
    backgroundColor: '#F1F5F9',
  },

  detailPriceText: {
    color: '#475569',
  },

  detailTitle: {
    fontSize: TYPO.xxl,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: SPACING.xs + 2,
    lineHeight: 26,
  },

  detailRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: 10,
  },

  detailRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
  },

  detailRatingValue: {
    fontSize: TYPO.md,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#B45309',
  },

  detailFocus: {
    fontSize: TYPO.subtitle,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginBottom: SPACING.md,
    textTransform: 'capitalize',
  },

  activeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primaryColor,
  },

  activeBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },

  switchLink: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    textDecorationLine: 'underline',
  },

  dayChipRow: {
    gap: 8,
    paddingRight: 4,
    paddingBottom: 2,
  },

  dayChip: {
    width: 76,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EDE9',
    shadowColor: '#0E4B3A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  dayChipSelected: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
    shadowOpacity: 0.16,
  },

  dayChipToday: {
    borderColor: '#9DD4C4',
    backgroundColor: '#F1FAF6',
  },

  dayChipLocked: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    opacity: 0.6,
  },

  dayChipLabelLocked: {
    color: '#94A3B8',
  },

  dayChipMetaLocked: {
    color: '#CBD5E1',
  },

  dayChipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    minHeight: 18,
  },

  dayChipLabel: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#16352C',
    flexShrink: 1,
  },

  dayChipLabelSelected: {
    color: '#FFFFFF',
  },

  dayChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4A84B',
  },

  dayChipTodayPill: {
    backgroundColor: '#D4A84B',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },

  dayChipTodayPillOn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  dayChipTodayText: {
    fontSize: 8,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1A2E28',
  },

  dayChipTodayTextOn: {
    color: '#FFFFFF',
  },

  dayChipMeta: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
    color: '#6B7C76',
    marginTop: 3,
  },

  dayChipMetaSelected: {
    color: 'rgba(255,255,255,0.88)',
  },

  dayChipTrack: {
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(14,75,58,0.1)',
    overflow: 'hidden',
    marginTop: 7,
  },

  dayChipFill: {
    height: 3,
    borderRadius: 3,
  },

  daySection: {
    marginBottom: 18,
  },

  daySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  daySectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },

  daySectionMeta: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.primaryColor,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  detailLabel: {
    fontSize: TYPO.subtitle,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
    flexShrink: 0,
  },

  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: TYPO.subtitle,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    textTransform: 'capitalize',
  },

  startBtn: {
    marginTop: SPACING.lg,
    height: BUTTON.height,
    backgroundColor: Colors.primaryColor,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startBtnText: {
    color: '#fff',
    fontSize: TYPO.button,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  startHint: {
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontSize: TYPO.sm,
    fontFamily: Fonts.PoppinsRegular,
    color: '#94A3B8',
    paddingHorizontal: SPACING.md,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
  },

  emptySub: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#94A3B8',
    textAlign: 'center',
  },

  DailyCard: {
    backgroundColor: '#0D614E0D',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  circle: {
    width: DIET_UI.vitalityCircle,
    height: DIET_UI.vitalityCircle,
    borderRadius: DIET_UI.vitalityCircle / 2,
    borderWidth: DIET_UI.vitalityCircleBorder,
    borderColor: '#0F5D4A',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  calories: {
    fontSize: TYPO.xxl + 2,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    marginBottom: -6,
  },

  kcalText: {
    fontSize: TYPO.sm,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsRegular,
  },

  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: SPACING.lg,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },

  label: {
    color: Colors.subTextColor,
    fontSize: TYPO.body,
    fontFamily: Fonts.PoppinsMedium,
    flexShrink: 0,
  },

  value: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: TYPO.body,
    textAlign: 'right',
    flexShrink: 1,
  },

  green: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: TYPO.body,
  },

  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: SPACING.sm,
  },

  goalLabel: {
    fontSize: TYPO.lg,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
  },

  goalValue: {
    fontSize: TYPO.lg,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },

  macroItem: { flex: 1, minWidth: 0 },

  macroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  macroLabel: {
    fontSize: TYPO.sm,
    color: Colors.black,
    fontFamily: Fonts.PoppinsMedium,
  },

  macroPercent: {
    fontSize: TYPO.sm,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  progressBg: {
    height: 6,
    backgroundColor: '#E0E3E2',
    borderRadius: 11,
    overflow: 'hidden',
  },

  progressFill: {
    height: 6,
    borderRadius: 10,
  },

  Hydrationcard: {
    backgroundColor: '#0D614E0D',
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  iconBox: {
    width: DIET_UI.hydrationIcon,
    height: DIET_UI.hydrationIcon,
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    flexShrink: 0,
  },

  Hydrationtitle: {
    fontSize: TYPO.lg,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  subtitle: {
    color: Colors.subTextColor,
    fontSize: TYPO.sm,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },

  minus: {
    width: DIET_UI.hydrationAction,
    height: DIET_UI.hydrationAction,
    borderRadius: RADIUS.sm + 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginRight: SPACING.sm,
  },

  plus: {
    width: DIET_UI.hydrationAction,
    height: DIET_UI.hydrationAction,
    borderRadius: RADIUS.sm + 2,
    backgroundColor: '#0F5D4A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnText: {
    fontSize: 25,
    color: '#374151',
  },

  plusText: {
    fontSize: 25,
    color: '#fff',
  },
});
