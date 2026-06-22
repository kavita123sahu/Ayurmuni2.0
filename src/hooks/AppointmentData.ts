import { showSuccessToast } from "../config/Key";
import { appointmentActionAPI } from "../services/ConsultServce";

type ActionParams = {
  appointmentId: string;
  action: "cancel" | "reschedule";
  availability?: any;
  reschedule_reason?: string;
  cancellation_reason?: string;
  onSuccess?: () => void;
  onFinally?: () => void;
};

export const handleAppointmentAction = async ({
  appointmentId,
  action,
  availability,
  reschedule_reason,
  cancellation_reason,
  onSuccess,
  onFinally,
}: ActionParams) => {
  try {
    const payload: any = {
      action,
    };

    if (action === "reschedule") {
      payload.availability = availability;
      payload.reschedule_reason = reschedule_reason;
    }

    if (action === "cancel") {
      payload.cancellation_reason =
        cancellation_reason;
    }

    const res = await appointmentActionAPI({
      appointmentId,
      payload,
    });

    const message =
      res?.message ||
      `${action} successful`;

    if (res?.success) {
      showSuccessToast(message, "success");
      onSuccess?.();
    }

    return res;
  } catch (error: any) {
    console.log(
      `${action} Error`,
      error,
    );

    const errMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";

    showSuccessToast(errMsg, "error");

    throw error;
  } finally {
    onFinally?.();
  }
};