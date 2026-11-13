import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../TablerIcon';
import {
  PAYMENT_GATEWAY_OPTIONS,
  type PaymentGateway,
  type PaymentGatewayAvailability,
} from '../../config/paymentGateways';

type Props = {
  /** Preferred: full availability rows from payment-gateways API. */
  options?: PaymentGatewayAvailability[];
  /** Legacy: active-only ids (all treated as selectable). */
  gateways?: PaymentGateway[];
  selected: PaymentGateway;
  onSelect: (gateway: PaymentGateway) => void;
  disabled?: boolean;
  /** Compact chips (checkout) — no heavy rows / duplicate headers */
  compact?: boolean;
  hideHeader?: boolean;
};

const PaymentGatewaySelector = ({
  options,
  gateways,
  selected,
  onSelect,
  disabled,
  compact,
  hideHeader,
}: Props) => {
  const rows: PaymentGatewayAvailability[] =
    Array.isArray(options) && options.length
      ? options
      : (gateways || []).map(id => ({
          id,
          status: 'active',
          enabled: true,
          statusLabel: 'Available',
        }));

  if (!rows.length) return null;

  if (compact) {
    return (
      <View style={styles.chipRow}>
        {rows.map(row => {
          const option = PAYMENT_GATEWAY_OPTIONS[row.id];
          const active = row.id === selected && row.enabled;
          const isDisabled = disabled || !row.enabled;
          return (
            <TouchableOpacity
              key={row.id}
              activeOpacity={0.85}
              disabled={isDisabled}
              onPress={() => {
                if (!row.enabled) return;
                onSelect(row.id);
              }}
              style={[
                styles.chip,
                active && styles.chipActive,
                !row.enabled && styles.chipDisabled,
              ]}
            >
              <TablerIcon
                name={option.icon}
                size={14}
                color={
                  !row.enabled
                    ? '#94A3B8'
                    : active
                      ? Colors.primaryColor
                      : '#64748B'
                }
              />
              <View style={styles.chipTextCol}>
                <Text
                  style={[
                    styles.chipText,
                    active && styles.chipTextActive,
                    !row.enabled && styles.chipTextDisabled,
                  ]}
                  numberOfLines={1}
                >
                  {option.title}
                </Text>
                {!row.enabled ? (
                  <Text style={styles.chipStatus} numberOfLines={1}>
                    {row.statusLabel}
                  </Text>
                ) : null}
              </View>
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
      {rows.map(row => {
        const option = PAYMENT_GATEWAY_OPTIONS[row.id];
        const active = row.id === selected && row.enabled;
        const isDisabled = disabled || !row.enabled;
        return (
          <TouchableOpacity
            key={row.id}
            activeOpacity={0.85}
            disabled={isDisabled}
            onPress={() => {
              if (!row.enabled) return;
              onSelect(row.id);
            }}
            style={[
              styles.row,
              active && styles.rowActive,
              !row.enabled && styles.rowDisabled,
            ]}
          >
            <View
              style={[
                styles.rowIcon,
                active && styles.rowIconActive,
                !row.enabled && styles.rowIconDisabled,
              ]}
            >
              <TablerIcon
                name={option.icon}
                size={16}
                color={
                  !row.enabled
                    ? '#94A3B8'
                    : active
                      ? '#FFFFFF'
                      : Colors.primaryColor
                }
              />
            </View>
            <View style={styles.rowBody}>
              <Text
                style={[styles.rowTitle, !row.enabled && styles.rowTitleDisabled]}
              >
                {option.title}
              </Text>
              <Text style={styles.rowSub} numberOfLines={1}>
                {row.enabled ? option.subtitle : row.statusLabel}
              </Text>
            </View>
            {row.enabled ? (
              <View style={[styles.radio, active && styles.radioOn]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
            ) : (
              <View style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  {row.statusLabel}
                </Text>
              </View>
            )}
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
  rowDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.92,
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
  rowIconDisabled: {
    backgroundColor: '#E2E8F0',
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
  rowTitleDisabled: {
    color: '#64748B',
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
  badge: {
    maxWidth: 110,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 10,
    color: '#B45309',
    fontFamily: Fonts.PoppinsMedium,
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
  chipDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  chipTextCol: {
    minWidth: 0,
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
  chipTextDisabled: {
    color: '#94A3B8',
  },
  chipStatus: {
    marginTop: 1,
    fontSize: 9,
    color: '#B45309',
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
  },
});
