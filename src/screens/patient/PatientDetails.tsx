
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import PatientCard, { Patient } from './PatientCard';
import { Styles } from '../../common/Styles';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import SelectedPatientCard from './SelectedPatient';
import Header from '../../components/Header';
import { Images } from '../../common/Images';

const dummyPatients: Patient[] = [
  {
    id: '1',
    name: 'Arjun Sharma',
    relation: 'Self',
    image: 'https://i.pravatar.cc/100?img=3',
    selected: true,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    relation: 'Spouse',
    image: 'https://i.pravatar.cc/100?img=5',
  },
  {
    id: '3',
    name: 'Aarav Sharma',
    relation: 'Child',
    image: 'https://i.pravatar.cc/100?img=6',
  },
];

const PatientDetails: React.FC = (props : any) => {
  const [patients, setPatients] = useState<Patient[]>(dummyPatients);

  const handleSelect = (id: string) => {
    setPatients(prev =>
      prev.map(p => ({ ...p, selected: p.id === id }))
    );
  };

  const selectedPatient = patients.find(p => p.selected);

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={{ paddingHorizontal: 10 }}>
          <Header
            title="Patient Details"
            subtitle="Manage family profiles"
            backIcon={require('../../assets/images/BackButton.png')}
            onBack={() => {props.navigation.goBack()}}
          />

          {/* ── CURRENTLY SELECTED CARD ── */}

          <Text style={Styles.sectionTitle}>CURRENTLY SELECTED</Text>

          <SelectedPatientCard
            name="Arjun Sharma"
            phone="+91 9876543210"
            relation="Self"
            image="https://i.pravatar.cc/100?img=3"
          // onViewRecords={() => navigation.navigate('Records')}
          />

          {/* ── PATIENT LIST CARD ── */}

          <View style={styles.rowBetween}>
            <Text style={Styles.sectionTitle}>PATIENT LIST</Text>

            <TouchableOpacity >
              <Text style={Styles.addBtn}>+  Add Patient</Text>
            </TouchableOpacity>
          </View>


          <View style={{ marginBottom: 10 }}>
            <FlatList
              data={patients}
              renderItem={({ item }) => (
                <PatientCard patient={item} onSelect={handleSelect}  navigation ={props.navigation}/>
              )}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* ── INFO BOX ── */}
          <View style={styles.infoBox}>
            <View style={styles.iconCircle}>
              <Image source={Images.notification} style={styles.IconSize} />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Switching Patients</Text>
              <Text style={styles.infoText}>
                Selecting a different family member will update your dashboard and
                appointments for that profile.
              </Text>
            </View>
          </View>

          {/* ── VERSION ── */}
          <Text style={styles.version}>APP VERSION 1.2</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PatientDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // paddingBottom:80,
    backgroundColor: '#F1F5F9',
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 18,
    paddingBottom: 32,
  },

  // ── Header ──
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 32,
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#0F172A',
    lineHeight: 32,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // ── Card ──
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // ── Section label ──
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // ── Currently Selected ──
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 16,
  },
  selfBadge: {
    position: 'absolute',
    top: -6,
    alignSelf: 'center',
    left: 10,
    backgroundColor: '#0F766E',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  selfBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  phone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  viewRecords: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '600',
  },

  // ── Avatar group ──
  avatarGroup: {
    flexDirection: 'row',
    marginTop: 14,
  },
  avatarGroupImg: {
    width: 30,
    height: 30,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: -6,
  },

  // ── Row between ──
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 10
  },


  // ── Info Box ──
  infoBox: {
    paddingHorizontal: 25,
    paddingVertical: 35,
    backgroundColor: Colors.bgcolor,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.BGIcon,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,

  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.BGIcon,
    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 8,
  },

  IconSize: {
    height: 24,
    width: 24
  },

  infoIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  infoContent: {
    flex: 1,

  },
  infoTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    marginBottom: 2
  },
  infoText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.subTextColor,
    lineHeight: 14,
  },

  // ── Version ──
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: '#94A3B8',
    marginTop: 30,
    marginBottom: 30
  },
});