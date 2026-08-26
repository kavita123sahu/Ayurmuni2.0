/** Stable unique keys for FlatList / map — avoids React `.$undefined` collisions. */

export const doctorListKey = (item: any, index = 0): string => {
  const raw =
    item?.id ??
    item?.doctor_id ??
    item?.doctorId ??
    item?.user_id ??
    null;
  if (raw != null && String(raw).trim() !== '') {
    return String(raw);
  }
  const name = item?.name || item?.full_name || item?.doctor_name || 'doctor';
  return `doctor-${name}-${index}`;
};

export const consultationListKey = (item: any, index = 0): string => {
  const raw =
    item?.consultation_id ??
    item?.appointment_id ??
    item?.id ??
    null;
  if (raw != null && String(raw).trim() !== '') {
    return String(raw);
  }
  return `consult-${index}`;
};
