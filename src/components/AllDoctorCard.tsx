import React, { useCallback, useEffect, useMemo, useState } from 'react';

import DoctorListCard from './DoctorListCard';

import FavouriteButton from './FavouriteButton';

import * as _CONSULT_SERVICES from '../services/ConsultServce';

import { requireAuth } from '../services/guestAuth';

import { showSuccessToast } from '../config/Key';

import {

  getDoctorId,

  getDoctorFavoriteState,

  getFavoriteStateFromToggleResponse,

  getDoctorDisplayName,

  getDoctorRating,

  formatDoctorExperience,

  getDoctorAvailabilityLabel,

} from '../utils/doctorUtils';



type ProfileImage =

  | string

  | {

      url?: string;

    }

  | null

  | undefined;



export interface DoctorItem {

  id?: string | number;

  doctor_id?: string | number;

  is_favorite?: boolean;

  is_favourite?: boolean;

  image?: ProfileImage;

  name?: string;

  full_name?: string;

  health_diseases?: Array<{ name?: string }>;

  profile_image?: ProfileImage;

  experience_years?: string | number;

  /** Alias used by some list APIs */
  experience?: string | number;

  average_rating?: string | number;

  rating?: number;

  reviewCount?: number;

  total_reviews?: number;

  has_availability?: boolean;

  ranking_score?: number;

  availableInMinutes?: number;

  consultation_fee?: string | number;

}



interface Props {

  item: DoctorItem;

  onPress?: (item: DoctorItem) => void;

  onChatPress?: (item: DoctorItem) => void;

  variant?: 'list' | 'grid';

  cardWidth?: number;

}



const resolveProfileImageUri = (img?: ProfileImage): string => {

  if (typeof img === 'string') {

    return img.trim();

  }

  if (img && typeof img === 'object' && img.url) {

    return String(img.url).trim();

  }

  return '';

};



const AllDoctorCard: React.FC<Props> = ({

  item,

  onPress,

  variant = 'list',

  cardWidth,

}) => {

  const [isWishlisted, setIsWishlisted] = useState(

    getDoctorFavoriteState(item),

  );

  const doctorId = getDoctorId(item);



  const speciality = useMemo(() => {

    if (!Array.isArray(item?.health_diseases)) return '';

    return item.health_diseases.map(i => i?.name).filter(Boolean).join(', ');

  }, [item?.health_diseases]);



  const rating = getDoctorRating(item);

  const ratingLabel =

    rating > 0 ? rating.toFixed(1) : '—';

  const feeRaw = item?.consultation_fee;

  const hasFee =

    feeRaw != null && String(feeRaw).trim() !== '' && Number(feeRaw) >= 0;



  const imageUri = useMemo(

    () => resolveProfileImageUri(item?.profile_image ?? item?.image),

    [item?.profile_image, item?.image],

  );



  useEffect(() => {

    setIsWishlisted(getDoctorFavoriteState(item));

  }, [

    item?.is_favorite,

    item?.is_favourite,

    item?.id,

    item?.doctor_id,

  ]);



  const handleWishlist = useCallback(async () => {

    if (!doctorId) {

      showSuccessToast('Doctor unavailable', 'error');

      return;

    }

    if (!(await requireAuth('Please login to save favourite doctors'))) {

      return;

    }



    const previous = isWishlisted;

    setIsWishlisted(!previous);



    try {

      const response = await _CONSULT_SERVICES.ToggleFavDoctor(

        doctorId,

        'POST',

      );

      if (!response?.success) {

        setIsWishlisted(previous);

        showSuccessToast(

          response?.message || 'Failed to update favourite',

          'error',

        );

        return;

      }



      const next = getFavoriteStateFromToggleResponse(response);

      if (next !== undefined) {

        setIsWishlisted(next);

      }

    } catch {

      setIsWishlisted(previous);

      showSuccessToast('Failed to update favourite', 'error');

    }

  }, [isWishlisted, doctorId]);



  return (

    <DoctorListCard

      name={getDoctorDisplayName(item)}

      speciality={speciality}

      ratingLabel={ratingLabel}

      reviews={item?.total_reviews ?? item?.reviewCount ?? 0}

      experience={formatDoctorExperience(item?.experience_years ?? item?.experience)}

      feeLabel={hasFee ? String(feeRaw).replace(/\.0+$/, '') : null}

      imageUri={imageUri}

      available={item?.has_availability === true}

      availabilityLabel={getDoctorAvailabilityLabel(item)}

      onPress={() => onPress?.(item)}

      onConsultPress={() => onPress?.(item)}

      variant={variant}

      cardWidth={cardWidth}

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

