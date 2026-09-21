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
          <View style={styles.headerRow}>
            <LinearGradient
              colors={['#ECFDF5', '#F0FDFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconWrap}
            >
              <TablerIcon
                name="prescription"
                size={20}
                color={Colors.primaryColor}
              />
            </LinearGradient>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Prescription required</Text>
              {!!state.productName && (
                <Text style={styles.productName} numberOfLines={1}>
                  {state.productName}
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.message} numberOfLines={3}>
            {state.message}
          </Text>

          <TouchableOpacity
            style={styles.primaryWrap}
            activeOpacity={0.9}
            onPress={openConsult}
          >
            <LinearGradient
              colors={['#0D614E', '#14937A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <TablerIcon name="stethoscope" size={16} color="#FFFFFF" />
              <Text style={styles.primaryText}>Consult a doctor</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.88}
            onPress={openUploadFlow}
          >
            <TablerIcon name="upload" size={15} color={Colors.primaryColor} />
            <Text style={styles.secondaryText}>Upload prescription</Text>
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#E6EFEA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDEADF',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 15,
    color: '#0F172A',
  },
  productName: {
    marginTop: 1,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: Colors.primaryColor,
    maxWidth: '100%',
  },
  message: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    marginBottom: 12,
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
  secondaryBtn: {
    width: '100%',
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CDEADF',
    backgroundColor: '#F8FFFC',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  secondaryText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 12,
    color: Colors.primaryColor,
  },
  cancelBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: '#64748B',
  },
});
