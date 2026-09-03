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
