import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import TablerIcon from '../../components/TablerIcon';
import SearchBar from '../../components/SearchBar';
import Header from '../../components/Header';
import UploadRecordModal from '../../components/UploadRecordModal';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import MedicalRecordCard from '../consult/MedicalRecordCard';
import PreviewModal from '../consult/PreviewModal';
import { useMedicalRecord, useMedicalUpload } from '../../hooks/usePatientData';
import { deleteMedicalRecord } from '../../services/PatientServices';
import { useDebounce } from '../../hooks/useDebaunce';
import { matchesSearch } from '../../utils/searchUtils';

const TABS = [
  { key: 'All Records', type: null as string | null },
  { key: 'Prescriptions', type: 'prescription' },
  { key: 'Lab Reports', type: 'lab_report' },
] as const;

const isImageRecord = (item: any) => {
  const type = String(item?.file_type || '').toLowerCase();
  const url = String(item?.file_url || '');
  if (type.includes('pdf')) return false;
  if (type.includes('image') || type === 'jpg' || type === 'jpeg' || type === 'png') {
    return true;
  }
  return /\.(jpe?g|png|gif|webp|heic)(\?|$)/i.test(url);
};

const MedicalRecords = (props: any) => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['key']>(
    'All Records',
  );
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);

  const {
    patientsRecord,
    fetchPatientsRecord,
    onRefresh,
    refreshing,
  } = useMedicalRecord();

  const {
    selectFile,
    uploading,
    modalVisible,
    pickedFile,
    submitRecord,
    closeUploadModal,
  } = useMedicalUpload(fetchPatientsRecord);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewRecord, setPreviewRecord] = useState<any>(null);

  const counts = useMemo(() => {
    const list = patientsRecord || [];
    return {
      all: list.length,
      prescription: list.filter(
        (i: any) => i?.medical_record_type === 'prescription',
      ).length,
      lab_report: list.filter(
        (i: any) => i?.medical_record_type === 'lab_report',
      ).length,
    };
  }, [patientsRecord]);

  const filteredRecords = useMemo(() => {
    const tab = TABS.find(t => t.key === activeTab);
    let list = patientsRecord || [];

    if (tab?.type) {
      list = list.filter(
        (item: any) => item?.medical_record_type === tab.type,
      );
    }

    const q = debouncedSearch.trim();
    if (!q) return list;

    return list.filter((item: any) =>
      matchesSearch(
        q,
        item?.title,
        item?.description,
        item?.medical_record_type,
        item?.file_name,
      ),
    );
  }, [patientsRecord, activeTab, debouncedSearch]);

  const deleteRecord = async (id: string) => {
    try {
      await deleteMedicalRecord(id);
      await fetchPatientsRecord();
    } catch (error) {
      console.log('DELETE ERROR =>', error);
    }
  };

  const openPreview = (item: any) => {
    const url = item?.file_url;
    if (!url) return;

    if (isImageRecord(item)) {
      setPreviewRecord(item);
      setPreviewUrl(url);
      setPreviewVisible(true);
      return;
    }

    Linking.openURL(url);
  };

  const renderItem = ({ item }: any) => (
    <MedicalRecordCard
      item={item}
      onPreview={() => openPreview(item)}
      onDelete={() => deleteRecord(item?.id)}
    />
  );

  const ListHeader = (
    <View>
      <TouchableOpacity
        style={styles.uploadRow}
        onPress={selectFile}
        activeOpacity={0.88}
        disabled={uploading}
      >
        <View style={styles.uploadIcon}>
          {uploading ? (
            <ActivityIndicator size="small" color={Colors.primaryColor} />
          ) : (
            <TablerIcon name="upload" size={18} color={Colors.primaryColor} />
          )}
        </View>
        <View style={styles.uploadCopy}>
          <Text style={styles.uploadTitle}>
            {uploading ? 'Uploading…' : 'Upload medical record'}
          </Text>
          <Text style={styles.uploadSub} numberOfLines={1}>
            Prescription, lab report · PDF or image
          </Text>
        </View>
        <View style={styles.uploadPlus}>
          <TablerIcon name="plus" size={16} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Your documents</Text>
        <Text style={styles.sectionCount}>
          {filteredRecords.length}{' '}
          {filteredRecords.length === 1 ? 'file' : 'files'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Medical Records"
        subtitle="Your health documents in one place"
        onBack={() => props.navigation.goBack()}
        onRefreshPress={onRefresh}
      />

      <View style={styles.pad}>
        <SearchBar
          placeholder="Search by title or type…"
          value={searchText}
          onChangeText={setSearchText}
          compact
          containerStyle={styles.search}
        />

        <View style={styles.tabs}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            const count =
              tab.type == null
                ? counts.all
                : counts[tab.type as 'prescription' | 'lab_report'];
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabBtn, active && styles.activeTab]}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.tabText, active && styles.activeTabText]}
                  numberOfLines={1}
                >
                  {tab.key === 'All Records' ? 'All' : tab.key}
                </Text>
                <View
                  style={[styles.tabCount, active && styles.tabCountActive]}
                >
                  <Text
                    style={[
                      styles.tabCountText,
                      active && styles.tabCountTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filteredRecords}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(item?.id ?? index)}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primaryColor]}
            tintColor={Colors.primaryColor}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <TablerIcon name="file" size={22} color={Colors.primaryColor} />
            </View>
            <Text style={styles.emptyTitle}>No records yet</Text>
            <Text style={styles.emptyText}>
              Upload a prescription or lab report to keep it handy.
            </Text>
          </View>
        }
      />

      {previewVisible ? (
        <PreviewModal
          visible={previewVisible}
          imageUrl={previewUrl}
          record={previewRecord}
          onClose={() => {
            setPreviewVisible(false);
            setPreviewUrl('');
            setPreviewRecord(null);
          }}
        />
      ) : null}

      <UploadRecordModal
        visible={modalVisible}
        file={pickedFile}
        uploading={uploading}
        onClose={closeUploadModal}
        onSubmit={submitRecord}
      />
    </SafeAreaView>
  );
};

export default MedicalRecords;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pad: {
    paddingHorizontal: 12,
  },
  search: {
    marginBottom: 8,
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6EFEA',
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
  },
  tabText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
  },
  tabCountActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  tabCountText: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  tabCountTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 28,
    flexGrow: 1,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CDEADF',
    borderStyle: 'dashed',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
    gap: 10,
  },
  uploadIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCopy: {
    flex: 1,
    minWidth: 0,
  },
  uploadTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
    color: Colors.primaryColor,
  },
  uploadSub: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  uploadPlus: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  sectionCount: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  emptyText: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: Fonts.PoppinsRegular,
    lineHeight: 18,
  },
});
