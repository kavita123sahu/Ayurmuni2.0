/**
 * Post-OTP entry — marketing welcome into profile setup (or Skip to home).
 * Fully responsive across phone widths / short screens / landscape.
 */
import React, { useEffect, useMemo, useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { AuthTheme } from '../../common/AuthTheme';
import {
  isProfileComplete,
  markAsGuest,
  resolveAccessLikeProfile,
  signOutToChangeNumber,
} from '../../services/guestAuth';
import { resetRootToHomeStack } from '../../navigation/navigationUtils';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import { store } from '../../store/store';
import { fetchHomeData } from '../../store/slices/homeSlice';
import { Utils } from '../../common/Utils';
import CommonModal from '../../components/LogoutModal';

/** `pointerEvents` is supported on Image at runtime but missing from ImageProps. */
const IGNORE_TOUCHES = { pointerEvents: 'none' } as {};

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

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const AccessModeScreen = ({ navigation }: any) => {
  const { height: SH, width: SW } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<'skip' | 'onboard' | 'signout' | null>(
    null,
  );
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [signOutVisible, setSignOutVisible] = useState(false);

  const metrics = useMemo(() => {
    const landscape = SW > SH;
    const narrow = SW < 360;
    const short = SH < 700 || landscape;
    const hPad = narrow ? 14 : SW < 400 ? 16 : 20;
    const gap = narrow ? 8 : 10;
    const cols = landscape && SW >= 700 ? 4 : 2;
    const cardW = (SW - hPad * 2 - gap * (cols - 1)) / cols;
    const scale = clamp(SW / 390, 0.88, 1.08);

    return {
      landscape,
      narrow,
      short,
      hPad,
      gap,
      cols,
      cardW,
      scale,
      logoRing: Math.round((short ? 56 : 72) * scale),
      logo: Math.round((short ? 36 : 48) * scale),
      brandName: Math.round((short ? 20 : 24) * scale),
      heroTitle: Math.round((short ? 22 : 28) * scale),
      heroTitleLine: Math.round((short ? 28 : 34) * scale),
      heroSub: Math.round((short ? 12 : 13) * scale),
      featureMinH: short ? 84 : 96,
      ctaPadV: short ? 12 : 14,
      leafSize: Math.round(clamp(SW * 0.38, 110, 160)),
    };
  }, [SH, SW]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { isComplete, profile } = await resolveAccessLikeProfile();
        const cached = (await Utils.getData('_USER_INFO')) || profile;
        if (cancelled) return;
        if (isComplete || isProfileComplete(cached)) {
          await store.dispatch(fetchHomeData(true));
          resetRootToHomeStack(navigation, 'TabStack', { screen: 'Home' });
          return;
        }
      } catch {
        // stay on Access Mode
      } finally {
        if (!cancelled) setCheckingProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigation]);

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

  const confirmSignOut = async () => {
    try {
      setLoading('signout');
      setSignOutVisible(false);
      await signOutToChangeNumber(navigation);
    } finally {
      setLoading(null);
    }
  };

  if (checkingProfile) {
    return (
      <View style={[styles.root, styles.boot]}>
        <StatusBar barStyle="light-content" backgroundColor={GREEN_DEEP} />
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DEEP} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[GREEN_DEEP, GREEN, GREEN_MID]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.hero,
            {
              paddingBottom: metrics.short ? 28 : 36,
              paddingTop: Math.max(insets.top, 8),
            },
          ]}
        >
          <Image
            source={Images.leaf1}
            style={[
              styles.heroLeaf,
              {
                width: metrics.leafSize,
                height: metrics.leafSize,
                top: metrics.short ? 24 : 40,
              },
            ]}
            resizeMode="contain"
            {...IGNORE_TOUCHES}
          />

          <View style={[styles.heroInner, { paddingHorizontal: metrics.hPad }]}>
            <View style={[styles.topBar, metrics.short && { marginBottom: 10 }]}>
              <View style={[styles.verifiedChip, { maxWidth: SW * 0.62 }]}>
                <TablerIcon name="circle-check" size={12} color="#FFFFFF" />
                <Text style={styles.verifiedText} numberOfLines={1}>
                  Phone verified
                </Text>
              </View>
              <TouchableOpacity
                onPress={skipToHome}
                disabled={!!loading}
                hitSlop={12}
                style={styles.skipBtn}
                accessibilityRole="button"
                accessibilityLabel="Skip"
              >
                {loading === 'skip' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.skipLink}>Skip</Text>
                )}
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.brandRow,
                { marginBottom: metrics.short ? 12 : 18 },
              ]}
            >
              <View
                style={[
                  styles.logoRing,
                  {
                    width: metrics.logoRing,
                    height: metrics.logoRing,
                    borderRadius: Math.round(metrics.logoRing * 0.3),
                  },
                ]}
              >
                <Image
                  source={Images.FinalLogo}
                  style={{ width: metrics.logo, height: metrics.logo }}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.brandCopy}>
                <Text
                  style={[styles.brandName, { fontSize: metrics.brandName }]}
                  numberOfLines={1}
                >
                  Ayurmuni
                </Text>
                <Text style={styles.brandTag} numberOfLines={2}>
                  Ayurveda care, made personal
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.heroTitle,
                {
                  fontSize: metrics.heroTitle,
                  lineHeight: metrics.heroTitleLine,
                },
              ]}
            >
              Your wellness,{'\n'}tuned to you
            </Text>
            <Text
              style={[
                styles.heroSub,
                {
                  fontSize: metrics.heroSub,
                  lineHeight: metrics.heroSub + 6,
                  maxWidth: Math.min(340, SW - metrics.hPad * 2),
                },
              ]}
            >
              Set up once — get doctors, products & routines shaped by your
              Prakriti.
            </Text>
          </View>
        </LinearGradient>

        <View
          style={[
            styles.sheet,
            {
              paddingHorizontal: metrics.hPad,
              paddingBottom: Math.max(insets.bottom, 14) + 8,
              marginTop: metrics.short ? -18 : -22,
            },
          ]}
        >
          <View style={styles.sheetHandle} />

          <Text style={styles.sectionLabel}>WHAT YOU UNLOCK</Text>

          <View style={[styles.grid, { gap: metrics.gap }]}>
            {SHOWCASE.map(item => (
              <View
                key={item.title}
                style={[
                  styles.featureCard,
                  {
                    width: metrics.cardW,
                    maxWidth: metrics.cardW,
                  },
                ]}
              >
                <LinearGradient
                  colors={['#EAF8F4', '#F7FBFA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.featureInner,
                    {
                      minHeight: metrics.featureMinH,
                      padding: metrics.narrow ? 10 : 12,
                    },
                  ]}
                >
                  <View style={styles.featureIcon}>
                    <TablerIcon name={item.icon} size={18} color={GREEN} />
                  </View>
                  <Text style={styles.featureTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.featureSub} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                </LinearGradient>
              </View>
            ))}
          </View>

          <View style={styles.trustRow}>
            {['Secure', 'Personalized', 'Ayurveda-first'].map(label => (
              <View key={label} style={styles.trustPill}>
                <View style={styles.trustDot} />
                <Text style={styles.trustText} numberOfLines={1}>
                  {label}
                </Text>
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
              style={[styles.cta, { paddingVertical: metrics.ctaPadV }]}
            >
              <View style={styles.ctaIcon}>
                <TablerIcon name="user" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.ctaCopy}>
                <Text style={styles.ctaTitle} numberOfLines={1}>
                  Set up my profile
                </Text>
                <Text style={styles.ctaSub} numberOfLines={2}>
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

          <TouchableOpacity
            style={styles.changeNumberBtn}
            activeOpacity={0.85}
            disabled={!!loading}
            onPress={() => setSignOutVisible(true)}
          >
            {loading === 'signout' ? (
              <ActivityIndicator size="small" color={GREEN} />
            ) : (
              <>
                <TablerIcon name="phone" size={15} color={GREEN} />
                <Text style={styles.changeNumberText}>
                  Use a different phone number
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Skip anytime — you can finish setup later from Profile
          </Text>
        </View>
      </ScrollView>

      {signOutVisible ? (
        <CommonModal
          visible={signOutVisible}
          icon="📱"
          title="Change phone number?"
          subtitle="You’ll sign out of this guest session and can verify a different number on login."
          cancelText="Stay"
          confirmText="Sign out"
          onClose={() => setSignOutVisible(false)}
          onConfirm={confirmSignOut}
        />
      ) : null}
    </View>
  );
};

export default AccessModeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  boot: {
    backgroundColor: GREEN_DEEP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
  },
  heroLeaf: {
    position: 'absolute',
    right: -20,
    opacity: 0.12,
  },
  heroInner: {
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    marginBottom: 16,
    gap: 10,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
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
    flexShrink: 1,
  },
  skipBtn: {
    minWidth: 48,
    minHeight: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 0,
  },
  skipLink: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoRing: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
  brandCopy: {
    flex: 1,
    minWidth: 0,
  },
  brandName: {
    lineHeight: 30,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  brandTag: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: Fonts.PoppinsMedium,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroSub: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.86)',
    fontFamily: Fonts.PoppinsRegular,
  },
  sheet: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
    marginBottom: 14,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7E5E0',
  },
  featureInner: {
    width: '100%',
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
    maxWidth: '100%',
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
    width: '100%',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    minHeight: 64,
  },
  ctaIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
    lineHeight: 15,
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
    flexShrink: 0,
  },
  footerNote: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    paddingHorizontal: 8,
  },
  changeNumberBtn: {
    marginTop: 14,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  changeNumberText: {
    fontSize: 13,
    color: GREEN,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
