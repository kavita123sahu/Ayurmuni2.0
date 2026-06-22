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

type SelectedFilters = {
    specialization: string | null;
    date_range: string;
    from_date: string;
    to_date: string;
    experience: string;
};
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
    const all = props?.route?.params?.all ?? false;


    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<string | null>(null);

    useEffect(() => {
        console.log("PARENT ACTIVE TAB CHANGED =>", activeTab);
    }, [activeTab]);

    const [selectedFilters, setSelectedFilters] =
        useState<SelectedFilters>({
            specialization: null,
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

    const { categories } = useConsultData();

    const apiFilters = useMemo(() => ({
        specialization: selectedFilters.specialization || '',
        experience: selectedFilters.experience || '',
        from_date: selectedFilters.from_date || '',
        to_date: selectedFilters.to_date || '',
    }), [selectedFilters]);

    const debouncedFilters = useDebounce(apiFilters, 500);

    const {
        loading,
        doctorData,
    } = useAllDoctors(debouncedFilters);

    console.log('doctorDatadoctorData', doctorData)
    const handleTabPress = (tab: string | null) => {
        console.log("CLICKED =>", tab);

        setActiveTab(prev => {
            const next = prev === tab ? null : tab;

            console.log("PREV =>", prev);
            console.log("NEXT =>", next);

            return next;
        });
    };


    console.log("RENDER activeTab =>", activeTab);
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



    const renderDoctorItem =
        useCallback(
            ({ item }: any) => (

                <AllDoctorCard
                    item={item}
                    onPress={() =>
                        handleDoctorPress(item)
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

                                <EmptyState image={Images.doctorImage} title='No doctor found' imageSize={20} />
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

    listContent: {
        // paddingHorizontal: 20,
        paddingBottom: 120,
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