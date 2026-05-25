import React from 'react';

import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '../../common/Vector';

import {
  styles,
  COLORS,
} from '../../components/MedicalHistory/styles/MedicalHistor';
import { scale } from '../../common/Colors';

const BottomButton = ({
  loading,
  onPress,
  disabled
}: any) => {

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={disabled || loading}
      style={[
        styles.nextBtn,
        disabled &&
        styles.disabledButton,
      ]}
      onPress={onPress}
    >

      {
        loading ? (
          <ActivityIndicator
            color={COLORS.white}
          />
        ) : (
          <>
            <Text numberOfLines={1} style={styles.nextText}>
              Next
            </Text>

            <Ionicons
              name="chevron-forward"
              size={scale(18)}
              color={COLORS.white}
            />
          </>
        )
      }
    </TouchableOpacity>
  );
};

export default BottomButton;