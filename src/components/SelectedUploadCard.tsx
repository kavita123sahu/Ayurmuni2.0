import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';

type Props = {
  name: string;
  uri?: string;
  fileType?: string;
  onRemove: () => void;
  compact?: boolean;
};

const isImageType = (fileType?: string, uri?: string) => {
  if (fileType?.includes('image') || fileType === 'image') return true;
  if (!uri) return false;
  return /\.(jpe?g|png|gif|webp|heic)$/i.test(uri);
};

const SelectedUploadCard: React.FC<Props> = ({
  name,
  uri,
  fileType,
  onRemove,
  compact = false,
}) => {
  const showImage = isImageType(fileType, uri);

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.previewBox}>
        {showImage && uri ? (
          <Image source={{ uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.fileIconWrap}>
            <TablerIcon
              name={fileType?.includes('pdf') ? 'file' : 'photo'}
              size={compact ? 22 : 28}
              color={Colors.primaryColor}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.removeBtn}
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.85}
        >
          <TablerIcon name="x" size={12} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.fileName} numberOfLines={2}>
        {name}
      </Text>
      <Text style={styles.fileType} numberOfLines={1}>
        {fileType?.includes('pdf') ? 'PDF Document' : 'Image'}
      </Text>
    </View>
  );
};

export default SelectedUploadCard;

const styles = StyleSheet.create({
  card: {
    width: 108,
    marginRight: 12,
    marginBottom: 4,
  },
  cardCompact: {
    width: 96,
  },
  previewBox: {
    width: '100%',
    height: 108,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1E7DF',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fileIconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  fileName: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  fileType: {
    marginTop: 2,
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
});
