import React from 'react';
import {
  TextInput,
  StyleSheet,
} from 'react-native';
import { COLORS, scale } from '../../common/Colors';


const TextAnswerInput = ({
  value,
  onChangeText,
  placeholder,
}) => {
  return (
    <TextInput
      multiline
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={styles.input}
      textAlignVertical="top"
    />
  );
};

export default React.memo(TextAnswerInput);

const styles = StyleSheet.create({
  input: {
    minHeight: scale(120),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: scale(16),
    padding: scale(16),
    fontSize: scale(15),
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
});