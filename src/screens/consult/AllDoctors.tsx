import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
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
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { Ionicons } from '../../common/Vector';
import dayjs from 'dayjs';
import SectionHeader from '../../components/SectionHeader';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import AllDoctorCard from '../../components/AllDoctorCard';
import { Images } from '../../common/Images';

import * as _CONSULT_SERVICES
    from '../../services/ConsultServce';
import SearchBar from '../../components/SearchBar';
import { generateDates, formatDate } from '../../common/DataInterface';
import { useAllDoctors, useConsultData } from '../../hooks/useConsultData';
import EmptyState from '../../components/EmptyState';
import { useDebounce, } from '../../hooks/useDebaunce';
import { DoctorCardSkeleton } from '../../simmerScreen/ShimmerHook';
import FilterTabs from '../../components/FilterTab';

const TABS = [
    {
        key: 'speciality',
        label: 'Speciality',
    },
    {
        key: 'availability',
        label: 'Availability',
    },
    {
        key: 'experience',
        label: 'Experience',
    },
];

const EXPERIENCE_OPTIONS = [
    {
        label: '1+ Years',
        value: '1',
    },
    {
        label: '5+ Years',
        value: '5',
    },
    {
        label: '10+ Years',
        value: '10',
    },
    {
        label: '15+ Years',
        value: '15',
    },
    {
        label: '20+ Years',
        value: '20',
    },
];
const AVAILABILITY_OPTIONS = [
    {
        label: 'Today',
        value: 'today',
    },
    {
        label: 'Tomorrow',
        value: 'tomorrow',
    },
    {
        label: 'This Week',
        value: 'this_week',
    },
    {
        label: 'Next Week',
        value: 'next_week',
    },
    {
        label: 'This Month',
        value: 'this_month',
    },
    {
        label: 'Next Month',
        value: 'next_month',
    },
    {
        label: 'Select Date',
        value: 'custom_date',
    },
];



