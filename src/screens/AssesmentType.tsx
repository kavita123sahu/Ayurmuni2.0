import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  BackHandler,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../common/Colors';
import * as _ASSESS_SERVICE from '../services/AssesmentService';
import { Fonts } from '../common/Fonts';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { showSuccessToast } from '../config/Key';
import TablerIcon, { TablerIconName } from '../components/TablerIcon';
import { markAsGuest } from '../services/guestAuth';
import { resetRootToHomeStack } from '../navigation/navigationUtils';

const { width } = Dimensions.get('window');

const scale = (size: number) => {
  const next = (width / 375) * size;
  return Math.min(Math.max(next, size * 0.92), size * 1.12);
};

type CardProps = {
  title: string;
  subtitle: string;
  meta: string;
  icon: TablerIconName;
  gradient: string[];
  onPress: () => void;
};

const AssessmentCard = ({
  title,
  subtitle,
  meta,
  icon,
  gradient,
  onPress,
}: CardProps) => (
  <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.cardWrap}>
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <TablerIcon name={icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.metaPillText}>{meta}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>

      <View style={styles.cardCta}>
        <Text style={styles.cardCtaText}>Begin</Text>
        <TablerIcon name="arrow-right" size={16} color="#FFFFFF" />
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const AssessmentType = (props: any) => {
  const insets = useSafeAreaInsets();
  const { form = 'all' } = props?.route?.params || {};
  const showMedical = form === 'medical' || form === 'all';
  const showPrakriti = form === 'prakriti' || form === 'all';

  const handleBackPress = () => {
    Alert.alert(
      'Exit Assessment?',
      'Are you sure you want to exit the assessment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => BackHandler.exitApp(),
        },
      ],
    );
    return true;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => subscription.remove();
  }, []);

  const handleSkip = async () => {
    try {
      const response: any = await _ASSESS_SERVICE.SkipAssesment({
        is_skipped: true,
      });

      if (!response?.success) {
        showSuccessToast(response?.message || 'Something went wrong', 'error');
        return;
      }

      await markAsGuest();
      resetRootToHomeStack(props.navigation, 'TabStack', { screen: 'Home' });
    } catch {
      showSuccessToast('Network Error', 'error');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A3328" />
      <LinearGradient
        colors={['#0A3328', '#0F4A38', '#F5F8F6']}
        locations={[0, 0.42, 0.42]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.hero}>
          <View style={styles.stepRow}>
            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>Step 2 of 2</Text>
            </View>
            <TouchableOpacity onPress={handleSkip} hitSlop={10}>
              <Text style={styles.skipLink}>Skip</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>Personalize your care</Text>
          <Text style={styles.heroSubtitle}>
            Pick an assessment to tailor doctors, products, and daily guidance.
          </Text>
        </View>

        <ScrollView
          style={styles.sheet}
          contentContainerStyle={[
            styles.sheetContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 8 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {showPrakriti && (
            <AssessmentCard
              title="Prakriti Assessment"
              subtitle="Discover your Ayurvedic constitution — Vata, Pitta, Kapha — and get guidance that fits you."
              meta="~5 min"
              icon="chart-pie"
              gradient={['#0D614E', '#1A8F6E']}
              onPress={() =>
                props.navigation.navigate('PatientFAQ', { allowBack: false })
              }
            />
          )}

          {showMedical && (
            <AssessmentCard
              title="Current Body Type"
              subtitle="Share conditions, allergies, and reports so consultations start with the full picture."
              meta="Secure"
              icon="file-medical"
              gradient={['#0F4A38', '#157A58']}
              onPress={() => props.navigation.navigate('MedicalHistory')}
            />
          )}

          <View style={styles.tipBox}>
            <View style={styles.tipIcon}>
              <TablerIcon name="alert-circle" size={18} color={Colors.primaryColor} />
            </View>
            <Text style={styles.tipText}>
              Completing both unlocks sharper product and doctor recommendations.
              You can finish either path later from Profile.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.skipBtn}
            onPress={handleSkip}
          >
            <Text style={styles.skipBtnText}>Skip for now · Browse home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default AssessmentType;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F8F6',
  },
  safe: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 28,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
  },
  stepPillText: {
    color: '#E8FFF8',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.3,
  },
  skipLink: {
    color: 'rgba(247,243,234,0.75)',
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
  },
  heroTitle: {
    fontSize: scale(30),
    lineHeight: scale(36),
    color: '#F7F3EA',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: scale(14),
    lineHeight: scale(21),
    color: 'rgba(247,243,234,0.78)',
    fontFamily: Fonts.PoppinsRegular,
    maxWidth: 340,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#F5F8F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    gap: 14,
  },
  cardWrap: {
    borderRadius: 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0A3328',
        shadowOpacity: 0.14,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 4 },
    }),
  },
  card: {
    padding: 20,
    minHeight: 168,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaPill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  cardTitle: {
    fontSize: scale(20),
    lineHeight: scale(26),
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  cardSubtitle: {
    marginTop: 8,
    fontSize: scale(13),
    lineHeight: scale(19),
    color: 'rgba(255,255,255,0.86)',
    fontFamily: Fonts.PoppinsRegular,
  },
  cardCta: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.4,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2EBE6',
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8F3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    color: '#475569',
    fontSize: scale(12),
    lineHeight: scale(18),
    fontFamily: Fonts.PoppinsMedium,
  },
  skipBtn: {
    marginTop: 4,
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5DF',
  },
  skipBtnText: {
    color: Colors.primaryColor,
    fontSize: scale(14),
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
