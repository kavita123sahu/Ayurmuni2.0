import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { bloodGroupOptions, genderOptions, relationOptions } from '../common/DataInterface';


const AppInputField = ({
  label,
  placeholder,
  leftIcon,
  rightIcon,
  value,
  options = [],
  onSelect,
  onChangeText,
  containerStyle,
}: any) => {

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const isDropdownField =
    options.length > 0;

  const [dropdownVisible, setDropdownVisible] =
    useState(false);

  const [dropdownOptions, setDropdownOptions] =
    useState<any[]>([]);

  const [dropdownTitle, setDropdownTitle] =
    useState('');

  const isDateField =
    label?.toLowerCase() === 'date of birth' ||
    label?.toLowerCase() === 'valid thru';

  const isGenderField =
    label === 'Gender';

  const isBloodGroupField =
    label === 'Blood Group';

  const isRelationField =
    label === 'Relation';

  const isEmergencyRelationField =
    label === 'Emergency Relation';



  // 📅 format date
  const formatDate = (date: Date) => {

    const day = String(
      date.getDate(),
    ).padStart(2, '0');

    const month = String(
      date.getMonth() + 1,
    ).padStart(2, '0');

    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  };

  const handleConfirm = (date: Date) => {
    onChangeText(formatDate(date));
    setDatePickerVisibility(false);
  };

  // ✍️ typing handler (DOB only)
  const handleChange = (text: string) => {
    if (isDateField) {
      let cleaned = text.replace(/\D/g, '');
      let formatted = cleaned;

      if (cleaned.length > 2 && cleaned.length <= 4) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
      } else if (cleaned.length > 4) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
      }

      onChangeText(formatted);
    } else {
      onChangeText(text);
    }
  };

  // 👇 press handler
  const handlePress = () => {

    if (isDateField) {
      setDatePickerVisibility(true);
      return;
    }

    if (isDropdownField) {
      setDropdownVisible(true);
      return;
    }
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
      >
        <View style={styles.inputContainer}>
          {leftIcon && (
            <Image source={leftIcon} style={styles.leftIcon} />
          )}

          <TextInput
            value={value}
            placeholder={placeholder}
            editable={
              !isDateField &&
              !isDropdownField
            }
            onChangeText={onChangeText}
            style={styles.input}
          />

          {rightIcon && (
            <Image source={rightIcon} style={styles.rightIcon} />
          )}
        </View>
      </TouchableOpacity>

      {/* 📅 DATE PICKER */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() =>
          setDatePickerVisibility(false)
        }
        maximumDate={
          label === 'Date of Birth'
            ? new Date()
            : undefined
        }
        minimumDate={
          label === 'Valid Thru'
            ? new Date()
            : undefined
        }
      />

     <Modal
  visible={dropdownVisible}
  transparent
  animationType="fade"
>
  <TouchableOpacity
    style={styles.modalOverlay}
    activeOpacity={1}
    onPress={() =>
      setDropdownVisible(false)
    }
  >
    <View style={styles.modalBox}>

      <FlatList
        data={options}
        keyExtractor={item =>
          item.value
        }
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.option}
            onPress={() => {

              onSelect?.(item);

              onChangeText?.(
                item.value,
              );

              setDropdownVisible(
                false,
              );
            }}
          >
            <Text>
              {item.label}
            </Text>
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
    marginBottom: 16,
    paddingHorizontal: 4,
    width: '100%',
  },

  label: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    height: 53,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
    fontFamily: Fonts.PoppinsMedium,
  },

  leftIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#9CA3AF',
  },

  rightIcon: {
    width: 18,
    height: 18,
    marginLeft: 8,
    tintColor: '#94A3B8',
  },

  // 🔥 MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  modalTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
  },

  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  selectedOption: {
    backgroundColor: '#0D614E1A', // light green bg
  },

  optionText: {
    fontSize: 15,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsMedium,
  },

  selectedText: {
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  tickIcon: {
    width: 18,
    height: 18,
    tintColor: '#0D614E',
  },
});