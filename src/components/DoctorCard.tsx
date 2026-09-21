import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon from '../components/TablerIcon';
import DoctorAvatar from './DoctorAvatar';

type DoctorCardProps = {
  data: {
    name: string;
    speciality: string;
    exp: number;
    rating: number;
    image?: string;
    profile_image?: any;
    doctor_image?: string;
    available?: boolean;
  };

  showConsultBtn?: boolean;
  showChatBtn?: boolean;
  showFav?: boolean;

  onConsult?: () => void;
  onChat?: () => void;
  onFav?: (val: boolean) => void;
};

export default function DoctorCard({
  data,
  showConsultBtn = false,
  showChatBtn = false,
  showFav = false,
  onConsult,
  onChat,
  onFav,
}: DoctorCardProps) {
  const [fav, setFav] = useState(false);

  const handleFav = () => {
    setFav(!fav);
    onFav && onFav(!fav);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <DoctorAvatar
          doctor={data}
          uri={data.image}
          name={data.name}
          size={60}
          shape="rounded"
          borderRadius={12}
          emptyMode="icon"
        />
        <View
          style={{
            borderWidth: 4,
            borderColor: '#10B981',
            borderRadius: 20,
            position: 'absolute',
            bottom: 5,
            left: 50,
          }}
        />

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.available}>Oct 24 • 10:00 AM</Text>
          <Text style={styles.name} numberOfLines={1}>
            {data.name}
          </Text>
          <Text style={styles.speciality} numberOfLines={1}>
            {data.speciality}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TablerIcon name="clock" size={15} color={'#10B981'} />
            <Text style={styles.meta}>
              {data.exp} Yrs • ⭐ {data.rating}
            </Text>
            <Text style={styles.meta1}>(978)</Text>
          </View>
        </View>

        {showFav && (
          <TouchableOpacity onPress={handleFav} style={{ bottom: 40 }}>
            <Text style={{ fontSize: 18 }}>{fav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {(showConsultBtn || showChatBtn) && (
        <View style={styles.bottom}>
          {showChatBtn && (
            <TouchableOpacity style={styles.chatBtn} onPress={onChat}>
              <Text>💬</Text>
            </TouchableOpacity>
          )}

          {showConsultBtn && (
            <TouchableOpacity style={styles.consultBtn} onPress={onConsult}>
              <Text style={styles.btnText}>Consult Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  row: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  available: {
    color: '#0f6d5c',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  name: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 16,
    marginBottom: -5,
  },
  speciality: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  meta: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  meta1: {
    fontSize: 10,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 4,
  },
  bottom: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  chatBtn: {
    backgroundColor: '#eef3f1',
    padding: 12,
    borderRadius: 10,
  },
  consultBtn: {
    flex: 1,
    backgroundColor: '#0f6d5c',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
