import React, { useMemo, useState } from 'react';
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

const SettingsScreen = (props: any) => {
  const navigation = props.navigation;

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

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
          {
            title: 'Email Updates',
            subtitle: 'Monthly reports and newsletters',
            iconName: 'mail',
            type: 'toggle',
            value: emailEnabled,
          },
        ] as SettingItemData[],
      },
      {
        section: 'SECURITY & PRIVACY',
        data: [
          {
            title: 'Biometric Lock',
            subtitle: 'Use Face ID or fingerprint',
            iconName: 'shield',
            type: 'toggle',
            value: biometricEnabled,
          },
          {
            title: 'Privacy Policy',
            subtitle: 'How we handle your medical data',
            iconName: 'shield',
            type: 'arrow',
            screen: 'TermsCondition',
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
            title: 'Help Center',
            subtitle: 'FAQs and contact information',
            iconName: 'help',
            type: 'arrow',
            screen: 'HelpCenterScreen',
          },
          {
            title: 'FAQ',
            subtitle: 'Common questions answered',
            iconName: 'help',
            type: 'arrow',
            screen: 'HelpCenterScreen',
          },
          {
            title: 'About Ayurmuni',
            subtitle: 'App version 1.0',
            iconName: 'help',
            type: 'arrow',
            onPress: () => {
              Alert.alert('Ayurmuni', 'Version 1.0\nYour Ayurvedic wellness companion.');
            },
          },
        ] as SettingItemData[],
      },
    ],
    [pushEnabled, emailEnabled, biometricEnabled],
  );

  const handleToggle = (title: string, value: boolean) => {
    if (title === 'Push Notifications') {
      setPushEnabled(value);
      if (value) {
        requestNotificationPermission(true).then(granted => {
          if (!granted) {
            setPushEnabled(false);
          }
        });
      } else {
        try {
          OneSignal.User.pushSubscription.optOut();
        } catch {
          // ignore
        }
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AppHeader
        title="Settings"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.content}>
          {settingsData.map((section, sectionIndex) => (
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
                      onToggle={value => handleToggle(item.title, value)}
                    />
                    {index < section.data.length - 1 && <View style={styles.divider} />}
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
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    backgroundColor: '#FDFDFB',
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
