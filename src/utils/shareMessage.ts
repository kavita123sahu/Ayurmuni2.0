import { formatRupee } from './currencyUtils';

export const getProductShareMessage = (args: {
  name?: string | null;
  size?: string | null;
  price?: string | number | null;
  url?: string | null;
}) => {
  const lines = [
    args.name ? `🌿 ${args.name}` : 'Check out this Ayurmuni product',
    args.size ? `Size: ${args.size}` : null,
    args.price != null && args.price !== ''
      ? `Price: ${formatRupee(args.price)}`
      : null,
    args.url || null,
    'Shared via Ayurmuni App',
  ].filter(Boolean);

  return lines.join('\n');
};

export const getAppointmentShareMessage = (args: {
  doctorName?: string | null;
  patientPhone?: string | null;
  date?: string | null;
  time?: string | null;
  status?: string | null;
  hospitalName?: string | null;
  consultationMode?: string | null;
}) => {
  const mode = String(args.consultationMode || 'Video consultation').trim();
  const isVideo =
    /video|online|virtual/i.test(mode) || !/in[- ]?person|clinic/i.test(mode);
  const phone = String(args.patientPhone || '').trim();

  const lines = [
    '🏥 *Ayurmuni Appointment Confirmation*',
    '',
    `👨‍⚕️ Doctor: ${args.doctorName || '—'}`,
    args.hospitalName ? `🏥 Clinic: ${args.hospitalName}` : null,
    '',
    `📅 Date: ${args.date || '—'}`,
    `⏰ Time: ${args.time || '—'}`,
    `📍 Status: ${args.status || 'Confirmed'}`,
    mode ? `💻 Mode: ${mode}` : null,
    phone ? `📞 Patient contact: ${phone}` : null,
    '',
    '— How to join (Ayurmuni App only) —',
    '1. Open the *Ayurmuni* app on your phone.',
    '2. Go to *My Appointments* from Home or Profile.',
    phone
      ? `3. Sign in with the registered patient number *${phone}*.`
      : '3. Sign in with the registered patient mobile number used for this booking.',
    '4. Open this appointment and tap *Join* / *Start consultation*.',
    isVideo
      ? '5. Allow camera & microphone when prompted for your video call.'
      : '5. Follow in-app directions for your clinic visit.',
    '6. Do not use external links — consultation works only inside Ayurmuni.',
    '',
    'Thank you for choosing Ayurmuni 🌿',
    'Shared via Ayurmuni App',
  ];

  return lines.filter(line => line != null).join('\n');
};
