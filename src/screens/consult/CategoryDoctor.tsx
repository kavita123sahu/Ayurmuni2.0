// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   StyleSheet,
//   StatusBar,
//   FlatList,
//   Text,
//   RefreshControl,
//   Dimensions,
//   ScrollView,
//   TouchableOpacity,
//   Image,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import Header from '../../components/Header';
// import { ExpandableSearch } from '../../components/SearchBar';
// import PromoCard from '../../components/PromoCard';
// import SectionHeader from '../../components/SectionHeader';
// import ProductCard from '../../components/ProductCard';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Colors } from '../../common/Colors';
// import { Images } from '../../common/Images';
// import TablerIcon from '../../components/TablerIcon';
// import AllDoctorCard from '../../components/AllDoctorCard';
// import { Fonts } from '../../common/Fonts';
// import { useAllDoctors } from '../../hooks/useConsultData';
// import {
//   ProductGridSkeleton,
//   DiseaseChipSkeleton,
//   TopDoctorsCardSkeleton,
// } from '../../simmerScreen/ShimmerHook';
// import { useDebounce } from '../../hooks/useDebaunce';
// import { useCategoryProducts } from '../../hooks/useCategoryProducts';
// import { useHealthCategories } from '../../hooks/useHealthCategories';
// import { useAppDispatch, useAppSelector } from '../../store/hooks';
// import { syncCartQuantity } from '../../store/slices/cartSlice';
// import { TogglewishlistProduct } from '../../services/ProductServices';
// import { showSuccessToast } from '../../config/Key';
// import { requireAuth } from '../../services/guestAuth';
// import { navigateToProductDetails } from '../../navigation/productNavigation';
// import {
//   getScreenBottomPadding,
//   FILTER_CHIP_PADDING_H,
//   FILTER_CHIP_PADDING_V,
//   FILTER_CHIP_RADIUS,
// } from '../../constants/layout';
// import {
//   DOCTOR_GRID,
//   getDoctorGridCardWidth,
// } from '../../constants/doctorGridLayout';
// import {
//   getAddQtyBlockMessage,
// } from '../../utils/productStockUtils';
// import { canAddProductWithoutPrescription } from '../../utils/prescriptionUtils';
// import SuggestedCard from '../../components/SuggestedCard';
// import * as _PATIENT from '../../services/PatientServices';
// import * as _YOGA_SERVICES from '../../services/YogaServices';
// import { normalizeDietPlanList } from '../../utils/dietPlanUtils';
// import { mapDietPlanForHome } from '../../store/slices/homeSlice';
// import { normalizeYogaSessionList } from '../../utils/yogaUtils';
// import { itemMatchesHealthConcern } from '../../utils/healthConcernMatch';

// const { width: SCREEN_W } = Dimensions.get('window');
// const H_PAD = 20;
// const GRID_GAP = 10;
// const CARD_W = getDoctorGridCardWidth();
// const PRODUCT_CARD_W = (SCREEN_W - H_PAD * 2 - GRID_GAP) / 2;
// const DIET_YOGA_PREVIEW = 6;

// /**
//  * Consult by Concern → details:
//  * - Specialists for health category
//  * - Disease subcategories from customers/health-categories/?id=
//  * - Products filtered by health_category_id (+ disease when selected)
//  */
// const CategoryDoctor = (props: any) => {
//   const route = useRoute<any>();
//   const navigation = useNavigation<any>();
//   const insets = useSafeAreaInsets();
//   const bottomPadding = getScreenBottomPadding(insets);
//   const dispatch = useAppDispatch();
//   const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
//   const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

//   const [searchText, setSearchText] = useState('');
//   const [searchExpanded, setSearchExpanded] = useState(false);
//   /** Selected disease / subcategory id (null = whole health category) */
//   const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(
//     null,
//   );
//   const [dietPlans, setDietPlans] = useState<any[]>([]);
//   const [yogaSessions, setYogaSessions] = useState<any[]>([]);
//   const [dietLoading, setDietLoading] = useState(false);
//   const [yogaLoading, setYogaLoading] = useState(false);

//   const { categoryName, categoryId,categoryDesc } = route.params || {};
//   const concernId = categoryId ? String(categoryId) : '';
//   const debouncedSearch = useDebounce(searchText, 400);

//   // Diseases = children of health category
//   const {
//     categories: diseases,
//     loading: diseasesLoading,
//     refresh: refreshDiseases,
//   } = useHealthCategories(concernId || null);

//   useEffect(() => {
//     setSelectedDiseaseId(null);
//   }, [concernId]);

//   // Doctors: disease → health_disease_id; category All → health_category_id (never unfiltered)
//   const apiFilters = useMemo(() => {
//     const base: {
//       search?: string;
//       page_size: number;
//       health_disease_id?: string;
//       health_category_id?: string;
//     } = {
//       page_size: 50,
//     };

//     if (debouncedSearch.trim()) {
//       base.search = debouncedSearch.trim();
//     }

//     if (selectedDiseaseId) {
//       base.health_disease_id = selectedDiseaseId;
//     } else if (concernId) {
//       base.health_category_id = concernId;
//     }

//     return base;
//   }, [concernId, selectedDiseaseId, debouncedSearch]);

//   const {
//     loading: doctorsLoading,
//     doctorData,
//     refresh: refreshDoctors,
//     refreshing: doctorsRefreshing,
//   } = useAllDoctors(apiFilters);

//   // Products: always scoped to this health category; narrow by disease when picked
//   const productFilter = useMemo(() => {
//     if (!concernId && !debouncedSearch.trim()) {
//       return {};
//     }

//     return {
//       ...(concernId
//         ? {
//           health_category_id: concernId,
//           ...(selectedDiseaseId
//             ? { health_disease_id: selectedDiseaseId }
//             : {}),
//         }
//         : {}),
//       ...(debouncedSearch.trim()
//         ? { search: debouncedSearch.trim() }
//         : {}),
//     };
//   }, [concernId, selectedDiseaseId, debouncedSearch]);

//   const medicineProducts = useAppSelector(
//     (s: any) => s.home?.medicineProducts ?? [],
//   );
//   const storeProducts = useAppSelector((s: any) => s.home?.storeProducts ?? []);
//   const homeProducts = useMemo(
//     () => [...(medicineProducts || []), ...(storeProducts || [])],
//     [medicineProducts, storeProducts],
//   );
//   const {
//     products,
//     setProducts,
//     loading: productsLoading,
//     loadingMore,
//     refreshing: productsRefreshing,
//     refresh: refreshProducts,
//     loadMore,
//   } = useCategoryProducts(productFilter, homeProducts, {
//     enabled: Boolean(concernId) || Boolean(debouncedSearch.trim()),
//   });

//   const selectedDiseaseName = useMemo(
//     () => diseases.find(d => d.id === selectedDiseaseId)?.name,
//     [diseases, selectedDiseaseId],
//   );

//   const concernMatch = useMemo(
//     () => ({
//       healthCategoryId: concernId || null,
//       healthDiseaseId: selectedDiseaseId,
//       categoryName: categoryName || null,
//       diseaseName: selectedDiseaseName || null,
//       strict: Boolean(concernId),
//     }),
//     [concernId, selectedDiseaseId, categoryName, selectedDiseaseName],
//   );

//   const filterByConcern = useCallback(
//     (list: any[]) =>
//       (Array.isArray(list) ? list : []).filter(item =>
//         itemMatchesHealthConcern(item, concernMatch),
//       ),
//     [concernMatch],
//   );

