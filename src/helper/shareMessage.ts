export const getAppointmentShareMessage = ({
    doctorName,
    specialization,
    date,
    time,
    status,
    hospitalName,
}: any) => {

    return `
🏥 Appointment Details

👨‍⚕️ Doctor:${doctorName || '-'}

🩺 Speciality:${specialization || '-'}

📅 Date:${date || '-'}

⏰ Time:${time || '-'}

📍 Status:${status || 'Confirmed'}

🏥 Hospital:${hospitalName || '-'}

Shared via Ayurmuni App
`;
};