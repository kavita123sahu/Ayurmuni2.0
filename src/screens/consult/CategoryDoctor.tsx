import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import PromoCard from '../../components/PromoCard';
import SectionHeader from '../../components/SectionHeader';
import TopSellingList from '../../components/TopSellingList';
import { Images } from '../../common/Images';
import { Styles } from '../../common/Styles';
import * as _CONSULT_SERVICES from '../../services/ConsultServce';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import AllDoctorCard from '../../components/AllDoctorCard';
import { Fonts } from '../../common/Fonts';
import { useConsultData } from '../../hooks/useConsultData';

const CategoryDoctor = (props: any) => {

    const route = useRoute<any>();

    const navigation = useNavigation<any>();
    const [showAll, setShowAll] = useState(false);
    // const [loading, setLoading] = useState(false);

    // const { categoryName } = route.params;

    const {
        refreshing,
        categories,
        topDoctors,
        recentDoctors,
        onRefresh,
        loading
    } = useConsultData();

    const {
        categoryName,
        categoryId,
        prakriti,
        speciality,
    } = route.params || {};

    const productImage = require('../../assets/images/RecentsImage.png');


    console.log('topDoctorstopDoctors------->', topDoctors);


    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1 }}>

                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator
                        size="large"
                        color={Colors.primaryColor}
                    />

                    <Text
                        style={{
                            marginTop: 10,
                            fontSize: 14,
                            fontFamily: Fonts.PoppinsMedium,
                            color: '#64748B',
                        }}
                    >
                        Loading doctors...
                    </Text>

                </View>

            </SafeAreaView>
        );
    }

    const displayData =
        showAll
            ? topDoctors
            : topDoctors.slice(0, 2);

    // const formattedData =
    //     displayData.length % 2 !== 0
    //         ? [...displayData, { id: 'empty', empty: true }]
    //         : displayData;

    return (
        <SafeAreaView style={{
            flex: 1, marginBottom: 30,
            paddingHorizontal: 20, backgroundColor: '#FDFDFB'
        }}>

            <StatusBar barStyle={'dark-content'} backgroundColor={Colors.background} />

            <Header
                title={categoryName}
                subtitle="Find best doctor"
                backIcon={Images.backIcon}
                onBack={() => navigation.goBack()}
            />

            <View style={styles.flexContain}>

                <FlatList
                    data={topDoctors}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <>
                            <SearchBar
                                // value={search}
                                // onChangeText={
                                //     setSearch
                                // }
                                placeholder="Search doctor name or experience..."
                                icon={require('../../assets/images/search.png')}
                            />
                            <PromoCard
                                title="Consult with Specialists"
                                desc="Over 50+ Medical Experts"
                                imageLeft={Images.PlusBag}
                                image={require('../../assets/images/doctorbanner.png')}
                                buttontext='Book an appointment online'
                                arrowIcon={require('../../assets/images/arrow.png')}
                                onPress={() => { navigation.navigate('AllDoctors') }}
                                showButton={false}
                            />
                            <SectionHeader title="Top Doctors" />


                        </>
                    }

                    renderItem={({ item }) => {
                        // ✅ Empty placeholder — kuch render mat karo
                        if (item.empty) {
                            return <View style={{ flex: 1, marginHorizontal: 6 }} />;
                        }

                        return (

                            <AllDoctorCard
                                item={item}
                                onPress={(doc: any) => props.navigation.navigate('DoctorProfile', { doctorId: doc?.id })}
                            // onPress={(doc: any) => props.navigation.navigate('DoctorProfile')}
                            />
                        );
                    }}

                    ListFooterComponent={
                        topDoctors.length > 2 ? (
                            <View style={styles.footerContainer}>

                                {!showAll && (
                                    <TouchableOpacity
                                        style={styles.discoverBtn}
                                        onPress={() =>
                                            setShowAll(true)
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.discoverText
                                            }
                                        >
                                            Discover More
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <Text
                                    style={styles.countText}
                                >
                                    Showing {
                                        showAll
                                            ? topDoctors.length
                                            : 2
                                    } of {
                                        topDoctors.length
                                    } items
                                </Text>

                            </View>
                        ) : null
                    }
                />
            </View>
        </SafeAreaView>
    );
};

export default CategoryDoctor;


const styles = StyleSheet.create({
    flexContain: {
        flex: 1,

    },

    footerContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },

    discoverBtn: {
        backgroundColor: '#0D614E',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 12,
    },

    discoverText: {
        color: '#FFFFFF',
        fontSize: 14, fontFamily: Fonts.PoppinsMedium,
    },

    countText: {
        marginTop: 8,
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
        marginBottom: 40
    },
})