import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import { getStatusColor } from '../common/DataInterface';
import { RupeeAmount } from '../utils/currencyUtils';

type Props = {
  title: string;
  id: string;
  status: string;
  date: string;
  amount: string;
  image?: string | null;
  moreCount?: number;
  onPress?: () => void;
};

const OrderCard: React.FC<Props> = ({
  title,
  id,
  status,
  date,
  amount,
  image,
  moreCount = 0,
  onPress,
}) => {
  const isDelivered =
    status?.toLowerCase() === 'delivered' ||
    status?.toLowerCase() === 'completed';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.topRow}>
        <View style={styles.imageBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.iconBox}>
              <TablerIcon name="receipt" size={18} color="#1B5E54" />
            </View>
          )}
          {moreCount > 0 && (
            <View style={styles.moreBadge}>
              <Text style={styles.moreBadgeText}>+{moreCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.mid}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.id} numberOfLines={1}>
            #{id}
          </Text>
          <Text style={styles.dateLine} numberOfLines={1}>
            {date}
          </Text>
        </View>

        <View style={styles.rightCol}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isDelivered ? '#E6F4EA' : '#E8F0FE' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {status.toUpperCase()}
            </Text>
          </View>
          <RupeeAmount value={amount} style={styles.amount} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
    backgroundColor: '#E8F3F1',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  iconBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    backgroundColor: Colors.primaryColor,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  moreBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  mid: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
  },
  id: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: Fonts.PoppinsRegular,
    color: Colors.subTextColor,
  },
  dateLine: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },
  rightCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  amount: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
});
