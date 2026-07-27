
import { appointmentActionAPI } from "../services/ConsultServce";


interface ActionParams {
  appointmentId: string;
  payload: {
    action: "cancel" | "reschedule" | 'confirm_reschedule';
    availability?: any;
    reschedule_reason?: string;
    cancellation_reason?: string;
  }
}

export const handleAppointmentAction = async ({
  appointmentId,
  payload,
}: ActionParams) => {
  try {

    console.log("FinalPayload =>", payload);

    const res = await appointmentActionAPI({
      appointmentId,
      payload,
    });

    return res;
  } catch (error) {
    throw error;
  }
};