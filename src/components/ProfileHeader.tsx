import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Fonts } from '../common/Fonts';

const ProfileHeader = ({ user }: any) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: user.image }} style={styles.avatar} />

      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.consults}</Text>
          <Text style={styles.statLabel}>CONSULTS</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.orders}</Text>
          <Text style={styles.statLabel}>ORDERS</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.reports}</Text>
          <Text style={styles.statLabel}>REPORTS</Text>
        </View>
      </View>
    </View>
  );
};

export default React.memo(ProfileHeader);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 40,
    marginBottom: 8,
  },

  name: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  email: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 14,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  statBox: {
    backgroundColor: '#F3F5F7',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
  },

  statNumber: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
});