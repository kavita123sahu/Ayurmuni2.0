// components/SectionHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Fonts } from '../common/Fonts';

interface Props {
  title: string;
  actionText?: string;
  onPress?: () => void;
}

const SectionHeader: React.FC<Props> = ({ title, actionText, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {actionText && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.action}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,  //14
    marginTop: 20,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily :Fonts.PoppinsSemiBold,
    fontSize: 18,
  },
  action: {
    color: '#0D614E',
    fontSize: 14,
   fontFamily : Fonts.PoppinsSemiBold
  },
});