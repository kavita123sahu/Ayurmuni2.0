import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { RupeeAmount } from '../../utils/currencyUtils';
import type { PackageFees, PackagePlan } from '../../services/PackageServices';

type FeeSource = Partial<PackagePlan> & {
  fees?: PackageFees | null;
  paid_price?: string | number | null;
};

const present = (value: unknown) =>
  value != null && String(value).trim() !== '';

/** "18.00" → "18", "2.50" → "2.5". Empty when the API omitted the rate. */
const percentText = (value: unknown) => {
  if (!present(value)) return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
};

export const readPackageFees = (source: FeeSource | null | undefined) => {
  if (!source) return null;
  const fees = source.fees && typeof source.fees === 'object' ? source.fees : null;
  const sellingPrice = fees?.selling_price ?? source.selling_price;
  const gstPercent = fees?.gst_percent ?? source.gst_percent;
  const gstAmount = fees?.gst_amount ?? source.gst_amount;
  const platformFeePercent = fees?.platform_fee_percent ?? source.platform_fee_percent;
  const platformFee = fees?.platform_fee ?? source.platform_fee;
  const totalPayable =
    fees?.total_payable_amount ??
    source.total_payable_amount ??
    source.paid_price;

  const hasGst = present(gstAmount) || present(gstPercent);
  const hasPlatform = present(platformFee) || present(platformFeePercent);
  const hasTotal = present(totalPayable);
  if (!hasGst && !hasPlatform && !hasTotal) return null;

  return {
    sellingPrice: present(sellingPrice) ? sellingPrice : null,
    gstPercent: present(gstPercent) ? gstPercent : null,
    gstAmount: present(gstAmount) ? gstAmount : null,
    platformFeePercent: present(platformFeePercent) ? platformFeePercent : null,
    platformFee: present(platformFee) ? platformFee : null,
    totalPayable: present(totalPayable) ? totalPayable : sellingPrice,
  };
};

type Props = {
  source: FeeSource | null | undefined;
  /** Last row label. Plan details use "You pay"; checkout uses "Amount payable". */
  totalLabel?: string;
};

/** Selling price, GST, and platform fee from the package `fees` object. */
const PackagePriceSummary = ({ source, totalLabel = 'Amount payable' }: Props) => {
  const fees = readPackageFees(source);
  if (!fees) return null;

  const gstRate = percentText(fees.gstPercent);
  const platformRate = percentText(fees.platformFeePercent);

  return (
    <View style={styles.box}>
      {fees.sellingPrice != null ? (
        <View style={styles.row}>
          <Text style={styles.label}>Selling price</Text>
          <RupeeAmount value={fees.sellingPrice} style={styles.value} decimals={2} />
        </View>
      ) : null}
      {fees.gstAmount != null || gstRate ? (
        <View style={styles.row}>
          <Text style={styles.label}>GST{gstRate ? ` (${gstRate}%)` : ''}</Text>
          {fees.gstAmount != null ? (
            <RupeeAmount value={fees.gstAmount} style={styles.value} decimals={2} />
          ) : null}
        </View>
      ) : null}
      {fees.platformFee != null || platformRate ? (
        <View style={styles.row}>
          <Text style={styles.label}>
            Platform fee{platformRate ? ` (${platformRate}%)` : ''}
          </Text>
          {fees.platformFee != null ? (
            <RupeeAmount value={fees.platformFee} style={styles.value} decimals={2} />
          ) : null}
        </View>
      ) : null}
      {fees.totalPayable != null ? (
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>{totalLabel}</Text>
          <RupeeAmount
            value={fees.totalPayable}
            style={styles.totalValue}
            decimals={2}
          />
        </View>
      ) : null}
    </View>
  );
};

export default memo(PackagePriceSummary);

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#F3F8F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    flex: 1,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12.5,
    color: '#4B5753',
  },
  value: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 13,
    color: '#1F2A27',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E4ECE8',
    paddingTop: 8,
    marginTop: 2,
  },
  totalLabel: {
    flex: 1,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13.5,
    color: '#1F2A27',
  },
  totalValue: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 16,
    color: Colors.primaryColor,
  },
});