//   const diseaseIdSet = useMemo(
//     () => new Set(diseases.map(d => String(d.id)).filter(Boolean)),
//     [diseases],
//   );

//   const doctorMatchesConcern = useCallback(
//     (doctor: any) => {
//       if (filterByConcern([doctor]).length > 0) return true;
//       if (!concernId || selectedDiseaseId) return false;
//       const docDiseases = doctor?.health_diseases;
//       if (!Array.isArray(docDiseases)) return false;
//       return docDiseases.some((entry: any) =>
//         diseaseIdSet.has(String(entry?.id ?? entry)),
//       );
//     },
//     [concernId, selectedDiseaseId, filterByConcern, diseaseIdSet],
//   );

//   const doctorList = useMemo(() => {
//     const raw = Array.isArray(doctorData) ? doctorData : [];
//     if (!concernId) return raw;
//     return raw.filter(doctorMatchesConcern);
//   }, [doctorData, concernId, doctorMatchesConcern]);

//   const hasDoctors = doctorList.length > 0;
//   const showDiseases =
//     Boolean(concernId) && (diseasesLoading || diseases.length > 0);

//   const loadConcernDiet = useCallback(async () => {
//     if (!concernId && !debouncedSearch.trim()) {
//       setDietPlans([]);
//       return;
//     }
//     setDietLoading(true);
//     try {
//       const res = await _PATIENT.getDietPlans({
//         type: 'all',
//         page: 1,
//         page_size: 24,
//         ...(selectedDiseaseId
//           ? { health_disease_id: selectedDiseaseId }
//           : concernId
//             ? { health_category_id: concernId }
//             : {}),
//         ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
//       });
//       const list = filterByConcern(normalizeDietPlanList(res))
//         .map(mapDietPlanForHome)
//         .filter(item => item.id)
//         .slice(0, DIET_YOGA_PREVIEW);
//       setDietPlans(list);
//     } catch {
//       setDietPlans([]);
//     } finally {
//       setDietLoading(false);
//     }
//   }, [concernId, selectedDiseaseId, debouncedSearch, filterByConcern]);

//   const loadConcernYoga = useCallback(async () => {
//     if (!concernId && !debouncedSearch.trim()) {
//       setYogaSessions([]);
//       return;
//     }
//     setYogaLoading(true);
//     try {
//       const res = await _YOGA_SERVICES.getYogaSession({
//         ...(selectedDiseaseId
//           ? { health_disease_id: selectedDiseaseId }
//           : concernId
//             ? { health_category_id: concernId }
//             : {}),
//         ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
//       });
//       const list = filterByConcern(normalizeYogaSessionList(res)).slice(
//         0,
//         DIET_YOGA_PREVIEW,
//       );
//       setYogaSessions(list);
//     } catch {
//       setYogaSessions([]);
//     } finally {
//       setYogaLoading(false);
//     }
//   }, [concernId, selectedDiseaseId, debouncedSearch, filterByConcern]);

//   useEffect(() => {
//     loadConcernDiet();
//     loadConcernYoga();
//   }, [loadConcernDiet, loadConcernYoga]);

//   const productMatchList = useMemo(
//     () => (concernId ? filterByConcern(products) : products),
//     [products, concernId, filterByConcern],
//   );

//   // Prefer concern-matched products. If API returned rows but client match
//   // emptied them, keep those rows and label as General Products.
//   // If API returned nothing, hook already fills `products` from home catalog.
//   const scopedProducts = useMemo(() => {
//     if (!concernId) return Array.isArray(products) ? products : [];
//     if (productMatchList.length > 0) return productMatchList;
//     if (Array.isArray(products) && products.length > 0) return products;
//     return [];
//   }, [concernId, productMatchList, products]);

//   const showingGeneralProducts =
//     Boolean(concernId) &&
//     productMatchList.length === 0 &&
//     scopedProducts.length > 0;

//   const productSectionTitle = showingGeneralProducts
//     ? 'General Products'
//     : selectedDiseaseName
//       ? `${selectedDiseaseName} Products`
//       : `${categoryName || 'Related'} Products`;

//   const dietSectionTitle = selectedDiseaseName
//     ? `${selectedDiseaseName} Diet Plans`
//     : `${categoryName || 'Related'} Diet Plans`;

//   const yogaSectionTitle = selectedDiseaseName
//     ? `${selectedDiseaseName} Yoga`
//     : `${categoryName || 'Related'} Yoga`;

//   const onRefresh = useCallback(async () => {
//     await Promise.all([
//       refreshDoctors(),
//       refreshProducts(),
//       refreshDiseases(),
//       loadConcernDiet(),
//       loadConcernYoga(),
//     ]);
//   }, [
//     refreshDoctors,
//     refreshProducts,
//     refreshDiseases,
//     loadConcernDiet,
//     loadConcernYoga,
//   ]);

//   const handleDoctorPress = useCallback(
//     (item: any) => {
//       props.navigation.navigate('DoctorProfile', { doctorData: item });
//     },
//     [props.navigation],
//   );

//   const handleViewAllDoctors = useCallback(() => {
//     navigation.navigate('AllDoctors', {
//       categoryName: categoryName || undefined,
//       ...(selectedDiseaseId
//         ? { health_disease_id: selectedDiseaseId }
//         : { health_category_id: concernId }),
//     });
//   }, [navigation, concernId, categoryName, selectedDiseaseId]);

//   const handleViewAllDiet = useCallback(() => {
//     navigation.navigate('DietScreen', {
//       listType: 'all',
//       health_category_id: concernId || undefined,
//       health_disease_id: selectedDiseaseId || undefined,
//       categoryName: categoryName || undefined,
//     });
//   }, [navigation, concernId, selectedDiseaseId, categoryName]);

//   const handleViewAllYoga = useCallback(() => {
//     navigation.navigate('YogaScreen', {
//       health_category_id: concernId || undefined,
//       health_disease_id: selectedDiseaseId || undefined,
//       categoryName: categoryName || undefined,
//     });
//   }, [navigation, concernId, selectedDiseaseId, categoryName]);

//   const handleCartUpdate = useCallback(
//     async (item: any, newQty: number) => {
//       if (!(await requireAuth('Please login to add items to cart'))) return;
//       const variantId = String(item?.variant_id);
//       if (!variantId) return;
//       const stockMsg = getAddQtyBlockMessage(item, newQty);
//       if (stockMsg) {
//         showSuccessToast(stockMsg, 'error');
//         return;
//       }
//       const currentQty = Number(variantQuantities[variantId] ?? 0);
//       if (newQty > currentQty && !canAddProductWithoutPrescription(item)) {
//         return;
//       }
//       const result = await dispatch(
//         syncCartQuantity({
//           variantId,
//           quantity: newQty,
//           currentQuantity: currentQty,
//           prescriptionRequired: item?.prescription_required,
//         }),
//       );
//       if (syncCartQuantity.rejected.match(result)) {
//         showSuccessToast(
//           (result.payload as string) || 'Failed to update cart',
//           'error',
//         );
//       }
//     },
//     [dispatch, variantQuantities],
//   );

//   const handleWishlist = useCallback(
//     async (item: any) => {
//       if (!(await requireAuth('Please login to save wishlist items'))) return;
//       const old = item?.is_wishlist_item;
//       setProducts(prev =>
//         prev.map(p =>
//           p.variant_id === item.variant_id
//             ? { ...p, is_wishlist_item: !old }
//             : p,
//         ),
//       );
//       try {
//         await TogglewishlistProduct(item.variant_id, 'POST');
//       } catch {
//         setProducts(prev =>
//           prev.map(p =>
//             p.variant_id === item.variant_id
//               ? { ...p, is_wishlist_item: old }
//               : p,
//           ),
//         );
//       }
//     },
//     [setProducts],
//   );

