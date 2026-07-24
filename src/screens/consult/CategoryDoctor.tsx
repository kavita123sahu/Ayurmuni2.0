import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    FlatList,
    TouchableOpacity,
    Text,
    RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import Header from '../../components/Header';
import { ExpandableSearch } from '../../components/SearchBar';
import PromoCard from '../../components/PromoCard';
import SectionHeader from '../../components/SectionHeader';
import { Images } from '../../common/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import AllDoctorCard from '../../components/AllDoctorCard';
import { Fonts } from '../../common/Fonts';
import { useAllDoctors } from '../../hooks/useConsultData';
import { TopDoctorsCardSkeleton } from '../../simmerScreen/ShimmerHook';
import EmptyState from '../../components/EmptyState';
import { useDebounce } from '../../hooks/useDebaunce';

const CategoryDoctor = (props: any) => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const [showAll, setShowAll] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchExpanded, setSearchExpanded] = useState(false);

    const { categoryName, categoryId } = route.params || {};
    const debouncedSearch = useDebounce(searchText, 400);

    const apiFilters = useMemo(
        () => ({
            specialization: categoryId || '',
            search: debouncedSearch.trim(),
            page_size: 50,
        }),
        [categoryId, debouncedSearch],
    );

    const { loading, doctorData, refresh, refreshing } = useAllDoctors(apiFilters);

    const displayDoctors = useMemo(
        () => (showAll ? doctorData : doctorData.slice(0, 2)),
        [doctorData, showAll],
    );

    const handleDoctorPress = useCallback(
        (item: any) => {
            props.navigation.navigate('DoctorProfile', { doctorData: item });
        },
        [props.navigation],
    );

    return (
        <SafeAreaView
            style={{
                flex: 1,
                marginBottom: 30,
                paddingHorizontal: 20,
                backgroundColor: '#FDFDFB',
            }}
        >
            <StatusBar
                barStyle={'dark-content'}
                backgroundColor={Colors.background}
            />

            <Header
                title={categoryName}
                subtitle="Find best doctor"
                onBack={() => navigation.goBack()}
                onSearchPress={() => setSearchExpanded(true)}
                onRefreshPress={refresh}
            />

            <View style={styles.flexContain}>
                <FlatList
                    data={displayDoctors}
                    keyExtractor={item => String(item.id)}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refresh}
                            colors={[Colors.primaryColor]}
                            tintColor={Colors.primaryColor}
                        />
                    }
                    ListHeaderComponent={
                        <>
                            <ExpandableSearch
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholder="Search doctor name or qualification..."
                                showTrigger={false}
                                expanded={searchExpanded}
                                onExpandedChange={setSearchExpanded}
                            />
                            <PromoCard
                                title="Consult with Specialists"
                                desc="Over 50+ Medical Experts"
                                imageLeftIconName="plus-bag"
                                image={require('../../assets/images/doctorbanner.png')}
                                buttontext="Book an appointment online"
                                showButton={false}
                            />
                            <SectionHeader title="Top Doctors" />
                        </>
                    }
                    renderItem={({ item }) => (
                        <AllDoctorCard
                            item={item}
                            onPress={() => handleDoctorPress(item)}
                        />
                    )}
                    ListEmptyComponent={
                        loading ? (
                            <TopDoctorsCardSkeleton />
                        ) : (
                            <EmptyState
                                image={Images.doctorImage}
                                title="No doctor found"
                                subtitle="Try a different search or category."
                            />
                        )
                    }
                    ListFooterComponent={
                        doctorData.length > 2 ? (
                            <View style={styles.footerContainer}>
                                {!showAll && (
                                    <TouchableOpacity
                                        style={styles.discoverBtn}
                                        onPress={() => setShowAll(true)}
                                    >
                                        <Text style={styles.discoverText}>
                                            Discover More
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <Text style={styles.countText}>
                                    Showing {showAll ? doctorData.length : 2} of{' '}
                                    {doctorData.length} items
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
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
    },
    countText: {
        marginTop: 8,
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
        marginBottom: 40,
    },
});
