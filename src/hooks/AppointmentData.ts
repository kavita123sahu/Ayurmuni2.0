import { appointmentActionAPI } from "../services/ConsultServce";

export type AppointmentAction =
  | "cancel"
  | "reschedule"
  | "confirm_reschedule"
  | "mark_doctor_missed";

interface ActionParams {
  appointmentId: string;
  payload: {
    action: AppointmentAction;
    availability?: string | number;
    reschedule_reason?: string;
    cancellation_reason?: string;
    cancellation_reason_detail?: string;
    missed_reason?: string;
  };
}

export const handleAppointmentAction = async ({
  appointmentId,
  payload,
}: ActionParams) => {
  try {
    const normalized = {
      ...payload,
      availability:
        payload.availability != null
          ? String(payload.availability).trim()
          : undefined,
    };
    console.log("FinalPayload =>", normalized);

    const res = await appointmentActionAPI({
      appointmentId,
      payload: normalized,
    });
    console.log("appointmnetcancelwhile", res);
    return res;
  } catch (error) {
    throw error;
  }
};
