import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import {
  PRODUCT_SORT_OPTIONS,
  ProductSortKey,
  getSortLabel,
} from '../utils/productSearchUtils';

type Props = {
  value: ProductSortKey;
  onChange: (key: ProductSortKey) => void;
};

const ProductSortDropdown: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const selectOption = (key: ProductSortKey) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        activeOpacity={0.85}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.triggerLabel}>Sort by</Text>
        <View style={styles.triggerValueRow}>
          <Text style={styles.triggerValue} numberOfLines={1}>
            {getSortLabel(value)}
          </Text>
          <TablerIcon name="chevron-down" size={16} color={Colors.primaryColor} />
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Sort by</Text>

            {PRODUCT_SORT_OPTIONS.map(option => {
              const selected = value === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.optionRow, selected && styles.optionRowActive]}
                  onPress={() => selectOption(option.key)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                    {option.label}
                  </Text>
                  {selected ? (
                    <TablerIcon name="check" size={18} color={Colors.primaryColor} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default React.memo(ProductSortDropdown);

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
  },
  triggerLabel: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginRight: 12,
  },
  triggerValueRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    minWidth: 0,
  },
  triggerValue: {
    flexShrink: 1,
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'right',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  sheetTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionRowActive: {
    backgroundColor: '#E8F5F1',
  },
  optionText: {
    fontSize: 14,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
  },
  optionTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
