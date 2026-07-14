import { useState } from 'react';
import { createReview } from '../services/ProfileServices';

interface ReviewPayload {
  rating: number;
  review: string;
  appointment?: string;
  image_urls?: string[];
}

export const useCreateReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

const submitReview = async ({
 entityType,
  appointmentId,
  reviewData,
  method = 'POST',
}: {
  entityType: string;
  appointmentId: string;
  reviewData: ReviewPayload;
  method?: 'POST' | 'PATCH';
}) => {
  try {
    setLoading(true);
    setError(null);

    const response = await createReview({
      entityType,
      appointmentId,
      reviewData,
      method
    });

    return response; // API ka actual response return karo
  } catch (err: any) {
    setError(err);

    return {
      success: false,
      message:
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong",
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