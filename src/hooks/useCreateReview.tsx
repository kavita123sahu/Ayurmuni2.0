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
    orderId,
    patientDietPlanId,
    reviewData,
    method = 'POST',
  }: {
    entityType: 'doctor' | 'product' | 'diet_plan' | string;
    appointmentId?: string;
    variantId?: string;
    orderId?: string;
    patientDietPlanId?: string;
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
        orderId: entityType === 'product' ? orderId : undefined,
        patientDietPlanId:
          entityType === 'diet_plan' ? patientDietPlanId : undefined,
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
