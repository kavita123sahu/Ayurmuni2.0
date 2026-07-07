/** Shared flat card style — minimal elevation, Blinkit-like */
export const CARD_SURFACE = {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#EEF2F6',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.03,
  shadowRadius: 2,
  elevation: 0,
} as const;

export const CARD_RADIUS_SM = 12;
export const CARD_RADIUS_MD = 16;
export const CARD_RADIUS_LG = 20;
