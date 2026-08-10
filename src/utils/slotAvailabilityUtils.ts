/**
 * Doctor slot availability — never treat past / missed / expired as selectable.
 */

type SlotLike = {
  date?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
};

const padTime = (time?: string): string | null => {
  if (!time || typeof time !== 'string') return null;
  const parts = time.trim().split(':');
  if (parts.length < 2) return null;
  const h = parts[0].padStart(2, '0');
  const m = parts[1].padStart(2, '0');
  const s = (parts[2] ?? '00').padStart(2, '0').slice(0, 2);
  return `${h}:${m}:${s}`;
};

/** Slot end (or start) is in the past relative to now. */
export const isSlotTimePassed = (slot: SlotLike, now = new Date()): boolean => {
  const date = String(slot?.date ?? '').trim();
  const timeStr = padTime(slot?.end_time) || padTime(slot?.start_time);
  if (!date || !timeStr) return false;

  const slotEnd = new Date(`${date}T${timeStr}`);
  if (Number.isNaN(slotEnd.getTime())) return false;
  return slotEnd.getTime() <= now.getTime();
};

export const getSlotStatusKey = (slot: SlotLike): string =>
  String(slot?.status ?? '')
    .trim()
    .toLowerCase();

/** API or clock says this slot can no longer be booked. */
export const isSlotMissedOrExpired = (slot: SlotLike, now = new Date()): boolean => {
  const status = getSlotStatusKey(slot);
  if (
    status === 'missed' ||
    status === 'expired' ||
    status === 'passed' ||
    status === 'cancelled' ||
    status === 'canceled'
  ) {
    return true;
  }
  return isSlotTimePassed(slot, now);
};

/**
 * True only when API says available AND slot has not missed/expired by clock.
 * Booked / reserved / anything else → false.
 */
export const isSlotBookable = (slot: SlotLike, now = new Date()): boolean => {
  if (getSlotStatusKey(slot) !== 'available') return false;
  if (isSlotMissedOrExpired(slot, now)) return false;
  return true;
};
