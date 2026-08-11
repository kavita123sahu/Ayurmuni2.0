import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import { Colors } from '../common/Colors';

const { width: SCREEN_W } = Dimensions.get('window');

type Props = {
  /** Compact footer for home / consult bottoms */
  compact?: boolean;
  tagline?: string;
};

/**
 * Soft brand end-footer: Ayurmuni as the hero signal, light canvas, short tagline.
 */
const AyurmuniBrandShade = ({
  compact = false,
  tagline = 'Rooted in Ayurveda. Built for everyday care.',
}: Props) => {
  const wordSize = Math.min(
    SCREEN_W * (compact ? 0.15 : 0.175),
    compact ? 46 : 56,
  );

  return (
    <View
      style={[styles.wrap, compact && styles.wrapCompact]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.blob, styles.blobLeft]} />
      <View style={[styles.blob, styles.blobRight]} />

      <View style={styles.topRow}>
        <View style={[styles.logoRing, compact && styles.logoRingCompact]}>
          <Image
            source={Images.logoRound}
            style={[styles.logo, compact && styles.logoCompact]}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* <Text style={[styles.brandName, compact && styles.brandNameCompact]}>
        <Text style={styles.brandAyur}>Ayur</Text>
        <Text style={styles.brandMuni}>muni</Text>
      </Text> */}

      <View style={styles.underline} />

      <Text style={[styles.tagline, compact && styles.taglineCompact]}>
        {tagline}
      </Text>

      <View style={styles.trustRow}>
        <Text style={styles.trustItem}>Doctors</Text>
        <Text style={styles.trustDot}>·</Text>
        <Text style={styles.trustItem}>Consult</Text>
        <Text style={styles.trustDot}>·</Text>
        <Text style={styles.trustItem}>Care</Text>
      </View>

      <Text
        style={[
          styles.wordmark,
          {
            fontSize: wordSize,
            // lineHeight: wordSize * 0.88,
          },
          compact && styles.wordmarkCompact,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
      >
        ayurmuni
      </Text>
    </View>
  );
};

export default React.memo(AyurmuniBrandShade);

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    marginBottom: 10,
    minHeight: 168,
    borderRadius: 20,
    backgroundColor: '#EEF7F3',
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#CDE5DB',
  },
  wrapCompact: {
    minHeight: 148,
    borderRadius: 16,
    paddingTop: 16,
    marginTop: 12,
  },
  blob: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryColor,
    opacity: 0.06,
  },
  blobLeft: {
    top: -36,
    left: -28,
  },
  blobRight: {
    bottom: 18,
    right: -34,
    width: 100,
    height: 100,
    opacity: 0.05,
  },
  topRow: {
    zIndex: 2,
    marginBottom: 8,
  },
  logoRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#B7D9CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRingCompact: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  logo: {
    width: 28,
    height: 28,
    tintColor: Colors.primaryColor,
  },
  logoCompact: {
    width: 24,
    height: 24,
  },
  brandName: {
    zIndex: 2,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    textAlign: 'center',
    fontFamily: Fonts.PoppinsBold,
  },
  brandNameCompact: {
    fontSize: 24,
    lineHeight: 30,
  },
  brandAyur: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsBold,
  },
  brandMuni: {
    color: '#0F3D32',
    fontFamily: Fonts.PoppinsBold,
  },
  underline: {
    // marginTop: 6,
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primaryColor,
    opacity: 0.55,
    zIndex: 2,
  },
  tagline: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: '#4B635A',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
    zIndex: 2,
    maxWidth: 280,
  },
  taglineCompact: {
    fontSize: 12,
    lineHeight: 16,
    maxWidth: 260,
  },
  trustRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  trustItem: {
    fontSize: 12,
    color: '#0F766E',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  trustDot: {
    fontSize: 11,
    color: '#94A3B8',
  },
  wordmark: {
    // marginTop: 5,
    width: '100%',
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsBold,
    // fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
    opacity: 0.07,
    includeFontPadding: false,
    textTransform: 'lowercase',
  },
  wordmarkCompact: {
    marginTop: 8,
    opacity: 0.06,
  },
});
