import { PixelRatio } from 'react-native';
import { SCREEN, SCREEN_PADDING_H } from './layout';

/** Home suggested-doctor card — fixed px slots so every card stays the same height. */
export const HOME_DOCTOR = {
  gap: 10,
  cardRadius: 18,
  cardPadding: 10,
  avatarSize: 64,
  nameHeight: 32,
  availabilityStripHeight: 16,
  qualHeight: 14,
  statsHeight: 20,
  ctaHeight: 32,
  ctaRadius: 8,
} as const;

// export const HOME_DOCTOR_CARD_HEIGHT =
//   HOME_DOCTOR.cardPadding +
//   (HOME_DOCTOR.avatarSize + 12) +
//   6 +
//   HOME_DOCTOR.nameHeight +
//   HOME_DOCTOR.qualHeight +
//   8 +
//   HOME_DOCTOR.statsHeight +
//   8 +
//   HOME_DOCTOR.ctaHeight +
//   HOME_DOCTOR.cardPadding;

export const HOME_DOCTOR_CARD_HEIGHT =
  HOME_DOCTOR.cardPadding * 2 +
  (HOME_DOCTOR.avatarSize + 14) +
  8 +
  HOME_DOCTOR.availabilityStripHeight +
  4 +
  HOME_DOCTOR.nameHeight +
  HOME_DOCTOR.qualHeight +
  8 +
  34 +
  HOME_DOCTOR.cardPadding;

export const getHomeDoctorCardWidth = () =>
  PixelRatio.roundToNearestPixel(
    (SCREEN.width - SCREEN_PADDING_H * 2 - HOME_DOCTOR.gap) / 2,
  );

/** List/consult grid card layout — same px on every device. */
export const DOCTOR_GRID = {
  gap: 10,
  cardRadius: 16,
  imageRadius: 16,
  cardPaddingH: 10,
  cardPaddingTop: 0,
  cardPaddingBottom: 6, // 10 → 6
  photoHeight: 130,
  nameHeight: 20,
  availabilityStripHeight: 16,
  specialtyHeight: 16,
  statsHeight: 18,
  ctaHeight: 34,
  ctaRadius: 10,
} as const;
export const DOCTOR_GRID_BODY_HEIGHT =
  6 +
  DOCTOR_GRID.availabilityStripHeight +
  2 +
  DOCTOR_GRID.nameHeight +
  DOCTOR_GRID.specialtyHeight +
  4 +
  DOCTOR_GRID.statsHeight +
  4 +
  DOCTOR_GRID.ctaHeight +
  DOCTOR_GRID.cardPaddingBottom;

export const DOCTOR_GRID_CARD_HEIGHT =
  DOCTOR_GRID.cardPaddingTop +
  DOCTOR_GRID.photoHeight +
  DOCTOR_GRID_BODY_HEIGHT;

export const getDoctorGridCardWidth = () =>
  PixelRatio.roundToNearestPixel(
    (SCREEN.width - SCREEN_PADDING_H * 2 - DOCTOR_GRID.gap) / 2,
  );
