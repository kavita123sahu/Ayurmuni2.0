
import { BaseUrl, Method } from "../config/Key";
import { Utils } from "../common/Utils";
import { apiClient } from "./APIconfig";
import { formatExperienceParam } from "../utils/searchUtils";
import { Buffer } from 'buffer';

export const filteredParams = (
    params?: Record<string, any>,
) => {

    return Object.fromEntries(
        Object.entries(params || {})
            .filter(
                ([_, value]) =>
                    value !== undefined &&
                    value !== null &&
                    value !== '',
            ),
    );
};

/** Builds query string for GET /customers/doctors/ with correct encoding. */
export const buildDoctorsQueryString = (
    params?: Record<string, any>,
): string => {
    const clean = filteredParams(params);
    if (clean.experience) {
        clean.experience = formatExperienceParam(String(clean.experience));
    }
    return Object.entries(clean)
        .map(
            ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
        )
        .join('&');
};
export const getHomePage = async () => {
    return new Promise(async (resolve, reject) => {
        try {

            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.base_url + 'catalogs/homepage/', fetchParameter);
            resolve(serverResponse);



        }
        catch (error) {
            reject(error);
        }
    })
}


export const getAllDoctor = async (payload: object) => {
    try {
        const query = buildDoctorsQueryString(payload as Record<string, any>);
        const response = await apiClient(
            query ? `customers/doctors/?${query}` : 'customers/doctors/',
            { method: 'GET' },
        );
        return response;
    } catch (error) {
        throw error;
    }
}


export const getTopDoctor = async () => {
    try {
        const response = await apiClient('customers/doctors/', {
            method: 'GET'
        });

        return response;
    } catch (error) {
        throw error;
    }
}



export const ToggleFavDoctor = async (doctorID: string, method: 'POST') => {
    try {
        const response = await apiClient(`favorites/doctors/?doctor_id=${doctorID}`, {
            method: method
        });

        return response;
    } catch (error) {
        throw error;
    }
}


export const AllDoctorData = async () => {
    try {
        const response = await apiClient('customers/doctors/', {
            method: 'GET'
        });
        return response;
    } catch (error) {
        throw error;
    }
}


export const getMedicalReceipt = async (appointmentId: string) => {
    try {
        const response = await apiClient(`customers/doctors/consultation-receipt/?consultation_id=${appointmentId}`, {
            method: 'GET'
        });
        console.log("getPrescriptionAPIresponse", response)

        return response;
    } catch (error) {
        throw error;
    }
}


// export const getAppointmentDetail = async (appointmentId: string) => {


//     const fetchByParam = (param: 'appointment_id' | 'consultation_id') =>
//         apiClient(
//             `customers/patient/consultation/?appointment_id${param}=${encodeURIComponent(id)}`,
//             { method: 'GET' },
//         );

//     let response = await fetchByParam('appointment_id');
//     if (response?.success) {
//         return response;
//     }

//     const message = String(response?.message || '').toLowerCase();
//     const notFound =
//         response?.status === 404 ||
//         message.includes('not found') ||
//         message.includes('does not exist');

//     if (notFound) {
//         response = await fetchByParam('consultation_id');
//     }

//     return response;
// };


export const getAppointmentDetail = async (lookupId: string) => {
    const tryFetch = async (param: 'appointment_id' | 'consultation_id') =>
        apiClient(
            `customers/patient/consultation/?${param}=${encodeURIComponent(lookupId)}`,
            { method: 'GET' },
        );

    let response = await tryFetch('appointment_id');
    if (response?.success) {
        return response;
    }

    const message = String(response?.message || '').toLowerCase();
    const notFound =
        response?.status === 404 ||
        message.includes('not found') ||
        message.includes('does not exist');

    if (notFound || !response?.success) {
        response = await tryFetch('consultation_id');
    }

    return response;
};

/**
 * Download prescription PDF from backend (same pattern as order invoice).
 * GET customers/prescription/download/?prescription_id=...
 */