const AllDoctors = (props: any) => {
    const all =
        props?.route?.params?.all ??
        false;

    console.log("allllllllllll", all);


    const [search, setSearch] =
        useState('');

    // const debouncedFilters = useDebounce(selectedFilters, 500);

    const [showDatePicker, setShowDatePicker] =
        useState(false);
    const [showCustomDateOptions, setShowCustomDateOptions] =
        useState(false);
    const [datePickerTarget, setDatePickerTarget] =
        useState<'from' | 'to' | null>(null);
    const [activeTab, setActiveTab] = useState<string | null>(null);

    const [selectedFilters, setSelectedFilters] = useState({
        specialization: null,
        date_range: '',
        from_date: '',
        to_date: '',
        experience: '',
    });


    console.log("selectedFiltersselectedFilters", selectedFilters)
    const [showCalendar, setShowCalendar] = useState(false);
    const [tempFromDate, setTempFromDate] = useState<Date | null>(null);
    const [tempToDate, setTempToDate] = useState<Date | null>(null);

    const [calendarStep, setCalendarStep] = useState<'from' | 'to'>('from');

    const [selectedDateLabel, setSelectedDateLabel] = useState('');




    const { categories } = useConsultData();

    console.log("categories", categories)

    const apiFilters = useMemo(() => ({
        specialization: selectedFilters.specialization || '',
        experience: selectedFilters.experience || '',
        from_date: selectedFilters.from_date || '',
        to_date: selectedFilters.to_date || '',
    }), [selectedFilters]);

    const debouncedSearch =
        useDebounce(search);

    const applyDate = () => {
        if (!tempFromDate || !tempToDate) return;

        const from = dayjs(tempFromDate).format('YYYY-MM-DD');
        const to = dayjs(tempToDate).format('YYYY-MM-DD');

        setSelectedFilters(prev => ({
            ...prev,
            availabilityFrom: from,
            availabilityTo: to,
            availabilityValue: 'custom_date',
        }));

        setSelectedDateLabel(
            `${dayjs(tempFromDate).format('DD MMM')} - ${dayjs(tempToDate).format('DD MMM')}`
        );

        setShowCalendar(false);
    };

    const {
        loading,
        doctorData,
    } = useAllDoctors(
        apiFilters
        // selectedFilters,

        // search,
        // debouncedSearch
    );



    const FILTER_OPTIONS = useMemo(() => ({
        speciality: categories.map((c: any) => ({
            label: c.name,
            value: c.id,
        })),
        availability: AVAILABILITY_OPTIONS,
        experience: EXPERIENCE_OPTIONS,
    }), [categories]);




    const applyDateRange = (from: string, to: string) => {
        setSelectedFilters(prev => ({
            ...prev,
            availabilityFrom: from,
            availabilityTo: to,
        }));

        setSelectedDateLabel(`${from} - ${to}`);
    };

    const dropdownOptions = useMemo(() => {
        if (!activeTab) return [];

        const map: any = {
            speciality: FILTER_OPTIONS.speciality,
            experience: FILTER_OPTIONS.experience,
            availability: FILTER_OPTIONS.availability,
        };

        return map[activeTab] || [];
    }, [activeTab, FILTER_OPTIONS]);


    const clearFilter =
        useCallback(
            (key: string) => {
                setSelectedFilters(
                    (prev: any) => ({
                        ...prev,
                        speciality:
                            key === 'speciality'
                                ? null
                                : prev.speciality,
                        availabilityValue:
                            key === 'availability'
                                ? ''
                                : prev.availabilityValue,
                        availabilityFrom:
                            key === 'availability'
                                ? ''
                                : prev.availabilityFrom,
                        availabilityTo:
                            key === 'availability'
                                ? ''
                                : prev.availabilityTo,
                        experience:
                            key === 'experience'
                                ? ''
                                : prev.experience,
                    }),
                );

                if (key === 'availability') {
                    setSelectedDateLabel('');
                    setShowCustomDateOptions(false);
                }
            },
            [],
        );

    const getAvailabilityLabel = () => {
        if (selectedDateLabel) {
            return selectedDateLabel;
        }

        const selectedOption =
            AVAILABILITY_OPTIONS.find(
                item =>
                    item.value ===
                    selectedFilters?.date_range,
            );

        return (
            selectedOption?.label ||
            'Availability'
        );
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
            (doctorId: string) => {
                props.navigation.navigate(
                    'DoctorProfile',
                    { doctorId }
                );
            },
            [props.navigation],
        );


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

    const renderDoctorItem =
        useCallback(
            ({ item }: any) => (

                <AllDoctorCard
                    item={item}
                    onPress={() =>
                        handleDoctorPress(item.id)
                    }
                />

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
                    title=""
                    leftIcon={Images.backIcon}
                    onLeftPress={() =>
                        props.navigation.goBack()
                    }
                    rightIcon={Images.Bell}
                />

                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                    <SearchBar
                        placeholder="Search doctors..."
                        value={search}
                        onChangeText={
                            setSearch
                        }

                        icon={require('../../assets/images/Search.png')}
                    />

                    <FilterTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        selectedFilters={selectedFilters}
                        setSelectedFilters={setSelectedFilters}
                        clearFilter={clearFilter}
                        dropdownOptions={dropdownOptions}
                        getTabLabel={getTabLabel}
                        setTempFromDate={setTempFromDate}
                        setTempToDate={setTempToDate}
                        setCalendarStep={setCalendarStep}
                        setShowCalendar={setShowCalendar}
                        getPresetDates={getPresetDates}
                    />

                    {loading ?
                        <DoctorCardSkeleton />

                        : <FlatList
                            data={doctorData}
                            keyExtractor={(item) =>
                                String(item?.id)
                            }

                            showsVerticalScrollIndicator={
                                false
                            }

                            contentContainerStyle={
                                styles.listContent
                            }


                            renderItem={renderDoctorItem}

                            ItemSeparatorComponent={() => (
                                <View
                                    style={{
                                        height: 14,
                                    }}
                                />
                            )}

                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            removeClippedSubviews
                            updateCellsBatchingPeriod={50}
                            ListEmptyComponent={() => (

                                <EmptyState image={Images.doctorImage} title='No doctor found' />
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
                                    } else {
                                        setTempToDate(date);
                                    }
                                }}
                            />

                            {/* ACTION BUTTONS */}
                            <View style={styles.modalActions}>

                                <TouchableOpacity
                                    style={styles.modalBtnCancel}
                                    onPress={() => {
                                        setShowCalendar(false);
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
                                            availabilityFrom: from,
                                            availabilityTo: to,
                                            availabilityValue: 'custom_date',
                                        }));

                                        setSelectedDateLabel(`${from} - ${to}`);
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

    listContent: {
        // paddingHorizontal: 20,
        paddingBottom: 120,
    },

    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },

    tabsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },

    tabWrapper: {
        flex: 1,
        position: 'relative', // 👈 IMPORTANT
    },

    tabs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },

    tabBtn: {
        width: '100%',   // 👈 force equal width inside wrapper
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#fff',
    },
    dropdownWrapper: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        maxHeight: 200,
        paddingHorizontal: 20,
        // elevation: 8,
        // zIndex: 999,
    },

    option: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    activeTab: {
        backgroundColor:
            Colors.primaryColor,

        borderColor:
            Colors.primaryColor,


    },

    tabText: {
        flexShrink: 1,

        fontSize: 13,

        fontFamily:
            Fonts.PoppinsMedium,

        color: '#0F172A',

        marginRight: 6,
    },



    activeTabText: {
        color: '#fff',
    },


    dropdown: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: 180,
        zIndex: 999,
        elevation: 5,
    },

    dropdownScroll: {
        maxHeight: 260,
    },

    dropdownContent: {
        paddingVertical: 6,
    },


    optionText: {
        fontSize: 14,
        fontFamily:
            Fonts.PoppinsMedium,

        color: '#1E293B',
    },

    customDatePanel: {
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
    },

    dateButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 12,
    },

    dateButtonText: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: '#0F172A',
    },

    dropdownList: {
        maxHeight: 220,
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

    applyButton: {
        backgroundColor: Colors.primaryColor,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },

    applyButtonText: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: '#FFFFFF',
    },

    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },

    emptyText: {
        fontSize: 15,
        color: '#64748B',
        fontFamily:
            Fonts.PoppinsMedium,
    },
});