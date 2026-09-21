import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLOT_GAP = 10;
const SLOT_WIDTH = (SCREEN_WIDTH - SLOT_GAP * 2) / 3;

const TimeSlots = ({ data, selected, onSelect }: Props) => {
  return (
    <View style={{ marginTop: 20 }}>
      {data.map((section, i) => (
        <View key={i} style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

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
                    numberOfLines={1}
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
    gap: SLOT_GAP,
  },

  slot: {
    width: SLOT_WIDTH,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },

  activeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  disabledText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
  },
});
