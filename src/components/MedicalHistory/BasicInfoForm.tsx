import React, { memo, useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';

import {
  styles,
} from '../../components/MedicalHistory/styles/MedicalHistor';
import BmiGaugeCard, {
  heightValidationMessage,
  isValidHeightInput,
  isValidWeightInput,
  weightValidationMessage,
} from './BmiGaugeCard';
import { Fonts } from '../../common/Fonts';

const sanitizeDecimal = (text: string) => {
  const cleaned = String(text || '').replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join('')}`;
};

const InputCard = memo(({
  label,
  placeholder,
  value,
  onChangeText,
  unit,
  icon,
  error,
}: any) => {
  return (
    <View style={styles.basicCard}>
      <View style={styles.inputRow}>
        <View style={styles.iconCircle}>
          <Image source={icon} style={styles.basicIcon} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            blurOnSubmit={false}
            placeholder={placeholder}
            placeholderTextColor="#B0B7C3"
            keyboardType="decimal-pad"
            value={value}
            onChangeText={onChangeText}
            style={styles.singleInput}
          />
        </View>
        <Text style={styles.unitText}>{unit}</Text>
      </View>
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
});

const BasicInfoSection = ({
  questions,
  selectedAnswers,
  onChange,
}: any) => {
  const [bmiReady, setBmiReady] = useState(false);
  const [touched, setTouched] = useState({ height: false, weight: false });

  const heightQuestion = useMemo(() => {
    return questions.find((item: any) => {
      const q = item?.question?.toLowerCase?.() ?? '';
      return q.includes('height') || q.includes('weight') || q.includes('body');
    });
  }, [questions]);

  const weightQuestion = useMemo(() => {
    const heightId = heightQuestion?.id;
    return questions.find((item: any) => {
      const q = item?.question?.toLowerCase?.() ?? '';
      if (!q.includes('weight')) return false;
      return !heightId || item.id !== heightId || !q.includes('height');
    });
  }, [questions, heightQuestion?.id]);

  const heightId = heightQuestion
    ? String(heightQuestion.id)
    : weightQuestion
      ? String(weightQuestion.id)
      : '';
  const heightContainsWeight =
    !!heightQuestion?.question?.toLowerCase?.().includes('weight') ||
    !!heightQuestion?.question?.toLowerCase?.().includes('height');
  const heightValue = selectedAnswers?.[`${heightId}_height`] || '';
  const weightValue =
    selectedAnswers?.[`${heightId}_weight`] ||
    (weightQuestion && !heightContainsWeight
      ? selectedAnswers?.[String(weightQuestion.id)]
      : '') ||
    '';

  const heightError = touched.height
    ? heightValidationMessage(heightValue)
    : heightValue
      ? heightValidationMessage(heightValue)
      : '';
  const weightError = touched.weight
    ? weightValidationMessage(weightValue)
    : weightValue
      ? weightValidationMessage(weightValue)
      : '';

  const canCalculate =
    Boolean(heightId) &&
    isValidHeightInput(heightValue) &&
    isValidWeightInput(weightValue);

  useEffect(() => {
    setBmiReady(false);
    if (!canCalculate) return undefined;

    const timer = setTimeout(() => {
      setBmiReady(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [canCalculate, heightValue, weightValue]);

  if (!heightQuestion && !weightQuestion) {
    return null;
  }

  return (
    <View style={styles.basicInfoWrapper}>
      {heightId ? (
        <>
          <InputCard
            label="Height *"
            placeholder="Enter height in cm"
            value={heightValue}
            onChangeText={(text: string) => {
              setTouched(prev => ({ ...prev, height: true }));
              onChange(`${heightId}_height`, sanitizeDecimal(text));
            }}
            unit="cm"
            icon={require('../../assets/images/SVG2.png')}
            error={heightError}
          />

          <InputCard
            label="Weight *"
            placeholder="Enter weight in kg"
            value={weightValue}
            onChangeText={(text: string) => {
              setTouched(prev => ({ ...prev, weight: true }));
              onChange(`${heightId}_weight`, sanitizeDecimal(text));
            }}
            unit="kg"
            icon={require('../../assets/images/SVG3.png')}
            error={weightError}
          />
          <BmiGaugeCard
            revealed={bmiReady && canCalculate}
            heightCm={heightValue}
            weightKg={weightValue}
          />
        </>
      ) : null}
    </View>
  );
};

export default React.memo(BasicInfoSection);

const fieldStyles = StyleSheet.create({
  error: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    color: '#B91C1C',
    fontFamily: Fonts.PoppinsMedium,
  },
});
