import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../../components/TablerIcon';
import CommonModal from '../../components/LogoutModal';

interface Props {
  item: any;
  selected?: boolean;
  onSelect?: () => void;
  onPreview: () => void;
  onDelete: () => void;
}

const isImageFile = (item: any) => {
  const type = String(item?.file_type || '').toLowerCase();
  const url = String(item?.file_url || item?.thumbnail_url || '');
  if (type.includes('image') || type === 'jpg' || type === 'jpeg' || type === 'png' || type === 'webp') {
    return true;
  }
  if (type.includes('pdf')) return false;
  return /\.(jpe?g|png|gif|webp|heic)(\?|$)/i.test(url);
};

const formatTypeLabel = (type?: string) => {
  const value = String(type || '').toLowerCase();
  if (value === 'prescription') return 'Prescription';
  if (value === 'lab_report') return 'Lab Report';
  if (!value) return 'Record';
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const MedicalRecordCard = ({
  item,
  onPreview,
  onDelete,
}: Props) => {
  const [deleteModal, setDeleteModal] = React.useState(false);

  const showImage = useMemo(() => isImageFile(item), [item]);
  const imageUri = item?.file_url || item?.thumbnail_url || '';
  const title =
    item?.title ||
    item?.description ||
    item?.file_name ||
    'Medical record';
  const typeLabel = formatTypeLabel(item?.medical_record_type);
  const isLab = String(item?.medical_record_type || '').toLowerCase() === 'lab_report';
  const isRx = String(item?.medical_record_type || '').toLowerCase() === 'prescription';
  const dateLabel = formatDate(
    item?.created_at || item?.uploaded_at || item?.updated_at,
  );
  const fileLabel = String(item?.file_type || 'FILE').toUpperCase();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPreview}
      style={styles.card}
    >
      <View style={styles.thumbWrap}>
        {showImage && imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumb} />
        ) : (
          <View style={styles.fileThumb}>
            <TablerIcon
              name={String(item?.file_type || '').includes('pdf') ? 'file' : 'photo'}
              size={18}
              color={Colors.primaryColor}
            />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          <View
            style={[
              styles.typeBadge,
              isLab && styles.labBadge,
              isRx && styles.rxBadge,
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                isLab && styles.labBadgeText,
                isRx && styles.rxBadgeText,
              ]}
              numberOfLines={1}
            >
              {typeLabel}
            </Text>
          </View>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText} numberOfLines={1}>
            {fileLabel}
          </Text>
          {!!dateLabel && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText} numberOfLines={1}>
                {dateLabel}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onPreview}
          style={styles.actionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <TablerIcon name="eye" size={16} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDeleteModal(true)}
          style={[styles.actionBtn, styles.deleteBtn]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <TablerIcon name="trash" size={16} color="#DC2626" />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6EFEA',
  },
  thumbWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E8F3F1',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  fileThumb: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
  },
  content: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    flexWrap: 'nowrap',
  },
  typeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: 110,
  },
  typeBadgeText: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  rxBadge: {
    backgroundColor: '#DCFCE7',
  },
  rxBadgeText: {
    color: '#065F46',
  },
  labBadge: {
    backgroundColor: '#FEF3C7',
  },
  labBadgeText: {
    color: '#B45309',
  },
  metaDot: {
    marginHorizontal: 4,
    color: '#CBD5E1',
    fontSize: 11,
  },
  metaText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    gap: 4,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
});
