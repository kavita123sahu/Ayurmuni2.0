import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Fonts } from '../common/Fonts';

interface Props {
  placeholder?: string;
  icon: ImageSourcePropType;
  value?: string;
  onChangeText?: (
    text: string,
  ) => void;
}

const SearchBar: React.FC<Props> = ({
  placeholder = 'Search...',
  icon,
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.container}>

      <Image source={icon} style={styles.icon} />

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default React.memo(SearchBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    height: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  icon: {
    width: 18,
    height: 18,
    marginRight: 8,
    resizeMode: 'contain',
  },

  input: {
    flex: 1,
    fontSize: 14,

    minWidth: 0,
    fontFamily: Fonts.PoppinsRegular,
    color: '#0F172A',
    paddingVertical: 0, // 👈 important
    includeFontPadding: false,
  },
});