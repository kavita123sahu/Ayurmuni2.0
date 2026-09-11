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

/** Stable API period keys — avoid space-filled labels as filter keys */
const TABS = [
    { key: 'all', label: 'All' },
    { key: 'last_30_days', label: 'Last 30 Days' },
    { key: 'last_90_days', label: 'Last 90 Days' },
] as const;

type Tab = (typeof TABS)[number]['key'];

const ConsultHistory = (props: any) => {
    const navigation = useNavigation<any>();
    const [searchText, setSearchText] = useState('');
    const [searchExpanded, setSearchExpanded] = useState(false);
    const debouncedSearch = useDebounce(searchText, 400);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('all');
    const [history, setHistory] = useState([]);
    const historyLenRef = React.useRef(0);

    // Pagination: show 5 items per page with load-more on scroll
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;

    useEffect(() => {
        historyLenRef.current = history.length;
    }, [history.length]);

    const fetchConsultHistory = useCallback(async (period: Tab, isRefresh = false) => {
        try {
            if (!isRefresh) {
                setLoading(historyLenRef.current === 0);
            }
            const response = await getConsultHistory({ period });
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
        fetchConsultHistory(activeTab, true);
    }, [activeTab, fetchConsultHistory]);

    const filteredHistory = useMemo(() => {
        const keyword = debouncedSearch.trim().toLowerCase();
        if (!keyword) return history || [];

        return (history || []).filter((item: any) => {
            const doctorName = item?.doctor?.doctor_name?.toLowerCase?.() || '';
            const concern = item?.concern?.toLowerCase?.() || '';
            const status = String(item?.status || '').toLowerCase();
            return (
                doctorName.includes(keyword) ||
                concern.includes(keyword) ||
                status.includes(keyword)
            );
        });
    }, [history, debouncedSearch]);

    useEffect(() => {
        fetchConsultHistory(activeTab);
    }, [activeTab, fetchConsultHistory]);

    // Reset page when the filtered set changes (search / tab changes / history refresh)
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, activeTab, history.length]);

    const displayedHistory = React.useMemo(() => {
        return (filteredHistory || []).slice(0, page * PAGE_SIZE);
    }, [filteredHistory, page]);

    const handleLoadMore = () => {
        if ((filteredHistory || []).length > page * PAGE_SIZE) {
            setPage(p => p + 1);
        }
    };

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
                navigation.navigate('DoctorSlot', {
                    doctorDetails: {
                        ...item.doctor,
                        id: item.doctor?.doctor_id,
                        full_name: item.doctor?.doctor_name,
                        profile_image: item.doctor?.doctor_image,
                        designation: (item.doctor as any)?.qualification,
                    },
                    appointmentId: resolveAppointmentLookupId(item),
                });
                break;
        }
    };

    const renderItem = ({ item }: { item: Appointment }) => (
        <AppointmentCard item={item}  navigation={navigation} onAction={handleAction} />
    );

    const showSkeleton = loading && history.length === 0;

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

            <View style={styles.filtersBlock}>
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
                    style={styles.tabs}
                />
            </View>

            {showSkeleton ? (
                <AppointmentSkeletonList />
            ) : filteredHistory?.length === 0 ? (
                <EmptyState
                    title={history?.length === 0 ? 'No Appointments Yet' : 'Appointment Not Found'}
                    subtitle={
                        history?.length === 0
                            ? 'Your consultations will appear here.'
                            : 'Try another doctor name or clear filters.'
                    }
                />
            ) : (
                <FlatList
                    data={displayedHistory}
                    renderItem={renderItem}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    keyExtractor={(item, index) =>
                        String(
                            item?.consultation_id ??
                                `consult-${index}`,
                        )
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primaryColor]}
                            tintColor={Colors.primaryColor}
                        />
                    }
                    ListFooterComponent={
                        (filteredHistory || []).length > displayedHistory.length ? (
                            <View style={{ paddingVertical: 12 }} />
                        ) : null
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
    filtersBlock: {
        marginTop: SPACING.xs,
        marginBottom: SPACING.sm,
        gap: SPACING.sm,
    },
    tabs: {
        marginTop: 0,
    },
    listContent: {
        gap: SPACING.md,
        paddingBottom: SPACING.xxl,
        paddingTop: SPACING.xs,
    },
});
