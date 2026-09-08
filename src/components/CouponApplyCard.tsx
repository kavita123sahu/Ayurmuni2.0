import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import { formatRupee } from '../utils/currencyUtils';
import {
  type Coupon,
  calcCouponDiscount,
  couponOfferTitle,
  couponMatchesScope,
} from '../utils/couponUtils';
import { showSuccessToast } from '../config/Key';
import CouponTicket from './CouponTicket';
import CouponOffersPanel from './CouponOffersPanel';
import CouponAppliedModal from './CouponAppliedModal';
import type { ApplyCouponResult } from '../hooks/useCheckoutCoupons';

type Props = {
  /** Full scoped list for View all (no min_amount filter). */
  coupons: Coupon[];
  /** Optional pre-filtered eligible list; if omitted, derived from coupons + cartAmount. */
  eligibleCoupons?: Coupon[];
  /** Cart / consultation fee — used to filter top-2 preview by min_amount. */
  cartAmount?: number;
  loading?: boolean;
  applied: Coupon | null;
  discount: number;
  error?: string | null;
  /** product = order checkout, consultation = booking */
  checkoutScope?: 'product' | 'consultation';
  onApply: (
    code: string,
  ) => boolean | Promise<boolean | ApplyCouponResult>;
  onRemove: () => void;
};

