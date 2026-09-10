import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Fonts } from '../common/Fonts';
import {
  HOME_SECTION_HEADER_MB,
  HOME_SECTION_HEADER_MT,
} from '../constants/layout';
import { Colors } from '../common/Colors';

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
      <Text style={[styles.title, home && styles.titleHome]} numberOfLines={1}>
        {title}
      </Text>

      {actionText ? (
        <TouchableOpacity
          onPress={onPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.actionBtn}
        >
          <Text style={styles.action}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default React.memo(SectionHeader);

const styles = StyleSheet.create({
  container: {
    marginTop: HOME_SECTION_HEADER_MT,
    marginBottom: HOME_SECTION_HEADER_MB,
    flexDirection: 'row',
    paddingHorizontal: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 24,
  },
  containerHome: {
    paddingHorizontal: 0,
    marginTop: 0,
    marginBottom: HOME_SECTION_HEADER_MB,
  },
  title: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
    includeFontPadding: false,
  },
  titleHome: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionBtn: {
    flexShrink: 0,
  },
  action: {
    color: Colors.primaryColor,
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
});
