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
import * as PATIENT_SERVICES from '../../services/PatientServices';
import LoadingSpinner from '../../components/LoadingSpinner';
import TablerIcon from '../../components/TablerIcon';

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
  const [patientDeleteTarget, setPatientDeleteTarget] = useState<{ id: string; name: string } | null>(null);
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

  const patientAvatarGroup = useMemo(() => {
    const colors = ['#CBD5E1', '#BAE6FD', '#BBF7D0', '#FDE68A', '#FBCFE8', '#DDD6FE'];

    return (patients ?? []).slice(0, 5).map((patient: any, index: number) => {
      const first = String(patient?.first_name ?? '').trim();
      const last = String(patient?.last_name ?? '').trim();
      const initials = `${first.charAt(0)}${last.charAt(0) || first.charAt(1) || ''}`.toUpperCase() || 'P';

      return {
        initials,
        color: colors[index % colors.length],
      };
    });
  }, [patients]);

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
    navigation.navigate('MedicalRecords');
  }, [navigation]);

  const handleDeletePatient = useCallback(async () => {
    if (!patientDeleteTarget?.id) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await PATIENT_SERVICES.deletePatientById(patientDeleteTarget.id);

      if (!response?.success) {
        showSuccessToast(response?.message || 'Failed to delete patient', 'error');
        return;
      }

      showSuccessToast(response?.message || 'Patient deleted successfully', 'success');
      setPatientDeleteTarget(null);
      await loadAllData();
    } catch (error) {
      console.log('DELETE PATIENT ERROR =>', error);
      showSuccessToast('Something went wrong', 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [patientDeleteTarget, loadAllData]);

  const handleDeleteAccount = useCallback(async () => {
    try {
      setIsDeleting(true);
      const response = await PROFILE_SERVICES.deleteAccount();
      console.log("deleteaccount", response);
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
      <SafeAreaView style={[styles.safeArea, { paddingHorizontal: 20 }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Header
          title="Patient Details"
          subtitle="Manage family profiles"
          onBack={() => navigation.goBack()}
          onRefreshPress={handleRefresh}
        />
        <LoadingSpinner message="Loading patients..." />
      </SafeAreaView>
    );
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={{ paddingHorizontal: 20 }}>
        <Header
          title="Patient Details"
          subtitle="Manage family profiles"
          onBack={() => navigation.goBack()}
          onRefreshPress={handleRefresh}
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

          <SelectedPatientCard
            name={fullName || "Not set"}
            phone={user?.phone_number || ""}
            relation="Self"
            navigation={navigation}
            image={user?.profile_picture || ""}
            avatarGroup={patientAvatarGroup}
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
                onDelete={patientId => {
                  const name = `${item?.first_name ?? ''} ${item?.last_name ?? ''}`.trim();
                  setPatientDeleteTarget({ id: patientId, name: name || 'this patient' });
                }}
                navigation={navigation}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                iconName="users"
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
            <TablerIcon name="bell" size={20} color={Colors.primaryColor} />
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
          <CommonButton title="Delete Account" onPress={() => {
            console.log("Button Pressed");
            setDeleteModalVisible(true)
          }} />
        </View>

        {/* Version Text */}
        <Text style={styles.version}>APP VERSION 1.0</Text>
      </ScrollView>

      {/* Delete Patient Modal */}
      <CommonModal
        visible={!!patientDeleteTarget}
        icon="🗑️"
        title="Delete Patient"
        subtitle={`Remove ${patientDeleteTarget?.name ?? 'this patient'} from your family list? This cannot be undone.`}
        cancelText="Cancel"
        confirmText="Delete"
        loading={isDeleting}
        onClose={() => setPatientDeleteTarget(null)}
        onConfirm={handleDeletePatient}
      />

      {/* Delete Account Modal */}
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


// import React, { useCallback, useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   FlatList,
//   ScrollView,
//   StatusBar,
//   RefreshControl,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect } from '@react-navigation/native';

// import PatientCard from './PatientCard';
// import Header from '../../components/Header';
// import EmptyState from '../../components/EmptyState';
// import CommonButton from '../../components/CommonButton';
// import CommonModal from '../../components/LogoutModal';
// import SelectedPatientCard from './SelectedPatient'; // Create this component
// import { Styles } from '../../common/Styles';
// import { Colors } from '../../common/Colors';
// import { Fonts } from '../../common/Fonts';
// import { Images } from '../../common/Images';
// import { Utils } from '../../common/Utils';
// import { showSuccessToast } from '../../config/Key';
// import { usePatientData } from '../../hooks/usePatientData';
// import * as PROFILE_SERVICES from '../../services/ProfileServices';
// import * as PATIENT_SERVICES from '../../services/PatientServices';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import TablerIcon from '../../components/TablerIcon';

// interface UserInterface {
//   first_name: string;
//   last_name: string;
//   profile_picture: string;
//   phone_number: string;
// }

// interface NavigationProps {
//   navigation: any;
// }

// const PatientDetails: React.FC<NavigationProps> = ({ navigation }) => {
//   // ─── State ─────────────────────────────────────────────────
//   const [user, setUser] = useState<UserInterface | null>(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [patientDeleteTarget, setPatientDeleteTarget] = useState<{ id: string; name: string } | null>(null);
//   // ─── Custom Hooks ──────────────────────────────────────────
//   const {
//     patients,
//     loading: patientsLoading,
//     fetchPatients,
//     switchPatient,
//   } = usePatientData();

//   // ─── Memoized Values ───────────────────────────────────────
//   const fullName = useMemo(
//     () => `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(),
//     [user?.first_name, user?.last_name]
//   );

//   const hasPatients = useMemo(() => patients.length > 0, [patients]);

//   const patientAvatarGroup = useMemo(() => {
//     const colors = ['#CBD5E1', '#BAE6FD', '#BBF7D0', '#FDE68A', '#FBCFE8', '#DDD6FE'];

//     return (patients ?? []).slice(0, 5).map((patient: any, index: number) => {
//       const first = String(patient?.first_name ?? '').trim();
//       const last = String(patient?.last_name ?? '').trim();
//       const initials = `${first.charAt(0)}${last.charAt(0) || first.charAt(1) || ''}`.toUpperCase() || 'P';

//       return {
//         initials,
//         color: colors[index % colors.length],
//       };
//     });
//   }, [patients]);

//   // ─── Data Fetching ─────────────────────────────────────────
//   const fetchUserData = useCallback(async () => {
//     try {
//       const res = await PROFILE_SERVICES.user_profile();
//       setUser(res?.data || null);
//     } catch (error) {
//       console.log('Profile Error:', error);
//       showSuccessToast('Failed to load profile', 'error');
//     }
//   }, []);

//   const loadAllData = useCallback(async () => {
//     try {
//       await Promise.all([fetchPatients(), fetchUserData()]);
//     } catch (error) {
//       console.log('Load Data Error:', error);
//       showSuccessToast('Failed to load data', 'error');
//     }
//   }, [fetchPatients, fetchUserData]);

//   const handleRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     await loadAllData();
//     setIsRefreshing(false);
//   }, [loadAllData]);

//   // ─── Effects ───────────────────────────────────────────────
//   useFocusEffect(
//     useCallback(() => {
//       loadAllData();
//     }, [loadAllData])
//   );

//   // ─── Handlers ──────────────────────────────────────────────
//   const handleSelectPatient = useCallback(
//     async (patientId: string) => {
//       try {
//         await switchPatient(patientId);
//         await loadAllData();
//         showSuccessToast('Patient switched successfully', 'success');
//       } catch (error) {
//         console.log('SWITCH PATIENT ERROR =>', error);
//         showSuccessToast('Failed to switch patient', 'error');
//       }
//     },
//     [switchPatient, loadAllData]
//   );

//   const handleAddPatient = useCallback(() => {
//     navigation.navigate('AddEditPatientDetail', { mode: 'add' });
//   }, [navigation]);

//   const handleViewRecords = useCallback(() => {
//     navigation.navigate('MedicalRecords');
//   }, [navigation]);

//   const handleDeletePatient = useCallback(async () => {
//     if (!patientDeleteTarget?.id) {
//       return;
//     }

//     try {
//       setIsDeleting(true);
//       const response = await PATIENT_SERVICES.deletePatientById(patientDeleteTarget.id);

//       if (!response?.success) {
//         showSuccessToast(response?.message || 'Failed to delete patient', 'error');
//         return;
//       }

//       showSuccessToast(response?.message || 'Patient deleted successfully', 'success');
//       setPatientDeleteTarget(null);
//       await loadAllData();
//     } catch (error) {
//       console.log('DELETE PATIENT ERROR =>', error);
//       showSuccessToast('Something went wrong', 'error');
//     } finally {
//       setIsDeleting(false);
//     }
//   }, [patientDeleteTarget, loadAllData]);

//   const handleDeleteAccount = useCallback(async () => {
//     try {
//       setIsDeleting(true);
//       const response = await PROFILE_SERVICES.deleteAccount();
//       console.log("deleteaccount", response);
//       if (!response?.success) {
//         showSuccessToast(response?.message || 'Failed to delete account', 'error');
//         return;
//       }

//       await Promise.all([
//         Utils.removeData('_TOKEN'),
//         Utils.removeData('_REFRESH_TOKEN'),
//         Utils.removeData('_USER_INFO'),
//       ]);

//       showSuccessToast(response?.message || 'Account deleted successfully', 'success');
//       setDeleteModalVisible(false);

//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'AuthStack' }],
//       });
//     } catch (error) {
//       console.log('DELETE ACCOUNT ERROR =>', error);
//       showSuccessToast('Something went wrong', 'error');
//     } finally {
//       setIsDeleting(false);
//     }
//   }, [navigation]);


//   // ─── Loading State ─────────────────────────────────────────
//   if (patientsLoading && !hasPatients) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { paddingHorizontal: 20 }]}>
//         <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
//         <Header
//           title="Patient Details"
//           subtitle="Manage family profiles"
//           onBack={() => navigation.goBack()}
//           onRefreshPress={handleRefresh}
//         />
//         <LoadingSpinner message="Loading patients..." />
//       </SafeAreaView>
//     );
//   }

//   // ─── Render ────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

//       <View style={{ paddingHorizontal: 20 }}>
//         <Header
//           title="Patient Details"
//           subtitle="Manage family profiles"
//           onBack={() => navigation.goBack()}
//           onRefreshPress={handleRefresh}
//         />
//       </View>

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.container}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={handleRefresh}
//             colors={[Colors.primaryColor]}
//             tintColor={Colors.primaryColor}
//           />
//         }
//       >
//         {/* Currently Selected Section */}
//         <View style={styles.section}>
          
//           <SelectedPatientCard
//             name={fullName || "Not set"}
//             phone={user?.phone_number || ""}
//             relation="Self"
//             navigation={navigation}
//             image={user?.profile_picture || ""}
//             avatarGroup={patientAvatarGroup}
//             onViewRecords={handleViewRecords}
//           />
//         </View>

//         {/* Patient List Header */}
//         <View style={styles.rowBetween}>
//           <Text style={Styles.sectionTitle}>PATIENT LIST</Text>
//           <TouchableOpacity onPress={handleAddPatient} activeOpacity={0.7}>
//             <Text style={Styles.addBtn}>+ Add Patient</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Patient List */}
//         <View style={styles.patientListContainer}>
//           <FlatList
//             data={patients}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <PatientCard
//                 patient={{
//                   ...item,
//                   selected: item?.is_active_profile,
//                 }}
//                 onSelect={() => handleSelectPatient(item.id)}
//                 onDelete={patientId => {
//                   const name = `${item?.first_name ?? ''} ${item?.last_name ?? ''}`.trim();
//                   setPatientDeleteTarget({ id: patientId, name: name || 'this patient' });
//                 }}
//                 navigation={navigation}
//               />
//             )}
//             ListEmptyComponent={
//               <EmptyState
//                 iconName="users"
//                 title="No Patients Added"
//                 subtitle="Add your first patient to get started."
//               />
//             }
//             scrollEnabled={false}
//             removeClippedSubviews
//             initialNumToRender={5}
//             maxToRenderPerBatch={5}
//             windowSize={5}
//           />
//         </View>

//         {/* Info Box */}
//         <View style={styles.infoBox}>
//           <View style={styles.iconCircle}>
//             <TablerIcon name="bell" size={20} color={Colors.primaryColor} />
//           </View>
//           <View style={styles.infoContent}>
//             <Text style={styles.infoTitle}>Switching Patients</Text>
//             <Text style={styles.infoText}>
//               Selecting a different family member will update your dashboard and
//               appointments for that profile.
//             </Text>
//           </View>
//         </View>

//         {/* Delete Account Button */}
//         <View style={styles.deleteButtonContainer}>
//           <CommonButton title="Delete Account" onPress={() => {
//             console.log("Button Pressed");
//             setDeleteModalVisible(true)
//           }} />
//         </View>

//         {/* Version Text */}
//         <Text style={styles.version}>APP VERSION 1.0</Text>
//       </ScrollView>

//       {/* Delete Patient Modal */}
//       <CommonModal
//         visible={!!patientDeleteTarget}
//         icon="🗑️"
//         title="Delete Patient"
//         subtitle={`Remove ${patientDeleteTarget?.name ?? 'this patient'} from your family list? This cannot be undone.`}
//         cancelText="Cancel"
//         confirmText="Delete"
//         loading={isDeleting}
//         onClose={() => setPatientDeleteTarget(null)}
//         onConfirm={handleDeletePatient}
//       />

//       {/* Delete Account Modal */}
//       <CommonModal
//         visible={deleteModalVisible}
//         icon="🗑️"
//         title="Delete Account"
//         subtitle="This action cannot be undone. Are you sure you want to delete your account?"
//         cancelText="Cancel"
//         confirmText="Delete"
//         loading={isDeleting}
//         onClose={() => setDeleteModalVisible(false)}
//         onConfirm={handleDeleteAccount}
//       />
//     </SafeAreaView>
//   );
// };

// export default PatientDetails;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   scroll: {
//     flex: 1,
//     backgroundColor: '#FDFDFB',
//   },
//   container: {
//     paddingHorizontal: 20,
//     paddingBottom: 32,
//   },
//   section: {
//     marginTop: 4,
//     marginBottom: 12,
//   },
//   rowBetween: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//     marginTop: 4,
//   },
//   patientListContainer: {
//     marginBottom: 10,
//   },
//   infoBox: {
//     paddingHorizontal: 25,
//     paddingVertical: 35,
//     backgroundColor: Colors.bgcolor,
//     borderWidth: 1.5,
//     borderColor: Colors.BGIcon,
//     borderRadius: 16,
//     flexDirection: 'row',
//     gap: 16,
//   },
//   iconCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//     backgroundColor: Colors.BGIcon,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   iconSize: {
//     height: 24,
//     width: 24,
//   },
//   infoContent: {
//     flex: 1,
//   },
//   infoTitle: {
//     fontSize: 16,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: Colors.primaryColor,
//     marginBottom: 2,
//   },
//   infoText: {
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsMedium,
//     color: Colors.subTextColor,
//     lineHeight: 14,
//   },
//   deleteButtonContainer: {
//     position: 'relative',
//     bottom: 10,
//     top: 20,
//   },
//   version: {
//     textAlign: 'center',
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#94A3B8',
//     marginTop: 30,
//     marginBottom: 30,
//   },
// });