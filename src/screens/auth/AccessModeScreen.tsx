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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
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
      // Stay guest until profile + prakriti finish (promoteToFullUser).
      // Use navigate (not reset) so Back returns to this AccessMode screen.
      await markAsGuest();
      navigation.navigate('TermsCondition', { agreed: false });
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F3EA" />

      <View style={styles.content}>
        <View style={styles.badge}>
          <TablerIcon name="shield" size={18} color={Colors.primaryColor} />
          <Text style={styles.badgeText}>OTP verified</Text>
        </View>

        <Text style={styles.title}>How would you like to continue?</Text>
        <Text style={styles.subtitle}>
          You can explore Ayurmuni now. Purchases, bookings, and saved items need
          your profile and prakriti assessment.
        </Text>

        <TouchableOpacity
          style={styles.primaryCard}
          activeOpacity={0.9}
          disabled={!!loading}
          onPress={startOnboarding}
        >
          <View style={styles.cardIcon}>
            <TablerIcon name="user" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.primaryCardTitle}>Complete my profile</Text>
            <Text style={styles.primaryCardSub}>
              Add details + prakriti assessment for full access
            </Text>
          </View>
          {loading === 'onboard' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <TablerIcon name="chevron-right" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryCard}
          activeOpacity={0.9}
          disabled={!!loading}
          onPress={continueAsGuest}
        >
          <View style={[styles.cardIcon, styles.cardIconSoft]}>
            <TablerIcon name="home" size={22} color={Colors.primaryColor} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.secondaryCardTitle}>Continue as guest</Text>
            <Text style={styles.secondaryCardSub}>
              Browse doctors, products & content. Actions unlock after details.
            </Text>
          </View>
          {loading === 'guest' ? (
            <ActivityIndicator color={Colors.primaryColor} />
          ) : (
            <TablerIcon name="chevron-right" size={20} color={Colors.primaryColor} />
          )}
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Guest mode still uses a secure session so you can see live app data.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default AccessModeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F3EF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 18,
  },
  badgeText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    color: '#1B2B36',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5A62',
    fontFamily: Fonts.PoppinsRegular,
    marginBottom: 28,
  },
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primaryColor,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E1D6',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconSoft: {
    backgroundColor: '#E8F3EF',
  },
  cardCopy: {
    flex: 1,
  },
  primaryCardTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  primaryCardSub: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Fonts.PoppinsRegular,
  },
  secondaryCardTitle: {
    fontSize: 16,
    color: '#1B2B36',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  secondaryCardSub: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  footnote: {
    marginTop: 24,
    fontSize: 12,
    lineHeight: 18,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
  },
});