export const downloadPrescriptionFile = async (
  prescriptionID: string | number,
) => {
  const token: string | null = await Utils.getData('_TOKEN');

  if (!token) {
    throw new Error('Not authenticated');
  }

  const url =
    `${BaseUrl?.base_url}` +
    `customers/prescription/download/?prescription_id=${prescriptionID}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/pdf, application/octet-stream, application/json, */*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errMsg = `Prescription download failed: ${response.status}`;

    try {
      const errBody = await response.text();
      if (errBody) {
        errMsg += ` — ${errBody.slice(0, 300)}`;
      }
    } catch {}

    throw new Error(errMsg);
  }

  const contentType = (
    response.headers.get('content-type') || ''
  ).toLowerCase();

  console.log('Prescription content type:', contentType);

  /**
   * CASE 1:
   * Backend directly returns PDF
   */
  if (contentType.includes('application/pdf')) {
    const arrayBuffer = await response.arrayBuffer();

    return {
      success: true,
      status: response.status,
      data: arrayBuffer,
    };
  }

  /**
   * CASE 2:
   * Backend returns JSON
   */
  if (contentType.includes('application/json')) {
    const json = await response.json();

    console.log(
      'Prescription JSON response:',
      JSON.stringify(json, null, 2),
    );

    /**
     * Check all commonly used URL keys.
     */
    const pdfUrl =
      json?.data?.url ||
      json?.data?.file_url ||
      json?.data?.pdf_url ||
      json?.data?.prescription_url ||
      json?.data?.download_url ||
      json?.url ||
      json?.file_url ||
      json?.pdf_url ||
      json?.prescription_url ||
      json?.download_url;

    /**
     * Backend returned a PDF URL
     */
    if (pdfUrl) {
      console.log('Prescription PDF URL:', pdfUrl);

      const pdfResponse = await fetch(pdfUrl);

      if (!pdfResponse.ok) {
        throw new Error(
          `Prescription PDF fetch failed: ${pdfResponse.status}`,
        );
      }

      const pdfContentType =
        pdfResponse.headers.get('content-type') || '';

      console.log(
        'Downloaded PDF content type:',
        pdfContentType,
      );

      return {
        success: true,
        status: pdfResponse.status,
        data: await pdfResponse.arrayBuffer(),
      };
    }

    /**
     * Backend may directly return base64
     */
    const base64 =
      json?.data?.base64 ||
      json?.base64 ||
      json?.data?.pdf_base64 ||
      json?.pdf_base64;

    if (base64) {
      return {
        success: true,
        status: response.status,
        base64,
      };
    }

    /**
     * API returns structured prescription JSON (no PDF URL).
     * Caller formats + saves this locally (same pattern as medical receipt).
     */
    const prescriptionData =
      json?.data && typeof json.data === 'object' ? json.data : null;

    if (
      prescriptionData &&
      (prescriptionData.prescription_code ||
        prescriptionData.medicines ||
        prescriptionData.id ||
        prescriptionData.doctor ||
        prescriptionData.patient)
    ) {
      return {
        success: true,
        status: response.status,
        prescriptionData,
      };
    }

    throw new Error(
      'Prescription PDF URL/data not found in API response',
    );
  }

  /**
   * Fallback:
   * Assume response is binary PDF.
   */
  return {
    success: true,
    status: response.status,
    data: await response.arrayBuffer(),
  };
};

export const getPrescriptionDetail = async (doctor_id: string) => {
    try {
        const response = await apiClient(`customers/doctor-slip/?doctor_id=${doctor_id}`, {
            method: 'GET'
        });
        console.log("getPrescriptionAPIresponse", response)

        return response;
    } catch (error) {
        throw error;
    }
}

export const getRecentVisitedDoctors = async () => {
    try {
        const response = await apiClient('customers/doctors/recent/', {
            method: 'GET',
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const RecentConsultHistory = async () => {
    try {

        const response = await apiClient(
            'customers/doctors/consultation-history/',
            {
                method: 'GET',
            },
        );

        return response;
    } catch (error) {
        throw error;
    }
};

export const getConsultHistory = async (payload: any) => {
    try {
        const cleanPayload = Object.fromEntries(
            Object.entries(payload).filter(
                ([_, value]) =>
                    value !== undefined &&
                    value !== null &&
                    value !== '',
            ),
        );

        const query = new URLSearchParams(
            cleanPayload as Record<string, string>,
        ).toString();

        const response = await apiClient(
            `customers/doctors/consultation-history/?${query}`,
            {
                method: 'GET',
            },
        );

        return response;
    } catch (error) {
        throw error;
    }
};


export const getDoctorSlots = async (
    payload: object,
) => {

    try {

        const cleanPayload =
            Object.fromEntries(
                Object.entries(payload)
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
            'Final Query Paramsurllll:',
            query,
        );

        const response =
            await apiClient(
                `customers/doctors/?${query}`,
                {
                    method: 'GET',
                },
            );

        console.log("docotorResposne", response);

        return response;

    } catch (error) {

        throw error;
    }
};


export const appointmentActionAPI = async ({
    appointmentId,
    payload,
}: {
    appointmentId: string;
    payload: {
        action: "reschedule" | "cancel" | "confirm_reschedule";
        availability?: string;
        reschedule_reason?: string;
        cancellation_reason?: string;
    };
}) => {
    try {
        const response = await apiClient(
            `customers/doctors/appointments/action/?id=${appointmentId}`,
            {
                method: "POST",
                body: JSON.stringify(payload),
            }
        );

        return response;
    } catch (error) {
        throw error;
    }
};


export const getFilterTopDoctor = async (
    payload: object,
) => {

    try {
        const query = buildDoctorsQueryString(payload as Record<string, any>);

        const response =
            await apiClient(
                query ? `customers/doctors/?${query}` : 'customers/doctors/',
                {
                    method: 'GET',
                },
            );

        return response;

    } catch (error) {

        throw error;
    }
};


export const getConsultCategory = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + 'user/health-categories/', fetchParameter);
            let response = await serverResponse.json();
            console.log("catggggggggggggggggg", response)
            resolve(response);
        }

        catch (error) {
            reject(error);
        }
    })
}



export const createConsultationPayment = async (data: object) => {
    try {
        // Drop empty / undefined fields so optional coupon_code is omitted when unused
        const clean = Object.fromEntries(
            Object.entries(data as Record<string, unknown>).filter(
                ([, v]) =>
                    v !== undefined &&
                    v !== null &&
                    !(typeof v === 'string' && v.trim() === ''),
            ),
        );
        console.log('CONSULT_BOOK_PAYLOAD =>', JSON.stringify(clean, null, 2));
        const response = await apiClient('payments/customer/consultation/payment/book-slot/', {
            method: 'POST',
            body: JSON.stringify(clean)
        });

        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * Retry Razorpay checkout for an appointment whose payment was already created.
 * GET/POST /payments/customer/consultation/payment/retry/?appointment_id=
 */
export const retryConsultationPayment = async (appointmentId: string | number) => {
    try {
        const id = encodeURIComponent(String(appointmentId));
        console.log('CONSULT_RETRY => appointment_id=', appointmentId);
        const response = await apiClient(
            `payments/customer/consultation/payment/retry/?appointment_id=${id}`,
            { method: 'POST' },
        );
        return response;
    } catch (error) {
        throw error;
    }
};

/** GET /payments/customer/consultation/fee-quote/?slot_id= */
export const getConsultationFeeQuote = async (slotId: string | number) => {
    try {
        const response = await apiClient(
            `payments/customer/consultation/fee-quote/?slot_id=${encodeURIComponent(String(slotId))}`,
            { method: 'GET' },
        );
        return response;
    } catch (error) {
        throw error;
    }
};


export const verifyConsultationPayment = async (data: object) => {
    try {
        const response = await apiClient('payments/customer/consultation/payment/verify-payment/', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        return response;
    } catch (error) {
        throw error;
    }
}


export const getNotification = async (payload: Record<string, string | number | boolean>) => {
    const query = new URLSearchParams(
        Object.entries(payload).reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
        }, {}),
    ).toString();

    return apiClient(`notifications/?${query}`, {
        method: "GET",
    });
};

/** POST actions: read, clear, delete (per API: ?action=read&notification_id=… or &all=true) */
export const manageNotification = async (payload: Record<string, string | number | boolean>) => {
    const query = new URLSearchParams(
        Object.entries(payload).reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
        }, {}),
    ).toString();

    return apiClient(`notifications/?${query}`, {
        method: "POST",
    });
};

