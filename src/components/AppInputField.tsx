import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon, { TablerIconName } from './TablerIcon';

const AppInputField = ({
  label,
  placeholder,
  leftIconName,
  rightIconName,
  value,
  options = [],
  onSelect,
  onChangeText,
  containerStyle,
}: any) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const isDropdownField = options.length > 0;
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const isDateField =
    label?.toLowerCase() === 'date of birth' || 
    label?.toLowerCase() === 'valid thru';

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleConfirm = (date: Date) => {
    onChangeText(formatDate(date));
    setDatePickerVisibility(false);
  };

  const handlePress = () => {
    if (isDateField) {
      setDatePickerVisibility(true);
      return;
    }
    if (isDropdownField) {
      setDropdownVisible(true);
    }
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
        <View style={styles.inputContainer}>
          {leftIconName && (
            <TablerIcon
              name={leftIconName as TablerIconName}
              size={18}
              color="#64748B"
            />
          )}

          <TextInput
            value={value}
            placeholder={placeholder}
            editable={!isDateField && !isDropdownField}
            onChangeText={onChangeText}
            style={styles.input}
          />

          {rightIconName && (
            <TablerIcon
              name={rightIconName as TablerIconName}
              size={18}
              color="#64748B"
            />
          )}
        </View>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        maximumDate={label === 'Date of Birth *' ? new Date() : undefined}
        minimumDate={label === 'Valid Thru' ? new Date() : undefined}
      />

      <Modal visible={dropdownVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownBox}>
            <FlatList
              data={options}
              keyExtractor={(item, i) => String(item?.value ?? i)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    onSelect?.(item.value);
                    onChangeText?.(item.label);
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default AppInputField;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#FFF',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,

    color: Colors.textColor,
    paddingVertical: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  dropdownBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    maxHeight: 280,
  },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsRegular,
    color: Colors.textColor,
  },
});
