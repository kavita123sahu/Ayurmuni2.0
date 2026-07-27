import { useState } from 'react';
import { createReview } from '../services/ProfileServices';
import type { ReviewSubmitPayload } from '../utils/reviewUtils';

interface ReviewPayload extends ReviewSubmitPayload {}
export const useCreateReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const submitReview = async ({
    entityType,
    appointmentId,
    variantId,
    reviewData,
    method = 'POST',
  }: {
    entityType: 'doctor' | 'product' | string;
    appointmentId?: string;
    variantId?: string;
    reviewData: ReviewPayload;
    method?: 'POST' | 'PATCH';
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await createReview({
        entityType,
        appointmentId: entityType === 'doctor' ? appointmentId : undefined,
        variantId: entityType === 'product' ? variantId : undefined,
        reviewData,
        method,
      });

      return response;
    } catch (err: any) {
      setError(err);

      return {
        success: false,
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Something went wrong',
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submitReview,
  };
};
