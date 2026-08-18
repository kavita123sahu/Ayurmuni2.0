// import React, { useCallback, useMemo, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   Image,
//   StatusBar,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   TextInput,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import SectionHeader from '../../components/SectionHeader';
// import Header from '../../components/Header';
// import { Fonts } from '../../common/Fonts';
// import { Colors } from '../../common/Colors';
// import MealCard from '../../components/MealCard';
// import Detailimages from '../../components/Detailimages';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDietPlans } from '../../hooks/useDietPlans';
// import TablerIcon from '../../components/TablerIcon';
// import {
//   getDietPlanGallery,
//   resolveDietImage,
// } from '../../utils/dietPlanUtils';
// import {
//   DietActiveSkeleton,
//   DietDetailSkeleton,
//   DietListSkeleton,
// } from '../../simmerScreen/ShimmerHook';
// import CommonModal from '../../components/LogoutModal';
// import LinearGradient from 'react-native-linear-gradient';

// const MACRO_COLORS = {
//   Carbs: '#1FA77A',
//   Protein: '#2F6BDE',
//   Fat: '#F4B400',
// };

// const formatKcal = (n: number) =>
//   Math.round(Number(n) || 0).toLocaleString('en-IN');

// const litersLabel = (ml: number) => `${((Number(ml) || 0) / 1000).toFixed(1)}L`;

// const DietScreen = (props: any) => {
//   const routeItem = props?.route?.params?.item;
//   const routeWantsAll =
//     props?.route?.params?.listType === 'all' ||
//     props?.route?.params?.viewAll === true;
//   // Prefer catalog diet_plan_id; never open detail with patient assignment id
//   const initialPlanId = (() => {
//     const catalog =
//       routeItem?.diet_plan_id ||
//       (routeItem?.id &&
//         routeItem?.id !== routeItem?.patient_diet_plan_id
//         ? routeItem.id
//         : null) ||
//       routeItem?.id;
//     return catalog ? String(catalog) : null;
//   })();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [prakritiFilter, setPrakritiFilter] = useState<string>('all');
//   /**
//    * GET /patients/diet-plans/ — suggested (common + doctor-suggested)
//    * GET ?type=all — View all / search catalog
//    */
//   const listType =
//     routeWantsAll || searchQuery.trim() ? ('all' as const) : null;

//   const {
//     plans,
//     selectedPlanId,
//     selectPlan,
//     clearSelection,
//     selectedSummary,
//     planDetail,
//     meals,
//     mealsByDay,
//     nutrition,
//     waterMl,
//     currentDayKey,
//     todayDayKey,
//     planDays,
//     showAllDays,
//     selectDay,
//     selectAllDays,
//     isStarted,
//     loadingList,
//     loadingDetail,
//     starting,
//     refreshing,
//     refresh,
//     startPlan,
//     logMeal,
//     adjustWater,
//     switchPlan,
//     updateStatus,
//     prepareResume,
//     prepareStart,
//     pauseActiveAndResume,
//     pauseActiveAndStart,
//     updatingStatus,
//     patientDietPlanId,
//     activePlan,
//   } = useDietPlans({ initialPlanId, listType });

//   const [switchModalVisible, setSwitchModalVisible] = useState(false);
//   const [switchConflict, setSwitchConflict] = useState<{
//     mode: 'resume' | 'start';
//     activeName: string;
//     activeId: string;
//     targetId: string;
//   } | null>(null);

//   const prakritiOptions = useMemo(() => {
//     const set = new Set<string>();
//     plans.forEach(p => {
//       const value = String(p?.prakriti || '').trim();
//       if (value) set.add(value);
//     });
//     return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
//   }, [plans]);

//   const filteredPlans = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase();
//     return plans.filter(plan => {
//       const prakriti = String(plan?.prakriti || '').trim().toLowerCase();
//       if (prakritiFilter !== 'all' && prakriti !== prakritiFilter.toLowerCase()) {
//         return false;
//       }
//       if (!q) return true;
//       const haystack = [
//         plan?.name,
//         plan?.title,
//         plan?.prakriti,
//         plan?.season,
//         plan?.short_description,
//         ...(Array.isArray(plan?.health_diseases)
//           ? plan.health_diseases.map((d: any) => d?.name)
//           : []),
//       ]
//         .filter(Boolean)
//         .join(' ')
//         .toLowerCase();
//       return haystack.includes(q);
//     });
//   }, [plans, searchQuery, prakritiFilter]);

//   // Soft refresh on focus — keep selected day (handled in hook)
//   const refreshRef = useRef(refresh);
//   refreshRef.current = refresh;
//   useFocusEffect(
//     useCallback(() => {
//       if (selectedPlanId && isStarted) {
//         refreshRef.current();
//       }
//     }, [selectedPlanId, isStarted]),
//   );

//   // Prefer list status so a stale detail payload can't hide Resume for paused plans
//   const assignmentStatus = String(
//     selectedSummary?.patient_assignment_status ||
//     planDetail?.patient_assignment_status ||
//     '',
//   ).toLowerCase();
//   const isPaused = assignmentStatus.includes('pause');

//   const onResumePress = useCallback(async () => {
//     const prep = prepareResume();
//     if (!prep.canResume) {
//       return;
//     }
//     if (prep.needsConfirm && prep.activePlan?.patient_diet_plan_id) {
//       setSwitchConflict({
//         mode: 'resume',
//         activeName: prep.activePlan.name || 'your active plan',
//         activeId: String(prep.activePlan.patient_diet_plan_id),
//         targetId: prep.resumeId,
//       });
//       setSwitchModalVisible(true);
//       return;
//     }
//     await updateStatus('resume');
//   }, [prepareResume, updateStatus]);

//   const onStartPress = useCallback(async () => {
//     const prep = prepareStart();
//     if (!prep.canStart) {
//       return;
//     }
//     if (prep.needsConfirm && prep.activePlan?.patient_diet_plan_id) {
//       setSwitchConflict({
//         mode: 'start',
//         activeName: prep.activePlan.name || 'your active plan',
//         activeId: String(prep.activePlan.patient_diet_plan_id),
//         targetId: prep.startPlanId,
//       });
//       setSwitchModalVisible(true);
//       return;
//     }
//     const catalogId = String(
//       selectedPlanId ||
//       planDetail?.diet_plan_id ||
//       planDetail?.id ||
//       '',
//     );
//     await startPlan(catalogId);
//   }, [prepareStart, startPlan, selectedPlanId, planDetail]);

//   const onConfirmSwitchPlan = useCallback(async () => {
//     if (!switchConflict) return;
//     const ok =
//       switchConflict.mode === 'resume'
//         ? await pauseActiveAndResume(
//           switchConflict.activeId,
//           switchConflict.targetId,
//         )
//         : await pauseActiveAndStart(
//           switchConflict.activeId,
//           switchConflict.targetId,
//         );
//     if (ok) {
//       setSwitchModalVisible(false);
//       setSwitchConflict(null);
//     }
//   }, [switchConflict, pauseActiveAndResume, pauseActiveAndStart]);

//   const onSwitchPlan = () => {
//     Alert.alert(
//       'Switch diet plan',
//       'Pause or stop your current plan before starting another.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Pause & switch',
//           onPress: () => switchPlan('pause'),
//         },
//         {
//           text: 'Stop & switch',
//           style: 'destructive',
//           onPress: () =>
//             switchPlan('stop', 'Switched to another plan'),
//         },
//       ],
//     );
//   };

//   const todayLabel = useMemo(
//     () =>
//       new Date().toLocaleDateString('en-US', {
//         weekday: 'long',
//         month: 'short',
//         day: 'numeric',
//       }),
//     [],
//   );

//   const dayLabel = currentDayKey
//     ? `Day ${currentDayKey.replace(/\D/g, '') || '1'}`
//     : todayLabel;
//   const isViewingToday =
//     String(currentDayKey || '').toLowerCase() ===
//     String(todayDayKey || '').toLowerCase();
//   const selectedDayChip = planDays.find(
//     d => d.dayKey.toLowerCase() === String(currentDayKey || '').toLowerCase(),
//   );

//   const macrosData = [
//     { id: 1, label: 'Carbs', value: nutrition.carbsPct, color: MACRO_COLORS.Carbs },
//     { id: 2, label: 'Protein', value: nutrition.proteinPct, color: MACRO_COLORS.Protein },
//     { id: 3, label: 'Fat', value: nutrition.fatPct, color: MACRO_COLORS.Fat },
//   ];

//   const diseaseText = useMemo(() => {
//     const diseases = selectedSummary?.health_diseases || planDetail?.health_diseases;
//     if (Array.isArray(diseases) && diseases.length) {
//       return diseases.map((d: any) => d?.name).filter(Boolean).join(', ');
//     }
//     return selectedSummary?.short_description || '—';
//   }, [selectedSummary, planDetail]);

//   const priceLabel =
//     selectedSummary?.is_paid === false || Number(selectedSummary?.price) === 0
//       ? 'Free'
//       : `₹${selectedSummary?.price ?? 0}`;

//   const Macro = ({
//     label = '',
//     value = 0,
//     color = '#000',
//   }: {
//     label?: string;
//     value?: number;
//     color?: string;
//   }) => {
//     const safeValue = Math.min(Math.max(value, 0), 100);
//     return (
//       <View style={styles.macroItem}>
//         <View style={styles.macroTop}>
//           <Text style={styles.macroLabel}>{label}</Text>
//           <Text style={[styles.macroPercent, { color }]}>{safeValue}%</Text>
//         </View>
//         <View style={styles.progressBg}>
//           <View
//             style={[
//               styles.progressFill,
//               { width: `${safeValue}%`, backgroundColor: color },
//             ]}
//           />
//         </View>
//       </View>
//     );
//   };

//   const DailyVitalityCard = () => (
//     <View style={styles.DailyCard}>
//       <View style={styles.content}>
//         <View style={styles.circle}>
//           <Text style={styles.calories}>{formatKcal(nutrition.leftKcal)}</Text>
//           <Text style={styles.kcalText}>KCAL LEFT</Text>
//         </View>

//         <View style={styles.info}>
//           <View style={styles.row}>
//             <Text style={styles.label}>Eaten</Text>
//             <Text style={styles.value}>{formatKcal(nutrition.eatenKcal)} kcal</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>Burned</Text>
//             <Text style={[styles.value, styles.green]}>
//               {formatKcal(nutrition.burnedKcal)} kcal
//             </Text>
//           </View>
//           <View style={styles.divider} />
//           <View style={styles.row}>
//             <Text style={styles.goalLabel}>Goal</Text>
//             <Text style={styles.goalValue}>
//               {formatKcal(nutrition.goalKcal)} kcal
//             </Text>
//           </View>
//         </View>
//       </View>

//       <View style={styles.macroRow}>
//         {macrosData.map(item => (
//           <Macro
//             key={item.id}
//             label={item.label}
//             value={item.value}
//             color={item.color}
//           />
//         ))}
//       </View>
//     </View>
//   );

//   const HydrationCard = () => (
//     <View style={styles.Hydrationcard}>
//       <View style={styles.left}>
//         <View style={styles.iconBox}>
//           <Image
//             source={require('../../assets/images/WaterDrop.png')}
//             style={{ height: 20, width: 16 }}
//           />
//         </View>
//         <View>
//           <Text style={styles.Hydrationtitle}>Hydration</Text>
//           <Text style={styles.subtitle}>
//             {litersLabel(waterMl)} of {litersLabel(nutrition.waterGoalMl)} reached
//           </Text>
//         </View>
//       </View>
//       <View style={styles.actions}>
//         <TouchableOpacity style={styles.minus} onPress={() => adjustWater(-250)}>
//           <Text style={styles.btnText}>−</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.plus} onPress={() => adjustWater(250)}>
//           <Text style={styles.plusText}>+</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   const renderPlanCard = ({ item }: { item: any }) => {
//     const diseases =
//       item.health_diseases?.map((d: any) => d.name).filter(Boolean).join(', ') ||
//       '';
//     const isFree = item.is_paid === false || Number(item.price) === 0;
//     const status = String(item.patient_assignment_status || '').toLowerCase();
//     const isActive = status === 'active' || status.includes('start');
//     const isPausedCard = status.includes('pause');

//     return (
//       <TouchableOpacity
//         style={[styles.planCard, isFree ? styles.planCardFree : styles.planCardPaid]}
//         activeOpacity={0.88}
//         onPress={() => selectPlan(item.id)}
//       >
//         <View style={styles.planThumbWrap}>
//           <Image source={resolveDietImage(item)} style={styles.planThumb} />
//           {!isFree && (
//             <LinearGradient
//               colors={['#C9A227', '#E8C77B']}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={styles.planPremiumBadge}
//             >
//               <TablerIcon name="star" size={10} color="#5E4200" />
//               <Text style={styles.planPremiumBadgeText}>PRO</Text>
//             </LinearGradient>
//           )}
//         </View>

//         <View style={styles.planBody}>
//           <View style={styles.planTitleRow}>
//             <Text style={styles.planTitle} numberOfLines={2}>
//               {item.name}
//             </Text>
//             {isActive ? (
//               <View style={styles.activePill}>
//                 <View style={styles.activePillDot} />
//                 <Text style={styles.activePillText}>Active</Text>
//               </View>
//             ) : isPausedCard ? (
//               <View style={styles.pausedPill}>
//                 <Text style={styles.pausedPillText}>Paused</Text>
//               </View>
//             ) : null}
//           </View>

//           {!!diseases && (
//             <Text style={styles.planMeta} numberOfLines={1}>
//               {diseases}
//             </Text>
//           )}

//           <View style={styles.planTags}>
//             {/* {!!item.prakriti && (
//               <View style={styles.tag}>
//                 <Text style={styles.tagText}>{item.prakriti}</Text>
//               </View>
//             )} */}
//             {!!item.season && (
//               <View style={styles.tag}>
//                 <Text style={styles.tagText}>{item.season}</Text>
//               </View>
//             )}
//             <View style={[styles.tag, isFree ? styles.freeTag : styles.paidTag]}>
//               <Text style={[styles.tagText, isFree ? styles.freeTagText : styles.paidTagText]}>
//                 {isFree ? 'Free plan' : `₹${item.price}`}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={[styles.planChevron, isFree ? styles.planChevronFree : styles.planChevronPaid]}>
//           <TablerIcon
//             name="chevron-right"
//             size={16}
//             color={isFree ? Colors.primaryColor : '#8B6914'}
//           />
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // —— LIST ——
//   if (!selectedPlanId) {
//     return (
//       <SafeAreaView style={styles.container} edges={['top']}>
//         <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
//         <Header
//           title="Diet Plans"
//           subtitle={
//             listType === 'all'
//               ? 'All diet plans'
//               : 'Suggested for you'
//           }
//           onBack={() => props.navigation.goBack()}
//         />

