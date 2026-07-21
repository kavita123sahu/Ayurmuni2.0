






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
  ActivityIndicator,
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
import { product } from '../../common/DataInterface';
import TopDoctorsCard from './TopDoctorsCard';
import *as _ASSESSMENT_SERVICE from '../../services/AssesmentService'
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useLocation } from '../../context/LocationContext';
import HomeCategory from './HomeCategory';
import SuggestedCard from '../../components/SuggestedCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { useScrollHide } from '../../context/ScrollHideContext';
import {
  getHomeHeaderTotalHeight,
  getScreenBottomPadding,
} from '../../constants/layout';
import { useHomeData } from '../../hooks/UseHomeData';
import { AppointmentSkeletonList, HomeCategorySkeleton, HorizontalAppointmentSkeleton, TopDoctorsCardSkeleton, TopSellingListSkeleton } from '../../simmerScreen/ShimmerHook';
import RenderAppoint from '../../components/RenderAppoint';
import { useAppointmentHistory } from '../../hooks/useConsultData';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { requireAuth, navigateToLogin } from '../../services/guestAuth';
import TablerIcon from '../../components/TablerIcon';


const { width } = Dimensions.get('window');
let prakritiModalShownThisSession = false;

const HomePage: React.FC = (props: any) => {

  const hasFetched = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    categories,
    SuggestDoctor,
    productData,
    customerData,
    setProductData,
    YogaSession,


    loadingCategories,
    loadingDoctors,
    loadingProducts,
    loadingCustomer,
    refreshHomeData
  } = useHomeData();

  console.log("YogaSessionYogaSession", YogaSession)
  const { promptLocationOnHome } = useLocation();
  const { AppointData, refreshUpcoming, loadMore, prefetchUntil, loading, loadingMore, hasMore } =
    useAppointmentHistory();
  const homePrefetchDoneRef = useRef(false);
  const insets = useSafeAreaInsets();
  const {
    onScroll,
    headerContentAnimatedStyle,
    searchBarAnimatedStyle,
    headerShellAnimatedStyle,
  } = useScrollHide();
  const headerTotalHeight = getHomeHeaderTotalHeight(insets);
  const bottomPadding = getScreenBottomPadding(insets);

  const [showPrakritiModal, setShowPrakritiModal] = useState(false);

  const handleSearchPress = useCallback(() => {
    props.navigation.navigate('ProductsScreen');
  }, [props.navigation]);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        promptLocationOnHome();
      }, 600);
      return () => clearTimeout(timer);
    }, [promptLocationOnHome]),
  );

  const normalizedData = useMemo(() => {
    if (!Array.isArray(AppointData)) {
      return [];
    }

    return AppointData.map(item => ({
      consultation_id: item?.consultation_id,
      doctorName: item?.doctor?.doctor_name || "",

      therapies: Array.isArray(item?.rawData?.doctor?.health_diseases)
        ? item.rawData.doctor.health_diseases
          .map((disease: any) => disease.name)
          .join(", ")
        : "",
      date: item?.appointment_date,
      time: item?.start_time,
      status: item?.appointment_status,
      image: item?.doctor?.doctor_image,
      rawData: item,
    }));
  }, [AppointData]);

  const hasUpcomingAppointments = useCallback((items: any[]) => {
    if (!Array.isArray(items) || items.length === 0) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items.some(item => {
      const appointmentDate = new Date(item?.appointment_date);
      if (Number.isNaN(appointmentDate.getTime())) {
        return false;
      }
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate >= today;
    });
  }, []);

  useEffect(() => {
    if (loading || homePrefetchDoneRef.current) {
      return;
    }

    if (AppointData.length === 0) {
      homePrefetchDoneRef.current = true;
      return;
    }

    if (hasUpcomingAppointments(AppointData) || !hasMore) {
      homePrefetchDoneRef.current = true;
      return;
    }

    homePrefetchDoneRef.current = true;
    prefetchUntil(hasUpcomingAppointments, 10);
  }, [loading, AppointData, hasMore, hasUpcomingAppointments, prefetchUntil]);

  const sortedUpcomingAppointments = useMemo(() => {
    if (!Array.isArray(normalizedData)) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Today's date only

    return normalizedData
      .filter(item => {
        const appointmentDate = new Date(item.date);
        appointmentDate.setHours(0, 0, 0, 0);

        return appointmentDate >= today;
      })
      .sort((a, b) => {
        return (
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
        );
      });
  }, [normalizedData]);



  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      homePrefetchDoneRef.current = false;
      await refreshHomeData();
      await refreshUpcoming();
    } finally {
      setRefreshing(false);
    }
  }, [refreshHomeData, refreshUpcoming]);


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
  const progressPercentage = useMemo(() => {
    if (customerData?.prakriti_progress != null) {
      return Math.round(customerData.prakriti_progress);
    }
    return null;
  }, [customerData]);
  useEffect(() => {
    if (
      loadingCustomer ||
      prakritiModalShownThisSession ||
      !customerData ||
      customerData?.prakriti_progress == null ||
      customerData.prakriti_progress >= 100
    ) {
      return;
    }

    prakritiModalShownThisSession = true;
    setShowPrakritiModal(true);
  }, [loadingCustomer, customerData]);

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;

    refreshHomeData();
  }, []);

  const ComingSoonCard = ({ title, icon }: { title: string; icon: string }) => (
    <View style={styles.comingSoonCard}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <Text style={styles.comingSoonTitle}>{title}</Text>

      <Text style={styles.comingSoonSubtitle}>
        We’re preparing personalized recommendations for you.
        Stay tuned for upcoming Ayurvedic wellness features.
      </Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>Coming Soon</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <Animated.View
        style={[
          styles.headerShell,
          { paddingTop: insets.top, paddingHorizontal: 16 },
          headerShellAnimatedStyle,
        ]}
      >
        <Animated.View style={headerContentAnimatedStyle}>
          <HomeHeader
            progress1={Math.round(customerData?.prakriti_progress || 0)}
            progress2={Math.round(customerData?.medical_history_progress || 0)}
          />
        </Animated.View>

        <Animated.View style={[styles.searchDock, searchBarAnimatedStyle]}>
          <SearchBar
            placeholder="Search doctors, medicine and products..."
            onPress={handleSearchPress}
            compact
          />
        </Animated.View>
      </Animated.View>

      <FlatList
        data={[1]}
        keyExtractor={() => 'home'}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primaryColor}
            colors={[Colors.primaryColor]}
            progressViewOffset={headerTotalHeight}
          />
        }
        contentContainerStyle={{
          paddingTop: headerTotalHeight + 8,
          paddingBottom: bottomPadding,
        }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        renderItem={() => (
          <View style={styles.sections}>

            {loadingCategories ? (
              <HomeCategorySkeleton />
            ) : (
              <HomeCategory data={categories} navigation={props.navigation} />
            )}

            <Detailimages
              images={product.images}
              itemWidth={width - 40}
              itemHeight={156}
              DynamicResize="contain"
              autoSlide
            />


            {loading ? (
              <>
                <SectionHeader
                  title="Upcoming Appointments"
                  actionText="View all"
                  onPress={async () => {
                    if (await requireAuth('Please login to view appointments')) {
                      props.navigation.navigate('Appointments');
                    }
                  }}
                />
                <HorizontalAppointmentSkeleton />
              </>
            ) : sortedUpcomingAppointments?.length > 0 ? (
              <>
                <SectionHeader
                  title="Upcoming Appointments"
                  actionText={sortedUpcomingAppointments.length > 1
                    ? 'View all'
                    : ''
                  }
                  onPress={async () => {
                    if (await requireAuth('Please login to view appointments')) {
                      props.navigation.navigate('Appointments');
                    }
                  }}
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
                  onEndReached={() => {
                    if (hasMore && !loadingMore) {
                      loadMore();
                    }
                  }}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    loadingMore ? (
                      <View style={styles.appointmentLoadMore}>
                        <ActivityIndicator size="small" color={Colors.primaryColor} />
                      </View>
                    ) : null
                  }
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
                    nested
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
                  nested
                />


              </>
            ) : null}

            {YogaSession.length > 0 && (
              <>
                <SectionHeader title="Yoga’s" onPress={() => props.navigation.navigate('YogaScreen')} actionText={YogaSession.length > 1
                  ? 'View all'
                  : ''} />

                <SuggestedCard data={YogaSession} navigation={props.navigation} />
              </>)}

            {/* {YogaSession.length > 0 && (
              <>
                <SectionHeader title="Suggested Diet Plan" actionText={YogaSession.length > 1
                  ? 'View all'
                  : ''} />


                <SuggestedCard data={YogaSession} navigation={props.navigation} />
              </>)} */}


            {/* {YogaSession.length > 0 && (
              <>
                <SectionHeader title="Panchakarma" actionText={YogaSession.length > 1
                  ? 'View all'
                  : ''} />

                <SuggestedCard data={YogaSession} navigation={props.navigation} price={true} />
              </>)} */}

            <>

              {YogaSession.length == 0 && (
                <ComingSoonCard
                  title="Personalized Diet Plans"
                  icon="🥗"
                />
              )}
            </>

            <>

              {/* {YogaSession.length == 0 && ( */}
              <ComingSoonCard
                title="Panchakarma"
                icon="🌿"
              />
              {/* )} */}
            </>
          </View>
        )}
      />
      <Modal
        // visible={showPrakritiModal}
        transparent
        visible={
          !!customerData &&
          !loadingCustomer &&
          showPrakritiModal
        }
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
    </View>

  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sections: {
    gap: 4,
  },
  appointmentLoadMore: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    minWidth: 48,
  },
  headerShell: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderColor,
    shadowColor: '#0D614E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  searchDock: {
    width: '100%',
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
  guestApptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  guestApptIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F3F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestApptText: {
    flex: 1,
  },
  guestApptTitle: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  guestApptSub: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginTop: 2,
  },
  comingSoonCard: {
    backgroundColor: '#F8FCF6',
    marginHorizontal: 16,
    marginBottom: 18,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E8D4',
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  icon: {
    fontSize: 28,
  },

  comingSoonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primaryColor,
    marginBottom: 8,
    textAlign: 'center',
  },

  comingSoonSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },

  badge: {
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },

});

export default HomePage;