import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { Ionicons } from '../../common/Vector';
import TablerIcon from '../../components/TablerIcon';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_GAP = 12;
const CONTENT_PAD = 40;
const GRID_CARD_W = (SCREEN_W - CONTENT_PAD - GRID_GAP) / 2;
const AVATAR = 72;

const toLabelList = (value: any): string[] => {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === 'string') return item.trim();
        if (item?.name) return String(item.name).trim();
        if (item?.title) return String(item.title).trim();
        if (item?.label) return String(item.label).trim();
        return '';
      })
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [];
};

export const getDoctorSpecializationLabels = (doctor: any): string[] => {
  const candidates = [
    doctor?.doctor_specialization,
    doctor?.specializations,
    doctor?.specialization,
    doctor?.specialization_name,
    doctor?.speciality,
    doctor?.specialty,
    doctor?.designation,
    doctor?.qualification,
    doctor?.health_diseases,
  ];
  for (const c of candidates) {
    const list = toLabelList(c);
    if (list.length) return list;
  }
  return [];
};

interface Doctor {
  id: string;
  average_rating?: string;
  full_name: string;
  health_diseases?: any[];
  experience: string;
  name: string;
  total_reviews: string;
  ranking_score: string;
  experience_years: string;
  profile_image: any;
  has_availability?: boolean;
  first_name?: string;
  consultation_fee?: string | number;
  doctor_specialization?: any;
  specialization?: any;
  specializations?: any;
  specialization_name?: string;
  designation?: string;
  qualification?: string;
}

type Props = {
  data?: Doctor[];
  navigation: any;
  layout?: 'grid' | 'horizontal';
  limit?: number;
  home?: boolean;
};

const TopDoctorsCard = ({
  data = [],
  navigation,
  layout = 'grid',
  limit,
}: Props) => {
  const openDoctorProfile = useCallback(
    (item: Doctor) => {
      navigation?.navigate?.('DoctorProfile', { doctorData: item });
    },
    [navigation],
  );

  const list = useMemo(() => {
    const source = Array.isArray(data) ? data : [];
    if (typeof limit === 'number' && limit > 0) {
      return source.slice(0, limit);
    }
    return source;
  }, [data, limit]);

  const isGrid = layout !== 'horizontal';

  const renderItem = useCallback(
    ({ item }: { item: Doctor }) => {
      const labels = getDoctorSpecializationLabels(item);
      const speciality = labels[0] || 'Ayurveda Specialist';
      const isAvailable = item?.has_availability === true;
      const rating = Number(item?.average_rating ?? item?.ranking_score ?? 0);
      const ratingLabel = Number.isFinite(rating) ? rating.toFixed(1) : '—';
      const experience = item?.experience_years || item?.experience || '0';
      const displayName = item.full_name || item.name || 'Doctor';
      const reviews = item?.total_reviews;
      const feeRaw = item?.consultation_fee;
      const hasFee =
        feeRaw != null && String(feeRaw).trim() !== '' && Number(feeRaw) >= 0;
      const feeLabel = hasFee ? String(feeRaw).replace(/\.0+$/, '') : null;
      const imageUri =
        typeof item?.profile_image === 'string'
          ? item.profile_image.trim()
          : item?.profile_image?.url
            ? String(item.profile_image.url).trim()
            : '';

      return (
        <Pressable
          style={({ pressed }) => [
            styles.card,
            isGrid ? styles.cardGrid : styles.cardHorizontal,
            pressed && styles.cardPressed,
          ]}
          onPress={() => openDoctorProfile(item)}
        >
          <View style={styles.cardTop}>
            <View style={styles.avatarRing}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={[styles.avatar, !isAvailable && styles.imageMuted]}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.initialAvatar,
                    !isAvailable && styles.imageMuted,
                  ]}
                >
                  <Text style={styles.initialText}>
                    {item?.first_name?.charAt(0).toUpperCase() ||
                      displayName?.charAt(0)?.toUpperCase() ||
                      'D'}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.onlineDot,
                  !isAvailable && styles.offlineDot,
                ]}
              />
            </View>
          </View>

          <Text style={styles.name} numberOfLines={2}>
            {displayName}
          </Text>
          <Text style={styles.speciality} numberOfLines={1}>
            {speciality}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={styles.metaText}>{ratingLabel}</Text>
              {reviews != null && String(reviews).trim() !== '' ? (
                <Text style={styles.metaMuted}>({reviews})</Text>
              ) : null}
            </View>
            <View style={styles.metaPill}>
              <TablerIcon name="briefcase" size={11} color={Colors.primaryColor} />
              <Text style={styles.metaText}>{experience} yrs</Text>
            </View>
          </View>

          {hasFee ? (
            <View style={styles.feeBadge}>
              {/* <Text style={styles.feeFrom}>from</Text> */}
              <Text style={styles.feeAmount}>₹{feeLabel}</Text>
            </View>
          ) : null}

          <View style={styles.consultBtn}>
            <Text style={styles.consultText}>Consult</Text>
            <TablerIcon name="chevron-right" size={14} color="#FFFFFF" />
          </View>
        </Pressable>
      );
    },
    [openDoctorProfile, isGrid],
  );

  if (!list.length) {
    return null;
  }

  if (isGrid) {
    return (
      <View style={styles.gridWrap}>
        {list.map((item, index) => (
          <View
            key={String(item?.id ?? `top-doc-${index}`)}
            style={styles.gridItem}
          >
            {renderItem({ item })}
          </View>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={list}
      keyExtractor={(item, index) => String(item?.id ?? `top-doc-${index}`)}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalContainer}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={5}
    />
  );
};

export default React.memo(TopDoctorsCard);

const styles = StyleSheet.create({
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: GRID_GAP,
  },
  gridItem: {
    width: GRID_CARD_W,
  },
  horizontalContainer: {
    paddingRight: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7E8E1',
    paddingTop: 14,
    paddingHorizontal: 12,
    paddingBottom: 12,
    alignItems: 'center',
    overflow: 'hidden',
    // shadowColor: '#0D614E',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.08,
    // shadowRadius: 10,
    // elevation: 3,
  },
  cardGrid: {
    width: '100%',
  },
  cardHorizontal: {
    width: 168,
    marginRight: 12,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  cardTop: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarRing: {
    width: AVATAR + 6,
    height: AVATAR + 6,
    borderRadius: (AVATAR + 6) / 2,
    borderWidth: 2,
    borderColor: '#B7D9CE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF7F3',
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    resizeMode: 'cover',
  },
  initialAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D7EDE5',
  },
  initialText: {
    fontSize: 24,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    textTransform: 'uppercase',
  },
  imageMuted: {
    opacity: 0.72,
  },
  onlineDot: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  offlineDot: {
    backgroundColor: '#94A3B8',
  },
  name: {
    fontSize: 14,
    lineHeight: 18,
    color: '#0F3D32',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    width: '100%',
  },
  speciality: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    color: '#0F766E',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F8FBFA',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E6F2ED',
  },
  metaText: {
    fontSize: 11,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  metaMuted: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  feeBadge: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  feeFrom: {
    fontSize: 9,
    color: '#C2410C',
    fontFamily: Fonts.PoppinsMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  feeAmount: {
    fontSize: 14,
    color: '#EA580C',
    fontFamily: Fonts.PoppinsSemiBold,
    lineHeight: 19,
  },
  consultBtn: {
    marginTop: 8,
    alignSelf: 'stretch',
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
    backgroundColor: Colors.primaryColor,
  },
  consultText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
