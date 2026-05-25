import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import AppointmentCard from '../../components/AppointmnetCard';
import { NavigationProp, useNavigation } from '@react-navigation/native';

// ─── Responsive helpers ───────────────────────────────────────────────────────

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** Scale a size relative to a 375px base width */
const scale = (size: number) => (SCREEN_W / 375) * size;

/** Clamp scaled font so it never goes below min or above max */
const fs = (size: number, min = size - 2, max = size + 4) =>
    Math.min(max, Math.max(min, PixelRatio.roundToNearestPixel(scale(size))));

// ─── Static data (replace with API) ──────────────────────────────────────────

type AppointmentStatus = 'COMPLETED' | 'CANCELLED' | 'UPCOMING';

interface Appointment {
    id: string;
    doctor: string;
    specialty: string;
    date: string;
    status: AppointmentStatus;
    avatarUrl: string | null;
}

const APPOINTMENTS: Appointment[] = [
    { id: '1', doctor: 'Dr. Arjun R Nair', specialty: 'Cardiologist', date: '12 May', status: 'COMPLETED', avatarUrl: null },
    { id: '2', doctor: 'Dr. Sarah Jenkins', specialty: 'Dermatologist', date: '05 May', status: 'CANCELLED', avatarUrl: null },
    { id: '3', doctor: 'Dr. Arjun R Nair', specialty: 'Cardiologist', date: '12 May', status: 'COMPLETED', avatarUrl: null },
    { id: '4', doctor: 'Dr. Arjun R Nair', specialty: 'Cardiologist', date: '15 May', status: 'UPCOMING', avatarUrl: null },
];


// ─── Action handler ───────────────────────────────────────────────────────────

type ActionKey = 'view_receipt' | 'book_again' | 'view_details' | 'reschedule';



// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = ['All', 'Last 30 Days', 'Last 6 Months'] as const;
type Tab = (typeof TABS)[number];

// ─── Screen ───────────────────────────────────────────────────────────────────

const ConsultHistory = (props: any) => {
    const [activeTab, setActiveTab] = useState<Tab>('All');

    const navigation = useNavigation<any>();


    const handleAction = (
        actionKey: ActionKey,
        item: Appointment,
    ) => {
        switch (actionKey) {
            case 'view_receipt':
                navigation.navigate('MedicalReceipt');
                break;

            case 'book_again':
                navigation.navigate('DoctorSlot');
                break;

            case 'view_details':
                navigation.navigate(
                    'AppointmentDetails',
                    {
                        appointmentId: item.id,
                    },
                );
                break;

            case 'reschedule':
                navigation.navigate(
                    'Reschedule',
                    {
                        appointmentId: item.id,
                    },
                );
                break;
        }
    };

    const renderItem: ListRenderItem<Appointment> = ({ item }) => (
        <AppointmentCard item={item} onAction={handleAction} />
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <Header
                title="Consultation History"
                subtitle="Track your medical journey"
                backIcon={Images.backIcon}
                onBack={() => props.navigation.goBack()}
            />

            <SearchBar
                placeholder="Search doctors, concerns..."
                icon={require('../../assets/images/search.png')}
            />


            <View style={styles.tabs}>
                {TABS.map((tab, index) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[
                            styles.tabBtn,
                            activeTab === tab && styles.activeTab,
                            index < TABS.length - 1 && styles.tabBtnGap,
                        ]}
                        activeOpacity={0.75}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.8}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── List ── */}
            <FlatList<Appointment>
                data={APPOINTMENTS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

export default ConsultHistory;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: scale(16), // was fixed 20 — now scales with screen
    },

    // ── Tabs ──
    tabs: {
        flexDirection: 'row',
        marginTop: scale(8),
        marginBottom: scale(12),
    },
    tabBtn: {
        flex: 1,
        paddingVertical: scale(10),    // was fixed 12 — scales on big screens
        paddingHorizontal: scale(6),   // reduced so text has room on narrow screens
        borderRadius: scale(10),
        borderWidth: 1,
        borderColor: Colors.borderColor,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabBtnGap: {
        marginRight: scale(6),         // gap only between tabs, not after last one
    },
    activeTab: {
        backgroundColor: '#065F46',
        borderColor: '#065F46',
    },
    tabText: {
        fontSize: fs(12, 10, 14),      // responsive font: base 12, min 10, max 14
        color: '#334155',
        fontFamily: Fonts.PoppinsMedium,
    },
    activeTabText: {
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsMedium,
    },

    // ── List ──
    listContent: {
        gap: scale(12),                // was fixed 14
        paddingBottom: scale(24),      // breathing room at bottom
    },
});