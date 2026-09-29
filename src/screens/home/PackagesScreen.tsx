import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { RupeeAmount } from '../../utils/currencyUtils';
import {
  DUMMY_CONSULT_PACKAGES,
  type ConsultPackageDummy,
} from '../../data/homeDummySections';
import { SCREEN_PADDING_H } from '../../constants/layout';

const HERO_IMG =
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80';

const GAP = 10;
const CARD_W =
  (Dimensions.get('window').width - SCREEN_PADDING_H * 2 - GAP) / 2;

function PackageGridCard({ item }: { item: ConsultPackageDummy }) {
  const off =
    item.mrp && item.mrp > item.price
      ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
      : 0;

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imgWrap}>
        <Image source={{ uri: item.image }} style={styles.img} />
        {item.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}
        {off > 0 ? (
          <View style={styles.offPill}>
            <Text style={styles.offPillText}>{off}% OFF</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.group} numberOfLines={1}>
          {item.group}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.hint} numberOfLines={1}>
          {item.includes[0]}
          {item.includes.length > 1 ? ` · +${item.includes.length - 1}` : ''}
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

/** Full packages — compact Tata 1mg–style 2-col grid (dummy). */
export default function PackagesScreen(props: any) {
  const insets = useSafeAreaInsets();
  const data = useMemo(() => DUMMY_CONSULT_PACKAGES, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader
        title="Consultation Packages"
        onLeftPress={() => props.navigation.goBack()}
      />
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.hero}>
              <Image source={{ uri: HERO_IMG }} style={styles.heroImg} />
              <LinearGradient
                colors={['transparent', 'rgba(15,118,110,0.9)']}
                style={styles.heroOverlay}
              >
                <Text style={styles.heroEyebrow}>AYURVEDIC CARE</Text>
                <Text style={styles.heroTitle}>Plans that fit your journey</Text>
                <Text style={styles.heroSub} numberOfLines={1}>
                  Consult · Diet · Long-term wellness
                </Text>
              </LinearGradient>
            </View>
            <Text style={styles.blockTitle}>All packages</Text>
          </View>
        }
        renderItem={({ item }) => <PackageGridCard item={item} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Math.max(insets.bottom, 20) + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  list: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 8,
    backgroundColor: '#F4FBF7',
  },
  headerBlock: {
    marginBottom: 8,
  },
  hero: {
    height: 132,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#D1FAE5',
    marginBottom: 12,
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
    color: 'rgba(209,250,229,0.95)',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroTitle: {
    marginTop: 2,
    fontSize: 17,
    lineHeight: 22,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroSub: {
    marginTop: 2,
    fontSize: 11,
    color: 'rgba(236,253,245,0.92)',
    fontFamily: Fonts.PoppinsRegular,
  },
  blockTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  card: {
    width: CARD_W,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCEFE6',
    overflow: 'hidden',
  },
  pressed: { opacity: 0.94 },
  imgWrap: {
    width: '100%',
    height: 96,
    backgroundColor: '#ECFDF5',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#15803D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  offPill: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(15,23,42,0.78)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offPillText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  body: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  group: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  name: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    minHeight: 32,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  hint: {
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
    borderColor: Colors.primaryColor,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 6,
  },
  bookText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.3,
  },
});
