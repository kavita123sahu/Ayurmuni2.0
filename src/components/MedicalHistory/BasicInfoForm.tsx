import React, { memo, useMemo } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';

import {
  styles,
} from '../../components/MedicalHistory/styles/MedicalHistor';

/* =====================================================
   INPUT CARD
===================================================== */



const InputCard = memo(({
  label,
  placeholder,
  value,
  onChangeText,
  unit,
  icon,
}: any) => {

  return (
    <View style={styles.basicCard}>

      <View style={styles.inputRow}>

        <View style={styles.iconCircle}>

          <Image
            source={icon}
            style={styles.basicIcon}
          />

          {/* {
            icon?.startsWith?.('http')
              ? ( */}

          {/* ) : (
                <Ionicons
                  name={icon}
                  size={20}
                  color={COLORS.primary}
                />
              )
          } */}

        </View>

        <View style={{ flex: 1 }}>

          <Text style={styles.label}>
            {label}
          </Text>

          <TextInput
            blurOnSubmit={false}
            placeholder={placeholder}
            placeholderTextColor="#B0B7C3"
            keyboardType="numeric"
            value={value}
            onChangeText={onChangeText}
            style={styles.singleInput}
          />

        </View>

        <Text style={styles.unitText}>
          {unit}
        </Text>

      </View>

    </View>
  );
});
const BasicInfoSection = ({
  questions,
  selectedAnswers,
  onChange,
}: any) => {

  /* =====================================================
     FIND QUESTIONS — show whichever basic fields API returns
  ===================================================== */

  // const ageQuestion = useMemo(() => {
  //   return questions.find((item: any) =>
  //     item?.question?.toLowerCase()?.includes('age'),
  //   );
  // }, [questions]);

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
      // Prefer a dedicated weight question when height is separate
      return !heightId || item.id !== heightId || !q.includes('height');
    });
  }, [questions, heightQuestion?.id]);

  // Body-type flow should render only the measurement fields returned by API.
  if (!heightQuestion && !weightQuestion) {
    return null;
  }

  const heightId = heightQuestion
    ? String(heightQuestion.id)
    : weightQuestion
      ? String(weightQuestion.id)
      : '';
  const heightContainsWeight =
    !!heightQuestion?.question?.toLowerCase?.().includes('weight') ||
    !!heightQuestion?.question?.toLowerCase?.().includes('height');

  return (
    <View style={styles.basicInfoWrapper}>

      {/* {ageQuestion ? (
        <InputCard
          label="Age *"
          placeholder="Enter your age"
          value={selectedAnswers?.[ageId] || ''}
          onChangeText={(text: any) => onChange(ageId, text)}
          unit="Years"
          icon={require('../../assets/images/SVG.png')}
        />
      ) : null} */}

      {heightId ? (
        <>
          <InputCard
            label="Height *"
            placeholder="Enter height"
            value={selectedAnswers?.[`${heightId}_height`] || ''}
            onChangeText={(text: string) =>
              onChange(`${heightId}_height`, text)
            }
            unit="cm"
            icon={require('../../assets/images/SVG2.png')}
          />

          <InputCard
            label="Weight *"
            placeholder="Enter weight"
            value={
              selectedAnswers?.[`${heightId}_weight`] ||
              (weightQuestion && !heightContainsWeight
                ? selectedAnswers?.[String(weightQuestion.id)]
                : '') ||
              ''
            }
            onChangeText={(text: string) =>
              onChange(`${heightId}_weight`, text)
            }
            unit="kg"
            icon={require('../../assets/images/SVG3.png')}
          />
        </>
      ) : null}
    </View>
  );
};

export default React.memo(BasicInfoSection);

