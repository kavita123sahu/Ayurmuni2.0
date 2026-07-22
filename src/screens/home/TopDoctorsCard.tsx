import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
} from 'react-native';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../../components/TablerIcon';

const { width } = Dimensions.get('window');

// ---- Responsive helpers -----------------------------------------------
// Base design was done on a 375pt-wide screen (standard iPhone reference).
const BASE_WIDTH = 375;
const scale = (size: number) => (width / BASE_WIDTH) * size;

// Clamp font scaling so text doesn't blow up on tablets or shrink too much
// on tiny devices.
const normalize = (size: number) => {
  const newSize = scale(size);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Card sizing: ~46% of screen width so ~2.2 cards are visible per row —
// smaller, tighter cards than a half-screen card.
const CARD_WIDTH = Math.min(width * 0.46, 190);
const CARD_PADDING = scale(10);
const AVATAR_SIZE = scale(46);

interface Doctor {
  id: string;
  average_rating?: string;
  full_name: string;
  health_diseases: [];
  experience: string;
  name: string;
  total_reviews: string;
  ranking_score: string;
  experience_years: string;
  profile_image: any;
  has_availability?: boolean;
  first_name?: string;
}

const TopDoctorsCard = ({ data = [], navigation }: any) => {
  const stackNav = navigation?.getParent?.() || navigation;

  const renderItem = useCallback(
    ({ item }: { item: Doctor }) => {
      const therapies = Array.isArray(item?.health_diseases)
        ? item.health_diseases.map((disease: any) => disease.name).join(', ')
        : '';

      const openProfile = () =>
        stackNav.navigate('DoctorProfile', { doctorData: item });

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.88}
          onPress={openProfile}
        >
          {/* Top row: avatar on the left, rating fills the empty space on the right */}
          <View style={styles.topRow}>
            <View style={styles.avatarOuter}>
              <View style={styles.doctorImageWrapper}>
                {item?.profile_image ? (
                  <Image
                    source={{ uri: item.profile_image }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {(item?.first_name?.charAt(0) || '').toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              {item?.has_availability && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.ratingBadge}>
              <TablerIcon name="star" size={normalize(12)} color="#F59E0B" />
              <Text style={styles.rating}>
                {item?.average_rating != null ? item.average_rating : 0}

              </Text>
            </View>
          </View>

          {/* Name & specialization */}
          <Text numberOfLines={1} style={styles.name}>
            {item.full_name || item.name}
          </Text>
          <Text numberOfLines={1} style={styles.specialization}>
            {therapies?.split(',').slice(0, 1).join(', ') ||
              'Ayurveda Specialist'}
          </Text>

          <View style={styles.expRow}>
            <View style={styles.expLeft}>
              <TablerIcon name="clock" size={normalize(11)} color="#64748B" />
              <Text style={styles.exp}>
                {item?.experience_years || '—'} Yrs Exp
              </Text>
            </View>

            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.85}
              onPress={openProfile}
            >
              <TablerIcon
                name="stethoscope"
                size={normalize(15)}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [stackNav],
  );

  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={5}
      getItemLayout={(_, index) => ({
        length: CARD_WIDTH + scale(12),
        offset: (CARD_WIDTH + scale(12)) * index,
        index,
      })}
    />
  );
};

export default React.memo(TopDoctorsCard);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(2),
    paddingRight: scale(6),
    paddingVertical: scale(4),
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    marginRight: scale(8),
    borderWidth: 1,
    borderColor: '#E8EEF3',
    padding: CARD_PADDING,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(8),
  },
  avatarOuter: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  doctorImageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: scale(16),
    overflow: 'hidden',
    backgroundColor: '#F0FAF7',
    borderWidth: 1,
    borderColor: '#E2F3EE',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -scale(1),
    right: -scale(1),
    width: scale(11),
    height: scale(11),
    borderRadius: scale(6),
    backgroundColor: '#22C55E',
    borderWidth: scale(2),
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: scale(16),
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: normalize(12),
    fontFamily: Fonts.PoppinsSemiBold,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: normalize(12),
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    lineHeight: normalize(17),
  },
  specialization: {
    marginTop: scale(1),
    fontSize: normalize(10),
    lineHeight: normalize(14),
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  expRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: scale(4),
  },
  expLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  exp: {
    fontSize: normalize(10.5),
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
    backgroundColor: '#FFFBEB',
    paddingHorizontal: scale(7),
    paddingVertical: scale(3),
    borderRadius: 10,
  },
  rating: {
    fontSize: normalize(11.5),
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  reviewCount: {
    fontSize: normalize(9.5),
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    fontWeight: 'normal',
  },
  iconButton: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(9),
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
});