//   const StickyFilters = useMemo(
//     () => (
//       <View>
//         <ExpandableSearch
//           value={searchText}
//           onChangeText={setSearchText}
//           placeholder="Search doctors or products..."
//           showTrigger={false}
//           expanded={searchExpanded}
//           onExpandedChange={setSearchExpanded}
//         />
//         {showDiseases ? (
//           <View style={styles.diseaseSection}>
//             <Text style={styles.diseaseTitle}>Diseases</Text>
//             {diseasesLoading && diseases.length === 0 ? (
//               <DiseaseChipSkeleton />
//             ) : (
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.diseaseRow}
//                 keyboardShouldPersistTaps="handled"
//               >
//                 <TouchableOpacity
//                   style={[
//                     styles.diseaseChip,
//                     !selectedDiseaseId && styles.diseaseChipActive,
//                   ]}
//                   onPress={() => setSelectedDiseaseId(null)}
//                   activeOpacity={0.85}
//                 >
//                   <View style={styles.diseaseChipIconWrap}>
//                     <TablerIcon
//                       name="plus"
//                       size={16}
//                       color={!selectedDiseaseId ? Colors.primaryColor : '#64748B'}
//                     />
//                   </View>
//                   <Text
//                     style={[
//                       styles.diseaseChipText,
//                       !selectedDiseaseId && styles.diseaseChipTextActive,
//                     ]}
//                   >
//                     All
//                   </Text>
//                 </TouchableOpacity>

//                 {diseases.map((item, index) => {
//                   const active = selectedDiseaseId === item.id;
//                   const imageUri =
//                     item?.image_url && typeof item.image_url === 'string'
//                       ? item.image_url
//                       : '';
//                   return (
//                     <TouchableOpacity
//                       key={String(item?.id ?? `disease-${index}`)}
//                       style={[
//                         styles.diseaseChip,
//                         active && styles.diseaseChipActive,
//                       ]}
//                       onPress={() => setSelectedDiseaseId(item.id)}
//                       activeOpacity={0.85}
//                     >
//                       <View style={styles.diseaseChipIconWrap}>
//                         {imageUri ? (
//                           <Image
//                             source={{ uri: imageUri }}
//                             style={styles.diseaseChipImage}
//                             resizeMode="cover"
//                           />
//                         ) : (
//                           <Image
//                             source={Images.cardiology}
//                             style={styles.diseaseChipImage}
//                             resizeMode="cover"
//                           />
//                         )}
//                       </View>
//                       <Text
//                         style={[
//                           styles.diseaseChipText,
//                           active && styles.diseaseChipTextActive,
//                         ]}
//                         numberOfLines={1}
//                       >
//                         {item.name}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </ScrollView>
//             )}
//           </View>
//         ) : null}
//       </View>
//     ),
//     [
//       searchText,
//       searchExpanded,
//       showDiseases,
//       diseasesLoading,
//       diseases,
//       selectedDiseaseId,
//     ],
//   );

//   const ListHeader = useCallback(
//     () => (
//       <>
//         <PromoCard
//           title={`${categoryName}`}
//           desc={`${categoryDesc}`}
//           imageLeftIconName="plus-bag"
//           image={require('../../assets/images/doctorbanner.png')}
//           buttontext="Book an appointment online"
//           showButton={false}
//         />

//         <SectionHeader
//           title={`${categoryName || 'Related'} Doctors`}
//           actionText={doctorList.length > 0 ? 'View all' : ''}
//           onPress={doctorList.length > 0 ? handleViewAllDoctors : undefined}
//         />

//         {doctorsLoading && !hasDoctors ? (
//           <TopDoctorsCardSkeleton count={4} />
//         ) : hasDoctors ? (
//           <View style={styles.doctorGrid}>
//             {doctorList.map((item: any, index: number) => (
//               <View key={String(item?.id ?? item?.doctor_id ?? `doc-${index}`)} style={styles.doctorCardWrap}>
//                 <AllDoctorCard
//                   item={item}
//                   variant="grid"
//                   cardWidth={CARD_W}
//                   onPress={() => handleDoctorPress(item)}
//                 />
//               </View>
//             ))}
//           </View>
//         ) : (
//           <View style={styles.sectionEmptyBox}>
//             <Text style={styles.emptyTitle}>No doctors found</Text>
//             <Text style={styles.emptySub}>
//               No specialists are linked to this concern yet.
//             </Text>
//           </View>
//         )}

//         <SectionHeader
//           title={dietSectionTitle}
//           actionText={dietPlans.length > 0 ? 'View all' : ''}
//           onPress={dietPlans.length > 0 ? handleViewAllDiet : undefined}
//         />
//         {dietLoading && dietPlans.length === 0 ? (
//           <View style={styles.inlineSkeleton}>
//             <TopDoctorsCardSkeleton count={2} />
//           </View>
//         ) : dietPlans.length > 0 ? (
//           <SuggestedCard
//             data={dietPlans}
//             navigation={navigation}
//             home
//             edgeScroll
//           />
//         ) : (
//           <View style={styles.sectionEmptyBox}>
//             <Text style={styles.emptyTitle}>No diet plans</Text>
//             <Text style={styles.emptySub}>
//               Diet plans for this concern will appear here.
//             </Text>
//           </View>
//         )}

//         <SectionHeader
//           title={yogaSectionTitle}
//           actionText={yogaSessions.length > 0 ? 'View all' : ''}
//           onPress={yogaSessions.length > 0 ? handleViewAllYoga : undefined}
//         />
//         {yogaLoading && yogaSessions.length === 0 ? (
//           <View style={styles.inlineSkeleton}>
//             <TopDoctorsCardSkeleton count={2} />
//           </View>
//         ) : yogaSessions.length > 0 ? (
//           <SuggestedCard
//             data={yogaSessions}
//             navigation={navigation}
//             home
//             edgeScroll
//           />
//         ) : (
//           <View style={styles.sectionEmptyBox}>
//             <Text style={styles.emptyTitle}>No yoga sessions</Text>
//             <Text style={styles.emptySub}>
//               Yoga sessions for this concern will appear here.
//             </Text>
//           </View>
//         )}

//         <SectionHeader title={productSectionTitle} />
//         {showingGeneralProducts ? (
//           <Text style={styles.generalHint}>
//             No products tagged for this concern yet — showing general items.
//           </Text>
//         ) : null}
//         {productsLoading && scopedProducts.length === 0 ? (
//           <View style={styles.inlineSkeleton}>
//             <TopDoctorsCardSkeleton count={2} />
//           </View>
//         ) : scopedProducts.length === 0 ? (
//           <View style={styles.sectionEmptyBox}>
//             <Text style={styles.emptyTitle}>No products</Text>
//             <Text style={styles.emptySub}>
//               Products for this concern will appear here.
//             </Text>
//           </View>
//         ) : null}

