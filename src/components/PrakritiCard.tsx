import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '../common/Vector';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { Images } from '../common/Images';
import { Styles } from '../common/Styles';

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
        return '#10B981';
      case 'yellow':
        return '#FFC107';
      default:
        return '#F43F5E';
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
      <View >

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.status, { color }]} numberOfLines={1}>
          {progress === 100 ? 'Profile Complete' : status}
        </Text>

      </View>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <Text style={styles.label}>Analysis Progress</Text>
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

export default React.memo(PrakritiCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EAF0',
    minHeight: 120,
  },
  header: {


  },

  title: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.textColor,
  },

  status: {
    // marginTop: 4,
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium
  },

  iconBox: {
    height: 36,
    width: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // 🔥 add this
  },
  label: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 4,
    fontFamily: Fonts.PoppinsMedium

  },

  percent: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold
  },

  progressBarBg: {
    marginTop: 8,
    height: 8,
    backgroundColor: '#E5EAF0',
    borderRadius: 8,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
});