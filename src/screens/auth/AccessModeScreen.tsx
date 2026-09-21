/**
 * Post-OTP entry — marketing welcome into profile setup (or Skip to home).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { AuthTheme } from '../../common/AuthTheme';
import { markAsGuest } from '../../services/guestAuth';
import { resetRootToHomeStack } from '../../navigation/navigationUtils';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import { store } from '../../store/store';
import { fetchHomeData } from '../../store/slices/homeSlice';

const GREEN = Colors.primaryColor;
const GREEN_DEEP = '#0A4F40';
const GREEN_MID = '#117A63';

const SHOWCASE: Array<{
  icon: TablerIconName;
  title: string;
  subtitle: string;
}> = [
  {
    icon: 'chart-pie',
    title: 'Prakriti',
    subtitle: 'Know your body type',
  },
  {
    icon: 'stethoscope',
    title: 'Doctors',
    subtitle: 'Matched to you',
  },
  {
    icon: 'package',
    title: 'Products',
    subtitle: 'Curated for you',
  },
  {
    icon: 'leaf',
    title: 'Daily care',
    subtitle: 'Diet & yoga tips',
  },
];

const AccessModeScreen = ({ navigation }: any) => {
  const { height: SH, width: SW } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = SH < 720;
  const [loading, setLoading] = useState<'skip' | 'onboard' | null>(null);
  const cardW = (SW - 40 - 10) / 2;

  const skipToHome = async () => {
    try {
      setLoading('skip');
      await markAsGuest();
      await store.dispatch(fetchHomeData(true));
      resetRootToHomeStack(navigation, 'TabStack', { screen: 'Home' });
    } finally {
      setLoading(null);
    }
  };

  const startOnboarding = async () => {
    try {
      setLoading('onboard');
      await markAsGuest();
      navigation.navigate('Onboarding');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DEEP} />

      {/* Hero — brand + marketing headline */}
      <LinearGradient
        colors={[GREEN_DEEP, GREEN, GREEN_MID]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, compact && styles.heroCompact]}
      >
        <Image
          source={Images.leaf1}
          style={styles.heroLeaf}
          resizeMode="contain"
        />
        <SafeAreaView edges={['top']} style={styles.heroSafe}>
          <View style={styles.topBar}>
            <View style={styles.verifiedChip}>
              <TablerIcon name="circle-check" size={12} color="#FFFFFF" />
              <Text style={styles.verifiedText}>Phone verified</Text>
            </View>
            <TouchableOpacity
              onPress={skipToHome}
              disabled={!!loading}
              hitSlop={10}
              style={styles.skipBtn}
            >
              {loading === 'skip' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.skipLink}>Skip</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.brandRow, compact && styles.brandRowCompact]}>
            <View style={[styles.logoRing, compact && styles.logoRingCompact]}>
              <Image
                source={Images.FinalLogo}
                style={[styles.logo, compact && styles.logoCompact]}
                resizeMode="contain"
              />
            </View>
            <View style={styles.brandCopy}>
              <Text style={styles.brandName}>Ayurmuni</Text>
              <Text style={styles.brandTag}>Ayurveda care, made personal</Text>
            </View>
          </View>

          <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>
            Your wellness,{'\n'}tuned to you
          </Text>
          <Text style={styles.heroSub}>
            Set up once — get doctors, products & routines shaped by your
            Prakriti.
          </Text>
        </SafeAreaView>
      </LinearGradient>

      {/* Sheet — showcase + CTA fills remaining space */}
      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, 14) },
        ]}
      >
        <View style={styles.sheetHandle} />

        <Text style={styles.sectionLabel}>WHAT YOU UNLOCK</Text>

        <View style={styles.grid}>
          {SHOWCASE.map(item => (
            <View key={item.title} style={[styles.featureCard, { width: cardW }]}>
              <LinearGradient
                colors={['#EAF8F4', '#F7FBFA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.featureInner}
              >
                <View style={styles.featureIcon}>
                  <TablerIcon name={item.icon} size={18} color={GREEN} />
                </View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureSub}>{item.subtitle}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        <View style={styles.trustRow}>
          {['Secure', 'Personalized', 'Ayurveda-first'].map(label => (
            <View key={label} style={styles.trustPill}>
              <View style={styles.trustDot} />
              <Text style={styles.trustText}>{label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          disabled={!!loading}
          onPress={startOnboarding}
          style={styles.ctaWrap}
        >
          <LinearGradient
            colors={AuthTheme.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            <View style={styles.ctaIcon}>
              <TablerIcon name="user" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.ctaCopy}>
              <Text style={styles.ctaTitle}>Set up my profile</Text>
              <Text style={styles.ctaSub}>
                Details & Prakriti · takes a few minutes
              </Text>
            </View>
            {loading === 'onboard' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.ctaArrow}>
                <TablerIcon name="arrow-right" size={16} color="#FFFFFF" />
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Skip anytime — you can finish setup later from Profile
        </Text>
      </View>
    </View>
  );
};

export default AccessModeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  hero: {
    paddingBottom: 36,
  },
  heroCompact: {
    paddingBottom: 28,
  },
  heroLeaf: {
    position: 'absolute',
    right: -20,
    top: 40,
    width: 160,
    height: 160,
    opacity: 0.12,
  },
  heroSafe: {
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    marginBottom: 16,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  verifiedText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  skipBtn: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  skipLink: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  brandRowCompact: {
    marginBottom: 12,
  },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
  logoRingCompact: {
    width: 64,
    height: 64,
    borderRadius: 20,
  },
  logo: {
    width: 48,
    height: 48,
  },
  logoCompact: {
    width: 42,
    height: 42,
  },
  brandCopy: {
    flex: 1,
    minWidth: 0,
  },
  brandName: {
    fontSize: 24,
    lineHeight: 30,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  brandTag: {
    marginTop: 2,
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: Fonts.PoppinsMedium,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroTitleCompact: {
    fontSize: 24,
    lineHeight: 30,
  },
  heroSub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.86)',
    fontFamily: Fonts.PoppinsRegular,
    maxWidth: 320,
  },

  sheet: {
    flex: 1,
    marginTop: -22,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0A4F40',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 },
      },
      android: { elevation: 8 },
    }),
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1DED8',
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: GREEN,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7E5E0',
  },
  featureInner: {
    padding: 12,
    minHeight: 96,
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7E5E0',
  },
  featureTitle: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  featureSub: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F8F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  trustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  trustText: {
    fontSize: 11,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
  },
  ctaWrap: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  ctaIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaCopy: {
    flex: 1,
    minWidth: 0,
  },
  ctaTitle: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  ctaSub: {
    marginTop: 2,
    fontSize: 11,
    color: 'rgba(255,255,255,0.88)',
    fontFamily: Fonts.PoppinsRegular,
  },
  ctaArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerNote: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
});
