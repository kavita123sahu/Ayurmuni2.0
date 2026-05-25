import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { COLORS, scale } from '../../common/Colors';


const QuestionTitle = ({ title, subtitle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {!!subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
};

export default React.memo(QuestionTitle);

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(20),
  },
  title: {
    fontSize: scale(24),
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    marginTop: scale(8),
    fontSize: scale(14),
    lineHeight: scale(22),
    color: COLORS.textSecondary,
  },
});