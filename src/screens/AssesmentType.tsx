import React, { useEffect, useState } from 'react';
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
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as _ASSESS_SERVICE from '../services/AssesmentService';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { showSuccessToast } from '../config/Key';
import TablerIcon, { TablerIconName } from '../components/TablerIcon';
import PrakritiNoteModal from '../components/Questionnaire/PrakritiNoteModal';
import { markAsGuest } from '../services/guestAuth';
import { resetRootToHomeStack } from '../navigation/navigationUtils';

const { width } = Dimensions.get('window');

const scale = (size: number) => {
  const next = (width / 375) * size;
  return Math.min(Math.max(next, size * 0.92), size * 1.12);
};

/** Same green theme as AccessMode / onboarding hero */
const GREEN = '#0D614E';
const GREEN_DEEP = '#0A4F40';
const GREEN_MID = '#0F6B58';
const CARD_GRADIENT: [string, string, string] = [GREEN_DEEP, GREEN, GREEN_MID];
const HERO_GRADIENT: [string, string, string] = [GREEN_DEEP, GREEN, GREEN_MID];

type CardProps = {
  title: string;
  subtitle: string;
  cta: string;
  meta: string;
  metaIcon?: TablerIconName;
  icon: TablerIconName;
  onPress: () => void;
};

const AssessmentCard = ({
  title,
  subtitle,
  cta,
  meta,
  metaIcon,
  icon,
  onPress,
}: CardProps) => (
  <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.cardWrap}>
    <LinearGradient
      colors={CARD_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <TablerIcon name={icon} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.metaPill}>
          {metaIcon ? (
            <TablerIcon name={metaIcon} size={12} color="#FFFFFF" />
          ) : null}
          <Text style={styles.metaPillText}>{meta}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>

      <View style={styles.cardCtaRow}>
        <Text style={styles.cardCtaText}>{cta}</Text>
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
  const [prakritiNoteVisible, setPrakritiNoteVisible] = useState(false);

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

  const startPrakriti = () => {
    setPrakritiNoteVisible(false);
    props.navigation.navigate('PatientFAQ', {
      allowBack: true,
      noteSeen: true,
      allowIncompleteProfile: true,
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DEEP} />
      <LinearGradient
        colors={HERO_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBg}
      >
        {/* Decorative leaf — same motif as design mock */}
        <Image
          source={Images.leaf1}
          style={styles.heroLeaf}
          resizeMode="contain"
        />
        <Image
          source={Images.leaf2}
          style={styles.heroLeafAlt}
          resizeMode="contain"
        />

        <SafeAreaView edges={['top']} style={styles.heroSafe}>
          <View style={styles.hero}>
            <View style={styles.stepRow}>
              <View style={styles.stepPill}>
                <Text style={styles.stepPillText}>Step 2 of 2</Text>
              </View>
              <TouchableOpacity onPress={handleSkip} hitSlop={10}>
                <Text style={styles.skipLink}>Skip</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.heroTitle}>Discover what your{'\n'}body needs</Text>
            <Text style={styles.heroSubtitle}>
              Two quick assessments for care that's truly yours.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={[
            styles.sheetContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {showPrakriti && (
            <AssessmentCard
              title="What's your natural body type?"
              subtitle="Discover the patterns you were born with."
              cta="Find my Prakriti"
              meta="~5 min"
              icon="chart-pie"
              onPress={() => setPrakritiNoteVisible(true)}
            />
          )}

          {showMedical && (
            <AssessmentCard
              title="What has changed in your body?"
              subtitle="See how your health and lifestyle affect you today."
              cta="Check my current state"
              meta="Secure"
              metaIcon="lock"
              icon="stethoscope"
              onPress={() => props.navigation.navigate('MedicalHistory')}
            />
          )}

          <View style={styles.whyBox}>
            <View style={styles.whyIcon}>
              <TablerIcon name="alert-circle" size={18} color={GREEN} />
            </View>
            <Text style={styles.whyText}>
              <Text style={styles.whyBold}>Why complete both? </Text>
              Your natural type + current state help us personalize your care.
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
      </View>

      <PrakritiNoteModal
        visible={prakritiNoteVisible}
        onClose={() => setPrakritiNoteVisible(false)}
        onBegin={startPrakriti}
      />
    </View>
  );
};

export default AssessmentType;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  heroBg: {
    paddingBottom: 28,
    overflow: 'hidden',
  },
  heroLeaf: {
    position: 'absolute',
    right: -28,
    top: 36,
    width: 190,
    height: 190,
    opacity: 0.22,
    tintColor: '#FFFFFF',
  },
  heroLeafAlt: {
    position: 'absolute',
    right: 8,
    top: 88,
    width: 120,
    height: 120,
    opacity: 0.14,
    tintColor: '#FFFFFF',
  },
  heroSafe: {
    backgroundColor: 'transparent',
  },
  hero: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 8,
    zIndex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  stepPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.2,
  },
  skipLink: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
  },
  heroTitle: {
    fontSize: scale(28),
    lineHeight: scale(34),
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    maxWidth: '78%',
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: scale(14),
    lineHeight: scale(21),
    color: 'rgba(255,255,255,0.86)',
    fontFamily: Fonts.PoppinsRegular,
    maxWidth: '72%',
  },
  sheet: {
    flex: 1,
    marginTop: -18,
    backgroundColor: '#F4F7F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#0A4F40',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 },
      },
      android: { elevation: 6 },
    }),
  },
  sheetContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    gap: 14,
  },
  cardWrap: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    padding: 18,
    minHeight: 158,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  metaPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  cardTitle: {
    fontSize: scale(18),
    lineHeight: scale(24),
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: scale(13),
    lineHeight: scale(19),
    color: 'rgba(255,255,255,0.86)',
    fontFamily: Fonts.PoppinsRegular,
  },
  cardCtaRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  whyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7E5E0',
  },
  whyIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyText: {
    flex: 1,
    color: '#475569',
    fontSize: scale(12),
    lineHeight: scale(18),
    fontFamily: Fonts.PoppinsRegular,
  },
  whyBold: {
    color: GREEN,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  skipBtn: {
    marginTop: 2,
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: GREEN,
  },
  skipBtnText: {
    color: GREEN,
    fontSize: scale(14),
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
