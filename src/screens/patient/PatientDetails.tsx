
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
} from 'react-native';
import PatientCard, { Patient } from './PatientCard';
import { Styles } from '../../common/Styles';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import SelectedPatientCard from './SelectedPatient';
import Header from '../../components/Header';
import { Images } from '../../common/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Utils } from '../../common/Utils';
import * as  _PROFILE_SERVICES from '../../services/ProfileServices';
import { usePatientData } from '../../hooks/usePatientData';
import EmptyState from '../../components/EmptyState';
import CommonButton from '../../components/CommonButton';
import CommonModal from '../../components/LogoutModal';
import { showSuccessToast } from '../../config/Key';



interface UserInterface {
  first_name: string;
  last_name: string;
  profile_picture: string;
  phone_number: string;
}

const PatientDetails: React.FC = (props: any) => {

  const {
    patients,
    loading,
    fetchPatients,
    switchPatient,
  } = usePatientData();

  const [user, setUser] =
    useState<UserInterface | null>(null);


  const [deleteLoading, setDeleteLoading] =
    useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const fetchUserData =
    useCallback(async () => {

      try {

        const res: any =
          await _PROFILE_SERVICES.user_profile();
        console.log('user_profile_json', res?.data);
        setUser(
          res?.data || null,
        );

      } catch (error) {

        console.log(
          'Profile Error:',
          error,
        );

      }

    }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        await Promise.all([
          fetchPatients(),
          fetchUserData(),
        ]);
      };

      loadData();
    }, [
      fetchPatients,
      fetchUserData,
    ]),
  );

  const handleSelect = useCallback(
    async (id: string) => {
      try {
        await switchPatient(id);

        await Promise.all([
          fetchPatients(),
          fetchUserData(),
        ]);
      } catch (error) {
        console.log(
          'SWITCH PATIENT ERROR =>',
          error,
        );
      }
    },
    [
      switchPatient,
      fetchPatients,
      fetchUserData,
    ],
  );

  const openDeleteModal =
    useCallback(() => {
      setDeleteVisible(true);
    }, []);

  const closeDeleteModal =
    useCallback(() => {
      setDeleteVisible(false);
    }, []);

  const handleDeleteAccount =
    useCallback(async () => {
      try {
        setDeleteLoading(true);

        const response: any =
          await _PROFILE_SERVICES.deleteAccount();

        console.log(
          'DELETE ACCOUNT RESPONSE =>',
          response,
        );

        if (!response?.success) {
          showSuccessToast(
            response?.message ||
            'Failed to delete account',
            'error',
          );
          return;
        }

        await Promise.all([
          Utils.removeData('_TOKEN'),
          Utils.removeData('_REFRESH_TOKEN'),
          Utils.removeData('_USER_INFO'),
        ]);

        showSuccessToast(
          response?.message ||
          'Account deleted successfully',
          'success',
        );

        setDeleteVisible(false);

        props.navigation.reset({
          index: 0,
          routes: [
            {
              name: 'AuthStack',
            },
          ],
        });
      } catch (error) {
        console.log(
          'DELETE ACCOUNT ERROR =>',
          error,
        );

        showSuccessToast(
          'Something went wrong',
          'error',
        );
      } finally {
        setDeleteLoading(false);
      }
    }, [props.navigation]);



  const fullName =
    `${user?.first_name ?? ''} ${user?.last_name ?? ''
      }`.trim();
  const phoneNumber = user?.phone_number;
  const profileImage = user?.profile_picture;

  return (
    <SafeAreaView style={styles.safeArea}>

      <StatusBar barStyle={'dark-content'} backgroundColor={'#ffffff'} />

      <Header
        title="Patient Details"
        subtitle="Manage family profiles"
        backIcon={Images.backIcon}
        onBack={() => { props.navigation.goBack() }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        <Text style={Styles.sectionTitle}>CURRENTLY SELECTED</Text>

        <SelectedPatientCard
          name={fullName || ""}
          phone={phoneNumber || ""}
          relation="Self"
          image={profileImage || ""}
          navigation={props.navigation}
        // onViewRecords={() => navigation.navigate('Records')}
        />


        <View style={styles.rowBetween}>
          <Text style={Styles.sectionTitle}>PATIENT LIST</Text>

          <TouchableOpacity onPress={() => props.navigation.navigate(
            'AddEditPatientDetail',
            {
              mode: 'add',
              // patient: item,
            },
          )}>
            <Text style={Styles.addBtn}>+  Add Patient</Text>
          </TouchableOpacity>
        </View>


        <View style={{ marginBottom: 10 }}>

          <FlatList
            data={patients}
            keyExtractor={item =>
              item.id
            }
            renderItem={({ item }) => (
              <PatientCard
                patient={{
                  ...item,
                  selected:
                    item?.is_active_profile,
                }}
                onSelect={() =>
                  handleSelect(
                    item.id,
                  )
                }
                navigation={
                  props.navigation
                }
              />
            )}

            ListEmptyComponent={<EmptyState
              image={Images.patient}
              title="No Patients Added"
              subtitle="Add your first patient to get started."
            />}
            removeClippedSubviews
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
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

        <View style={{ position: "relative", bottom: 10, top: 20 }}>
          <CommonButton title='Delete Account' loading={loading} onPress={openDeleteModal} />

        </View>
        {/* ── VERSION ── */}
        <Text style={styles.version}>APP VERSION 1.2</Text>
      </ScrollView>

      <CommonModal
        visible={deleteVisible}
        icon="🗑️"
        title="Delete Account"
        subtitle="This action cannot be undone. Are you sure you want to delete your account?"
        cancelText="Cancel"
        confirmText="Delete"
        loading={deleteLoading}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAccount}
      />
    </SafeAreaView>

  );
};

export default PatientDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,

    // paddingBottom:80,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
    backgroundColor: "#FDFDFB"
  },
  container: {
    // padding: 18,
    // paddingHorizontal:20,
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
    // padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.BGIcon,
    borderRadius: 16,
    flexDirection: 'row',
    // alignItems: 'flex-start',
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