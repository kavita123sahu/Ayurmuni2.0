import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { showSuccessToast } from '../config/Key';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TablerIcon from '../components/TablerIcon';
import AppHeader from '../components/AppHeader';
import { safeGoBack } from '../navigation/navigationUtils';

const POLICY_SECTIONS = [
  {
    title: '1. Information We Collect',
    body:
      'We collect information you provide during registration, consultations, orders, and health assessments. This may include name, contact details, medical history, prescriptions, and payment information required to deliver Ayurvedic care and wellness services.',
  },
  {
    title: '2. How We Use Your Data',
    body:
      'Your data is used to provide consultations, process orders, personalize recommendations, send appointment reminders, and improve app experience. We do not sell your personal or medical information to third parties.',
  },
  {
    title: '3. Medical Data Protection',
    body:
      'Health records, prescriptions, and consultation notes are stored securely and accessed only by authorized doctors and care teams involved in your treatment, unless you explicitly consent otherwise.',
  },
  {
    title: '4. Data Sharing',
    body:
      'We may share limited data with payment gateways, logistics partners, and technology providers strictly to operate the service. All partners are expected to follow appropriate confidentiality and security standards.',
  },
  {
    title: '5. Your Rights',
    body:
      'You may review, update, or request deletion of your account information from profile settings, subject to legal and medical record retention requirements.',
  },
  {
    title: '6. Contact',
    body:
      'For privacy-related questions, contact Ayurmuni support through the Help Center in the app.',
  },
];

const TermsCondition = (props: any) => {
  const agreed = props?.route?.params?.agreed;
  const isOnboardingFlow = agreed === false;
  const title = isOnboardingFlow ? 'Terms & Conditions' : 'Privacy Policy';


const insets = useSafeAreaInsets();
  const handleAgree = () => {
    showSuccessToast('Accepted Terms & Conditions', 'success');
    props.navigation.replace('HomeStack', { screen: 'Onboarding' });
  };

  const handleDisagree = () => {
    showSuccessToast('You need to accept terms to continue', 'error');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AppHeader
        title={title}
        onLeftPress={() => safeGoBack(props.navigation)}
      />

      <View style={styles.banner}>
        <View style={styles.bannerIconWrap}>
          <TablerIcon name="shield" size={22} color={Colors.primaryColor} />
        </View>
        <View style={styles.bannerTextWrap}>
          <Text style={styles.bannerTitle}>
            {isOnboardingFlow ? 'Welcome to Ayurmuni' : 'Your privacy matters'}
          </Text>
          <Text style={styles.bannerText}>
            {isOnboardingFlow
              ? 'Please read and accept the terms to continue.'
              : 'Learn how Ayurmuni protects your personal and medical information.'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {POLICY_SECTIONS.map(section => (
          <View key={section.title} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.text}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>

      {isOnboardingFlow ? (
        <View style={[styles.bottomContainer,{ paddingBottom: Math.max(insets.bottom, 16),}]}>
          <TouchableOpacity
            onPress={handleAgree}
            activeOpacity={0.85}
            style={styles.agreeBtn}
          >
            <Text style={styles.agreeText}>Agree</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDisagree} style={styles.disagreeBtn}>
            <Text style={styles.disagreeText}>Disagree</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default TermsCondition;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#EAF8F4',
    borderWidth: 1,
    borderColor: '#CFE8DF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  bannerText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
    fontFamily: Fonts.PoppinsRegular,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EDF2',
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: 6,
  },
  text: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsRegular,
    color: '#475569',
  },
   bottomContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
   
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EDF2',
  },
  // bottomContainer: {
  //   flexDirection: 'row',
  //   padding: 16,
  //   gap: 12,
  //   backgroundColor: '#FFFFFF',
  //   borderTopWidth: 1,
  //   borderTopColor: '#E8EDF2',
  // },
  agreeBtn: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disagreeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  agreeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  disagreeText: {
    color: Colors.primaryColor,
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
