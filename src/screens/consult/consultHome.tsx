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
import SearchBar from '../../components/SearchBar';
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
import { getConsultHistory } from '../../services/ConsultServce';
import EmptyState from '../../components/EmptyState';

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


  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState('')
  const [recentLoading, setRecentLoading] = useState(false);


  const fetchConsultHistory =
    useCallback(
      async (
        payload: object,
      ) => {

        try {

          setRecentLoading(true);

          const response =
            await getConsultHistory(
              payload,
            );

          console.log(
            'CONSULTHISTORY => ',
            response,
          );

          setHistory(
            response?.data?.results ||
            [],
          );

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
    fetchConsultHistory
  }, [fetchConsultHistory]);

  const renderRecentDoctor =
    useCallback(
      ({ item }: any) => {

        return (
          <RecentDoctors
            // image={{
            //   uri: item?.image,
            // }}
            image={item?.image}
            name={item?.name}
            speciality={
              item?.speciality
            }
            date={item?.date}
            onPressReceipt={() =>
              navigation.navigate(
                'MedicalReceipt',
              )
            }
            onPressReschedule={() =>
              // navigation.navigate(
              //   'DoctorSlot',

              // )
              navigation.navigate('DoctorSlot')
            }
          />
        );
      },
      [navigation],
    );

  const filteredDoctors = useMemo(() => {
    let list = [...topDoctors];
    if (!search?.trim()) {
      // Search empty -> poori list
      return topDoctors;
    }


    // Search
    if (search?.trim()) {
      const keyword = search?.toLowerCase();

      list = list.filter((doctor) => {
        const name = doctor?.full_name?.toLowerCase() || '';
        const specialization =
          doctor?.qualification?.toLowerCase() || '';

        return (
          name.includes(keyword) ||
          specialization.includes(keyword)
        );
      });
    }



    return list;
  }, [topDoctors, search,]);


  return (
    <SafeAreaView
      style={styles.container}
    >

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
      />


      <FlatList
        data={loading ? [] : recentDoctors}
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

            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search doctors, concerns..."
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

              {topDoctors?.length > 0 && (
                <>
                  <SectionHeader
                    title="Top Doctors"
                    actionText="View all"
                    onPress={() => navigation.navigate('AllDoctors')}
                  />

                  <TopDoctorsCard
                    data={filteredDoctors}
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
    backgroundColor:
      '#FDFDFB',
    paddingHorizontal: 20,
  },

  content: {
    paddingBottom: 40,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      '#FDFDFB',
  },

});