//         <View style={styles.searchWrap}>
//           <View style={styles.searchBox}>
//             <TablerIcon name="search" size={18} color="#94A3B8" />
//             <TextInput
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               placeholder="Search diet plans..."
//               placeholderTextColor="#94A3B8"
//               style={styles.searchInput}
//               returnKeyType="search"
//             />
//             {searchQuery.length > 0 ? (
//               <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
//                 <TablerIcon name="x" size={16} color="#94A3B8" />
//               </TouchableOpacity>
//             ) : null}
//           </View>

//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.prakritiRow}
//           >
//             {prakritiOptions.map(option => {
//               const selected = prakritiFilter === option;
//               const label = option === 'all' ? 'All Prakriti' : option;
//               return (
//                 <TouchableOpacity
//                   key={option}
//                   style={[
//                     styles.prakritiChip,
//                     selected && styles.prakritiChipActive,
//                   ]}
//                   onPress={() => setPrakritiFilter(option)}
//                   activeOpacity={0.85}
//                 >
//                   <Text
//                     style={[
//                       styles.prakritiChipText,
//                       selected && styles.prakritiChipTextActive,
//                     ]}
//                   >
//                     {label}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         </View>

//         {loadingList ? (
//           <DietListSkeleton />
//         ) : (
//           <FlatList
//             data={filteredPlans}
//             keyExtractor={(item, index) => item.id || String(index)}
//             renderItem={renderPlanCard}
//             contentContainerStyle={styles.listContent}
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={refresh}
//                 tintColor={Colors.primaryColor}
//               />
//             }
//             ListEmptyComponent={
//               <View style={styles.empty}>
//                 <Text style={styles.emptyTitle}>No diet plans</Text>
//                 <Text style={styles.emptySub}>
//                   {searchQuery || prakritiFilter !== 'all'
//                     ? 'Try another search or prakriti filter.'
//                     : listType === 'all'
//                       ? 'No diet plans in the catalog yet.'
//                       : 'Plans suggested for you will appear here.'}
//                 </Text>
//               </View>
//             }
//           />
//         )}
//       </SafeAreaView>
//     );
//   }

//   // —— DETAIL (not started) ——
//   if (!isStarted) {
//     return (
//       <SafeAreaView style={styles.container} edges={['top']}>
//         <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
//         <Header
//           title="Diet Plan"
//           subtitle={selectedSummary?.name || 'Details'}
//           onBack={() => {
//             if (initialPlanId && plans.length <= 1) {
//               props.navigation.goBack();
//               return;
//             }
//             clearSelection();
//           }}
//         />

//         {loadingDetail ? (
//           <DietDetailSkeleton />
//         ) : (
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={{ paddingBottom: 40 }}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={refresh}
//                 tintColor={Colors.primaryColor}
//               />
//             }
//           >
//             <View style={styles.detailHeroWrap}>
//               {(() => {
//                 const gallery = getDietPlanGallery(
//                   planDetail || selectedSummary,
//                 );
//                 if (gallery.length > 0) {
//                   return (
//                     <Detailimages
//                       images={gallery}
//                       itemHeight={200}
//                       DynamicResize="cover"
//                       mode="product"
//                       enablePreview
//                     />
//                   );
//                 }
//                 return (
//                   <Image
//                     source={resolveDietImage(planDetail || selectedSummary)}
//                     style={styles.detailImage}
//                   />
//                 );
//               })()}
//             </View>

//             <View style={styles.detailCard}>
//               <View style={styles.detailTagRow}>
//                 {!!(selectedSummary?.prakriti || planDetail?.prakriti) && (
//                   <View style={styles.detailTag}>
//                     <Text style={styles.detailTagText}>
//                       {selectedSummary?.prakriti || planDetail?.prakriti}
//                     </Text>
//                   </View>
//                 )}
//                 {!!(selectedSummary?.season || planDetail?.season) && (
//                   <View style={styles.detailTag}>
//                     <Text style={styles.detailTagText}>
//                       {selectedSummary?.season || planDetail?.season}
//                     </Text>
//                   </View>
//                 )}
//                 <View style={[styles.detailTag, styles.detailPriceTag]}>
//                   <Text style={[styles.detailTagText, styles.detailPriceText]}>
//                     {priceLabel}
//                   </Text>
//                 </View>
//               </View>

//               <Text style={styles.detailTitle}>
//                 {selectedSummary?.name || planDetail?.name}
//               </Text>

//               {!!diseaseText && diseaseText !== '—' && (
//                 <Text style={styles.detailFocus}>Focus: {diseaseText}</Text>
//               )}

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Prakriti</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedSummary?.prakriti || planDetail?.prakriti || '—'}
//                 </Text>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Season</Text>
//                 <Text style={styles.detailValue}>
//                   {selectedSummary?.season || planDetail?.season || '—'}
//                 </Text>
//               </View>
//               <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
//                 <Text style={styles.detailLabel}>Health focus</Text>
//                 <Text style={styles.detailValue}>{diseaseText}</Text>
//               </View>
//             </View>

//             {isPaused && patientDietPlanId ? (
//               <TouchableOpacity
//                 style={styles.startBtn}
//                 onPress={onResumePress}
//                 disabled={updatingStatus}
//                 activeOpacity={0.9}
//               >
//                 {updatingStatus ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.startBtnText}>Resume plan</Text>
//                 )}
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity
//                 style={styles.startBtn}
//                 onPress={onStartPress}
//                 disabled={starting || updatingStatus}
//                 activeOpacity={0.9}
//               >
//                 {starting || updatingStatus ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.startBtnText}>Start plan</Text>
//                 )}
//               </TouchableOpacity>
//             )}
//             <Text style={styles.startHint}>
//               {isPaused
//                 ? activePlan &&
//                   String(activePlan.patient_diet_plan_id) !==
//                   String(patientDietPlanId)
//                   ? `"${activePlan.name}" is active. Resume will ask to pause it first.`
//                   : 'This plan is paused. Resume to continue tracking meals.'
//                 : activePlan && String(activePlan.id) !== String(selectedPlanId)
//                   ? `"${activePlan.name}" is active. Start will ask to pause it first.`
//                   : 'After starting, you’ll track today’s meals and nutrition from this plan.'}
//             </Text>
//           </ScrollView>
//         )}

//         <CommonModal
//           visible={switchModalVisible}
//           icon="🔄"
//           title="Switch active diet?"
//           subtitle={
//             switchConflict
//               ? switchConflict.mode === 'resume'
//                 ? `Only one diet can be active. Pause "${switchConflict.activeName}" and resume this plan?`
//                 : `Only one diet can be active. Pause "${switchConflict.activeName}" and start this plan?`
//               : 'Only one diet can be active at a time.'
//           }
//           cancelText="Keep current"
//           confirmText={
//             switchConflict?.mode === 'start' ? 'Pause & start' : 'Pause & resume'
//           }
//           loading={updatingStatus || starting}
//           onClose={() => {
//             if (updatingStatus || starting) return;
//             setSwitchModalVisible(false);
//             setSwitchConflict(null);
//           }}
//           onConfirm={onConfirmSwitchPlan}
//         />
//       </SafeAreaView>
//     );
//   }

//   // —— ACTIVE TRACKING (original Daily Vitality UI) ——
//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

//       <Header
//         title="Diet"
//         subtitle={selectedSummary?.name || 'Track your nutrition'}
//         onBack={() => {
//           if (initialPlanId && !plans.length) {
//             props.navigation.goBack();
//             return;
//           }
//           clearSelection();
//         }}
//       />

//       {loadingDetail && meals.length === 0 && mealsByDay.length === 0 ? (
//         <DietActiveSkeleton />
//       ) : (
//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 100 }}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={refresh}
//               tintColor={Colors.primaryColor}
//             />
//           }
//         >
//           <View style={styles.activeTopRow}>
//             <View style={styles.activeBadge}>
//               <View style={styles.activeDot} />
//               <Text style={styles.activeBadgeText}>
//                 Active · {planDays.length || mealsByDay.length} days
//               </Text>
//             </View>
//             <TouchableOpacity
//               onPress={onSwitchPlan}
//               disabled={updatingStatus}
//               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//             >
//               {updatingStatus ? (
//                 <ActivityIndicator size="small" color={Colors.primaryColor} />
//               ) : (
//                 <Text style={styles.switchLink}>Switch plan</Text>
//               )}
//             </TouchableOpacity>
//           </View>

//           {(planDays.length > 0 || mealsByDay.length > 0) && (
//             <>
//               <SectionHeader
//                 title="All plan days"
//                 actionText={
//                   showAllDays
//                     ? 'All days'
//                     : isViewingToday
//                       ? `Today · ${todayLabel}`
//                       : dayLabel
//                 }
//               />
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.dayChipRow}
//                 style={{ marginBottom: 12 }}
//               >
//                 <TouchableOpacity
//                   style={[
//                     styles.dayChip,
//                     showAllDays && styles.dayChipSelected,
//                   ]}
//                   activeOpacity={0.85}
//                   onPress={selectAllDays}
//                 >
//                   <View style={styles.dayChipTop}>
//                     <Text
//                       style={[
//                         styles.dayChipLabel,
//                         showAllDays && styles.dayChipLabelSelected,
//                       ]}
//                     >
//                       All
//                     </Text>
//                     {showAllDays ? <View style={styles.dayChipDot} /> : null}
//                   </View>
//                   <Text
//                     style={[
//                       styles.dayChipMeta,
//                       showAllDays && styles.dayChipMetaSelected,
//                     ]}
//                   >
//                     {planDays.length || mealsByDay.length}d
//                   </Text>
//                   <View style={styles.dayChipTrack}>
//                     <View
//                       style={[
//                         styles.dayChipFill,
//                         {
//                           width: '100%',
//                           backgroundColor: showAllDays
//                             ? '#FFFFFF'
//                             : Colors.primaryColor,
//                         },
//                       ]}
//                     />
//                   </View>
//                 </TouchableOpacity>

//                 {planDays.map(item => {
//                   const selected =
//                     !showAllDays &&
//                     item.dayKey.toLowerCase() ===
//                     String(currentDayKey || '').toLowerCase();
//                   const shortLabel = String(item.label || '')
//                     .replace(/day\s*/i, 'D')
//                     .trim();
//                   return (
//                     <TouchableOpacity
//                       key={item.dayKey}
//                       style={[
//                         styles.dayChip,
//                         selected && styles.dayChipSelected,
//                         item.isToday && !selected && styles.dayChipToday,
//                       ]}
//                       activeOpacity={0.85}
//                       onPress={() => selectDay(item.dayKey)}
//                     >
//                       <View style={styles.dayChipTop}>
//                         <Text
//                           style={[
//                             styles.dayChipLabel,
//                             selected && styles.dayChipLabelSelected,
//                           ]}
//                           numberOfLines={1}
//                         >
//                           {shortLabel}
//                         </Text>
//                         {item.isToday ? (
//                           <View
//                             style={[
//                               styles.dayChipTodayPill,
//                               selected && styles.dayChipTodayPillOn,
//                             ]}
//                           >
//                             <Text
//                               style={[
//                                 styles.dayChipTodayText,
//                                 selected && styles.dayChipTodayTextOn,
//                               ]}
//                             >
//                               Now
//                             </Text>
//                           </View>
//                         ) : null}
//                       </View>
//                       <Text
//                         style={[
//                           styles.dayChipMeta,
//                           selected && styles.dayChipMetaSelected,
//                         ]}
//                       >
//                         {item.isToday
//                           ? 'Today'
//                           : `${item.mealsDone}/${item.mealsTotal || 0}`}
//                       </Text>
//                       <View style={styles.dayChipTrack}>
//                         <View
//                           style={[
//                             styles.dayChipFill,
//                             {
//                               width: `${item.progressPct}%`,
//                               backgroundColor: selected
//                                 ? '#FFFFFF'
//                                 : Colors.primaryColor,
//                             },
//                           ]}
//                         />
//                       </View>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </ScrollView>
//             </>
//           )}

//           {!showAllDays && (
//             <>
//               <SectionHeader
//                 title="Daily Vitality"
//                 actionText={isViewingToday ? todayLabel : dayLabel}
//               />
//               <DailyVitalityCard />
//               <HydrationCard />
//             </>
//           )}

//           <SectionHeader
//             title={
//               showAllDays
//                 ? 'All days meals'
//                 : isViewingToday
//                   ? "Today's Meals"
//                   : `${dayLabel} Meals`
//             }
//             actionText={
//               showAllDays
//                 ? `${mealsByDay.reduce(
//                   (n, d) => n + d.meals.filter(m => m.status === 'done').length,
//                   0,
//                 )}/${mealsByDay.reduce((n, d) => n + d.meals.length, 0)}`
//                 : `${selectedDayChip?.mealsDone ?? nutrition.mealsDone}/${selectedDayChip?.mealsTotal ?? nutrition.mealsTotal ?? 0
//                 }`
//             }
//           />

