export const QUEST = {
  bgTop: '#F7F1E6',
  bgMid: '#F3EADF',
  bgBottom: '#EDE4D6',
  card: '#FFFFFF',
  ink: '#1C2B24',
  muted: '#7A847C',
  tip: '#9AA39A',
  track: '#E5DDD2',
  trackDone: '#E89A3C',
  accent: '#E89A3C',
  exit: '#1B4D3E',
  xpBg: '#2F6B4F',
  xpText: '#FFFFFF',
  border: '#E8E2D8',
};

export const DOSHA = {
  vata: {
    key: 'vata' as const,
    label: 'Vata',
    color: '#3D8B6E',
    soft: '#E7F4EE',
    ring: '#3D8B6E33',
  },
  pitta: {
    key: 'pitta' as const,
    label: 'Pitta',
    color: '#E89A3C',
    soft: '#FFF3E5',
    ring: '#E89A3C33',
  },
  kapha: {
    key: 'kapha' as const,
    label: 'Kapha',
    color: '#4A7DB5',
    soft: '#E8F0F8',
    ring: '#4A7DB533',
  },
};

export type DoshaKey = keyof typeof DOSHA;

export const XP_PER_LEVEL = 10;
export const STREAK_BONUS = 5;
