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
import { useConsultData } from '../../hooks/useConsultData';
import EmptyState from '../../components/EmptyState';

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
    const { all } = props.route.params;

    console.log("all", all)

    const [loading, setLoading] =
        useState(true);

    const [filterLoading, setFilterLoading] =
        useState(false);


    const [doctorData, setDoctorData] =
        useState<any[]>([]);

    const [search, setSearch] =
        useState('');

    const [activeTab, setActiveTab] =
        useState<string | null>(null);

    const [specialities, setSpecialities] =
        useState<any[]>([]);
    const [showDatePicker, setShowDatePicker] =
        useState(false);
    const [showCustomDateOptions, setShowCustomDateOptions] =
        useState(false);
    const [datePickerTarget, setDatePickerTarget] =
        useState<'from' | 'to' | null>(null);

    const [selectedDateLabel, setSelectedDateLabel] =
        useState('');

    const [selectedFilters, setSelectedFilters] = useState({
        speciality: null as any,
        availabilityValue: '',
        availabilityFrom: '',
        availabilityTo: '',
        experience: '',
    });


    const isFirstRender = useRef(true);

    const { categories } = useConsultData();


    useEffect(() => {
        setSpecialities(categories || []);
    }, [categories]);


    const FILTER_OPTIONS =
        useMemo(
            () => ({
                speciality:
                    specialities,

                availability:
                    AVAILABILITY_OPTIONS,

                experience:
                    EXPERIENCE_OPTIONS,
            }),
            [specialities],
        );

    const dropdownOptions =
        useMemo(() => {
            if (!activeTab) {
                return [];
            }

            if (
                activeTab === 'availability' &&
                showCustomDateOptions
            ) {
                return [];
            }

            const key = activeTab as keyof typeof FILTER_OPTIONS;
            return FILTER_OPTIONS[key] || [];
        }, [activeTab, showCustomDateOptions, FILTER_OPTIONS]);



    const getAllDoctors =
        useCallback(
            async (
                isFilter = false,
            ) => {

                try {

                    /*
                      🔥 ONLY FILTER LOADER
                    */

                    if (isFilter) {
                        setFilterLoading(true);
                    } else {
                        setLoading(true);
                    }

                    const payload = {
                        specialization:
                            selectedFilters?.speciality?.id || '',

                        from_date:
                            selectedFilters?.availabilityFrom || '',
                        to_date:
                            selectedFilters?.availabilityTo || '',

                        experience:
                            selectedFilters?.experience || '',

                        // search,
                    };

                    console.log("FILTER PAYLOAD ===>", payload);

                    const response =
                        await _CONSULT_SERVICES.getFilterTopDoctor(
                            payload,
                        );

                    if (!response) {
                        console.warn('No response from API');
                        setDoctorData([]);
                        return;
                    }

                    console.log(
                        'FILTER DOCTOR RESPONSE ===>',
                        response?.data,
                    );

                    const apiDoctors =
                        response?.data?.results || [];

                    setDoctorData(apiDoctors || []);

                } catch (error) {

                    console.log(
                        'ALL DOCTOR ERROR ===>',
                        error,
                    );

                } finally {

                    setLoading(false);

                    setFilterLoading(false);
                }
            },
            [
                selectedFilters,
                // search,
            ],
        );
    /*
    ====================================
    API RELOAD
    ====================================
    */

    useEffect(() => {
        if (isFirstRender.current) {
            getAllDoctors();
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            getAllDoctors(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [selectedFilters, getAllDoctors]);  //search, 

    /*
    ====================================
    FILTER SELECT
    ====================================
    */

    const getAvailabilityRange = (value: string) => {
        const today = dayjs().startOf('day');

        switch (value) {
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
            case 'this_week': {
                const endOfWeek = today.endOf('week');
                return {
                    from: today.format('YYYY-MM-DD'),
                    to: endOfWeek.format('YYYY-MM-DD'),
                };
            }
            case 'next_week': {
                const startOfNextWeek = today.add(1, 'week').startOf('week');
                const endOfNextWeek = startOfNextWeek.endOf('week');
                return {
                    from: startOfNextWeek.format('YYYY-MM-DD'),
                    to: endOfNextWeek.format('YYYY-MM-DD'),
                };
            }
            case 'this_month': {
                const endOfMonth = today.endOf('month');
                return {
                    from: today.format('YYYY-MM-DD'),
                    to: endOfMonth.format('YYYY-MM-DD'),
                };
            }
            case 'next_month': {
                const startOfNextMonth = today.add(1, 'month').startOf('month');
                const endOfNextMonth = startOfNextMonth.endOf('month');
                return {
                    from: startOfNextMonth.format('YYYY-MM-DD'),
                    to: endOfNextMonth.format('YYYY-MM-DD'),
                };
            }
            default:
                return {
                    from: '',
                    to: '',
                };
        }
    };

    const onSelectFilter = (
        key: string,
        item: any,
    ) => {
        if (
            key === 'availability' &&
            item?.value === 'custom_date'
        ) {
            setShowCustomDateOptions(true);
            setShowDatePicker(false);
            setActiveTab('availability');
            return;
        }

        if (key === 'speciality') {
            setSelectedFilters(
                prev => ({
                    ...prev,
                    speciality: item,
                }),
            );
            setActiveTab(null);
            return;
        }

        if (key === 'availability') {
            const range = getAvailabilityRange(item?.value);
            setSelectedFilters(prev => ({
                ...prev,
                availabilityValue: item?.value || '',
                availabilityFrom: range.from,
                availabilityTo: range.to,
            }));
            setSelectedDateLabel(item?.label || 'Availability');
            setShowCustomDateOptions(false);
            setActiveTab(null);
            return;
        }

        setSelectedFilters(
            prev => ({
                ...prev,
                [key]:
                    item?.value ||
                    item,
            }),
        );

        setActiveTab(null);
    };
    /*
    ====================================
    CLEAR FILTER
    ====================================
    */

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
                    selectedFilters?.availabilityValue,
            );

        return (
            selectedOption?.label ||
            'Availability'
        );
    };

    const [customDateRange, setCustomDateRange] =
        useState({
            from: '',
            to: '',
        });

    const onDateChange = (
        event: any,
        date?: Date,
    ) => {
        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            setDatePickerTarget(null);
            return;
        }

        if (!date || !datePickerTarget) {
            setShowDatePicker(false);
            setDatePickerTarget(null);
            return;
        }

        const formattedDate =
            dayjs(date).format('YYYY-MM-DD');

        setCustomDateRange(prev => ({
            ...prev,
            [datePickerTarget]: formattedDate,
        }));

        setShowDatePicker(false);
        setDatePickerTarget(null);
    };

    const applyCustomDateRange = () => {
        if (!customDateRange.from && !customDateRange.to) {
            return;
        }

        const fromDate =
            customDateRange.from ||
            customDateRange.to;
        const toDate =
            customDateRange.to ||
            customDateRange.from;

        setSelectedFilters(prev => ({
            ...prev,
            availabilityValue: 'custom_date',
            availabilityFrom: fromDate,
            availabilityTo: toDate,
        }));

        setSelectedDateLabel(
            fromDate === toDate
                ? dayjs(fromDate).format('DD MMM YYYY')
                : `${dayjs(fromDate).format('DD MMM YYYY')} - ${dayjs(toDate).format('DD MMM YYYY')}`,
        );

        setActiveTab(null);
        setShowCustomDateOptions(false);
    };

    /*
    ====================================
    TAB BUTTON
    ====================================
    */

    const TabButton = () => {
        return (
            <View style={styles.tabs}>
                {TABS.map(tab => {
                    const selectedValue =
                        tab.key === 'availability'
                            ? selectedFilters.availabilityValue
                            : tab.key === 'speciality'
                                ? selectedFilters.speciality
                                : selectedFilters[tab.key as keyof typeof selectedFilters];

                    return (
                        <TouchableOpacity
                            key={tab.key}
                            activeOpacity={0.8}
                            onPress={() =>
                                setActiveTab(
                                    activeTab === tab.key
                                        ? null
                                        : tab.key,
                                )
                            }
                            style={[
                                styles.tabBtn,
                                selectedValue &&
                                styles.activeTab,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    selectedValue &&
                                    styles.activeTabText,
                                ]}
                                numberOfLines={1}
                            >
                                {
                                    tab.key === 'speciality'
                                        ? selectedFilters?.speciality?.name ||
                                        tab.label

                                        : tab.key === 'availability'
                                            ? getAvailabilityLabel()

                                            : selectedValue ||
                                            tab.label
                                }
                            </Text>

                            {selectedValue ? (
                                <TouchableOpacity
                                    onPress={() =>
                                        clearFilter(
                                            tab.key,
                                        )
                                    }
                                >
                                    <Ionicons
                                        name="close"
                                        size={16}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            ) : (
                                <Ionicons
                                    name={
                                        activeTab === tab.key
                                            ? 'chevron-up'
                                            : 'chevron-down'
                                    }
                                    size={18}
                                    color="#0F172A"
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const renderDoctorItem =
        useCallback(
            ({ item }: any) => (

                <AllDoctorCard
                    item={item}
                    onPress={() =>
                        props.navigation.navigate(
                            'DoctorProfile',
                            { doctorId: item?.id },
                        )
                    }
                />
            ),
            [],
        );

    /*
    ====================================
    LOADER
    ====================================
    */

    // if (loading) {

    //     return (

    //         <SafeAreaView
    //             style={styles.loaderContainer}
    //         >

    //             <ActivityIndicator
    //                 size="large"
    //                 color={Colors.primaryColor}
    //             />

    //         </SafeAreaView>
    //     );
    // }

    return (

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



            {
                loading ? (

                    <View
                        style={
                            styles.loaderContainer
                        }
                    >
                        <ActivityIndicator
                            size="large"
                            color={
                                Colors.primaryColor
                            }
                        />
                    </View>

                )
                    : (<FlatList
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



                        ListHeaderComponent={
                            <>


                                {/* SEARCH */}

                                <SearchBar
                                    placeholder="Search doctors..."
                                    value={search}
                                    onChangeText={
                                        setSearch
                                    }

                                    icon={require('../../assets/images/search.png')}
                                />

                                {/* FILTER TAB */}

                                <TabButton />

                                {
                                    activeTab && (

                                        <View style={styles.dropdown}>

                                            {
                                                activeTab === 'availability' &&
                                                    showCustomDateOptions ? (
                                                    <>
                                                        <View style={styles.customDatePanel}>
                                                            <TouchableOpacity
                                                                style={styles.dateButton}
                                                                onPress={() => {
                                                                    setDatePickerTarget('from');
                                                                    setShowDatePicker(true);
                                                                }}
                                                            >
                                                                <Text style={styles.dateButtonText}>
                                                                    From: {customDateRange.from ? dayjs(customDateRange.from).format('DD MMM YYYY') : 'Select start date'}
                                                                </Text>
                                                            </TouchableOpacity>

                                                            <TouchableOpacity
                                                                style={styles.dateButton}
                                                                onPress={() => {
                                                                    setDatePickerTarget('to');
                                                                    setShowDatePicker(true);
                                                                }}
                                                            >
                                                                <Text style={styles.dateButtonText}>
                                                                    To: {customDateRange.to ? dayjs(customDateRange.to).format('DD MMM YYYY') : 'Select end date'}
                                                                </Text>
                                                            </TouchableOpacity>

                                                            <TouchableOpacity
                                                                style={styles.applyButton}
                                                                activeOpacity={0.8}
                                                                onPress={applyCustomDateRange}
                                                            >
                                                                <Text style={styles.applyButtonText}>
                                                                    Apply Date Range
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>

                                                        {showDatePicker && (
                                                            <DateTimePicker
                                                                value={
                                                                    datePickerTarget && customDateRange[datePickerTarget]
                                                                        ? new Date(customDateRange[datePickerTarget])
                                                                        : new Date()
                                                                }
                                                                mode="date"
                                                                display="calendar"
                                                                minimumDate={new Date()}
                                                                onChange={onDateChange}
                                                            />
                                                        )}
                                                    </>
                                                ) : (

                                                    <ScrollView
                                                        nestedScrollEnabled
                                                        showsVerticalScrollIndicator
                                                    >

                                                        {
                                                            dropdownOptions.map(
                                                                (
                                                                    item: any,
                                                                    index,
                                                                ) => (

                                                                    <TouchableOpacity
                                                                        key={index}
                                                                        style={styles.option}
                                                                        onPress={() =>
                                                                            onSelectFilter(
                                                                                activeTab,
                                                                                item,
                                                                            )
                                                                        }
                                                                    >

                                                                        <Text
                                                                            style={
                                                                                styles.optionText
                                                                            }
                                                                        >
                                                                            {
                                                                                item?.name ||
                                                                                item?.label
                                                                            }
                                                                        </Text>

                                                                    </TouchableOpacity>
                                                                ),
                                                            )
                                                        }

                                                    </ScrollView>

                                                )
                                            }

                                        </View>
                                    )
                                }

                                <SectionHeader
                                    title="All Doctors"
                                />

                            </>
                        }

                        renderItem={renderDoctorItem}

                        ItemSeparatorComponent={() => (
                            <View
                                style={{
                                    height: 14,
                                }}
                            />
                        )}

                        ListEmptyComponent={() => (

                            <EmptyState image={Images.doctorImage} title='No doctor found' />
                        )}
                    />)}
        </SafeAreaView>
    );
};

export default AllDoctors;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },

    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },

    tabs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },

    tabBtn: {
        flex: 1,

        marginHorizontal: 4,

        flexDirection: 'row',

        alignItems: 'center',

        justifyContent: 'space-between',

        paddingHorizontal: 10,

        paddingVertical: 12,

        minHeight: 50,

        borderRadius: 14,

        borderWidth: 1,

        borderColor: '#E2E8F0',

        backgroundColor: '#FFF',
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
        color: '#FFFFFF',
    },

    dropdown: {
        marginTop: 8,
        backgroundColor: '#FFF',
        borderRadius: 16,

        maxHeight: 250,

        elevation: 5,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },

    dropdownScroll: {
        maxHeight: 260,
    },

    dropdownContent: {
        paddingVertical: 6,
    },

    option: {
        paddingHorizontal: 16,
        paddingVertical: 14,
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