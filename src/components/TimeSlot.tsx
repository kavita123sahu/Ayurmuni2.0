import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

type Slot = {
  time: string;
  available: boolean;
};

type Props = {
  data: {
    title: string;
    slots: Slot[];
  }[];
  selected: string;
  onSelect: (time: string) => void;
};

const TimeSlots = ({ data, selected, onSelect }: Props) => {
  return (
    <View style={{ marginTop: 20 }}>
      {data.map((section, i) => (
        <View key={i} style={{ marginBottom: 20 }}>

          {/* Section Title */}
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {/* Slots Grid */}
          <View style={styles.row}>
            {section.slots.map((item, index) => {
              const isActive = selected === item.time;

              return (
                <TouchableOpacity
                  key={index}
                  disabled={!item.available}
                  onPress={() => onSelect(item.time)}
                  style={[
                    styles.slot,
                    isActive && styles.activeSlot,
                    !item.available && styles.disabledSlot,
                  ]}
                >
                  <Text
                    style={[
                      styles.slotText,
                      isActive && styles.activeText,
                      !item.available && styles.disabledText,
                    ]}
                  >
                    {item.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>
      ))}
    </View>
  );
};

export default React.memo(TimeSlots);

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  slot: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    padding:12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: Colors.borderColor,
  },

  activeSlot: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.secondaryColor,
  },

  disabledSlot: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },

  slotText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: '#111827',
  },

  activeText: {
    color: '#fff',
    fontSize:12,
    fontFamily: Fonts.PoppinsSemiBold
  },

  disabledText: {
    color: '#9CA3AF',
    fontSize:12,
    fontFamily: Fonts.PoppinsMedium
  },
});