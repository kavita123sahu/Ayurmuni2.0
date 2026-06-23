






import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import { Dimensions } from 'react-native';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
import { Colors } from '../../common/Colors';
import PrakritiCard from '../../components/PrakritiCard';
import HomeHeader from '../../components/HomeHeader';
import SearchBar from '../../components/SearchBar';
import SectionHeader from '../../components/SectionHeader';
import Detailimages from '../../components/Detailimages';
import TopSellingList from '../../components/TopSellingList';
import { product, topSelling1, topSelling2, topSelling3 } from '../../common/DataInterface';
import TopDoctorsCard from './TopDoctorsCard';
import *as _ASSESSMENT_SERVICE from '../../services/AssesmentService'
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import HomeCategory from './HomeCategory';
import SuggestedCard from '../../components/SuggestedCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHomeData } from '../../hooks/UseHomeData';
import { AppointmentSkeletonList, HomeCategorySkeleton, HorizontalAppointmentSkeleton, TopDoctorsCardSkeleton, TopSellingListSkeleton } from '../../simmerScreen/ShimmerHook';
import RenderAppoint from '../../components/RenderAppoint';
import { useAppointmentHistory } from '../../hooks/useConsultData';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';


const { width } = Dimensions.get('window');

const HomePage: React.FC = (props: any) => {

  const hasFetched = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    categories,
    SuggestDoctor,
    productData,
    customerData,
    setProductData,

    loadingCategories,
    loadingDoctors,
    loadingProducts,
    loadingCustomer,
    refreshHomeData
  } = useHomeData();



  const { AppointData, getAllAppointment, loading } = useAppointmentHistory();

  const [showPrakritiModal, setShowPrakritiModal] = useState(false);
  console.log("appointdatta", AppointData);

  const normalizedData = useMemo(() => {
    if (!Array.isArray(AppointData)) {
      return [];
    }

    return AppointData.map(item => ({
      consultation_id: item?.consultation_id,
      doctorName: item?.doctor?.doctor_name || "",
      specialty:
        item?.doctor?.doctor_specialization ||
        "General Physician",
      date: item?.appointment_date,
      time: item?.start_time,
      status: item?.appointment_status,
      image: item?.doctor?.doctor_image,
      rawData: item,
    }));
  }, [AppointData]);

  console.log("normalizedData", normalizedData)

  const sortedUpcomingAppointments = useMemo(() => {
    if (!Array.isArray(normalizedData)) {
      return [];
    }

    return [...normalizedData].sort((a, b) => {
      const dateA = new Date(a?.date || 0).getTime();
      const dateB = new Date(b?.date || 0).getTime();

      return dateA - dateB;
    });
  }, [normalizedData]);
  console.log('sortedUpcomingAppointments', sortedUpcomingAppointments)

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refreshHomeData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshHomeData]);


  // const data = useMemo(() => [
  //   {
  //     title: 'Prakriti',
  //     status:
  //       customerData?.prakriti_progress === 100
  //         ? 'Profile Complete'
  //         : 'Profile Pending',
  //     screen: 'PatientFAQ',
  //     progress: customerData?.prakriti_progress ?? 0,
  //   },

  //   {
  //     title: 'Medical History',
  //     status:
  //       customerData?.medical_history_progress === 100
  //         ? 'Profile Complete'
  //         : 'Profile Pending',
  //     screen: 'MedicalHistory',
  //     progress:
  //       customerData?.medical_history_progress ?? 0,
  //   },
  // ], [customerData]);


  useEffect(() => {
    if (!customerData) return;
    setShowPrakritiModal(
      customerData?.prakriti_progress < 100
    );
  }, [customerData]);



  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;

    refreshHomeData();
  }, []);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.primaryColor}
        barStyle="dark-content"
      />


      <HomeHeader
        progress1={Math.round(customerData?.prakriti_progress || 0)}
        progress2={Math.round(customerData?.medical_history_progress || 0)}
      />


      <FlatList
        data={[1]}
        keyExtractor={() => 'home'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <SearchBar
              placeholder="Search doctors, medicine and products..."
              icon={require('../../assets/images/Search.png')}
            />
          </>
        }
        renderItem={() => (
          <>

            {/* <View style={styles.containerprakriti}>
              {data.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.cardWrapper}
                  onPress={() => props.navigation.navigate(item.screen, {
                    update: true
                  }
                  )}
                >
                  <PrakritiCard
                    title={item.title}
                    status={item.status}
                    progress={Math.round(item.progress)}
                  />
                </TouchableOpacity>
              ))}
            </View> */}

            {loadingCategories ? (

              <HomeCategorySkeleton />
            ) : (
              <HomeCategory data={categories} navigation={props.navigation} />
            )}


            {loading ? (
              <>
                <SectionHeader
                  title="Upcoming Appointments"
                  actionText="View all"
                />
                <HorizontalAppointmentSkeleton />
              </>
            ) : sortedUpcomingAppointments?.length > 0 ? (
              <>
                <SectionHeader
                  title="Upcoming Appointments"
                  actionText={sortedUpcomingAppointments.length > 1
                    ? 'View all'
                    : ''}
                />
                <FlatList
                  horizontal
                  data={sortedUpcomingAppointments}
                  keyExtractor={(item, index) =>
                    `${item?.consultation_id || index}`
                  }
                  contentContainerStyle={{ marginBottom: 15 }}
                  renderItem={({ item }) => (
                    <RenderAppoint
                      item={item}
                      navigation={props.navigation}
                      isHorizontal
                    />
                  )}
                  showsHorizontalScrollIndicator={false}
                />
              </>
            ) : null}

            <SectionHeader title="Suggested Doctors" actionText={SuggestDoctor.length > 1
              ? 'View all'
              : ''} onPress={() => props.navigation.navigate('AllDoctors', {
                all: true
              })} />

            {loadingDoctors ? (
              <TopDoctorsCardSkeleton />
            ) : (
              <>

                <TopDoctorsCard data={SuggestDoctor} navigation={props.navigation} />

              </>

            )}





            <Detailimages
              images={product.images}
              itemWidth={width - 80}
              itemHeight={150}
              DynamicResize='contain'

            />


            {productData?.length > 0 && (
              <>
                <SectionHeader
                  title="Suggested Medicines"
                  actionText={productData.length > 1
                    ? 'View all'
                    : ''}
                />

                {loadingProducts ? (
                  <TopSellingListSkeleton />
                ) : (
                  <TopSellingList
                    data={productData}
                    navigation={props.navigation}
                    setProductData={setProductData}
                  />
                )}
              </>
            )}



            {loadingProducts ? (
              <TopSellingListSkeleton />
            ) : productData.length > 0 ? (
              <>
                <SectionHeader
                  title="Suggested Products"
                  actionText={productData.length > 1
                    ? 'View all'
                    : ''}
                />

                <TopSellingList
                  data={productData}
                  navigation={props.navigation}
                  setProductData={setProductData}
                />
              </>
            ) : null}



            <SectionHeader title="Yoga’s" actionText="View all" />


            <SuggestedCard data={topSelling1} navigation={props.navigation} />


            <SectionHeader title="Suggested Diet Plan" actionText="View all" />


            <SuggestedCard data={topSelling2} navigation={props.navigation} />

            <SectionHeader title="Panchakarma" actionText="View all" />

            <SuggestedCard data={topSelling3} navigation={props.navigation} price={true} />
          </>
        )}
      />
      <Modal
        visible={showPrakritiModal}
        transparent
        animationType="fade"
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>

            <View style={styles.iconBox}>
              <Image
                source={Images.FinalLogo}
                style={{ width: 32, height: 32 }}
              />
            </View>

            <Text style={styles.title}>
              Complete Your Prakriti Assessment
            </Text>

            <Text style={styles.description}>
              Your Prakriti profile is pending.
              Complete it now to get personalized
              health insights and recommendations.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.noButton}
                onPress={() =>
                  setShowPrakritiModal(false)
                }
              >
                <Text style={styles.noText}>
                  Later
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.yesButton}
                onPress={() => {
                  setShowPrakritiModal(false);
                  props.navigation.navigate(
                    "PatientFAQ"
                  );
                }}
              >
                <Text style={styles.yesText}>
                  Complete Now
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>

  );
};


