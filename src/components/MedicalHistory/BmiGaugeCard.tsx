import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { Fonts } from '../../common/Fonts';

type BmiResult = {
  value: number;
  label: string;
  hint: string;
  tone: string;
  bg: string;
  needle: number;
};

const MIN_BMI = 15;
const MAX_BMI = 40;

const classify = (bmi: number): Omit<BmiResult, 'value' | 'needle'> => {
  if (bmi < 18.5) {
    return {
      label: 'Underweight',
      hint: 'Below the healthy range',
      tone: '#0F766E',
      bg: '#E7F6F1',
    };
  }
  if (bmi < 25) {
    return {
      label: 'Healthy',
      hint: 'Within the healthy range',
      tone: '#0D614E',
      bg: '#E7F6F1',
    };
  }
  if (bmi < 30) {
    return {
      label: 'Overweight',
      hint: 'Above the healthy range',
      tone: '#B45309',
      bg: '#FEF3C7',
    };
  }
  return {
    label: 'Obese',
    hint: 'Well above the healthy range',
    tone: '#B91C1C',
    bg: '#FEE2E2',
  };
};

const toCentimeters = (raw: number) => {
  if (!(raw > 0)) return null;
  if (raw > 30 && raw < 280) return raw;
  if (raw > 0.9 && raw < 2.6) return raw * 100;
  if (raw >= 3 && raw < 8.5) return raw * 30.48;
  return null;
};

export const parseMeasurementInput = (raw: string | number | null | undefined) => {
  const n = Number(String(raw ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : NaN;
};

/** Accepts cm (50–250) or common meter/ft shorthand handled by toCentimeters. */
export const isValidHeightInput = (raw: string | number | null | undefined) => {
  const n = parseMeasurementInput(raw);
  if (!Number.isFinite(n) || n <= 0) return false;
  const cm = toCentimeters(n);
  return cm != null && cm >= 50 && cm <= 250;
};

/** Adult/child weight in kg. */
export const isValidWeightInput = (raw: string | number | null | undefined) => {
  const n = parseMeasurementInput(raw);
  return Number.isFinite(n) && n >= 10 && n <= 300;
};

export const heightValidationMessage = (
  raw: string | number | null | undefined,
) => {
  const text = String(raw ?? '').trim();
  if (!text) return 'Height is required';
  if (!isValidHeightInput(text)) {
    return 'Enter a valid height (50–250 cm)';
  }
  return '';
};

export const weightValidationMessage = (
  raw: string | number | null | undefined,
) => {
  const text = String(raw ?? '').trim();
  if (!text) return 'Weight is required';
  if (!isValidWeightInput(text)) {
    return 'Enter a valid weight (10–300 kg)';
  }
  return '';
};

export const calculateBmi = (heightInput: number, weightKg: number) => {
  const heightCm = toCentimeters(heightInput);
  if (heightCm == null || !(weightKg > 0) || weightKg > 400) return null;
  if (heightCm < 50 || heightCm > 250) return null;
  if (weightKg < 10 || weightKg > 300) return null;
  const meters = heightCm / 100;
  const bmi = weightKg / (meters * meters);
  if (!Number.isFinite(bmi) || bmi < 8 || bmi > 80) return null;
  return Math.round(bmi * 10) / 10;
};

const arcPath = (cx: number, cy: number, r: number) => {
  const startX = cx - r;
  const endX = cx + r;
  return `M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`;
};

const BmiGauge = ({ needle }: { needle: number }) => {
  const size = 148;
  const cx = 74;
  const cy = 78;
  const r = 52;
  const angle = Math.PI - needle * Math.PI;
  const tip = 46;
  const x2 = cx + Math.cos(angle) * tip;
  const y2 = cy - Math.sin(angle) * tip;

  return (
    <Svg width={size} height={92} viewBox={`0 0 ${size} 96`}>
      <Defs>
        <LinearGradient id="bmiArc" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#7DCE82" />
          <Stop offset="0.38" stopColor="#E7D56A" />
          <Stop offset="0.68" stopColor="#F0A15A" />
          <Stop offset="1" stopColor="#E15B55" />
        </LinearGradient>
      </Defs>
      <Path
        d={arcPath(cx, cy, r)}
        stroke="url(#bmiArc)"
        strokeWidth={11}
        strokeLinecap="round"
        fill="none"
      />
      {[0.08, 0.28, 0.5, 0.72, 0.92].map(tick => {
        const a = Math.PI - tick * Math.PI;
        const inner = r - 16;
        const outer = r - 8;
        return (
          <Line
            key={tick}
            x1={cx + Math.cos(a) * inner}
            y1={cy - Math.sin(a) * inner}
            x2={cx + Math.cos(a) * outer}
            y2={cy - Math.sin(a) * outer}
            stroke="#FFFFFF"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        );
      })}
      <Line
        x1={cx}
        y1={cy}
        x2={x2}
        y2={y2}
        stroke="#1F2937"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Path
        d={`M ${cx - 5} ${cy + 1} a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0`}
        fill="#1F2937"
      />
      <G x={108} y={48}>
        <Path
          d="M18 28 C8 22 2 12 6 4 C14 8 20 16 22 26"
          stroke="#9DB89A"
          strokeWidth={1.4}
          fill="none"
        />
        <Path d="M10 18 C6 14 8 8 14 10 C12 14 12 16 10 18" fill="#C5D7B8" />
        <Path d="M16 22 C12 16 16 10 22 14 C20 18 18 20 16 22" fill="#D7E6C8" />
        <Path d="M20 30 C16 24 22 18 26 22 C24 26 22 28 20 30" fill="#E4EFD8" />
      </G>
    </Svg>
  );
};

const BmiGaugeCard = ({
  heightCm,
  weightKg,
  revealed,
}: {
  heightCm?: string;
  weightKg?: string;
  revealed?: boolean;
}) => {

  const calculateBmi = (heightCm: number, weightKg: number) => {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
};


  const result = useMemo<BmiResult | null>(() => {
  if (!revealed) return null;

  const height = Number(String(heightCm || '').replace(/[^\d.]/g, ''));
  const weight = Number(String(weightKg || '').replace(/[^\d.]/g, ''));

  const value = calculateBmi(height, weight);
  if (value == null) return null;
  const band = classify(value);
  const needle = Math.min(
    1,
    Math.max(0, (value - MIN_BMI) / (MAX_BMI - MIN_BMI))
  );

  return { value, needle, ...band };
}, [heightCm, revealed, weightKg]);



  console.log('BmiGaugeCard', { heightCm, weightKg, revealed, result });
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>Your BMI</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>
            {result ? result.value.toFixed(1) : '— —'}
          </Text>
          <Text style={styles.unit}>kg/m²</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: result?.bg || '#E7F6F1' }]}>
          <Text style={[styles.pillText, { color: result?.tone || '#0D614E' }]}>
            {result
              ? `${result.label} · ${result.hint}`
              : revealed
                ? 'Enter a valid height and weight'
                : 'Enter height and weight to calculate'}
          </Text>
        </View>
      </View>
      <BmiGauge needle={result?.needle ?? 0.08} />
    </View>
  );
};

export default BmiGaugeCard;

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7EEEA',
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  title: {
    fontSize: 13,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  valueRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  value: {
    fontSize: 28,
    lineHeight: 32,
    color: '#111827',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  unit: {
    marginBottom: 4,
    fontSize: 13,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsMedium,
  },
  pill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
  },
});
