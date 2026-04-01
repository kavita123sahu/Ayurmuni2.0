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
import { Styles } from '../../common/Styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // path adjust kar
import { RootStackParamList } from '../../../type';
import Header from '../../components/Header';
import { Images } from '../../common/Images';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AppointmentScreen = () => {

  const navigation = useNavigation<NavigationProp>(); // ✅ FIX
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');


  type Appointment = { id: string; doctorName: string; specialty: string; date: string; time: string; status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'; image: string; };

  const dummyData: Appointment[] = [{ id: '1', doctorName: 'Dr. Sarah Jenkins', specialty: 'Cardiologist - Heart Care Center', date: 'Oct 24, 2023', time: '10:30 AM', status: 'CONFIRMED', image: 'https://i.pravatar.cc/100?img=1', }, { id: '2', doctorName: 'Dr. Michael Chen', specialty: 'Dermatologist - Skin Clinic', date: 'Oct 28, 2023', time: '02:15 PM', status: 'PENDING', image: 'https://i.pravatar.cc/100?img=2', }, { id: '3', doctorName: 'Dr. Sarah Jenkins', specialty: 'Cardiologist - Heart Care Center', date: 'Oct 24, 2023', time: '10:30 AM', status: 'CANCELLED', image: 'https://i.pravatar.cc/100?img=1', }, { id: '4', doctorName: 'Dr. Michael Chen', specialty: 'Dermatologist - Skin Clinic', date: 'Oct 28, 2023', time: '02:15 PM', status: 'PENDING', image: 'https://i.pravatar.cc/100?img=2', },];

  const renderItem = ({ item }: { item: Appointment }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AppointmentDetails')}>

      {/* Top Row */}
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
                  : {}, // ✅ empty object fallback
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
                        : '#000', // fallback
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
            <Image source={Images.calender} style={Styles.IconSize} />
          </View>


          {/* <View style={styles.iconCircle}>
            <Text style={styles.icon}>📅</Text>
          </View> */}

          <View>
            <Text style={Styles.label}>DATE</Text>
            <Text style={Styles.value}>{item.date}</Text>
          </View>
        </View>

        {/* TIME */}
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

      {/* Buttons */}
      {item.status === 'CONFIRMED' ? (
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={Styles.outlineText}>Reschedule</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Join Call</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={Styles.cancelText}>Cancel Appointment</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <Header
        title="My Appointment"
        subtitle="Manage your visits "
        backIcon={Images.backIcon}
        onBack={() => {navigation.goBack() }}
      />

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
        contentContainerStyle={{ paddingHorizontal: 1, paddingVertical: 15, paddingBottom: 70 }}
      />

      {/* Bottom Button */}
      <TouchableOpacity style={styles.bookBtn}>
        <Text style={styles.bookText}>+ Book New Appointment</Text>
      </TouchableOpacity>

    </View>
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
    borderWidth: 1,
    borderColor: Colors.borderColor,
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



  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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