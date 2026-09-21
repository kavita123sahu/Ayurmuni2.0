import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Animated,
  Easing,
  StatusBar,
  ActivityIndicator,
  Switch,
  BackHandler,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../../components/AppHeader';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon from '../../components/TablerIcon';
import { UploadProfilePhoto } from '../../services/ProfileServices';
import { extractUploadUrl } from '../../utils/reviewUtils';
import {
  createPrescriptionRequest,
  extractPrescriptionRequest,
  getPrescribedItems,
  getPrescriptionFiles,
  getPrescriptionRequests,
  isPrescriptionApproved,
  isPrescriptionPending,
  isPrescriptionRejected,
  mapPrescribedItem,
} from '../../services/PrescriptionRequestService';
import { showSuccessToast } from '../../config/Key';
import { RupeeAmount } from '../../utils/currencyUtils';
import { PrescriptionFilePreview } from '../../components/PrescriptionFilePreview';
import { resetRootToHomeStack } from '../../navigation/navigationUtils';

const VerifyPresciption = (props: any) => {
  const insets = useSafeAreaInsets();
  const {
    files: routeFiles,
    fileUri,
    fileName,
    fileType,
    variantIds: routeVariantIds,
    requestId: routeRequestId,
    existingRequest,
    previewItems: routePreviewItems,
  } = props.route?.params || {};

  const [notes, setNotes] = useState(
    String(existingRequest?.notes || '').trim(),
  );
  const [saveToRecords, setSaveToRecords] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<any>(existingRequest || null);
  const [requestId, setRequestId] = useState<string | null>(
    routeRequestId ? String(routeRequestId) : existingRequest?.id || null,
  );

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const variantIds = useMemo(() => {
    const fromRoute = Array.isArray(routeVariantIds) ? routeVariantIds : [];
    const fromRequest = Array.isArray(request?.variant_ids)
      ? request.variant_ids
      : [];
    return [...new Set([...fromRoute, ...fromRequest].map(String).filter(Boolean))];
  }, [routeVariantIds, request]);

  const localFiles = useMemo(() => {
    const fromRoute = Array.isArray(routeFiles) ? routeFiles : [];
    if (fromRoute.length) {
      return fromRoute
        .map((file: any) => ({
          uri: String(file?.uri || '').trim(),
          name: String(file?.name || 'prescription.jpg'),
          type: String(file?.type || 'image/jpeg'),
        }))
        .filter((file: { uri: string }) => file.uri)
        .slice(0, 4);
    }
    return fileUri
      ? [{
        uri: String(fileUri),
        name: String(fileName || 'prescription.jpg'),
        type: String(fileType || 'image/jpeg'),
      }]
      : [];
  }, [routeFiles, fileUri, fileName, fileType]);
  const previewFiles = useMemo(() => {
    const saved = getPrescriptionFiles(request);
    if (saved.length) return saved;
    return localFiles.map(file => ({ uri: file.uri, fileType: file.type }));
  }, [request, localFiles]);
  const approved = isPrescriptionApproved(request);
  const pending = request ? isPrescriptionPending(request) : false;
  const rejected = isPrescriptionRejected(request);
  const prescribedItems = useMemo(() => {
    const fromRequest = getPrescribedItems(request).map(mapPrescribedItem);
    const fromRoute = (Array.isArray(routePreviewItems) ? routePreviewItems : []).map(
      mapPrescribedItem,
    );
    if (fromRequest.length >= fromRoute.length && fromRequest.length) {
      return fromRequest;
    }
    return fromRoute.length ? fromRoute : fromRequest;
  }, [request, routePreviewItems]);

  const goHome = useCallback(() => {
    resetRootToHomeStack(props.navigation, 'TabStack', { screen: 'Home' });
  }, [props.navigation]);

  const handleBack = useCallback(() => {
    if (pending) {
      goHome();
      return;
    }
    props.navigation.goBack();
  }, [pending, goHome, props.navigation]);

  useEffect(() => {
    if (!pending) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goHome();
      return true;
    });
    return () => sub.remove();
  }, [pending, goHome]);

  useEffect(() => {
    if (!pending) return;
    const unsub = props.navigation?.addListener?.('beforeRemove', (e: any) => {
      // Intercept stack back / gesture while pending → home
      if (e?.data?.action?.type === 'GO_BACK' || e?.data?.action?.type === 'POP') {
        e.preventDefault();
        goHome();
      }
    });
    return unsub;
  }, [pending, goHome, props.navigation]);

  useEffect(() => {
    if (!(pending || submitting)) {
      rotateAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pending, submitting, rotateAnim]);

  const refreshRequest = useCallback(async (id: string) => {
    try {
      const res = await getPrescriptionRequests({ id });
      const next = extractPrescriptionRequest(res);
      if (next) setRequest(next);
      return next;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!requestId) return;
    refreshRequest(requestId);
    const timer = setInterval(() => {
      refreshRequest(requestId);
    }, 12000);
    return () => clearInterval(timer);
  }, [requestId, refreshRequest]);

  const submitRequest = async () => {
    if (requestId && request) {
      showSuccessToast('Request already submitted', 'success');
      return;
    }
    if (!localFiles.length) {
      showSuccessToast('Missing prescription file', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const fileUrls: string[] = [];
      for (const file of localFiles) {
        const formData = new FormData();
        formData.append('image', {
          uri: file.uri,
          name: file.name,
          type: file.type || 'image/jpeg',
        } as any);
        formData.append('dir', 'prescription_requests');
        const uploadResponse = await UploadProfilePhoto(formData);
        const fileUrl = extractUploadUrl(uploadResponse);
        if (!fileUrl) {
          throw new Error('Upload failed');
        }
        fileUrls.push(fileUrl);
      }

      const payload = {
        file_url: fileUrls[0],
        file_urls: fileUrls,
        file_type: localFiles.some(file => String(file.type).includes('pdf'))
          ? 'pdf'
          : 'image',
        notes: notes.trim() || undefined,
        variant_ids: variantIds,
        save_to_medical_records: saveToRecords,
      };

      const res = await createPrescriptionRequest(payload);
      if (res?.success === false) {
        throw new Error(res?.message || 'Could not submit request');
      }
      console.log('PRESCRIPTION_REQUEST_RESPONSE =>', res);

      const created = extractPrescriptionRequest(res) || {
        ...payload,
        id: res?.data?.id,
        status: 'pending_review',
      };
      if (!created.status) created.status = 'pending_review';
      const id = String(created?.id || res?.data?.id || '');
      setRequest(created);
      if (id) setRequestId(id);
      showSuccessToast(
        'Submitted — pending pharmacist review (usually 12–24 hours)',
        'success',
      );
    } catch (error: any) {
      console.log('PRESCRIPTION_REQUEST_ERROR =>', error);
      showSuccessToast(
        error?.message || 'Failed to submit prescription',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const continueNext = () => {
    if (!request && !requestId) {
      submitRequest();
      return;
    }
    if (pending) {
      showSuccessToast(
        'Your prescription is pending review. Checkout unlocks after approval.',
        'success',
      );
      return;
    }
    if (rejected) {
      showSuccessToast(
        'This request was rejected. Please upload a clearer prescription.',
        'error',
      );
      props.navigation.navigate('Prescription', {
        variantIds,
        fromPrescriptionGate: true,
      });
      return;
    }
    if (!approved) {
      showSuccessToast('Waiting for prescription approval', 'error');
      return;
    }
    props.navigation.navigate('MedicineCheckOut', {
      requestId,
      request,
      prescribedItems,
      notes: notes.trim() || request?.notes || '',
      approved: true,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader
        title="Verify Prescription"
        onLeftPress={handleBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 88 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.stepText}>Verified details</Text>
          <Text style={styles.count}>2 / 2</Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={['#0D614E', '#14937A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: '100%' }]}
          />
        </View>

        <View style={styles.trustRow}>
          <View style={styles.trustChip}>
            <TablerIcon name="shield" size={13} color={Colors.primaryColor} />
            <Text style={styles.trustText}>Encrypted & private</Text>
          </View>
          <View style={styles.trustChip}>
            <TablerIcon name="approved" size={13} color={Colors.primaryColor} />
            <Text style={styles.trustText}>Expert review</Text>
          </View>
        </View>

        {!request ? (
          <View style={styles.loaderBox}>
            <TablerIcon name="file-medical" size={16} color={Colors.primaryColor} />
            <Text style={styles.loaderText}>
              Add notes and submit for pharmacist verification.
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>
          Uploaded prescription{previewFiles.length > 1 ? `s (${previewFiles.length})` : ''}
        </Text>
        {previewFiles.map(file => (
          <View key={file.uri} style={styles.prescriptionPreview}>
            <PrescriptionFilePreview
              uri={file.uri}
              fileType={file.fileType}
              height={220}
            />
          </View>
        ))}

        {submitting ? (
          <View style={styles.statusBox}>
            <Animated.View
              style={[styles.smallLoader, { transform: [{ rotate }] }]}
            />
            <View style={styles.verificationText}>
              <Text style={styles.verificationTitle}>Submitting request…</Text>
              <Text style={styles.verificationDesc}>
                Uploading your prescription securely. Please wait.
              </Text>
            </View>
          </View>
        ) : approved ? (
          <LinearGradient
            colors={['#ECFDF5', '#F0FDFA']}
            style={styles.statusBox}
          >
            <View style={styles.statusIcon}>
              <TablerIcon name="approved" size={18} color={Colors.primaryColor} />
            </View>
            <View style={styles.verificationText}>
              <Text style={styles.verificationTitle}>Status: Approved</Text>
              <Text style={styles.verificationDesc}>
                Your prescription is approved. Continue to finalize your order.
              </Text>
            </View>
          </LinearGradient>
        ) : rejected ? (
          <View style={[styles.statusBox, styles.rejectBox]}>
            <View style={[styles.statusIcon, { backgroundColor: '#FEE2E2' }]}>
              <TablerIcon name="x" size={16} color="#DC2626" />
            </View>
            <View style={styles.verificationText}>
              <Text style={styles.verificationTitle}>Status: Rejected</Text>
              <Text style={styles.verificationDesc}>
                {request?.rejection_reason ||
                  'Please upload a clearer prescription and try again.'}
              </Text>
            </View>
          </View>
        ) : pending ? (
          <>
            <View style={styles.statusBox}>
              <Animated.View
                style={[styles.smallLoader, { transform: [{ rotate }] }]}
              />
              <View style={styles.verificationText}>
                <Text style={styles.verificationTitle}>Status: Pending review</Text>
                <Text style={styles.verificationDesc}>
                  A pharmacist is reviewing your prescription. This usually takes
                  12–24 hours. We&apos;ll notify you when it&apos;s approved.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.homeBtn}
              onPress={goHome}
              activeOpacity={0.88}
            >
              <TablerIcon name="home" size={16} color={Colors.primaryColor} />
              <Text style={styles.homeBtnText}>Go to home screen</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.statusBox}>
            <View style={styles.statusIcon}>
              <TablerIcon name="clock" size={16} color={Colors.primaryColor} />
            </View>
            <View style={styles.verificationText}>
              <Text style={styles.verificationTitle}>Ready to submit</Text>
              <Text style={styles.verificationDesc}>
                Submit your prescription for pharmacist approval before checkout.
              </Text>
            </View>
          </View>
        )}

        {!requestId ? (
          <>
            <Text style={styles.sectionTitle}>Notes for pharmacist</Text>
            <View style={styles.inputBox}>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Need medicines A, B, D"
                placeholderTextColor="#94A3B8"
                style={styles.notesInput}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Save to medical records</Text>
                <Text style={styles.toggleSub}>Keep a copy in your health docs</Text>
              </View>
              <Switch
                value={saveToRecords}
                onValueChange={setSaveToRecords}
                trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                thumbColor={saveToRecords ? Colors.primaryColor : '#F8FAFC'}
              />
            </View>

            {variantIds.length > 0 ? (
              <Text style={styles.variantHint}>
                Linking {variantIds.length} cart item
                {variantIds.length === 1 ? '' : 's'} with this request.
              </Text>
            ) : null}
          </>
        ) : notes || request?.notes ? (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>Your notes</Text>
            <Text style={styles.notesBody}>
              {notes || request?.notes}
            </Text>
          </View>
        ) : null}

        {prescribedItems.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>
              {approved ? 'Prescribed items' : 'Requested items'} ({prescribedItems.length})
            </Text>
            {prescribedItems.map((item, index) => {
              const qty = Math.max(1, Number(item.raw?.quantity) || 1);
              return (
                <View key={`${item.id}-${index}`} style={styles.itemCard}>
                  <View style={styles.itemThumb}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.itemImg} />
                    ) : (
                      <TablerIcon name="package" size={18} color={Colors.primaryColor} />
                    )}
                  </View>
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemDesc} numberOfLines={1}>
                      {item.desc}
                    </Text>
                    {!!item.notes && (
                      <Text style={styles.itemNotes} numberOfLines={2}>
                        {item.notes}
                      </Text>
                    )}
                  </View>
                  <View style={styles.itemSide}>
                    <Text style={styles.itemQty}>×{qty}</Text>
                    {item.price != null ? (
                      <RupeeAmount value={item.price} style={styles.itemPrice} />
                    ) : null}
                  </View>
                </View>
              );
            })}
          </>
        ) : null}
      </ScrollView>

      <TouchableOpacity
        style={[styles.ctaWrap, { bottom: insets.bottom + 12 }]}
        onPress={
          !requestId
            ? submitRequest
            : approved
              ? continueNext
              : rejected
                ? () =>
                  props.navigation.navigate('Prescription', {
                    variantIds,
                    fromPrescriptionGate: true,
                  })
                : () =>
                  props.navigation.navigate('OrderHistory', {
                    tab: 'requested',
                    requestId,
                  })
        }
        disabled={submitting}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={submitting ? ['#94A3B8', '#94A3B8'] : ['#0D614E', '#14937A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.checkout}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.checkoutText}>
                {!requestId
                  ? 'Submit for review'
                  : approved
                    ? 'Finalize order'
                    : rejected
                      ? 'Upload again'
                      : 'View request'}
              </Text>
              {pending ? (
                <TablerIcon name="receipt" size={16} color="#FFFFFF" />
              ) : (
                <TablerIcon name="arrow-right" size={18} color="#FFFFFF" />
              )}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VerifyPresciption;

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
  trustRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
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
  loaderBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#0D614E55',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    gap: 8,
  },
  loaderCircle: {
    height: 14,
    width: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.primaryColor,
    borderTopColor: 'transparent',
  },
  loaderText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  prescriptionPreview: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 6,
    marginTop: 4,
  },
  prescriptionImg: {
    width: '100%',
    height: 168,
    borderRadius: 12,
    backgroundColor: '#E8F3F1',
    marginBottom: 10,
  },
  previewFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CDEADF',
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CDEADF',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  homeBtnText: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
  rejectBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  smallLoader: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.primaryColor,
    borderTopColor: 'transparent',
    marginRight: 10,
  },
  verificationText: { flex: 1 },
  verificationTitle: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  verificationDesc: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 2,
    lineHeight: 15,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6EFEA',
    minHeight: 72,
  },
  notesInput: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#0F172A',
    minHeight: 56,
    padding: 0,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EFEA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  toggleTitle: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  toggleSub: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 1,
  },
  variantHint: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 8,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EFEA',
    padding: 12,
    marginBottom: 10,
  },
  notesLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  notesBody: {
    marginTop: 4,
    fontSize: 13,
    color: '#334155',
    fontFamily: Fonts.PoppinsRegular,
    lineHeight: 18,
  },
  outsourceHint: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    marginBottom: 8,
    marginTop: -2,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EFEA',
    padding: 8,
    marginBottom: 8,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImg: { width: '100%', height: '100%' },
  itemCopy: { flex: 1, marginHorizontal: 8, minWidth: 0 },
  itemName: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  itemDesc: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 1,
  },
  itemNotes: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 2,
  },
  itemSide: {
    alignItems: 'flex-end',
    gap: 2,
  },
  itemQty: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  itemPrice: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  ctaWrap: { position: 'absolute', left: 14, right: 14 },
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
