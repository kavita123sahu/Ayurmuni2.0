import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DoctorListCard from './DoctorListCard';
import FavouriteButton from './FavouriteButton';
import * as _CONSULT_SERVICES from '../services/ConsultServce';

interface DoctorItem {
  id: string;
  is_favorite: boolean;
  image: any;
  name: string;
  full_name: string;
  health_diseases: Array<{ name: string }>;
  profile_image: string;
  experience_years: string;
  average_rating?: string | number;
  rating: number;
  reviewCount: number;
  total_reviews: number;
  has_availability: boolean;
  ranking_score: number;
  availableInMinutes: number;
  consultation_fee?: string | number;
}

interface Props {
  item: DoctorItem;
  onPress?: (item: DoctorItem) => void;
  onChatPress?: (item: DoctorItem) => void;
}

const AllDoctorCard: React.FC<Props> = ({ item, onPress }) => {
  const [isWishlisted, setIsWishlisted] = useState(item?.is_favorite ?? false);

  const speciality = useMemo(() => {
    if (!Array.isArray(item?.health_diseases)) return '';
    return item.health_diseases.map(i => i?.name).filter(Boolean).join(', ');
  }, [item?.health_diseases]);

  const rating = Number(
    item?.average_rating ?? item?.ranking_score ?? item?.rating ?? 0,
  );
  const ratingLabel =
    Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : '—';
  const feeRaw = item?.consultation_fee;
  const hasFee =
    feeRaw != null && String(feeRaw).trim() !== '' && Number(feeRaw) >= 0;

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
    <DoctorListCard
      name={item?.name || item?.full_name}
      speciality={speciality}
      ratingLabel={ratingLabel}
      reviews={item?.total_reviews ?? item?.reviewCount ?? 0}
      experience={item?.experience_years || 0}
      feeLabel={hasFee ? String(feeRaw).replace(/\.0+$/, '') : null}
      imageUri={item?.profile_image?.trim?.() || ''}
      available={item?.has_availability === true}
      onPress={() => onPress?.(item)}
      topRight={
        <FavouriteButton
          isFavourite={isWishlisted}
          onPress={handleWishlist}
          size={16}
        />
      }
    />
  );
};

export default React.memo(AllDoctorCard);
