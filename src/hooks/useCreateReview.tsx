import { useState } from 'react';
import { createReview } from '../services/ProfileServices';

interface ReviewPayload {
  appointment: string;
  rating: number;
  review: string;
}

export const useCreateReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const submitReview = async (
    payload: ReviewPayload,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await createReview(payload);

      return {
        success: true,
        data: response,
      };
    } catch (err: any) {
      setError(err);

      return {
        success: false,
        error: err?.response?.data || err?.message,
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