import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import { Ionicons } from '../../common/Vector';
import HomeHeader from '../../components/HomeHeader';
import SearchBar from '../../components/SearchBar';
import Header from '../../components/Header';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import SectionHeader from '../../components/SectionHeader';
import { Colors } from '../../common/Colors';
import PrimaryButton from '../../components/PrimaryButton';

const DATA = [
    {
        id: '1',
        title: 'General Prescription',
        subtitle: 'Dr. Emily Stone • 12 Oct 2023',
        icon: Images.medical,
    },
    {
        id: '2',
        title: 'Blood Test Report',
        subtitle: 'City Lab Center • 05 Oct 2023',
        icon: Images.medical,
    },
    {
        id: '3',
        title: 'Covid Vaccination',
        subtitle: 'Apollo Hospital • 20 Sep 2023',
        icon: Images.medical,
    },
];

const MedicalRecords = (props: any) => {
    const [activeTab, setActiveTab] = useState('All');

    const renderItem = ({ item }: any) => (
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

    return (
        <View style={styles.container}>

            {/* HEADER */}


            <Header
                title="Medical Records"
                subtitle="Manage your health documents"
                backIcon={Images.backIcon}
                onBack={() => { props.navigation.goBack() }}
            />


            <SearchBar
                placeholder="Search doctors, medicine and products..."
                icon={require('../../assets/images/search.png')}
            />


            {/* TABS */}
            <View style={styles.tabs}>
                {['All', 'Prescriptions', 'Lab Reports'].map(tab => (
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

            <View style={styles.addBox}>

                <View style={styles.iconWrapper}>
                    <Ionicons name="cloud-upload-outline" size={22} color="#065F46" />
                </View>

                <Text style={styles.addTitle}>Add New Record</Text>
                <Text style={styles.addSub}>Upload PDF or Take a photo</Text>

            </View>

            <SectionHeader title="Recent Documents" />


            <FlatList
                data={DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            {/* ADD RECORD BOX */}


            {/* BUTTON */}
            {/* <TouchableOpacity style={styles.uploadBtn}>
                <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                <Text style={styles.uploadText}>Upload File</Text>
            </TouchableOpacity> */}

            <View style={{ paddingBottom: 40, paddingTop: 10 }}>
                <PrimaryButton title="Upload File"
                    icon={Images.upload}
                    onPress={() => console.log}
                    backgroundColor="#0D614E"
                    textColor="#FFFFFF" />
            </View>


        </View>
    );
};

export default MedicalRecords;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 16,
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