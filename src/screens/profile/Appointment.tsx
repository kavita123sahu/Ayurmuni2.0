import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';

const AppointmentScreen = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');


  type Appointment = { id: string; doctorName: string; specialty: string; date: string; time: string; status: 'CONFIRMED' | 'PENDING'; image: string; };

  const dummyData: Appointment[] = [{ id: '1', doctorName: 'Dr. Sarah Jenkins', specialty: 'Cardiologist - Heart Care Center', date: 'Oct 24, 2023', time: '10:30 AM', status: 'CONFIRMED', image: 'https://i.pravatar.cc/100?img=1', }, { id: '2', doctorName: 'Dr. Michael Chen', specialty: 'Dermatologist - Skin Clinic', date: 'Oct 28, 2023', time: '02:15 PM', status: 'PENDING', image: 'https://i.pravatar.cc/100?img=2', },];

  const renderItem = ({ item }: { item: Appointment }) => (
    <View style={styles.card}>

      {/* Top Row */}
      <View style={styles.row}>
        <Image source={{ uri: item.image }} style={styles.avatar} />

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.doctorName}</Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
        </View>

        <View
          style={[
            styles.status,
            item.status === 'CONFIRMED'
              ? styles.confirmed
              : styles.pending,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === 'CONFIRMED'
                    ? Colors.green
                    : '#FF6B6B',
              },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      {/* Date Time */}
      <View style={styles.infoRow}>

        {/* DATE */}
        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>📅</Text>
          </View>
          <View>
            <Text style={styles.label}>DATE</Text>
            <Text style={styles.value}>{item.date}</Text>
          </View>
        </View>

        {/* TIME */}
        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>⏰</Text>
          </View>
          <View>
            <Text style={styles.label}>TIME</Text>
            <Text style={styles.value}>{item.time}</Text>
          </View>
        </View>

      </View>

      {/* Buttons */}
      {item.status === 'CONFIRMED' ? (
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.outlineText}>Reschedule</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Join Call</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel Appointment</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <Text style={styles.header}>My Appointments</Text>

      {/* Tabs */}
      <View style={styles.tabWrapper}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText,
            ]}
          >
            Upcoming
          </Text>
          {activeTab === 'upcoming' && <View style={styles.indicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'past' && styles.activeTabText,
            ]}
          >
            Past
          </Text>
          {activeTab === 'past' && <View style={styles.indicator} />}
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={dummyData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      {/* Bottom Button */}
      <TouchableOpacity style={styles.bookBtn}>
        <Text style={styles.bookText}>+ Book New Appointment</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

export default AppointmentScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  header: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    marginVertical: 16,
    color: Colors.textColor || '#000',
  },

  /* Tabs */
  tabWrapper: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },

  tabItem: {
    flex: 1, // ✅ 50-50
    alignItems: 'center',
    paddingVertical: 10,
  },

  tabText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    color: '#9CA3AF',
  },

  activeTabText: {
    color: Colors.primaryColor,
  },

  indicator: {
    height: 2,
    backgroundColor: Colors.primaryColor,
    width: '100%',
    marginTop: 6,
  },

  /* Card */
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginRight: 10,
  },

  name: {
    fontSize: 14,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  specialty: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsMedium,
  },

  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  confirmed: {
    backgroundColor: "#10B9811A",
  },

  pending: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 10,

    fontFamily: Fonts.PoppinsSemiBold,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgcolor, // same box bg
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    
    marginRight: 8,
  },

  icon: {
    fontSize: 14,
  },

  label: {
    fontSize: 10,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
  },

  value: {
    fontSize: 12,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },


  btnRow: {
    flexDirection: 'row',
    marginTop: 14,
  },

  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    borderRadius: 10,
    paddingVertical: 10,
    marginRight: 6,
    alignItems: 'center',
  },

  outlineText: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 12,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    paddingVertical: 10,
    marginLeft: 6,
    alignItems: 'center',
  },

  primaryText: {
    color: '#fff',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 12,
  },

  cancelBtn: {
    marginTop: 14,
    backgroundColor: '#F43F5E0D',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  cancelText: {
    color: '#EF4444',
    fontFamily: Fonts.PoppinsMedium,
  },

  bookBtn: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: Colors.primaryColor,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  bookText: {
    color: '#fff',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
  },
});