//           {showAllDays ? (
//             mealsByDay.length === 0 ? (
//               <View style={styles.empty}>
//                 <Text style={styles.emptyTitle}>No meals in this plan</Text>
//                 <Text style={styles.emptySub}>
//                   Pull to refresh or check back once the plan is updated.
//                 </Text>
//               </View>
//             ) : (
//               mealsByDay.map(dayBlock => (
//                 <View key={dayBlock.dayKey} style={styles.daySection}>
//                   <View style={styles.daySectionHeader}>
//                     <Text style={styles.daySectionTitle}>{dayBlock.label}</Text>
//                     <Text style={styles.daySectionMeta}>
//                       {dayBlock.meals.filter(m => m.status === 'done').length}/
//                       {dayBlock.meals.length} logged
//                     </Text>
//                   </View>
//                   {dayBlock.meals.map(item => (
//                     <MealCard
//                       key={item.id}
//                       data={item}
//                       navigation={props.navigation}
//                       onLog={() => logMeal(item)}
//                     />
//                   ))}
//                 </View>
//               ))
//             )
//           ) : meals.length === 0 ? (
//             <View style={styles.empty}>
//               <Text style={styles.emptyTitle}>No meals for {dayLabel}</Text>
//               <Text style={styles.emptySub}>
//                 Pull to refresh or check back once the plan is updated.
//               </Text>
//             </View>
//           ) : (
//             meals.map(item => (
//               <MealCard
//                 key={item.id}
//                 data={item}
//                 navigation={props.navigation}
//                 onLog={() => logMeal(item)}
//               />
//             ))
//           )}
//         </ScrollView>
//       )}
//     </SafeAreaView>
//   );
// };

// export default DietScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#FDFDFB' },

//   loader: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   listContent: {
//     paddingBottom: 40,
//     paddingTop: 8,
//     gap: 14,
//   },

