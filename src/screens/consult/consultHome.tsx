import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  StatusBar,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation } from '@react-navigation/native';

import { NativeStackNavigationProp }
  from '@react-navigation/native-stack';

import Header from '../../components/Header';
import { ExpandableSearch } from '../../components/SearchBar';
import SectionHeader from '../../components/SectionHeader';
import RecentDoctors from '../../components/RecentDoctors';
import CategoryList from '../../components/CategoryList';
import TopDoctorsCard from '../home/TopDoctorsCard';

import { RootStackParamList }
  from '../../../type';

import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';

import { useConsultData }
  from '../../hooks/useConsultData';
import PromoCard from '../../components/PromoCard';
import { DoctorCardSkeleton, HomeCategorySkeleton, TopDoctorsCardSkeleton } from '../../simmerScreen/ShimmerHook';
import { getConsultHistory, RecentConsultHistory } from '../../services/ConsultServce';
import EmptyState from '../../components/EmptyState';
import { useDebounce } from '../../hooks/useDebaunce';
import { matchesSearch } from '../../utils/searchUtils';
import { getScreenPaddingH, SPACING } from '../../constants/responsive';

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

const ConsultHome = () => {

  const navigation =
    useNavigation<NavigationProp>();



  const {
    loading,
    refreshing,
    categories,
    topDoctors,
    recentDoctors,
    onRefresh,
  } = useConsultData();


  console.log("topDoctorstopDoctorstopDoctors", topDoctors);

  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const debouncedSearch = useDebounce(search, 400);
  const [recentLoading, setRecentLoading] = useState(false);

  const filteredHistory = useMemo(() => {
    const q = debouncedSearch.trim();
    if (!q) return history;
    return history.filter((item: any) =>
      matchesSearch(
        q,
        item?.doctor?.doctor_name,
        item?.concern,
        item?.status,
      ),
    );
  }, [history, debouncedSearch]);

  const filteredTopDoctors = useMemo(() => {
    const q = debouncedSearch.trim();
    if (!q) return topDoctors;
    return topDoctors.filter((doctor: any) =>
      matchesSearch(
        q,
        doctor?.full_name,
        doctor?.qualification,
        doctor?.specialization_name,
      ),
    );
  }, [topDoctors, debouncedSearch]);

  const fetchConsultHistory =
    useCallback(
      async (
        payload: object,
      ) => {

        try {

          setRecentLoading(true);

          const response =
            await RecentConsultHistory();

          console.log(
            'CONSULTHISTORY => ',
            response?.data?.results,
          );
          setHistory((response?.data?.results || []).slice(0, 3));

          // setHistory(
          //   response?.data?.results ||
          //   [],
          // );

        } catch (error) {

          console.log(
            'CONSULT HISTORY ERROR => ',
            error,
          );

        } finally {

          setRecentLoading(false);
        }
      },

      [],
    );

  useEffect(() => {
    fetchConsultHistory({});
  }, [fetchConsultHistory]);

  const renderRecentDoctor =
    useCallback(
      ({ item }: any) => {

        return (
          <RecentDoctors
            image={{
              uri: item?.doctor?.doctor_image,
            }}
            // image={item?.doctor?.doctor_image}
            name={item?.doctor?.doctor_name}
            speciality={
              item?.doctor?.doctor_designation

            }
            date={item?.date}
            onPressReceipt={() =>
              navigation.navigate(
                'MedicalReceipt', {
                consultationId: item?.consultation_id
              }
              )
            }


            onPressReschedule={() =>
              navigation.navigate(
                'DoctorSlot', {
                // doctorDetails: item
                doctorDetails: {
                  ...item.doctor,
                  id: item.doctor?.doctor_id,
                  is_favorite: (item.doctor as any)?.is_favorite,
                  total_patients: (item.doctor as any)?.total_patients,
                  full_name: item.doctor?.doctor_name,
                  profile_image: item.doctor?.doctor_image,
                  designation: (item.doctor as any)?.qualification,
                },
              }
              )

            }
          />
        );
      },
      [navigation],
    );

  // const filteredDoctors = useMemo(() => {
  //   let list = [...topDoctors];
  //   if (!search?.trim()) {
  //     // Search empty -> poori list
  //     return topDoctors;
  //   }


  //   // Search
  //   if (search?.trim()) {
  //     const keyword = search?.toLowerCase();

  //     list = list.filter((doctor) => {
  //       const name = doctor?.full_name?.toLowerCase() || '';
  //       const specialization =
  //         doctor?.qualification?.toLowerCase() || '';

  //       return (
  //         name.includes(keyword) ||
  //         specialization.includes(keyword)
  //       );
  //     });
  //   }



  //   return list;
  // }, [topDoctors, search,]);


  return (
    <SafeAreaView
      style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          Colors.background
        }
      />

      {/* HEADER */}

      <Header
        title="Doctors Consultation"
        subtitle="Find best doctor"
        onBack={() =>
          navigation.goBack()
        }
        onSearchPress={() => setSearchExpanded(true)}
        onRefreshPress={onRefresh}
      />


      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => String(item?.id)}
        renderItem={renderRecentDoctor}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primaryColor]}
          />
        }

        ListHeaderComponent={
          <>

            <ExpandableSearch
              value={search}
              onChangeText={setSearch}
              placeholder="Search doctors, concerns..."
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
              approved
              showButton
            />

            <SectionHeader
              title="Recent Consultation"
              actionText="View History"
              onPress={() => navigation.navigate('ConsultHistory')}
            />

            {/* Recent Doctor Skeleton */}
            {loading && <DoctorCardSkeleton />}
          </>
        }
        ListEmptyComponent={() => (

          <EmptyState
            image={Images.doctorImage}
            title="No doctor found"
            subtitle="Try adjusting your filters or search."
            imageSize={48}
          />
        )}

        ListFooterComponent={
          loading ? (
            <>
              <HomeCategorySkeleton />
              <TopDoctorsCardSkeleton />
              <View style={{ height: 120 }} />
            </>
          ) : (
            <>
              <SectionHeader title="Consult by Concern" />

              <CategoryList
                data={categories}
                navigation={navigation}
                doctor
              />

              {filteredTopDoctors?.length > 0 && (
                <>
                  <SectionHeader
                    title="Top Doctors"
                    actionText="View all"
                    onPress={() => navigation.navigate('AllDoctors')}
                  />

                  <TopDoctorsCard
                    data={filteredTopDoctors}
                    navigation={navigation}
                  />
                </>
              )}

              <View style={{ height: 120 }} />
            </>
          )
        }

        contentContainerStyle={styles.content}
      />

    </SafeAreaView>
  );
};

export default memo(
  ConsultHome,
);

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FDFDFB',
    paddingHorizontal: getScreenPaddingH(),
  },

  content: {
    paddingBottom: SPACING.xxl,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      '#FDFDFB',
  },

});