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
  bullets: string[];
  icon: TablerIconName;
  accent: string;
  accentSoft: string;
  onPress: () => void;
};

const AssessmentCard = ({
  title,
  subtitle,
  bullets,
  icon,
  accent,
  accentSoft,
  onPress,
}: CardProps) => (
  <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
    <View style={[styles.iconBox, { backgroundColor: accentSoft }]}>
      <TablerIcon name={icon} size={24} color={accent} />
    </View>

    <View style={styles.cardBody}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>

      {bullets.map(item => (
        <View key={item} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: accent }]} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>

    <TablerIcon name="chevron-right" size={20} color="#94A3B8" />
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
      {
        text: 'Cancel',
        style: 'cancel',
      },
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
      const response: any = await _ASSESS_SERVICE.SkipAssesment({ is_skipped: true });

      if (!response?.success) {
        showSuccessToast(response?.message || 'Something went wrong', 'error');
        return;
      }

      // Skip keeps guest access — browse OK, actions still need full profile/prakriti
      await markAsGuest();
      resetRootToHomeStack(props.navigation, 'TabStack', { screen: 'Home' });
    } catch {
      showSuccessToast('Network Error', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#0D614E', '#14876A', '#1FA37D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.stepPill}>
          <Text style={styles.stepPillText}>Step 2 of 2</Text>
        </View>
        <Text style={styles.heroTitle}>Personalize Your Journey</Text>
        <Text style={styles.heroSubtitle}>
          Choose one path now, or skip and complete it later from your profile.
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {showPrakriti && (
          <AssessmentCard
            title="Prakriti Assessment"
            subtitle="Discover your Ayurvedic body type"
            bullets={['Vata, Pitta, Kapha insights', 'Personal wellness guidance', 'Takes about 5 minutes']}
            icon="chart-pie"
            accent={Colors.primaryColor}
            accentSoft="#E6F4F1"
            onPress={() => props.navigation.navigate('PatientFAQ')}
          />
        )}

        {showMedical && (
          <AssessmentCard
            title="Medical History"
            subtitle="Help doctors understand your background"
            bullets={['Past conditions & allergies', 'Upload reports securely', 'Better consultation outcomes']}
            icon="file-medical"
            accent="#059669"
            accentSoft="#E8F7F0"
            onPress={() => props.navigation.navigate('MedicalHistory')}
          />
        )}

        <View style={styles.tipBox}>
          <TablerIcon name="alert-circle" size={18} color={Colors.primaryColor} />
          <Text style={styles.tipText}>
            Completing both assessments improves product and doctor recommendations.
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity activeOpacity={0.9} style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AssessmentType;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF4F2',
  },
  hero: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  stepPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  stepPillText: {
    color: '#E8FFF8',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroTitle: {
    fontSize: scale(24),
    lineHeight: scale(32),
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: scale(13),
    lineHeight: scale(20),
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Fonts.PoppinsMedium,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4ECE8',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#0D614E',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: scale(16),
    lineHeight: scale(22),
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: scale(12),
    lineHeight: scale(18),
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bulletText: {
    flex: 1,
    fontSize: scale(12),
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F3FBF8',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CFE8DF',
    marginTop: 4,
  },
  tipText: {
    flex: 1,
    color: '#334155',
    fontSize: scale(12),
    lineHeight: scale(18),
    fontFamily: Fonts.PoppinsMedium,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#EEF4F2',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  skipBtn: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 14,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: Colors.white,
    fontSize: scale(15),
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
