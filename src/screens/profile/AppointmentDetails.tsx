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
import { Styles } from '../../common/Styles';
import { Fonts } from '../../common/Fonts';
import { Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import { Images } from '../../common/Images';

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
  page
}: {
  title: string;
  page: string
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity style={[styles.primaryBtn,{backgroundColor: page=='appoint' ?  Colors.primaryColor: Colors.errorColor }]} onPress={onPress}>
      <View style={styles.content}>
        <Ionicons name="videocam" size={18} color="#fff" />
        <Text style={styles.primaryText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

/* ================= SCREEN ================= */
const AppointmentDetailScreen = (props: any) => {

  console.log("propsss", props)
  return (
    <SafeAreaView style={styles.container}>

      <AppHeader
        title="Appointment Details"
        onLeftPress={() => props.navigation.goBack()}
        rightIcon="search"
        onRightPress={() => console.log('Search clicked')}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Doctor Card */}
        <View style={styles.card}>

          {/* Doctor Info */}
          <View style={styles.row}>
            <Image source={{ uri: data.image }} style={styles.avatar} />

            <View>
              <Text style={Styles.name}>{data.doctorName}</Text>
              <Text style={Styles.specialty}>{data.specialty}</Text>
            </View>
          </View>


          {/* Date + Time (Single Box Figma Match) */}
          <View style={styles.dateTimeBox}>


            {/* DATE */}
            <View style={styles.dtItem}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>📅</Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.label}>DATE</Text>
                <Text style={styles.value}>{data.date}</Text>
              </View>
            </View>

            {/* TIME */}
            <View style={styles.dtItem}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>⏰</Text>
              </View>



              <View style={styles.textContainer}>
                <Text style={styles.label}>TIME</Text>
                <Text style={styles.value}>{data.time}</Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <PrimaryButton title="Join Video Call" page='appoint' />

          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>Chat with Doctor</Text>
          </TouchableOpacity>

          <Text style={styles.techText}>
            Technical Check: Test Audio & Video
          </Text>
        </View>

        {/* Patient Info Card */}
        {/* Title OUTSIDE */}
        <Text style={Styles.sectionTitle}>Patient Information</Text>

        <View style={styles.card}>

          <View style={styles.infoRow}>
            <Text style={Styles.label}>Name</Text>
            <Text style={Styles.value}>{data.patientName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={Styles.label}>Age</Text>
            <Text style={Styles.value}>{data.age}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={Styles.label}>Gender</Text>
            <Text style={Styles.value}>{data.gender}</Text>
          </View>

        </View>

        {/* Reason Card */}
        <Text style={Styles.sectionTitle}>Reason for Visit</Text>

        <View style={styles.card}>
          <Text style={styles.reason}>{data.reason}</Text>
        </View>

        {/* Bottom Actions */}
        <TouchableOpacity style={styles.outlineBtn}>
          <Text style={Styles.outlineText}>Reschedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={Styles.cancelText}>Cancel Appointment</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AppointmentDetailScreen;

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

  },



  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 16,
    marginRight: 12,
  },





  /* DATE TIME */
  dateTimeBox: {
    flex: 1,

    // backgroundColor: '#F8FAFC', // light bg like figma
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  dtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding:10
    paddingVertical: 10
    // 50-50 layout with small gap
  },

  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.bgcolor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  icon: {
    fontSize: 18,
    marginRight: 10,
  },

  textContainer: {
    flexDirection: 'column',
  },

  label: {
    fontSize: 11,
    color: '#94A3B8', // gray label
    fontWeight: '600',
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    color: '#0F172A', // dark text
    fontWeight: '600',
  },



  /* BUTTONS */
  primaryBtn: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
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
    fontFamily: Fonts.PoppinsSemiBold
  },

  techText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0A8F5A',
    textAlign: 'center',
  },



  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },



  reason: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontFamily: Fonts.PoppinsMedium,
    fontStyle: 'italic'
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



  cancelBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },


});