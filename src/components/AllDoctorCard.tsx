// DoctorCard.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { Ionicons } from '../common/Vector';
import { Images } from '../common/Images';
import TablerIcon from './TablerIcon';
import * as _CONSULT_SERVICES from '../services/ConsultServce';
import FavouriteButton from './FavouriteButton';

interface DoctorItem {
  id: string;
  is_favorite: boolean;
  image: any;
  name: string;
  full_name: string;
  health_diseases: Array<{ name: string }>;
  profile_image: string;
  experience_years: string;
  rating: number;
  reviewCount: number;
  total_reviews: number;
  has_availability: boolean;
  ranking_score: number;
  availableInMinutes: number;
}

interface Props {
  item: DoctorItem;
  onPress?: (item: DoctorItem) => void;
  onChatPress?: (item: DoctorItem) => void;
}

const AllDoctorCard: React.FC<Props> = ({ item, onPress }) => {
  const [isWishlisted, setIsWishlisted] = useState(item?.is_favorite ?? false);

  const isAvailable = useMemo(
    () => item?.has_availability === true,
    [item?.has_availability],
  );

  useEffect(() => {
    setIsWishlisted(item?.is_favorite ?? false);
  }, [item?.is_favorite]);

  const handleWishlist = useCallback(async () => {
    const previous = isWishlisted;
    setIsWishlisted(!previous);

    try {
      const response = await _CONSULT_SERVICES.ToggleFavDoctor(item?.id, 'POST');
      if (!response?.success) {
        setIsWishlisted(previous);
      }
    } catch {
      setIsWishlisted(previous);
    }
  }, [isWishlisted, item?.id]);

  return (
    <Pressable style={styles.card} onPress={() => onPress?.(item)}>
      <View style={styles.row}>
        <View style={styles.imageWrapper}>
          <Image
            source={
              item?.profile_image?.trim()
                ? { uri: item.profile_image }
                : Images.doctorImage
            }
            style={[styles.image, !isAvailable && styles.imageGrayscale]}
          />
          {isAvailable ? <View style={styles.onlineDot} /> : null}
        </View>

        <View style={styles.right}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item?.name || item?.full_name}
            </Text>
            <FavouriteButton
              isFavourite={isWishlisted}
              onPress={handleWishlist}
              style={styles.iconBtn}
            />
          </View>

          <Text style={styles.speciality} numberOfLines={1}>
            {Array.isArray(item?.health_diseases)
              ? item.health_diseases.map(i => i.name).join(', ')
              : ''}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={13} color="#0F766E" />
              <Text style={styles.badgeText}>
                {item?.experience_years || 0} Yrs
              </Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.badgeText}>{item?.ranking_score || 0}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item?.total_reviews || 0} Reviews
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.consultBtn}
            onPress={() => onPress?.(item)}
            activeOpacity={0.85}
          >
            <TablerIcon name="consult" size={18} color="#FFF" />
            <Text style={styles.consultText}>Consult Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};

export default React.memo(AllDoctorCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#D7E8E1',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
    marginTop: 2,
    backgroundColor: Colors.bgborderColor,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGrayscale: {
    backgroundColor: '#F1F5F9',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  right: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 22,
  },
  name: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  speciality: {
    fontSize: 11,
    lineHeight: 15,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FAF7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  consultBtn: {
    marginTop: 8,
    height: 34,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryColor,
    gap: 6,
  },
  consultText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
