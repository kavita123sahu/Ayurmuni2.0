/**
 * Single gate UI for guest actions (cart, book, wishlist, etc.).
 * Browse stays open; only mutations land here via requireAuth().
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
import {
  getOnboardingEntryScreen,
  markAsGuest,
} from '../../services/guestAuth';
import TablerIcon from '../../components/TablerIcon';

const CompleteDetailsScreen = ({ navigation, route }: any) => {
  const reason =
    route?.params?.reason ||
    'Complete your profile and prakriti assessment to continue.';
  const [loading, setLoading] = useState(false);

  const onComplete = async () => {
    try {
      setLoading(true);
      await markAsGuest();
      const next = await getOnboardingEntryScreen();
      // navigate (not replace) so Back returns here / previous screen
      if (next === 'AssessmentType') {
        navigation.navigate('AssessmentType', { form: 'all' });
      } else {
        navigation.navigate('TermsCondition', { agreed: false });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <TablerIcon name="x" size={22} color="#64748B" />
        </TouchableOpacity>

        <View style={styles.iconWrap}>
          <TablerIcon name="clipboard-list" size={28} color={Colors.primaryColor} />
        </View>

        <Text style={styles.title}>Complete details to proceed</Text>
        <Text style={styles.subtitle}>{reason}</Text>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>What you’ll finish</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepDot}>
              <Text style={styles.stepNum}>1</Text>
            </View>
            <Text style={styles.stepText}>Customer profile (name, DOB, gender)</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepDot}>
              <Text style={styles.stepNum}>2</Text>
            </View>
            <Text style={styles.stepText}>Prakriti assessment</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.9}
          disabled={loading}
          onPress={onComplete}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Complete details</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.85}
          disabled={loading}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryBtnText}>Keep browsing</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CompleteDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginTop: 24,
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#E8F3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 20,
    fontSize: 26,
    lineHeight: 34,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  stepsCard: {
    marginTop: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8F2EE',
    backgroundColor: '#F8FBF9',
    padding: 16,
  },
  stepsTitle: {
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
  },
  primaryBtn: {
    marginTop: 32,
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  secondaryBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
