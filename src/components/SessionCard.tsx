import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

type Props = {
  title?: string;
  time?: string;
  index?: number;
  isActive?: boolean;
  onPress?: () => void;
};

const SessionCard = ({ index, title, time, isActive, onPress }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        isActive ? styles.activeCard : styles.inactiveCard,
      ]}
    >
      <View style={styles.left}>
        {isActive ? (
          <View style={styles.iconBox}>
            <Text style={styles.icon}>🧘</Text>
          </View>
        ) : (
          <Text style={styles.index}>
            {String(index).padStart(2, '0')}
          </Text>
        )}

        <View style={styles.textContainer}>
          {isActive && (
            <Text style={styles.activeLabel}>ACTIVE NOW</Text>
          )}

          <Text
            numberOfLines={1}
            style={[
              styles.title,
              isActive && styles.activeTitle,
            ]}
          >
            {title}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.time,
          isActive && styles.activeTime,
        ]}
      >
        {time}
      </Text>
    </TouchableOpacity>
  );
};

export default SessionCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  activeCard: {
    backgroundColor: '#0D614E1A', // softer green (fix)
    borderWidth: 1,

    borderColor: '#0D614E33',
  },

  inactiveCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF1F4',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // 🔥 ICON FIX (size + spacing corrected)
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icon: {
    fontSize: 18,
    color: '#fff',
  },

  // 🔥 INDEX FIX (alignment + weight)
  index: {
    width: 36,
    fontSize: 14,
    color: '#A0A7B0',
    marginRight: 6,
    fontFamily: Fonts.PoppinsMedium
  },

  textContainer: {
    flex: 1,
  },

  // 🔥 LABEL FIX (tight + small)
  activeLabel: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,

    letterSpacing: 0.5,
  },

  // 🔥 TITLE FIX (main issue yahi tha)
  title: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1C1F23',
  },

  activeTitle: {
    color: '#0F3D2E',
  },

  // 🔥 TIME FIX (alignment + weight)
  time: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    color: '#8A9199',
  },

  activeTime: {
    fontSize:14,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,

  },
});