//         {/* {!productsLoading && products.length > 0 ? (
//           <Text style={styles.resultCount}>
//             {products.length} product{products.length === 1 ? '' : 's'}
//           </Text>
//         ) : null} */}
//       </>
//     ),
//     [
//       categoryName,
//       doctorList.length,
//       doctorsLoading,
//       hasDoctors,
//       doctorList,
//       handleDoctorPress,
//       handleViewAllDoctors,
//       dietSectionTitle,
//       dietPlans,
//       dietLoading,
//       handleViewAllDiet,
//       yogaSectionTitle,
//       yogaSessions,
//       yogaLoading,
//       handleViewAllYoga,
//       productSectionTitle,
//       productsLoading,
//       scopedProducts,
//       showingGeneralProducts,
//       navigation,
//     ],
//   );

//   const renderProduct = useCallback(
//     ({ item }: { item: any }) => {
//       const variantId = String(item?.variant_id);
//       const cartQty = variantQuantities[variantId] ?? 0;
//       return (
//         <View style={styles.cardWrap}>
//           <ProductCard
//             item={item}
//             variant="grid"
//             gridWidth={PRODUCT_CARD_W}
//             cartQty={cartQty}
//             isAdding={addingVariantId === variantId}
//             onPress={() =>
//               navigateToProductDetails(navigation, item.variant_id)
//             }
//             onAdd={() => handleCartUpdate(item, cartQty + 1)}
//             onIncrement={() => handleCartUpdate(item, cartQty + 1)}
//             onDecrement={() => handleCartUpdate(item, Math.max(0, cartQty - 1))}
//             onWishlist={() => handleWishlist(item)}
//           />
//         </View>
//       );
//     },
//     [
//       variantQuantities,
//       addingVariantId,
//       navigation,
//       handleCartUpdate,
//       handleWishlist,
//     ],
//   );

//   const refreshing = doctorsRefreshing || productsRefreshing;
//   const showProductSkeleton = productsLoading && products.length === 0;
//   const hasActiveProductFilters =
//     Boolean(debouncedSearch.trim()) || Boolean(selectedDiseaseId);

//   return (
//     <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
//       <Header
//         title={categoryName || 'Concern'}
//         subtitle="Doctors, products, diet & yoga"
//         onBack={() => navigation.goBack()}
//         onSearchPress={() => setSearchExpanded(true)}
//         // onRefreshPress={onRefresh}
//         showCart
//       />

//       {showProductSkeleton && products.length === 0 && !hasDoctors ? (
//         <View style={styles.pad}>
//           {StickyFilters}
//           <ListHeader />
//           <ProductGridSkeleton cardWidth={PRODUCT_CARD_W} gap={GRID_GAP} count={6} />
//         </View>
//       ) : (
//         <View style={{ flex: 1 }}>
//           {StickyFilters}
//           <FlatList
//             data={scopedProducts}
//             keyExtractor={(item, i) => String(item.variant_id || item.id || i)}
//             numColumns={2}
//             renderItem={renderProduct}
//             ListHeaderComponent={ListHeader}
//             keyboardShouldPersistTaps="handled"
//             keyboardDismissMode="on-drag"
//             contentContainerStyle={[
//               styles.listContent,
//               { paddingBottom: bottomPadding },
//             ]}
//             columnWrapperStyle={
//               scopedProducts.length > 0 ? styles.columnWrap : undefined
//             }
//             showsVerticalScrollIndicator={false}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={onRefresh}
//                 colors={[Colors.primaryColor]}
//                 tintColor={Colors.primaryColor}
//               />
//             }
//             onEndReached={loadMore}
//             onEndReachedThreshold={0.35}
//             ListFooterComponent={
//               loadingMore ? (
//                 <ProductGridSkeleton
//                   cardWidth={PRODUCT_CARD_W}
//                   gap={GRID_GAP}
//                   count={2}
//                 />
//               ) : null
//             }
//           />
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default CategoryDoctor;

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     paddingHorizontal: H_PAD,
//     backgroundColor: '#FDFDFB',
//   },
//   pad: { flex: 1 },
//   listContent: {
//     flexGrow: 1,
//   },
//   columnWrap: {
//     justifyContent: 'space-between',
//   },
//   cardWrap: {
//     width: PRODUCT_CARD_W,
//     marginBottom: 4,
//   },
//   doctorGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     rowGap: DOCTOR_GRID.gap,
//     marginBottom: 8,
//   },
//   doctorCardWrap: {
//     width: CARD_W,
//   },
//   inlineSkeleton: {
//     marginBottom: 8,
//   },
//   diseaseSection: {
//     marginBottom: 6,
//     marginTop: 2,
//   },
//   diseaseTitle: {

//     // fontSize: TYPO.lg + 1,
//     fontSize: 17,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsSemiBold,
//     marginBottom: 8,
//   },
//   diseaseRow: {
//     gap: 8,
//     paddingRight: 4,
//     paddingBottom: 2,
//     paddingHorizontal: 0,
//   },
//   diseaseChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     minWidth: 68,
//     // maxWidth: 160,
//     paddingHorizontal: FILTER_CHIP_PADDING_H,
//     paddingVertical: FILTER_CHIP_PADDING_V,
//     borderRadius: FILTER_CHIP_RADIUS,
//     backgroundColor: '#F1F5F9',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   diseaseChipIconWrap: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     overflow: 'hidden',
//     backgroundColor: '#E2E8F0',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   diseaseChipImage: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//   },
//   diseaseChipActive: {
//     backgroundColor: '#EAF8F4',
//     borderColor: Colors.primaryColor,
//   },
//   diseaseChipText: {
//     fontSize: 12,
//     color: '#475569',
//     fontFamily: Fonts.PoppinsMedium,
//     textAlign: 'center',
//   },
//   diseaseChipTextActive: {
//     color: Colors.primaryColor,
//     fontFamily: Fonts.PoppinsSemiBold,
//   },
//   resultCount: {
//     marginBottom: 8,
//     marginTop: -2,
//     fontSize: 12,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsRegular,
//   },
//   emptyBox: {
//     paddingVertical: 36,
//     alignItems: 'center',
//   },
//   sectionEmptyBox: {
//     paddingVertical: 18,
//     paddingHorizontal: 12,
//     marginBottom: 10,
//     borderRadius: 12,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     alignItems: 'center',
//   },
//   generalHint: {
//     marginBottom: 8,
//     marginHorizontal: 2,
//     fontSize: 12,
//     lineHeight: 17,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsRegular,
//   },
//   emptyTitle: {
//     fontSize: 15,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsSemiBold,
//     textAlign: 'center',
//   },
//   emptySub: {
//     marginTop: 4,
//     fontSize: 12,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsRegular,
//     textAlign: 'center',
//   },
// });


import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  FlatList,
  Text,
  RefreshControl,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import { ExpandableSearch } from '../../components/SearchBar';
