import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Fonts } from '../common/Fonts';
import { HOME_SECTION_HEADER_MB } from '../constants/layout';

interface Props {
  title: string;
  actionText?: string;
  onPress?: () => void;
  /** Tighter margins for HomePage — no extra horizontal inset */
  home?: boolean;
}

const SectionHeader: React.FC<Props> = ({ title, actionText, onPress, home }) => {
  return (
    <View style={[styles.container, home && styles.containerHome]}>
      <Text style={styles.title}>{title}</Text>

      {actionText ? (
        <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.action}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default React.memo(SectionHeader);

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 14,
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerHome: {
    marginTop: 0,
    marginBottom: HOME_SECTION_HEADER_MB,
    paddingHorizontal: 0,
  },
  title: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 18,
    color: '#0F172A',
    flex: 1,
  },
  action: {
    color: '#0D614E',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    marginLeft: 12,
  },
});
