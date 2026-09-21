import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import { Colors } from '../common/Colors';

import DashboardCard from './DashboardCard';
import { useProfileDashboardStats } from '../hooks/useProfileDashboardStats';
import TablerIcon from './TablerIcon';
import DiseaseSelectionModal from './DiseaseSelectionModal';
import { getServiceCategoryId } from '../utils/serviceCategoryUtils';
import { useHomeData } from '../hooks/UseHomeData';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const resolveDiseaseList = (user: any): { id: string; name: string }[] => {
  const list = Array.isArray(user?.health_diseases) ? user.health_diseases : [];
  return list
    .map((item: any) => {
      if (typeof item === 'string') {
        return { id: item, name: item };
      }
      const id = String(item?.id ?? item?.health_disease_id ?? '').trim();
      const name = String(item?.name ?? item?.title ?? '').trim();
      if (!id && !name) return null;
      return { id: id || name, name: name || id };
    })
    .filter(Boolean) as { id: string; name: string }[];
};

const ProfileHeader = ({ user, navigation, onUserUpdated }: any) => {
  const insets = useSafeAreaInsets();
  const [loading] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  const { stats: dashboardStats, refresh: refreshDashboardStats } =
    useProfileDashboardStats();
  const { categories, fetchCustomerData } = useHomeData();
  const medicineCategoryId = useMemo(
    () => getServiceCategoryId(categories, 'medicine'),
    [categories],
  );

  const stackNav = navigation?.getParent?.() || navigation;

  const diseases = useMemo(() => resolveDiseaseList(user), [user]);
  const selectedDiseaseIds = useMemo(
    () => diseases.map(d => d.id).filter(Boolean),
    [diseases],
  );

  const dashboardData = useMemo(
    () =>
      dashboardStats.map(stat => {
        let onPress: (() => void) | undefined;

        switch (stat.label) {
          case 'CONSULTS':
            onPress = () => stackNav?.navigate?.('Appointments');
            break;
          case 'ORDERS':
            onPress = () => stackNav?.navigate?.('OrderHistory');
            break;
          case 'REPORTS':
            onPress = () => stackNav?.navigate?.('MedicalRecords');
            break;
          default:
            break;
        }

        return { ...stat, onPress };
      }),
    [dashboardStats, stackNav],
  );

  useFocusEffect(
    useCallback(() => {
      refreshDashboardStats(false);
    }, [refreshDashboardStats]),
  );

  useEffect(() => {
    if (user?.profile_picture) {
      setProfileImage(user.profile_picture);
    } else {
      setProfileImage('');
    }
  }, [user]);

  const firstLetter = user?.first_name?.charAt(0)?.toUpperCase() || 'U';
  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

  const onDiseaseSaved = async (saved: boolean) => {
    setShowDiseaseModal(false);
    if (!saved) return;
    try {
      await fetchCustomerData?.(true);
    } catch {
      // ignore
    }
    onUserUpdated?.();
  };

  const openPhotoViewer = useCallback(() => {
    setShowPhotoViewer(true);
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Image source={Images.leaf1} style={styles.leafLeft} />
        <Image source={Images.leaf2} style={styles.leafRight} />

        <View style={styles.avatarBgWrapper}>
          <ImageBackground
            source={Images.BackgroundImage}
            style={styles.avatarBg}
            imageStyle={{ borderRadius: 100 }}
          >
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={openPhotoViewer}
              activeOpacity={0.9}
              accessibilityRole="imagebutton"
              accessibilityLabel="View profile photo"
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.initialWrapper}>
                  <Text style={styles.initialText}>{firstLetter}</Text>
                </View>
              )}

              {loading ? (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : null}
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {displayName ? `Hi, ${displayName.split(' ')[0]}!` : 'Hi there!'}
        </Text>

        <Text style={styles.info}>
          +91 {user?.phone_number?.slice(-10)}
          {user?.email ? ` · ${user.email}` : ''}
        </Text>

        <View style={styles.personalCard}>
          <View style={styles.personalHeader}>
            <View style={styles.personalTitleRow}>
              <View style={styles.personalIcon}>
                <TablerIcon
                  name="heart-handshake"
                  size={14}
                  color={Colors.primaryColor}
                />
              </View>
              <Text style={styles.personalTitle}>Health concerns</Text>
            </View>
          </View>

          <View style={styles.personalRow}>
            <View style={styles.personalBlock}>
              {diseases.length ? (
                <View style={styles.chipWrap}>
                  {diseases.slice(0, 4).map(item => (
                    <View key={item.id} style={styles.concernChip}>
                      <Text style={styles.concernChipText} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                  ))}
                  {diseases.length > 4 ? (
                    <View style={styles.concernChip}>
                      <Text style={styles.concernChipText}>
                        +{diseases.length - 4}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                <Text style={styles.personalValue} numberOfLines={2}>
                  Add concerns to personalize care
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.editChip}
              onPress={() => setShowDiseaseModal(true)}
              activeOpacity={0.85}
            >
              <TablerIcon name="edit" size={12} color={Colors.primaryColor} />
              <Text style={styles.editChipText}>
                {diseases.length ? 'Edit' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <DashboardCard data={dashboardData} />
      </View>

      <DiseaseSelectionModal
        visible={showDiseaseModal}
        serviceCategoryId={medicineCategoryId}
        initialSelectedIds={selectedDiseaseIds}
        title="Update health concerns"
        subtitle="Personalize doctors, diet & products"
        onClose={() => {}}
        onDone={onDiseaseSaved}
      />

      <Modal
        visible={showPhotoViewer}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoViewer(false)}
        statusBarTranslucent
      >
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Pressable
          style={styles.viewerBackdrop}
          onPress={() => setShowPhotoViewer(false)}
        >
          <View style={[styles.viewerTopBar, { paddingTop: insets.top + 8 }]}>
            <Text style={styles.viewerName} numberOfLines={1}>
              {displayName || 'Profile photo'}
            </Text>
            <TouchableOpacity
              onPress={() => setShowPhotoViewer(false)}
              hitSlop={12}
              style={styles.viewerClose}
            >
              <TablerIcon name="x" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Pressable style={styles.viewerBody} onPress={() => {}}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.viewerFallback}>
                <Text style={styles.viewerFallbackText}>{firstLetter}</Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default React.memo(ProfileHeader);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  leafLeft: {
    position: 'absolute',
    top: 8,
    left: 10,
    width: 44,
    height: 44,
    tintColor: Colors.secondaryColor,
    resizeMode: 'contain',
    opacity: 0.4,
  },
  leafRight: {
    position: 'absolute',
    top: 48,
    right: 5,
    width: 44,
    height: 44,
    tintColor: Colors.secondaryColor,
    resizeMode: 'contain',
    opacity: 0.4,
  },
  avatarBgWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -6,
  },
  avatarBg: {
    padding: 16,
    height: 96,
    width: 140,
    borderRadius: 80,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDEBE8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  initialWrapper: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 26,
    color: '#fff',
    fontFamily: Fonts.PoppinsBold,
  },
  loaderOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    flexShrink: 1,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1A1A1A',
  },
  info: {
    fontSize: 12,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 10,
  },
  personalCard: {
    width: '100%',
    backgroundColor: '#F4FAF7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8EBE4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  personalHeader: {
    marginBottom: 10,
  },
  personalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personalIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalTitle: {
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  personalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  personalBlock: {
    flex: 1,
    minWidth: 0,
  },
  personalValue: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8EBE4',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editChipText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  concernChip: {
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8EBE4',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  concernChipText: {
    fontSize: 11,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  viewerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  viewerName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    marginRight: 12,
  },
  viewerClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  viewerBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  viewerImage: {
    width: SCREEN_W,
    height: SCREEN_H * 0.7,
  },
  viewerFallback: {
    width: Math.min(SCREEN_W * 0.72, 280),
    height: Math.min(SCREEN_W * 0.72, 280),
    borderRadius: Math.min(SCREEN_W * 0.36, 140),
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerFallbackText: {
    fontSize: 96,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsBold,
  },
});