import PromoCard from '../../components/PromoCard';
import SectionHeader from '../../components/SectionHeader';
import ProductCard from '../../components/ProductCard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import { Images } from '../../common/Images';
import TablerIcon from '../../components/TablerIcon';
import AllDoctorCard from '../../components/AllDoctorCard';
import { Fonts } from '../../common/Fonts';
import { useAllDoctors } from '../../hooks/useConsultData';
import {
  ProductGridSkeleton,
  DiseaseChipSkeleton,
  TopDoctorsCardSkeleton,
} from '../../simmerScreen/ShimmerHook';
import { useDebounce } from '../../hooks/useDebaunce';
import { useCategoryProducts } from '../../hooks/useCategoryProducts';
import { useHealthCategories } from '../../hooks/useHealthCategories';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { syncCartQuantity } from '../../store/slices/cartSlice';
import {
  TogglewishlistProduct,
  getHealthCategories,
  mapProductCategory,
  normalizeApiList,
  parseHealthSymptoms,
} from '../../services/ProductServices';
import { apiClient } from '../../services/APIconfig';
import { showSuccessToast } from '../../config/Key';
import { requireAuth } from '../../services/guestAuth';
import { navigateToProductDetails } from '../../navigation/productNavigation';
import {
  getScreenBottomPadding,
  FILTER_CHIP_PADDING_H,
  FILTER_CHIP_PADDING_V,
  FILTER_CHIP_RADIUS,
} from '../../constants/layout';
import {
  DOCTOR_GRID,
  getDoctorGridCardWidth,
} from '../../constants/doctorGridLayout';
import {
  getAddQtyBlockMessage,
} from '../../utils/productStockUtils';
import { canAddProductWithoutPrescription } from '../../utils/prescriptionUtils';
import SuggestedCard from '../../components/SuggestedCard';
import * as _PATIENT from '../../services/PatientServices';
import * as _YOGA_SERVICES from '../../services/YogaServices';
import { normalizeDietPlanList } from '../../utils/dietPlanUtils';
import { mapDietPlanForHome } from '../../store/slices/homeSlice';
import { normalizeYogaSessionList } from '../../utils/yogaUtils';
import { itemMatchesHealthConcern } from '../../utils/healthConcernMatch';
import { useHomeData } from '../../hooks/UseHomeData';
import { getServiceCategoryId } from '../../utils/serviceCategoryUtils';

const { width: SCREEN_W } = Dimensions.get('window');
const H_PAD = 20;
const GRID_GAP = 10;
const CARD_W = getDoctorGridCardWidth();
const PRODUCT_CARD_W = (SCREEN_W - H_PAD * 2 - GRID_GAP) / 2;
const DIET_YOGA_PREVIEW = 6;
const CATALOG_PREVIEW = 6;

/**
 * Consult by Concern → details:
 * - Specialists for health category
 * - Disease subcategories from customers/health-categories/?id=
 * - Products filtered by health_category_id (+ disease when selected)
 */
