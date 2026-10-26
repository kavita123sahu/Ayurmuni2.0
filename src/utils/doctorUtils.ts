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

const isTrueFlag = (v: unknown) => v === true || v === 'true' || v === 1 || v === '1';

/** `is_dietitian` from doctor list / profile / slot / appointment payloads (top level or nested doctor). */
export const isDietitian = (item: any): boolean => {
  if (!item) return false;
  return (
    isTrueFlag(item?.is_dietitian) ||
    isTrueFlag(item?.doctor?.is_dietitian) ||
    isTrueFlag(item?.doctor_details?.is_dietitian) ||
    isTrueFlag(item?.doctor_info?.is_dietitian) ||
    isTrueFlag(item?.info?.is_dietitian)
  );
};

/** "Dietitian" / "Doctor" — for labels like "About the doctor". */
export const getDoctorRoleLabel = (item: any): 'Dietitian' | 'Doctor' =>
  isDietitian(item) ? 'Dietitian' : 'Doctor';

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

/** Patient-facing availability only — never show admin approval strings. */
const APPROVAL_STATUS_RE =
  /not\s*approved|unapproved|pending\s*approval|rejected|inactive|disabled/i;

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

  const raw = String(
    item?.availability_status || item?.availability || '',
  ).trim();
  if (!raw || APPROVAL_STATUS_RE.test(raw)) return 'Unavailable';

  const lower = raw.toLowerCase();
  if (lower === 'available' || lower === 'online') return 'Available';
  if (lower.includes('limited') || lower.includes('few')) return 'Limited slots';
  if (lower === 'unavailable' || lower === 'offline' || lower === 'busy') {
    return 'Unavailable';
  }
  // Unknown backend copy — keep UI patient-safe
  return 'Unavailable';
};

/** Flatten doctor specializations from any API shape (including doctor-added). */
export const resolveDoctorSpecializationLabels = (doctor: any): string[] => {
  if (!doctor || typeof doctor !== 'object') return [];

  const out: string[] = [];
  const seen = new Set<string>();
  const push = (value: unknown) => {
    if (value == null) return;
    if (typeof value === 'string') {
      value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .forEach(label => {
          const key = label.toLowerCase();
          if (seen.has(key)) return;
          seen.add(key);
          out.push(label);
        });
      return;
    }
    if (typeof value === 'object') {
      const label = String(
        (value as any)?.name ??
          (value as any)?.title ??
          (value as any)?.label ??
          (value as any)?.specialization ??
          '',
      ).trim();
      if (label) push(label);
    }
  };

  const sources = [
    doctor.doctor_specialization,
    doctor.specializations,
    doctor.specialization,
    doctor.custom_specializations,
    doctor.other_specializations,
    doctor.health_diseases,
  ];
  sources.forEach(source => {
    if (Array.isArray(source)) source.forEach(push);
    else push(source);
  });

  return out;
};

export const formatDoctorSpecialization = (doctor: any): string =>
  resolveDoctorSpecializationLabels(doctor).join(', ');
