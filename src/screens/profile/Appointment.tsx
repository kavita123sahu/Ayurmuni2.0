import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { Styles } from '../../common/Styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // path adjust kar
import { RootStackParamList } from '../../../type';
import Header from '../../components/Header';
import { Images } from '../../common/Images';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AppointmentScreen = () => {

  const navigation = useNavigation<NavigationProp>(); // ✅ FIX
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');



  type Appointment = { id: string; doctorName: string; specialty: string; date: string; time: string; status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'; image: string; };

  const dummyData: Appointment[] = [{ id: '1', doctorName: 'Dr. Sarah Jenkins', specialty: 'Cardiologist - Heart Care Center', date: 'Oct 24, 2023', time: '10:30 AM', status: 'CONFIRMED', image: 'https://i.pravatar.cc/100?img=1', }, { id: '2', doctorName: 'Dr. Michael Chen', specialty: 'Dermatologist - Skin Clinic', date: 'Oct 28, 2023', time: '02:15 PM', status: 'PENDING', image: 'https://i.pravatar.cc/100?img=2', }, { id: '3', doctorName: 'Dr. Sarah Jenkins', specialty: 'Cardiologist - Heart Care Center', date: 'Oct 24, 2023', time: '10:30 AM', status: 'PENDING', image: 'https://i.pravatar.cc/100?img=1', }, { id: '4', doctorName: 'Dr. Michael Chen', specialty: 'Dermatologist - Skin Clinic', date: 'Oct 28, 2023', time: '02:15 PM', status: 'CONFIRMED', image: 'https://i.pravatar.cc/100?img=2', },];


  const pastData: Appointment[] = [{ id: '1', doctorName: 'Dr. Sarah Jenkins', specialty: 'Cardiologist - Heart Care Center', date: 'Oct 24, 2023', time: '10:30 AM', status: 'CONFIRMED', image: 'https://i.pravatar.cc/100?img=1', }, { id: '2', doctorName: 'Dr. Michael Chen', specialty: 'Dermatologist - Skin Clinic', date: 'Oct 28, 2023', time: '02:15 PM', status: 'CANCELLED', image: 'https://i.pravatar.cc/100?img=2', }, { id: '3', doctorName: 'Dr. Sarah Jenkins', specialty: 'Cardiologist - Heart Care Center', date: 'Oct 24, 2023', time: '10:30 AM', status: 'CANCELLED', image: 'https://i.pravatar.cc/100?img=1', }, { id: '4', doctorName: 'Dr. Michael Chen', specialty: 'Dermatologist - Skin Clinic', date: 'Oct 28, 2023', time: '02:15 PM', status: 'CONFIRMED', image: 'https://i.pravatar.cc/100?img=2', },];


  const appointmentData = useMemo(() => {
    return activeTab === 'upcoming'
      ? dummyData
      : pastData;
  }, [activeTab]);


  const DateTimeCard = ({ item }: { item: Appointment }) => {
    return (

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <Image source={Images.calender} style={Styles.IconSize} />
          </View>

          <View>
            <Text style={Styles.label}>DATE</Text>
            <Text style={Styles.value}>{item.date}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <Image source={Images.clock} style={Styles.IconSize} />
          </View>
          <View>
            <Text style={Styles.label}>TIME</Text>
            <Text style={Styles.value}>{item.time}</Text>
          </View>
        </View>

      </View>
    )
  }
  const renderItem = ({ item }: { item: Appointment }) => (

    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AppointmentDetails')}>
      <View style={styles.row}>
        <Image source={{ uri: item.image }} style={styles.avatar} />

        <View style={{ flex: 1 }}>
          <Text style={Styles.name}>{item.doctorName}</Text>
          <Text style={Styles.specialty}>{item.specialty}</Text>
        </View>

        <View
          style={[
            styles.status,
            item.status === 'CONFIRMED'
              ? styles.confirmed
              : item.status === 'PENDING'
                ? styles.pending
                : item.status === 'CANCELLED'
                  ? styles.cancelled
                  : {},
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === 'CONFIRMED'
                    ? Colors.green
                    : item.status === 'CANCELLED'
                      ? '#FF6B6B'
                      : item.status === 'PENDING'
                        ? '#EA580C'
                        : '#000',
              },
            ]}
          >
            {item.status}
          </Text>

        </View>
      </View>

      <DateTimeCard item={item} />


      {activeTab === 'upcoming' ? (
        (item.status === 'CONFIRMED') ? (
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate('DoctorSlot')}>
              <Text style={Styles.outlineText}>
                Reschedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('')}>
              <Text
                numberOfLines={1}
                style={styles.primaryText}
              >
                Join Call
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.cancelBtn}>
            <Text
              numberOfLines={1}
              style={Styles.cancelText}
            >
              Cancel Appointment
            </Text>
          </TouchableOpacity>
        )
      ) : (
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('DoctorSlipScreen')}>
          <Text
            numberOfLines={1}
            style={styles.primaryText}
          >
            View Details
          </Text>
        </TouchableOpacity>
      )}


      {/* {(item.status === 'CONFIRMED' || item.status === 'CANCELLED' && activeTab === 'upcoming') ? (
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={Styles.outlineText}>Reschedule</Text>
          </TouchableOpacity> 

          <TouchableOpacity style={styles.primaryBtn}>
            <Text numberOfLines={1} style={styles.primaryText}>Join Call</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.cancelBtn}>
          <Text numberOfLines={1} style={Styles.cancelText}>Cancel Appointment</Text>
        </TouchableOpacity>
      )} */}
    </TouchableOpacity>
  );


  const TabButton = () => {
    return (
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
    )
  }


  return (
    <SafeAreaView style={styles.container}>

      <Header
        title="My Appointments"
        subtitle="Manage your visits "
        backIcon={Images.backIcon}
        onBack={() => { navigation.goBack() }}
      />

      <TabButton />

      <FlatList
        data={appointmentData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 1, paddingVertical: 15, paddingBottom: 70 }}
      />

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
    marginBottom: 30,
    paddingHorizontal: 20,
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
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },

  tabItem: {
    flex: 1, // 🔥 equal width dono tabs ka
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative', // 🔥 important for indicator
  },

  tabText: {
    fontSize: 14,
    color: '#999',
    fontFamily: Fonts.PoppinsMedium,
  },

  activeTabText: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  indicator: {
    position: 'absolute',
    bottom: 0, // 🔥 always bottom pe chipka rahega
    left: 0,
    right: 0, // 🔥 full width of tab
    height: 3,
    backgroundColor: Colors.primaryColor,
    borderRadius: 2,
  },
  /* Card */
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginRight: 10,
  },



  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
    alignSelf: 'flex-start', // 👈 fix
    flexShrink: 0, // 👈 no compression
  },

  confirmed: {
    backgroundColor: "#10B9811A",
  },

  cancelled: {
    backgroundColor: '#FEE2E2',
  },
  pending: {
    backgroundColor: '#FFF7ED',
  },


  statusText: {
    fontSize: 10,

    fontFamily: Fonts.PoppinsSemiBold,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgcolor,
    padding: 12,
    borderRadius: 12,
    height: 68,
    marginTop: 12,
  },

  infoItem: {
    // flex:1,
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




  btnRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },

  outlineBtn: {
    flex: 1,
    height: 47,
    borderWidth: 1,
    borderColor: '#0F5B4D4D',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    height: 47,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
  },

  cancelBtn: {
    marginTop: 14,
    height: 47,
    backgroundColor: '#F43F5E0D',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  cancelText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
  },

  bookBtn: {
    position: 'absolute',

    backgroundColor: Colors.primaryColor,
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  bookText: {
    color: '#fff',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 16,
  },
});