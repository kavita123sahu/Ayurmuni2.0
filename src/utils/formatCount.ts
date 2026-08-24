/** Compact display for patient / consult counts (e.g. 1200 → 1.2K+). */
export const formatCompactCount = (value: unknown): string => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return '0';

  if (num >= 1_000_000) {
    const m = num / 1_000_000;
    return m >= 10 ? `${Math.round(m)}M+` : `${m.toFixed(1).replace(/\.0$/, '')}M+`;
  }

  if (num >= 1000) {
    const k = num / 1000;
    return k >= 10 ? `${Math.round(k)}K+` : `${k.toFixed(1).replace(/\.0$/, '')}K+`;
  }

  return String(Math.round(num));
};
