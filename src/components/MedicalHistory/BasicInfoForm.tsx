import React, { memo, useMemo } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';

import { Ionicons } from '../../common/Vector';

import {

  COLORS,
  scale,
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
     FIND QUESTIONS
  ===================================================== */

  const ageQuestion = useMemo(() => {

    return questions.find((item: any) =>
      item?.question
        ?.toLowerCase()
        ?.includes('age'),
    );

  }, [questions]);

  const genderQuestion = useMemo(() => {

    return questions.find((item: any) =>
      item?.question
        ?.toLowerCase()
        ?.includes('gender'),
    );

  }, [questions]);

  const heightQuestion = useMemo(() => {
    return questions.find((item: any) =>
      item?.question?.toLowerCase()?.includes('height'),
    );
  }, [questions]);

  if (!ageQuestion || !genderQuestion || !heightQuestion) {
    return null;
  }

  const ageId = String(ageQuestion.id);
  const genderId = String(genderQuestion.id);
  const heightId = String(heightQuestion.id);

  return (
    <View style={styles.basicInfoWrapper}>

      <InputCard
        label="Age *"
        placeholder="Enter your age"
        value={selectedAnswers?.[ageId] || ''}
        onChangeText={(text: any) => onChange(ageId, text)}
        unit="Years"
        icon={require('../../assets/images/SVG.png')}
      />

      {/* ================= GENDER ================= */}

      <View style={styles.basicCard}>

        <View style={styles.inputRow}>

          <View style={styles.iconCircle}>

            {
              genderQuestion?.icon ? (
                <Image
                  source={{
                    uri: genderQuestion?.image_path,
                  }}
                  style={styles.basicIcon}
                />
              ) : (
                <Image
                  source={require('../../assets/images/SVG1.png')}
                  style={styles.basicIcon}
                />
                // <Ionicons
                //   name="male-female-outline"
                //   size={20}
                //   color={COLORS.primary}
                // />
              )
            }
          </View>

          <Text style={styles.label}>
            Gender *
          </Text>
        </View>

        <View style={styles.genderWrapper}>

          {
            genderQuestion?.choices?.map(
              (item: any) => {

                const active = selectedAnswers?.[genderId] === item?.index;

                return (
                  <TouchableOpacity
                    key={item?.index}
                    activeOpacity={0.8}
                    onPress={() => onChange(genderId, item.index)}
                    style={[
                      styles.genderBtn,

                      active &&
                      styles.activeGenderBtn,
                    ]}
                  >

                    <Text
                      style={[
                        styles.genderText,

                        active &&
                        styles.activeGenderText,
                      ]}
                    >
                      {item?.value}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )
          }
        </View>
      </View>

      {/* ================= HEIGHT ================= */}

      <InputCard
        label="Height *"
        placeholder="Enter height"
        value={selectedAnswers?.[`${heightId}_height`] || ''}
        onChangeText={(text: string) => onChange(`${heightId}_height`, text)}
        unit="cm"
        icon={require('../../assets/images/SVG2.png')}
      />

      <InputCard
        label="Weight *"
        placeholder="Enter weight"
        value={selectedAnswers?.[`${heightId}_weight`] || ''}
        onChangeText={(text: string) => onChange(`${heightId}_weight`, text)}
        unit="kg"
        icon={require('../../assets/images/SVG3.png')}
      />
    </View>
  );
};

export default React.memo(BasicInfoSection);

