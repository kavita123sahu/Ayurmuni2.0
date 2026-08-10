import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TablerIcon from './TablerIcon';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

const RECORD_TYPES = [
    { label: 'Prescription', value: 'prescription' },
    { label: 'Lab Report', value: 'lab_report' },
];

type PickedFile = {
    name: string;
    uri: string;
    type: string;
};

type Props = {
    visible: boolean;
    file: PickedFile | null;
    uploading: boolean;
    onClose: () => void;
    onSubmit: (payload: { description: string; medical_record_type: string }) => void;
};

const UploadRecordModal: React.FC<Props> = ({
    visible,
    file,
    uploading,
    onClose,
    onSubmit,
}) => {
    const insets = useSafeAreaInsets();
    const [description, setDescription] = useState('');
    const [recordType, setRecordType] = useState('');

    useEffect(() => {
        if (visible) {
            setDescription(file?.name || '');
            setRecordType('');
        }
    }, [visible, file]);

    const isDisabled = !description.trim() || !recordType || uploading;

    const isPdf = file?.type?.includes('pdf');

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Upload Medical Record</Text>
                        <TouchableOpacity onPress={onClose} disabled={uploading}>
                            <TablerIcon name="x" size={22} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {file && (
                        <View style={styles.filePreview}>
                            <View style={styles.fileIcon}>
                                <TablerIcon
                                    name='file-medical'
                                    // name={isPdf ? 'file-type-pdf' : 'photo'}
                                    size={22}
                                    color="#065F46"
                                />
                            </View>
                            <Text style={styles.fileName} numberOfLines={1}>
                                {file.name}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.label}>Record Name *</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="e.g. Blood Test Report"
                        placeholderTextColor="#98A2B3"
                        style={styles.input}
                        editable={!uploading}
                    />

                    <Text style={styles.label}>Record Type *</Text>
                    <View style={styles.typeRow}>
                        {RECORD_TYPES.map(item => {
                            const isSelected = recordType === item.value;
                            return (
                                <TouchableOpacity
                                    key={item.value}
                                    style={[styles.typeChip, isSelected && styles.typeChipActive]}
                                    onPress={() => setRecordType(item.value)}
                                    disabled={uploading}
                                >
                                    <Text
                                        style={[
                                            styles.typeChipText,
                                            isSelected && styles.typeChipTextActive,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, isDisabled && styles.submitBtnDisabled]}
                        disabled={isDisabled}
                        onPress={() =>
                            onSubmit({
                                description: description.trim(),
                                medical_record_type: recordType,
                            })
                        }
                    >
                        {uploading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitText}>Submit</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default UploadRecordModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    filePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        padding: 12,
        marginBottom: 18,
        gap: 10,
    },
    fileIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileName: {
        flex: 1,
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#334155',
    },
    label: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: '#0F172A',
        marginBottom: 18,
    },
    typeRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    typeChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    typeChipActive: {
        borderColor: '#065F46',
        backgroundColor: '#ECFDF5',
    },
    typeChipText: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    typeChipTextActive: {
        color: '#065F46',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    submitBtn: {
        height: 54,
        borderRadius: 16,
        backgroundColor: '#065F46',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
    },
});