import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
interface Props {
  item: any;
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onDelete: () => void;
}

const MedicalRecordCard = ({
  item,
  selected,
  onSelect,
  onPreview,
  onDelete,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onSelect}
      style={[
        styles.card,
        selected && styles.selectedCard,
      ]}>

      <TouchableOpacity
        onPress={onSelect}
        style={styles.checkbox}>
        <Ionicons
          name={
            selected
              ? 'checkmark-circle'
              : 'ellipse-outline'
          }
          size={26}
          color={
            selected
              ? Colors.primaryColor
              : '#BDBDBD'
          }
        />
      </TouchableOpacity>

      <View style={styles.fileIcon}>
        <Ionicons
          name={
            item.file_type === 'pdf'
              ? 'document-text'
              : 'image'
          }
          size={24}
          color="#065F46"
        />
      </View>

      <View style={{flex: 1}}>
        <Text style={styles.title}>
          {item.description || 'Medical Record'}
        </Text>

        <Text style={styles.subTitle}>
          {item.file_type?.toUpperCase()}
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.medical_record_type ===
            'lab_report'
              ? 'Lab Report'
              : 'Prescription'}
          </Text>
        </View>
      </View>

<View style={styles.actionContainer}>

  <TouchableOpacity
    style={styles.iconBtn}
    onPress={onPreview}>
    <Ionicons
      name="eye-outline"
      size={22}
      color="#065F46"
    />
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.iconBtn}
    onPress={() =>
      Linking.openURL(item.file_url)
    }>
    <Ionicons
      name="open-outline"
      size={22}
      color="#2563EB"
    />
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.iconBtn}
    onPress={onDelete}>
    <Ionicons
      name="trash-outline"
      size={22}
      color="#DC2626"
    />
  </TouchableOpacity>

</View>
    </TouchableOpacity>
  );
};

export default MedicalRecordCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  selectedCard: {
    borderColor: '#065F46',
    backgroundColor: '#F0FDF4',
  },

  checkbox: {
    marginRight: 12,
  },

  fileIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  title: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: Colors.black,
  },

  subTitle: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12,
    color: Colors.subTextColor,
    marginTop: 2,
  },

  badge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: '#166534',
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
  },

  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBtn: {
    marginLeft: 10,
  },
});