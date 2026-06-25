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
import CommonButton from '../../components/CommonButton';
import CommonModal from '../../components/LogoutModal';
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

  const [deleteModal, setDeleteModal] = React.useState(false);
  return (

    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onSelect}
      style={[
        styles.card,
        // selected && styles.selectedCard,
      ]}>

      {/* Left */}


      {/* File Icon */}
      <View style={styles.fileIcon}>
        <Ionicons
          name={
            item.file_type === 'pdf'
              ? 'document-text'
              : 'image'
          }
          size={20}
          color={Colors.primaryColor}
        />
      </View>

      {/* Details */}
      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={styles.title}>
          {item.description}
        </Text>

        <Text style={styles.subTitle}>
          {item.file_type?.toUpperCase()}
        </Text>
      </View>

      {/* Right Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(item.file_url)
          }>
          <Ionicons
            name="eye-outline"
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDeleteModal(true)}
          style={{ marginLeft: 12 }}>
          <Ionicons
            name="trash-bin-outline"
            size={20}
            color="#EF4444"
          />
        </TouchableOpacity>
      </View>

      <CommonModal
        visible={deleteModal}
        icon="🗑️"
        title="Delete Record"
        subtitle="Are you sure want to delete , this record?"
        cancelText="Cancel"
        confirmText="Delete"
        // loading={isDeleting}
        onClose={() => setDeleteModal(false)}
        onConfirm={onDelete}
      />
    </TouchableOpacity>
  );
};

export default MedicalRecordCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  selectedCard: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F0FDF4',
  },

  fileIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  content: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontSize: 14,
    color: '#111827',
    fontFamily: Fonts.PoppinsMedium,
  },

  subTitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: Fonts.PoppinsRegular,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});