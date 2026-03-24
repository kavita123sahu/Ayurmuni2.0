import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import { useNavigation } from '@react-navigation/native';

/* ================= TYPES ================= */
type AppointmentDetails = {
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  patientName: string;
  age: string;
  gender: string;
  reason: string;
  image: string;
};

/* ================= DATA ================= */
const data: AppointmentDetails = {
  doctorName: 'Dr. Arjun R Nair',
  specialty: 'Cardiology Specialist',
  date: 'Tuesday, Oct 24, 2023',
  time: '09:30 AM - 10:00 AM',
  patientName: 'Alex Johnson',
  age: '28 Years',
  gender: 'Male',
  reason:
    'I have been experiencing mild chest tightness during morning jogs over the last two weeks. Looking for a routine check-up and professional advice.',
  image: 'https://i.pravatar.cc/100?img=3',
};

/* ================= BUTTON COMPONENT ================= */
const PrimaryButton = ({
  title,
  onPress,
}: {
  title: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity style={styles.primaryBtn} onPress={onPress}>
      <Text style={styles.primaryText}>{title}</Text>
    </TouchableOpacity>
  );
};

/* ================= SCREEN ================= */
const AppointmentDetails: React.FC = () => {


  return (
    <SafeAreaView style={styles.container}>

      <AppHeader
        title="FAQ"
        // onLeftPress={() => navigation.goBack()}
        // rightIcon="search"
        onRightPress={() => console.log('Search clicked')}
      />


      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Doctor Card */}
        <View style={styles.card}>

          {/* Doctor Info */}
          <View style={styles.row}>
            <Image source={{ uri: data.image }} style={styles.avatar} />

            <View>
              <Text style={styles.name}>{data.doctorName}</Text>
              <Text style={styles.specialty}>{data.specialty}</Text>
            </View>
          </View>

          {/* Date + Time (Single Box Figma Match) */}
          <View style={styles.dateTimeBox}>
            <View style={styles.dtItem}>
              <Text style={styles.icon}>📅</Text>
              <Text style={styles.dtText}>{data.date}</Text>
            </View>

            <View style={styles.dtItem}>
              <Text style={styles.icon}>⏰</Text>
              <Text style={styles.dtText}>{data.time}</Text>
            </View>
          </View>

          {/* Buttons */}
          <PrimaryButton title="Join Video Call" />

          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>Chat with Doctor</Text>
          </TouchableOpacity>

          <Text style={styles.techText}>
            ✔ Technical Check: Test Audio & Video
          </Text>
        </View>

        {/* Patient Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Patient Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{data.patientName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Age</Text>
            <Text style={styles.value}>{data.age}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>{data.gender}</Text>
          </View>
        </View>

        {/* Reason Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reason for Visit</Text>
          <Text style={styles.reason}>{data.reason}</Text>
        </View>

        {/* Bottom Actions */}
        <TouchableOpacity style={styles.outlineBtn}>
          <Text style={styles.outlineText}>Reschedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel Appointment</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AppointmentDetails;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  /* CARD */
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 18,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginRight: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
  },

  specialty: {
    fontSize: 12,
    color: '#6B7280',
  },

  /* DATE TIME */
  dateTimeBox: {
    marginTop: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
  },

  dtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  icon: {
    fontSize: 14,
  },

  dtText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#374151',
  },

  /* BUTTONS */
  primaryBtn: {
    backgroundColor: '#0A8F5A',
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  secondaryBtn: {
    backgroundColor: '#E6F4EE',
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  secondaryText: {
    color: '#0A8F5A',
    fontWeight: '500',
  },

  techText: {
    marginTop: 10,
    fontSize: 12,
    color: '#0A8F5A',
    textAlign: 'center',
  },

  /* SECTION */
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },

  label: {
    color: '#6B7280',
    fontSize: 13,
  },

  value: {
    fontWeight: '500',
    fontSize: 13,
  },

  reason: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },

  /* BOTTOM BUTTONS */
  outlineBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#0A8F5A',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  outlineText: {
    color: '#0A8F5A',
    fontWeight: '500',
  },

  cancelBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelText: {
    color: '#EF4444',
    fontWeight: '500',
  },
});