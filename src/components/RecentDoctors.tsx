import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { Fonts } from '../common/Fonts';

interface Props {
  image: ImageSourcePropType;
  name: string;
  speciality: string;
  date: string;

  onPressReceipt?: () => void;
  onPressReschedule?: () => void;
}

const RecentDoctors: React.FC<Props> = ({
  image,
  name,
  speciality,
  date,
  onPressReceipt,
  onPressReschedule,
}) => {
  return (
    <View style={styles.card}>

      {/* LEFT IMAGE */}
      <Image source={image} style={styles.image} />

      {/* RIGHT CONTENT */}
      <View style={styles.right}>

        <Text style={styles.name} numberOfLines={1}>{name}</Text>

        <Text style={styles.sub} numberOfLines={1}>
          <Text style={styles.speciality}>{speciality}</Text>
          <Text style={styles.dot}> • </Text>
          {date}
        </Text>

        {/* BUTTONS */}
        <View style={styles.btnRow}>

          <TouchableOpacity style={styles.lightBtn}  onPress={onPressReceipt}>
            <Text style={styles.lightText} numberOfLines={1} adjustsFontSizeToFit>View Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={onPressReschedule}>
            <Text style={styles.primaryText} numberOfLines={1} adjustsFontSizeToFit>Reschedule</Text>
          </TouchableOpacity>

        </View>

      </View>
    </View>
  );
};

export default RecentDoctors;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: 18,
  },

  right: {
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    marginBottom:-4
  },

  sub: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  speciality: {
    marginBottom:-10,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsMedium,
  },

  dot: {
    color: '#94A3B8',
  },

  btnRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },

  lightBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 9,
  },

  lightText: {
    color: '#475569',
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: '#0D614E',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});