import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    ScrollView,
    ActivityIndicator,
    Linking,
} from 'react-native';
import TablerIcon from '../../components/TablerIcon';
import SelectedUploadCard from '../../components/SelectedUploadCard';
import SearchBar from '../../components/SearchBar';
import Header from '../../components/Header';
import { Images } from '../../common/Images';
import UploadRecordModal from '../../components/UploadRecordModal';
import { Fonts } from '../../common/Fonts';
import SectionHeader from '../../components/SectionHeader';
import { Colors } from '../../common/Colors';
import PrimaryButton from '../../components/PrimaryButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import MedicalRecordCard from '../consult/MedicalRecordCard';
import PreviewModal from '../consult/PreviewModal';
import { useMedicalRecord, useMedicalUpload, usePatientData } from '../../hooks/usePatientData';
import { deleteMedicalRecord } from '../../services/PatientServices';


const MedicalRecords = (props: any) => {
    const [activeTab, setActiveTab] = useState('All Records');

    const {
        patientsRecord,
        fetchPatientsRecord,
    } = useMedicalRecord();

    console.log("patientsRecordpatientsRecord", patientsRecord);



    const TAB_TYPE_MAP: Record<string, string | null> = {
        'All Records': null,
        'Prescriptions': 'prescription',
        'Lab Reports': 'lab_report',
    };

    const {
        selectFile,
        CameraUpload,
        removeFile,
        pickedFile,
        uploading,
        modalVisible,
        submitRecord,
        closeUploadModal,
    } = useMedicalUpload(
        fetchPatientsRecord,
        (recordId) => {
            setSelectedRecords(prev => [...prev, recordId]);
        },
    );
    console.log("patientsRecordpatientsRecord", patientsRecord);

    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    // const selectedRecordItems = (patientsRecord || []).filter((item: any) =>
    //     selectedRecords?.includes(item.id),
    // );


    const filteredRecords = React.useMemo(() => {
        const targetType = TAB_TYPE_MAP[activeTab];
        if (!targetType) return patientsRecord || [];

        return (patientsRecord || []).filter(
            (item: any) => item?.medical_record_type === targetType,
        );
    }, [patientsRecord, activeTab]);


    const selectedRecordItems = (filteredRecords || []).filter((item: any) =>
        selectedRecords?.includes(item.id),
    );

    const TabButton = () => {

        return (
            <View style={styles.tabs}>
                {['All Records', 'Prescriptions', 'Lab Reports'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[
                            styles.tabBtn,
                            activeTab === tab && styles.activeTab,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText,
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        )
    }

    const toggleRecord = (id: string) => {
        setSelectedRecords(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const deleteRecord = async (id: string) => {
        try {
            console.log('delete id =>', id);

            await deleteMedicalRecord(id);

            await fetchPatientsRecord();

        } catch (error) {
            console.log(
                'DELETE ERROR =>',
                error,
            );
        }
    };

    const renderItem = ({ item }: any) => (
        <MedicalRecordCard
            item={item}
            selected={selectedRecords?.includes(
                item.id,
            )}
            onSelect={() =>
                toggleRecord(item.id)
            }
            onPreview={() => {
                setPreviewUrl(item?.file_url);
                // setPreviewVisible(true);
                Linking.openURL(item?.file_url)
            }}
            onDelete={() =>
                deleteRecord(item?.id)
            }
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Medical Records"
                subtitle="Manage your health documents"
                onBack={() => { props.navigation.goBack() }}
            />

            <SearchBar
                placeholder="Search for help topics..."

            />

            <TabButton />

            <ScrollView>

                {uploading ? (
                    <View
                        style={{
                            paddingVertical: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ActivityIndicator
                            size="large"
                            color={Colors.primaryColor}
                        />

                        <Text
                            style={{
                                marginTop: 10,
                                color: Colors.primaryColor,
                                fontFamily: Fonts.PoppinsMedium,
                            }}
                        >
                            Uploading...
                        </Text>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.uploadContainer}
                            onPress={selectFile}
                            activeOpacity={0.9}
                        >
                            <View style={styles.uploadIcon}>
                                <TablerIcon name="upload" size={28} color="#065F46" />
                            </View>

                            <Text style={styles.uploadTitle}>
                                Upload Medical Record
                            </Text>

                            <Text style={styles.uploadSub}>
                                Prescription, lab report, PDF or image
                            </Text>
                        </TouchableOpacity>

                        {selectedRecordItems?.length > 0 && (
                            <View style={styles.selectedSection}>
                                <Text style={styles.selectedLabel}>
                                    Selected ({selectedRecordItems?.length})
                                </Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                >
                                    {selectedRecordItems?.map((item: any) => (
                                        <SelectedUploadCard
                                            key={item.id}
                                            name={item.description || 'Medical record'}
                                            uri={item.file_url}
                                            fileType={item.file_type}
                                            onRemove={() =>
                                                setSelectedRecords(prev =>
                                                    prev.filter(id => id !== item.id),
                                                )
                                            }
                                        />
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* <View style={styles.selectedCountBox}>
                            <TablerIcon name="file-medical" size={18} color="#065F46" />
                            <Text style={styles.selectedCountText}>
                                Selected records: {selectedRecords?.length}
                            </Text>
                        </View> */}
                    </>
                )}

                <SectionHeader title="Recent Documents" />

                <FlatList
                    // data={patientsRecord}
                    data={[
                        ...(filteredRecords || []),
                    ]}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No records found</Text>
                        </View>
                    }
                />

                <View style={{ paddingBottom: 40, paddingTop: 10 }}>
                    {/* <PrimaryButton title="Upload File"
                        iconName="upload"
                        onPress={() => console.log}
                        backgroundColor="#0D614E"
                        TextFont={Fonts.PoppinsRegular}
                        textColor="#FFFFFF" /> */}

                    {/* {selectedRecords.length > 0 && (
                        <View
                            style={{
                                flexDirection: 'row',
                                gap: 10,
                                marginTop: 20,
                            }}>

                            <PrimaryButton
                                iconName="upload"
                                backgroundColor="#0D614E"
                                TextFont={Fonts.PoppinsRegular}
                                textColor="#FFFFFF"
                                title="Preview"
                                onPress={() =>
                                    setPreviewVisible(true)
                                }
                            />

                            <PrimaryButton
                                iconName="upload"
                                backgroundColor="#0D614E"
                                TextFont={Fonts.PoppinsRegular}
                                textColor="#FFFFFF"
                                title="Upload Selected"
                                onPress={handleSubmitRecords}
                            />
                        </View>
                    )} */}

                    {/* {selectedFiles.length > 0 && (

                        <PrimaryButton
                            title={uploading ? "Uploading..." : "Upload Selected"}
                            onPress={submitFiles}
                            backgroundColor="#0D614E"
                            textColor="#fff"
                        />
                    )} */}
                </View>
            </ScrollView>

            {previewVisible && (
                <PreviewModal
                    visible={previewVisible}
                    imageUrl={previewUrl}
                    record={selectedRecords}
                    onClose={() => {
                        setPreviewVisible(false);
                        setPreviewUrl('');
                        // setSelectedRecord(null);
                    }}
                />
            )}

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
        backgroundColor: '#F8FAFC',
        // padding: 16,
        paddingHorizontal: 20
    },

    header: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0F172A',
    },

    subHeader: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 16,
    },

    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 44,
        marginBottom: 16,
    },

    input: {
        marginLeft: 8,
        flex: 1,
    },

    tabs: {
        flexDirection: 'row',
        marginBottom: 16,

    },

    tabBtn: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        backgroundColor: '#ffff',
        marginRight: 8,
    },

    activeTab: {
        backgroundColor: '#065F46',
    },

    tabText: {
        fontSize: 12,
        color: '#334155',
        fontFamily: Fonts.PoppinsMedium
    },

    activeTabText: {
        color: '#fff',
        fontFamily: Fonts.PoppinsMedium
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        paddingVertical: 20,
        borderRadius: 24,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.borderColor

    },

    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: "#E8F3F1", // light green like figma
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    icon: {
        height: 25,
        width: 25, // dark green icon
    },

    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    title: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: Colors.black,
    },

    subtitle: {
        fontSize: 12,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsRegular,

    },
    addBox: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#059669', // darker green like figma
        borderRadius: 18,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        backgroundColor: '#F9FAFB',
    },

    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#ECFDF5', // light green bg
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },

    uploadContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#10B981',
        paddingVertical: 28,
        alignItems: 'center',
        marginTop: 16,
    },

    uploadIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },

    uploadTitle: {
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 16,
        color: '#065F46',
    },

    uploadSub: {
        fontFamily: Fonts.PoppinsRegular,
        fontSize: 12,
        color: '#64748B',
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
    },
    selectedCountBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginVertical: 15,
        backgroundColor: '#ECFDF5',
        padding: 14,
        borderRadius: 14,
    },
    selectedCountText: {
        color: '#065F46',
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 13,
    },
    addTitle: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#065F46',
    },

    addSub: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: Colors.subTextColor,
    },

    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsRegular,
    },
    prescriptionBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginRight: 8,
    },
    prescriptionBadgeText: {
        fontSize: 11,
        color: '#065F46',
        fontFamily: Fonts.PoppinsMedium,
    },
    labBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginRight: 8,
    },
    labBadgeText: {
        fontSize: 11,
        color: '#D97706',
        fontFamily: Fonts.PoppinsMedium,
    },

    uploadBtn: {
        flexDirection: 'row',
        backgroundColor: '#065F46',
        paddingVertical: 16,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    uploadText: {
        color: '#fff',
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 15,
    },
});