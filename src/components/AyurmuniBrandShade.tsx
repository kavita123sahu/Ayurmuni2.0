import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { Fonts } from '../common/Fonts';

/** Tight-cropped promo — black keyed out. */
const BANNER = require('../assets/images/ayurmuniBrandBannerTransparent.png');
/** Match actual asset pixels — locks layout height (no letterbox gap). */
const BANNER_ASPECT = 1033 / 813;

type Props = {
  compact?: boolean;
  tagline?: string;
};

/**
 * Brand art + tagline — exact height from aspect ratio (no top/bottom stretch space).
 */
const AyurmuniBrandShade = ({
  compact = false,
  tagline = 'Your Complete Personalised Ayurvedic Ecosystem..',
}: Props) => {
  const { width: screenW } = useWindowDimensions();

  const { artW, artH } = useMemo(() => {
    const w = Math.min(screenW * (compact ? 0.78 : 0.88), 320);
    return { artW: w, artH: w / BANNER_ASPECT };
  }, [screenW, compact]);

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Image
        source={BANNER}
        style={{ width: artW, height: artH }}
        resizeMode="contain"
      />
      {tagline ? (
        <Text style={[styles.tagline, compact && styles.taglineCompact]}>
          {tagline}
        </Text>
      ) : null}
    </View>
  );
};

export default React.memo(AyurmuniBrandShade);

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    marginTop: 4,
    marginBottom: 0,
    paddingTop: 5,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  tagline: {
    marginTop: 5,
    marginBottom: 0,
    fontSize: 12,
    lineHeight: 16,
    color: '#4B635A',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  taglineCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
});
