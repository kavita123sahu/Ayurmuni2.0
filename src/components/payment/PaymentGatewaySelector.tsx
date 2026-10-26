import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../TablerIcon';
import {
  PAYMENT_GATEWAY_OPTIONS,
  type PaymentGateway,
} from '../../config/paymentGateways';

type Props = {
  gateways: PaymentGateway[];
  selected: PaymentGateway;
  onSelect: (gateway: PaymentGateway) => void;
  disabled?: boolean;
  /** Compact chips (checkout) — no heavy rows / duplicate headers */
  compact?: boolean;
  hideHeader?: boolean;
};

const PaymentGatewaySelector = ({
  gateways,
  selected,
  onSelect,
  disabled,
  compact,
  hideHeader,
}: Props) => {
  if (compact) {
    return (
      <View style={styles.chipRow}>
        {gateways.map(id => {
          const option = PAYMENT_GATEWAY_OPTIONS[id];
          const active = id === selected;
          return (
            <TouchableOpacity
              key={id}
              activeOpacity={0.85}
              disabled={disabled}
              onPress={() => onSelect(id)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <TablerIcon
                name={option.icon}
                size={14}
                color={active ? Colors.primaryColor : '#64748B'}
              />
              <Text
                style={[styles.chipText, active && styles.chipTextActive]}
                numberOfLines={1}
              >
                {option.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View>
      {!hideHeader ? (
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <TablerIcon name="credit-card" size={14} color={Colors.primaryColor} />
          </View>
          <Text style={styles.headerTitle}>Pay using</Text>
        </View>
      ) : null}
      {gateways.map(id => {
        const option = PAYMENT_GATEWAY_OPTIONS[id];
        const active = id === selected;
        return (
          <TouchableOpacity
            key={id}
            activeOpacity={0.85}
            disabled={disabled}
            onPress={() => onSelect(id)}
            style={[styles.row, active && styles.rowActive]}
          >
            <View style={[styles.rowIcon, active && styles.rowIconActive]}>
              <TablerIcon
                name={option.icon}
                size={16}
                color={active ? '#FFFFFF' : Colors.primaryColor}
              />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{option.title}</Text>
              <Text style={styles.rowSub} numberOfLines={1}>
                {option.subtitle}
              </Text>
            </View>
            <View style={[styles.radio, active && styles.radioOn]}>
              {active ? <View style={styles.radioDot} /> : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default memo(PaymentGatewaySelector);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  headerIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#E8F4EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E5EBE8',
    marginBottom: 8,
  },
  rowActive: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F0FAF6',
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E8F4EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconActive: {
    backgroundColor: Colors.primaryColor,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  rowSub: {
    marginTop: 1,
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: Colors.primaryColor,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryColor,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#ECF8F3',
    borderColor: Colors.primaryColor,
  },
  chipText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#64748B',
    includeFontPadding: false,
  },
  chipTextActive: {
    color: Colors.primaryColor,
  },
});
