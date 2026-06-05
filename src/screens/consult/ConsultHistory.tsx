import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    StatusBar,
    Dimensions,
    PixelRatio,
    ListRenderItem,
} from 'react-native';

import {
    SafeAreaView,
} from 'react-native-safe-area-context';

import {
    useNavigation,
} from '@react-navigation/native';

import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import AppointmentCard, { Appointment } from '../../components/AppointmnetCard';

import {
    getConsultHistory,
} from '../../services/ConsultServce';
import EmptyState from '../../components/EmptyState';


// ─────────────────────────────────────────────
// Responsive Helpers
// ─────────────────────────────────────────────

const { width: SCREEN_W } =
    Dimensions.get('window');

const scale = (size: number) =>
    (SCREEN_W / 375) * size;

const fs = (
    size: number,
    min = size - 2,
    max = size + 4,
) =>
    Math.min(
        max,
        Math.max(
            min,
            PixelRatio.roundToNearestPixel(
                scale(size),
            ),
        ),
    );


// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type AppointmentStatus =
    | 'COMPLETED'
    | 'CANCELLED'
    | 'UPCOMING';



type ActionKey =
    | 'view_receipt'
    | 'book_again'
    | 'view_details'
    | 'reschedule';

const TABS = [
    'All',
    'Last 30 Days',
    'Last 6 Months',
] as const;

type Tab =
    (typeof TABS)[number];


// ─────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────

const getPayload = (
    tab: Tab,
) => {

    const payloadMap = {

        All: {
            period: 'all',
        },

        'Last 30 Days': {
            period: 'last_30_days',
        },

        'Last 6 Months': {
            period: 'last_6_months',
        },

    };

    return payloadMap[tab];
};


// ─────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────

const ConsultHistory = (
    props: any,
) => {

    const navigation =
        useNavigation<any>();
    const [searchText, setSearchText] =
        useState('');
    const [loading, setLoading] =
        useState(false);

    const [activeTab, setActiveTab] =
        useState<Tab>('All');

    const [history, setHistory] =
        useState([]);


    // ─────────────────────────────────────────
    // API
    // ─────────────────────────────────────────



    const fetchConsultHistory =
        useCallback(
            async (
                payload: object,
            ) => {

                try {

                    setLoading(true);

                    const response =
                        await getConsultHistory(
                            payload,
                        );

                    console.log(
                        'CONSULTHISTORY => ',
                        response,
                    );

                    setHistory(
                        response?.data?.results ||
                        [],
                    );

                } catch (error) {

                    console.log(
                        'CONSULT HISTORY ERROR => ',
                        error,
                    );

                } finally {

                    setLoading(false);
                }
            },

            [],
        );

    const filteredHistory =
        history?.filter(
            (item: any) => {

                const doctorName =
                    item?.doctor?.doctor_name
                        ?.toLowerCase?.() || '';

                return doctorName.includes(
                    searchText.toLowerCase(),
                );
            },
        ) || [];


    // ─────────────────────────────────────────
    // Effects
    // ─────────────────────────────────────────

    useEffect(() => {

        const payload =
            getPayload(
                activeTab,
            );

        fetchConsultHistory(
            payload,
        );

    }, [
        activeTab,
    ]);


    // ─────────────────────────────────────────
    // Handlers
    // ─────────────────────────────────────────

    const handleTabPress = (
        tab: Tab,
    ) => {

        setActiveTab(tab);
    };


    const handleAction = (
        actionKey: ActionKey,
        item: Appointment,
    ) => {

        switch (actionKey) {

            case 'view_receipt':

                navigation.navigate(
                    'MedicalReceipt',
                    {
                        consultationId:
                            item.consultation_id,
                    },
                );

                break;

            case 'book_again':

                navigation.navigate(
                    'DoctorSlot',
                );

                break;

            case 'view_details':

                navigation.navigate(
                    'AppointmentDetails',
                    {
                        appointmentId:
                            item.consultation_id,
                    },
                );

                break;

            case 'reschedule':

                navigation.navigate(
                    'Reschedule',
                    {
                        appointmentId:
                            item.consultation_id,
                    },
                );

                break;
        }
    };


    // ─────────────────────────────────────────
    // Render Item
    // ─────────────────────────────────────────

    const renderItem = ({
        item,
    }: {
        item: Appointment;
    }) => (

        <AppointmentCard
            item={item}
            onAction={handleAction}
            style={styles.cardStyle}
        />
    );
    // ─────────────────────────────────────────
    // UI
    // ─────────────────────────────────────────

    return (

        <SafeAreaView
            style={
                styles.container
            }
        >

            <StatusBar
                barStyle="dark-content"
                backgroundColor={
                    Colors.background
                }
            />

            <Header
                title="Consultation History"
                subtitle="Track your medical journey"
                backIcon={
                    Images.backIcon
                }
                onBack={() =>
                    props.navigation.goBack()
                }
            />

            <SearchBar
                placeholder="Search doctors..."
                icon={require('../../assets/images/search.png')}
                value={searchText}
                onChangeText={setSearchText}
            />


            {/* Tabs */}

            <View style={styles.tabs}>

                {TABS.map(
                    (
                        tab,
                        index,
                    ) => (

                        <TouchableOpacity
                            key={tab}
                            activeOpacity={
                                0.75
                            }
                            onPress={() =>
                                handleTabPress(
                                    tab,
                                )
                            }
                            style={[
                                styles.tabBtn,

                                activeTab ===
                                tab &&
                                styles.activeTab,

                                index <
                                TABS.length -
                                1 &&
                                styles.tabBtnGap,
                            ]}
                        >

                            <Text
                                style={[
                                    styles.tabText,

                                    activeTab ===
                                    tab &&
                                    styles.activeTabText,
                                ]}
                            >
                                {tab}
                            </Text>

                        </TouchableOpacity>
                    ),
                )}
            </View>


            {/* List */}


            {
                filteredHistory?.length === 0 ? (

                    <EmptyState
                        title={
                            history?.length === 0
                                ? 'No Appointments Yet'
                                : 'Appointment Not Found'
                        }
                        subtitle={
                            history?.length === 0
                                ? 'Your consultations will appear here.'
                                : 'Try another doctor name.'
                        }
                    />

                ) : (

                    <FlatList
                        data={filteredHistory}
                        renderItem={renderItem}
                        keyExtractor={(item) =>
                            item.consultation_id
                        }
                        contentContainerStyle={
                            styles.listContent
                        }

                        showsVerticalScrollIndicator={false}
                    />
                )
            }

        </SafeAreaView>
    );
};

export default ConsultHistory;


// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor:
            Colors.background,
        paddingHorizontal:
            scale(16),
    },


    // Tabs

    tabs: {
        flexDirection: 'row',
        marginTop: scale(8),
        marginBottom:
            scale(12),
    },

    tabBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent:
            'center',

        paddingVertical:
            scale(10),

        paddingHorizontal:
            scale(6),

        borderRadius:
            scale(10),

        borderWidth: 1,

        borderColor:
            Colors.borderColor,

        backgroundColor:
            '#FFFFFF',
    },

    tabBtnGap: {
        marginRight:
            scale(6),
    },

    activeTab: {
        backgroundColor:
            '#065F46',

        borderColor:
            '#065F46',
    },

    tabText: {
        fontSize: fs(
            12,
            10,
            14,
        ),

        color: '#334155',

        fontFamily:
            Fonts.PoppinsMedium,
    },

    activeTabText: {
        color: '#FFFFFF',
    },


    // List

    listContent: {
        gap: scale(12),
        paddingBottom:
            scale(24),
    },
    cardStyle: {
        marginBottom: 12,
    },
});