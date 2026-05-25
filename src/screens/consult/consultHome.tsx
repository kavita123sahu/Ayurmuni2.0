import React, {
  memo,
  useCallback,
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

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

const ConsultScreen = () => {

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

  /*
    ====================================
    RECENT ITEM
    ====================================
  */

  console.log("topDoctorstopDoctors", topDoctors);
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
              navigation.navigate(
                'DoctorSlot',
              )
            }
          />
        );
      },
      [navigation],
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

  /*
    ====================================
    MAIN
    ====================================
  */

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
        backIcon={Images.backIcon}
        onBack={() =>
          navigation.goBack()
        }
      />

      <FlatList
        data={recentDoctors}
        keyExtractor={(item) =>
          String(item?.id)
        }

        showsVerticalScrollIndicator={
          false
        }

        renderItem={
          renderRecentDoctor
        }

        ItemSeparatorComponent={() => (
          <View
            style={{ height: 12 }}
          />
        )}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[
              Colors.primaryColor,
            ]}
          />
        }

        ListHeaderComponent={
          <>

            {/* SEARCH */}

            <SearchBar
              placeholder="Search doctors, concerns..."
              icon={require('../../assets/images/search.png')}
            />

            <PromoCard title="Consult with Specialists" desc="Over 50+ Medical Experts" imageLeft={Images.PlusBag} image={require('../../assets/images/doctorbanner.png')} buttontext='Book an appointment online' approved={true} arrowIcon={require('../../assets/images/arrow.png')} onPress={() => { navigation.navigate('AllDoctors') }} showButton={true} />


            {/* RECENT */}

            <SectionHeader
              title="Recent Consultation"
              actionText="View History"
              onPress={() =>
                navigation.navigate(
                  'ConsultHistory',
                )
              }
            />


          </>
        }

        ListFooterComponent={
          <>

            {/* CATEGORY */}

            <SectionHeader
              title="Consult by Concern"
            />

            <CategoryList
              data={categories}
              navigation={
                navigation
              }
              doctor
            />

            {/* TOP DOCTORS */}

            <SectionHeader
              title="Top Doctors"
              actionText="View all"
              onPress={() =>
                navigation.navigate(
                  'AllDoctors',
                )
              }
            />

            <TopDoctorsCard
              data={topDoctors}
              navigation={
                navigation
              }
            />

            <View
              style={{
                height: 120,
              }}
            />

          </>
        }

        contentContainerStyle={
          styles.content
        }
      />

    </SafeAreaView>
  );
};

export default memo(
  ConsultScreen,
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