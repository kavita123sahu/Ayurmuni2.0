import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../../components/TablerIcon';
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
  onSelect,
  onPreview,
  onDelete,
}: Props) => {
  const [deleteModal, setDeleteModal] = React.useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSelect}
      style={styles.card}
    >
      <View style={styles.fileIcon}>
        <TablerIcon
          name={item.file_type === 'pdf' ? 'file' : 'photo'}
          size={20}
          color={Colors.primaryColor}
        />
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {item.description}
        </Text>
        <Text style={styles.subTitle}>
          {item.file_type?.toUpperCase() || 'FILE'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onPreview} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <TablerIcon name="eye" size={20} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDeleteModal(true)}
          style={{ marginLeft: 14 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <TablerIcon name="trash" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <CommonModal
        visible={deleteModal}
        icon="🗑️"
        title="Delete Record"
        subtitle="Are you sure you want to delete this record?"
        cancelText="Cancel"
        confirmText="Delete"
        onClose={() => setDeleteModal(false)}
        onConfirm={() => {
          setDeleteModal(false);
          onDelete();
        }}
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
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fileIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    color: '#111827',
    fontFamily: Fonts.PoppinsSemiBold,
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
