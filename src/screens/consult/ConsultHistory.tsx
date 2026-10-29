import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    View,
    StyleSheet,
    FlatList,
    StatusBar,
    RefreshControl,
    Text,
    ActivityIndicator,
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
    { key: 'last_6_months', label: 'Last 6 Months' },
] as const;

type Tab = (typeof TABS)[number]['key'];

const PAGE_SIZE = 20;

const ConsultHistory = (props: any) => {
    const navigation = useNavigation<any>();
    const [searchText, setSearchText] = useState('');
    const [searchExpanded, setSearchExpanded] = useState(false);
    const debouncedSearch = useDebounce(searchText, 400);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('all');
    const [history, setHistory] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);

    const historyLenRef = useRef(0);
    const pageRef = useRef(1);
    const hasMoreRef = useRef(true);
    const loadingMoreRef = useRef(false);

    useEffect(() => {
        historyLenRef.current = history.length;
    }, [history.length]);

    const fetchConsultHistory = useCallback(
        async (period: Tab, pageNo = 1, opts?: { refresh?: boolean; loadMore?: boolean }) => {
            const isRefresh = !!opts?.refresh;
            const isLoadMore = !!opts?.loadMore;

            try {
                if (isLoadMore) {
                    if (loadingMoreRef.current || !hasMoreRef.current) {
                        return;
                    }
                    loadingMoreRef.current = true;
                    setLoadingMore(true);
                } else if (!isRefresh) {
                    setLoading(historyLenRef.current === 0);
                }

                const response = await getConsultHistory({
                    period,
                    page: pageNo,
                    page_size: PAGE_SIZE,
                });

                const results = response?.data?.results || [];
                const nextExists = !!response?.data?.next;
                const canLoadMore = nextExists && results.length > 0;

                setHistory(prev => (isLoadMore ? [...prev, ...results] : results));
                pageRef.current = pageNo;
                hasMoreRef.current = canLoadMore;
                setHasMore(canLoadMore);
            } catch (error) {
                console.log('CONSULT HISTORY ERROR => ', error);
                if (!isLoadMore) {
                    setHistory([]);
                    hasMoreRef.current = false;
                    setHasMore(false);
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
                setLoadingMore(false);
                loadingMoreRef.current = false;
            }
        },
        [],
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setHasMore(true);
        fetchConsultHistory(activeTab, 1, { refresh: true });
    }, [activeTab, fetchConsultHistory]);

    const onLoadMore = useCallback(() => {
        if (loadingMoreRef.current || !hasMoreRef.current || loading) {
            return;
        }
        fetchConsultHistory(activeTab, pageRef.current + 1, { loadMore: true });
    }, [activeTab, fetchConsultHistory, loading]);

    const filteredHistory = useMemo(() => {
        // Hide internal / unfinished statuses from patient history.
        const HIDDEN = new Set(['testing', 'test', 'draft']);
        const base = (history || []).filter((item: any) => {
            const status = String(
                item?.status || item?.appointment_status || '',
            )
                .toLowerCase()
                .trim();
            return !HIDDEN.has(status);
        });

        // Clear must apply immediately — don't wait for debounce
        const keyword = (
          searchText.trim() === '' ? '' : debouncedSearch
        )
          .trim()
          .toLowerCase();
        if (!keyword) return base;

        return base.filter((item: any) => {
            const doctorName = item?.doctor?.doctor_name?.toLowerCase?.() || '';
            const concern = item?.concern?.toLowerCase?.() || '';
            const status = String(item?.status || item?.appointment_status || '').toLowerCase();
            return (
                doctorName.includes(keyword) ||
                concern.includes(keyword) ||
                status.includes(keyword)
            );
        });
    }, [history, debouncedSearch, searchText]);

    useEffect(() => {
        pageRef.current = 1;
        hasMoreRef.current = true;
        setHasMore(true);
        setHistory([]);
        fetchConsultHistory(activeTab, 1);
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
                    data={filteredHistory}
                    renderItem={renderItem}
                    keyExtractor={(item, index) =>
                        String(
                            item?.consultation_id ??
                                `consult-${index}`,
                        )
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    onEndReached={onLoadMore}
                    onEndReachedThreshold={0.4}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primaryColor]}
                            tintColor={Colors.primaryColor}
                        />
                    }
                    ListFooterComponent={
                        loadingMore ? (
                            <View style={styles.footerLoader}>
                                <ActivityIndicator
                                    size="small"
                                    color={Colors.primaryColor}
                                />
                            </View>
                        ) : hasMore ? (
                            <Text style={styles.footerHint}>Scroll for more</Text>
                        ) : history.length > PAGE_SIZE ? (
                            <Text style={styles.footerHint}>You're all caught up</Text>
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
        marginTop: 2,
        marginBottom: 4,
        gap: 6,
    },
    tabs: {
        marginTop: 0,
        marginBottom: 0,
    },
    listContent: {
        gap: SPACING.sm,
        paddingBottom: SPACING.xxl,
        paddingTop: 4,
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    footerHint: {
        textAlign: 'center',
        paddingVertical: 12,
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },
});
