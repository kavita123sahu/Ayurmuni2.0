import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import TablerIcon from '../../components/TablerIcon';
import { requireAuth } from '../../services/guestAuth';
import SelectedUploadCard from '../../components/SelectedUploadCard';

type PickedFile = {
  uri: string;
  name: string;
  type: string;
};

const Prescription = (props: any) => {
  const insets = useSafeAreaInsets();
  const [selectedFile, setSelectedFile] = useState<PickedFile | null>(null);

  const recentData = useMemo(
    () => [
      { id: '1', image: Images.doc1, date: 'Oct 24, 2023' },
      { id: '2', image: Images.doc1, date: 'Sep 12, 2023' },
      { id: '3', image: Images.doc1, date: 'Aug 05, 2023' },
    ],
    [],
  );

  const handlePickResult = useCallback((asset?: Asset) => {
    if (!asset?.uri) return;
    setSelectedFile({
      uri: asset.uri,
      name: asset.fileName || `prescription_${Date.now()}.jpg`,
      type: asset.type || 'image/jpeg',
    });
  }, []);

  const openCamera = () => {
    launchCamera({ mediaType: 'photo', quality: 0.8 }, res => {
      if (!res.didCancel && res.assets?.[0]) {
        handlePickResult(res.assets[0]);
      }
    });
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, res => {
      if (!res.didCancel && res.assets?.[0]) {
        handlePickResult(res.assets[0]);
      }
    });
  };

  const proceed = async () => {
    if (!(await requireAuth('Please login to upload prescription'))) return;
    props.navigation.navigate('VerifyPresciption', {
      fileUri: selectedFile?.uri,
      fileName: selectedFile?.name,
      fileType: selectedFile?.type,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AppHeader
        title="Upload Prescription"
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
          <Text style={styles.stepText}>Step 1: Documents Upload</Text>
          <Text style={styles.count}>1 / 3</Text>
        </View>

        <View style={styles.progressBg}>
          <View style={styles.progressFill} />
        </View>

        <View style={styles.card}>
          {selectedFile ? (
            <View style={styles.selectedWrap}>
              <Text style={styles.selectedTitle}>Selected prescription</Text>
              <View style={styles.selectedCardRow}>
                <SelectedUploadCard
                  name={selectedFile.name}
                  uri={selectedFile.uri}
                  fileType={selectedFile.type}
                  onRemove={() => setSelectedFile(null)}
                />
              </View>
              <View style={styles.changeRow}>
                <TouchableOpacity style={styles.changeBtn} onPress={openCamera}>
                  <TablerIcon name="camera" size={18} color={Colors.primaryColor} />
                  <Text style={styles.changeBtnText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.changeBtn} onPress={openGallery}>
                  <TablerIcon name="photo" size={18} color={Colors.primaryColor} />
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.iconBox}>
                <TablerIcon name="prescription" size={32} color={Colors.primaryColor} />
              </View>

              <Text style={styles.title}>Upload Prescription</Text>
              <Text style={styles.subtitle}>
                Provide a clear photo of your doctor&apos;s prescription for quick processing.
              </Text>

              <View style={styles.row}>
                <TouchableOpacity style={styles.btn} onPress={openCamera}>
                  <TablerIcon name="camera" size={22} color={Colors.primaryColor} />
                  <Text style={styles.btnText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btn} onPress={openGallery}>
                  <TablerIcon name="photo" size={22} color={Colors.primaryColor} />
                  <Text style={styles.btnText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>HOW TO TAKE A PHOTO</Text>

        {[
          {
            title: 'Bright Lighting',
            desc: 'Ensure the paper is well-lit and avoid harsh shadows.',
          },
          {
            title: 'Perfect Alignment',
            desc: 'Align all four corners within the frame for scanning.',
          },
          {
            title: 'Sharp Text',
            desc: 'Hold the camera steady so that the text is readable.',
          },
        ].map((item, index) => (
          <View key={index} style={styles.tipRow}>
            <View style={styles.tickBox}>
              <TablerIcon name="check" size={16} color={Colors.primaryColor} />
            </View>
            <View style={styles.tipTextWrap}>
              <Text style={styles.tipTitle}>{item.title}</Text>
              <Text style={styles.tipDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>RECENT UPLOADS</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>

        <FlatList
          data={recentData}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }) => (
            <View style={styles.recentCard}>
              <Image source={item.image} style={styles.recentImg} />
              <Text style={styles.date}>{item.date}</Text>
              <View style={styles.verifiedRow}>
                <TablerIcon name="circle-check" size={12} color={Colors.primaryColor} />
                <Text style={styles.verified}>Verified</Text>
              </View>
            </View>
          )}
        />
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.checkout,
          { bottom: insets.bottom + 16 },
          !selectedFile && styles.checkoutDisabled,
        ]}
        disabled={!selectedFile}
        onPress={proceed}
        activeOpacity={0.9}
      >
        <Text style={styles.checkoutText}>Proceed to Details</Text>
        <TablerIcon name="arrow-right" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Prescription;

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
    width: '33%',
    height: 8,
    backgroundColor: '#0D614E',
    borderRadius: 10,
  },
  card: {
    backgroundColor: '#0D614E0D',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#0D614E33',
    marginBottom: 24,
  },
  iconBox: {
    height: 72,
    width: 72,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#475569',
    marginVertical: 10,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsRegular,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  btnText: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  selectedWrap: {
    width: '100%',
    alignItems: 'flex-start',
  },
  selectedTitle: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: 12,
  },
  selectedCardRow: {
    alignSelf: 'flex-start',
  },
  changeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  changeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1E7DF',
  },
  changeBtnText: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  tickBox: {
    height: 24,
    width: 24,
    borderRadius: 8,
    backgroundColor: '#0F766E1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tipTextWrap: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  tipDesc: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 2,
    lineHeight: 18,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  seeAll: {
    fontSize: 12,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsMedium,
  },
  recentCard: {
    width: 120,
  },
  recentImg: {
    width: 120,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  date: {
    fontSize: 12,
    marginTop: 6,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verified: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
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
  checkoutDisabled: {
    backgroundColor: '#94A3B8',
    elevation: 0,
    shadowOpacity: 0,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
