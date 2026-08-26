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
    status?.toLowerCase() === 'delivered' || status?.toLowerCase() === 'completed';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.topRow}>
        <View style={styles.imageBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.iconBox}>
              <TablerIcon name="receipt" size={20} color="#1B5E54" />
            </View>
          )}
          {moreCount > 0 && (
            <View style={styles.moreBadge}>
              <Text style={styles.moreBadgeText}>+{moreCount}</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
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
              { color: getStatusColor(status) },
            ]}
          >
            {status.toUpperCase()}
          </Text>
          {/* <Text
            style={[
              styles.statusText,
              {
                color: isDelivered ?  status === 'pending' ? '#1B5E54' : '#3366FF ' : '#3366FF',
              },
            ]}
          >
            {status.toUpperCase()}
          </Text> */}
        </View>
      </View>

      <View style={styles.divider} />

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
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginRight: 12,
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
    paddingHorizontal: 5,
    paddingVertical: 1,
  },

  moreBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  title: {
    fontSize: 15,
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
    borderRadius: 20,
    marginLeft: 8,
  },

  statusText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
    color: '#94A3B8',
    letterSpacing: 0.4,
  },

  value: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
    marginTop: 2,
  },

  amount: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    marginTop: 2,
  },
});
