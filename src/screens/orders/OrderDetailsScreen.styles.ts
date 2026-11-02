import { StyleSheet, Platform } from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  returnRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  returnIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnInfo: { flex: 1, minWidth: 0 },
  returnTitle: { fontSize: 12.5, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold },
  returnSub: { marginTop: 1, fontSize: 11, color: '#64748B', fontFamily: Fonts.PoppinsRegular },
  returnPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  returnPillText: { fontSize: 10, fontFamily: Fonts.PoppinsSemiBold },

  scroll: { paddingHorizontal: 12, paddingTop: 8 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#64748B', fontFamily: Fonts.PoppinsMedium },

  // ── Section title ─────────────────────────────────────────────────────────

  sectionTitle: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 6,
    marginTop: 0,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  // ── Refresh ───────────────────────────────────────────────────────────────

  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  refreshBtnText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  // ── Hero card ─────────────────────────────────────────────────────────────

  heroCard: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D8EBE4',
    marginBottom: 8,
    overflow: 'hidden',
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  heroLeft: { flex: 1 },

  heroLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    letterSpacing: 0.8,
  },

  heroOrderId: {
    fontSize: 20,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: 2,
  },

  heroDate: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 3,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },

  statusText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  heroActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },

  heroAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7E5E0',
    backgroundColor: '#F8FBFA',
  },

  heroActionDanger: {
    backgroundColor: '#FFF7F7',
    borderColor: '#FECACA',
  },

  heroActionText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  // ── Card (generic) ────────────────────────────────────────────────────────

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },

  // ── Tracking ──────────────────────────────────────────────────────────────

  trackRow: { flexDirection: 'row', minHeight: 52 },

  trackLeft: { width: 28, alignItems: 'center' },

  trackDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  trackDotDone: { backgroundColor: Colors.primaryColor },
  trackDotActive: { backgroundColor: '#F59E0B' },
  trackDotCancelled: { backgroundColor: '#DC2626' },

  trackLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 2,
    marginBottom: -2,
  },

  trackLineDone: { backgroundColor: '#B7D8CE' },

  trackContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 10,
  },

  trackLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  trackLabelActive: { color: '#0F172A' },
  trackLabelCancelled: { color: '#DC2626' },
  trackLabelDelivered: { color: '#166534' },

  trackSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 2,
  },

  trackDate: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 3,
  },

  // ── Delivery agent ────────────────────────────────────────────────────────

  agentCard: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  agentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  agentInfo: { flex: 1, marginLeft: 12 },

  agentLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },

  agentName: {
    marginTop: 2,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  agentPhone: {
    marginTop: 1,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── ETA / location ────────────────────────────────────────────────────────

  etaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8EEF0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  etaIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  etaInfo: { flex: 1, marginLeft: 12 },

  etaText: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  etaLocation: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  // ── Address ───────────────────────────────────────────────────────────────

  addressCard: { flexDirection: 'row', alignItems: 'flex-start' },

  addrIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addrContent: { flex: 1, marginLeft: 12 },

  addrTitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },

  addrText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },

  // ── Detail rows ───────────────────────────────────────────────────────────

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },

  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  detailValue: {
    flex: 1.2,
    fontSize: 13,
    color: '#0F172A',
    textAlign: 'right',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  // ── Items ─────────────────────────────────────────────────────────────────

  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },

  itemRow: { flexDirection: 'row', alignItems: 'center' },

  itemImgBox: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginRight: 12,
  },

  itemImg: { width: '100%', height: '100%', resizeMode: 'cover' },

  itemImgFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F2EF',
  },

  itemInfo: { flex: 1 },

  itemName: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    lineHeight: 20,
  },

  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },

  itemQtyBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  itemQtyText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  itemSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 3,
  },

  itemPrice: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: 6,
  },

  rateBtn: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: Colors.primaryColor,
    borderRadius: 12,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FAF7',
  },

  rateBtnText: {
    color: Colors.primaryColor,
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  ratedRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  ratedText: {
    color: '#92400E',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  // ── Summary ───────────────────────────────────────────────────────────────

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },

  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  summaryValue: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 5,
  },

  totalLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  totalValue: {
    fontSize: 17,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsBold,
  },

  // ── Cancel modal ──────────────────────────────────────────────────────────

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
    zIndex: 999,
    elevation: 20,
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '88%',
  },

  modalScroll: {
    flexGrow: 0,
    maxHeight: 340,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  modalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalTitle: {
    fontSize: 19,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  modalSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 4,
    marginBottom: 18,
  },

  reasonsList: { marginBottom: 4 },

  reasonOption: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },

  reasonSelected: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F1F8F5',
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  radioSelected: { borderColor: Colors.primaryColor },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryColor,
  },

  reasonText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
  },

  reasonTextSelected: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  customReasonWrap: { marginTop: 4, marginBottom: 4 },

  customReasonInput: {
    minHeight: 88,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#D8E2DE',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13,
    lineHeight: 19,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
    textAlignVertical: 'top',
  },

  charCount: {
    textAlign: 'right',
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 4,
  },

  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },

  keepBtn: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#D8E2DE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  keepBtnText: {
    fontSize: 13,
    color: '#334155',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  confirmCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  confirmCancelBtnDisabled: { backgroundColor: '#CBD5E1' },

  confirmCancelText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
