
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


/**
 * POST create review:
 *   review/?entity_type=doctor
 *   review/?entity_type=product
 * (IDs go in the body — not the query string.)
 *
 * GET list reviews (use ProductServices.getReviewsAll):
 *   review/?entity_type=doctor&doctor_id=
 *   review/?entity_type=product&variant_id=
 */
export const buildReviewEndpoint = ({
  entityType,
}: {
  entityType: 'doctor' | 'product' | string;
}) => {
  const normalizedType = String(entityType).toLowerCase();

  if (normalizedType === 'doctor') {
    return 'review/?entity_type=doctor';
  }

  if (normalizedType === 'product') {
    return 'review/?entity_type=product';
  }

  throw new Error('Unsupported review entity type');
};

export const createReview = async ({
  entityType,
  appointmentId,
  variantId,
  orderId,
  reviewData,
  method: _method = 'POST',
}: {
  entityType: 'doctor' | 'product' | string;
  appointmentId?: string;
  variantId?: string;
  orderId?: string;
  reviewData: {
    rating: number;
    review: string;
    image_urls?: string[];
    appointment_id?: string;
    appointment?: string;
    order_id?: string;
    variant_id?: string;
    tags?: string[];
  };
  method?: 'POST' | 'PATCH';
}) => {
  try {
    const normalizedType = String(entityType).toLowerCase();
    const endpoint = buildReviewEndpoint({ entityType: normalizedType });

    const payload: Record<string, unknown> = {
      rating: reviewData.rating,
      review: reviewData.review,
    };

    if (reviewData.image_urls?.length) {
      payload.image_urls = reviewData.image_urls;
    }

    if (normalizedType === 'doctor') {
      const appointment_id =
        appointmentId ||
        reviewData.appointment_id ||
        reviewData.appointment;
      if (!appointment_id) {
        throw new Error('appointment_id is required for doctor reviews');
      }
      payload.appointment_id = appointment_id;
    }

    if (normalizedType === 'product') {
      const variant_id = variantId || reviewData.variant_id;
      const order_id = orderId || reviewData.order_id;
      if (!variant_id) {
        throw new Error('variant_id is required for product reviews');
      }
      if (!order_id) {
        throw new Error('order_id is required for product reviews');
      }
      payload.variant_id = variant_id;
      payload.order_id = order_id;
    }

    if (reviewData.tags?.length) {
      payload.tags = reviewData.tags;
    }

    // One review per entity — never PATCH/edit from the app
    return await apiClient(endpoint, {
      method: 'POST',
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