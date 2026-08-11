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

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_GAP = 10;
const CONTENT_PAD = 40;
const GRID_CARD_W = (SCREEN_W - CONTENT_PAD - GRID_GAP) / 2;
const AVATAR = 52;

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

  console.log("listlistlistlistlist", list);

  const isGrid = layout !== 'horizontal';

  const renderItem = useCallback(
    ({ item }: { item: Doctor }) => {
      const labels = getDoctorSpecializationLabels(item);
      const speciality = labels[0] || 'Ayurveda Specialist';
      const isAvailable = item?.has_availability === true;
      const rating = Number(item?.average_rating ?? item?.ranking_score ?? 0);
      const ratingLabel = Number.isFinite(rating) ? rating.toFixed(1) : '0.0';
      const experience = item?.experience_years || item?.experience || '0';
      const displayName = item.full_name || item.name || 'Doctor';
      const fee = item?.consultation_fee;
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
          <View style={styles.avatarWrap}>
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
                    ''}
                </Text>
              </View>
            )}
            {isAvailable ? <View style={styles.onlineDot} /> : null}
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.speciality} numberOfLines={1}>
            {speciality}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text style={styles.metaText}>{ratingLabel}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{experience}yr</Text>
            {fee != null && fee !== '' ? (
              <>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.feeText}>₹{fee}</Text>
              </>
            ) : null}
          </View>

          <View style={styles.consultBtn}>
            <Text style={styles.consultText}>Consult</Text>
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
      keyExtractor={(item, index) =>
        String(item?.id ?? `top-doc-${index}`)
      }
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E8E1',
    paddingTop: 10,
    paddingHorizontal: 8,
    paddingBottom: 8,
    alignItems: 'center',
  },
  cardGrid: {
    width: '100%',
  },
  cardHorizontal: {
    width: 148,
    marginRight: 10,
  },
  cardPressed: {
    opacity: 0.94,
  },
  avatarWrap: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    backgroundColor: '#E8F3EF',
    marginBottom: 6,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initialAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D7EDE5',
  },
  initialText: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    textTransform: 'uppercase',
  },
  imageMuted: {
    opacity: 0.72,
  },
  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 12,
    lineHeight: 15,
    color: '#0F3D32',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    width: '100%',
  },
  speciality: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 13,
    color: '#0F766E',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    flexWrap: 'nowrap',
    gap: 2,
  },
  metaText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  metaDot: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  feeText: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  consultBtn: {
    marginTop: 6,
    alignSelf: 'stretch',
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryColor,
  },
  consultText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
