import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
} from 'react-native';
// import DocumentPicker from 'react-native-document-picker';
import { Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import PrimaryButton from '../../components/PrimaryButton';



type MedicalRecord = {
    id: string;
    description: string;
    file_url: string;
    file_type: 'pdf' | 'image';
};

type Props = {
    records?: MedicalRecord[];
    selectedRecords?: string[];
    onSelectRecord: React.Dispatch<
        React.SetStateAction<string[]>
    >;
    CameraUpload: () => void; // only camera
    onUpload: () => void; // existing selectFile()
};


const PrescriptionUpload: React.FC<Props> = ({
    records = [],
    selectedRecords = [],
    onSelectRecord,
    onUpload,
    CameraUpload,
}) => {

    console.log("onCameraprop =>", typeof CameraUpload);

    const selectedRecordData = records.filter(item =>
        selectedRecords.includes(item.id),
    );
    const toggleRecord = (id: string) => {
        onSelectRecord(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id],
        );
    };
    const [showRecordModal, setShowRecordModal] =
        useState(false);

    const [showUploadOptions, setShowUploadOptions] =
        useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Upload Prescription
                <Text style={styles.optional}>
                    {' '} (optional)
                </Text>
            </Text>

            {/* Upload Box Hamesha Dikhega */}
            <View style={styles.uploadBox}>
                <View style={styles.headerRow}>
                    <Ionicons
                        name="document-text-outline"
                        size={30}
                        color={Colors.primaryColor}
                    />

                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.uploadTitle}>
                            Upload Prescription
                        </Text>

                        <Text style={styles.uploadSubTitle}>
                            Upload images or PDF files
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => setShowUploadOptions(true)}
                >
                    <Ionicons
                        name="cloud-upload-outline"
                        size={18}
                        color={Colors.primaryColor}
                    />
                    <Text style={styles.uploadBtnText}>
                        Upload Prescription
                    </Text>
                </TouchableOpacity>

                {/* Uploaded Records */}
                {selectedRecordData.length > 0 && (
                    <View style={styles.filesRow}>
                        {selectedRecordData.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.fileCard}
                                onPress={() => toggleRecord(item.id)}
                            >
                                <Ionicons
                                    name={
                                        item.file_type === 'pdf'
                                            ? 'document'
                                            : 'image'
                                    }
                                    size={35}
                                    color={Colors.primaryColor}
                                />

                                <Text
                                    numberOfLines={1}
                                    style={styles.fileName}
                                >
                                    {item.description}
                                </Text>

                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color="red"
                                    style={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                    }}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <Modal
                visible={showRecordModal}
                animationType="slide"
            >
                <View style={{ flex: 1, padding: 16 }}>

                    <Text style={styles.recordTitle}>
                        Select Medical Records
                    </Text>

                    <FlatList
                        data={records}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => {

                            const selected =
                                selectedRecords.includes(item.id);

                            return (
                                <TouchableOpacity
                                    onPress={() =>
                                        toggleRecord(item.id)
                                    }
                                    style={[
                                        styles.recordCard,
                                        selected &&
                                        styles.selectedRecordCard,
                                    ]}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text>
                                            {item.description}
                                        </Text>
                                    </View>

                                    <Ionicons
                                        name={
                                            selected
                                                ? 'checkbox'
                                                : 'square-outline'
                                        }
                                        size={24}
                                        color={
                                            Colors.primaryColor
                                        }
                                    />
                                </TouchableOpacity>
                            );
                        }}
                    />

                    <PrimaryButton TextFont="800" onPress={() =>
                        setShowRecordModal(false)
                    } title='DONE' />

                </View>
            </Modal>

            <Modal
                visible={showUploadOptions}
                transparent
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>

                        {/* Camera */}
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                console.log('CAMERA CLICKED');
                                setShowUploadOptions(false);

                                setTimeout(() => {
                                    console.log("CALLING CAMERA");
                                    CameraUpload?.();
                                }, 500);
                            }}
                        >
                            <Ionicons
                                name="camera-outline"
                                size={22}
                                color={Colors.primaryColor}
                            />
                            <Text style={styles.optionText}>
                                Take Photo
                            </Text>
                        </TouchableOpacity>

                        {/* Gallery + PDF */}
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                setShowUploadOptions(false);
                                onUpload(); // selectFile()
                            }}
                        >
                            <Ionicons
                                name="cloud-upload-outline"
                                size={22}
                                color={Colors.primaryColor}
                            />
                            <Text style={styles.optionText}>
                                Upload File
                            </Text>
                        </TouchableOpacity>

                        {/* Existing Records */}
                        {records.length > 0 && (
                            <TouchableOpacity
                                style={styles.optionItem}
                                onPress={() => {
                                    setShowUploadOptions(false);
                                    setShowRecordModal(true);
                                }}
                            >
                                <Ionicons
                                    name="folder-open-outline"
                                    size={22}
                                    color={Colors.primaryColor}
                                />
                                <Text style={styles.optionText}>
                                    Select From Existing Records
                                </Text>
                            </TouchableOpacity>
                        )}

                    </View>
                </View>
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
        color: '#111',
        marginBottom: 12,
    },

    optional: {
        color: '#7B8AA0',
        fontSize: 14,
    },

    uploadBox: {
        backgroundColor: '#F8FAF9',
        borderWidth: 1,
        borderColor: '#DDE8E2',
        borderRadius: 16,
        padding: 16,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    uploadTitle: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
        color: '#111827',
    },

    uploadSubTitle: {
        fontSize: 12,
        color: '#6B7280',
        fontFamily: Fonts.PoppinsMedium,
        marginTop: 2,
    },

    uploadButton: {
        marginTop: 15,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },

    uploadBtnText: {
        color: Colors.primaryColor,
        fontSize: 15,
        fontFamily: Fonts.PoppinsMedium,
    },

    filesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 15,
    },

    fileCard: {
        width: 90,
        borderRadius: 10,
        backgroundColor: '#FFF',
        padding: 10,
        marginRight: 10,
        marginBottom: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    selectedFileCard: {
        borderColor: Colors.primaryColor,
        backgroundColor: '#F0FDF4',
    },

    fileName: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 6,
        fontFamily: Fonts.PoppinsMedium,
    },

    fileCount: {
        marginTop: 10,
        fontSize: 12,
        color: '#6B7280',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },

    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 35,
    },

    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },

    optionText: {
        marginLeft: 12,
        fontSize: 15,
        color: '#111827',
        fontFamily: Fonts.PoppinsMedium,
    },
    recordModalContainer: {
        flex: 1,
        backgroundColor: '#FFF',
    },

    recordModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },

    recordTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#111827',
    },

    recordCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    selectedRecordCard: {
        borderColor: Colors.primaryColor,
        backgroundColor: '#F0FDF4',
    },

    doneButton: {
        backgroundColor: Colors.primaryColor,
        margin: 16,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },

    doneButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
    },

});
