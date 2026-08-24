
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
import { SCREEN_THEME } from '../../constants/screenTheme';
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
  HOME_CATEGORY_GAP,
  HOME_SECTION_GAP,
  SCREEN_PADDING_H,
  getHorizontalScrollBleedStyle,
  HORIZONTAL_SCROLL_CONTENT,
} from '../../constants/layout';
import { useHomeData } from '../../hooks/UseHomeData';
import { HomeCategorySkeleton, HorizontalAppointmentSkeleton, TopDoctorsCardSkeleton, TopSellingListSkeleton } from '../../simmerScreen/ShimmerHook';
import RenderAppoint from '../../components/RenderAppoint';
import JoinCallBanner from '../../components/JoinCallBanner';
import CategoryList from '../../components/CategoryList';
import {
  getJoinableAppointment,
  sortAppointmentsByDateTime,
} from '../../utils/appointmentUtils';
import { useUpcomingAppointmentsPreview } from '../../hooks/useConsultData';
import { useHealthConcernCategories } from '../../hooks/useHealthConcernCategories';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { requireAuth, } from '../../services/guestAuth';
import TablerIcon from '../../components/TablerIcon';
import { navigateToSearchScreen } from '../../navigation/productNavigation';
import { useBanners } from '../../hooks/useBanners';
import { CallEvents, CALL_ENDED } from '../../common/Utils';
import AyurmuniBrandShade from '../../components/AyurmuniBrandShade';
import ProductDiscoverySection from '../../components/ProductDiscoverySection';
import ActiveDietHomeCard from '../../components/ActiveDietHomeCard';
import { useActiveDietHome } from '../../hooks/useActiveDietHome';
import { getServiceCategoryId } from '../../utils/serviceCategoryUtils';
import VisitedDoctorHomeCard from '../../components/VisitedDoctorHomeCard';
import {
  mapRecentDoctorToNavPayload,
  useRecentVisitedDoctors,
} from '../../hooks/useRecentVisitedDoctors';


const { width } = Dimensions.get('window');
let prakritiModalShownThisSession = false;

