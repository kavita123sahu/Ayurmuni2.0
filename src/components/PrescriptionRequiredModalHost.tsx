import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { navigate } from '../navigation/navigationRef';
import {
  registerPrescriptionModal,
  unregisterPrescriptionModal,
} from '../services/prescriptionModalService';

const DEFAULT_MESSAGE =
  'You cannot increase the quantity or add this medicine to cart without a doctor’s prescription.';

const PrescriptionRequiredModalHost = () => {
  const { width: screenW } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  const openConsult = useCallback(() => {
    setVisible(false);
    navigate('AllDoctors');
  }, []);

  useEffect(() => {
    registerPrescriptionModal(
      options => {
        setMessage(options?.message || DEFAULT_MESSAGE);
        setVisible(true);
      },
      openConsult,
    );
    return unregisterPrescriptionModal;
  }, [openConsult]);

  const sheetWidth = Math.min(screenW - 40, 360);
  const padH = screenW < 360 ? 16 : 20;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable
          style={[styles.sheet, { width: sheetWidth, paddingHorizontal: padH }]}
          onPress={e => e?.stopPropagation?.()}
        >
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>💊</Text>
          </View>

          <Text style={styles.title}>Prescription required</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.85}
              onPress={close}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmWrap}
              activeOpacity={0.9}
              onPress={openConsult}
            >
              <LinearGradient
                colors={['#0D614E', '#159B7E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmBtn}
              >
                <Text style={styles.confirmText}>Consult Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PrescriptionRequiredModalHost;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 24,
    alignItems: 'center',
  },
  iconWrap: {
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
    fontSize: 20,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  cancelText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  confirmWrap: {
    flex: 1,
    minHeight: 48,
  },
  confirmBtn: {
    minHeight: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  confirmText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
  },
});
