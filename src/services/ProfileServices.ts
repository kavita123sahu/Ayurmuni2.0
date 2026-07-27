
import { apiClient } from "./APIconfig";


export const update_Profile = async (data: any) => {
    try {
        const response = await apiClient('customers/profile/', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        console.log("response", response);
        return response;
    } catch (error) {
        throw error;
    }
}


export const user_profile = async () => {
    try {
        const response = await apiClient('customers/profile/', {
            method: 'GET',
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteAccount = async () => {
    try {
        const response = await apiClient('customers/profile/', {
            method: 'DELETE',
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const createDoctorReview = async (
    ReviewQuery: object,
    payload: object,
) => {
    try {

        const cleanPayload =
            Object.fromEntries(
                Object.entries(ReviewQuery)
                    .filter(
                        ([_, value]) =>
                            value !== undefined &&
                            value !== null &&
                            value !== '',
                    ),
            );

        const query =
            new URLSearchParams(
                cleanPayload as any,
            ).toString();

        console.log(
            'Review Query Params:',
            query,
        );

        const response =
            await apiClient(
                `review/?${query}`,
                {
                    method: 'POST',
                    body: JSON.stringify(payload)
                },
            );

        return response;

    } catch (error) {
        throw error;
    }
};


export const buildReviewEndpoint = ({
  entityType,
  appointmentId,
  variantId,
}: {
  entityType: 'doctor' | 'product' | string;
  appointmentId?: string;
  variantId?: string;
}) => {
  const normalizedType = String(entityType).toLowerCase();

  if (normalizedType === 'doctor') {
    if (!appointmentId) {
      throw new Error('appointment_id is required for doctor reviews');
    }
    return `review/?entity_type=doctor&appointment_id=${encodeURIComponent(appointmentId)}`;
  }

  if (normalizedType === 'product') {
    if (!variantId) {
      throw new Error('variant_id is required for product reviews');
    }
    return `review/?entity_type=product&variant_id=${encodeURIComponent(variantId)}`;
  }

  throw new Error('Unsupported review entity type');
};

export const createReview = async ({
  entityType,
  appointmentId,
  variantId,
  reviewData,
  method = 'POST',
}: {
  entityType: 'doctor' | 'product' | string;
  appointmentId?: string;
  variantId?: string;
  reviewData: {
    rating: number;
    review: string;
    image_urls?: string[];
    appointment?: string;
    tags?: string[];
  };
  method?: 'POST' | 'PATCH';
}) => {
  try {
    const endpoint = buildReviewEndpoint({ entityType, appointmentId, variantId });
    const payload = {
      rating: reviewData.rating,
      review: reviewData.review,
      ...(reviewData.image_urls?.length ? { image_urls: reviewData.image_urls } : {}),
      ...(entityType === 'doctor' && reviewData.appointment
        ? { appointment: reviewData.appointment }
        : {}),
      ...(reviewData.tags?.length ? { tags: reviewData.tags } : {}),
    };

    return await apiClient(endpoint, {
      method,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw error;
  }
};


export const UploadProfilePhoto = async (data: FormData) => {
    try {
        const response = await apiClient('user/upload/', {
            method: 'POST',
            body: data
        });

        return response;
    } catch (error) {
        throw error;
    }
}




export const getAddresses = async () => {
    try {
        const response = await apiClient('customers/address/', {
            method: 'GET',
        });

        return response;
    } catch (error) {
        throw error;
    }
};

export const AddAddresses = async (data: any) => {
    try {
        const response = await apiClient('customers/address/', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        return response;
    } catch (error) {
        throw error;
    }
};


export const UpdateAddresses = async (AddressID: any, data: any) => {
    try {
        const response = await apiClient(`customers/address/?id=${AddressID}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const DeleteAddresses = async (AddressID: any) => {
    try {
        const response = await apiClient(`customers/address/?id=${AddressID}`, {
            method: 'DELETE',
        });
        return response;
    } catch (error) {
        throw error;
    }
};


export const get_prakriti_info = async () => {
    try {
        const response = await apiClient(`customers/prakriti/info/`, {
            method: 'GET',
        });
        return response;
    } catch (error) {
        throw error;
    }
};