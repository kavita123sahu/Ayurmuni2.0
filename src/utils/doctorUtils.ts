/** Resolve canonical doctor id for favorites / navigation APIs. */
export const getDoctorId = (item: any): string => {
  if (!item) return '';
  const raw =
    item?.doctor_id ??
    item?.id ??
    item?.doctorId ??
    item?.user_id ??
    '';
  return String(raw).trim();
};

/** Read favorite flag from doctor list / profile payloads. */
export const getDoctorFavoriteState = (item: any): boolean => {
  if (!item) return false;
  const raw =
    item?.is_favorite ??
    item?.is_favourite ??
    item?.isFavorite ??
    item?.favorite ??
    false;
  return raw === true || raw === 'true' || raw === 1 || raw === '1';
};

/** Read favorite state from toggle API response. */
export const getFavoriteStateFromToggleResponse = (
  response: any,
): boolean | undefined => {
  if (!response) return undefined;
  const raw =
    response?.is_favorite ??
    response?.is_favourite ??
    response?.data?.is_favorite ??
    response?.data?.is_favourite ??
    response?.data?.favorite;
  if (raw === undefined || raw === null) return undefined;
  return raw === true || raw === 'true' || raw === 1 || raw === '1';
};

/** Full display name from doctor list / profile payloads. */
export const getDoctorDisplayName = (item: any): string => {
  if (!item) return 'Doctor';
  const name = String(
    item?.doctor_name ??
      item?.full_name ??
      item?.name ??
      [item?.first_name, item?.last_name].filter(Boolean).join(' ') ??
      '',
  ).trim();
  return name || 'Doctor';
};

/** Resolve doctor avatar URI across list / profile / appointment payloads. */
export const resolveDoctorProfileImageUri = (doctor: any): string => {
  if (!doctor) return '';

  const candidates = [
    doctor.profile_image,
    doctor.doctor_image,
    doctor.image,
    doctor.profile_picture,
    doctor.avatar,
    doctor?.doctor?.profile_image,
    doctor?.doctor?.doctor_image,
    doctor?.doctor?.image,
  ];

  for (const img of candidates) {
    if (!img) continue;
    if (typeof img === 'string') {
      const uri = img.trim();
      if (uri) return uri;
      continue;
    }
    if (typeof img === 'object') {
      const uri = String(
        img.url || img.uri || img.media_url || img.image_url || '',
      ).trim();
      if (uri) return uri;
    }
  }

  return '';
};

/** Numeric rating from doctor payloads. */
export const getDoctorRating = (item: any): number => {
  const raw =
    item?.average_rating ??
    item?.rating ??
    item?.review?.rating ??
    item?.ranking_score ??
    0;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
};

/** Format experience as "12 Yrs Exp". */
export const formatDoctorExperience = (
  value: string | number | null | undefined,
): string => {
  const raw = String(value ?? '').trim();
  const match = raw.match(/(\d+)/);
  const years = match ? match[1] : raw && /^\d+$/.test(raw) ? raw : '0';
  return `${years} Yrs Exp`;
};

const toFeeNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** `configurations.consultation.global_fee` when present and greater than 0. */
export const readGlobalConsultationFee = (source: any): number | null => {
  if (!source || typeof source !== 'object') return null;
  const candidates = [
    source?.configurations?.consultation?.global_fee,
    source?.configuration?.consultation?.global_fee,
    source?.doctor?.configurations?.consultation?.global_fee,
    source?.info?.configurations?.consultation?.global_fee,
    source?.data?.configurations?.consultation?.global_fee,
  ];
  for (const raw of candidates) {
    const fee = toFeeNumber(raw);
    if (fee != null && fee > 0) return fee;
  }
  return null;
};

/**
 * Display fee for doctor catalog APIs.
 * Prefer global_fee when it is available and > 0, otherwise consultation_fee.
 */
export const resolveConsultationFee = (
  source: any,
  fallback?: unknown,
): number | null => {
  const globalFee = readGlobalConsultationFee(source);
  if (globalFee != null && globalFee > 0) return globalFee;

  const fee = toFeeNumber(
    source?.consultation_fee ??
      source?.consult_fee?.amount ??
      source?.consult_fee ??
      fallback,
  );
  return fee;
};

export const formatConsultationFeeLabel = (source: any): string | null => {
  const fee = resolveConsultationFee(source);
  if (fee == null || fee < 0) return null;
  return String(fee).replace(/\.0+$/, '');
};

/** Copy global_fee onto consultation_fee so every consumer of these APIs shows it. */
export const applyDoctorFeesToResponse = (response: any) => {
  if (!response || typeof response !== 'object') return response;
  const data = response.data;
  if (data == null) return response;

  const wrapperGlobal =
    readGlobalConsultationFee(data) ?? readGlobalConsultationFee(response);

  const stamp = (item: any) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
    const globalFee = readGlobalConsultationFee(item) ?? wrapperGlobal;
    if (globalFee == null || globalFee <= 0) return item;
    return { ...item, consultation_fee: globalFee };
  };

  if (Array.isArray(data)) {
    return { ...response, data: data.map(stamp) };
  }
  if (Array.isArray(data.results)) {
    return {
      ...response,
      data: { ...data, results: data.results.map(stamp) },
    };
  }
  return { ...response, data: stamp(data) };
};

/** Availability label for doctor cards. */
export const getDoctorAvailabilityLabel = (
  item: any,
  available?: boolean,
): string => {
  const isAvailable =
    available ??
    (item?.has_availability === true ||
      item?.is_available === true ||
      String(item?.availability_status || '').toLowerCase() === 'available');
  if (isAvailable) return 'Available';
  const status = String(
    item?.availability_status || item?.availability || '',
  ).trim();
  if (status) return status;
  return 'Unavailable';
};
