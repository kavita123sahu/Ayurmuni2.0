import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '../../common/Fonts';
import AppHeader from '../../components/AppHeader';
import SettingItem, { SettingItemData } from '../../components/SettingItem';
import { Colors } from '../../common/Colors';
import PrimaryButton from '../../components/PrimaryButton';
import { Fontisto } from '../../common/Vector';
import { Utils } from '../../common/Utils';
import { showSuccessToast } from '../../config/Key';
import { OneSignal } from 'react-native-onesignal';
import {
  logoutOneSignalUser,
  requestNotificationPermission,
} from '../../services/pushNotificationService';
import { update_Profile } from '../../services/ProfileServices';
import { useCustomerProfile } from '../../hooks/useCustomerProfile';
import { useAppDispatch } from '../../store/hooks';
import { fetchCustomerData } from '../../store/slices/homeSlice';
import { invalidateCache } from '../../services/apiCache';
import { SCREEN_THEME } from '../../constants/screenTheme';
import { markThrottledRun } from '../../utils/fetchThrottle';

const readNotificationEnabled = (customer: any): boolean => {
  const value =
    customer?.is_notification_enabled ??
    customer?.notification_enabled ??
    customer?.push_notification_enabled;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const key = value.trim().toLowerCase();
    return key === 'true' || key === '1' || key === 'yes';
  }
  return false;
};

const SettingsScreen = (props: any) => {
  const navigation = props.navigation;
  const dispatch = useAppDispatch();
  // Single path: hydrate from Redux; refresh on focus only if cache is stale
  const { customerData } = useCustomerProfile({
    refreshOnFocus: true,
  });

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSaving, setPushSaving] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    setPushEnabled(readNotificationEnabled(customerData));
  }, [customerData]);

  const settingsData = useMemo(
    () => [
      {
        section: 'ACCOUNT',
        data: [
          {
            title: 'Edit Profile',
            subtitle: 'Name, email, phone number',
            iconName: 'user',
            type: 'arrow',
            screen: 'EditProfile',
          },
          {
            title: 'Patient Details',
            subtitle: 'Manage family profiles',
            iconName: 'users',
            type: 'arrow',
            screen: 'PatientDetails',
          },
          {
            title: 'Saved Address',
            subtitle: 'Delivery locations',
            iconName: 'map-pin',
            type: 'arrow',
            screen: 'ManageAdrees',
          },
          {
            title: 'My Rewards',
            subtitle: 'Coupons, referrals and reward offers',
            iconName: 'trophy',
            type: 'arrow',
            screen: 'Rewards',
          },
        ] as SettingItemData[],
      },
      {
        section: 'NOTIFICATIONS',
        data: [
          {
            title: 'Push Notifications',
            subtitle: 'Alerts for appointments & orders',
            icon: <Fontisto name="bell" />,
            type: 'toggle',
            value: pushEnabled,
          },
          {
            title: 'Notification Center',
            subtitle: 'View all alerts',
            iconName: 'bell',
            type: 'arrow',
            screen: 'Notifications',
          },
        ] as SettingItemData[],
      },
      {
        section: 'SECURITY & PRIVACY',
        data: [
          {
            title: 'Privacy Center',
            subtitle: 'Privacy policy and data controls',
            iconName: 'shield',
            type: 'arrow',
            screen: 'PrivacyCenter',
          },
          {
            title: 'Payments',
            subtitle: 'Saved payment methods',
            iconName: 'credit-card',
            type: 'arrow',
            screen: 'PaymentsScreen',
          },
        ] as SettingItemData[],
      },
      {
        section: 'SUPPORT',
        data: [
          {
            title: 'FAQ',
            subtitle: 'Common questions answered',
            iconName: 'help',
            type: 'arrow',
            screen: 'HelpCenterScreen',
          },
          {
            title: 'Feedback & Information',
            subtitle: 'Terms, policies and licenses',
            iconName: 'file-medical',
            type: 'arrow',
            screen: 'FeedbackInformation',
          },
          {
            title: 'About Ayurmuni',
            subtitle: 'App version 1.0',
            iconName: 'help',
            type: 'arrow',
            onPress: () => {
              Alert.alert(
                'Ayurmuni',
                'Version 1.0\nYour Ayurvedic wellness companion.',
              );
            },
          },
        ] as SettingItemData[],
      },
    ],
    [pushEnabled, emailEnabled, biometricEnabled],
  );

  const persistNotificationPreference = useCallback(
    async (enabled: boolean) => {
      const response = await update_Profile({
        is_notification_enabled: enabled,
      });
      if (response?.success === false) {
        throw new Error(response?.message || 'Unable to update notification preference');
      }
      invalidateCache('home_customer');
      markThrottledRun('customer-profile-focus');
      await dispatch(fetchCustomerData(true));
    },
    [dispatch],
  );

  const handleToggle = async (title: string, value: boolean) => {
    if (title === 'Push Notifications') {
      if (pushSaving) return;
      const previous = pushEnabled;
      setPushEnabled(value);
      setPushSaving(true);
      try {
        if (value) {
          const granted = await requestNotificationPermission(true);
          if (!granted) {
            setPushEnabled(false);
            await persistNotificationPreference(false);
            showSuccessToast('Notification permission is required', 'error');
            return;
          }
          try {
            OneSignal.User.pushSubscription.optIn();
          } catch {
            // ignore OneSignal errors
          }
          await persistNotificationPreference(true);
        } else {
          try {
            OneSignal.User.pushSubscription.optOut();
          } catch {
            // ignore
          }
          await persistNotificationPreference(false);
        }
      } catch (error: any) {
        setPushEnabled(previous);
        showSuccessToast(
          error?.message || 'Unable to update push notifications',
          'error',
        );
      } finally {
        setPushSaving(false);
      }
      return;
    }
    if (title === 'Email Updates') {
      setEmailEnabled(value);
      return;
    }
    if (title === 'Biometric Lock') {
      setBiometricEnabled(value);
    }
  };

  const handleSignOut = async () => {
    logoutOneSignalUser();
    await Utils.clearAllData();
    showSuccessToast('Signed out successfully', 'success');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={SCREEN_THEME.statusBarStyle}
        backgroundColor={SCREEN_THEME.statusBarBackground}
      />

      <AppHeader
        title="Settings"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.content}>
          {settingsData.map(section => (
            <View key={section.section} style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>{section.section}</Text>

              <View style={styles.card}>
                {section.data.map((item, index) => (
                  <React.Fragment key={`${section.section}-${item.title}`}>
                    <SettingItem
                      item={item}
                      navigation={navigation}
                      enabled={
                        item.title === 'Push Notifications'
                          ? pushEnabled
                          : item.title === 'Email Updates'
                            ? emailEnabled
                            : item.title === 'Biometric Lock'
                              ? biometricEnabled
                              : false
                      }
                      onToggle={toggleValue => handleToggle(item.title, toggleValue)}
                    />
                    {index < section.data.length - 1 ? (
                      <View style={styles.divider} />
                    ) : null}
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.signOutWrap}>
            <PrimaryButton
              title="Sign Out"
              iconName="logout"
              backgroundColor="#FEF2F2"
              textColor={Colors.errorColor}
              TextFont={Fonts.PoppinsMedium}
              onPress={handleSignOut}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_THEME.headerBackground,
  },
  scroll: {
    backgroundColor: SCREEN_THEME.screenBackground,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  sectionWrap: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  divider: {
    height: 1,
    marginHorizontal: 4,
    backgroundColor: Colors.borderColor,
  },
  signOutWrap: {
    marginTop: 32,
    marginBottom: 16,
  },
});
