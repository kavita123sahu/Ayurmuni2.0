import React from 'react';
import { View, Text, TextInput, StyleSheet, Image } from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

const AppInputField = ({
  label,
  placeholder,
  leftIcon,
  rightIcon,
  value,
  onChangeText,
  style,
  containerStyle,
}: any) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        {leftIcon && (
          <Image source={leftIcon} style={styles.leftIcon} />
        )}

        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
        />

        {rightIcon && (
          <Image source={rightIcon} style={styles.rightIcon} />
        )}
      </View>
    </View>
  );
};

export default AppInputField;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },

  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontFamily: Fonts.PoppinsMedium,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    height: 48,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontFamily: Fonts.PoppinsMedium,
  },

  leftIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#9CA3AF',
  },

  rightIcon: {
    width: 18,
    height: 18,
    marginLeft: 8,
    tintColor: '#9CA3AF',
  },
});