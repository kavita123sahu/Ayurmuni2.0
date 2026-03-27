import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '../common/Vector';

type Props = {
  title: string;
  status: string;
  progress: number; // 0 - 100

};

const PrakritiCard: React.FC<Props> = ({
  title,
  status,
  progress,
}) => {
  console.log("progressss", progress);
  // 🔥 Theme logic
  const getTheme = (): 'red' | 'yellow' | 'green' => {
    if (progress === 100) return 'green';
    if (progress > 30) return 'yellow';
    return 'red';
  };

  const theme = getTheme();

  // 🔥 Color helpers
  const getColor = () => {
    switch (theme) {
      case 'green':
        return '#22C55E';
      case 'yellow':
        return '#F5A623';
      default:
        return '#FF4D4F';
    }
  };

  const getBgColor = () => {
    switch (theme) {
      case 'green':
        return '#E7F9EF';
      case 'yellow':
        return '#FFF4D6';
      default:
        return '#FFEAEA';
    }
  };

  const color = getColor();
  const bgColor = getBgColor();

  return (
    <View style={styles.card}>
      {/* Top Row */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.status, { color }]}>
            {progress === 100 ? 'Completed' : status}
          </Text>
        </View>

        {/* Icon */}
        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
          <MaterialIcons
            name={progress === 100 ? 'verified' : 'access-time'}
            size={20}
            color={color}
          />
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <Text style={styles.label}>ANALYSIS PROGRESS</Text>
        <Text style={[styles.percent, { color }]}>
          {progress}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progress}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

export default PrakritiCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EAF0',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D2939',
  },

  status: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },

  iconBox: {
    height: 36,
    width: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 12,
    color: '#98A2B3',
    fontWeight: '500',
  },

  percent: {
    fontSize: 12,
    fontWeight: '600',
  },

  progressBarBg: {
    marginTop: 6,
    height: 8,
    backgroundColor: '#E5EAF0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
});