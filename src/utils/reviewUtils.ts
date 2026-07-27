import { Asset } from 'react-native-image-picker';
import { UploadProfilePhoto } from '../services/ProfileServices';

export type ReviewEntityType = 'doctor' | 'product';

export const REVIEW_UPLOAD_DIRS = {
  doctor: 'doctor-review',
  product: 'product-review',
} as const;

export type ReviewSubmitPayload = {
  rating: number;
  review: string;
  image_urls?: string[];
  appointment?: string;
  tags?: string[];
};

/** Normalize AWS / CDN URL from `user/upload/` responses across call sites. */
export const extractUploadUrl = (response: any): string => {
  const root = response?.data ?? response;
  const nested = root?.data ?? root;

  const url =
    nested?.url ??
    root?.url ??
    nested?.image ??
    root?.image ??
    nested?.profile_picture ??
    root?.profile_picture ??
    '';

  return url ? String(url) : '';
};

export const getReviewUploadDir = (entityType: ReviewEntityType) =>
  entityType === 'doctor'
    ? REVIEW_UPLOAD_DIRS.doctor
    : REVIEW_UPLOAD_DIRS.product;

export const buildReviewSubmitPayload = ({
  rating,
  review = '',
  imageUrls = [],
  entityType,
  appointmentId,
  isEdit = false,
  tags,
}: {
  rating: number;
  review?: string;
  imageUrls?: string[];
  entityType: ReviewEntityType;
  appointmentId?: string;
  isEdit?: boolean;
  tags?: string[];
}): ReviewSubmitPayload => {
  const payload: ReviewSubmitPayload = {
    rating,
    review: review.trim(),
  };

  const cleanedUrls = imageUrls.filter(Boolean);
  if (cleanedUrls.length) {
    payload.image_urls = cleanedUrls;
  }

  if (entityType === 'doctor' && appointmentId && !isEdit) {
    payload.appointment = appointmentId;
  }

  if (tags?.length) {
    payload.tags = tags;
  }

  return payload;
};

export const uploadReviewAsset = async (
  asset: Pick<Asset, 'uri' | 'type' | 'fileName'>,
  entityType: ReviewEntityType,
): Promise<string> => {
  if (!asset.uri) {
    throw new Error('Missing file uri');
  }

  const formData = new FormData();
  formData.append(
    'image',
    {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      name: asset.fileName || `review_${Date.now()}.jpg`,
    } as any,
  );
  formData.append('dir', getReviewUploadDir(entityType));

  const response = await UploadProfilePhoto(formData);
  const uploadedUrl = extractUploadUrl(response);

  if (!response?.success || !uploadedUrl) {
    throw new Error(response?.message || 'Upload failed');
  }

  return uploadedUrl;
};

export const collectReviewImageUrls = (reviews: any[] | null | undefined): string[] => {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return reviews.flatMap(item => {
    const fromImageUrls = Array.isArray(item?.image_urls) ? item.image_urls : [];
    const fromAttachments = Array.isArray(item?.attachments) ? item.attachments : [];
    return [...fromImageUrls, ...fromAttachments].filter(Boolean);
  });
};

export const getAverageRating = (reviews: any[] | null | undefined): number => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce((sum, item) => sum + Number(item?.rating ?? 0), 0);
  return Math.round((total / reviews.length) * 10) / 10;
};
