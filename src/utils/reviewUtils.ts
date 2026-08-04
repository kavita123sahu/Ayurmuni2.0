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

export const normalizeReviewMediaUrls = (review: any): string[] => {
  if (!review || typeof review !== 'object') {
    return [];
  }

  const urls: string[] = [];
  const push = (value: unknown) => {
    if (!value) return;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) urls.push(trimmed);
      return;
    }
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const candidate =
        record.url ??
        record.image_urls ??
        record.file_url ??
        record.media_url ??
        record.uri ??
        record.image;
      if (typeof candidate === 'string' && candidate.trim()) {
        urls.push(candidate.trim());
      }
    }
  };

  (Array.isArray(review.image_urls) ? review.image_urls : []).forEach(push);
  (Array.isArray(review.attachments) ? review.attachments : []).forEach(push);
  push(review.media_url);

  // de-dupe while preserving order
  return Array.from(new Set(urls));
};

export const collectReviewImageUrls = (reviews: any[] | null | undefined): string[] => {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return reviews.flatMap(normalizeReviewMediaUrls);
};

/** Ensure ReviewPage / gallery receive a flat `image_urls` array (doctor + product). */
export const normalizeReviewsForDisplay = (reviews: any[] | null | undefined): any[] => {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return reviews.map(review => ({
    ...review,
    image_urls: normalizeReviewMediaUrls(review),
    patient_name:
      review?.patient_name ||
      review?.reviewer_name ||
      review?.name ||
      'Patient',
    reviewer_name:
      review?.reviewer_name ||
      review?.patient_name ||
      review?.name ||
      'Patient',
  }));
};

export const isReviewVideoUrl = (url?: string | null): boolean => {
  if (!url) return false;
  return /\.(mp4|mov|m4v|webm)(\?|$)/i.test(String(url));
};

export const getAverageRating = (reviews: any[] | null | undefined): number => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce((sum, item) => sum + Number(item?.rating ?? 0), 0);
  return Math.round((total / reviews.length) * 10) / 10;
};
