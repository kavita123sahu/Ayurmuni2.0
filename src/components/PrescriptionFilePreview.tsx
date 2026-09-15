import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';

type Props = {
  uri?: string | null;
  fileType?: string | null;
  height?: number;
  onPressPreview?: () => void;
};

export const isPdfFile = (fileType?: string | null, uri?: string | null) => {
  const type = String(fileType || '').toLowerCase();
  if (type.includes('pdf')) return true;
  return /\.pdf(\?|$)/i.test(String(uri || ''));
};

export const isImageFile = (fileType?: string | null, uri?: string | null) => {
  if (isPdfFile(fileType, uri)) return false;
  const type = String(fileType || '').toLowerCase();
  if (type.includes('image') || type === 'image' || type === 'jpg' || type === 'jpeg' || type === 'png') {
    return true;
  }
  if (!uri) return false;
  return /\.(jpe?g|png|gif|webp|heic|bmp)(\?|$)/i.test(uri);
};

const fileLabel = (fileType?: string | null, uri?: string | null) =>
  isPdfFile(fileType, uri) ? 'PDF' : 'Image';

export const PrescriptionFilePreview = ({
  uri,
  fileType,
  height = 180,
}: Props) => {
  const [open, setOpen] = useState(false);
  const pdf = isPdfFile(fileType, uri);
  const image = isImageFile(fileType, uri);

  if (!uri) {
    return (
      <View style={[styles.frame, styles.empty, { height }]}>
        <TablerIcon name="file-medical" size={28} color={Colors.primaryColor} />
        <Text style={styles.emptyText}>No prescription file</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setOpen(true)}
        style={[styles.frame, { height }]}
      >
        {image ? (
          <Image source={{ uri }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.pdfCover}>
            <TablerIcon name="file" size={32} color={Colors.primaryColor} />
            <Text style={styles.pdfLabel}>{pdf ? 'PDF prescription' : 'Prescription file'}</Text>
          </View>
        )}
        <View style={styles.previewChip}>
          <TablerIcon name="eye" size={13} color="#FFFFFF" />
          <Text style={styles.previewChipText}>Preview</Text>
        </View>
      </TouchableOpacity>

      <PrescriptionPreviewModal
        visible={open}
        uri={uri}
        fileType={fileType}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const PrescriptionPreviewModal = ({
  visible,
  uri,
  fileType,
  onClose,
}: {
  visible: boolean;
  uri?: string | null;
  fileType?: string | null;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const [failed, setFailed] = useState(false);
  React.useEffect(() => {
    if (visible) setFailed(false);
  }, [visible, uri]);
  const pdf = isPdfFile(fileType, uri);
  const image = !pdf && isImageFile(fileType, uri);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={[styles.modalBar, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.modalTitle}>{fileLabel(fileType, uri)} preview</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <TablerIcon name="x" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {image && uri ? (
          <Image
            source={{ uri }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        ) : uri && !failed ? (
          <WebView
            source={{ uri }}
            style={styles.web}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webLoading}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
            onError={() => setFailed(true)}
            onHttpError={() => setFailed(true)}
          />
        ) : (
          <View style={styles.pdfFallback}>
            <TablerIcon name="file" size={40} color="#FFFFFF" />
            <Text style={styles.fallbackTitle}>
              {pdf ? 'PDF prescription' : 'File preview'}
            </Text>
            {uri ? (
              <TouchableOpacity
                style={styles.openBtn}
                onPress={() => Linking.openURL(uri)}
              >
                <Text style={styles.openBtnText}>Open file</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E8F3F1',
    borderWidth: 1,
    borderColor: '#D7E8E3',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  pdfCover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
  },
  pdfLabel: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  previewChip: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(13, 97, 78, 0.92)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  previewChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  modal: {
    flex: 1,
    backgroundColor: '#0B1F1B',
  },
  modalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  fullImage: {
    flex: 1,
    width: '100%',
  },
  web: {
    flex: 1,
    backgroundColor: '#111',
  },
  webLoading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  fallbackTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  openBtn: {
    marginTop: 6,
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  openBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});

export default PrescriptionFilePreview;
