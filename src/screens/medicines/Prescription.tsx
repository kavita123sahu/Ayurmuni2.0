import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import TablerIcon from '../../components/TablerIcon';
import { requireAuth } from '../../services/guestAuth';
import { PrescriptionFilePreview, PrescriptionPreviewModal, isPdfFile } from '../../components/PrescriptionFilePreview';
import { isErrorWithCode, errorCodes, pick } from '@react-native-documents/picker';
import { useAppSelector } from '../../store/hooks';
import {
  formatPrescriptionDate,
  getPrescriptionRequests,
  getPrescriptionFiles,
  getStatusLabel,
  isPrescriptionApproved,
  isPrescriptionPending,
  normalizePrescriptionRequestList,
} from '../../services/PrescriptionRequestService';
import { showSuccessToast } from '../../config/Key';

type PickedFile = {
  uri: string;
  name: string;
  type: string;
};

const TIPS = [
  { title: 'Bright lighting', desc: 'Well-lit paper, no harsh shadows.' },
  { title: 'Perfect alignment', desc: 'Keep all four corners in frame.' },
  { title: 'Sharp focus', desc: 'Hold steady so text stays readable.' },
];

const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

const Prescription = (props: any) => {
  const insets = useSafeAreaInsets();
  const routeVariantIds = Array.isArray(props.route?.params?.variantIds)
    ? props.route.params.variantIds.map((id: any) => String(id).trim()).filter(Boolean)
    : [];

  console.log('PrescriptionvariantIds =>', routeVariantIds, props.route?.params?.productName, props.route?.params?.fromPrescriptionGate);

  const gatedProductName = String(props.route?.params?.productName || '').trim();
  const fromGate = Boolean(props.route?.params?.fromPrescriptionGate);

  const [selectedFiles, setSelectedFiles] = useState<PickedFile[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [openingCamera, setOpeningCamera] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ uri: string; fileType?: string } | null>(null);

  // const cartData = useAppSelector((s: any) => s.cart?.cartData);
  // const variantQuantities = useAppSelector(
  //   (s: any) => s.cart?.variantQuantities ?? {},
  // );
  // const variantIds = useMemo(() => {
  //   const fromCart = (cartData?.my_cart?.items ?? [])
  //     .map((item: any) => String(item?.variant_id || '').trim())
  //     .filter(Boolean);
  //   const fromQty = Object.keys(variantQuantities || {}).filter(
  //     id => Number(variantQuantities[id]) > 0,
  //   );
  //   return [...new Set([...routeVariantIds, ...fromCart, ...fromQty])];
  // }, [cartData, variantQuantities, routeVariantIds]);

  const loadRecent = useCallback(async () => {
    try {
      setLoadingRecent(true);
      const res = await getPrescriptionRequests();
      const list = normalizePrescriptionRequestList(res).slice(0, 8);
      setRecent(list);
    } catch {
      setRecent([]);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecent();
    }, [loadRecent]),
  );

  const addFiles = useCallback((next: PickedFile[]) => {
    const valid = next.filter(file => file?.uri);
    if (!valid.length) return;
    setSelectedFiles(prev => {
      const seen = new Set(prev.map(file => file.uri));
      return [...prev, ...valid.filter(file => !seen.has(file.uri))].slice(0, 4);
    });
  }, []);

  const handlePickResult = useCallback((asset?: Asset | null) => {
    if (!asset?.uri) return;
    addFiles([{
      uri: asset.uri,
      name: asset.fileName || `prescription_${Date.now()}.jpg`,
      type: asset.type || 'image/jpeg',
    }]);
  }, [addFiles]);

  const openCamera = async () => {
    try {
      setOpeningCamera(true);
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Camera permission needed',
          'Please allow camera access to take a prescription photo.',
        );
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.92,
        saveToPhotos: false,
        cameraType: 'back',
        includeBase64: false,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert(
          'Camera unavailable',
          result.errorMessage || 'Could not open the camera. Please try again.',
        );
        return;
      }

      handlePickResult(result.assets?.[0]);
    } catch (error) {
      console.log('PRESCRIPTION_CAMERA_ERROR =>', error);
      Alert.alert('Camera error', 'Could not open the camera. Please try again.');
    } finally {
      setOpeningCamera(false);
    }
  };

  const openFiles = async () => {
    try {
      const result = await pick({
        mode: 'open',
        type: ['image/*', 'application/pdf'],
      });
      const file = result?.[0];
      if (!file?.uri) return;
      addFiles([{
        uri: file.uri,
        name: file.name || `prescription_${Date.now()}`,
        type: file.type || 'application/pdf',
      }]);
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      console.log('PRESCRIPTION_FILE_ERROR =>', error);
    }
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.92,
        selectionLimit: 4,
      });
      if (result.didCancel || result.errorCode) return;
      addFiles(
        (result.assets || []).map((asset, index) => ({
          uri: asset.uri || '',
          name: asset.fileName || `prescription_${Date.now()}_${index}.jpg`,
          type: asset.type || 'image/jpeg',
        })),
      );
    } catch (error) {
      console.log('PRESCRIPTION_GALLERY_ERROR =>', error);
    }
  };

  const proceed = async () => {
    if (!(await requireAuth('Please login to upload prescription'))) return;
    if (!selectedFiles.length) {
      showSuccessToast('Please upload a prescription photo first', 'error');
      return;
    }
    props.navigation.navigate('VerifyPresciption', {
      files: selectedFiles,
      fileUri: selectedFiles[0].uri,
      fileName: selectedFiles[0].name,
      fileType: selectedFiles[0].type,
      variantIds: routeVariantIds,
    });
  };

  const openExisting = (item: any) => {
    props.navigation.navigate('OrderHistory', {
      tab: 'requested',
      requestId: item?.id,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader
        title="Prescription"
        onLeftPress={() => props.navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 88 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.stepText}>Documents upload</Text>
          <Text style={styles.count}>1 / 3</Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={['#0D614E', '#14937A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: '33%' }]}
          />
        </View>

        <View style={styles.trustRow}>
          <View style={styles.trustChip}>
            <TablerIcon name="shield" size={13} color={Colors.primaryColor} />
            <Text style={styles.trustText}>Secure upload</Text>
          </View>
          <View style={styles.trustChip}>
            <TablerIcon name="approved" size={13} color={Colors.primaryColor} />
            <Text style={styles.trustText}>Pharmacist approved</Text>
          </View>
        </View>

        {fromGate || gatedProductName ? (
          <View style={styles.gateBanner}>
            <TablerIcon name="prescription" size={15} color={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
              <Text style={styles.gateTitle}>Approval needed for this product</Text>
              <Text style={styles.gateSub} numberOfLines={2}>
                {gatedProductName
                  ? `Upload your Rx to get “${gatedProductName}” approved.`
                  : 'Upload your prescription so this medicine can be approved for purchase.'}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          {selectedFiles.length ? (
            <View style={styles.selectedWrap}>
              <Text style={styles.selectedTitle}>
                Selected prescription{selectedFiles.length > 1 ? `s (${selectedFiles.length})` : ''}
              </Text>
              {selectedFiles.map(file => (
                <View key={file.uri} style={styles.fileBlock}>
                  <PrescriptionFilePreview
                    uri={file.uri}
                    fileType={file.type}
                    height={180}
                  />
                  <View style={styles.fileMetaRow}>
                    <Text style={styles.fileMetaName} numberOfLines={1}>
                      {file.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedFiles(prev => prev.filter(item => item.uri !== file.uri))
                      }
                    >
                      <Text style={styles.fileRemove}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <View style={styles.changeRow}>
                <TouchableOpacity
                  style={styles.changeBtn}
                  onPress={openCamera}
                  disabled={openingCamera}
                >
                  {openingCamera ? (
                    <ActivityIndicator size="small" color={Colors.primaryColor} />
                  ) : (
                    <TablerIcon name="camera" size={16} color={Colors.primaryColor} />
                  )}
                  <Text style={styles.changeBtnText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.changeBtn} onPress={openGallery}>
                  <TablerIcon name="photo" size={16} color={Colors.primaryColor} />
                  <Text style={styles.changeBtnText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.changeBtn} onPress={openFiles}>
                  <TablerIcon name="file" size={16} color={Colors.primaryColor} />
                  <Text style={styles.changeBtnText}>PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <LinearGradient
                colors={['#ECFDF5', '#F0FDFA']}
                style={styles.iconBox}
              >
                <TablerIcon name="prescription" size={26} color={Colors.primaryColor} />
              </LinearGradient>
              <Text style={styles.title}>Upload prescription</Text>
              <Text style={styles.subtitle}>
                Clear photo of your doctor&apos;s prescription for quick verification.
              </Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={openCamera}
                  activeOpacity={0.88}
                  disabled={openingCamera}
                >
                  {openingCamera ? (
                    <ActivityIndicator size="small" color={Colors.primaryColor} />
                  ) : (
                    <TablerIcon name="camera" size={20} color={Colors.primaryColor} />
                  )}
                  <Text style={styles.btnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={openGallery} activeOpacity={0.88}>
                  <TablerIcon name="photo" size={20} color={Colors.primaryColor} />
                  <Text style={styles.btnText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={openFiles} activeOpacity={0.88}>
                  <TablerIcon name="file" size={20} color={Colors.primaryColor} />
                  <Text style={styles.btnText}>PDF</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>How to take a photo</Text>
        {TIPS.map(item => (
          <View key={item.title} style={styles.tipRow}>
            <View style={styles.tickBox}>
              <TablerIcon name="check" size={13} color={Colors.primaryColor} />
            </View>
            <View style={styles.tipTextWrap}>
              <Text style={styles.tipTitle}>{item.title}</Text>
              <Text style={styles.tipDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent uploads</Text>
          <TouchableOpacity onPress={loadRecent}>
            <Text style={styles.seeAll}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {loadingRecent ? (
          <ActivityIndicator color={Colors.primaryColor} style={{ marginVertical: 12 }} />
        ) : recent.length === 0 ? (
          <Text style={styles.emptyRecent}>No prescription requests yet.</Text>
        ) : (
          <FlatList
            data={recent}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, i) => String(item?.id ?? i)}
            ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
            renderItem={({ item }) => {
              const approved = isPrescriptionApproved(item);
              const pending = isPrescriptionPending(item);
              const files = getPrescriptionFiles(item);
              const uri = files[0]?.uri;
              return (
                <View style={styles.recentCard}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() =>
                      uri
                        ? setPreviewFile({ uri, fileType: item?.file_type })
                        : openExisting(item)
                    }
                  >
                    <View style={styles.recentImgWrap}>
                      {uri && !isPdfFile(item?.file_type, uri) ? (
                        <Image source={{ uri }} style={styles.recentImg} resizeMode="cover" />
                      ) : (
                        <View style={[styles.recentImg, styles.recentPlaceholder]}>
                          <TablerIcon
                            name={isPdfFile(item?.file_type, uri) ? 'file' : 'file-medical'}
                            size={22}
                            color={Colors.primaryColor}
                          />
                        </View>
                      )}
                      {uri ? (
                        <View style={styles.recentPreview}>
                          <TablerIcon name="eye" size={12} color="#FFFFFF" />
                        </View>
                      ) : null}
                      {files.length > 1 ? (
                        <View style={styles.recentCount}>
                          <Text style={styles.recentCountText}>{files.length}</Text>
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openExisting(item)} activeOpacity={0.88}>
                    <Text style={styles.date} numberOfLines={1}>
                      {formatPrescriptionDate(item?.created_at || item?.updated_at) ||
                        'Submitted'}
                    </Text>
                    <View style={styles.verifiedRow}>
                      <TablerIcon
                        name={approved ? 'approved' : pending ? 'clock' : 'shield'}
                        size={11}
                        color={approved ? Colors.primaryColor : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.verified,
                          approved && { color: Colors.primaryColor },
                        ]}
                      >
                        {getStatusLabel(item)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </ScrollView>

      <PrescriptionPreviewModal
        visible={!!previewFile}
        uri={previewFile?.uri}
        fileType={previewFile?.fileType}
        onClose={() => setPreviewFile(null)}
      />

      <TouchableOpacity
        style={[styles.ctaWrap, ]}
        disabled={!selectedFiles.length}
        onPress={proceed}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={selectedFiles.length ? ['#0D614E', '#14937A'] : ['#94A3B8', '#94A3B8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.checkout}
        >
          <Text style={styles.checkoutText}>Proceed to verify</Text>
          <TablerIcon name="arrow-right" size={18} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Prescription;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  stepText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  count: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  progressBg: {
    height: 5,
    backgroundColor: '#0D614E22',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: { height: 5, borderRadius: 8 },
  trustRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#CDEADF',
  },
  trustText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  gateBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CDEADF',
    padding: 10,
    marginBottom: 10,
  },
  gateTitle: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  gateSub: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8EBE4',
    borderStyle: 'dashed',
    marginBottom: 14,
  },
  iconBox: {
    height: 52,
    width: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#64748B',
    marginTop: 4,
    marginBottom: 10,
    lineHeight: 17,
    fontFamily: Fonts.PoppinsRegular,
    paddingHorizontal: 4,
  },
  row: { flexDirection: 'row', gap: 8, width: '100%' },
  btn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EFEA',
    gap: 5,
  },
  btnText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  selectedWrap: { width: '100%', alignItems: 'flex-start' },
  fileBlock: {
    width: '100%',
    marginBottom: 10,
  },
  fileMetaRow: {
    width: '100%',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  fileMetaName: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },
  fileRemove: {
    fontSize: 12,
    color: '#B91C1C',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  selectedTitle: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: 8,
  },
  changeRow: { flexDirection: 'row', gap: 8, marginTop: 10, width: '100%' },
  changeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F0FDF9',
    borderWidth: 1,
    borderColor: '#CDEADF',
  },
  changeBtnText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
  sectionTitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tickBox: {
    height: 22,
    width: 22,
    borderRadius: 7,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 1,
  },
  tipTextWrap: { flex: 1 },
  tipTitle: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  tipDesc: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 1,
    lineHeight: 15,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  seeAll: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  emptyRecent: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    marginBottom: 8,
  },
  recentCard: { width: 96 },
  recentImgWrap: {
    width: 96,
    height: 112,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E8F3F1',
  },
  recentImg: {
    width: '100%',
    height: '100%',
  },
  recentCount: {
    position: 'absolute',
    left: 6,
    top: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#0D614E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  recentPreview: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 97, 78, 0.92)',
  },
  recentPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    fontSize: 11,
    marginTop: 5,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  verified: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  ctaWrap: {
    // position: 'absolute',
   paddingHorizontal: 14,
  },
  checkout: {
    paddingVertical: 13,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
