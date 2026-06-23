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
} from 'react-native';
import { Ionicons } from '../../common/Vector';
import HomeHeader from '../../components/HomeHeader';
import SearchBar from '../../components/SearchBar';
import Header from '../../components/Header';
import { Images } from '../../common/Images';
import { pick } from '@react-native-documents/picker';

import { Fonts } from '../../common/Fonts';
import SectionHeader from '../../components/SectionHeader';
import { Colors } from '../../common/Colors';
import PrimaryButton from '../../components/PrimaryButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderCard from '../../components/OrderCard';
import MedicalRecordCard from '../consult/MedicalRecordCard';
import PreviewModal from '../consult/PreviewModal';
import { useMedicalRecord, useMedicalUpload, usePatientData } from '../../hooks/usePatientData';
import { AddMedicalRecord, deleteMedicalRecord } from '../../services/PatientServices';

// ✅ Tab-wise alag DATA
const ALL_DATA = [
    {
        id: '1',
        title: 'General Prescription',
        subtitle: 'Dr. Emily Stone • 12 Oct 2023',
        icon: Images.medical,
        type: 'Prescriptions',
    },
    {
        id: '2',
        title: 'Blood Test Report',
        subtitle: 'City Lab Center • 05 Oct 2023',
        icon: Images.medical,
        type: 'Lab Reports',
    },
    {
        id: '3',
        title: 'Covid Vaccination',
        subtitle: 'Apollo Hospital • 20 Sep 2023',
        icon: Images.medical,
        type: 'Prescriptions',
    },
];

