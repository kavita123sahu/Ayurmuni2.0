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
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderCard from '../../components/OrderCard';

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


    const formatStatus = (status: string): 'DELIVERED' | 'IN PROGRESS' => {
        const s = status?.toUpperCase();

        if (s === 'DELIVERED') return 'DELIVERED';

        return 'IN PROGRESS';
    };


    const filteredData = activeTab === 'All Records'
        ? ALL_DATA
        : ALL_DATA.filter(item => item.type === activeTab);

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





    const getRenderItem = () => {
        if (activeTab === 'Prescriptions') return renderPrescriptionItem;
        if (activeTab === 'Lab Reports') return renderLabItem;
        return renderAllItem;
    };

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
                icon={require('../../assets/images/search.png')}
            />

            <TabButton />

            <ScrollView>
                <View style={styles.addBox}>

                    <View style={styles.iconWrapper}>
                        <Ionicons name="cloud-upload-outline" size={22} color="#065F46" />
                    </View>

                    <Text style={styles.addTitle}>Add New Record</Text>
                    <Text style={styles.addSub}>Upload PDF or Take a photo</Text>

                </View>

                <SectionHeader title="Recent Documents" />

                {/* 
                <FlatList
                    data={DATA}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                /> */}



                <FlatList
                    data={filteredData}
                    renderItem={getRenderItem()}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No records found</Text>
                        </View>
                    }
                />

                <View style={{ paddingBottom: 40, paddingTop: 10 }}>
                    <PrimaryButton title="Upload File"
                        icon={Images.upload}
                        onPress={() => console.log}
                        backgroundColor="#0D614E"
                        TextFont={Fonts.PoppinsRegular}
                        textColor="#FFFFFF" />
                </View>


            </ScrollView>



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