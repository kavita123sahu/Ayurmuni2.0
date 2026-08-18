export const getProductShareMessage = ({
    name,
    size,
    price,
    url,
}: {
    name?: string | null;
    size?: string | null;
    price?: string | number | null;
    url?: string | null;
}) => {
    const lines = [
        name ? `🌿 ${name}` : 'Check out this Ayurmuni product',
        size ? `Size: ${size}` : null,
        price != null && price !== '' ? `Price: ₹${price}` : null,
        url || null,
        'Shared via Ayurmuni App',
    ].filter(Boolean);

    return lines.join('\n');
};

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