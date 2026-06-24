import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    Image,
    Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import DocumentPicker from 'react-native-document-picker';
import { Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';


const MAX_FILES = 5;

// ---- Types ----
type PrescriptionFile = {
    id: string;
    name: string;
    uri: string;
    sizeMB: string;
    type: string;
    fromRecord?: boolean; // true if picked from previously-uploaded records
};

type MedicalRecord = {
    id: string;
    name: string;
    uri: string;
    sizeMB?: string;
    type?: string;
};

type Props = {
    records: MedicalRecord[]; // previously uploaded records fetched from API
    files: PrescriptionFile[];
    onChangeFiles: (files: PrescriptionFile[]) => void;
};

const formatSize = (bytes?: number) => {
    if (!bytes) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const PrescriptionUpload = ({ records = [], files, onChangeFiles }: Props) => {
    const [sheetVisible, setSheetVisible] = useState(false);
    const [recordsModalVisible, setRecordsModalVisible] = useState(false);

    const remainingSlots = MAX_FILES - files.length;
    const isFull = files.length >= MAX_FILES;

    const addFiles = (newFiles: PrescriptionFile[]) => {
        const space = MAX_FILES - files.length;
        if (space <= 0) return;
        onChangeFiles([...files, ...newFiles.slice(0, space)]);
    };

    const removeFile = (id: string) => {
        onChangeFiles(files.filter(f => f.id !== id));
    };

    // ---- Camera ----
    const handleCamera = async () => {
        setSheetVisible(false);
        const result = await launchCamera({
            mediaType: 'photo',
            quality: 0.8,
        });
        if (result.didCancel || !result.assets?.length) return;

        const asset = result.assets[0];
        addFiles([
            {
                id: `${Date.now()}`,
                name: asset.fileName || `Prescription_${Date.now()}.jpg`,
                uri: asset.uri || '',
                sizeMB: formatSize(asset.fileSize),
                type: asset.type || 'image/jpeg',
            },
        ]);
    };

    // ---- Gallery ----
    const handleGallery = async () => {
        setSheetVisible(false);
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: remainingSlots > 0 ? remainingSlots : 1,
        });
        if (result.didCancel || !result.assets?.length) return;

        const newFiles: PrescriptionFile[] = result.assets.map((asset, idx) => ({
            id: `${Date.now()}_${idx}`,
            name: asset.fileName || `Prescription_${Date.now()}_${idx}.jpg`,
            uri: asset.uri || '',
            sizeMB: formatSize(asset.fileSize),
            type: asset.type || 'image/jpeg',
        }));
        addFiles(newFiles);
    };

    // ---- Document picker (PDF etc.) ----
    // const handleDocument = async () => {
    //     setSheetVisible(false);
    //     try {
    //         const results = await DocumentPicker.pick({
    //             type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
    //             allowMultiSelection: true,
    //         });

    //         const newFiles: PrescriptionFile[] = results.map((res, idx) => ({
    //             id: `${Date.now()}_${idx}`,
    //             name: res.name || `Document_${Date.now()}_${idx}.pdf`,
    //             uri: res.uri,
    //             sizeMB: formatSize(res.size ?? undefined),
    //             type: res.type || 'application/pdf',
    //         }));
    //         addFiles(newFiles);
    //     } catch (err: any) {
    //         if (DocumentPicker.isCancel(err)) return;
    //         console.warn('Document pick error:', err);
    //     }
    // };

    // ---- Select from previously uploaded medical records ----
    const openRecordsPicker = () => {
        setSheetVisible(false);
        setRecordsModalVisible(true);
    };

    const toggleRecordSelect = (record: MedicalRecord) => {
        const already = files.find(f => f.id === record.id);
        if (already) {
            removeFile(record.id);
            return;
        }
        if (isFull) return;
        addFiles([
            {
                id: record.id,
                name: record.name,
                uri: record.uri,
                sizeMB: record.sizeMB || '—',
                type: record.type || 'application/pdf',
                fromRecord: true,
            },
        ]);
    };

    const isPdf = (name: string) => name?.toLowerCase().includes('.pdf');

    return (
        <View style={styles.wrapper}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Upload Prescription</Text>
                <Text style={styles.optional}> (optional)</Text>
            </View>

            <View style={styles.card}>
                {files.length === 0 ? (
                    <>
                        <View style={styles.iconCircle}>
                            <Ionicons
                                name="document-text-outline"
                                size={22}
                                color={Colors.primaryColor}
                            />
                        </View>

                        <Text style={styles.cardTitle}>Upload Prescription</Text>
                        <Text style={styles.cardSubtitle}>
                            Have an existing prescription? upload it to help the
                            doctor understand your condition.
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.uploadBtn}
                            onPress={() => setSheetVisible(true)}
                        >
                            <Ionicons
                                name="arrow-up-outline"
                                size={16}
                                color={Colors.primaryColor}
                            />
                            <Text style={styles.uploadBtnText}>Upload</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.cardTitle}>Upload Prescription</Text>
                        <Text style={styles.cardSubtitle}>
                            Have an existing prescription? upload it to help the
                            doctor understand your condition.
                        </Text>

                        <View style={styles.grid}>
                            {files.map(item => (
                                <View key={item.id} style={styles.thumbWrapper}>
                                    <View style={styles.thumb}>
                                        {isPdf(item.name) ? (
                                            <View style={styles.pdfPreview}>
                                                <Ionicons
                                                    name="document-text"
                                                    size={28}
                                                    color={Colors.primaryColor}
                                                />
                                            </View>
                                        ) : (
                                            <Image
                                                source={{ uri: item.uri }}
                                                style={styles.thumbImage}
                                            />
                                        )}

                                        <TouchableOpacity
                                            style={styles.removeBtn}
                                            onPress={() => removeFile(item.id)}
                                        >
                                            <Ionicons
                                                name="close"
                                                size={14}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <Text
                                        numberOfLines={1}
                                        style={styles.fileName}
                                    >
                                        {item.name}
                                    </Text>
                                    <Text style={styles.fileSize}>
                                        {item.sizeMB}
                                    </Text>
                                </View>
                            ))}

                            {!isFull && (
                                <TouchableOpacity
                                    style={styles.addMoreBox}
                                    activeOpacity={0.8}
                                    onPress={() => setSheetVisible(true)}
                                >
                                    <Ionicons
                                        name="add"
                                        size={26}
                                        color={Colors.primaryColor}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.countRow}>
                            <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color={Colors.primaryColor}
                            />
                            <Text style={styles.countText}>
                                {' '}
                                {files.length} Files Uploaded ( Max {MAX_FILES} files )
                            </Text>
                        </View>
                    </>
                )}
            </View>

            {/* ---- Bottom sheet: Camera / Gallery / Document / Records ---- */}
            <Modal
                visible={sheetVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setSheetVisible(false)}
            >
                <TouchableOpacity
                    style={styles.sheetOverlay}
                    activeOpacity={1}
                    onPress={() => setSheetVisible(false)}
                >
                    <View style={styles.sheetBox}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Add Prescription</Text>

                        <TouchableOpacity
                            style={styles.sheetOption}
                            onPress={handleCamera}
                        >
                            <Ionicons
                                name="camera-outline"
                                size={20}
                                color={Colors.primaryColor}
                            />
                            <Text style={styles.sheetOptionText}>Camera</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sheetOption}
                            onPress={handleGallery}
                        >
                            <Ionicons
                                name="image-outline"
                                size={20}
                                color={Colors.primaryColor}
                            />
                            <Text style={styles.sheetOptionText}>Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sheetOption}
                            // onPress={handleDocument}
                        >
                            <Ionicons
                                name="document-attach-outline"
                                size={20}
                                color={Colors.primaryColor}
                            />
                            <Text style={styles.sheetOptionText}>
                                Upload PDF / Document
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sheetOption}
                            onPress={openRecordsPicker}
                        >
                            <Ionicons
                                name="folder-open-outline"
                                size={20}
                                color={Colors.primaryColor}
                            />
                            <Text style={styles.sheetOptionText}>
                                Choose from Medical Records
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sheetCancel}
                            onPress={() => setSheetVisible(false)}
                        >
                            <Text style={styles.sheetCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ---- Previously uploaded medical records picker ---- */}
            <Modal
                visible={recordsModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setRecordsModalVisible(false)}
            >
                <View style={styles.recordsOverlay}>
                    <View style={styles.recordsBox}>
                        <View style={styles.recordsHeader}>
                            <Text style={styles.recordsTitle}>
                                Medical Records
                            </Text>
                            <TouchableOpacity
                                onPress={() => setRecordsModalVisible(false)}
                            >
                                <Ionicons
                                    name="close"
                                    size={22}
                                    color="#475569"
                                />
                            </TouchableOpacity>
                        </View>

                        {records.length === 0 ? (
                            <View style={styles.emptyRecords}>
                                <Ionicons
                                    name="folder-open-outline"
                                    size={36}
                                    color="#CBD5E1"
                                />
                                <Text style={styles.emptyRecordsText}>
                                    No medical records found
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={records}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => {
                                    const selected = files.some(
                                        f => f.id === item.id,
                                    );
                                    return (
                                        <TouchableOpacity
                                            style={[
                                                styles.recordRow,
                                                selected &&
                                                    styles.recordRowSelected,
                                            ]}
                                            onPress={() =>
                                                toggleRecordSelect(item)
                                            }
                                        >
                                            <Ionicons
                                                name={
                                                    isPdf(item.name)
                                                        ? 'document-text-outline'
                                                        : 'image-outline'
                                                }
                                                size={22}
                                                color={Colors.primaryColor}
                                            />
                                            <Text
                                                numberOfLines={1}
                                                style={styles.recordRowName}
                                            >
                                                {item.name}
                                            </Text>
                                            <Ionicons
                                                name={
                                                    selected
                                                        ? 'checkbox'
                                                        : 'square-outline'
                                                }
                                                size={22}
                                                color={Colors.primaryColor}
                                            />
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}

                        <TouchableOpacity
                            style={styles.recordsDoneBtn}
                            onPress={() => setRecordsModalVisible(false)}
                        >
                            <Text style={styles.recordsDoneText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default PrescriptionUpload;

const styles = StyleSheet.create({
    wrapper: {
        marginTop: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        color: '#1E293B',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    optional: {
        fontSize: 13,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },
    card: {
        backgroundColor: '#F4FAF8',
        borderRadius: 16,
        padding: 16,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2EE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 15,
        color: '#1E293B',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12.5,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
        lineHeight: 18,
        marginBottom: 14,
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: Colors.primaryColor,
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 12,
        gap: 6,
        backgroundColor: '#fff',
    },
    uploadBtnText: {
        fontSize: 14,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 4,
    },
    thumbWrapper: {
        width: 84,
    },
    thumb: {
        width: 84,
        height: 84,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'visible',
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    pdfPreview: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6F4',
    },
    removeBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    fileName: {
        fontSize: 11,
        color: '#334155',
        fontFamily: Fonts.PoppinsMedium,
        marginTop: 6,
    },
    fileSize: {
        fontSize: 10,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },
    addMoreBox: {
        width: 84,
        height: 84,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.primaryColor,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    countRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
    },
    countText: {
        fontSize: 12,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsMedium,
    },

    // Bottom sheet
    sheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },
    sheetBox: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E2E8F0',
        alignSelf: 'center',
        marginBottom: 14,
    },
    sheetTitle: {
        fontSize: 15,
        color: '#1E293B',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 10,
    },
    sheetOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    sheetOptionText: {
        fontSize: 14.5,
        color: '#334155',
        fontFamily: Fonts.PoppinsMedium,
    },
    sheetCancel: {
        marginTop: 14,
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
    },
    sheetCancelText: {
        fontSize: 14,
        color: '#475569',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    // Records modal
    recordsOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    recordsBox: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        maxHeight: '70%',
    },
    recordsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    recordsTitle: {
        fontSize: 15.5,
        color: '#1E293B',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    emptyRecords: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 8,
    },
    emptyRecordsText: {
        fontSize: 13,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },
    recordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    recordRowSelected: {
        backgroundColor: '#0D614E1A',
    },
    recordRowName: {
        flex: 1,
        fontSize: 13.5,
        color: '#1E293B',
        fontFamily: Fonts.PoppinsMedium,
    },
    recordsDoneBtn: {
        marginTop: 10,
        backgroundColor: Colors.primaryColor,
        borderRadius: 12,
        alignItems: 'center',
        paddingVertical: 13,
    },
    recordsDoneText: {
        fontSize: 14,
        color: '#fff',
        fontFamily: Fonts.PoppinsSemiBold,
    },
});
