import React, {
    useCallback,
    useMemo,
    useState,
} from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Modal,
    RefreshControl,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { Ionicons } from '../../common/Vector';
import dayjs from 'dayjs';
import SectionHeader from '../../components/SectionHeader';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import AllDoctorCard from '../../components/AllDoctorCard';
import { Images } from '../../common/Images';
import { doctorListKey } from '../../utils/listKeys';
import {
    DOCTOR_GRID,
    getDoctorGridCardWidth,
} from '../../constants/doctorGridLayout';

import * as _CONSULT_SERVICES
    from '../../services/ConsultServce';
import { ExpandableSearch } from '../../components/SearchBar';
import { generateDates, formatDate, AVAILABILITY_OPTIONS, EXPERIENCE_OPTIONS } from '../../common/DataInterface';
import { useAllDoctors, useConsultData } from '../../hooks/useConsultData';
import EmptyState from '../../components/EmptyState';
import { useDebounce, } from '../../hooks/useDebaunce';
import { TopDoctorsCardSkeleton } from '../../simmerScreen/ShimmerHook';
import FilterTabs from '../../components/FilterTab';

type SelectedFilters = {
    specialization: string | null;
    date_range: string;
    from_date: string;
    to_date: string;
    experience: string;
};

type HubSection = 'doctors' | 'products' | 'diet';

const HUB_SECTIONS: Array<{ key: HubSection; label: string }> = [
    { key: 'doctors', label: 'Doctors' },
    { key: 'products', label: 'Products' },
    { key: 'diet', label: 'Diet' },
];

const CARD_W = getDoctorGridCardWidth();