const CategoryDoctor = (props: any) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const bottomPadding = getScreenBottomPadding(insets);
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

  const [searchText, setSearchText] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  /** Selected disease / subcategory id (null = whole health category) */
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(
    null,
  );
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [yogaSessions, setYogaSessions] = useState<any[]>([]);
  const [dietLoading, setDietLoading] = useState(false);
  const [yogaLoading, setYogaLoading] = useState(false);

  const {
    categoryName,
    categoryId,
    categoryDesc,
    categorySubscription,
    categorySymptoms,
    categoryImage,
    categoryTag,
  } = route.params || {};
  const concernId = categoryId ? String(categoryId) : '';

  const routeSymptoms = useMemo(
    () => parseHealthSymptoms(categorySymptoms),
    [categorySymptoms],
  );

  /** Hydrate from health-categories APIs so symptoms always show when present. */
  const [apiConcern, setApiConcern] = useState<{
    name?: string;
    description?: string;
    subscription?: string;
    symptoms: string[];
    image_url?: string;
    service_category_name?: string;
  } | null>(null);

  useEffect(() => {
    if (!concernId) return;
    let cancelled = false;

    const matchConcern = (item: any) =>
      String(
        item?.id ??
        item?.health_category_id ??
        item?.category_id ??
        '',
      ) === concernId;

    const applyFound = (found: any) => {
      if (!found || cancelled) return false;
      const mapped = mapProductCategory(found);
      const symptoms = parseHealthSymptoms(
        found?.symptoms ??
        found?.symptom_list ??
        found?.common_symptoms ??
        mapped.symptoms,
      );
      setApiConcern({
        name: mapped.name,
        description: mapped.description,
        subscription: mapped.subscription,
        symptoms,
        image_url:
          typeof mapped.image_url === 'string' ? mapped.image_url : undefined,
        service_category_name: mapped.service_category_name,
      });
      return symptoms.length > 0;
    };

    (async () => {
      try {
        // 1) user/health-categories/ — includes symptoms in list payloads
        const userRes = await apiClient('user/health-categories/', {
          method: 'GET',
        });
        if (!cancelled) {
          const userList = normalizeApiList(userRes);
          const fromUser = userList.find(matchConcern);
          if (fromUser && applyFound(fromUser)) return;
          if (fromUser) applyFound(fromUser);
        }

        // 2) customers/health-categories/ fallback
        const response = await getHealthCategories();
        if (cancelled || response?.success === false) return;
        const found = normalizeApiList(response).find(matchConcern);
        if (found) applyFound(found);
      } catch (error) {
        console.log('CATEGORY_DOCTOR_CONCERN_META_ERROR =>', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [concernId]);

  const concernSymptoms = useMemo(() => {
    const fromRoute = routeSymptoms;
    const fromApi = Array.isArray(apiConcern?.symptoms)
      ? apiConcern.symptoms
      : [];
    // Prefer whichever source actually has symptoms
    if (fromRoute.length > 0) return fromRoute;
    return fromApi;
  }, [routeSymptoms, apiConcern?.symptoms]);

  const bannerTitle = String(
    categoryName || apiConcern?.name || 'Concern',
  );
  const bannerDesc = String(
    categoryDesc || apiConcern?.description || '',
  ).trim();
  const bannerSubscription = String(
    categorySubscription || apiConcern?.subscription || '',
  ).trim();
  const bannerImage = categoryImage || apiConcern?.image_url || undefined;
  const bannerTag =
    String(categoryTag || apiConcern?.service_category_name || '').trim() ||
    undefined;

  const debouncedSearch = useDebounce(searchText, 400);

  // Diseases = children of health category
  const {
    categories: diseases,
    loading: diseasesLoading,
    refresh: refreshDiseases,
  } = useHealthCategories(concernId || null);

  useEffect(() => {
    setSelectedDiseaseId(null);
  }, [concernId]);

  // Doctors: disease → health_disease_id; category All → health_category_id (never unfiltered)
  const apiFilters = useMemo(() => {
    const base: {
      search?: string;
      page_size: number;
      health_disease_id?: string;
      health_category_id?: string;
    } = {
      page_size: 50,
    };

    if (debouncedSearch.trim()) {
      base.search = debouncedSearch.trim();
    }

    if (selectedDiseaseId) {
      base.health_disease_id = selectedDiseaseId;
    } else if (concernId) {
      base.health_category_id = concernId;
    }

    return base;
  }, [concernId, selectedDiseaseId, debouncedSearch]);

  const {
    loading: doctorsLoading,
    doctorData,
    refresh: refreshDoctors,
    refreshing: doctorsRefreshing,
  } = useAllDoctors(apiFilters);

  const { categories: dashboardCategories } = useHomeData();
  const productsServiceId = useMemo(
    () => getServiceCategoryId(dashboardCategories, 'products'),
    [dashboardCategories],
  );
  const medicineServiceId = useMemo(
    () => getServiceCategoryId(dashboardCategories, 'medicine'),
    [dashboardCategories],
  );

  // Catalog items scoped to this health category; narrow by disease when picked
  const buildCatalogFilter = useCallback(
    (serviceId: string | null) => {
      if (!concernId && !debouncedSearch.trim()) {
        return {};
      }
      return {
        ...(concernId
          ? {
            health_category_id: concernId,
            ...(selectedDiseaseId
              ? { health_disease_id: selectedDiseaseId }
              : {}),
          }
          : {}),
        ...(serviceId ? { service_category_id: serviceId } : {}),
        ...(debouncedSearch.trim()
          ? { search: debouncedSearch.trim() }
          : {}),
      };
    },
    [concernId, selectedDiseaseId, debouncedSearch],
  );

  const productFilter = useMemo(
    () => buildCatalogFilter(productsServiceId),
    [buildCatalogFilter, productsServiceId],
  );
  const medicineFilter = useMemo(
    () => buildCatalogFilter(medicineServiceId),
    [buildCatalogFilter, medicineServiceId],
  );

  const medicineProducts = useAppSelector(
    (s: any) => s.home?.medicineProducts ?? [],
  );
  const storeProducts = useAppSelector((s: any) => s.home?.storeProducts ?? []);
  const homeProducts = useMemo(
    () => [...(medicineProducts || []), ...(storeProducts || [])],
    [medicineProducts, storeProducts],
  );
  const catalogEnabled = Boolean(concernId) || Boolean(debouncedSearch.trim());
  const {
    products,
    setProducts,
    loading: productsLoading,
    refreshing: productsRefreshing,
    refresh: refreshProducts,
  } = useCategoryProducts(
    productFilter,
    productsServiceId ? storeProducts : homeProducts,
    { enabled: catalogEnabled },
  );

  const medicineEnabled = catalogEnabled && Boolean(medicineServiceId);
  const {
    products: medicines,
    setProducts: setMedicines,
    loading: medicinesQueryLoading,
    refreshing: medicinesRefreshing,
    refresh: refreshMedicines,
  } = useCategoryProducts(medicineFilter, medicineProducts, {
    enabled: medicineEnabled,
  });
  const medicinesLoading = medicineEnabled && medicinesQueryLoading;

  const selectedDiseaseName = useMemo(
    () => diseases.find(d => d.id === selectedDiseaseId)?.name,
    [diseases, selectedDiseaseId],
  );

  const concernMatch = useMemo(
    () => ({
      healthCategoryId: concernId || null,
      healthDiseaseId: selectedDiseaseId,
      categoryName: categoryName || null,
      diseaseName: selectedDiseaseName || null,
      strict: Boolean(concernId),
    }),
    [concernId, selectedDiseaseId, categoryName, selectedDiseaseName],
  );

  const filterByConcern = useCallback(
    (list: any[]) =>
      (Array.isArray(list) ? list : []).filter(item =>
        itemMatchesHealthConcern(item, concernMatch),
      ),
    [concernMatch],
  );

  const diseaseIdSet = useMemo(
    () => new Set(diseases.map(d => String(d.id)).filter(Boolean)),
    [diseases],
  );

  const doctorMatchesConcern = useCallback(
    (doctor: any) => {
      if (filterByConcern([doctor]).length > 0) return true;
      if (!concernId || selectedDiseaseId) return false;
      const docDiseases = doctor?.health_diseases;
      if (!Array.isArray(docDiseases)) return false;
      return docDiseases.some((entry: any) =>
        diseaseIdSet.has(String(entry?.id ?? entry)),
      );
    },
    [concernId, selectedDiseaseId, filterByConcern, diseaseIdSet],
  );

  const doctorList = useMemo(() => {
    const raw = Array.isArray(doctorData) ? doctorData : [];
    if (!concernId) return raw;
    return raw.filter(doctorMatchesConcern);
  }, [doctorData, concernId, doctorMatchesConcern]);

  const hasDoctors = doctorList.length > 0;
  const showDiseases =
    Boolean(concernId) && (diseasesLoading || diseases.length > 0);

  const loadConcernDiet = useCallback(async () => {
    if (!concernId && !debouncedSearch.trim()) {
      setDietPlans([]);
      return;
    }
    setDietLoading(true);
    try {
      const res = await _PATIENT.getDietPlans({
        type: 'all',
        page: 1,
        page_size: 24,
        ...(selectedDiseaseId
          ? { health_disease_id: selectedDiseaseId }
          : concernId
            ? { health_category_id: concernId }
            : {}),
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      });
      const list = normalizeDietPlanList(res)
        .map(mapDietPlanForHome)
        .filter(item => item.id)
        .slice(0, DIET_YOGA_PREVIEW);
      setDietPlans(list);
    } catch {
      setDietPlans([]);
    } finally {
      setDietLoading(false);
    }
  }, [concernId, selectedDiseaseId, debouncedSearch, filterByConcern]);

  const loadConcernYoga = useCallback(async () => {
    if (!concernId && !debouncedSearch.trim()) {
      setYogaSessions([]);
      return;
    }
    setYogaLoading(true);
    try {
      const res = await _YOGA_SERVICES.getYogaSession({
        ...(selectedDiseaseId
          ? { health_disease_id: selectedDiseaseId }
          : concernId
            ? { health_category_id: concernId }
            : {}),
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      });
      const list = filterByConcern(normalizeYogaSessionList(res)).slice(
        0,
        DIET_YOGA_PREVIEW,
      );
      setYogaSessions(list);
    } catch {
      setYogaSessions([]);
    } finally {
      setYogaLoading(false);
    }
  }, [concernId, selectedDiseaseId, debouncedSearch, filterByConcern]);

  useEffect(() => {
    loadConcernDiet();
    loadConcernYoga();
  }, [loadConcernDiet, loadConcernYoga]);

  const productMatchList = useMemo(
    () => (concernId ? filterByConcern(products) : products),
    [products, concernId, filterByConcern],
  );

  // Prefer concern-matched products. If API returned rows but client match
  // emptied them, keep those rows and label as General Products.
  // If API returned nothing, hook already fills `products` from home catalog.
  const scopedProducts = useMemo(() => {
    if (!concernId) return Array.isArray(products) ? products : [];
    if (productMatchList.length > 0) return productMatchList;
    if (Array.isArray(products) && products.length > 0) return products;
    return [];
  }, [concernId, productMatchList, products]);

  const showingGeneralProducts =
    Boolean(concernId) &&
    productMatchList.length === 0 &&
    scopedProducts.length > 0;

  const scopedMedicines = useMemo(() => {
    const list = Array.isArray(medicines) ? medicines : [];
    if (!concernId) return list;
    const matched = filterByConcern(list);
    return matched.length > 0 ? matched : list;
  }, [concernId, medicines, filterByConcern]);

  const productPreview = useMemo(
    () => scopedProducts.slice(0, CATALOG_PREVIEW),
    [scopedProducts],
  );
  const medicinePreview = useMemo(
    () => scopedMedicines.slice(0, CATALOG_PREVIEW),
    [scopedMedicines],
  );

  const medicineSectionTitle = selectedDiseaseName
    ? `${selectedDiseaseName} Medicines`
    : `${categoryName || 'Related'} Medicines`;

  const productSectionTitle = showingGeneralProducts
    ? 'General Products'
    : selectedDiseaseName
      ? `${selectedDiseaseName} Products`
      : `${categoryName || 'Related'} Products`;

  const dietSectionTitle = selectedDiseaseName
    ? `${selectedDiseaseName} Diet Plans`
    : `${categoryName || 'Related'} Diet Plans`;

  const yogaSectionTitle = selectedDiseaseName
    ? `${selectedDiseaseName} Yoga`
    : `${categoryName || 'Related'} Yoga`;

  const onRefresh = useCallback(async () => {
    await Promise.all([
      refreshDoctors(),
      refreshProducts(),
      refreshMedicines(),
      refreshDiseases(),
      loadConcernDiet(),
      loadConcernYoga(),
    ]);
  }, [
    refreshDoctors,
    refreshProducts,
    refreshMedicines,
    refreshDiseases,
    loadConcernDiet,
    loadConcernYoga,
  ]);

  const handleDoctorPress = useCallback(
    (item: any) => {
      props.navigation.navigate('DoctorProfile', { doctorData: item });
    },
    [props.navigation],
  );

  const handleViewAllDoctors = useCallback(() => {
    navigation.navigate('AllDoctors', {
      categoryName: categoryName || undefined,
      ...(selectedDiseaseId
        ? { health_disease_id: selectedDiseaseId }
        : { health_category_id: concernId }),
    });
  }, [navigation, concernId, categoryName, selectedDiseaseId]);

  const handleViewAllDiet = useCallback(() => {
    navigation.navigate('DietScreen', {
      listType: 'all',
      health_category_id: concernId || undefined,
      health_disease_id: selectedDiseaseId || undefined,
      categoryName: categoryName || undefined,
    });
  }, [navigation, concernId, selectedDiseaseId, categoryName]);

  const handleViewAllYoga = useCallback(() => {
    navigation.navigate('YogaScreen', {
      health_category_id: concernId || undefined,
      health_disease_id: selectedDiseaseId || undefined,
      categoryName: categoryName || undefined,
    });
  }, [navigation, concernId, selectedDiseaseId, categoryName]);

  const openConcernCatalog = useCallback(
    (serviceId: string | null) => {
      navigation.navigate('CategoryProducts', {
        categoryMode: 'health',
        healthCategoryId: concernId || undefined,
        ...(selectedDiseaseId ? { healthDiseaseId: selectedDiseaseId } : {}),
        ...(serviceId ? { serviceCategoryId: serviceId } : {}),
        categoryName: categoryName || undefined,
      });
    },
    [navigation, concernId, selectedDiseaseId, categoryName],
  );

  const handleViewAllProducts = useCallback(
    () => openConcernCatalog(productsServiceId),
    [openConcernCatalog, productsServiceId],
  );

  const handleViewAllMedicines = useCallback(
    () => openConcernCatalog(medicineServiceId),
    [openConcernCatalog, medicineServiceId],
  );

  const handleCartUpdate = useCallback(
    async (item: any, newQty: number) => {
      if (!(await requireAuth('Please login to add items to cart'))) return;
      const variantId = String(item?.variant_id);
      if (!variantId) return;
      const stockMsg = getAddQtyBlockMessage(item, newQty);
      if (stockMsg) {
        showSuccessToast(stockMsg, 'error');
        return;
      }
      const currentQty = Number(variantQuantities[variantId] ?? 0);
      if (newQty > currentQty && !canAddProductWithoutPrescription(item)) {
        return;
      }
      const result = await dispatch(
        syncCartQuantity({
          variantId,
          quantity: newQty,
          currentQuantity: currentQty,
          prescriptionRequired: item?.prescription_required,
        }),
      );
      if (syncCartQuantity.rejected.match(result)) {
        showSuccessToast(
          (result.payload as string) || 'Failed to update cart',
          'error',
        );
      }
    },
    [dispatch, variantQuantities],
  );

  const handleWishlist = useCallback(
    async (item: any) => {
      if (!(await requireAuth('Please login to save wishlist items'))) return;
      const old = item?.is_wishlist_item;
      const setWish = (value: boolean) => {
        const patch = (prev: any[]) =>
          prev.map(p =>
            p.variant_id === item.variant_id
              ? { ...p, is_wishlist_item: value }
              : p,
          );
        setProducts(patch);
        setMedicines(patch);
      };
      setWish(!old);
      try {
        await TogglewishlistProduct(item.variant_id, 'POST');
      } catch {
        setWish(old);
      }
    },
    [setProducts, setMedicines],
  );

  const StickyFilters = useMemo(
    () => (
      <View>
        <ExpandableSearch
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search doctors or products..."
          showTrigger={false}
          expanded={searchExpanded}
          onExpandedChange={setSearchExpanded}
        />
        {showDiseases ? (
          <View style={styles.diseaseSection}>
            <Text style={styles.diseaseTitle}>Diseases</Text>
            {diseasesLoading && diseases.length === 0 ? (
              <DiseaseChipSkeleton />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.diseaseRow}
                keyboardShouldPersistTaps="handled"
              >
                <TouchableOpacity
                  style={[
                    styles.diseaseChip,
                    !selectedDiseaseId && styles.diseaseChipActive,
                  ]}
                  onPress={() => setSelectedDiseaseId(null)}
                  activeOpacity={0.85}
                >
                  <View style={styles.diseaseChipIconWrap}>
                    <TablerIcon
                      name="plus"
                      size={16}
                      color={!selectedDiseaseId ? Colors.primaryColor : '#64748B'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.diseaseChipText,
                      !selectedDiseaseId && styles.diseaseChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>

                {diseases.map((item, index) => {
                  const active = selectedDiseaseId === item.id;
                  const imageUri =
                    item?.image_url && typeof item.image_url === 'string'
                      ? item.image_url
                      : '';
                  return (
                    <TouchableOpacity
                      key={String(item?.id ?? `disease-${index}`)}
                      style={[
                        styles.diseaseChip,
                        active && styles.diseaseChipActive,
                      ]}
                      onPress={() => setSelectedDiseaseId(item.id)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.diseaseChipIconWrap}>
                        {imageUri ? (
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.diseaseChipImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Image
                            source={Images.cardiology}
                            style={styles.diseaseChipImage}
                            resizeMode="cover"
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.diseaseChipText,
                          active && styles.diseaseChipTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        ) : null}
      </View>
    ),
    [
      searchText,
      searchExpanded,
      showDiseases,
      diseasesLoading,
      diseases,
      selectedDiseaseId,
    ],
  );

  const ListHeader = useCallback(
    () => (
      <>
        <PromoCard
          variant="banner"
          title={bannerTitle}
          desc={bannerDesc}
          subscription={bannerSubscription}
          tag={bannerTag}
          image={bannerImage}
          symptoms={concernSymptoms}
          showButton={false}
        />

        {(doctorsLoading && !hasDoctors) || hasDoctors ? (
          <>
            <SectionHeader
              title={`${categoryName || 'Related'} Doctors`}
              actionText={doctorList.length > 0 ? 'View all' : ''}
              onPress={doctorList.length > 0 ? handleViewAllDoctors : undefined}
            />

            {doctorsLoading && !hasDoctors ? (
              <TopDoctorsCardSkeleton count={4} />
            ) : (
              <View style={styles.doctorGrid}>
                {doctorList.map((item: any, index: number) => (
                  <View
                    key={String(item?.id ?? item?.doctor_id ?? `doc-${index}`)}
                    style={styles.doctorCardWrap}
                  >
                    <AllDoctorCard
                      item={item}
                      variant="grid"
                      cardWidth={CARD_W}
                      onPress={() => handleDoctorPress(item)}
                    />
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}

        {(productsLoading && scopedProducts.length === 0) ||
          scopedProducts.length > 0 ? (
          <>
            <SectionHeader
              title={productSectionTitle}
              actionText={scopedProducts.length > 0 ? 'View all' : ''}
              onPress={
                scopedProducts.length > 0 ? handleViewAllProducts : undefined
              }
            />
            {showingGeneralProducts ? (
              <Text style={styles.generalHint}>
                No products tagged for this concern yet — showing general items.
              </Text>
            ) : null}
            {productsLoading && scopedProducts.length === 0 ? (
              <View style={styles.inlineSkeleton}>
                <TopDoctorsCardSkeleton count={2} />
              </View>
            ) : null}
          </>
        ) : null}

        {/* {!productsLoading && products.length > 0 ? (
          <Text style={styles.resultCount}>
            {products.length} product{products.length === 1 ? '' : 's'}
          </Text>
        ) : null} */}
      </>
    ),
    [
      bannerTitle,
      bannerDesc,
      bannerSubscription,
      bannerImage,
      bannerTag,
      concernSymptoms,
      categoryName,
      doctorList.length,
      doctorsLoading,
      hasDoctors,
      doctorList,
      handleDoctorPress,
      handleViewAllDoctors,
      productSectionTitle,
      productsLoading,
      scopedProducts,
      showingGeneralProducts,
      handleViewAllProducts,
    ],
  );

  const renderProduct = useCallback(
    ({ item }: { item: any }) => {
      const variantId = String(item?.variant_id);
      const cartQty = variantQuantities[variantId] ?? 0;
      return (
        <View style={styles.cardWrap}>
          <ProductCard
            item={item}
            variant="grid"
            gridWidth={PRODUCT_CARD_W}
            cartQty={cartQty}
            isAdding={addingVariantId === variantId}
            onPress={() =>
              navigateToProductDetails(navigation, item.variant_id)
            }
            onAdd={() => handleCartUpdate(item, cartQty + 1)}
            onIncrement={() => handleCartUpdate(item, cartQty + 1)}
            onDecrement={() => handleCartUpdate(item, Math.max(0, cartQty - 1))}
            onWishlist={() => handleWishlist(item)}
          />
        </View>
      );
    },
    [
      variantQuantities,
      addingVariantId,
      navigation,
      handleCartUpdate,
      handleWishlist,
    ],
  );

  /** After the product grid: Medicines → Diet → Yoga */
  const ListFooter = useCallback(
    () => (
      <>
        {(medicinesLoading && scopedMedicines.length === 0) ||
          scopedMedicines.length > 0 ? (
          <>
            <SectionHeader
              title={medicineSectionTitle}
              actionText={scopedMedicines.length > 0 ? 'View all' : ''}
              onPress={
                scopedMedicines.length > 0 ? handleViewAllMedicines : undefined
              }
            />
            {medicinesLoading && scopedMedicines.length === 0 ? (
              <View style={styles.inlineSkeleton}>
                <ProductGridSkeleton
                  cardWidth={PRODUCT_CARD_W}
                  gap={GRID_GAP}
                  count={2}
                />
              </View>
            ) : (
              <View style={styles.productGrid}>
                {medicinePreview.map((item: any, index: number) => (
                  <React.Fragment
                    key={String(item?.variant_id || item?.id || `med-${index}`)}
                  >
                    {renderProduct({ item })}
                  </React.Fragment>
                ))}
              </View>
            )}
          </>
        ) : null}

        {(dietLoading && dietPlans.length === 0) || dietPlans.length > 0 ? (
          <>
            <SectionHeader
              title={dietSectionTitle}
              actionText={dietPlans.length > 0 ? 'View all' : ''}
              onPress={dietPlans.length > 0 ? handleViewAllDiet : undefined}
            />
            {dietLoading && dietPlans.length === 0 ? (
              <View style={styles.inlineSkeleton}>
                <TopDoctorsCardSkeleton count={2} />
              </View>
            ) : (
              <SuggestedCard
                data={dietPlans}
                navigation={navigation}
                home
                edgeScroll
              />
            )}
          </>
        ) : null}

        {(yogaLoading && yogaSessions.length === 0) || yogaSessions.length > 0 ? (
          <>
            <SectionHeader
              title={yogaSectionTitle}
              actionText={yogaSessions.length > 0 ? 'View all' : ''}
              onPress={yogaSessions.length > 0 ? handleViewAllYoga : undefined}
            />
            {yogaLoading && yogaSessions.length === 0 ? (
              <View style={styles.inlineSkeleton}>
                <TopDoctorsCardSkeleton count={2} />
              </View>
            ) : (
              <SuggestedCard
                data={yogaSessions}
                navigation={navigation}
                home
                edgeScroll
              />
            )}
          </>
        ) : null}
      </>
    ),
    [
      medicinesLoading,
      scopedMedicines.length,
      medicineSectionTitle,
      handleViewAllMedicines,
      medicinePreview,
      renderProduct,
      dietSectionTitle,
      dietPlans,
      dietLoading,
      handleViewAllDiet,
      yogaSectionTitle,
      yogaSessions,
      yogaLoading,
      handleViewAllYoga,
      navigation,
    ],
  );

  const refreshing =
    doctorsRefreshing || productsRefreshing || medicinesRefreshing;
  const showProductSkeleton = productsLoading && products.length === 0;
  const hasActiveProductFilters =
    Boolean(debouncedSearch.trim()) || Boolean(selectedDiseaseId);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Header
        title={categoryName || 'Concern'}
        subtitle="Doctors, products, medicines, diet & yoga"
        onBack={() => navigation.goBack()}
        onSearchPress={() => setSearchExpanded(true)}
        // onRefreshPress={onRefresh}
        showCart
      />

      {showProductSkeleton && products.length === 0 && !hasDoctors ? (
        <View style={styles.pad}>
          {StickyFilters}
          <ListHeader />
          <ProductGridSkeleton cardWidth={PRODUCT_CARD_W} gap={GRID_GAP} count={6} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {StickyFilters}
          <FlatList
            data={productPreview}
            keyExtractor={(item, i) => String(item.variant_id || item.id || i)}
            numColumns={2}
            renderItem={renderProduct}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: bottomPadding },
            ]}
            columnWrapperStyle={
              productPreview.length > 0 ? styles.columnWrap : undefined
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primaryColor]}
                tintColor={Colors.primaryColor}
              />
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default CategoryDoctor;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: H_PAD,
    backgroundColor: '#FDFDFB',
  },
  pad: { flex: 1 },
  listContent: {
    flexGrow: 1,
  },
  columnWrap: {
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: PRODUCT_CARD_W,
    marginBottom: 4,
  },
  doctorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: DOCTOR_GRID.gap,
    marginBottom: 8,
  },
  doctorCardWrap: {
    width: CARD_W,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inlineSkeleton: {
    marginBottom: 8,
  },
  diseaseSection: {
    marginBottom: 6,
    marginTop: 2,
  },
  diseaseTitle: {

    // fontSize: TYPO.lg + 1,
    fontSize: 17,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
  },
  diseaseRow: {
    gap: 8,
    paddingRight: 4,
    paddingBottom: 2,
    paddingHorizontal: 0,
  },
  diseaseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 68,
    // maxWidth: 160,
    paddingHorizontal: FILTER_CHIP_PADDING_H,
    paddingVertical: FILTER_CHIP_PADDING_V,
    borderRadius: FILTER_CHIP_RADIUS,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  diseaseChipIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diseaseChipImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  diseaseChipActive: {
    backgroundColor: '#EAF8F4',
    borderColor: Colors.primaryColor,
  },
  diseaseChipText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
  },
  diseaseChipTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  resultCount: {
    marginBottom: 8,
    marginTop: -2,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  emptyBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  sectionEmptyBox: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  generalHint: {
    marginBottom: 8,
    marginHorizontal: 2,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  emptyTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
  emptySub: {
    marginTop: 4,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
  },
});
