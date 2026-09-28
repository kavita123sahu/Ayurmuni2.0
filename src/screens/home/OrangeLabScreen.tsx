import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import AppHeader from '../../components/AppHeader';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import { RupeeAmount } from '../../utils/currencyUtils';
import {
  DUMMY_LAB_TESTS,
  DUMMY_ORANGE_LAB_FEATURES,
  type LabTestDummy,
  type OrangeLabFeature,
} from '../../data/homeDummySections';
import { SCREEN_PADDING_H } from '../../constants/layout';

const HERO_IMG =
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80';

const GAP = 10;
const CARD_W =
  (Dimensions.get('window').width - SCREEN_PADDING_H * 2 - GAP) / 2;

const FEATURE_ICON: Record<OrangeLabFeature['icon'], TablerIconName> = {
  flask: 'flask',
  report: 'report',
  bolt: 'bolt',
  shield: 'shield',
  clock: 'clock',
  heart: 'heart',
};

function LabGridCard({ item }: { item: LabTestDummy }) {
  const off =
    item.mrp && item.mrp > item.price
      ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
      : 0;

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imgWrap}>
        <Image source={{ uri: item.image }} style={styles.img} />
        {item.tag ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        ) : null}
        {off > 0 ? (
          <View style={styles.offPill}>
            <Text style={styles.offPillText}>{off}% OFF</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.tests}
        </Text>

        <View style={styles.priceRow}>
          <RupeeAmount
            value={item.price}
            style={styles.price}
            iconColor="#111827"
          />
          {item.mrp && item.mrp > item.price ? (
            <RupeeAmount
              value={item.mrp}
              style={styles.mrp}
              iconColor="#94A3B8"
            />
          ) : null}
        </View>

        <Pressable style={styles.bookBtn}>
          <Text style={styles.bookText}>BOOK</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

/** Full Health Lab — compact Tata 1mg–style grid (dummy). */
export default function OrangeLabScreen(props: any) {
  const insets = useSafeAreaInsets();
  const tests = useMemo(() => DUMMY_LAB_TESTS, []);
  const features = useMemo(() => DUMMY_ORANGE_LAB_FEATURES.slice(0, 4), []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader
        title="Health Lab"
        onLeftPress={() => props.navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 20) + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Image hero — 1mg checkup style */}
        <View style={styles.hero}>
          <Image source={{ uri: HERO_IMG }} style={styles.heroImg} />
          <LinearGradient
            colors={['transparent', 'rgba(124,45,18,0.88)']}
            style={styles.heroOverlay}
          >
            <Text style={styles.heroEyebrow}>AT-HOME COLLECTION</Text>
            <Text style={styles.heroTitle}>Lab tests, made simple</Text>
            <Text style={styles.heroSub} numberOfLines={1}>
              Safe · NABL partners · Doctor-ready reports
            </Text>
          </LinearGradient>
        </View>

        {/* Trust chips — tight, no tall cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {features.map(item => (
            <View key={item.id} style={styles.chip}>
              <View style={styles.chipIcon}>
                <TablerIcon
                  name={FEATURE_ICON[item.icon]}
                  size={14}
                  color="#C2410C"
                />
              </View>
              <Text style={styles.chipText} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.blockTitle}>Popular packages</Text>
        <View style={styles.grid}>
          {tests.map(item => (
            <LabGridCard key={item.id} item={item} />
          ))}
        </View>

        <LinearGradient
          colors={['#EA580C', '#C2410C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomCta}
        >
          <View style={styles.bottomCopy}>
            <Text style={styles.bottomTitle}>Full body checkup?</Text>
            <Text style={styles.bottomSub}>Curated panels · home collection</Text>
          </View>
          <View style={styles.bottomBtn}>
            <Text style={styles.bottomBtnText}>Explore</Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1, backgroundColor: '#FFFBF7' },
  content: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 8,
  },

  hero: {
    height: 148,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFEDD5',
  },
  heroImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  heroEyebrow: {
    fontSize: 9,
    letterSpacing: 0.7,
    color: 'rgba(255,237,213,0.95)',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroTitle: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 22,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroSub: {
    marginTop: 2,
    fontSize: 11,
    color: 'rgba(255,247,237,0.9)',
    fontFamily: Fonts.PoppinsRegular,
  },

  chipRow: {
    paddingTop: 10,
    paddingBottom: 2,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  chipIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 11,
    color: '#9A3412',
    fontFamily: Fonts.PoppinsMedium,
    maxWidth: 120,
  },

  blockTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  card: {
    width: CARD_W,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1E4D8',
    overflow: 'hidden',
  },
  pressed: { opacity: 0.94 },
  imgWrap: {
    width: '100%',
    height: 96,
    backgroundColor: '#FFF7ED',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  tag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  offPill: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#15803D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offPillText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  cardBody: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  name: {
    fontSize: 12,
    lineHeight: 16,
    minHeight: 32,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  meta: {
    marginTop: 2,
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  priceRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  price: {
    fontSize: 13,
    color: '#111827',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  mrp: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    textDecorationLine: 'line-through',
  },
  bookBtn: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#EA580C',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 6,
  },
  bookText: {
    fontSize: 11,
    color: '#EA580C',
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.3,
  },

  bottomCta: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomCopy: { flex: 1, minWidth: 0 },
  bottomTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  bottomSub: {
    marginTop: 1,
    fontSize: 10,
    color: 'rgba(255,255,255,0.88)',
    fontFamily: Fonts.PoppinsRegular,
  },
  bottomBtn: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  bottomBtnText: {
    fontSize: 11,
    color: '#C2410C',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
