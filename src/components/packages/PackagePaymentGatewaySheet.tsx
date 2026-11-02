import React, { memo, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../TablerIcon';
import PaymentGatewaySelector from '../payment/PaymentGatewaySelector';
import { usePaymentGateways } from '../../hooks/usePaymentGateways';
import type { PaymentGateway } from '../../config/paymentGateways';
import { RupeeAmount } from '../../utils/currencyUtils';
import type { PackagePlan } from '../../services/PackageServices';

type Props = {
  visible: boolean;
  plan: PackagePlan | null;
  processing?: boolean;
  onClose: () => void;
  onConfirm: (gateway: PaymentGateway) => void;
};

/** Gateway picker for care-plan purchase — same API as order / consultation. */
const PackagePaymentGatewaySheet = ({
  visible,
  plan,
  processing = false,
  onClose,
  onConfirm,
}: Props) => {
  const insets = useSafeAreaInsets();
  const { gateways, defaultGateway, loading } = usePaymentGateways({
    fallbackGateways: ['razorpay', 'cashfree', 'icici'],
  });
  const [selected, setSelected] = useState<PaymentGateway>(defaultGateway || 'razorpay');

  useEffect(() => {
    if (visible && defaultGateway) {
      setSelected(defaultGateway);
    }
  }, [visible, defaultGateway]);

  if (!plan) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <Text style={styles.title}>Pay for {plan.name}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <TablerIcon name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount payable</Text>
            <RupeeAmount value={plan.selling_price} style={styles.amount} decimals={false} />
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color={Colors.primaryColor} />
          ) : (
            <PaymentGatewaySelector
              options={gateways}
              selected={selected}
              onSelect={setSelected}
              disabled={processing}
            />
          )}

          <TouchableOpacity
            activeOpacity={0.88}
            disabled={processing || loading}
            onPress={() => onConfirm(selected)}
            style={[styles.cta, (processing || loading) && styles.ctaDisabled]}
          >
            {processing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.ctaText}>Continue to pay</Text>
                <TablerIcon name="arrow-right" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default memo(PackagePaymentGatewaySheet);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D5DEDA',
    marginBottom: 12,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 16,
    color: '#1F2A27',
    paddingRight: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F8F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  amountLabel: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 13,
    color: '#4B5753',
  },
  amount: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 18,
    color: Colors.primaryColor,
  },
  cta: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
