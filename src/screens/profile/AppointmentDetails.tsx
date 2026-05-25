import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import { useNavigation } from '@react-navigation/native';
import { Styles } from '../../common/Styles';
import { Fonts } from '../../common/Fonts';
import { Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import { Images } from '../../common/Images';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: page == 'appoint' ? Colors.primaryColor : Colors.errorColor }]} onPress={onPress}>
      <View style={styles.content}>
        <Ionicons name="videocam" size={18} color="#fff" />
        <Text style={styles.primaryText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};


const DoctorDetail =()=>{
  return (
     <View style={styles.card}>
          <View style={styles.row}>
            <Image source={{ uri: data.image }} style={styles.avatar} />

            <View>
              <Text style={Styles.name}>{data.doctorName}</Text>
              <Text style={[Styles.specialty, { color: Colors.primaryColor }]}>{data.specialty}</Text>
            </View>
          </View>


          <View style={styles.dateTimeBox}>

            <View style={styles.dtItem}>
              <View style={styles.iconCircle}>
                <Image source={Images.calender} style={Styles.IconSize} />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.label}>DATE</Text>
                <Text style={styles.value}>{data.date}</Text>
              </View>
            </View>
            {/* TIME */}
            <View style={styles.dtItem}>
              <View style={styles.iconCircle}>
                <Image source={Images.clock} style={Styles.IconSize} />
              </View>



              <View style={styles.textContainer}>
                <Text style={styles.label}>TIME</Text>
                <Text style={styles.value}>{data.time}</Text>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 10 }}>
            <PrimaryButton title="Join Video Call" page='appoint' />

            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Chat with Doctor</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.techText}>
            Technical Check: Test Audio & Video
          </Text>
        </View>
  )
}

const AppointmentDetailScreen = (props: any) => {

  console.log("propsss", props)
  return (
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle={'dark-content'} backgroundColor={"#FFFFFF"} />

      <AppHeader
        title="Appointment Details"
        leftIcon={Images.backIcon}
        onLeftPress={() => props.navigation.goBack()}
        rightIcon="search"
        onRightPress={() => console.log('Search clicked')}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor:'#FDFDFB'}}>
       <DoctorDetail/>

        <Text style={styles.sectionTitle}>Patient Information</Text>

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

        <Text style={styles.sectionTitle}>Reason for Visit</Text>

        <View style={styles.card}>
          <Text style={styles.reason}>{data.reason}</Text>
        </View>

        <View style={{ paddingHorizontal: 10 }}>
          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={Styles.outlineText}>Reschedule</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={Styles.cancelText}>Cancel Appointment</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AppointmentDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingBottom: 80,
    backgroundColor: '#FFFFFF',
  },

  sectionTitle: {
    marginTop: 15,
    marginHorizontal: 20,
    marginBottom: 6,
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.black,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderColor

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

  dateTimeBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  dtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10
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
    marginBottom: 2,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },

  value: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 14,
    color: '#0F172A',
  },

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
    fontSize: 16,
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
    fontSize: 16,
    fontFamily: Fonts.PoppinsMedium,
  },

  techText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
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

  outlineBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#0D614E99',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelBtn: {
    marginHorizontal: 16,
    marginTop: 15,
    marginBottom: 30,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },


});