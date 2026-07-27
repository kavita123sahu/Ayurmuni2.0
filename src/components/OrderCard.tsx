import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';

type Props = {
  title: string;
  id: string;
  status: 'DELIVERED' | 'IN PROGRESS';
  date: string;
  amount: string;
  onPress?: () => void;
};

const OrderCard: React.FC<Props> = ({
  title,
  id,
  status,
  date,
  amount,
  onPress,
}) => {
  const isDelivered = status === 'DELIVERED';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <TablerIcon name="receipt" size={20} color="#1B5E54" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.id}>ID: {id}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isDelivered ? '#E6F4EA' : '#E8F0FE',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: isDelivered ? '#1B5E54' : '#3366FF',
              },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.label}>ORDERED ON</Text>
          <Text style={styles.value}>{date}</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.label}>TOTAL AMOUNT</Text>
          <Text style={styles.amount}>Rs. {amount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E8F3F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  title: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
  },

  id: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: Colors.subTextColor,
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    position: 'absolute',
    top: 0, right: 10, borderRadius: 10,
  },

  statusText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
  },

  divider: {
    borderBottomWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    marginVertical: 12,
    opacity: 0.8,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#9CA3AF',
  },

  value: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    color: '#111827',
    marginTop: 2,
  },

  amount: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1B5E54',
    marginTop: 2,
  },
});
