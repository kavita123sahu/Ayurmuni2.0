import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    View,
    StyleSheet,
    FlatList,
    StatusBar,
    RefreshControl,
} from 'react-native';

import {
    SafeAreaView,
} from 'react-native-safe-area-context';

import {
    useNavigation,
} from '@react-navigation/native';

import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import Header from '../../components/Header';
import { ExpandableSearch } from '../../components/SearchBar';
import AppointmentCard, { Appointment } from '../../components/AppointmnetCard';
import SegmentTabs from '../../components/SegmentTabs';

import {
    getConsultHistory,
} from '../../services/ConsultServce';
import EmptyState from '../../components/EmptyState';
import { AppointmentSkeletonList } from '../../simmerScreen/ShimmerHook';
import {
  buildAppointmentDetailsParams,
  resolveAppointmentLookupId,
} from '../../utils/appointmentUtils';
import { useDebounce } from '../../hooks/useDebaunce';
import { getScreenPaddingH, SPACING } from '../../constants/responsive';

type ActionKey =
    | 'view_receipt'
    | 'book_again'
    | 'view_details'
    | 'reschedule';

const TABS = [
    { key: 'All', label: 'All' },
    { key: 'Last 30 Days', label: 'Last 30 Days' },
    { key: 'Last 6 Months', label: 'Last 6 Months' },
] as const;

type Tab = (typeof TABS)[number]['key'];

const getPayload = (tab: Tab) => {
    const payloadMap = {
        All: { period: 'all' },
        'Last 30 Days': { period: 'last_30_days' },
        'Last 6 Months': { period: 'last_6_months' },
    };
    return payloadMap[tab];
};

const ConsultHistory = (props: any) => {
    const navigation = useNavigation<any>();
    const [searchText, setSearchText] = useState('');
    const [searchExpanded, setSearchExpanded] = useState(false);
    const debouncedSearch = useDebounce(searchText, 400);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('All');
    const [history, setHistory] = useState([]);

    const fetchConsultHistory = useCallback(async (payload: object, isRefresh = false) => {
        try {
            if (!isRefresh) {
                setLoading(true);
            }
            const response = await getConsultHistory(payload);
            setHistory(response?.data?.results || []);
        } catch (error) {
            console.log('CONSULT HISTORY ERROR => ', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchConsultHistory(getPayload(activeTab), true);
    }, [activeTab, fetchConsultHistory]);

    const filteredHistory = useMemo(() => {
        const keyword = debouncedSearch.trim().toLowerCase();
        if (!keyword) return history || [];

        return (history || []).filter((item: any) => {
            const doctorName = item?.doctor?.doctor_name?.toLowerCase?.() || '';
            const concern = item?.concern?.toLowerCase?.() || '';
            return doctorName.includes(keyword) || concern.includes(keyword);
        });
    }, [history, debouncedSearch]);

    useEffect(() => {
        fetchConsultHistory(getPayload(activeTab));
    }, [activeTab, fetchConsultHistory]);

    const handleAction = (actionKey: ActionKey, item: Appointment) => {
        switch (actionKey) {
            case 'view_receipt':
                navigation.navigate('MedicalReceipt', {
                    consultationId: item.consultation_id,
                });
                break;
            case 'book_again':
                navigation.navigate('DoctorSlot', {
                    doctorDetails: {
                        ...item.doctor,
                        id: item.doctor?.doctor_id,
                        is_favorite: (item.doctor as any)?.is_favorite,
                        total_patients: (item.doctor as any)?.total_patients,
                        full_name: item.doctor?.doctor_name,
                        profile_image: item.doctor?.doctor_image,
                        designation: (item.doctor as any)?.qualification,
                    },
                });
                break;
            case 'view_details':
                navigation.navigate(
                    'AppointmentDetails',
                    buildAppointmentDetailsParams(item),
                );
                break;
            case 'reschedule':
                navigation.navigate('Reschedule', {
                    appointmentId: resolveAppointmentLookupId(item),
                });
                break;
        }
    };

    const renderItem = ({ item }: { item: Appointment }) => (
        <AppointmentCard item={item} onAction={handleAction} />
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <Header
                title="Consultation History"
                subtitle="Track your medical journey"
                onBack={() => props.navigation.goBack()}
                onSearchPress={() => setSearchExpanded(true)}
                onRefreshPress={onRefresh}
            />

            <ExpandableSearch
                placeholder="Search doctors..."
                value={searchText}
                onChangeText={setSearchText}
                showTrigger={false}
                expanded={searchExpanded}
                onExpandedChange={setSearchExpanded}
            />

            <SegmentTabs
                tabs={[...TABS]}
                activeKey={activeTab}
                onChange={key => setActiveTab(key as Tab)}
                variant="pill"
            />

            {loading ? (
                <AppointmentSkeletonList />
            ) : filteredHistory?.length === 0 ? (
                <EmptyState
                    title={history?.length === 0 ? 'No Appointments Yet' : 'Appointment Not Found'}
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
                    keyExtractor={item => item.consultation_id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primaryColor]}
                            tintColor={Colors.primaryColor}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default ConsultHistory;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: getScreenPaddingH(),
    },
    listContent: {
        gap: SPACING.md,
        paddingBottom: SPACING.xxl,
    },
});
