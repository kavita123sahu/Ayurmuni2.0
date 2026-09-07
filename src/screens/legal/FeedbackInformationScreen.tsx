import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import SettingItem, { SettingItemData } from '../../components/SettingItem';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';

/** Flipkart-style Feedback & Information */
const FeedbackInformationScreen = (props: any) => {
  const navigation = props.navigation;

  const items: SettingItemData[] = [
    {
      title: 'Help Center',
      subtitle: 'FAQs and contact support',
      iconName: 'help',
      type: 'arrow',
      screen: 'HelpCenterScreen',
    },
    {
      title: 'Terms of Use',
      subtitle: 'Rules for using Ayurmuni',
      iconName: 'file-medical',
      type: 'arrow',
      onPress: () =>
        navigation.navigate('PolicyDetail', {
          policyType: 'terms_of_service',
          title: 'Terms of Use',
        }),
    },
    {
      title: 'Privacy Policy',
      subtitle: 'How we handle your data',
      iconName: 'shield',
      type: 'arrow',
      onPress: () =>
        navigation.navigate('PolicyDetail', {
          policyType: 'privacy_policy',
          title: 'Privacy Policy',
        }),
    },
    {
      title: 'Terms, Policies and Licenses',
      subtitle: 'All legal documents',
      iconName: 'receipt',
      type: 'arrow',
      screen: 'LegalPoliciesHub',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader
        title="Feedback & Information"
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Find help resources and Ayurmuni’s terms, policies and licenses.
        </Text>
        <View style={styles.card}>
          {items.map((item, index) => (
            <React.Fragment key={item.title}>
              <SettingItem item={item} navigation={navigation} />
              {index < items.length - 1 ? <View style={styles.divider} /> : null}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FeedbackInformationScreen;

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
  intro: {
    marginTop: 14,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
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
});
