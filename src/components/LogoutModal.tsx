// components/CommonModal.tsx

import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../common/Fonts';

interface CommonModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  icon?: string;
  cancelText?: string;
  confirmText?: string;
  loading?: boolean;
  /** Force stacked buttons (best for long labels like recover). Default: auto */
  stackButtons?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CommonModal = ({
  visible,
  title,
  subtitle,
  icon = '👋',
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  loading = false,
  stackButtons,
  onClose,
  onConfirm,
}: CommonModalProps) => {
  const { width: screenW, height: screenH } = useWindowDimensions();

  // Keep the same composition on all pixel densities / widths
  const sheetWidth = Math.min(screenW - 40, 360);
  const padH = screenW < 360 ? 16 : 20;
  const padV = screenW < 360 ? 20 : 24;
  const titleSize = screenW < 360 ? 18 : 20;
  const subtitleSize = screenW < 360 ? 13 : 14;
  const btnFont = screenW < 360 ? 13 : 14;
  const maxBodyH = Math.min(screenH * 0.32, 180);

  const longLabels =
    String(cancelText).length > 10 || String(confirmText).length > 12;
  const useStack = stackButtons ?? (longLabels || screenW < 380);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContainer,
            {
              width: sheetWidth,
              paddingHorizontal: padH,
              paddingVertical: padV,
              maxHeight: screenH * 0.86,
            },
          ]}
          onPress={e => e?.stopPropagation?.()}
        >
          <View style={styles.iconWrapper}>
            <Text style={styles.icon}>{icon}</Text>
          </View>

          <Text
            style={[styles.title, { fontSize: titleSize }]}
            numberOfLines={3}
          >
            {title}
          </Text>

          <ScrollView
            style={{ maxHeight: maxBodyH, width: '100%' }}
            contentContainerStyle={styles.subtitleScroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text
              style={[
                styles.subtitle,
                { fontSize: subtitleSize, lineHeight: subtitleSize + 6 },
              ]}
            >
              {subtitle}
            </Text>
          </ScrollView>

          <View
            style={[
              styles.buttonRow,
              useStack && styles.buttonStack,
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.cancelBtn,
                useStack ? styles.btnFull : styles.btnHalfLeft,
              ]}
              onPress={e => {
                e?.stopPropagation?.();
                onClose();
              }}
              disabled={loading}
            >
              <Text
                style={[styles.cancelText, { fontSize: btnFont }]}
                numberOfLines={2}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={e => {
                e?.stopPropagation?.();
                onConfirm();
              }}
              disabled={loading}
              style={[
                styles.confirmBtnWrapper,
                useStack ? styles.btnFull : styles.btnHalfRight,
              ]}
            >
              <LinearGradient
                colors={['#0D614E', '#159B7E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={[styles.confirmText, { fontSize: btnFont }]}
                    numberOfLines={2}
                  >
                    {confirmText}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CommonModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
  },

  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F8F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  icon: {
    fontSize: 28,
  },

  title: {
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#111827',
    textAlign: 'center',
    width: '100%',
    includeFontPadding: false,
  },

  subtitleScroll: {
    paddingTop: 8,
    paddingBottom: 4,
  },

  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: Fonts.PoppinsMedium,
    width: '100%',
    includeFontPadding: false,
  },

  buttonRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 20,
    width: '100%',
  },

  buttonStack: {
    flexDirection: 'column',
    gap: 10,
  },

  btnFull: {
    width: '100%',
    marginRight: 0,
    marginLeft: 0,
  },

  btnHalfLeft: {
    flex: 1,
    marginRight: 6,
  },

  btnHalfRight: {
    flex: 1,
    marginLeft: 6,
  },

  cancelBtn: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },

  cancelText: {
    fontFamily: Fonts.PoppinsMedium,
    color: '#374151',
    textAlign: 'center',
    includeFontPadding: false,
  },

  confirmBtnWrapper: {
    minHeight: 48,
  },

  confirmBtn: {
    minHeight: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  confirmText: {
    fontFamily: Fonts.PoppinsMedium,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
