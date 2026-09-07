import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../../components/TablerIcon';
import SelectedUploadCard from '../../components/SelectedUploadCard';
import PrimaryButton from '../../components/PrimaryButton';

type MedicalRecord = {
  id: string;
  description: string;
  file_url: string;
  file_type: 'pdf' | 'image' | string;
};

type Props = {
  records?: MedicalRecord[];
  selectedRecords?: string[];
  uploading?: boolean;
  onSelectRecord: React.Dispatch<React.SetStateAction<string[]>>;
  CameraUpload: () => void;
  onUpload: () => void;
};

const PrescriptionUpload: React.FC<Props> = ({
  records = [],
  selectedRecords = [],
  uploading = false,
  onSelectRecord,
  onUpload,
  CameraUpload,
}) => {
  const insets = useSafeAreaInsets();
  const footerBottomPad = Math.max(insets.bottom, 12);

  const selectedRecordData = records?.filter(item =>
    selectedRecords?.includes(item.id),
  );

  const toggleRecord = (id: string) => {
    onSelectRecord(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const removeRecord = (id: string) => {
    onSelectRecord(prev => prev.filter(x => x !== id));
  };

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Attach Medical Documents
        <Text style={styles.optional}> (optional)</Text>
      </Text>

      <View style={styles.uploadBox}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <TablerIcon name="prescription" size={24} color={Colors.primaryColor} />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.uploadTitle}>Upload Documents</Text>
            <Text style={styles.uploadSubTitle}>
              Photo or PDF — helps your doctor prepare
            </Text>
          </View>
        </View>

        {uploading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.primaryColor} />
            <Text style={styles.loadingText}>Uploading file...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => setShowUploadOptions(true)}
            activeOpacity={0.85}
          >
            <TablerIcon name="upload" size={18} color={Colors.primaryColor} />
            <Text style={styles.uploadBtnText}>
              {selectedRecordData?.length > 0 ? 'Add another file' : 'Upload Documents'}
            </Text>
          </TouchableOpacity>
        )}

        {selectedRecordData?.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.selectedLabel}>
              Selected ({selectedRecordData?.length})
            </Text>
            <FlatList
              data={selectedRecordData}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.filesRow}
              renderItem={({ item }) => (
                <SelectedUploadCard
                  name={item.description || 'Prescription'}
                  uri={item.file_url}
                  fileType={item.file_type}
                  onRemove={() => removeRecord(item.id)}
                />
              )}
            />
          </View>
        )}
      </View>

      <Modal visible={showRecordModal} animationType="slide">
        <SafeAreaView style={styles.recordModalContainer} edges={['top', 'left', 'right']}>
          <View style={styles.recordModalHeader}>
            <Text style={styles.recordTitle}>Existing records</Text>
            <TouchableOpacity onPress={() => setShowRecordModal(false)}>
              <TablerIcon name="x" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <FlatList
            style={styles.recordList}
            data={records}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.recordListContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = selectedRecords?.includes(item.id);
              return (
                <TouchableOpacity
                  onPress={() => toggleRecord(item.id)}
                  style={[
                    styles.recordCard,
                    selected && styles.selectedRecordCard,
                  ]}
                  activeOpacity={0.85}
                >
                  <View style={styles.recordIcon}>
                    <TablerIcon
                      name={item.file_type === 'pdf' ? 'file' : 'photo'}
                      size={20}
                      color={Colors.primaryColor}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recordName} numberOfLines={1}>
                      {item.description}
                    </Text>
                    <Text style={styles.recordType}>
                      {item.file_type?.toUpperCase()}
                    </Text>
                  </View>
                  <TablerIcon
                    name={selected ? 'check' : 'clipboard-list'}
                    size={22}
                    color={selected ? Colors.primaryColor : '#CBD5E1'}
                  />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyRecords}>No saved records yet</Text>
            }
          />

          <View style={[styles.recordModalFooter, { paddingBottom: footerBottomPad }]}>
            <PrimaryButton
              TextFont={Fonts.PoppinsSemiBold}
              onPress={() => setShowRecordModal(false)}
              title="Done"
            />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={showUploadOptions} transparent animationType="fade">
        <Pressable
          style={styles.modalContainer}
          onPress={() => setShowUploadOptions(false)}
        >
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Upload prescription</Text>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowUploadOptions(false);
                // Wait for options modal to fully dismiss before opening camera
                setTimeout(() => CameraUpload?.(), 450);
              }}
            >
              <View style={styles.optionIcon}>
                <TablerIcon name="camera" size={20} color={Colors.primaryColor} />
              </View>
              <View>
                <Text style={styles.optionText}>Take photo</Text>
                <Text style={styles.optionSub}>Use camera</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowUploadOptions(false);
                onUpload();
              }}
            >
              <View style={styles.optionIcon}>
                <TablerIcon name="photo" size={20} color={Colors.primaryColor} />
              </View>
              <View>
                <Text style={styles.optionText}>Choose file</Text>
                <Text style={styles.optionSub}>Gallery or PDF</Text>
              </View>
            </TouchableOpacity>

            {records.length > 0 && (
              <TouchableOpacity
                style={[styles.optionItem, styles.optionItemLast]}
                onPress={() => {
                  setShowUploadOptions(false);
                  setShowRecordModal(true);
                }}
              >
                <View style={styles.optionIcon}>
                  <TablerIcon name="file-medical" size={20} color={Colors.primaryColor} />
                </View>
                <View>
                  <Text style={styles.optionText}>From my records</Text>
                  <Text style={styles.optionSub}>Previously uploaded</Text>
                </View>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default PrescriptionUpload;

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: 12,
  },
  optional: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: Fonts.PoppinsRegular,
  },
  uploadBox: {
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: '#DDE8E2',
    borderRadius: 18,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#111827',
  },
  uploadSubTitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 2,
  },
  uploadButton: {
    marginTop: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primaryColor,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  uploadBtnText: {
    color: Colors.primaryColor,
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  loadingRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  selectedSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  selectedLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  filesRow: {
    paddingRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionText: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  optionSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 2,
  },
  recordModalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  recordModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  recordList: {
    flex: 1,
  },
  recordListContent: {
    paddingTop: 4,
    paddingBottom: 12,
    flexGrow: 1,
  },
  recordModalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  recordTitle: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#111827',
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedRecordCard: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F0FDF4',
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordName: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#111827',
  },
  recordType: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 2,
  },
  emptyRecords: {
    textAlign: 'center',
    marginTop: 40,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
});
