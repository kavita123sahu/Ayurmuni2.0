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
} from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon from '../../components/TablerIcon';
import SelectedUploadCard from '../../components/SelectedUploadCard';

const VerifyPresciption = (props: any) => {
  const insets = useSafeAreaInsets();
  const { fileUri, fileName, fileType } = props.route?.params || {};

  const [patientName, setPatientName] = useState('Jonathan Doe');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Williams');

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const previewUri = fileUri as string | undefined;
  const previewName = (fileName as string) || 'prescription.jpg';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AppHeader
        title="Verify Prescription"
        onLeftPress={() => props.navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.stepText}>Step 2: Verify Prescription</Text>
          <Text style={styles.count}>2 / 3</Text>
        </View>

        <View style={styles.progressBg}>
          <View style={styles.progressFill} />
        </View>

        <View style={styles.loaderBox}>
          <Animated.View style={[styles.loaderCircle, { transform: [{ rotate }] }]} />
          <Text style={styles.loaderText}>
            Extracting information from your prescription...
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Uploaded Prescription</Text>

        {previewUri ? (
          <View style={styles.previewSection}>
            <Image source={{ uri: previewUri }} style={styles.prescriptionImg} />
            <View style={styles.fileMetaRow}>
              <TablerIcon name="file-medical" size={18} color={Colors.primaryColor} />
              <Text style={styles.fileMetaName} numberOfLines={1}>
                {previewName}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.previewFallback}>
            <SelectedUploadCard
              name="Sample prescription"
              uri={undefined}
              fileType="image"
              onRemove={() => {}}
              compact
            />
          </View>
        )}

        <View style={styles.verificationBox}>
          <Animated.View style={[styles.smallLoader, { transform: [{ rotate }] }]} />
          <View style={styles.verificationText}>
            <Text style={styles.verificationTitle}>Verification Pending</Text>
            <Text style={styles.verificationDesc}>
              Our specialist is processing the text. This takes 12 to 24 hours.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Confirm Extracted Details</Text>

        <View style={styles.inputBox}>
          <Text style={styles.label}>PATIENT NAME</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={patientName}
              placeholderTextColor="#9CA3AF"
              onChangeText={setPatientName}
              style={styles.input}
            />
            <TablerIcon name="edit" size={20} color="#94A3B8" />
          </View>
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>DOCTOR NAME</Text>
          <View style={styles.inputRow}>
            <TextInput
              placeholderTextColor="#9CA3AF"
              value={doctorName}
              onChangeText={setDoctorName}
              style={styles.input}
            />
            <TablerIcon name="edit" size={20} color="#94A3B8" />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.checkout, { bottom: insets.bottom + 16 }]}
        onPress={() => props.navigation.navigate('MedicineCheckOut')}
        activeOpacity={0.9}
      >
        <Text style={styles.checkoutText}>Confirm & Continue</Text>
        <TablerIcon name="arrow-right" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VerifyPresciption;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFB',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stepText: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  count: {
    fontSize: 14,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  progressBg: {
    height: 8,
    backgroundColor: '#0D614E33',
    borderRadius: 10,
    marginVertical: 10,
  },
  progressFill: {
    width: '66%',
    height: 8,
    backgroundColor: '#0D614E',
    borderRadius: 10,
  },
  loaderBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#0D614E66',
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
  },
  loaderCircle: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0D614E',
    borderTopColor: 'transparent',
    marginRight: 10,
  },
  loaderText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  sectionTitle: {
    fontSize: 17,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: 16,
    marginBottom: 10,
  },
  previewSection: {
    marginBottom: 16,
  },
  prescriptionImg: {
    width: '100%',
    height: 240,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  fileMetaName: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  previewFallback: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  verificationBox: {
    backgroundColor: '#0D614E0D',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0D614E1A',
  },
  smallLoader: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0D614E',
    borderTopColor: 'transparent',
    marginRight: 12,
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  verificationDesc: {
    fontSize: 13,
    color: '#475569',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 4,
    lineHeight: 18,
  },
  inputBox: {
    backgroundColor: '#FAFAFB',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsBold,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  checkout: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#0D614E',
    paddingVertical: 16,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 4,
    shadowColor: '#0D614E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
