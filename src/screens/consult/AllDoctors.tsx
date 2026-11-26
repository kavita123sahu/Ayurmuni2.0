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
    Modal,
    RefreshControl,
    Pressable,
    Keyboard,
    Platform,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { Ionicons } from '../../common/Vector';
import dayjs from 'dayjs';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import AllDoctorCard from '../../components/AllDoctorCard';
import { doctorListKey } from '../../utils/listKeys';
import {
    DOCTOR_GRID,
    getDoctorGridCardWidth,
} from '../../constants/doctorGridLayout';

import { ExpandableSearch } from '../../components/SearchBar';
import {
    AVAILABILITY_OPTIONS,
    EXPERIENCE_OPTIONS,
    TIME_PRESETS,
    getTimeWindowLabel,
    isValidTimeWindow,
} from '../../common/DataInterface';
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
    start_time: string;
    end_time: string;
};

const formatHHmm = (date: Date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
};

const parseHHmm = (value: string, fallbackHour = 9, fallbackMinute = 0) => {
    const d = new Date();
    const [hRaw, mRaw] = String(value || '').split(':');
    const h = Number(hRaw);
    const m = Number(mRaw);
    d.setHours(
        Number.isFinite(h) ? h : fallbackHour,
        Number.isFinite(m) ? m : fallbackMinute,
        0,
        0,
    );
    return d;
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
            start_time: '',
            end_time: '',
        });

    const [showCalendar, setShowCalendar] = useState(false);
    const [tempFromDate, setTempFromDate] = useState<Date | null>(null);
    const [tempToDate, setTempToDate] = useState<Date | null>(null);
    const [calendarStep, setCalendarStep] = useState<'from' | 'to'>('from');
    const [selectedDateLabel, setSelectedDateLabel] = useState('');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempFromTime, setTempFromTime] = useState('');
    const [tempToTime, setTempToTime] = useState('');
    const [timePickerTarget, setTimePickerTarget] = useState<'from' | 'to' | null>(null);
    const [searchText, setSearchText] = useState('');
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [hubSection, setHubSection] = useState<HubSection>('doctors');

    const { categories } = useConsultData({
        fetchCategories: true,
        fetchDoctors: false,
    });

    const debouncedSearch = useDebounce(searchText, 400);

    const timeWindowValid = isValidTimeWindow(
        selectedFilters.start_time,
        selectedFilters.end_time,
    );

    const apiFilters = useMemo(
        () => ({
            specialization: selectedFilters.specialization || undefined,
            experience: selectedFilters.experience || undefined,
            from_date: selectedFilters.from_date || undefined,
            to_date: selectedFilters.to_date || undefined,
            ...(timeWindowValid
                ? {
                    start_time: selectedFilters.start_time,
                    end_time: selectedFilters.end_time,
                }
                : {}),
            search: debouncedSearch.trim() || undefined,
            health_category_id: initialHealthCategoryId || undefined,
            health_disease_id: initialHealthDiseaseId || undefined,
        }),
        [
            selectedFilters.specialization,
            selectedFilters.experience,
            selectedFilters.from_date,
            selectedFilters.to_date,
            selectedFilters.start_time,
            selectedFilters.end_time,
            timeWindowValid,
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
        available_time: TIME_PRESETS.map(item => ({
            label: item.label,
            value: item.value,
            start: item.start,
            end: item.end,
        })),
        experience: EXPERIENCE_OPTIONS,
    }), [categories]);

    const dropdownOptions = useMemo(() => {
        if (!activeTab) return [];

        const map: any = {
            speciality: FILTER_OPTIONS.speciality,
            experience: FILTER_OPTIONS.experience,
            availability: FILTER_OPTIONS.availability,
            available_time: FILTER_OPTIONS.available_time,
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

            start_time:
                key === 'available_time'
                    ? ''
                    : prev.start_time,

            end_time:
                key === 'available_time'
                    ? ''
                    : prev.end_time,
        }));

        if (key === 'availability') {
            setSelectedDateLabel('');
        }

        setActiveTab(null);
    }, []);

    const clearAllFilters = useCallback(() => {
        setSelectedFilters(prev => ({
            ...prev,
            specialization: null,
            date_range: '',
            from_date: '',
            to_date: '',
            experience: '',
            start_time: '',
            end_time: '',
        }));
        setSelectedDateLabel('');
        setActiveTab(null);
    }, []);

    const activeFilterChips = useMemo(() => {
        const chips: Array<{ key: string; label: string; onClear: () => void }> = [];

        if (selectedFilters.specialization) {
            const found = categories.find(c => c.id === selectedFilters.specialization);
            chips.push({
                key: 'speciality',
                label: found?.name || 'Speciality',
                onClear: () => clearFilter('speciality'),
            });
        }

        if (selectedFilters.date_range) {
            const label =
                selectedFilters.date_range === 'custom_date'
                    ? selectedDateLabel || 'Custom dates'
                    : AVAILABILITY_OPTIONS.find(
                        i => i.value === selectedFilters.date_range,
                    )?.label || 'Availability';
            chips.push({
                key: 'availability',
                label,
                onClear: () => clearFilter('availability'),
            });
        }

        if (timeWindowValid) {
            chips.push({
                key: 'available_time',
                label:
                    getTimeWindowLabel(
                        selectedFilters.start_time,
                        selectedFilters.end_time,
                    ) ||
                    `${selectedFilters.start_time}–${selectedFilters.end_time}`,
                onClear: () => clearFilter('available_time'),
            });
        }

        if (selectedFilters.experience) {
            chips.push({
                key: 'experience',
                label:
                    EXPERIENCE_OPTIONS.find(
                        i => i.value === selectedFilters.experience,
                    )?.label || 'Experience',
                onClear: () => clearFilter('experience'),
            });
        }

        return chips;
    }, [
        categories,
        clearFilter,
        selectedDateLabel,
        selectedFilters.date_range,
        selectedFilters.end_time,
        selectedFilters.experience,
        selectedFilters.specialization,
        selectedFilters.start_time,
        timeWindowValid,
    ]);

    const openCustomTimePicker = useCallback(() => {
        setTempFromTime(selectedFilters.start_time || '09:00');
        setTempToTime(selectedFilters.end_time || '12:00');
        setTimePickerTarget(null);
        setShowTimePicker(true);
    }, [selectedFilters.end_time, selectedFilters.start_time]);

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

        if (tab.key === 'available_time') {
            if (
                isValidTimeWindow(
                    selectedFilters.start_time,
                    selectedFilters.end_time,
                )
            ) {
                return (
                    getTimeWindowLabel(
                        selectedFilters.start_time,
                        selectedFilters.end_time,
                    ) || 'Time'
                );
            }
            return 'Time';
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

                    <AppHeader
                        title="Explore"
                        leftIconName='arrow-left'
                        onLeftPress={() =>
                            props.navigation.goBack()
                        }
                        onSearchPress={() => setSearchExpanded(true)}
                    />
                {/* </View> */}

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
                        setShowTimePicker={open => {
                            if (open) openCustomTimePicker();
                            else {
                                setShowTimePicker(false);
                                setTimePickerTarget(null);
                            }
                        }}
                    />

                    {activeFilterChips.length > 0 ? (
                        <View style={styles.activeFiltersRow}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.chipScroll}
                            >
                                {activeFilterChips.map(chip => (
                                    <View key={chip.key} style={styles.filterChip}>
                                        <Text style={styles.filterChipText} numberOfLines={1}>
                                            {chip.label}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={chip.onClear}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Clear ${chip.label}`}
                                        >
                                            <Ionicons name="close" size={14} color="#0F172A" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                            <TouchableOpacity
                                onPress={clearAllFilters}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                style={styles.clearAllBtn}
                            >
                                <Text style={styles.clearAllText}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

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
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                            onScrollBeginDrag={Keyboard.dismiss}
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
                                    title="No doctor found"
                                    subtitle="Try adjusting your filters or search."
                                    imageSize={48}
                                />
                            )}
                        />}
                </View>

            </SafeAreaView>

            {showCalendar && (
                <Modal transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => {
                            setShowCalendar(false);
                            setCalendarStep('from');
                            setTempFromDate(null);
                            setTempToDate(null);
                        }}
                    >
                        <Pressable style={styles.modalBox} onPress={e => e.stopPropagation?.()}>

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

                        </Pressable>
                    </Pressable>
                </Modal>
            )}

            {showTimePicker && (
                <Modal
                    transparent
                    animationType="fade"
                    onRequestClose={() => {
                        setShowTimePicker(false);
                        setTimePickerTarget(null);
                    }}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => {
                            setShowTimePicker(false);
                            setTimePickerTarget(null);
                        }}
                    >
                        <Pressable
                            style={styles.modalBox}
                            onPress={e => e.stopPropagation?.()}
                        >
                            <Text style={styles.modalTitle}>Custom time</Text>
                            <Text style={styles.timeHint}>
                                Choose From and To. Both are required, and To must be after From.
                            </Text>

                            <View style={styles.timeRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.timeField,
                                        timePickerTarget === 'from' && styles.timeFieldActive,
                                    ]}
                                    onPress={() => setTimePickerTarget('from')}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.timeFieldLabel}>From</Text>
                                    <Text style={styles.timeFieldValue}>
                                        {tempFromTime || 'HH:mm'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.timeField,
                                        timePickerTarget === 'to' && styles.timeFieldActive,
                                    ]}
                                    onPress={() => setTimePickerTarget('to')}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.timeFieldLabel}>To</Text>
                                    <Text style={styles.timeFieldValue}>
                                        {tempToTime || 'HH:mm'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {timePickerTarget ? (
                                <DateTimePicker
                                    value={
                                        timePickerTarget === 'from'
                                            ? parseHHmm(tempFromTime, 9, 0)
                                            : parseHHmm(tempToTime, 12, 0)
                                    }
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    is24Hour
                                    onChange={(_event, date) => {
                                        if (!date) {
                                            if (Platform.OS === 'android') {
                                                setTimePickerTarget(null);
                                            }
                                            return;
                                        }
                                        const next = formatHHmm(date);
                                        if (timePickerTarget === 'from') {
                                            setTempFromTime(next);
                                        } else {
                                            setTempToTime(next);
                                        }
                                        if (Platform.OS === 'android') {
                                            setTimePickerTarget(null);
                                        }
                                    }}
                                />
                            ) : null}

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.modalBtnCancel}
                                    onPress={() => {
                                        setShowTimePicker(false);
                                        setTimePickerTarget(null);
                                    }}
                                >
                                    <Text style={{ color: 'red' }}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.modalBtnApply,
                                        !isValidTimeWindow(tempFromTime, tempToTime) &&
                                            styles.modalBtnDisabled,
                                    ]}
                                    disabled={!isValidTimeWindow(tempFromTime, tempToTime)}
                                    onPress={() => {
                                        if (!isValidTimeWindow(tempFromTime, tempToTime)) {
                                            return;
                                        }
                                        setSelectedFilters(prev => ({
                                            ...prev,
                                            start_time: tempFromTime,
                                            end_time: tempToTime,
                                        }));
                                        setShowTimePicker(false);
                                        setTimePickerTarget(null);
                                    }}
                                >
                                    <Text style={{ color: '#fff' }}>Apply</Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            )}

        </>

    );
};

export default AllDoctors;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    body: {
        flex: 1,
        marginTop: 6,
        paddingHorizontal: 16,
        gap: 8,
    },

    headerWrap: {
        paddingHorizontal: 20,
    },

    listContent: {
        paddingBottom: 120,
        paddingTop: 4,
    },

    hubRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 0,
    },

    hubChip: {
        flex: 1,
        height: 32,
        minHeight: 32,
        borderRadius: 10,
        paddingHorizontal: 8,
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
        fontSize: 12,
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

    modalBtnDisabled: {
        opacity: 0.45,
    },

    activeFiltersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minHeight: 28,
    },

    chipScroll: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingRight: 4,
    },

    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        maxWidth: 160,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },

    filterChipText: {
        flexShrink: 1,
        fontSize: 11,
        lineHeight: 14,
        color: '#065F46',
        fontFamily: Fonts.PoppinsMedium,
    },

    clearAllBtn: {
        paddingVertical: 4,
        paddingHorizontal: 2,
    },

    clearAllText: {
        fontSize: 12,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    timeHint: {
        fontSize: 12,
        lineHeight: 16,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
        textAlign: 'center',
        marginBottom: 14,
    },

    timeRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 8,
    },

    timeField: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#F8FAFC',
    },

    timeFieldActive: {
        borderColor: Colors.primaryColor,
        backgroundColor: '#ECFDF5',
    },

    timeFieldLabel: {
        fontSize: 11,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 2,
    },

    timeFieldValue: {
        fontSize: 15,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

});