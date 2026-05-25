import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    StatusBar,
    ActivityIndicator,
} from 'react-native';

import { Ionicons } from '../../common/Vector';

import SearchBar from '../../components/SearchBar';
import SectionHeader from '../../components/SectionHeader';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import AllDoctorCard from '../../components/AllDoctorCard';
import { Images } from '../../common/Images';

import * as _CONSULT_SERVICES
    from '../../services/ConsultServce';

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

const FILTER_OPTIONS: any = {

    speciality: [
        'Cardiologist',
        'Dentist',
        'Neurologist',
        'Dermatologist',
    ],

    availability: [
        'Available',
        'Unavailable',
    ],

    experience: [
        '1',
        '5',
        '10',
    ],
};

const AllDoctors = (props: any) => {



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

    const [selectedFilters, setSelectedFilters] =
        useState<any>({});

    /*
    ====================================
    API CALL
    ====================================
    */

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

                        speciality:
                            selectedFilters?.speciality || '',

                        has_availability:
                            selectedFilters?.availability === 'Available'
                                ? true
                                : selectedFilters?.availability === 'Unavailable'
                                    ? false
                                    : '',

                        min_experience:
                            selectedFilters?.experience || '',

                        search,
                    };

                    const response =
                        await _CONSULT_SERVICES.getFilterTopDoctor(
                            payload,
                        );

                    setDoctorData(
                        response?.data?.results || [],
                    );

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
                search,
            ],
        );
    /*
    ====================================
    API RELOAD
    ====================================
    */


    useEffect(() => {

        const timer =
            setTimeout(() => {

                getAllDoctors(true);

            }, 500);

        return () =>
            clearTimeout(timer);

    }, [search]);


    useEffect(() => {

        getAllDoctors(true);

    }, [
        selectedFilters,
        search,
    ]);

    /*
    ====================================
    FILTER SELECT
    ====================================
    */

    const onSelectFilter =
        useCallback(
            (
                key: string,
                value: string,
            ) => {

                setSelectedFilters(
                    (prev: any) => ({
                        ...prev,
                        [key]: value,
                    }),
                );

                setActiveTab(null);

            },
            [],
        );

    /*
    ====================================
    CLEAR FILTER
    ====================================
    */

    const clearFilter =
        useCallback(
            (key: string) => {

                setSelectedFilters(
                    (prev: any) => {

                        const updated = {
                            ...prev,
                        };

                        delete updated[key];

                        return updated;
                    },
                );

            },
            [],
        );

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
                        selectedFilters?.[tab.key];

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
                                numberOfLines={1}
                                style={[
                                    styles.tabText,

                                    selectedValue &&
                                    styles.activeTabText,
                                ]}
                            >

                                {
                                    selectedValue ||
                                    tab.label
                                }

                            </Text>

                            {
                                selectedValue ? (

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

                                )
                            }

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
                            { doctor: item },
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

    if (loading) {

        return (

            <SafeAreaView
                style={styles.loaderContainer}
            >

                <ActivityIndicator
                    size="large"
                    color={Colors.primaryColor}
                />

            </SafeAreaView>
        );
    }

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

                                {/* DROPDOWN */}

                                {
                                    activeTab && (

                                        <View
                                            style={
                                                styles.dropdown
                                            }
                                        >

                                            {
                                                FILTER_OPTIONS[
                                                    activeTab
                                                ]?.map(
                                                    (
                                                        item: string,
                                                        index: number,
                                                    ) => (

                                                        <TouchableOpacity
                                                            key={
                                                                index
                                                            }
                                                            style={
                                                                styles.option
                                                            }
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

                                                                {item}

                                                            </Text>

                                                        </TouchableOpacity>
                                                    ),
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

                            <View
                                style={
                                    styles.emptyContainer
                                }
                            >

                                <Text
                                    style={
                                        styles.emptyText
                                    }
                                >
                                    No Doctors Found
                                </Text>

                            </View>
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
        minWidth: 0,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingHorizontal: 12,
        paddingVertical: 12,

        backgroundColor: '#FFFFFF',

        borderRadius: 14,

        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    activeTab: {
        backgroundColor:
            Colors.primaryColor,

        borderColor:
            Colors.primaryColor,
    },

    tabText: {
        flex: 1,
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
        marginTop: 6,

        backgroundColor: '#FFFFFF',

        borderRadius: 16,

        paddingVertical: 6,

        elevation: 4,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
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