const MedicalRecords = (props: any) => {
    const [activeTab, setActiveTab] = useState('All Records');

    const {
        patientsRecord,
        fetchPatientsRecord,
    } = useMedicalRecord();

    const {
        selectedFiles,
        uploading,
        selectFile,
        submitFiles,
        removeFile,
    } = useMedicalUpload(fetchPatientsRecord,);

    console.log("patientsRecordpatientsRecord", patientsRecord)
    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
    const [records, setRecords] = useState(patientsRecord);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const formatStatus = (status: string): 'DELIVERED' | 'IN PROGRESS' => {
        const s = status?.toUpperCase();

        if (s === 'DELIVERED') return 'DELIVERED';

        return 'IN PROGRESS';
    };

    // const selectedFiles = uploadedFiles.filter(
    //     item =>
    //         selectedRecords.includes(item.id),
    // );
    const filteredData =
        activeTab === 'All Records'
            ? records
            : records.filter(
                item => item.medical_record_type === activeTab,
            );

    const renderAllItem = ({ item }: any) => (
        <TouchableOpacity style={styles.card}>
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: '#E8F3F1' },
                ]}
            >
                <Image
                    source={item.icon}
                    style={[
                        styles.icon,
                        { tintColor: '#1B5E54' },
                    ]}
                />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={Colors.primaryColor} />
        </TouchableOpacity>
    );

    const renderPrescriptionItem = ({ item }: any) => (
        // <TouchableOpacity style={styles.card}>
        //     <View style={[styles.iconContainer, { backgroundColor: '#E8F3F1' }]}>
        //         <Image source={item.icon} style={[styles.icon, { tintColor: '#1B5E54' }]} />
        //     </View>
        //     <View style={{ flex: 1 }}>
        //         <Text style={styles.title}>{item.title}</Text>
        //         <Text style={styles.subtitle}>{item.subtitle}</Text>
        //     </View>
        //     {/* ✅ Prescription badge */}
        //     <View style={styles.prescriptionBadge}>
        //         <Text style={styles.prescriptionBadgeText}>Rx</Text>
        //     </View>
        //     <Ionicons name="chevron-forward" size={20} color={Colors.primaryColor} />
        // </TouchableOpacity>


        <OrderCard title={item.title}
            id={item.id}
            status={formatStatus(item.status)} // ✅ FIX
            date={'20 Oct 2023'}
            amount={"2,999.00"} />
    );


    // ✅ Lab Reports ka alag card
    const renderLabItem = ({ item }: any) => (
        <TouchableOpacity style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#0D9488' }]}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Image source={item.icon} style={[styles.icon, { tintColor: '#D97706' }]} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
            {/* ✅ Lab badge */}
            <View style={styles.labBadge}>
                <Text style={styles.labBadgeText}>Lab</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primaryColor} />
        </TouchableOpacity>
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
    const handleUploadRecord = async () => {
        try {
            const result = await pick({
                mode: 'open',
                type: ['image/*', 'application/pdf'],
            });

            const file = result?.[0];

            if (!file) return;

            const newFile = {
                id: Date.now().toString(),
                name: file.name,
                uri: file.uri,
                type: file.type,
                isNew: true,
            };

            setUploadedFiles(prev => [newFile, ...prev]);

            setSelectedRecords(prev => [
                ...prev,
                newFile.id,
            ]);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmitRecords = async () => {
        try {
            for (const file of selectedFiles) {

                const payload = {
                    medical_record_type: 'lab_report',
                    file_type: file.type?.includes('pdf')
                        ? 'pdf'
                        : 'image',
                    description:
                        file.name || 'Medical Record',

                    file_url:
                        "https://ayurmuni.s3.ap-south-1.amazonaws.com/appointment_documents/aa1e39a5a8be42938c62b6c7ffb87bd6.jpg",
                };

                console.log('payload =>', payload);

                await AddMedicalRecord(payload);
            }

            setSelectedRecords([]);
            setUploadedFiles([]);
            fetchPatientsRecord();

        } catch (error) {
            console.log('handleSubmitRecords Error =>', error);
        }
    };


    const renderItem = ({ item }: any) => (
        <MedicalRecordCard
            item={item}
            selected={selectedRecords.includes(
                item.id,
            )}
            onSelect={() =>
                toggleRecord(item.id)
            }
            onPreview={() => {
                setPreviewUrl(item.uri || item.file_url);
                setPreviewVisible(true);
            }}
            onDelete={() =>
                deleteRecord(item.id)
            }
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Medical Records"
                subtitle="Manage your health documents"
                backIcon={Images.backIcon}
                onBack={() => { props.navigation.goBack() }}
            />

            <SearchBar
                placeholder="Search for help topics..."
                icon={require('../../assets/images/Search.png')}
            />

            {/* <TabButton /> */}

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
                        {selectedFiles.length === 0 ? (
                            <TouchableOpacity
                                style={styles.uploadContainer}
                                onPress={selectFile}
                            >
                                <View style={styles.uploadIcon}>
                                    <Ionicons
                                        name="cloud-upload-outline"
                                        size={28}
                                        color="#065F46"
                                    />
                                </View>

                                <Text style={styles.uploadTitle}>
                                    Upload Medical Record
                                </Text>

                                <Text style={styles.uploadSub}>
                                    Prescription, Lab Report, PDF or Image
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.uploadContainer}>
                                <Text style={styles.uploadTitle}>
                                    {selectedFiles.length} file(s) selected
                                </Text>

                                {selectedFiles.map(item => (
                                    <View
                                        key={item.id}
                                        style={{ marginTop: 10 }}
                                    >
                                        <Text
                                            style={{
                                                color: '#065F46',
                                            }}
                                        >
                                            {item.name} ({item.status})
                                        </Text>

                                        <TouchableOpacity
                                            onPress={() =>
                                                removeFile(item.id)
                                            }
                                        >
                                            <Text
                                                style={{
                                                    color: 'red',
                                                }}
                                            >
                                                Remove
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View
                            style={{
                                marginVertical: 15,
                                backgroundColor: '#ECFDF5',
                                padding: 14,
                                borderRadius: 14,
                            }}
                        >
                            <Text
                                style={{
                                    color: '#065F46',
                                    fontFamily:
                                        Fonts.PoppinsMedium,
                                }}
                            >
                                Selected Records:{' '}
                                {selectedRecords.length}
                            </Text>
                        </View>
                    </>
                )}
                <SectionHeader title="Recent Documents" />



                <FlatList
                    // data={patientsRecord}
                    data={[
                        ...(patientsRecord || []),
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
                        icon={Images.upload}
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
                                icon={Images.upload}
                                backgroundColor="#0D614E"
                                TextFont={Fonts.PoppinsRegular}
                                textColor="#FFFFFF"
                                title="Preview"
                                onPress={() =>
                                    setPreviewVisible(true)
                                }
                            />

                            <PrimaryButton
                                icon={Images.upload}
                                backgroundColor="#0D614E"
                                TextFont={Fonts.PoppinsRegular}
                                textColor="#FFFFFF"
                                title="Upload Selected"
                                onPress={handleSubmitRecords}
                            />
                        </View>
                    )} */}

                    {selectedFiles.length > 0 && (
                        <PrimaryButton
                            title={uploading ? "Uploading..." : "Upload Selected"}
                            onPress={submitFiles}
                            backgroundColor="#0D614E"
                            textColor="#fff"
                        />
                    )}
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