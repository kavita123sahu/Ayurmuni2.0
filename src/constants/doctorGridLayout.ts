import { PixelRatio } from 'react-native';
import { SCREEN, SCREEN_PADDING_H } from './layout';

/** Fixed doctor grid card layout — same px on every device. */
export const DOCTOR_GRID = {
  gap: 10,
  cardRadius: 16,
  imageRadius: 16,
  cardPaddingH: 10,
  cardPaddingTop: 0,
  cardPaddingBottom: 10,
  /** Photo block height (not square — stable across widths). */
  photoHeight: 132,
  nameHeight: 18,
  specialtyHeight: 16,
  statsHeight: 18,
  ctaHeight: 34,
  ctaRadius: 10,
} as const;

export const DOCTOR_GRID_BODY_HEIGHT =
  8 +
  DOCTOR_GRID.nameHeight +
  DOCTOR_GRID.specialtyHeight +
  6 +
  DOCTOR_GRID.statsHeight +
  6 +
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
