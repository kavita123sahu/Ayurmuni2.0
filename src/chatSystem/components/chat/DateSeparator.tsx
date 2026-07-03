import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { chatColors, chatTypography, chatSpacing } from '../../theme/chatTheme';
import { formatDateSeparator } from '../../utils/dateUtils';

interface Props {
  date: string;
}

function DateSeparatorBase({ date }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.chip}>
        <Text style={styles.text}>{formatDateSeparator(date)}</Text>
      </View>
    </View>
  );
}

export const DateSeparator = memo(DateSeparatorBase);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: chatSpacing.md,
  },
  chip: {
    backgroundColor: chatColors.dateChipBackground,
    paddingHorizontal: chatSpacing.md,
    paddingVertical: chatSpacing.xs,
    borderRadius: 12,
  },
  text: {
    ...chatTypography.dateChip,
    color: chatColors.dateChipText,
    fontWeight: '600',
  },
});