const AllDoctors = (props: any) => {
    const insets = useSafeAreaInsets();
    const all = props?.route?.params?.all ?? false;
    const initialSpecialization =
        props?.route?.params?.specialization != null &&
        String(props.route.params.specialization).trim() !== ''
            ? String(props.route.params.specialization)
            : null;
    const initialHealthCategoryId =
        props?.route?.params?.health_category_id != null &&
        String(props.route.params.health_category_id).trim() !== ''
            ? String(props.route.params.health_category_id)
            : null;
    const initialHealthDiseaseId =
        props?.route?.params?.health_disease_id != null &&
        String(props.route.params.health_disease_id).trim() !== ''
            ? String(props.route.params.health_disease_id)
            : null;

    const [activeTab, setActiveTab] = useState<string | null>(null);

    const [selectedFilters, setSelectedFilters] =
        useState<SelectedFilters>({
            specialization: initialSpecialization,
            date_range: '',
            from_date: '',
            to_date: '',
            experience: '',
        });

    const [showCalendar, setShowCalendar] = useState(false);
    const [tempFromDate, setTempFromDate] = useState<Date | null>(null);
    const [tempToDate, setTempToDate] = useState<Date | null>(null);
    const [calendarStep, setCalendarStep] = useState<'from' | 'to'>('from');
    const [selectedDateLabel, setSelectedDateLabel] = useState('');
    const [searchText, setSearchText] = useState('');
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [hubSection, setHubSection] = useState<HubSection>('doctors');

    const { categories } = useConsultData({
        fetchCategories: true,
        fetchDoctors: false,
    });

    const debouncedSearch = useDebounce(searchText, 400);

    const apiFilters = useMemo(
        () => ({
            specialization: selectedFilters.specialization || undefined,
            experience: selectedFilters.experience || undefined,
            from_date: selectedFilters.from_date || undefined,
            to_date: selectedFilters.to_date || undefined,
            search: debouncedSearch.trim() || undefined,
            health_category_id: initialHealthCategoryId || undefined,
            health_disease_id: initialHealthDiseaseId || undefined,
        }),
        [
            selectedFilters.specialization,
            selectedFilters.experience,
            selectedFilters.from_date,
            selectedFilters.to_date,
            debouncedSearch,
            initialHealthCategoryId,
            initialHealthDiseaseId,
        ],
    );

    const { loading, doctorData, refresh, refreshing } = useAllDoctors(apiFilters);
    const handleTabPress = (tab: string | null) => {
        setActiveTab(prev => (prev === tab ? null : tab));
    };
    const FILTER_OPTIONS = useMemo(() => ({
        speciality: categories.map((c: any) => ({
            label: c.name,
            value: c.id,
        })),
        availability: AVAILABILITY_OPTIONS,
        experience: EXPERIENCE_OPTIONS,
    }), [categories]);


    const dropdownOptions = useMemo(() => {
        if (!activeTab) return [];

        const map: any = {
            speciality: FILTER_OPTIONS.speciality,
            experience: FILTER_OPTIONS.experience,
            availability: FILTER_OPTIONS.availability,
        };

        return map[activeTab] || [];
    }, [activeTab, FILTER_OPTIONS]);


    const clearFilter = useCallback((key: string) => {
        setSelectedFilters(prev => ({
            ...prev,
            specialization:
                key === 'speciality'
                    ? null
                    : prev.specialization,

            date_range:
                key === 'availability'
                    ? ''
                    : prev.date_range,

            from_date:
                key === 'availability'
                    ? ''
                    : prev.from_date,

            to_date:
                key === 'availability'
                    ? ''
                    : prev.to_date,

            experience:
                key === 'experience'
                    ? ''
                    : prev.experience,
        }));

        if (key === 'availability') {
            setSelectedDateLabel('');
        }

        setActiveTab(null);
    }, []);


    const getPresetDates = (type: string) => {
        const today = dayjs();

        switch (type) {
            case 'today':
                return {
                    from: today.format('YYYY-MM-DD'),
                    to: today.format('YYYY-MM-DD'),
                };

            case 'tomorrow':
                return {
                    from: today.add(1, 'day').format('YYYY-MM-DD'),
                    to: today.add(1, 'day').format('YYYY-MM-DD'),
                };

            case 'this_week':
                return {
                    from: today.startOf('week').format('YYYY-MM-DD'),
                    to: today.endOf('week').format('YYYY-MM-DD'),
                };

            case 'next_week':
                return {
                    from: today.add(1, 'week').startOf('week').format('YYYY-MM-DD'),
                    to: today.add(1, 'week').endOf('week').format('YYYY-MM-DD'),
                };

            case 'this_month':
                return {
                    from: today.startOf('month').format('YYYY-MM-DD'),
                    to: today.endOf('month').format('YYYY-MM-DD'),
                };

            case 'next_month':
                return {
                    from: today.add(1, 'month').startOf('month').format('YYYY-MM-DD'),
                    to: today.add(1, 'month').endOf('month').format('YYYY-MM-DD'),
                };

            default:
                return { from: '', to: '' };
        }
    };

    const getTabLabel = (tab: any) => {
        if (tab.key === 'speciality') {
            const found = categories.find(c => c.id === selectedFilters.specialization);
            return found?.name || 'Speciality';
        }

        if (tab.key === 'experience') {
            const found = EXPERIENCE_OPTIONS.find(i => i.value === selectedFilters.experience);
            return found?.label || 'Experience';
        }

        if (tab.key === 'availability') {
            if (selectedFilters.date_range === 'custom_date') {
                return selectedDateLabel || 'Select Date';
            }

            const selected = AVAILABILITY_OPTIONS.find(
                i => i.value === selectedFilters.date_range
            );

            return selected?.label || 'Availability';
        }

        return tab.label;
    };


    const handleDoctorPress =
        useCallback(
            (doctorData: string) => {
                props.navigation.navigate(
                    'DoctorProfile',
                    { doctorData }
                );
            },
            [props.navigation],
        );

    const handleHubSectionPress = useCallback(
        (section: HubSection) => {
            if (section === 'doctors') {
                setHubSection('doctors');
                return;
            }
            if (section === 'products') {
                props.navigation.navigate('ProductsScreen');
                return;
            }
            props.navigation.navigate('DietScreen');
        },
        [props.navigation],
    );

    const renderDoctorItem =
        useCallback(
            ({ item }: any) => (
                <View style={styles.cardWrap}>
                    <AllDoctorCard
                        item={item}
                        variant="grid"
                        cardWidth={CARD_W}
                        onPress={() => handleDoctorPress(item)}
                    />
                </View>
            ),
            [handleDoctorPress],
        );






    return (
        <>
            <SafeAreaView
                style={styles.container}
            >

                <StatusBar
                    barStyle={'dark-content'}
                    backgroundColor={
                        Colors.white
                    }
                />

                <View style={styles.headerWrap}>
                    <AppHeader
                        title="Explore"
                        leftIconName='arrow-left'
                        onLeftPress={() =>
                            props.navigation.goBack()
                        }
                        onSearchPress={() => setSearchExpanded(true)}
                    />
                </View>

                <View style={styles.body}>
                    <View style={styles.hubRow}>
                        {HUB_SECTIONS.map(section => {
                            const active = hubSection === section.key;
                            return (
                                <TouchableOpacity
                                    key={section.key}
                                    activeOpacity={0.85}
                                    onPress={() => handleHubSectionPress(section.key)}
                                    style={[
                                        styles.hubChip,
                                        active && styles.hubChipActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.hubChipText,
                                            active && styles.hubChipTextActive,
                                        ]}
                                    >
                                        {section.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <ExpandableSearch
                        placeholder="Search doctors..."
                        value={searchText}
                        onChangeText={setSearchText}
                        showTrigger={false}
                        expanded={searchExpanded}
                        onExpandedChange={setSearchExpanded}
                    />

                    <FilterTabs
                        activeTab={activeTab}
                        setActiveTab={handleTabPress}
                        selectedFilters={selectedFilters}
                        setSelectedFilters={setSelectedFilters}
                        clearFilter={clearFilter}
                        dropdownOptions={dropdownOptions}
                        getTabLabel={getTabLabel}
                        setTempFromDate={setTempFromDate}
                        setTempToDate={setTempToDate}
                        setCalendarStep={setCalendarStep}
                        getPresetDates={getPresetDates}
                        setShowCalendar={setShowCalendar}
                    />

                    {loading ?
                        <TopDoctorsCardSkeleton count={6} />

                        : <FlatList
                            data={doctorData}
                            keyExtractor={(item, index) =>
                                doctorListKey(item, index)
                            }
                            numColumns={2}
                            columnWrapperStyle={styles.columnWrap}
                            showsVerticalScrollIndicator={
                                false
                            }
                            contentContainerStyle={[
                                styles.listContent,
                                { paddingBottom: insets.bottom + 24 },
                            ]}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={refresh}
                                    colors={[Colors.primaryColor]}
                                    tintColor={Colors.primaryColor}
                                />
                            }
                            renderItem={renderDoctorItem}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            removeClippedSubviews
                            updateCellsBatchingPeriod={50}
                            ListEmptyComponent={() => (
                                <EmptyState
                                    image={Images.doctorImage}
                                    title="No doctor found"
                                    subtitle="Try adjusting your filters or search."
                                    imageSize={48}
                                />
                            )}
                        />}
                </View>


            </SafeAreaView>

            {showCalendar && (
                <Modal transparent animationType="fade">
                    <View style={styles.modalOverlay}>

                        <View style={styles.modalBox}>

                            <Text style={styles.modalTitle}>
                                {calendarStep === 'from'
                                    ? 'Select Start Date'
                                    : 'Select End Date'}
                            </Text>

                            {/* DATE PICKER */}
                            <DateTimePicker
                                value={new Date()}
                                mode="date"
                                display="calendar"
                                onChange={(event, date) => {
                                    if (!date) return;

                                    if (calendarStep === 'from') {
                                        setTempFromDate(date);
                                        setCalendarStep('to');
                                        return;
                                    }

                                    setTempToDate(date);
                                }}
                            />

                            {/* ACTION BUTTONS */}
                            <View style={styles.modalActions}>

                                <TouchableOpacity
                                    style={styles.modalBtnCancel}
                                    onPress={() => {
                                        setShowCalendar(false);
                                        setCalendarStep('from');
                                        setTempFromDate(null);
                                        setTempToDate(null);
                                    }}
                                >
                                    <Text style={{ color: 'red' }}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modalBtnApply}
                                    onPress={() => {
                                        if (!tempFromDate || !tempToDate) return;

                                        const from = dayjs(tempFromDate).format('YYYY-MM-DD');
                                        const to = dayjs(tempToDate).format('YYYY-MM-DD');
                                        setSelectedFilters(prev => ({
                                            ...prev,
                                            date_range: 'custom_date',
                                            from_date: from,
                                            to_date: to,
                                        }));

                                        setSelectedDateLabel(`${from} - ${to}`);
                                        setCalendarStep('from');
                                        setShowCalendar(false);
                                    }}
                                >
                                    <Text style={{ color: '#fff' }}>Apply</Text>
                                </TouchableOpacity>

                            </View>

                        </View>
                    </View>
                </Modal>
            )}

        </>


    );
};

export default AllDoctors;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    body: {
        flex: 1,
        marginTop:10,
        paddingHorizontal: 20,
    },

    headerWrap: {
        paddingHorizontal: 20,
    },

    listContent: {
        paddingBottom: 120,
    },

    hubRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },

    hubChip: {
        flex: 1,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    hubChipActive: {
        backgroundColor: '#ECFDF5',
        borderColor: Colors.primaryColor,
    },

    hubChipText: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    hubChipTextActive: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    columnWrap: {
        justifyContent: 'space-between',
        marginBottom: DOCTOR_GRID.gap,
    },

    cardWrap: {
        width: CARD_W,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBox: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        elevation: 10,
    },

    modalTitle: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
        color: '#0F172A',
        marginBottom: 12,
        textAlign: 'center',
    },

    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },

    modalBtnCancel: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },

    modalBtnApply: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
    },

});