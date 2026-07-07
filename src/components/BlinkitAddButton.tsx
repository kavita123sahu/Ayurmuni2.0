import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import TablerIcon from './TablerIcon';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

type Props = {
  quantity: number;
  isAdding?: boolean;
  locked?: boolean;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  compact?: boolean;
};

const BlinkitAddButton: React.FC<Props> = ({
  quantity,
  isAdding = false,
  locked = false,
  onAdd,
  onIncrement,
  onDecrement,
  compact = false,
}) => {
  if (quantity <= 0) {
    return (
      <TouchableOpacity
        onPress={onAdd}
        disabled={isAdding || locked}
        activeOpacity={0.75}
        style={[
          styles.addBtn,
          compact && styles.addBtnCompact,
          locked && styles.addBtnLocked,
        ]}
      >
        {isAdding ? (
          <ActivityIndicator size="small" color={Colors.primaryColor} />
        ) : (
          <Text style={[styles.addText, compact && styles.addTextCompact, locked && styles.addTextLocked]}>
            {locked ? 'LOGIN' : 'ADD'}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.stepper, compact && styles.stepperCompact, locked && styles.stepperLocked]}>
      <TouchableOpacity
        onPress={onDecrement}
        disabled={isAdding || locked}
        style={styles.stepBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <TablerIcon name="minus" size={compact ? 14 : 16} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>

      {isAdding ? (
        <ActivityIndicator size="small" color="#fff" style={styles.qtyLoader} />
      ) : (
        <Text style={[styles.qtyText, compact && styles.qtyTextCompact]}>{quantity}</Text>
      )}

      <TouchableOpacity
        onPress={onIncrement}
        disabled={isAdding || locked}
        style={styles.stepBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <TablerIcon name="plus" size={compact ? 14 : 16} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  addBtn: {
    minWidth: 62,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: Colors.primaryColor,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  addBtnCompact: {
    minWidth: 56,
    height: 28,
    borderRadius: 7,
  },
  addText: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    letterSpacing: 0.5,
  },
  addTextCompact: {
    fontSize: 11,
  },
  addBtnLocked: {
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  addTextLocked: {
    color: '#64748B',
    fontSize: 10,
  },
  stepperLocked: {
    backgroundColor: '#94A3B8',
    opacity: 0.85,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 78,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  stepperCompact: {
    minWidth: 70,
    height: 28,
    borderRadius: 7,
  },
  stepBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#fff',
    minWidth: 20,
    textAlign: 'center',
  },
  qtyTextCompact: {
    fontSize: 12,
    minWidth: 16,
  },
  qtyLoader: {
    minWidth: 20,
  },
});

export default BlinkitAddButton;
