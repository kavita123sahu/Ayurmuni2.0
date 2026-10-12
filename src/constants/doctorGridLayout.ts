import { PixelRatio } from 'react-native';
import { SCREEN, SCREEN_PADDING_H } from './layout';

/** Doctor grid card (Home, Consult, All Doctors) — fixed px slots so every card is the same height. */
export const DOCTOR_GRID = {
  gap: 10,
  cardRadius: 16,
  imageRadius: 16,
  cardPaddingH: 10,
  cardPaddingTop: 0,
  cardPaddingBottom: 8,
  bodyPaddingTop: 8,
  photoHeight: 130,
  /** Two lines of 16px — long names wrap, short names keep the same slot. */
  nameLineHeight: 16,
  nameHeight: 32,
  specialtyHeight: 16,
  statsGap: 4,
  statsHeight: 18,
  ctaGap: 6,
  ctaHeight: 34,
  ctaRadius: 10,
} as const;

/** Sum of the fixed body slots — keep in sync with DoctorListCard grid styles. */
export const DOCTOR_GRID_BODY_HEIGHT =
  DOCTOR_GRID.bodyPaddingTop +
  DOCTOR_GRID.nameHeight +
  DOCTOR_GRID.specialtyHeight +
  DOCTOR_GRID.statsGap +
  DOCTOR_GRID.statsHeight +
  DOCTOR_GRID.ctaGap +
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
