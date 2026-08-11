/**
 * Shown once after OTP verify.
 * User already has API tokens; this only chooses browse-as-guest vs start onboarding.
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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { markAsGuest } from '../../services/guestAuth';
import { resetRootToHomeStack } from '../../navigation/navigationUtils';
import TablerIcon from '../../components/TablerIcon';

const AccessModeScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState<'guest' | 'onboard' | null>(null);

  const continueAsGuest = async () => {
    try {
      setLoading('guest');
      await markAsGuest();
      resetRootToHomeStack(navigation, 'TabStack', { screen: 'Home' });
    } finally {
      setLoading(null);
    }
  };

  const startOnboarding = async () => {
    try {
      setLoading('onboard');
      await markAsGuest();
      navigation.navigate('TermsCondition', { agreed: false });
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A3328" />
      <LinearGradient
        colors={['#0A3328', '#0F4A38', '#145A43']}
        style={styles.hero}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.heroInner}>
            <View style={styles.logoWrap}>
              <Image
                source={Images.FinalLogo}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.verifiedRow}>
              <TablerIcon name="circle-check" size={16} color="#D4AF37" />
              <Text style={styles.verifiedText}>Phone verified</Text>
            </View>
            <Text style={styles.heroTitle}>Welcome to Ayurmuni</Text>
            <Text style={styles.heroSub}>
              Choose how you want to begin your wellness journey.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.sectionLabel}>GET STARTED</Text>

          <TouchableOpacity
            activeOpacity={0.92}
            disabled={!!loading}
            onPress={startOnboarding}
            style={styles.primaryBtn}
          >
            <LinearGradient
              colors={['#0D614E', '#14876A']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.primaryBtnGrad}
            >
              <View style={styles.btnIcon}>
                <TablerIcon name="star" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.btnCopy}>
                <Text style={styles.primaryTitle}>Set up my profile</Text>
                <Text style={styles.primarySub}>
                  Details + Prakriti for personalized care
                </Text>
              </View>
              {loading === 'onboard' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <TablerIcon name="arrow-right" size={18} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.92}
            disabled={!!loading}
            onPress={continueAsGuest}
            style={styles.secondaryBtn}
          >
            <View style={styles.btnIconSoft}>
              <TablerIcon name="map-pin" size={20} color={Colors.primaryColor} />
            </View>
            <View style={styles.btnCopy}>
              <Text style={styles.secondaryTitle}>Explore as guest</Text>
              <Text style={styles.secondarySub}>
                Browse freely — unlock bookings when you finish profile
              </Text>
            </View>
            {loading === 'guest' ? (
              <ActivityIndicator color={Colors.primaryColor} />
            ) : (
              <TablerIcon name="chevron-right" size={18} color="#94A3B8" />
            )}
          </TouchableOpacity>

          <View style={styles.perks}>
            {[
              'Secure session stays active',
              'Switch to full access anytime',
              'Your data stays private',
            ].map(line => (
              <View key={line} style={styles.perkRow}>
                <TablerIcon name="check" size={14} color={Colors.primaryColor} />
                <Text style={styles.perkText}>{line}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default AccessModeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F8F6',
  },
  hero: {
    paddingBottom: 36,
  },
  heroInner: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 40,
    height: 40,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  verifiedText: {
    fontSize: 12,
    color: '#D4AF37',
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    color: '#F7F3EA',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroSub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(247,243,234,0.78)',
    fontFamily: Fonts.PoppinsRegular,
    maxWidth: 320,
  },
  sheet: {
    flex: 1,
    marginTop: -18,
    backgroundColor: '#F5F8F6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.4,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 14,
  },
  primaryBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
  },
  primaryBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EBE6',
  },
  btnIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIconSoft: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E8F3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCopy: {
    flex: 1,
  },
  primaryTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  primarySub: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: Fonts.PoppinsRegular,
  },
  secondaryTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  secondarySub: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  perks: {
    marginTop: 28,
    gap: 10,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkText: {
    fontSize: 13,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
});