const CouponApplyCard = ({
  coupons,
  eligibleCoupons,
  cartAmount = 0,
  loading,
  applied,
  discount,
  error,
  checkoutScope,
  onApply,
  onRemove,
}: Props) => {
  const [code, setCode] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState<{
    code: string;
    discount: number;
    title?: string;
  } | null>(null);

  /** View all — every coupon matching source + applies_to for this checkout. */
  const scopedCoupons = useMemo(() => {
    if (!checkoutScope) return coupons;
    return coupons.filter(item => couponMatchesScope(item, checkoutScope));
  }, [coupons, checkoutScope]);

  /** Top 2 — only coupons that pass min_amount for current cart. */
  const preview = useMemo(() => {
    const eligible =
      eligibleCoupons ??
      scopedCoupons.filter(item => calcCouponDiscount(item, cartAmount).ok);
    return eligible.slice(0, 2);
  }, [eligibleCoupons, scopedCoupons, cartAmount]);

  const submit = async (raw?: string) => {
    Keyboard.dismiss();
    const next = String(raw ?? code).trim().toUpperCase();
    if (!next) {
      showSuccessToast('Enter a coupon code', 'error');
      return;
    }
    if (applying) return;
    setApplying(true);
    try {
      const result = await onApply(next);
      const ok =
        result === true ||
        (typeof result === 'object' && result != null && result.ok);
      if (ok) {
        const saved =
          typeof result === 'object' && result != null
            ? Number(result.discount) || discount
            : discount;
        const title =
          typeof result === 'object' && result?.coupon
            ? couponOfferTitle(result.coupon)
            : scopedCoupons.find(c => c.code === next)
              ? couponOfferTitle(
                  scopedCoupons.find(c => c.code === next) as Coupon,
                )
              : next;
        setCode('');
        setSheetOpen(false);
        setSuccess({ code: next, discount: saved, title });
      } else if (typeof result === 'object' && result?.error) {
        showSuccessToast(result.error, 'error');
      }
    } finally {
      setApplying(false);
    }
  };

  const pasteCode = async () => {
    try {
      const text = await Clipboard.getString();
      const next = String(text || '').trim().toUpperCase();
      if (!next) {
        showSuccessToast('Clipboard is empty', 'error');
        return;
      }
      setCode(next);
    } catch {
      showSuccessToast('Could not paste code', 'error');
    }
  };

  const copyCode = async (value: string) => {
    try {
      await Clipboard.setString(value);
      showSuccessToast('Code copied', 'success');
    } catch {
      showSuccessToast('Could not copy code', 'error');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <View style={styles.headLeft}>
          <View style={styles.headIcon}>
            <TablerIcon name="receipt" size={16} color={Colors.primaryColor} />
          </View>
          <View>
            <Text style={styles.headTitle}>Apply coupon</Text>
            <Text style={styles.headSub}>
              {checkoutScope === 'consultation'
                ? scopedCoupons.length
                  ? `${scopedCoupons.length} consult offer${scopedCoupons.length > 1 ? 's' : ''}`
                  : 'No consultation coupons available'
                : scopedCoupons.length
                  ? `${scopedCoupons.length} order offer${scopedCoupons.length > 1 ? 's' : ''}`
                  : 'Enter a code or browse offers'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setSheetOpen(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      {applied ? (
        <View style={styles.appliedRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.appliedCode}>{applied.code}</Text>
            <Text style={styles.appliedSave}>
              You save {formatRupee(discount)}
            </Text>
          </View>
          <TouchableOpacity onPress={onRemove}>
            <Text style={styles.remove}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.inputRow}>
            <TextInput
              value={code}
              onChangeText={text => setCode(text.toUpperCase())}
              placeholder="Enter coupon code"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={() => submit()}
            />
            {/* <TouchableOpacity style={styles.pasteBtn} onPress={pasteCode}>
              <Text style={styles.pasteText}>Paste</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => submit()}
              disabled={applying}
            >
              {applying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.applyText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}
          {preview.length ? (
            <View style={styles.previewList}>
              {preview.map(item => (
                <CouponTicket
                  key={item.id}
                  coupon={item}
                  onApply={submit}
                  onCopy={copyCode}
                  notchColor="#F4F7F6"
                />
              ))}
            </View>
          ) : null}
        </>
      )}

      <Modal
        visible={sheetOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setSheetOpen(false)}
      >
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity
            style={styles.sheetDismiss}
            activeOpacity={1}
            onPress={() => setSheetOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHead}>
              <View>
                <Text style={styles.sheetTitle}>
                  {checkoutScope === 'consultation'
                    ? 'Consultation coupons'
                    : checkoutScope === 'product'
                      ? 'Order coupons'
                      : 'Coupons'}
                </Text>
                <Text style={styles.sheetSub}>
                  {checkoutScope === 'consultation'
                    ? 'Admin offers valid for consultations'
                    : checkoutScope === 'product'
                      ? 'Admin offers valid for this order'
                      : 'Available offers'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSheetOpen(false)}>
                <TablerIcon name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <CouponOffersPanel
              coupons={scopedCoupons}
              loading={loading}
              appliedCode={applied?.code}
              applying={applying}
              error={error}
              checkoutScope={checkoutScope}
              onApply={submit}
              notchColor="#F1F5F3"
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          </View>
        </View>
      </Modal>

      <CouponAppliedModal
        visible={!!success}
        code={success?.code}
        discount={success?.discount}
        title={success?.title}
        onClose={() => setSuccess(null)}
      />
    </View>
  );
};

export default CouponApplyCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    padding: 14,
    marginBottom: 14,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  headIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E8F3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTitle: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  headSub: {
    marginTop: 1,
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  viewAll: {
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    backgroundColor: '#F8FAFC',
  },
  pasteBtn: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7E8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasteText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  applyBtn: {
    height: 44,
    minWidth: 64,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  error: {
    marginTop: 8,
    fontSize: 12,
    color: '#B91C1C',
    fontFamily: Fonts.PoppinsMedium,
  },
  previewList: {
    marginTop: 10,
    gap: 8,
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF8F4',
    borderRadius: 10,
    padding: 12,
  },
  appliedCode: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  appliedSave: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  remove: {
    fontSize: 12,
    color: '#B91C1C',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'flex-end',
  },
  sheetDismiss: {
    flex: 1,
  },
  sheet: {
    height: '88%',
    backgroundColor: '#F1F5F3',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D5DEDA',
    marginBottom: 10,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  sheetSub: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
});
