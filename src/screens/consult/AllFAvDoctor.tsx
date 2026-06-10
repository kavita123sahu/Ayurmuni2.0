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
    ActivityIndicator,
} from 'react-native';

import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import AllDoctorCard from '../../components/AllDoctorCard';
import { Images } from '../../common/Images';

import * as _CONSULT_SERVICES
    from '../../services/ConsultServce';
import SearchBar from '../../components/SearchBar';
import { useConsultData } from '../../hooks/useConsultData';
import EmptyState from '../../components/EmptyState';


const AllFavDoctors = (props: any) => {



    const [search, setSearch] =
        useState('');


    const { favDoctor, loading } = useConsultData();

    console.log('favDoctorfavDoctor', favDoctor)

    const favouriteDoctors =
        favDoctor?.filter(
            item => item?.is_favorite === true,
        ) || [];


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
                title="Favourite Doctor"
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
                        data={favouriteDoctors}
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

export default AllFavDoctors;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        paddingTop: 20
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