const HomePage: React.FC = (props: any) => {

  const hasFetched = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const {
    images: bannerImages,
    loading: bannersLoading,
    refresh: refreshBanners,
  } = useBanners('home');
  const homeBannerImages = useMemo(() => {
    if (bannerImages.length > 0) return bannerImages;
    // Avoid flashing local require() ids while API banners load
    if (bannersLoading) return [];
    return product.images;
  }, [bannerImages, bannersLoading]);
  const {
    categories,
    SuggestDoctor,
    medicineProducts,
    storeProducts,
    customerData,
    setMedicineProducts,
    setStoreProducts,
    YogaSession,
    dietProducts,
    loadingDiet,
    fetchDietPlans,

    loadingCategories,
    loadingProducts,
    loadingCustomer,
    loadingDoctors,
    refreshHomeData
  } = useHomeData();
console.log("storeProductsstoreProductsstoreProductsstoreProducts",storeProducts)
  const { promptLocationOnHome } = useLocation();
  const { appointments: upcomingAppointments, refreshPreview, loading: loadingAppointments } =
    useUpcomingAppointmentsPreview();
  const medicineCategoryId = useMemo(
    () => getServiceCategoryId(categories, 'medicine'),
    [categories],
  );
  const {
    categories: healthConcerns,
    refresh: refreshHealthConcerns,
  } = useHealthConcernCategories(medicineCategoryId);
  const safeHealthConcerns = Array.isArray(healthConcerns) ? healthConcerns : [];
  const homeHealthConcerns = useMemo(() => {
    if (!safeHealthConcerns.length) return [];
    const targetCount = 10;
    const looped = Array.from({ length: targetCount }, (_, index) => {
      const item = safeHealthConcerns[index % safeHealthConcerns.length];
      return {
        ...item,
        _homeLoopKey: `${item?.id ?? 'concern'}-${index}`,
      };
    });
    return looped;
  }, [safeHealthConcerns]);
  const {
    preview: activeDietPreview,
    loading: loadingActiveDiet,
    refresh: refreshActiveDiet,
  } = useActiveDietHome();
  const {
    doctors: visitedDoctors,
    loading: loadingVisitedDoctors,
    refresh: refreshVisitedDoctors,
  } = useRecentVisitedDoctors();
  const insets = useSafeAreaInsets();

  const {
    onScroll,
    headerContentAnimatedStyle,
    searchBarAnimatedStyle,
    categoryAnimatedStyle,
    headerShellAnimatedStyle,
  } = useScrollHide();
  const headerTotalHeight = getHomeHeaderTotalHeight(insets);
  const bottomPadding = getScreenBottomPadding(insets);

  const [showPrakritiModal, setShowPrakritiModal] = useState(false);

  const handleSearchPress = useCallback(() => {
    const stackNav = props.navigation.getParent?.() || props.navigation;
    navigateToSearchScreen(stackNav);
  }, [props.navigation]);

  const handleViewAllProducts = useCallback(() => {
    const stackNav = props.navigation.getParent?.() || props.navigation;
    stackNav.navigate('ProductsScreen');
  }, [props.navigation]);

  const handleViewAllMedicines = useCallback(() => {
    const stackNav = props.navigation.getParent?.() || props.navigation;
    stackNav.navigate('MedicineScreen');
  }, [props.navigation]);

  useFocusEffect(
    useCallback(() => {
      refreshActiveDiet();
      refreshVisitedDoctors();
    }, [refreshActiveDiet, refreshVisitedDoctors]),
  );

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        promptLocationOnHome();
      }, 600);

      // Only load diet once when empty — avoid refetch while Checkout is open above Home
      if (!dietProducts?.length) {
        fetchDietPlans(false);
      }

      return () => clearTimeout(timer);
    }, [promptLocationOnHome, fetchDietPlans, dietProducts?.length]),
  );

  // Re-evaluate Join banner when the 5‑min window / end time crosses
  const [joinBannerTick, setJoinBannerTick] = useState(0);
  const [endedCallIds, setEndedCallIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Re-check join window often so banner appears as soon as ≤5 min left
    const timer = setInterval(() => setJoinBannerTick(t => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sub = CallEvents.addListener(CALL_ENDED, (...args: unknown[]) => {
      const payload = args[0] as {
        appointmentId?: string;
        consultationId?: string;
      } | undefined;
      const ids = [payload?.appointmentId, payload?.consultationId]
        .map(v => String(v || '').trim())
        .filter(Boolean);
      if (ids.length) {
        setEndedCallIds(prev => {
          const next = new Set(prev);
          ids.forEach(id => next.add(id));
          return next;
        });
      }
      refreshPreview();
      setJoinBannerTick(t => t + 1);
    });
    return () => sub.remove();
  }, [refreshPreview]);

  useFocusEffect(
    useCallback(() => {
      refreshPreview();
    }, [refreshPreview]),
  );

  /** Confirmed upcoming only — join banner never removes items from this list */
  const sortedUpcomingAppointments = useMemo(
    () =>
      sortAppointmentsByDateTime(
        upcomingAppointments.filter(item => {
          const status = String(item?.status || '')
            .trim()
            .toLowerCase();
          return status === 'confirmed';
        }),
      ),
    [upcomingAppointments],
  );

  /**
   * Join banner only (≤5 min / live). Uses a separate copy with ended flags
   * so it never removes or changes items in `sortedUpcomingAppointments`.
   */
  const joinableAppointment = useMemo(() => {
    const bannerSource = sortedUpcomingAppointments.map(item => {
      const candidateIds = [
        item?.appointment_id,
        item?.consultation_id,
        item?.rawData?.id,
        item?.rawData?.appointment?.id,
        item?.rawData?.consultation_id,
      ]
        .map(v => String(v || '').trim())
        .filter(Boolean);
      const wasEnded = candidateIds.some(id => endedCallIds.has(id));
      if (!wasEnded) return item;
      return {
        ...item,
        call_status: 'ended',
        rawData: {
          ...(item.rawData ?? item),
          call_status: 'ended',
          appointment: {
            ...((item.rawData ?? item)?.appointment ?? {}),
            call_status: 'ended',
          },
        },
      };
    });
    return getJoinableAppointment(bannerSource, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick re-checks 5‑min window
  }, [sortedUpcomingAppointments, endedCallIds, joinBannerTick]);

  const homeAppointmentList = useMemo(() => {
    if (!joinableAppointment) {
      return sortedUpcomingAppointments;
    }

    const joinId = joinableAppointment.item.consultation_id;
    return sortedUpcomingAppointments.filter(
      item => item.consultation_id !== joinId,
    );
  }, [sortedUpcomingAppointments, joinableAppointment]);


  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        refreshHomeData(),
        refreshPreview(),
        refreshBanners(),
        refreshHealthConcerns(),
        refreshActiveDiet(),
        refreshVisitedDoctors(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshHomeData, refreshPreview, refreshBanners, refreshHealthConcerns, refreshActiveDiet, refreshVisitedDoctors]);


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

      <View style={styles.comingSoonTextWrap}>
        <Text style={styles.comingSoonTitle}>{title}</Text>

        <Text style={styles.comingSoonSubtitle} numberOfLines={2}>
          We’re preparing personalized recommendations for you.
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Coming Soon</Text>
        </View>
      </View>
    </View>
  );

  const ComingSoonStrip = ({
    items,
  }: {
    items: { title: string; icon: string }[];
  }) => {
    if (!items.length) return null;
    return (
      <View style={styles.comingSoonStrip}>
        <Text style={styles.comingSoonStripTitle}>More wellness soon</Text>
        <View style={styles.comingSoonChips}>
          {items.map(item => (
            <View key={item.title} style={styles.comingSoonChip}>
              <Text style={styles.comingSoonChipIcon}>{item.icon}</Text>
              <Text style={styles.comingSoonChipText} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.comingSoonChipBadge}>
                <Text style={styles.comingSoonChipBadgeText}>Soon</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const hasCatalogModules =
    (storeProducts?.length ?? 0) > 0 ||
    (medicineProducts?.length ?? 0) > 0 ||
    (YogaSession?.length ?? 0) > 0 ||
    (dietProducts?.length ?? 0) > 0;

  const showConsultBrandShade =
    !loadingProducts && !loadingDiet && !hasCatalogModules;

  const comingSoonItems = useMemo(() => {
    const items: { title: string; icon: string }[] = [];
    if (!YogaSession?.length && !dietProducts?.length) {
      items.push({ title: 'Diet & Yoga', icon: '🥗' });
    } else {
      if (!dietProducts?.length) {
        items.push({ title: 'Diet plans', icon: '🥗' });
      }
      if (!YogaSession?.length) {
        items.push({ title: 'Yoga', icon: '🧘' });
      }
    }
    items.push({ title: 'Panchakarma', icon: '🌿' });
    return items;
  }, [YogaSession?.length, dietProducts?.length]);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={SCREEN_THEME.statusBarBackground}
        barStyle={SCREEN_THEME.statusBarStyle}
      />

      <Animated.View
        style={[
          styles.headerShell,
          {
            paddingTop: insets.top || 0,
            paddingHorizontal: SCREEN_PADDING_H,
          },
          headerShellAnimatedStyle,
        ]}
      >
        <Animated.View style={headerContentAnimatedStyle}>
          <HomeHeader
            progress1={Math.round(customerData?.prakriti_progress || 0)}
            progress2={Math.round(customerData?.medical_history_progress || 0)}
            onSearchPress={handleSearchPress}
          />
        </Animated.View>

        <Animated.View style={[styles.searchDock, searchBarAnimatedStyle]}>
          <SearchBar
            placeholder="Search doctors, medicine and products..."
            onPress={handleSearchPress}
            showMicIcon
            onMicPress={handleSearchPress}
            compact
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.categoryDock,
            { marginTop: HOME_CATEGORY_GAP },
            categoryAnimatedStyle,
          ]}
        >
          {loadingCategories ? (
            <HomeCategorySkeleton compact />
          ) : (
            <HomeCategory
              data={categories}
              navigation={props.navigation}
              sticky
            />
          )}
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
          paddingTop: headerTotalHeight,
          paddingBottom: bottomPadding,
        }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        renderItem={() => (
          <View style={styles.sections}>
            {homeBannerImages.length > 0 && (
              <View style={styles.homeSection}>
                <Detailimages
                  images={homeBannerImages}
                  itemWidth={width - SCREEN_PADDING_H * 2}
                  DynamicResize="cover"
                  autoSlide
                  embedded
                  mode="banner"
                  enablePreview={false}
                />
              </View>
            )}

            {activeDietPreview ? (
              <View style={styles.homeSection}>
                <ActiveDietHomeCard
                  data={activeDietPreview}
                  onPress={() => {
                    const stackNav =
                      props.navigation.getParent?.() || props.navigation;
                    stackNav.navigate('DietScreen', {
                      item: { id: activeDietPreview.planId },
                    });
                  }}
                />
              </View>
            ) : null}

            {(joinableAppointment ||
              (!loadingAppointments &&
                (homeAppointmentList?.length ?? 0) > 0)) && (
                <View style={styles.homeSection}>
                  <SectionHeader
                    home
                    title="Upcoming Appointments"
                    actionText={
                      !loadingAppointments && sortedUpcomingAppointments.length > 1
                        ? 'View all'
                        : ''
                    }
                    onPress={async () => {
                      if (await requireAuth('Please login to view appointments')) {
                        props.navigation.navigate('Appointments', {
                          mode: 'upcoming',
                        });
                      }
                    }}
                  />
                  {loadingAppointments ? (
                    <HorizontalAppointmentSkeleton />
                  ) : (
                    <>
                      {joinableAppointment ? (
                        <JoinCallBanner
                          joinable={joinableAppointment}
                          navigation={props.navigation}
                        />
                      ) : null}
                      {homeAppointmentList?.length > 0 ? (
                          <FlatList
                            horizontal
                            data={homeAppointmentList}
                            keyExtractor={(item, index) =>
                              `${item?.consultation_id || index}`
                            }
                            contentContainerStyle={styles.horizontalList}
                            renderItem={({ item }) => (
                              <RenderAppoint
                                item={item}
                                navigation={props.navigation}
                                isHorizontal
                              />
                            )}
                            showsHorizontalScrollIndicator={false}
                          />
                      ) : null}
                    </>
                  )}
                </View>
              )}

            {homeHealthConcerns.length > 0 && (
              <View style={styles.homeSection}>
                <SectionHeader
                  home
                  title="Health Concerns"
                  actionText={
                    safeHealthConcerns.length > 1 ? 'View all' : ''
                  }
                  onPress={() => {
                    const stackNav =
                      props.navigation.getParent?.() || props.navigation;
                    stackNav.navigate('ConsultScreen');
                  }}
                />
                <CategoryList
                  data={homeHealthConcerns}
                  navigation={
                    props.navigation.getParent?.() || props.navigation
                  }
                  doctor
                  variant="concern"
                />
              </View>
            )}

            {(loadingVisitedDoctors && visitedDoctors.length === 0) ||
            visitedDoctors.length > 0 ? (
              <View style={styles.homeSection}>
                <SectionHeader
                  home
                  title="Visited Doctors"
                  actionText={visitedDoctors.length > 1 ? 'View all' : ''}
                  onPress={() => {
                    const stackNav =
                      props.navigation.getParent?.() || props.navigation;
                    stackNav.navigate('ConsultScreen');
                  }}
                />
                {loadingVisitedDoctors && visitedDoctors.length === 0 ? (
                  <HorizontalAppointmentSkeleton />
                ) : (
                  <FlatList
                    horizontal
                    data={visitedDoctors}
                    keyExtractor={(item, index) =>
                      String(item.doctor_id || item.id || index)
                    }
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={({ item }) => (
                      <VisitedDoctorHomeCard
                        item={item}
                        onPress={() => {
                          const stackNav =
                            props.navigation.getParent?.() ||
                            props.navigation;
                          stackNav.navigate('DoctorProfile', {
                            doctorData: mapRecentDoctorToNavPayload(item),
                          });
                        }}
                        onConsultPress={() => {
                          const stackNav =
                            props.navigation.getParent?.() ||
                            props.navigation;
                          stackNav.navigate('DoctorSlot', {
                            doctorDetails: mapRecentDoctorToNavPayload(item),
                          });
                        }}
                      />
                    )}
                  />
                )}
              </View>
            ) : null}

            {loadingDoctors && !(SuggestDoctor?.length > 0) ? (
              <View style={styles.homeSection}>
                <SectionHeader home title="Suggested Doctors" />
                <TopDoctorsCardSkeleton count={4} featured />
              </View>
            ) : null}

            {(SuggestDoctor?.length ?? 0) > 0 && (
              <View style={styles.homeSection}>
                <SectionHeader
                  home
                  title="Suggested Doctors"
                  actionText={(SuggestDoctor?.length ?? 0) > 1 ? 'View all' : ''}
                  onPress={() =>
                    props.navigation.navigate('AllDoctors', {
                      all: true,
                    })
                  }
                />
                <TopDoctorsCard
                  data={Array.isArray(SuggestDoctor) ? SuggestDoctor : []}
                  navigation={props.navigation}
                  layout="grid"
                  limit={4}
                  home
                />
              </View>
            )}


            {loadingProducts && !(storeProducts?.length > 0) ? (
              <View style={styles.homeSection}>
                <SectionHeader home title="Suggested Products" />
                <TopSellingListSkeleton />
              </View>
            ) : null}

            {storeProducts?.length > 0 && (
              <View style={styles.homeSection}>
                <SectionHeader
                  home
                  title="Suggested Products"
                  actionText={storeProducts.length > 1 ? 'View all' : ''}
                  onPress={handleViewAllProducts}
                />
                <TopSellingList
                  data={storeProducts}
                  navigation={props.navigation}
                  setProductData={setStoreProducts}
                  nested
                  home
                />
              </View>
            )}

            <ProductDiscoverySection
              section="featured"
              navigation={props.navigation}
              home
            />
            <ProductDiscoverySection
              section="personalized"
              navigation={props.navigation}
              home
            />
            <ProductDiscoverySection
              section="trending"
              navigation={props.navigation}
              home
            />
            <ProductDiscoverySection
              section="best_sellers"
              navigation={props.navigation}
              home
            />
            <ProductDiscoverySection
              section="new_arrivals"
              navigation={props.navigation}
              home
            />
            <ProductDiscoverySection
              section="recently_viewed"
              navigation={props.navigation}
              home
            />

            {loadingProducts && !(medicineProducts?.length > 0) ? (
              <View style={styles.homeSection}>
                <SectionHeader home title="Suggested Medicines" />
                <TopSellingListSkeleton />
              </View>
            ) : null}

            {medicineProducts?.length > 0 && (
              <View style={styles.homeSection}>
                <SectionHeader
                  home
                  title="Suggested Medicines"
                  actionText={medicineProducts.length > 1 ? 'View all' : ''}
                  onPress={handleViewAllMedicines}
                />
                <TopSellingList
                  data={medicineProducts}
                  navigation={props.navigation}
                  setProductData={setMedicineProducts}
                  nested
                  home
                />
              </View>
            )}

            {(YogaSession?.length ?? 0) > 0 && (
              <View style={styles.homeSection}>
                <SectionHeader
                  home
                  title="Yoga's"
                  actionText={(YogaSession?.length ?? 0) > 1 ? 'View all' : ''}
                  onPress={() =>
                    props.navigation.navigate('YogaScreen', { viewAll: true })
                  }
                />
                <SuggestedCard
                  data={Array.isArray(YogaSession) ? YogaSession : []}
                  navigation={props.navigation}
                  home
                />
              </View>
            )}

            {dietProducts?.length > 0 ? (
              <View style={styles.homeSection}>
                <SectionHeader
                  home
                  title="Diet's"
                  actionText={'View all'}
                  onPress={() =>
                    props.navigation.navigate('DietScreen', {
                      listType: 'all',
                      viewAll: true,
                    })
                  }
                />
                <SuggestedCard
                  data={dietProducts}
                  navigation={props.navigation}
                  home
                />
              </View>
            ) : null}

            {/* {showConsultBrandShade ? ( */}

            {/* ) :  */}
            {comingSoonItems.length > 0 ? (
              <View style={styles.homeSection}>
                <ComingSoonStrip items={comingSoonItems} />
              </View>
            ) : null}

            <View style={styles.homeSection}>
              <AyurmuniBrandShade />
            </View>
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
    paddingHorizontal: SCREEN_PADDING_H,
  },
  sections: {
    gap: HOME_SECTION_GAP,
    paddingBottom: 4,
  },
  homeSection: {
    width: '100%',
  },
  horizontalList: HORIZONTAL_SCROLL_CONTENT,
  comingSoonGroup: {
    gap: 8,
  },
  comingSoonStrip: {
    backgroundColor: '#F3F7F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E8E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  comingSoonStripTitle: {
    fontSize: 12,
    color: '#0F766E',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
  },
  comingSoonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  comingSoonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 6,
    maxWidth: '100%',
  },
  comingSoonChipIcon: {
    fontSize: 13,
  },
  comingSoonChipText: {
    fontSize: 12,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
    maxWidth: 110,
  },
  comingSoonChipBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  comingSoonChipBadgeText: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
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
    backgroundColor: Colors.headerBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    overflow: 'visible',
    justifyContent: 'flex-start',
  },
  categoryDock: {
    ...getHorizontalScrollBleedStyle(),
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
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E8D4',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  comingSoonTextWrap: {
    flex: 1,
  },
  comingSoonTitle: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    marginBottom: 2,
  },
  comingSoonSubtitle: {
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 15,
    fontFamily: Fonts.PoppinsRegular,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 6,
  },
  badgeText: {
    color: '#fff',
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 10,
  },


});

export default HomePage;