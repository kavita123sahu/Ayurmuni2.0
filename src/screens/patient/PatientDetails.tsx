import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import PatientCard from './PatientCard';
import Header from '../../components/Header';
import EmptyState from '../../components/EmptyState';
import CommonButton from '../../components/CommonButton';
import CommonModal from '../../components/LogoutModal';
import SelectedPatientCard from './SelectedPatient'; // Create this component
import { Styles } from '../../common/Styles';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { Utils } from '../../common/Utils';
import { showSuccessToast } from '../../config/Key';
import { usePatientData } from '../../hooks/usePatientData';
import * as PROFILE_SERVICES from '../../services/ProfileServices';
import LoadingSpinner from '../../components/LoadingSpinner';

interface UserInterface {
  first_name: string;
  last_name: string;
  profile_picture: string;
  phone_number: string;
}

interface NavigationProps {
  navigation: any;
}

const PatientDetails: React.FC<NavigationProps> = ({ navigation }) => {
  // ─── State ─────────────────────────────────────────────────
  const [user, setUser] = useState<UserInterface | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Custom Hooks ──────────────────────────────────────────
  const {
    patients,
    loading: patientsLoading,
    fetchPatients,
    switchPatient,
  } = usePatientData();

  // ─── Memoized Values ───────────────────────────────────────
  const fullName = useMemo(
    () => `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(),
    [user?.first_name, user?.last_name]
  );

  const hasPatients = useMemo(() => patients.length > 0, [patients]);

  // ─── Data Fetching ─────────────────────────────────────────
  const fetchUserData = useCallback(async () => {
    try {
      const res = await PROFILE_SERVICES.user_profile();
      setUser(res?.data || null);
    } catch (error) {
      console.log('Profile Error:', error);
      showSuccessToast('Failed to load profile', 'error');
    }
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      await Promise.all([fetchPatients(), fetchUserData()]);
    } catch (error) {
      console.log('Load Data Error:', error);
      showSuccessToast('Failed to load data', 'error');
    }
  }, [fetchPatients, fetchUserData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadAllData();
    setIsRefreshing(false);
  }, [loadAllData]);

  // ─── Effects ───────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [loadAllData])
  );

  // ─── Handlers ──────────────────────────────────────────────
  const handleSelectPatient = useCallback(
    async (patientId: string) => {
      try {
        await switchPatient(patientId);
        await loadAllData();
        showSuccessToast('Patient switched successfully', 'success');
      } catch (error) {
        console.log('SWITCH PATIENT ERROR =>', error);
        showSuccessToast('Failed to switch patient', 'error');
      }
    },
    [switchPatient, loadAllData]
  );

  const handleAddPatient = useCallback(() => {
    navigation.navigate('AddEditPatientDetail', { mode: 'add' });
  }, [navigation]);

  const handleViewRecords = useCallback(() => {
    navigation.navigate('Records');
  }, [navigation]);

  const handleDeleteAccount = useCallback(async () => {
    try {
      setIsDeleting(true);
      const response = await PROFILE_SERVICES.deleteAccount();

      if (!response?.success) {
        showSuccessToast(response?.message || 'Failed to delete account', 'error');
        return;
      }

      await Promise.all([
        Utils.removeData('_TOKEN'),
        Utils.removeData('_REFRESH_TOKEN'),
        Utils.removeData('_USER_INFO'),
      ]);

      showSuccessToast(response?.message || 'Account deleted successfully', 'success');
      setDeleteModalVisible(false);

      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      });
    } catch (error) {
      console.log('DELETE ACCOUNT ERROR =>', error);
      showSuccessToast('Something went wrong', 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [navigation]);

  // ─── Loading State ─────────────────────────────────────────
  if (patientsLoading && !hasPatients) {
    return (
      <SafeAreaView style={[styles.safeArea,{paddingHorizontal:20}]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Header
          title="Patient Details"
          subtitle="Manage family profiles"
          backIcon={Images.backIcon}
          onBack={() => navigation.goBack()}
        />
        <LoadingSpinner message="Loading patients..." />
      </SafeAreaView>
    );
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={{paddingHorizontal:20}}>
        <Header
        title="Patient Details"
        subtitle="Manage family profiles"
        backIcon={Images.backIcon}
        onBack={() => navigation.goBack()}
      />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primaryColor]}
            tintColor={Colors.primaryColor}
          />
        }
      >
        {/* Currently Selected Section */}
        <View style={styles.section}>
          <Text style={Styles.sectionTitle}>CURRENTLY SELECTED</Text>
          <SelectedPatientCard
            name={fullName || "Not set"}
            phone={user?.phone_number || ""}
            relation="Self"
            navigation={""}
            image={user?.profile_picture || ""}
            onViewRecords={handleViewRecords}
          />
        </View>

        {/* Patient List Header */}
        <View style={styles.rowBetween}>
          <Text style={Styles.sectionTitle}>PATIENT LIST</Text>
          <TouchableOpacity onPress={handleAddPatient} activeOpacity={0.7}>
            <Text style={Styles.addBtn}>+ Add Patient</Text>
          </TouchableOpacity>
        </View>

        {/* Patient List */}
        <View style={styles.patientListContainer}>
          <FlatList
            data={patients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PatientCard
                patient={{
                  ...item,
                  selected: item?.is_active_profile,
                }}
                onSelect={() => handleSelectPatient(item.id)}
                navigation={navigation}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                image={Images.patient}
                title="No Patients Added"
                subtitle="Add your first patient to get started."
              />
            }
            scrollEnabled={false}
            removeClippedSubviews
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.iconCircle}>
            <Image source={Images.notification} style={styles.iconSize} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Switching Patients</Text>
            <Text style={styles.infoText}>
              Selecting a different family member will update your dashboard and
              appointments for that profile.
            </Text>
          </View>
        </View>

        {/* Delete Account Button */}
        <View style={styles.deleteButtonContainer}>
          <CommonButton title="Delete Account" onPress={() => setDeleteModalVisible(true)} />
        </View>

        {/* Version Text */}
        <Text style={styles.version}>APP VERSION 1.2</Text>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <CommonModal
        visible={deleteModalVisible}
        icon="🗑️"
        title="Delete Account"
        subtitle="This action cannot be undone. Are you sure you want to delete your account?"
        cancelText="Cancel"
        confirmText="Delete"
        loading={isDeleting}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteAccount}
      />
    </SafeAreaView>
  );
};

export default PatientDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FDFDFB',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 10,
  },
  patientListContainer: {
    marginBottom: 10,
  },
  infoBox: {
    paddingHorizontal: 25,
    paddingVertical: 35,
    backgroundColor: Colors.bgcolor,
    borderWidth: 1.5,
    borderColor: Colors.BGIcon,
    borderRadius: 16,
    flexDirection: 'row',
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
  iconSize: {
    height: 24,
    width: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.subTextColor,
    lineHeight: 14,
  },
  deleteButtonContainer: {
    position: 'relative',
    bottom: 10,
    top: 20,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: '#94A3B8',
    marginTop: 30,
    marginBottom: 30,
  },
});