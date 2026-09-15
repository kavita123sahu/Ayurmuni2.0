import React from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Text,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '../../common/Vector';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';

const isImageUrl = (url?: string, record?: any) => {
  const type = String(record?.file_type || '').toLowerCase();
  if (type.includes('pdf')) return false;
  if (type.includes('image') || type === 'jpg' || type === 'jpeg' || type === 'png') {
    return true;
  }
  return /\.(jpe?g|png|gif|webp|heic)(\?|$)/i.test(String(url || ''));
};

const PreviewModal = ({
  visible,
  imageUrl,
  record,
  onClose,
}: any) => {
  const showImage = isImageUrl(imageUrl, record);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.previewContainer}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>

        {showImage ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.pdfBox}>
            <Ionicons name="document-text" size={56} color="#fff" />
            <Text style={styles.pdfTitle}>PDF document</Text>
            <TouchableOpacity
              style={styles.openBtn}
              onPress={() => Linking.openURL(imageUrl)}
              activeOpacity={0.85}
            >
              <Text style={styles.openBtnText}>Open PDF</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default PreviewModal;

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 18,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfBox: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pdfTitle: {
    color: '#fff',
    marginTop: 12,
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  openBtn: {
    marginTop: 16,
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  openBtnText: {
    color: '#fff',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
  },
});