//   searchWrap: {
//     marginTop: 4,
//     marginBottom: 8,
//     gap: 10,
//   },
//   searchBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     paddingHorizontal: 12,
//     height: 46,
//     gap: 8,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsMedium,
//     paddingVertical: 0,
//   },
//   prakritiRow: {
//     gap: 8,
//     paddingRight: 4,
//   },
//   prakritiChip: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 999,
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   prakritiChipActive: {
//     backgroundColor: '#ECFDF5',
//     borderColor: Colors.primaryColor,
//   },
//   prakritiChipText: {
//     fontSize: 12,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsMedium,
//   },
//   prakritiChipTextActive: {
//     color: Colors.primaryColor,
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   planCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 18,
//     padding: 14,
//     borderWidth: 1.5,
//     shadowColor: '#0B3D32',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.06,
//     shadowRadius: 12,
//     elevation: 3,
//   },

//   planCardFree: {
//     backgroundColor: '#F7FBFA',
//     borderColor: '#C6E7DF',
//   },

//   planCardPaid: {
//     backgroundColor: '#FFFCF5',
//     borderColor: '#E8D5A3',
//   },

//   planThumbWrap: {
//     marginRight: 12,
//     position: 'relative',
//   },

//   planThumb: {
//     width: 72,
//     height: 72,
//     borderRadius: 16,
//     backgroundColor: Colors.cardBackground,
//   },

//   planPremiumBadge: {
//     position: 'absolute',
//     top: -4,
//     left: -4,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 3,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 8,
//   },

//   planPremiumBadgeText: {
//     fontSize: 9,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#5E4200',
//     letterSpacing: 0.4,
//   },

//   planBody: { flex: 1 },

//   planTitleRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: 8,
//   },

//   planTitle: {
//     flex: 1,
//     fontSize: 15,
//     lineHeight: 21,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#14231F',
//   },

//   activePill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: '#E6F4F0',
//     borderRadius: 999,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//   },

//   activePillDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: Colors.primaryColor,
//   },

//   activePillText: {
//     fontSize: 10,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: Colors.primaryColor,
//   },

//   pausedPill: {
//     backgroundColor: '#FFF4E5',
//     borderRadius: 999,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//   },

//   pausedPillText: {
//     fontSize: 10,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#B45309',
//   },

//   planMeta: {
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsRegular,
//     color: '#6B7C76',
//     marginTop: 3,
//   },

//   planTags: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 6,
//     marginTop: 10,
//   },

//   tag: {
//     backgroundColor: '#F1F5F9',
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//   },

//   tagText: {
//     fontSize: 11,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#475569',
//     textTransform: 'capitalize',
//   },

//   freeTag: {
//     backgroundColor: '#E6F4F0',
//   },

//   freeTagText: {
//     color: Colors.primaryColor,
//   },

//   paidTag: {
//     backgroundColor: '#F8EBC4',
//   },

//   paidTagText: {
//     color: '#8B6914',
//   },

//   planChevron: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: 6,
//   },

//   planChevronFree: {
//     backgroundColor: '#E8F3EF',
//   },

//   planChevronPaid: {
//     backgroundColor: '#F8EBC4',
//   },

//   detailHeroWrap: {
//     marginTop: 8,
//     borderRadius: 22,
//     overflow: 'hidden',
//     // backgroundColor: Colors.cardBackground,
//   },

//   detailImage: {
//     width: '100%',
//     height: 200,
//   },

//   detailCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 18,
//     borderWidth: 1,
//     borderColor: '#E8EEF2',
//     marginTop: -28,
//     marginHorizontal: 4,
//   },

//   detailTagRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginBottom: 12,
//   },

//   detailTag: {
//     backgroundColor: '#E6F2F2',
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//   },

//   detailTagText: {
//     fontSize: 11,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: Colors.primaryColor,
//     textTransform: 'capitalize',
//   },

//   detailPriceTag: {
//     backgroundColor: '#F1F5F9',
//   },

//   detailPriceText: {
//     color: '#475569',
//   },

//   detailTitle: {
//     fontSize: 20,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#0F172A',
//     marginBottom: 6,
//   },

//   detailFocus: {
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsRegular,
//     color: '#64748B',
//     marginBottom: 14,
//     textTransform: 'capitalize',
//   },

//   activeTopRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//     marginTop: 4,
//   },

//   activeBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E6F4F0',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 20,
//     gap: 6,
//   },

//   activeDot: {
//     width: 7,
//     height: 7,
//     borderRadius: 4,
//     backgroundColor: Colors.primaryColor,
//   },

//   activeBadgeText: {
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: Colors.primaryColor,
//   },

//   switchLink: {
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: Colors.primaryColor,
//     textDecorationLine: 'underline',
//   },

//   dayChipRow: {
//     gap: 8,
//     paddingRight: 4,
//     paddingBottom: 2,
//   },

//   dayChip: {
//     width: 76,
//     borderRadius: 18,
//     paddingHorizontal: 10,
//     paddingVertical: 9,
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: '#E4EDE9',
//     shadowColor: '#0E4B3A',
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 1,
//   },

//   dayChipSelected: {
//     backgroundColor: Colors.primaryColor,
//     borderColor: Colors.primaryColor,
//     shadowOpacity: 0.16,
//   },

//   dayChipToday: {
//     borderColor: '#9DD4C4',
//     backgroundColor: '#F1FAF6',
//   },

//   dayChipTop: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: 4,
//     minHeight: 18,
//   },

//   dayChipLabel: {
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#16352C',
//     flexShrink: 1,
//   },

//   dayChipLabelSelected: {
//     color: '#FFFFFF',
//   },

//   dayChipDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#D4A84B',
//   },

//   dayChipTodayPill: {
//     backgroundColor: '#D4A84B',
//     borderRadius: 8,
//     paddingHorizontal: 5,
//     paddingVertical: 1,
//   },

//   dayChipTodayPillOn: {
//     backgroundColor: 'rgba(255,255,255,0.22)',
//   },

//   dayChipTodayText: {
//     fontSize: 8,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#1A2E28',
//   },

//   dayChipTodayTextOn: {
//     color: '#FFFFFF',
//   },

//   dayChipMeta: {
//     fontSize: 10,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#6B7C76',
//     marginTop: 3,
//   },

//   dayChipMetaSelected: {
//     color: 'rgba(255,255,255,0.88)',
//   },

//   dayChipTrack: {
//     height: 3,
//     borderRadius: 3,
//     backgroundColor: 'rgba(14,75,58,0.1)',
//     overflow: 'hidden',
//     marginTop: 7,
//   },

//   dayChipFill: {
//     height: 3,
//     borderRadius: 3,
//   },

//   daySection: {
//     marginBottom: 18,
//   },

//   daySectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//     paddingHorizontal: 2,
//   },

//   daySectionTitle: {
//     fontSize: 16,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#0F172A',
//   },

//   daySectionMeta: {
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsMedium,
//     color: Colors.primaryColor,
//   },

//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//   },

//   detailLabel: {
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#64748B',
//   },

//   detailValue: {
//     flex: 1,
//     textAlign: 'right',
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#1E293B',
//     textTransform: 'capitalize',
//   },

//   startBtn: {
//     marginTop: 20,
//     backgroundColor: Colors.primaryColor,
//     borderRadius: 14,
//     paddingVertical: 15,
//     alignItems: 'center',
//   },

//   startBtnText: {
//     color: '#fff',
//     fontSize: 15,
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   startHint: {
//     marginTop: 10,
//     textAlign: 'center',
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsRegular,
//     color: '#94A3B8',
//     paddingHorizontal: 12,
//   },

//   empty: {
//     alignItems: 'center',
//     paddingTop: 60,
//     paddingHorizontal: 24,
//   },

//   emptyTitle: {
//     fontSize: 16,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#1E293B',
//   },

//   emptySub: {
//     marginTop: 6,
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsRegular,
//     color: '#94A3B8',
//     textAlign: 'center',
//   },

//   DailyCard: {
//     backgroundColor: '#0D614E0D',
//     borderRadius: 20,
//     paddingVertical: 25,
//     paddingHorizontal: 25,
//   },

//   content: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   circle: {
//     width: 130,
//     height: 130,
//     borderRadius: 65,
//     borderWidth: 10,
//     borderColor: '#0F5D4A',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   calories: {
//     fontSize: 26,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: Colors.primaryColor,
//     marginBottom: -10,
//   },

//   kcalText: {
//     fontSize: 12,
//     color: Colors.subTextColor,
//     fontFamily: Fonts.PoppinsRegular,
//   },

//   info: {
//     flex: 1,
//     marginLeft: 20,
//   },

//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },

//   label: {
//     color: Colors.subTextColor,
//     fontSize: 14,
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   value: {
//     fontFamily: Fonts.PoppinsSemiBold,
//     fontSize: 14,
//   },

//   green: {
//     color: Colors.primaryColor,
//     fontFamily: Fonts.PoppinsSemiBold,
//     fontSize: 14,
//   },

//   divider: {
//     height: 1,
//     backgroundColor: '#D1D5DB',
//     marginVertical: 10,
//   },

//   goalLabel: {
//     fontSize: 16,
//     color: Colors.subTextColor,
//   },

//   goalValue: {
//     fontSize: 16,
//     color: Colors.black,
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   macroRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 20,
//   },

//   macroItem: { width: '30%' },

//   macroTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },

//   macroLabel: {
//     fontSize: 12,
//     color: Colors.black,
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   macroPercent: {
//     fontSize: 12,
//     color: Colors.black,
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   progressBg: {
//     height: 6,
//     backgroundColor: '#E0E3E2',
//     borderRadius: 11,
//     overflow: 'hidden',
//   },

//   progressFill: {
//     height: 6,
//     borderRadius: 10,
//   },

//   Hydrationcard: {
//     backgroundColor: '#0D614E0D',
//     marginTop: 20,
//     borderRadius: 20,
//     padding: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   left: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   iconBox: {
//     width: 50,
//     height: 50,
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },

//   Hydrationtitle: {
//     fontSize: 16,
//     marginBottom: -5,
//     color: Colors.primaryColor,
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   subtitle: {
//     color: Colors.subTextColor,
//     fontSize: 14,
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   actions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   minus: {
//     width: 45,
//     height: 45,
//     borderRadius: 12,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: Colors.borderColor,
//     marginRight: 10,
//   },

//   plus: {
//     width: 45,
//     height: 45,
//     borderRadius: 12,
//     backgroundColor: '#0F5D4A',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   btnText: {
//     fontSize: 25,
//     color: '#374151',
//   },

//   plusText: {
//     fontSize: 25,
//     color: '#fff',
//   },
// });
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Pressable,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import SectionHeader from '../../components/SectionHeader';
import Header from '../../components/Header';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import MealCard from '../../components/MealCard';
import Detailimages from '../../components/Detailimages';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDietPlans } from '../../hooks/useDietPlans';
import { useDebounce } from '../../hooks/useDebaunce';
import TablerIcon from '../../components/TablerIcon';
import {
  getDietListStatus,
  getDietPlanGallery,
  getDietPlanRatingLabel,
  getDietRepeatCount,
  getDietNextRepeatNumber,
  getDietRepeatSummary,
  canShowDietPlanRateButton,
  normalizeDietPlanList,
  resolveDietImage,
} from '../../utils/dietPlanUtils';
import * as _PATIENT from '../../services/PatientServices';
import {
  DietActiveSkeleton,
  DietDetailSkeleton,
  DietListSkeleton,
} from '../../simmerScreen/ShimmerHook';
import CommonModal from '../../components/LogoutModal';
import DietPlanActionPanel from '../../components/DietPlanActionPanel';
import DietPlanCard from '../../components/DietPlanCard';
import HydrationCard from '../../components/HydrationCard';
import WaterGoalStartModal from '../../components/WaterGoalStartModal';
import { formatRupee } from '../../utils/currencyUtils';
import { showSuccessToast } from '../../config/Key';
import { BUTTON, DIET_UI, RADIUS, SCREEN, SPACING, TYPO } from '../../constants/responsive';
import { consumePendingDietPlanReview } from '../../utils/pendingDietPlanReview';
import {
  hydrateReviewedDietPlans,
  markDietPlanAssignmentReviewed,
} from '../../utils/reviewedDietPlans';

const MACRO_COLORS = {
  Carbs: '#1FA77A',
  Protein: '#2F6BDE',
  Fat: '#F4B400',
};

/** Content width inside DietScreen container (paddingHorizontal: 20). */
const DETAIL_IMAGE_WIDTH = SCREEN.width - 40;

/** Stable chips so filters stay available (not only values on the current page). */
const DEFAULT_PRAKRITI_OPTIONS = [
  'Vata',
  'Pitta',
  'Kapha',
  'Vata-Pitta',
  'Pitta-Kapha',
  'Vata-Kapha',
];

const DEFAULT_DURATION_OPTIONS = ['7', '14', '21', '30', '45', '60'];
const DEFAULT_CALORIE_OPTIONS = ['1200', '1500', '1800', '2000', '2200', '2500'];

type DietFilterKey =
  | 'prakriti'
  | 'disease'
  | 'paid'
  | 'duration'
  | 'calories'
  | 'sort';

type FilterPickOption = {
  label: string;
  value: string;
};

type DiseaseOption = {
  id: string;
  name: string;
};

type FilterCatalog = {
  prakriti: string[];
  diseases: DiseaseOption[];
  durations: string[];
  calories: string[];
};

const ALL_VALUE = 'all';

type DietStatusTab = 'all' | 'active' | 'inactive';

const STATUS_TABS: { key: DietStatusTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

const planDurationValue = (plan: any) =>
  String(
    plan?.duration ??
    plan?.duration_days ??
    plan?.days ??
    plan?.plan_duration ??
    '',
  ).trim();

const planCaloriesValue = (plan: any) =>
  String(
    plan?.calories ??
    plan?.calorie ??
    plan?.daily_calories ??
    plan?.total_calories ??
    plan?.calorie_target ??
    '',
  ).trim();

const mergeFilterCatalog = (
  prev: FilterCatalog,
  plans: any[],
): FilterCatalog => {
  const prakriti = new Set(prev.prakriti);
  const durations = new Set(prev.durations);
  const calories = new Set(prev.calories);
  const diseaseMap = new Map(prev.diseases.map(d => [d.id, d]));

  plans.forEach(plan => {
    const p = String(plan?.prakriti || '').trim();
    if (p) prakriti.add(p);

    const dur = planDurationValue(plan);
    if (dur) durations.add(dur);

    const cal = planCaloriesValue(plan);
    if (cal) calories.add(cal);

    const diseases = Array.isArray(plan?.health_diseases)
      ? plan.health_diseases
      : [];
    diseases.forEach((d: any) => {
      const id = String(d?.id ?? '').trim();
      const name = String(d?.name ?? '').trim();
      if (id && name) diseaseMap.set(id, { id, name });
    });
  });

  const sortNumericLike = (a: string, b: string) => {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return a.localeCompare(b);
  };

  return {
    prakriti: Array.from(prakriti).sort((a, b) => a.localeCompare(b)),
    diseases: Array.from(diseaseMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    durations: Array.from(durations).sort(sortNumericLike),
    calories: Array.from(calories).sort(sortNumericLike),
  };
};

const formatKcal = (n: number) =>
  Math.round(Number(n) || 0).toLocaleString('en-IN');

const litersLabel = (ml: number) => `${((Number(ml) || 0) / 1000).toFixed(1)}L`;

const DietScreen = (props: any) => {
  const routeItem = props?.route?.params?.item;
  const routeWantsAll =
    props?.route?.params?.listType === 'all' ||
    props?.route?.params?.viewAll === true;
  // Prefer catalog diet_plan_id; never open detail with patient assignment id
  const initialPlanId = (() => {
    const catalog =
      routeItem?.diet_plan_id ||
      (routeItem?.id &&
        routeItem?.id !== routeItem?.patient_diet_plan_id
        ? routeItem.id
        : null) ||
      routeItem?.id;
    return catalog ? String(catalog) : null;
  })();
  const [searchQuery, setSearchQuery] = useState('');
  const [prakritiFilter, setPrakritiFilter] = useState(ALL_VALUE);
  const [diseaseFilter, setDiseaseFilter] = useState<DiseaseOption | null>(
    null,
  );
  const [paidFilter, setPaidFilter] = useState(ALL_VALUE);
  const [durationFilter, setDurationFilter] = useState(ALL_VALUE);
  const [caloriesFilter, setCaloriesFilter] = useState(ALL_VALUE);
  const [sortFilter, setSortFilter] = useState(ALL_VALUE);
  const [openFilter, setOpenFilter] = useState<DietFilterKey | null>(null);
  const [filterCatalog, setFilterCatalog] = useState<FilterCatalog>({
    prakriti: DEFAULT_PRAKRITI_OPTIONS,
    diseases: [],
    durations: DEFAULT_DURATION_OPTIONS,
    calories: DEFAULT_CALORIE_OPTIONS,
  });
  const debouncedSearch = useDebounce(searchQuery, 400);

  /**
   * GET /patients/diet-plans/ — suggested (common + doctor-suggested)
   * GET ?type=all — View all catalog (also used when search/filters are active)
   */
  const listType = routeWantsAll ? ('all' as const) : null;

  const listFilters = useMemo(
    () => ({
      search: String(debouncedSearch || '').trim() || undefined,
      prakriti:
        prakritiFilter && prakritiFilter !== ALL_VALUE
          ? prakritiFilter
          : undefined,
      health_disease_id: diseaseFilter?.id || undefined,
      is_paid:
        paidFilter === 'true' || paidFilter === 'false'
          ? paidFilter
          : undefined,
      duration:
        durationFilter && durationFilter !== ALL_VALUE
          ? durationFilter
          : undefined,
      calories:
        caloriesFilter && caloriesFilter !== ALL_VALUE
          ? caloriesFilter
          : undefined,
      sort:
        sortFilter === 'popularity' || sortFilter === 'latest'
          ? sortFilter
          : undefined,
    }),
    [
      debouncedSearch,
      prakritiFilter,
      diseaseFilter,
      paidFilter,
      durationFilter,
      caloriesFilter,
      sortFilter,
    ],
  );

  const {
    plans,
    selectedPlanId,
    selectPlan,
    clearSelection,
    selectedSummary,
    planDetail,
    meals,
    mealsByDay,
    nutrition,
    waterMl,
    updatingWater,
    currentDayKey,
    todayDayKey,
    planDays,
    showAllDays,
    selectDay,
    selectAllDays,
    isStarted,
    loadingList,
    loadingDetail,
    starting,
    refreshing,
    refresh,
    applyDietPlanReview,
    startPlan,
    logMeal,
    updateWaterIntake,
    switchPlan,
    updateStatus,
    completePlan,
    resetPlan,
    repeatPlan,
    pausePlan,
    stopPlan,
    prepareResume,
    prepareStart,
    prepareRepeat,
    prepareSelectPlan,
    pauseActiveAndResume,
    pauseActiveAndStart,
    pauseActiveAndRepeat,
    pauseActiveAndSelect,
    updatingStatus,
    patientDietPlanId,
    activePlan,
    isPlanFullyComplete,
    listStatus,
    completionJson,
    loadingMore,
    hasMore,
    loadMore,
    resolveActiveAssignment,
  } = useDietPlans({ initialPlanId, listType, listFilters });

  const [switchModalVisible, setSwitchModalVisible] = useState(false);
  const [congratsVisible, setCongratsVisible] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    subtitle: string;
    confirmText: string;
    action: 'pause' | 'stop' | 'reset' | 'repeat' | 'switch-pause';
  } | null>(null);
  const [switchConflict, setSwitchConflict] = useState<{
    mode: 'resume' | 'start' | 'repeat' | 'switch';
    activeName: string;
    activeId: string;
    targetId: string;
  } | null>(null);
  const [reviewCheckTick, setReviewCheckTick] = useState(0);
  /** From list tap — always show catalog detail (even when another plan is active). */
  const [browseDetailMode, setBrowseDetailMode] = useState(false);
  const [statusTab, setStatusTab] = useState<DietStatusTab>('all');
  const [startWaterModalVisible, setStartWaterModalVisible] = useState(false);
  const pendingStartRef = useRef<{
    mode: 'direct' | 'switch';
    catalogId: string;
    activeId?: string;
  } | null>(null);
  const didResolveActiveRef = useRef(false);

  // Grow option lists from loaded plans (first fetch + pages); never shrink on filter
  useEffect(() => {
    if (!plans?.length) return;
    setFilterCatalog(prev => mergeFilterCatalog(prev, plans));
  }, [plans]);

  // Quiet seed: fill dropdown options from catalog without blocking list UI
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await _PATIENT.getDietPlans({
          type: 'all',
          page: 1,
          page_size: 50,
        });
        if (cancelled || res?.success === false) return;
        const mapped = normalizeDietPlanList(res);
        if (!mapped.length) return;
        setFilterCatalog(prev => mergeFilterCatalog(prev, mapped));
      } catch (e) {
        console.log('DIET_FILTER_SEED_ERROR', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasActiveListFilters = Boolean(
    String(searchQuery || '').trim() ||
    (prakritiFilter && prakritiFilter !== ALL_VALUE) ||
    diseaseFilter?.id ||
    (paidFilter && paidFilter !== ALL_VALUE) ||
    (durationFilter && durationFilter !== ALL_VALUE) ||
    (caloriesFilter && caloriesFilter !== ALL_VALUE) ||
    (sortFilter && sortFilter !== ALL_VALUE),
  );

  const visiblePlans = useMemo(() => {
    const ranked = [...plans].sort((a, b) => {
      const rank = (p: any) => {
        const st = getDietListStatus(p);
        if (st === 'active') return 0;
        if (st === 'paused') return 1;
        if (st === 'completed' || st === 'stopped') return 2;
        return 3;
      };
      return rank(a) - rank(b);
    });
    if (statusTab === 'active') {
      return ranked.filter(p => getDietListStatus(p) === 'active');
    }
    if (statusTab === 'inactive') {
      return ranked.filter(p => getDietListStatus(p) !== 'active');
    }
    return ranked;
  }, [plans, statusTab]);

  useEffect(() => {
    if (selectedPlanId || loadingList) return;
    if (plans.some(p => getDietListStatus(p) === 'active')) {
      didResolveActiveRef.current = true;
      return;
    }
    if (didResolveActiveRef.current) return;
    didResolveActiveRef.current = true;
    resolveActiveAssignment();
  }, [selectedPlanId, loadingList, plans, resolveActiveAssignment]);

  const clearAllListFilters = useCallback(() => {
    setSearchQuery('');
    setPrakritiFilter(ALL_VALUE);
    setDiseaseFilter(null);
    setPaidFilter(ALL_VALUE);
    setDurationFilter(ALL_VALUE);
    setCaloriesFilter(ALL_VALUE);
    setSortFilter(ALL_VALUE);
    setOpenFilter(null);
  }, []);

  /** Detail / tracking back → all diet list (not Home). */
  const handleBackFromDetail = useCallback(() => {
    setBrowseDetailMode(false);
    clearSelection();
    props.navigation.setParams({
      listType: 'all',
      viewAll: true,
      item: undefined,
    });
  }, [clearSelection, props.navigation]);

  useEffect(() => {
    if (!selectedPlanId) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackFromDetail();
      return true;
    });
    return () => sub.remove();
  }, [selectedPlanId, handleBackFromDetail]);

  const filterChipMeta: {
    key: DietFilterKey;
    title: string;
    active: boolean;
    valueLabel: string;
  }[] = [
      {
        key: 'prakriti',
        title: 'Prakriti',
        active: prakritiFilter !== ALL_VALUE,
        valueLabel:
          prakritiFilter !== ALL_VALUE ? prakritiFilter : 'Prakriti',
      },
      {
        key: 'disease',
        title: 'Disease',
        active: Boolean(diseaseFilter?.id),
        valueLabel: diseaseFilter?.name || 'Disease',
      },
      // {
      //   key: 'paid',
      //   title: 'Paid',
      //   active: paidFilter !== ALL_VALUE,
      //   valueLabel:
      //     paidFilter === 'true'
      //       ? 'Paid'
      //       : paidFilter === 'false'
      //         ? 'Free'
      //         : 'Paid',
      // },
      {
        key: 'duration',
        title: 'Duration',
        active: durationFilter !== ALL_VALUE,
        valueLabel:
          durationFilter !== ALL_VALUE
            ? `${durationFilter}d`
            : 'Duration',
      },
      {
        key: 'calories',
        title: 'Calories',
        active: caloriesFilter !== ALL_VALUE,
        valueLabel:
          caloriesFilter !== ALL_VALUE ? caloriesFilter : 'Calories',
      },
      {
        key: 'sort',
        title: 'Sort',
        active: sortFilter !== ALL_VALUE,
        valueLabel:
          sortFilter === 'popularity'
            ? 'Popular'
            : sortFilter === 'latest'
              ? 'Latest'
              : 'Sort',
      },
    ];

  const dropdownTitle =
    openFilter === 'prakriti'
      ? 'Select Prakriti'
      : openFilter === 'disease'
        ? 'Select Health Disease'
        : openFilter === 'paid'
          ? 'Paid Status'
          : openFilter === 'duration'
            ? 'Select Duration'
            : openFilter === 'calories'
              ? 'Select Calories'
              : openFilter === 'sort'
                ? 'Sort By'
                : '';

  const dropdownOptions: FilterPickOption[] = useMemo(() => {
    if (openFilter === 'prakriti') {
      return [
        { label: 'All Prakriti', value: ALL_VALUE },
        ...filterCatalog.prakriti.map(v => ({ label: v, value: v })),
      ];
    }
    if (openFilter === 'disease') {
      return [
        { label: 'All Diseases', value: ALL_VALUE },
        ...filterCatalog.diseases.map(d => ({
          label: d.name,
          value: d.id,
        })),
      ];
    }
    if (openFilter === 'paid') {
      return [
        { label: 'All', value: ALL_VALUE },
        { label: 'Free', value: 'false' },
        { label: 'Paid', value: 'true' },
      ];
    }
    if (openFilter === 'duration') {
      return [
        { label: 'All Durations', value: ALL_VALUE },
        ...filterCatalog.durations.map(v => ({
          label: `${v} days`,
          value: v,
        })),
      ];
    }
    if (openFilter === 'calories') {
      return [
        { label: 'All Calories', value: ALL_VALUE },
        ...filterCatalog.calories.map(v => ({
          label: `${v} kcal`,
          value: v,
        })),
      ];
    }
    if (openFilter === 'sort') {
      return [
        { label: 'Default', value: ALL_VALUE },
        { label: 'Popularity', value: 'popularity' },
        { label: 'Latest', value: 'latest' },
      ];
    }
    return [];
  }, [openFilter, filterCatalog]);

  const selectedDropdownValue =
    openFilter === 'prakriti'
      ? prakritiFilter
      : openFilter === 'disease'
        ? diseaseFilter?.id || ALL_VALUE
        : openFilter === 'paid'
          ? paidFilter
          : openFilter === 'duration'
            ? durationFilter
            : openFilter === 'calories'
              ? caloriesFilter
              : openFilter === 'sort'
                ? sortFilter
                : ALL_VALUE;

  const onPickFilterOption = useCallback(
    (option: FilterPickOption) => {
      if (openFilter === 'prakriti') {
        setPrakritiFilter(option.value);
      } else if (openFilter === 'disease') {
        if (option.value === ALL_VALUE) {
          setDiseaseFilter(null);
        } else {
          const match = filterCatalog.diseases.find(d => d.id === option.value);
          setDiseaseFilter(
            match || { id: option.value, name: option.label },
          );
        }
      } else if (openFilter === 'paid') {
        setPaidFilter(option.value);
      } else if (openFilter === 'duration') {
        setDurationFilter(option.value);
      } else if (openFilter === 'calories') {
        setCaloriesFilter(option.value);
      } else if (openFilter === 'sort') {
        setSortFilter(option.value);
      }
      setOpenFilter(null);
    },
    [openFilter, filterCatalog.diseases],
  );

  // Soft refresh on focus — avoid re-running when isStarted flips (e.g. after repeat)
  const refreshRef = useRef(refresh);
  const applyReviewRef = useRef(applyDietPlanReview);
  const selectedPlanIdRef = useRef(selectedPlanId);
  refreshRef.current = refresh;
  applyReviewRef.current = applyDietPlanReview;
  selectedPlanIdRef.current = selectedPlanId;
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        await hydrateReviewedDietPlans();
        if (!active) return;

        const pendingReview = consumePendingDietPlanReview();
        if (pendingReview) {
          applyReviewRef.current(pendingReview);
          await markDietPlanAssignmentReviewed(pendingReview.patientDietPlanId);
          refreshRef.current();
        } else if (selectedPlanIdRef.current) {
          refreshRef.current();
        }

        setReviewCheckTick(t => t + 1);
      })();

      return () => {
        active = false;
      };
    }, []),
  );

  // Prefer list status so a stale detail payload can't hide Resume for paused plans
  const isPaused = listStatus === 'paused';
  const isCompletedPlan = listStatus === 'completed';
  const isReviewedPlan = useMemo(
    () => !canShowDietPlanRateButton(selectedSummary || planDetail),
    [selectedSummary, planDetail, reviewCheckTick],
  );

  const openActiveConflict = useCallback(
    (
      mode: 'resume' | 'start' | 'repeat' | 'switch',
      active: { name?: string; patient_diet_plan_id?: string | number; id?: string | number } | null | undefined,
      targetId: string,
    ) => {
      const activeId = String(active?.patient_diet_plan_id || '').trim();
      if (!activeId || !targetId) {
        const activeName = active?.name || 'another diet plan';
        const actionLabel =
          mode === 'repeat'
            ? 'Repeat'
            : mode === 'resume'
              ? 'Resume'
              : mode === 'switch'
                ? 'Open'
                : 'Start';
        showSuccessToast(
          `${activeName} is already active. Open that plan, tap Pause, then ${actionLabel} this one.`,
          'error',
        );
        if (active?.id) {
          selectPlan(String(active.id));
        }
        return false;
      }
      setSwitchConflict({
        mode,
        activeName: active?.name || 'your active plan',
        activeId,
        targetId: String(targetId),
      });
      setSwitchModalVisible(true);
      return true;
    },
    [selectPlan],
  );

  const onPlanCardPress = useCallback(
    (item: any) => {
      const planId = String(item?.id || '').trim();
      if (!planId) return;
      setBrowseDetailMode(true);
      selectPlan(planId);
    },
    [selectPlan],
  );

  const renderPlanCard = useCallback(
    ({ item }: { item: any }) => (
      <DietPlanCard item={item} onPress={onPlanCardPress} />
    ),
    [onPlanCardPress],
  );

  const planKeyExtractor = useCallback(
    (item: any, index: number) => String(item?.id || index),
    [],
  );

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loadingList) {
      loadMore();
    }
  }, [hasMore, loadingMore, loadingList, loadMore]);

  const onResumePress = useCallback(async () => {
    const prep = prepareResume();
    if (!prep.canResume) {
      return;
    }
    if (prep.needsConfirm && prep.activePlan) {
      openActiveConflict('resume', prep.activePlan, prep.resumeId);
      return;
    }
    const ok = await updateStatus('resume');
    if (ok) setBrowseDetailMode(false);
  }, [prepareResume, updateStatus, openActiveConflict]);

  const onStartPress = useCallback(() => {
    const prep = prepareStart();
    if (!prep.canStart) {
      showSuccessToast(
        'Open a diet plan from the list first, then tap Start.',
        'error',
      );
      return;
    }
    if (prep.needsConfirm && prep.activePlan) {
      openActiveConflict('start', prep.activePlan, prep.startPlanId);
      return;
    }
    const catalogId = String(
      selectedPlanId ||
      planDetail?.diet_plan_id ||
      planDetail?.id ||
      '',
    );
    pendingStartRef.current = { mode: 'direct', catalogId };
    setStartWaterModalVisible(true);
  }, [
    prepareStart,
    selectedPlanId,
    planDetail,
    openActiveConflict,
  ]);

  const executeStartWithWaterGoal = useCallback(
    async (goalMl: number) => {
      const pending = pendingStartRef.current;
      pendingStartRef.current = null;
      setStartWaterModalVisible(false);

      if (pending?.mode === 'switch' && pending.activeId && pending.catalogId) {
        const ok = await pauseActiveAndStart(
          pending.activeId,
          pending.catalogId,
          goalMl,
        );
        if (ok) {
          setSwitchConflict(null);
          setBrowseDetailMode(false);
        }
        return;
      }

      const catalogId = String(
        pending?.catalogId ||
        selectedPlanId ||
        planDetail?.diet_plan_id ||
        planDetail?.id ||
        '',
      );
      const result = await startPlan(catalogId, {
        daily_water_intake_goal: goalMl,
      });
      if (result && typeof result === 'object' && result.conflict === true) {
        openActiveConflict(
          'start',
          result.activePlan || activePlan,
          catalogId,
        );
        return;
      }
      if (result === true) {
        setBrowseDetailMode(false);
      }
    },
    [
      pauseActiveAndStart,
      startPlan,
      selectedPlanId,
      planDetail,
      activePlan,
      openActiveConflict,
    ],
  );

  const onConfirmSwitchPlan = useCallback(async () => {
    if (!switchConflict) return;
    if (switchConflict.mode === 'start') {
      setSwitchModalVisible(false);
      pendingStartRef.current = {
        mode: 'switch',
        activeId: switchConflict.activeId,
        catalogId: switchConflict.targetId,
      };
      setStartWaterModalVisible(true);
      return;
    }
    let ok = false;
    if (switchConflict.mode === 'resume') {
      ok = await pauseActiveAndResume(
        switchConflict.activeId,
        switchConflict.targetId,
      );
    } else if (switchConflict.mode === 'repeat') {
      ok = await pauseActiveAndRepeat(
        switchConflict.activeId,
        switchConflict.targetId,
      );
    } else if (switchConflict.mode === 'switch') {
      ok = await pauseActiveAndSelect(
        switchConflict.activeId,
        switchConflict.targetId,
      );
    }
    if (ok) {
      setSwitchModalVisible(false);
      setSwitchConflict(null);
      if (switchConflict.mode === 'repeat') {
        setCongratsVisible(false);
      }
    }
  }, [
    switchConflict,
    pauseActiveAndResume,
    pauseActiveAndRepeat,
    pauseActiveAndSelect,
  ]);

  const onSwitchPlan = () => {
    setConfirmModal({
      title: 'Switch diet plan?',
      subtitle:
        'Pause this active plan so you can start or resume another. Only one diet can be active at a time.',
      confirmText: 'Pause & switch',
      action: 'switch-pause',
    });
  };

  const onCompletePlan = useCallback(async () => {
    // Completion opens the dedicated completed screen (detail branch) with tracking summary
    const ok = await completePlan();
    if (!ok) return;

    const assignmentId =
      patientDietPlanId ||
      selectedSummary?.patient_diet_plan_id ||
      planDetail?.patient_diet_plan_id ||
      null;
    if (!assignmentId) return;

    const planCtx = selectedSummary || planDetail;
    if (!canShowDietPlanRateButton(planCtx)) return;

    props.navigation.navigate('ShareExperienceScreen', {
      entityType: 'diet_plan',
      entityName:
        selectedSummary?.name || planDetail?.name || 'Diet Plan',
      entitySubtitle: 'How was this diet plan?',
      patientDietPlanId: String(assignmentId),
      dietPlanId: selectedPlanId ? String(selectedPlanId) : undefined,
      initialRating: 0,
      initialReview: '',
      initialImages: [],
      isEdit: false,
    });
  }, [
    completePlan,
    patientDietPlanId,
    selectedSummary,
    planDetail,
    selectedPlanId,
    props.navigation,
  ]);

  const onRateDietPlan = useCallback(() => {
    const planCtx = selectedSummary || planDetail;
    if (!canShowDietPlanRateButton(planCtx)) {
      showSuccessToast('You have already reviewed this diet plan', 'error');
      return;
    }

    const assignmentId =
      patientDietPlanId ||
      selectedSummary?.patient_diet_plan_id ||
      planDetail?.patient_diet_plan_id ||
      null;
    if (!assignmentId) {
      showSuccessToast('No completed diet plan found to review', 'error');
      return;
    }
    props.navigation.navigate('ShareExperienceScreen', {
      entityType: 'diet_plan',
      entityName:
        selectedSummary?.name || planDetail?.name || 'Diet Plan',
      entitySubtitle: 'How was this diet plan?',
      patientDietPlanId: String(assignmentId),
      dietPlanId: selectedPlanId ? String(selectedPlanId) : undefined,
      initialRating: 0,
      initialReview: '',
      initialImages: [],
      isEdit: false,
    });
  }, [
    patientDietPlanId,
    selectedSummary,
    planDetail,
    selectedPlanId,
    props.navigation,
  ]);

  const onPausePress = useCallback(() => {
    setConfirmModal({
      title: 'Pause this active plan?',
      subtitle:
        'Tracking will pause and your progress is saved. You can resume this plan anytime, or start another plan after pausing.',
      confirmText: 'Pause plan',
      action: 'pause',
    });
  }, []);

  const onStopPress = useCallback(() => {
    setConfirmModal({
      title: 'Stop this run?',
      subtitle:
        'Stopping ends this run. To use Repeat later you must Complete the plan first — stopped plans use Start again instead.',
      confirmText: 'Stop plan',
      action: 'stop',
    });
  }, []);

  const onResetPress = useCallback(() => {
    setConfirmModal({
      title: 'Reset progress?',
      subtitle:
        'Ends this run and starts a fresh active assignment from Day 1. Repeat count stays the same (only Complete → Repeat increases it).',
      confirmText: 'Reset',
      action: 'reset',
    });
  }, []);

  const onRepeatPress = useCallback(() => {
    const prep = prepareRepeat();
    if (!prep.canRepeat) return;

    if (prep.needsConfirm && prep.activePlan) {
      openActiveConflict(
        'repeat',
        prep.activePlan,
        prep.completedAssignmentId,
      );
      return;
    }

    const next = getDietNextRepeatNumber(selectedSummary || planDetail);
    const repeatSummary = getDietRepeatSummary(selectedSummary || planDetail);
    setConfirmModal({
      title: 'Repeat this diet plan?',
      subtitle: `${repeatSummary}. Repeat starts a fresh tracked run from Day 1.`,
      confirmText: `Repeat plan (#${next})`,
      action: 'repeat',
    });
  }, [prepareRepeat, openActiveConflict, selectedSummary, planDetail]);

  const onConfirmDietAction = useCallback(async () => {
    if (!confirmModal || updatingStatus) return;
    const action = confirmModal.action;
    setConfirmModal(null);

    if (action === 'pause') {
      await pausePlan();
      return;
    }
    if (action === 'stop') {
      await stopPlan('Stopped by user');
      return;
    }
    if (action === 'reset') {
      await resetPlan();
      return;
    }
    if (action === 'repeat') {
      const ok = await repeatPlan();
      if (ok) setCongratsVisible(false);
      return;
    }
    if (action === 'switch-pause') {
      await switchPlan('pause');
    }
  }, [
    confirmModal,
    updatingStatus,
    pausePlan,
    stopPlan,
    resetPlan,
    repeatPlan,
    switchPlan,
  ]);

  const selectedDayChip = planDays.find(
    d => d.dayKey.toLowerCase() === String(currentDayKey || '').toLowerCase(),
  );

  const hydrationDayLabel = useMemo(() => {
    const n = currentDayKey?.replace(/\D/g, '');
    return n ? `Day ${n}` : 'Today';
  }, [currentDayKey]);

  const trackingDayLabel = useMemo(() => {
    const fromChip = String(selectedDayChip?.label || '').trim();
    if (fromChip) return fromChip;
    const n = currentDayKey?.replace(/\D/g, '');
    return n ? `Day ${n}` : 'Today';
  }, [selectedDayChip?.label, currentDayKey]);

  const dayLabel = currentDayKey
    ? `Day ${currentDayKey.replace(/\D/g, '') || '1'}`
    : trackingDayLabel;

  const isViewingToday =
    String(currentDayKey || '').toLowerCase() ===
    String(todayDayKey || '').toLowerCase();

  const macrosData = [
    { id: 1, label: 'Carbs', value: nutrition.carbsPct, color: MACRO_COLORS.Carbs },
    { id: 2, label: 'Protein', value: nutrition.proteinPct, color: MACRO_COLORS.Protein },
    { id: 3, label: 'Fat', value: nutrition.fatPct, color: MACRO_COLORS.Fat },
  ];

  const diseaseText = useMemo(() => {
    const diseases = selectedSummary?.health_diseases || planDetail?.health_diseases;
    if (Array.isArray(diseases) && diseases.length) {
      return diseases.map((d: any) => d?.name).filter(Boolean).join(', ');
    }
    return selectedSummary?.short_description || '—';
  }, [selectedSummary, planDetail]);

  const priceLabel =
    selectedSummary?.is_paid === false || Number(selectedSummary?.price) === 0
      ? 'Free'
      : formatRupee(selectedSummary?.price ?? 0);

  const detailRatingLabel = useMemo(
    () => getDietPlanRatingLabel(planDetail || selectedSummary),
    [planDetail, selectedSummary],
  );

  const Macro = ({
    label = '',
    value = 0,
    color = '#000',
  }: {
    label?: string;
    value?: number;
    color?: string;
  }) => {
    const safeValue = Math.min(Math.max(value, 0), 100);
    return (
      <View style={styles.macroItem}>
        <View style={styles.macroTop}>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={[styles.macroPercent, { color }]}>{safeValue}%</Text>
        </View>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${safeValue}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  const DailyVitalityCard = () => (
    <View style={styles.DailyCard}>
      <View style={styles.content}>
        <View style={styles.circle}>
          <Text style={styles.calories}>{formatKcal(nutrition.leftKcal)}</Text>
          <Text style={styles.kcalText}>KCAL LEFT</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.label}>Eaten</Text>
            <Text style={styles.value}>{formatKcal(nutrition.eatenKcal)} kcal</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Burned</Text>
            <Text style={[styles.value, styles.green]}>
              {formatKcal(nutrition.burnedKcal)} kcal
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.goalLabel}>Goal</Text>
            <Text style={styles.goalValue}>
              {formatKcal(nutrition.goalKcal)} kcal
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.macroRow}>
        {macrosData.map(item => (
          <Macro
            key={item.id}
            label={item.label}
            value={item.value}
            color={item.color}
          />
        ))}
      </View>
    </View>
  );

  const HydrationCardSection = () => (
    <HydrationCard
      waterMl={waterMl}
      waterGoalMl={nutrition.waterGoalMl}
      dayLabel={hydrationDayLabel}
      updating={updatingWater}
      onSetIntake={updateWaterIntake}
    />
  );

  // —— LIST ——
  if (!selectedPlanId) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <Header
          title="Diet Plans"
          subtitle={
            listType === 'all'
              ? 'All diet plans'
              : 'Suggested for you'
          }
          onBack={() => props.navigation.goBack()}
          rightIconName={listType !== 'all' ? 'list' : undefined}
          onRightPress={
            listType !== 'all'
              ? () =>
                props.navigation.setParams({
                  listType: 'all',
                  viewAll: true,
                })
              : undefined
          }
        />

        {/* {listType !== 'all' ? (
          <TouchableOpacity
            style={styles.viewAllBanner}
            activeOpacity={0.85}
            onPress={() =>
              props.navigation.setParams({
                listType: 'all',
                viewAll: true,
              })
            }
          >
            <View style={styles.viewAllBannerLeft}>
              <TablerIcon name="leaf" size={16} color={Colors.primaryColor} />
              <Text style={styles.viewAllBannerText}>Browse full diet catalog</Text>
            </View>
            <Text style={styles.viewAllBannerAction}>View all</Text>
          </TouchableOpacity>
        ) : null} */}

        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <TablerIcon name="search" size={18} color="#94A3B8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search diet plans..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                <TablerIcon name="x" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.statusTabRow}>
            {STATUS_TABS.map(tab => {
              const selected = statusTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.statusTab, selected && styles.statusTabSelected]}
                  onPress={() => setStatusTab(tab.key)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.statusTabText,
                      selected && styles.statusTabTextSelected,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.prakritiRow}
          >
            {filterChipMeta.map(chip => (
              <TouchableOpacity
                key={chip.key}
                style={[
                  styles.prakritiChip,
                  styles.filterChip,
                  chip.active && styles.prakritiChipActive,
                ]}
                onPress={() =>
                  setOpenFilter(prev => (prev === chip.key ? null : chip.key))
                }
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.prakritiChipText,
                    chip.active && styles.prakritiChipTextActive,
                    styles.filterChipText,
                  ]}
                  numberOfLines={1}
                >
                  {chip.valueLabel}
                </Text>
                <TablerIcon
                  name="chevron-down"
                  size={14}
                  color={chip.active ? Colors.primaryColor : '#94A3B8'}
                />
              </TouchableOpacity>
            ))}
            {hasActiveListFilters ? (
              <TouchableOpacity
                style={[styles.prakritiChip, styles.clearFilterChip]}
                onPress={clearAllListFilters}
                activeOpacity={0.85}
              >
                <TablerIcon name="x" size={14} color="#B45309" />
                <Text style={styles.clearFilterChipText}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </View>

        <Modal
          visible={openFilter != null}
          transparent
          animationType="fade"
          onRequestClose={() => setOpenFilter(null)}
        >
          <View style={styles.filterModalBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={() => setOpenFilter(null)}
            />
            <View style={styles.filterModalCard}>
              <View style={styles.filterModalHeader}>
                <Text style={styles.filterModalTitle}>{dropdownTitle}</Text>
                <TouchableOpacity
                  onPress={() => setOpenFilter(null)}
                  hitSlop={8}
                >
                  <TablerIcon name="x" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={dropdownOptions}
                keyExtractor={item => `${openFilter}-${item.value}`}
                keyboardShouldPersistTaps="handled"
                style={styles.filterModalList}
                renderItem={({ item }) => {
                  const selected = item.value === selectedDropdownValue;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.filterOptionRow,
                        selected && styles.filterOptionRowActive,
                      ]}
                      onPress={() => onPickFilterOption(item)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selected && styles.filterOptionTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {selected ? (
                        <TablerIcon
                          name="check"
                          size={16}
                          color={Colors.primaryColor}
                        />
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text style={styles.filterEmptyText}>
                    No options yet. Browse plans first, then filter.
                  </Text>
                }
              />
            </View>
          </View>
        </Modal>

        {loadingList && plans.length === 0 ? (
          <DietListSkeleton />
        ) : (
          <FlatList
            data={visiblePlans}
            keyExtractor={planKeyExtractor}
            renderItem={renderPlanCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews
            initialNumToRender={8}
            maxToRenderPerBatch={6}
            windowSize={7}
            updateCellsBatchingPeriod={100}
            onEndReached={statusTab === 'all' ? handleLoadMore : undefined}
            onEndReachedThreshold={0.35}
            ListHeaderComponent={
              loadingList && plans.length > 0 ? (
                <View style={styles.listFooter}>
                  <ActivityIndicator color={Colors.primaryColor} />
                </View>
              ) : null
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.listFooter}>
                  <ActivityIndicator color={Colors.primaryColor} />
                  <Text style={styles.listFooterText}>Loading more…</Text>
                </View>
              ) : !hasMore && visiblePlans.length > 0 && statusTab === 'all' ? (
                <Text style={styles.listEndText}>
                  All diet plans loaded ({visiblePlans.length})
                </Text>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  didResolveActiveRef.current = false;
                  refresh();
                }}
                tintColor={Colors.primaryColor}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>
                  {statusTab === 'active'
                    ? 'No active diet'
                    : statusTab === 'inactive'
                      ? 'No inactive diets'
                      : 'No diet plans'}
                </Text>
                <Text style={styles.emptySub}>
                  {statusTab === 'active'
                    ? 'You don’t have a diet in progress. Open All and start a plan.'
                    : statusTab === 'inactive'
                      ? 'Every listed plan is currently active.'
                      : hasActiveListFilters
                        ? 'Try another search or prakriti filter.'
                        : listType === 'all'
                          ? 'No diet plans in the catalog yet.'
                          : 'Plans suggested for you will appear here.'}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  const showDetailView = !isStarted || browseDetailMode;

  // —— DETAIL (catalog info — all plans from list) ——
  if (showDetailView) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <Header
          title="Diet Plan"
          subtitle={selectedSummary?.name || 'Details'}
          onBack={handleBackFromDetail}
        />

        {loadingDetail ? (
          <DietDetailSkeleton />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.detailScrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={Colors.primaryColor}
              />
            }
          >
            <View style={styles.detailHeroWrap}>
              {(() => {
                const gallery = getDietPlanGallery(
                  planDetail || selectedSummary,
                );
                if (gallery.length > 0) {
                  return (
                    <Detailimages
                      embedded
                      images={gallery}
                      itemWidth={DETAIL_IMAGE_WIDTH}
                      itemHeight={DIET_UI.detailHeroHeight}
                      DynamicResize="cover"
                      mode="product"
                      enablePreview
                      autoSlide={gallery.length > 1}
                      showIndicator={gallery.length > 1}
                    />
                  );
                }
                return (
                  <Image
                    source={resolveDietImage(planDetail || selectedSummary)}
                    style={styles.detailImage}
                  />
                );
              })()}
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailTagRow}>
                {!!(selectedSummary?.prakriti || planDetail?.prakriti) && (
                  <View style={styles.detailTag}>
                    <Text style={styles.detailTagText}>
                      {selectedSummary?.prakriti || planDetail?.prakriti}
                    </Text>
                  </View>
                )}
                {!!(selectedSummary?.season || planDetail?.season) && (
                  <View style={styles.detailTag}>
                    <Text style={styles.detailTagText}>
                      {selectedSummary?.season || planDetail?.season}
                    </Text>
                  </View>
                )}
                <View style={[styles.detailTag, styles.detailPriceTag]}>
                  <Text style={[styles.detailTagText, styles.detailPriceText]}>
                    {priceLabel}
                  </Text>
                </View>
              </View>

              <Text style={styles.detailTitle}>
                {selectedSummary?.name || planDetail?.name}
              </Text>

              {!!detailRatingLabel ? (
                <View style={styles.detailRatingRow}>
                  <View style={styles.detailRatingBadge}>
                    <TablerIcon
                      name="star"
                      size={14}
                      color="#F59E0B"
                      strokeWidth={2}
                    />
                    <Text style={styles.detailRatingValue}>
                      {detailRatingLabel}
                    </Text>
                  </View>
                </View>
              ) : null}

              {!!diseaseText && diseaseText !== '—' && (
                <Text style={styles.detailFocus}>Focus: {diseaseText}</Text>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Prakriti</Text>
                <Text style={styles.detailValue}>
                  {selectedSummary?.prakriti || planDetail?.prakriti || '—'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Season</Text>
                <Text style={styles.detailValue}>
                  {selectedSummary?.season || planDetail?.season || '—'}
                </Text>
              </View>
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Health focus</Text>
                <Text style={styles.detailValue}>{diseaseText}</Text>
              </View>
            </View>

            {browseDetailMode && listStatus === 'active' ? (
              <TouchableOpacity
                style={styles.continueTrackingBtn}
                onPress={() => setBrowseDetailMode(false)}
                activeOpacity={0.9}
              >
                <TablerIcon name="bolt" size={18} color="#FFFFFF" />
                <Text style={styles.continueTrackingText}>
                  Continue meal tracking
                </Text>
              </TouchableOpacity>
            ) : null}

            {isCompletedPlan ? (
              <View style={styles.detailSection}>
                <View style={styles.congratsCard}>
                  <Text style={styles.congratsEmoji}>🎉</Text>
                  <Text style={styles.congratsTitle}>Plan completed</Text>
                  <Text style={styles.congratsSub}>
                    You finished "
                    {selectedSummary?.name || planDetail?.name}".{' '}
                    {getDietRepeatSummary(selectedSummary || planDetail)}. Tap
                    Repeat below to start a fresh cycle from Day 1.
                  </Text>

                  <View style={styles.completeRunMeta}>
                    <Text style={styles.completeRunMetaText}>
                      Repeat count: {getDietRepeatCount(selectedSummary || planDetail)}
                    </Text>
                    <Text style={styles.completeRunMetaText}>
                      Next run: Repeat #{getDietNextRepeatNumber(selectedSummary || planDetail)}
                    </Text>
                  </View>

                  {completionJson ? (
                    <View
                      style={[styles.completeTrackingBlock, { width: '100%' }]}
                    >
                      <Text style={styles.completeTrackingTitle}>
                        Your tracking summary
                      </Text>
                      {Object.entries(completionJson || {})
                        .slice(0, 12)
                        .map(([key, value]) => (
                          <View key={key} style={styles.completeTrackRow}>
                            <Text style={styles.completeTrackKey}>
                              {String(key)
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, c => c.toUpperCase())}
                            </Text>
                            <Text style={styles.completeTrackVal}>
                              {typeof value === 'object'
                                ? JSON.stringify(value)
                                : String(value ?? '—')}
                            </Text>
                          </View>
                        ))}
                    </View>
                  ) : (
                    <Text style={styles.completeEmptyText}>
                      Your completed run is saved. Use Repeat below when you’re
                      ready for another cycle.
                    </Text>
                  )}
                </View>

                <DietPlanActionPanel
                  status="completed"
                  plan={selectedSummary || planDetail}
                  loading={updatingStatus}
                  canComplete={false}
                  onRepeat={onRepeatPress}
                />

                {activePlan &&
                  String(activePlan.patient_diet_plan_id || '') !==
                  String(patientDietPlanId || '') ? (
                  <Text style={styles.startHint}>
                    "{activePlan.name}" is currently active. Repeat will ask to
                    pause it first, then start this plan again.
                  </Text>
                ) : null}

                {!isReviewedPlan ? (
                  <TouchableOpacity
                    style={styles.startBtn}
                    onPress={onRateDietPlan}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.startBtnText}>Rate this diet plan</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[styles.startBtn, { backgroundColor: '#64748B' }]}
                  onPress={clearSelection}
                  activeOpacity={0.9}
                >
                  <Text style={styles.startBtnText}>Browse other plans</Text>
                </TouchableOpacity>
              </View>
            ) : listStatus === 'stopped' ? (
              <View style={styles.detailSection}>
                <DietPlanActionPanel
                  status="stopped"
                  plan={selectedSummary || planDetail}
                  loading={updatingStatus || starting}
                  canComplete={false}
                  onStartAgain={onStartPress}
                />
                <Text style={styles.startHint}>
                  Stopped plans can’t use Repeat. Start again to begin a new
                  run, or complete a full plan first to unlock Repeat.
                </Text>
                <TouchableOpacity
                  style={[styles.startBtn, { backgroundColor: '#64748B' }]}
                  onPress={clearSelection}
                  activeOpacity={0.9}
                >
                  <Text style={styles.startBtnText}>Browse other plans</Text>
                </TouchableOpacity>
              </View>
            ) : listStatus === 'not_started' || !patientDietPlanId ? (
              <>
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={onStartPress}
                  disabled={starting || updatingStatus}
                  activeOpacity={0.9}
                >
                  {starting || updatingStatus ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.startBtnText}>
                      {activePlan &&
                        String(activePlan.id) !== String(selectedPlanId)
                        ? 'Pause active & start'
                        : 'Start plan'}
                    </Text>
                  )}
                </TouchableOpacity>
                <Text style={styles.startHint}>
                  {activePlan && String(activePlan.id) !== String(selectedPlanId)
                    ? `"${activePlan.name}" is active now. Tap above to pause it and start this plan — only one diet can be active.`
                    : 'After starting, you’ll track today’s meals and nutrition from this plan.'}
                </Text>
              </>
            ) : (
              <View style={styles.detailSection}>
                <DietPlanActionPanel
                  status={listStatus}
                  plan={selectedSummary || planDetail}
                  loading={updatingStatus}
                  canComplete={false}
                  progressHint={
                    listStatus === 'paused'
                      ? activePlan &&
                        String(activePlan.patient_diet_plan_id || '') !==
                        String(patientDietPlanId || '')
                        ? `"${activePlan.name}" is active. Resume will ask to pause it first.`
                        : 'Status: Paused — tap Resume to continue tracking'
                      : listStatus === 'active' && !browseDetailMode
                        ? 'This plan is active. Pause it anytime to start another plan.'
                        : undefined
                  }
                  onPause={listStatus === 'active' ? onPausePress : undefined}
                  onResume={listStatus === 'paused' ? onResumePress : undefined}
                  onStop={listStatus === 'active' ? onStopPress : undefined}
                  onReset={listStatus === 'active' ? onResetPress : undefined}
                />
              </View>
            )}
          </ScrollView>
        )}

        <CommonModal
          visible={switchModalVisible}
          icon="⏸️"
          title={
            switchConflict?.mode === 'resume'
              ? 'Pause active plan to resume?'
              : switchConflict?.mode === 'repeat'
                ? 'Pause active plan to repeat?'
                : switchConflict?.mode === 'switch'
                  ? 'Pause active plan to switch?'
                  : 'Pause active plan to start?'
          }
          subtitle={
            switchConflict
              ? switchConflict.mode === 'resume'
                ? `"${switchConflict.activeName}" is currently active. Pause it to resume this plan? Only one diet can be active at a time.`
                : switchConflict.mode === 'repeat'
                  ? `"${switchConflict.activeName}" is currently active. Pause it to repeat this completed plan from Day 1?`
                  : switchConflict.mode === 'switch'
                    ? `"${switchConflict.activeName}" is currently active. Pause it to open the other plan? You can start or repeat it after switching.`
                    : `"${switchConflict.activeName}" is currently active. Pause it to start this plan? Only one diet can be active at a time.`
              : 'Only one diet can be active at a time.'
          }
          cancelText="Keep current"
          confirmText={
            switchConflict?.mode === 'start'
              ? 'Pause & start'
              : switchConflict?.mode === 'repeat'
                ? 'Pause & repeat'
                : switchConflict?.mode === 'switch'
                  ? 'Pause & switch'
                  : 'Pause & resume'
          }
          stackButtons
          loading={updatingStatus || starting}
          onClose={() => {
            if (updatingStatus || starting) return;
            setSwitchModalVisible(false);
            setSwitchConflict(null);
          }}
          onConfirm={onConfirmSwitchPlan}
        />

        <CommonModal
          visible={!!confirmModal}
          icon="ℹ️"
          title={confirmModal?.title || ''}
          subtitle={confirmModal?.subtitle || ''}
          cancelText="Cancel"
          confirmText={confirmModal?.confirmText || 'Confirm'}
          loading={updatingStatus}
          onClose={() => {
            if (updatingStatus) return;
            setConfirmModal(null);
          }}
          onConfirm={async () => {
            await onConfirmDietAction();
          }}
        />

        <WaterGoalStartModal
          visible={startWaterModalVisible}
          planName={selectedSummary?.name || planDetail?.name}
          loading={starting || updatingStatus}
          onClose={() => {
            if (starting || updatingStatus) return;
            pendingStartRef.current = null;
            setStartWaterModalVisible(false);
          }}
          onConfirm={executeStartWithWaterGoal}
        />
      </SafeAreaView>
    );
  }

  // —— TRACKING (active / started) ——

  // —— ACTIVE TRACKING (original Daily Vitality UI) ——
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Header
        title="Diet"
        subtitle={selectedSummary?.name || 'Track your nutrition'}
        onBack={handleBackFromDetail}
      />

      {loadingDetail && meals.length === 0 && mealsByDay.length === 0 ? (
        <DietActiveSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={Colors.primaryColor}
            />
          }
        >
          <View style={styles.activeTopRow}>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>
                Active · {planDays.length || mealsByDay.length} days
              </Text>
            </View>
            <TouchableOpacity
              onPress={onSwitchPlan}
              disabled={updatingStatus}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {updatingStatus ? (
                <ActivityIndicator size="small" color={Colors.primaryColor} />
              ) : (
                <Text style={styles.switchLink}>Switch plan</Text>
              )}
            </TouchableOpacity>
          </View>

          {(planDays.length > 0 || mealsByDay.length > 0) && (
            <>
              <SectionHeader
                title="All plan days"
                actionText={
                  showAllDays
                    ? 'All days'
                    : isViewingToday
                      ? 'Today'
                      : dayLabel
                }
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dayChipRow}
                style={{ marginBottom: 12 }}
              >
                <TouchableOpacity
                  style={[
                    styles.dayChip,
                    showAllDays && styles.dayChipSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={selectAllDays}
                >
                  <View style={styles.dayChipTop}>
                    <Text
                      style={[
                        styles.dayChipLabel,
                        showAllDays && styles.dayChipLabelSelected,
                      ]}
                    >
                      All
                    </Text>
                    {showAllDays ? <View style={styles.dayChipDot} /> : null}
                  </View>
                  <Text
                    style={[
                      styles.dayChipMeta,
                      showAllDays && styles.dayChipMetaSelected,
                    ]}
                  >
                    {planDays.length || mealsByDay.length}d
                  </Text>
                  <View style={styles.dayChipTrack}>
                    <View
                      style={[
                        styles.dayChipFill,
                        {
                          width: '100%',
                          backgroundColor: showAllDays
                            ? '#FFFFFF'
                            : Colors.primaryColor,
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                {planDays.map(item => {
                  const selected =
                    !showAllDays &&
                    item.dayKey.toLowerCase() ===
                    String(currentDayKey || '').toLowerCase();
                  const shortLabel = String(item.label || '')
                    .replace(/day\s*/i, 'D')
                    .trim();
                  return (
                    <TouchableOpacity
                      key={item.dayKey}
                      style={[
                        styles.dayChip,
                        selected && styles.dayChipSelected,
                        item.isToday && !selected && styles.dayChipToday,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => selectDay(item.dayKey)}
                    >
                      <View style={styles.dayChipTop}>
                        <Text
                          style={[
                            styles.dayChipLabel,
                            selected && styles.dayChipLabelSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {shortLabel}
                        </Text>
                        {item.isToday ? (
                          <View
                            style={[
                              styles.dayChipTodayPill,
                              selected && styles.dayChipTodayPillOn,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayChipTodayText,
                                selected && styles.dayChipTodayTextOn,
                              ]}
                            >
                              Now
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.dayChipMeta,
                          selected && styles.dayChipMetaSelected,
                        ]}
                      >
                        {item.isToday
                          ? 'Today'
                          : `${item.mealsDone}/${item.mealsTotal || 0}`}
                      </Text>
                      <View style={styles.dayChipTrack}>
                        <View
                          style={[
                            styles.dayChipFill,
                            {
                              width: `${item.progressPct}%`,
                              backgroundColor: selected
                                ? '#FFFFFF'
                                : Colors.primaryColor,
                            },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          {!showAllDays && (
            <>
              <SectionHeader
                title="Daily Vitality"
                actionText={isViewingToday ? undefined : dayLabel}
              />
              <DailyVitalityCard />
              <HydrationCardSection />
            </>
          )}

          <SectionHeader
            title={
              showAllDays
                ? 'All days meals'
                : isViewingToday
                  ? "Today's Meals"
                  : `${dayLabel} Meals`
            }
            actionText={
              showAllDays
                ? `${mealsByDay.reduce(
                  (n, d) => n + d.meals.filter(m => m.status === 'done').length,
                  0,
                )}/${mealsByDay.reduce((n, d) => n + d.meals.length, 0)}`
                : `${selectedDayChip?.mealsDone ?? nutrition.mealsDone}/${selectedDayChip?.mealsTotal ?? nutrition.mealsTotal ?? 0
                }`
            }
          />

          {showAllDays ? (
            mealsByDay.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No meals in this plan</Text>
                <Text style={styles.emptySub}>
                  Pull to refresh or check back once the plan is updated.
                </Text>
              </View>
            ) : (
              mealsByDay.map(dayBlock => (
                <View key={dayBlock.dayKey} style={styles.daySection}>
                  <View style={styles.daySectionHeader}>
                    <Text style={styles.daySectionTitle}>{dayBlock.label}</Text>
                    <Text style={styles.daySectionMeta}>
                      {dayBlock.meals.filter(m => m.status === 'done').length}/
                      {dayBlock.meals.length} logged
                    </Text>
                  </View>
                  {dayBlock.meals.map(item => (
                    <MealCard
                      key={item.id}
                      data={item}
                      navigation={props.navigation}
                      onLog={() => logMeal(item)}
                    />
                  ))}
                </View>
              ))
            )
          ) : meals.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No meals for {dayLabel}</Text>
              <Text style={styles.emptySub}>
                Pull to refresh or check back once the plan is updated.
              </Text>
            </View>
          ) : (
            meals.map(item => (
              <MealCard
                key={item.id}
                data={item}
                navigation={props.navigation}
                onLog={() => logMeal(item)}
              />
            ))
          )}

          {isPlanFullyComplete ? (
            <View style={styles.completeBanner}>
              <Text style={styles.completeBannerEmoji}>🏆</Text>
              <Text style={styles.completeBannerTitle}>
                All meals tracked — amazing!
              </Text>
              <Text style={styles.completeBannerSub}>
                You’ve finished every meal in this plan. Complete it to save your
                achievement.
              </Text>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={onCompletePlan}
                disabled={updatingStatus}
                activeOpacity={0.9}
              >
                {updatingStatus ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.startBtnText}>Complete diet plan</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          {(listStatus === 'active' || listStatus === 'paused') &&
            patientDietPlanId ? (
            <View style={{ marginTop: 12, marginBottom: 8 }}>
              <DietPlanActionPanel
                status={listStatus}
                plan={selectedSummary || planDetail}
                loading={updatingStatus}
                canComplete={!!isPlanFullyComplete}
                progressHint={
                  listStatus === 'paused'
                    ? 'Status: Paused — Resume only'
                    : trackingDayLabel
                      ? `Tracking ${trackingDayLabel}`
                      : undefined
                }
                onPause={onPausePress}
                onResume={onResumePress}
                onStop={listStatus === 'active' ? onStopPress : undefined}
                onReset={listStatus === 'active' ? onResetPress : undefined}
                onComplete={
                  listStatus === 'active' ? onCompletePlan : undefined
                }
              />
            </View>
          ) : null}
        </ScrollView>
      )}

      <Modal
        visible={congratsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCongratsVisible(false)}
      >
        <Pressable
          style={styles.completeModalBackdrop}
          onPress={() => setCongratsVisible(false)}
        >
          <Pressable
            style={styles.completeModalCard}
            onPress={e => e.stopPropagation?.()}
          >
            <View style={styles.completeModalHeader}>
              <Text style={styles.completeModalEmoji}>🎉</Text>
              <Text style={styles.completeModalTitle}>Congratulations!</Text>
              <Text style={styles.completeModalSubtitle}>
                {`You completed "${selectedSummary?.name || planDetail?.name || 'this diet plan'
                  }".`}
              </Text>
            </View>

            <ScrollView style={styles.completeModalBody}>
              {completionJson ? (
                <View style={styles.completeTrackingBlock}>
                  <Text style={styles.completeTrackingTitle}>
                    Completion tracking
                  </Text>

                  {(() => {
                    const entries = Object.entries(completionJson || {}).slice(
                      0,
                      18,
                    );
                    if (entries.length === 0) {
                      return (
                        <Text style={styles.completeEmptyText}>
                          Tracking details are not available.
                        </Text>
                      );
                    }
                    return entries.map(([k, v]) => {
                      const label = k
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase());
                      const raw =
                        typeof v === 'string'
                          ? v
                          : typeof v === 'number'
                            ? String(v)
                            : Array.isArray(v)
                              ? `${v.length} items`
                              : v && typeof v === 'object'
                                ? JSON.stringify(v).slice(0, 180)
                                : v == null
                                  ? ''
                                  : String(v);
                      if (!raw) return null;
                      return (
                        <View key={k} style={styles.completeKvRow}>
                          <Text style={styles.completeKvLabel}>{label}</Text>
                          <Text
                            style={styles.completeKvValue}
                            numberOfLines={2}
                          >
                            {raw}
                          </Text>
                        </View>
                      );
                    });
                  })()}
                </View>
              ) : (
                <Text style={styles.completeEmptyText}>
                  Tracking details are not available. You can still browse other plans.
                </Text>
              )}
            </ScrollView>

            <View style={styles.completeModalActions}>
              <TouchableOpacity
                style={[styles.completeModalBtn, styles.completeModalBtnGhost]}
                activeOpacity={0.85}
                onPress={() => {
                  setCongratsVisible(false);
                  clearSelection();
                }}
              >
                <Text style={styles.completeModalBtnGhostText}>
                  Browse plans
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.completeModalBtn, styles.completeModalBtnPrimary]}
                activeOpacity={0.9}
                disabled={updatingStatus}
                onPress={() => {
                  setCongratsVisible(false);
                  onRepeatPress();
                }}
              >
                {updatingStatus ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.completeModalBtnPrimaryText}>
                    {`Repeat plan (#${getDietNextRepeatNumber(selectedSummary || planDetail)})`}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <CommonModal
        visible={switchModalVisible}
        icon="⏸️"
        title={
          switchConflict?.mode === 'resume'
            ? 'Pause active plan to resume?'
            : switchConflict?.mode === 'repeat'
              ? 'Pause active plan to repeat?'
              : switchConflict?.mode === 'switch'
                ? 'Pause active plan to switch?'
                : 'Pause active plan to start?'
        }
        subtitle={
          switchConflict
            ? switchConflict.mode === 'resume'
              ? `"${switchConflict.activeName}" is currently active. Pause it to resume this plan? Only one diet can be active at a time.`
              : switchConflict.mode === 'repeat'
                ? `"${switchConflict.activeName}" is currently active. Pause it to repeat this completed plan from Day 1?`
                : switchConflict.mode === 'switch'
                  ? `"${switchConflict.activeName}" is currently active. Pause it to open the other plan? You can start or repeat it after switching.`
                  : `"${switchConflict.activeName}" is currently active. Pause it to start this plan? Only one diet can be active at a time.`
            : 'Only one diet can be active at a time.'
        }
        cancelText="Keep current"
        confirmText={
          switchConflict?.mode === 'start'
            ? 'Pause & start'
            : switchConflict?.mode === 'repeat'
              ? 'Pause & repeat'
              : switchConflict?.mode === 'switch'
                ? 'Pause & switch'
                : 'Pause & resume'
        }
        stackButtons
        loading={updatingStatus || starting}
        onClose={() => {
          if (updatingStatus || starting) return;
          setSwitchModalVisible(false);
          setSwitchConflict(null);
        }}
        onConfirm={onConfirmSwitchPlan}
      />

      <CommonModal
        visible={!!confirmModal}
        icon="ℹ️"
        title={confirmModal?.title || ''}
        subtitle={confirmModal?.subtitle || ''}
        cancelText="Cancel"
        confirmText={confirmModal?.confirmText || 'Confirm'}
        loading={updatingStatus}
        onClose={() => {
          if (updatingStatus) return;
          setConfirmModal(null);
        }}
        onConfirm={async () => {
          await onConfirmDietAction();
        }}
      />
    </SafeAreaView>
  );
};

export default DietScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#FDFDFB' },

  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    paddingBottom: 40,
    paddingTop: SPACING.sm,
    gap: SPACING.md,
  },

  searchWrap: {
    marginTop: 4,
    marginBottom: 8,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
    paddingVertical: 0,
  },
  statusTabRow: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  statusTab: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTabSelected: {
    backgroundColor: '#FFFFFF',
  },
  statusTabText: {
    fontSize: TYPO.subtitle,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  statusTabTextSelected: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  prakritiRow: {
    gap: 8,
    paddingRight: 4,
  },
  prakritiChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  prakritiChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: Colors.primaryColor,
  },
  prakritiChipText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  prakritiChipTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 140,
  },
  filterChipText: {
    maxWidth: 100,
  },
  clearFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  clearFilterChipText: {
    fontSize: 12,
    color: '#B45309',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  filterModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  filterModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '58%',
    paddingBottom: 12,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterModalTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  filterModalList: {
    paddingHorizontal: 8,
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  filterOptionRowActive: {
    backgroundColor: '#ECFDF5',
  },
  filterOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
    paddingRight: 10,
  },
  filterOptionTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  filterEmptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },

  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8EEF2',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    minHeight: 22,
  },

  planPopularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },

  planPopularText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#EA580C',
  },

  planCardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },

  planCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF2F6',
  },

  planFooterMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    minWidth: 0,
  },

  planFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  planFooterText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },

  planFooterRatingText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#B45309',
  },

  planCardFree: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8EEF2',
  },

  planCardPaid: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8EEF2',
  },

  planThumbWrap: {
    position: 'relative',
    flexShrink: 0,
  },

  planThumb: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.cardBackground,
  },

  planPremiumBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  planPremiumBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#5E4200',
    letterSpacing: 0.4,
  },

  planBody: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },

  planTitle: {
    fontSize: TYPO.md,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },

  planSubtitle: {
    fontSize: TYPO.sm,
    lineHeight: 17,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginTop: 3,
  },

  planStatusSlot: {
    flexShrink: 0,
    marginLeft: SPACING.sm,
  },

  planPrakritiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.sm - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginTop: SPACING.xs + 2,
  },

  planPrakritiBadgeText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#047857',
    textTransform: 'capitalize',
  },

  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryColor,
  },

  activePillText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },

  listFooter: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  listFooterText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  listEndText: {
    textAlign: 'center',
    paddingVertical: 14,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  completedPill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  completedPillText: {
    fontSize: 10,
    color: '#4338CA',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  stoppedPill: {
    backgroundColor: '#FEF2F2',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stoppedPillText: {
    fontSize: 10,
    color: '#B91C1C',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  notStartedPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  notStartedPillText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  congratsCard: {
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
  },
  congratsEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  congratsTitle: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#065F46',
    marginBottom: 6,
  },
  congratsSub: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#047857',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 20,
  },
  completeRunMeta: {
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: '#D1FAE5',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completeRunMetaText: {
    fontSize: 12,
    color: '#065F46',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  completeTrackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1FAE5',
  },
  completeTrackKey: {
    flex: 1,
    fontSize: 12,
    color: '#047857',
    fontFamily: Fonts.PoppinsMedium,
  },
  completeTrackVal: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    textAlign: 'right',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  completeBanner: {
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
  },
  completeBannerEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  completeBannerTitle: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#92400E',
    marginBottom: 4,
    textAlign: 'center',
  },
  completeBannerSub: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#B45309',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  completeModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  completeModalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completeModalHeader: {
    paddingTop: 22,
    paddingBottom: 10,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  completeModalEmoji: {
    fontSize: 34,
    marginBottom: 6,
  },
  completeModalTitle: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 6,
  },
  completeModalSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#0F766E',
    textAlign: 'center',
    lineHeight: 18,
  },
  completeModalBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  completeTrackingBlock: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 14,
  },
  completeTrackingTitle: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#065F46',
    marginBottom: 10,
  },
  completeEmptyText: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: 18,
  },
  completeKvRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  completeKvLabel: {
    width: 150,
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: '#0F172A',
    opacity: 0.85,
  },
  completeKvValue: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#0F172A',
    opacity: 0.75,
  },
  completeModalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  completeModalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeModalBtnGhost: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completeModalBtnGhostText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    color: '#334155',
  },
  completeModalBtnPrimary: {
    backgroundColor: Colors.primaryColor,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
  },
  completeModalBtnPrimaryText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    color: '#FFFFFF',
  },
  resumePill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resumePillText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#4338CA',
  },
  pausedPill: {
    backgroundColor: '#FFF4E5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  pausedPillText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#B45309',
  },

  planMeta: {
    fontSize: TYPO.sm,
    lineHeight: 17,
    fontFamily: Fonts.PoppinsRegular,
    color: '#6B7C76',
    marginTop: SPACING.xs,
  },

  doctorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 4,
    marginBottom: 2,
    maxWidth: '100%',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  doctorBadgeText: {
    flexShrink: 1,
    fontSize: 11,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  doctorSuggestCard: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  doctorSuggestIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  doctorSuggestCopy: {
    flex: 1,
    minWidth: 0,
  },

  doctorSuggestLabel: {
    fontSize: 9,
    color: '#0F766E',
    fontFamily: Fonts.PoppinsMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  doctorSuggestName: {
    fontSize: 12,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  prakritiThumbBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    maxWidth: '90%',
    backgroundColor: 'rgba(13, 97, 78, 0.92)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  prakritiThumbBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  prakritiTag: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },

  prakritiTagText: {
    color: '#047857',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  viewAllBanner: {
    marginHorizontal: 5,
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  viewAllBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  viewAllBannerText: {
    flexShrink: 1,
    fontSize: 13,
    color: '#0F766E',
    fontFamily: Fonts.PoppinsMedium,
  },

  viewAllBannerAction: {
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  planTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
    marginTop: SPACING.sm,
  },

  tag: {
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.sm - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },

  tagText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsMedium,
    color: '#475569',
    textTransform: 'capitalize',
  },

  freeTag: {
    backgroundColor: '#E6F4F0',
  },

  freeTagText: {
    color: Colors.primaryColor,
  },

  paidTag: {
    backgroundColor: '#F8EBC4',
  },

  paidTagText: {
    color: '#8B6914',
  },

  planChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    marginLeft: SPACING.sm,
    flexShrink: 0,
  },

  planChevronFree: {
    backgroundColor: '#F1F5F9',
  },

  planChevronPaid: {
    backgroundColor: '#F1F5F9',
  },

  detailScrollContent: {
    paddingTop: 4,
    paddingBottom: 32,
  },

  detailHeroWrap: {
    width: '100%',
    height: DIET_UI.detailHeroHeight,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
  },

  detailImage: {
    width: '100%',
    height: DIET_UI.detailHeroHeight,
    borderRadius: RADIUS.lg,
    backgroundColor: Colors.cardBackground,
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md + 2,
    paddingBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8EEF2',
    marginTop: -DIET_UI.detailCardOverlap,
    width: '100%',
    alignSelf: 'center',
    zIndex: 2,
    elevation: 3,
  },

  detailSection: {
    marginTop: SPACING.md,
    gap: SPACING.md,
    width: '100%',
  },

  continueTrackingBtn: {
    marginTop: SPACING.md,
    height: BUTTON.height,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },

  continueTrackingText: {
    fontSize: TYPO.button,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  detailTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm + 2,
  },

  detailTag: {
    backgroundColor: '#E6F2F2',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
  },

  detailTagText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    textTransform: 'capitalize',
  },

  detailPriceTag: {
    backgroundColor: '#F1F5F9',
  },

  detailPriceText: {
    color: '#475569',
  },

  detailTitle: {
    fontSize: TYPO.xxl,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: SPACING.xs + 2,
    lineHeight: 26,
  },

  detailRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: 10,
  },

  detailRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
  },

  detailRatingValue: {
    fontSize: TYPO.md,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#B45309',
  },

  detailFocus: {
    fontSize: TYPO.subtitle,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginBottom: SPACING.md,
    textTransform: 'capitalize',
  },

  activeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primaryColor,
  },

  activeBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },

  switchLink: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    textDecorationLine: 'underline',
  },

  dayChipRow: {
    gap: 8,
    paddingRight: 4,
    paddingBottom: 2,
  },

  dayChip: {
    width: 76,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EDE9',
    shadowColor: '#0E4B3A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  dayChipSelected: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
    shadowOpacity: 0.16,
  },

  dayChipToday: {
    borderColor: '#9DD4C4',
    backgroundColor: '#F1FAF6',
  },

  dayChipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    minHeight: 18,
  },

  dayChipLabel: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#16352C',
    flexShrink: 1,
  },

  dayChipLabelSelected: {
    color: '#FFFFFF',
  },

  dayChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4A84B',
  },

  dayChipTodayPill: {
    backgroundColor: '#D4A84B',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },

  dayChipTodayPillOn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  dayChipTodayText: {
    fontSize: 8,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1A2E28',
  },

  dayChipTodayTextOn: {
    color: '#FFFFFF',
  },

  dayChipMeta: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
    color: '#6B7C76',
    marginTop: 3,
  },

  dayChipMetaSelected: {
    color: 'rgba(255,255,255,0.88)',
  },

  dayChipTrack: {
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(14,75,58,0.1)',
    overflow: 'hidden',
    marginTop: 7,
  },

  dayChipFill: {
    height: 3,
    borderRadius: 3,
  },

  daySection: {
    marginBottom: 18,
  },

  daySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  daySectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },

  daySectionMeta: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.primaryColor,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  detailLabel: {
    fontSize: TYPO.subtitle,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
    flexShrink: 0,
  },

  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: TYPO.subtitle,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    textTransform: 'capitalize',
  },

  startBtn: {
    marginTop: SPACING.lg,
    height: BUTTON.height,
    backgroundColor: Colors.primaryColor,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startBtnText: {
    color: '#fff',
    fontSize: TYPO.button,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  startHint: {
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontSize: TYPO.sm,
    fontFamily: Fonts.PoppinsRegular,
    color: '#94A3B8',
    paddingHorizontal: SPACING.md,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
  },

  emptySub: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#94A3B8',
    textAlign: 'center',
  },

  DailyCard: {
    backgroundColor: '#0D614E0D',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  circle: {
    width: DIET_UI.vitalityCircle,
    height: DIET_UI.vitalityCircle,
    borderRadius: DIET_UI.vitalityCircle / 2,
    borderWidth: DIET_UI.vitalityCircleBorder,
    borderColor: '#0F5D4A',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  calories: {
    fontSize: TYPO.xxl + 2,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    marginBottom: -6,
  },

  kcalText: {
    fontSize: TYPO.sm,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsRegular,
  },

  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: SPACING.lg,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },

  label: {
    color: Colors.subTextColor,
    fontSize: TYPO.body,
    fontFamily: Fonts.PoppinsMedium,
    flexShrink: 0,
  },

  value: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: TYPO.body,
    textAlign: 'right',
    flexShrink: 1,
  },

  green: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: TYPO.body,
  },

  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: SPACING.sm,
  },

  goalLabel: {
    fontSize: TYPO.lg,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
  },

  goalValue: {
    fontSize: TYPO.lg,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },

  macroItem: { flex: 1, minWidth: 0 },

  macroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  macroLabel: {
    fontSize: TYPO.sm,
    color: Colors.black,
    fontFamily: Fonts.PoppinsMedium,
  },

  macroPercent: {
    fontSize: TYPO.sm,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  progressBg: {
    height: 6,
    backgroundColor: '#E0E3E2',
    borderRadius: 11,
    overflow: 'hidden',
  },

  progressFill: {
    height: 6,
    borderRadius: 10,
  },

  Hydrationcard: {
    backgroundColor: '#0D614E0D',
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  iconBox: {
    width: DIET_UI.hydrationIcon,
    height: DIET_UI.hydrationIcon,
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    flexShrink: 0,
  },

  Hydrationtitle: {
    fontSize: TYPO.lg,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  subtitle: {
    color: Colors.subTextColor,
    fontSize: TYPO.sm,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },

  minus: {
    width: DIET_UI.hydrationAction,
    height: DIET_UI.hydrationAction,
    borderRadius: RADIUS.sm + 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginRight: SPACING.sm,
  },

  plus: {
    width: DIET_UI.hydrationAction,
    height: DIET_UI.hydrationAction,
    borderRadius: RADIUS.sm + 2,
    backgroundColor: '#0F5D4A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnText: {
    fontSize: 25,
    color: '#374151',
  },

  plusText: {
    fontSize: 25,
    color: '#fff',
  },
});
