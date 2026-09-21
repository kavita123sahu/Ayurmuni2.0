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
import TablerIcon from './TablerIcon';
import { navigate } from '../navigation/navigationRef';
import {
  registerPrescriptionModal,
  unregisterPrescriptionModal,
} from '../services/prescriptionModalService';

const DEFAULT_MESSAGE =
  'This medicine needs a valid prescription before it can be added to cart.';

type ModalState = {
  message: string;
  variantId?: string;
  productName?: string;
};

const PrescriptionRequiredModalHost = () => {
  const { width: screenW } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<ModalState>({
    message: DEFAULT_MESSAGE,
  });

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  const openConsult = useCallback(() => {
    setVisible(false);
    navigate('AllDoctors');
  }, []);

  const openUploadFlow = useCallback(() => {
    const variantId = state.variantId;
    setVisible(false);
    navigate('Prescription', {
      variantIds: variantId ? [variantId] : [],
      productName: state.productName,
      fromPrescriptionGate: true,
    });
  }, [state.variantId, state.productName]);

  useEffect(() => {
    registerPrescriptionModal(
      options => {
        setState({
          message: options?.message || DEFAULT_MESSAGE,
          variantId: options?.variantId
            ? String(options.variantId)
            : undefined,
          productName: options?.productName
            ? String(options.productName)
            : undefined,
        });
        setVisible(true);
      },
      openConsult,
      opts => {
        setVisible(false);
        const id = opts?.variantId ? String(opts.variantId) : undefined;
        navigate('Prescription', {
          variantIds: id ? [id] : [],
          productName: opts?.productName,
          fromPrescriptionGate: true,
        });
      },
    );
    return unregisterPrescriptionModal;
  }, [openConsult]);

  const sheetWidth = Math.min(screenW - 32, 340);

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
          style={[styles.sheet, { width: sheetWidth }]}
          onPress={e => e?.stopPropagation?.()}
        >
          <LinearGradient
            colors={['#ECFDF5', '#F0FDFA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconWrap}
          >
            <TablerIcon
              name="prescription"
              size={22}
              color={Colors.primaryColor}
            />
          </LinearGradient>

          <Text style={styles.title}>Prescription required</Text>
          {!!state.productName && (
            <Text style={styles.productName} numberOfLines={1}>
              {state.productName}
            </Text>
          )}
          <Text style={styles.message}>{state.message}</Text>

          <View style={styles.trustRow}>
            <View style={styles.trustChip}>
              <TablerIcon name="shield" size={12} color={Colors.primaryColor} />
              <Text style={styles.trustText}>Secure</Text>
            </View>
            <View style={styles.trustChip}>
              <TablerIcon
                name="approved"
                size={12}
                color={Colors.primaryColor}
              />
              <Text style={styles.trustText}>Pharmacist approved</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryWrap}
            activeOpacity={0.9}
            onPress={openUploadFlow}
          >
            <LinearGradient
              colors={['#0D614E', '#14937A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <TablerIcon name="upload" size={16} color="#FFFFFF" />
              <Text style={styles.primaryText}>Upload Rx for approval</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.orText}>or consult a doctor</Text>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.88}
            onPress={openConsult}
          >
            <TablerIcon
              name="stethoscope"
              size={15}
              color={Colors.primaryColor}
            />
            <Text style={styles.secondaryText}>Consult now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.85}
            onPress={close}
          >
            <Text style={styles.cancelText}>Not now</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PrescriptionRequiredModalHost;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EFEA',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CDEADF',
  },
  title: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
  },
  productName: {
    marginTop: 2,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: Colors.primaryColor,
    textAlign: 'center',
    maxWidth: '100%',
  },
  message: {
    marginTop: 6,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
  },
  trustRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#CDEADF',
  },
  trustText: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  primaryWrap: {
    width: '100%',
    marginBottom: 8,
  },
  primaryBtn: {
    minHeight: 44,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  primaryText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  orText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 8,
  },
  secondaryBtn: {
    width: '100%',
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CDEADF',
    backgroundColor: '#F0FDF9',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  secondaryText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
    color: Colors.primaryColor,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: '#64748B',
  },
});
