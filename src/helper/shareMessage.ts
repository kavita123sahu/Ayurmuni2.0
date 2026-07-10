export const getAppointmentShareMessage = ({
    doctorName,
    specialization,
    date,
    time,
    status,
    hospitalName,
}: any) => {

    return `🏥 *Appointment Confirmation*

👨‍⚕️ Doctor: ${doctorName || '-'}
🩺 Speciality: ${specialization || '-'}
🏥 Clinic/Hospital: ${hospitalName || '-'}

📅 Date: ${date || '-'}
⏰ Time: ${time || '-'}
📍 Status: ${status || 'Confirmed'}

Thank you for choosing Ayurmuni 🌿
Shared via Ayurmuni App`;
};