const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // // paddingBottom: 50,
    // backgroundColor: '#FDFDFB',
    // paddingHorizontal: 10
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
    backgroundColor: "#FDFDFB",
  },
  containerprakriti: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  header: {

    // paddingHorizontal: 20,
    paddingBottom: 10,
    paddingVertical: 5,

  },
  headerprofile: {
    // paddingHorizontal: 10,


  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  profileheader: {
    backgroundColor: '#fff',
    borderRadius: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40
  },
  sublocationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
  },
  askMuniButton: {

    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  askMuniText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  askMuniIcon: {
    fontSize: 20,
  },

  advisorCard: {
    padding: 15,
    paddingHorizontal: 20,
    width: '100%',
    flexDirection: 'row',
  },

  advisorIcon: {
    width: '40%',
    alignItems: 'center',

  },
  advisorContent: {

    width: '60%',
    marginLeft: 30
  },

  advisorTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 5,
  },
  advisorSubtitle: {
    marginTop: 5,
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 10,
    lineHeight: 16,
  },

  askNowContainer: {
    position: 'absolute',
    bottom: -20,
    left: width / 2 - 80,
    zIndex: 10,
  },
  askNowButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  content: {
    flex: 1,
    // paddingHorizontal: 14,
    paddingBottom: 50,
    backgroundColor: '#F5F5F5',
  },


  takeChargeSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },


  //modal 
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalContainer: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },

  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ECFDF3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 18,
    color: "#111827",
    textAlign: "center",
    fontFamily: Fonts.PoppinsSemiBold,
  },

  description: {
    marginTop: 8,
    fontSize: 13,
    color: "#667085",
    textAlign: "center",
    fontFamily: Fonts.PoppinsRegular,
    lineHeight: 22,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 22,
    width: "100%",
  },

  noButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  yesButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryColor,
    justifyContent: "center",
    alignItems: "center",
  },

  noText: {
    color: "#344054",
    fontFamily: Fonts.PoppinsMedium,
  },

  yesText: {
    color: Colors.white,
    fontFamily: Fonts.PoppinsSemiBold,
  },

});

export default HomePage;