// import React, { memo, useEffect, useState, useCallback, useMemo, useRef } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     ScrollView,
//     Image,
//     StatusBar,
//     RefreshControl,
//     Animated,
// } from 'react-native';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// import { Ionicons } from '../../common/Vector';
// import { Images } from '../../common/Images';
// import { Colors } from '../../common/Colors';
// import { Fonts } from '../../common/Fonts';
// import { getDoctorSlots } from '../../services/ConsultServce';
// import * as _CONSULT_SERVICES from '../../services/ConsultServce';
// import { getReviewsAll } from '../../services/ProductServices';
// import BackIconButton from '../../components/BackIconButton';
// import { requireAuth } from '../../services/guestAuth';
// import { showSuccessToast } from '../../config/Key';
// import FavouriteButton from '../../components/FavouriteButton';
// import TablerIcon from '../../components/TablerIcon';
// import {
//     collectReviewImageUrls,
//     extractReviewsList,
//     isReviewVideoUrl,
//     normalizeReviewMediaUrls,
//     normalizeReviewsForDisplay,
// } from '../../utils/reviewUtils';

// /* -------------------------------------------------------------------------- */
// /*                              REUSABLE COMPONENTS                           */
// /* -------------------------------------------------------------------------- */

// const ReviewCard = memo(
//     ({
//         review,
//         onOpenMedia,
//     }: {
//         review: any;
//         onOpenMedia: (urls: string[], index: number) => void;
//     }) => (
//         <View style={styles.reviewCard}>
//             <View style={styles.reviewTop}>
//                 <View style={styles.userRow}>
//                     {review.image ? (
//                         <Image source={review.image} style={styles.userImage} />
//                     ) : (
//                         <View style={styles.avatarPlaceholder}>
//                             <Text style={styles.avatarText}>
//                                 {review.name?.charAt(0)?.toUpperCase()}
//                             </Text>
//                         </View>
//                     )}

//                     <View style={styles.userInfo}>
//                         <Text numberOfLines={1} style={styles.userName}>
//                             {review.name}
//                         </Text>
//                         <View style={styles.ratingRow}>
//                             {Array.from({ length: 5 }).map((_, star) => (
//                                 <Ionicons
//                                     key={star}
//                                     name={star < Number(review.rating || 0) ? 'star' : 'star-outline'}
//                                     size={12}
//                                     color="#F59E0B"
//                                 />
//                             ))}
//                         </View>
//                     </View>
//                 </View>
//                 <Text style={styles.time}>{review.time}</Text>
//             </View>
//             {!!review.review && (
//                 <Text style={styles.reviewText}>"{review.review}"</Text>
//             )}
//             {!!review.mediaUrls?.length && (
//                 <View style={styles.reviewMediaRow}>
//                     {review.mediaUrls.slice(0, 4).map((uri: string, index: number) => (
//                         <TouchableOpacity
//                             key={`${review.id}-media-${index}`}
//                             activeOpacity={0.85}
//                             onPress={() => onOpenMedia(review.mediaUrls, index)}
//                             style={styles.reviewMediaThumbWrap}
//                         >
//                             <Image source={{ uri }} style={styles.reviewMediaThumb} />
//                             {isReviewVideoUrl(uri) ? (
//                                 <View style={styles.reviewMediaVideoBadge}>
//                                     <TablerIcon name="video" size={10} color="#FFFFFF" />
//                                 </View>
//                             ) : null}
//                         </TouchableOpacity>
//                     ))}
//                 </View>
//             )}
//             {!!review.doctorReply && (
//                 <View style={styles.doctorReplyBox}>
//                     <Text style={styles.doctorReplyLabel}>Doctor replied</Text>
//                     <Text style={styles.doctorReplyText}>{review.doctorReply}</Text>
//                 </View>
//             )}
//         </View>
//     ),
// );

// const SpecializationTags = memo(({ therapies }: { therapies: string[] }) => {
//     if (!therapies?.length) {
//         return (
//             <Text style={styles.emptyText}>
//                 No specializations listed
//             </Text>
//         );
//     }

//     return (
//         <View style={styles.tagsWrapper}>
//             {therapies.map((item, index) => (
//                 <View key={index} style={styles.tag}>
//                     <Text style={styles.tagText}>{item}</Text>
//                 </View>
//             ))}
//         </View>
//     );
// });

// /* -------------------------------------------------------------------------- */
// /*                                MAIN SCREEN                                 */
// /* -------------------------------------------------------------------------- */

// const DoctorProfile = ({ navigation, route }: any) => {
//     const { doctorData } = route?.params;
//     const insets = useSafeAreaInsets();
//     const footerBottomPad = Math.max(insets.bottom, 12);

//     console.log("docororpf", doctorData);

//     const [refreshing, setRefreshing] = useState(false);
//     const [showFullAbout, setShowFullAbout] = useState(false);
//     const [isFavourite, setIsFavourite] = useState(false);

//     const [doctorDetails, setDoctorDetails] = useState<any>(null);
//     const [patientReviews, setPatientReviews] = useState<any[] | null>(null);

//     const doctor = useMemo(
//         () => ({
//             ...doctorData,
//             ...doctorDetails,
//         }),
//         [doctorData, doctorDetails]
//     );

//     // Memoized Values
//     const stats = useMemo(() => [
//         {
//             id: "1",
//             value: doctor?.patients_display || doctor?.total_patients || 0,
//             label: "PATIENTS",
//         },
//         {
//             id: "2",
//             value: doctor?.total_reviews || 0,
//             label: "REVIEWS",
//         },
//         {
//             id: "3",
//             value: doctor?.experience_display || `${doctor?.experience_years || 0}+`,
//             label: "EXPERIENCE",
//         },
//     ], [doctor]);

//     const specializations = useMemo(
//         () =>
//             doctor?.specialized_therapies ||
//             doctor?.specializations ||
//             [],
//         [
//             doctor?.specialized_therapies,
//             doctor?.specializations,
//         ]
//     );

//     const reviews = useMemo(
//         () =>
//             normalizeReviewsForDisplay(
//                 patientReviews !== null
//                     ? patientReviews
//                     : doctor?.reviews || [],
//             ),
//         [patientReviews, doctor?.reviews],
//     );
//     const formattedReviews = useMemo(
//         () =>
//             reviews?.map((review: any) => ({
//                 id: review.id,
//                 name: review.reviewer_name || review.patient_name || 'Patient',
//                 review: review.review,
//                 time: review.time_ago
//                     || (review.created_at
//                         ? new Date(review.created_at).toLocaleDateString('en-IN', {
//                             day: '2-digit',
//                             month: 'short',
//                             year: 'numeric',
//                         })
//                         : ''),
//                 rating: Number(review.rating || 0),
//                 image: review.reviewer_profile_image
//                     ? { uri: review.reviewer_profile_image }
//                     : null,
//                 mediaUrls: normalizeReviewMediaUrls(review),
//                 doctorReply: review.doctor_reply || '',
//             })),
//         [reviews]
//     );

//     const allReviewMedia = useMemo(
//         () => collectReviewImageUrls(reviews),
//         [reviews],
//     );

//     const MAX_VISIBLE_REVIEW_MEDIA = 4;
//     const visibleReviewMedia = allReviewMedia.slice(0, MAX_VISIBLE_REVIEW_MEDIA);
//     const remainingReviewMedia =
//         allReviewMedia.length - MAX_VISIBLE_REVIEW_MEDIA;

//     const openReviewGallery = useCallback(
//         (images: string[], selectedIndex = 0) => {
//             if (!images?.length) return;
//             navigation.navigate('ReviewGalleryScreen', {
//                 images,
//                 selectedIndex,
//             });
//         },
//         [navigation],
//     );

//     const openAllReviews = useCallback(() => {
//         navigation.navigate('ReviewPage', {
//             reviews,
//             entityType: 'doctor',
//             doctorId: doctorData?.id || doctorData?.doctor_id,
//         });
//     }, [navigation, reviews, doctorData?.id, doctorData?.doctor_id]);


//     const aboutText = useMemo(
//         () => doctor?.bio || '',
//         [doctor?.bio]
//     );
//     const shouldTruncate = aboutText.length > 150;

//     const truncatedAbout = useMemo(() => {
//         if (!shouldTruncate || showFullAbout) return aboutText;
//         return `${aboutText.substring(0, 150)}`;
//     }, [aboutText, shouldTruncate, showFullAbout]);


//     const getDoctorDetails = useCallback(async () => {
//         try {
//             const res = await getDoctorSlots({
//                 id: doctorData?.id
//             }
//             );
//             console.log("dattaaa", res?.data);
//             if (res?.data) {
//                 setDoctorDetails(res?.data
//                 );
//             }
//         } catch (error) {
//             console.log(
//                 'DOCTOR DETAILS ERROR =>',
//                 error
//             );
//         }
//     }, [doctorData?.id]);

//     const fetchDoctorReviews = useCallback(async () => {
//         const id = doctorData?.id || doctorData?.doctor_id;
//         if (!id) return;
//         try {
//             // GET review/?entity_type=doctor&doctor_id=
//             const res = await getReviewsAll({
//                 entity_type: 'doctor',
//                 doctor_id: String(id),
//             });
//             setPatientReviews(extractReviewsList(res));
//         } catch (error) {
//             console.log('DOCTOR REVIEWS ERROR =>', error);
//         }
//     }, [doctorData?.id, doctorData?.doctor_id]);

//     useEffect(() => {
//         if (doctorData?.id || doctorData?.doctor_id) {
//             getDoctorDetails();
//             fetchDoctorReviews();
//         }
//     }, [doctorData?.id, doctorData?.doctor_id, getDoctorDetails, fetchDoctorReviews]);


//     const handleFavourite = async () => {
//         const prev = isFavourite;

//         console.log(
//             'FAVOURITE DOCTOR ID =>',
//             doctorData?.id,
//             prev
//         );

//         setIsFavourite(!prev);

//         try {
//             const resposne = await _CONSULT_SERVICES.ToggleFavDoctor(
//                 doctorData?.id,
//                 'POST',
//             );
//             showSuccessToast(resposne?.message, 'success');
//             console.log(
//                 'FAVOURITE SUCCESS =>',
//                 resposne
//             );

//         } catch (error) {
//             setIsFavourite(prev);
//             showSuccessToast('Failed to update favourite status', 'error')

//             console.log(
//                 'FAVOURITE ERROR =>',
//                 error,
//             );
//         }
//     };

//     const handleRefresh = useCallback(async () => {
//         try {
//             setRefreshing(true);
//             await Promise.all([getDoctorDetails(), fetchDoctorReviews()]);
//         } finally {
//             setRefreshing(false);
//         }
//     }, [getDoctorDetails, fetchDoctorReviews]);

//     useEffect(() => {
//         setIsFavourite(
//             doctor?.is_favorite ?? false
//         );
//     }, [doctor?.is_favorite]);


//     // Handlers
//     const handleBookAppointment = useCallback(async () => {
//         if (!(await requireAuth('Please login to book an appointment'))) return;
//         if (doctorDetails) {
//             navigation.navigate('DoctorSlot', { doctorDetails });
//         }
//     }, [navigation, doctorDetails]);


//     const handleToggleAbout = useCallback(() => {
//         setShowFullAbout(prev => !prev);
//     }, []);




//     // Main Render
//     return (
//         <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
//             <StatusBar backgroundColor="#F7FBF9" barStyle="dark-content" />

//             <View style={styles.headerTop}>
//                 <BackIconButton
//                     onPress={() => navigation.goBack()}
//                     style={styles.iconBtn}
//                 />
//                 <Text style={styles.headerTitle}>Doctor Profile</Text>
//                 <FavouriteButton
//                     isFavourite={isFavourite}
//                     onPress={handleFavourite}
//                     style={styles.iconBtn}
//                 />
//             </View>

//             <ScrollView
//                 style={styles.scrollView}
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.scrollContent}
//                 refreshControl={
//                     <RefreshControl
//                         refreshing={refreshing}
//                         onRefresh={handleRefresh}
//                         colors={[Colors.primaryColor]}
//                         tintColor={Colors.primaryColor}
//                     />
//                 }
//             >
//                 <View style={styles.heroCard}>
//                     <View style={styles.heroTopRow}>
//                         <View style={styles.avatarWrapper}>
//                             {doctor?.profile_image ? (
//                                 <Image
//                                     source={{ uri: doctor?.profile_image }}
//                                     style={styles.avatar}
//                                 />
//                             ) : (
//                                 <View style={styles.avatarFallback}>
//                                     <Text style={styles.avatarLetter}>
//                                         {doctor?.full_name?.charAt(0)?.toUpperCase() || ''}
//                                     </Text>
//                                 </View>
//                             )}
//                         </View>

//                         <View style={styles.heroInfo}>
//                             <Text numberOfLines={2} style={styles.doctorName}>
//                                 {doctor?.full_name || 'Doctor'}
//                             </Text>
//                             {!!(doctor?.designation || doctor?.qualification) && (
//                                 <Text numberOfLines={1} style={styles.speciality}>
//                                     {doctor?.designation || doctor?.qualification}
//                                 </Text>
//                             )}
//                             <View style={styles.heroMetaRow}>
//                                 {!!(doctor?.experience_display || doctor?.experience_years) && (
//                                     <Text style={styles.heroMetaText}>
//                                         {doctor?.experience_display ||
//                                             `${doctor?.experience_years}+ yrs`}
//                                     </Text>
//                                 )}
//                                 {!!doctor?.average_rating && (
//                                     <Text style={styles.heroMetaText}>
//                                         ★ {Number(doctor.average_rating).toFixed(1)}
//                                     </Text>
//                                 )}
//                                 {!!doctor?.consultation_fee && (
//                                     <Text style={styles.heroFeeValue}>
//                                         {doctor.consultation_fee}
//                                     </Text>
//                                 )}
//                             </View>
//                         </View>
//                     </View>

//                     <View style={styles.heroStatsRow}>
//                         {stats.map((item, index) => (
//                             <React.Fragment key={item.id}>
//                                 {index > 0 ? <View style={styles.heroStatDivider} /> : null}
//                                 <View style={styles.heroStatItem}>
//                                     <Text style={styles.heroStatValue}>{item.value}</Text>
//                                     <Text style={styles.heroStatLabel}>{item.label}</Text>
//                                 </View>
//                             </React.Fragment>
//                         ))}
//                     </View>
//                 </View>

//                 <View style={styles.sectionCard}>
//                     <Text style={styles.sectionTitle}>About</Text>
//                     <Text style={styles.aboutText}>
//                         {truncatedAbout || 'No bio available yet.'}
//                         {shouldTruncate && (
//                             <Text onPress={handleToggleAbout} style={styles.readMore}>
//                                 {showFullAbout ? ' Read Less' : '... Read More'}
//                             </Text>
//                         )}
//                     </Text>
//                 </View>

//                 <View style={styles.sectionCard}>
//                     <Text style={styles.sectionTitle}>Specializations</Text>
//                     <SpecializationTags therapies={specializations} />
//                 </View>

//                 <View style={styles.sectionCard}>
//                     <TouchableOpacity style={styles.reviewHeader} onPress={openAllReviews}>
//                         <Text style={styles.sectionTitle}>Patient Reviews</Text>
//                         <Text style={styles.viewAll}>View All</Text>
//                     </TouchableOpacity>

//                     {allReviewMedia.length > 0 ? (
//                         <>
//                             <Text style={styles.photosLabel}>Patient photos & videos</Text>
//                             <View style={styles.reviewMediaStrip}>
//                                 {visibleReviewMedia.map((uri, index) => {
//                                     const isLastVisible =
//                                         index === MAX_VISIBLE_REVIEW_MEDIA - 1 &&
//                                         remainingReviewMedia > 0;
//                                     return (
//                                         <TouchableOpacity
//                                             key={`${uri}-${index}`}
//                                             activeOpacity={0.85}
//                                             style={styles.stripThumbWrap}
//                                             onPress={() =>
//                                                 openReviewGallery(
//                                                     allReviewMedia,
//                                                     index,
//                                                 )
//                                             }
//                                         >
//                                             <Image source={{ uri }} style={styles.stripThumb} />
//                                             {isReviewVideoUrl(uri) ? (
//                                                 <View style={styles.stripVideoBadge}>
//                                                     <TablerIcon name="video" size={11} color="#FFFFFF" />
//                                                 </View>
//                                             ) : null}
//                                             {isLastVisible ? (
//                                                 <View style={styles.stripOverlay}>
//                                                     <Text style={styles.stripOverlayText}>
//                                                         +{remainingReviewMedia}
//                                                     </Text>
//                                                 </View>
//                                             ) : null}
//                                         </TouchableOpacity>
//                                     );
//                                 })}
//                             </View>
//                         </>
//                     ) : null}

//                     {reviews?.length > 0 ? (
//                         formattedReviews.slice(0, 3).map((review: any) => (
//                             <ReviewCard
//                                 key={review.id}
//                                 review={review}
//                                 onOpenMedia={openReviewGallery}
//                             />
//                         ))
//                     ) : (
//                         <Text style={styles.emptyText}>No reviews yet</Text>
//                     )}
//                 </View>
//             </ScrollView>

//             <View style={[styles.footer, { paddingBottom: footerBottomPad }]}>
//                 <View style={styles.priceContainer}>
//                     <Text style={styles.feeText}>Consult Fee</Text>
//                     <Text style={styles.price}>{doctor?.consultation_fee}</Text>
//                 </View>

//                 <TouchableOpacity
//                     activeOpacity={0.85}
//                     onPress={handleBookAppointment}
//                     style={styles.bookBtn}
//                 >
//                     <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
//                     <Text numberOfLines={1} style={styles.bookText}>
//                         Book Appointment
//                     </Text>
//                 </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// };

// export default DoctorProfile;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F7FBF9',
//     },
//     scrollView: {
//         flex: 1,
//     },
//     scrollContent: {
//         paddingBottom: 24,
//     },
//     headerTop: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         minHeight: 52,
//         marginTop: 4,
//         paddingHorizontal: 16,
//         backgroundColor: '#F7FBF9',
//     },
//     iconBtn: {
//         width: 42,
//         height: 42,
//         borderRadius: 14,
//         backgroundColor: '#FFFFFF',
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderWidth: 1,
//         borderColor: '#E5EFEC',
//     },
//     backIcon: {
//         width: 40,
//         height: 40,
//         resizeMode: 'contain',
//     },
//     headerTitle: {
//         flex: 1,
//         textAlign: 'center',
//         fontSize: 18,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#0F172A',
//         marginHorizontal: 12,
//     },
//     heroCard: {
//         marginHorizontal: 16,
//         marginTop: 6,
//         paddingVertical: 12,
//         paddingHorizontal: 12,
//         borderRadius: 16,
//         backgroundColor: '#FFFFFF',
//         borderWidth: 1,
//         borderColor: '#E8F2EE',
//     },
//     heroTopRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 12,
//     },
//     avatarWrapper: {
//         width: 72,
//         height: 72,
//         borderRadius: 16,
//         backgroundColor: '#F0F7F4',
//         overflow: 'hidden',
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderWidth: 1,
//         borderColor: '#D7EBE3',
//     },
//     avatar: {
//         width: '100%',
//         height: '100%',
//         resizeMode: 'cover',
//     },
//     avatarFallback: {
//         width: '100%',
//         height: '100%',
//         backgroundColor: Colors.primaryColor,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     avatarLetter: {
//         fontSize: 26,
//         color: '#FFFFFF',
//         fontFamily: Fonts.PoppinsBold,
//     },
//     heroInfo: {
//         flex: 1,
//         minWidth: 0,
//     },
//     doctorName: {
//         fontSize: 17,
//         lineHeight: 22,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#0F172A',
//     },
//     speciality: {
//         marginTop: 2,
//         fontSize: 12,
//         fontFamily: Fonts.PoppinsMedium,
//         color: Colors.primaryColor,
//     },
//     heroMetaRow: {
//         marginTop: 6,
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         alignItems: 'center',
//         gap: 8,
//     },
//     heroMetaText: {
//         fontSize: 11,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#64748B',
//         backgroundColor: '#F1F5F9',
//         paddingHorizontal: 8,
//         paddingVertical: 3,
//         borderRadius: 8,
//     },
//     heroFeeValue: {
//         fontSize: 12,
//         color: Colors.primaryColor,
//         fontFamily: Fonts.PoppinsSemiBold,
//         backgroundColor: '#ECF8F3',
//         paddingHorizontal: 8,
//         paddingVertical: 3,
//         borderRadius: 8,
//         overflow: 'hidden',
//     },
//     heroStatsRow: {
//         marginTop: 10,
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderTopWidth: 1,
//         borderTopColor: '#EEF5F2',
//         paddingTop: 10,
//     },
//     heroStatItem: {
//         flex: 1,
//         alignItems: 'center',
//     },
//     heroStatDivider: {
//         width: 1,
//         height: 28,
//         backgroundColor: '#E8F2EE',
//     },
//     heroStatValue: {
//         fontSize: 15,
//         fontFamily: Fonts.PoppinsBold,
//         color: '#0F172A',
//     },
//     heroStatLabel: {
//         marginTop: 1,
//         fontSize: 9,
//         letterSpacing: 0.3,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#94A3B8',
//     },
//     sectionCard: {
//         marginTop: 10,
//         marginHorizontal: 16,
//         padding: 14,
//         borderRadius: 16,
//         backgroundColor: '#FFFFFF',
//         borderWidth: 1,
//         borderColor: '#E8F2EE',
//     },
//     sectionTitle: {
//         fontSize: 15,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#0F172A',
//     },
//     aboutText: {
//         marginTop: 8,
//         fontSize: 13,
//         lineHeight: 20,
//         fontFamily: Fonts.PoppinsRegular,
//         color: '#64748B',
//     },
//     readMore: {
//         color: Colors.primaryColor,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     tagsWrapper: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         marginTop: 12,
//         gap: 8,
//     },
//     tag: {
//         borderWidth: 1,
//         borderColor: '#D7EBE3',
//         borderRadius: 999,
//         paddingHorizontal: 14,
//         paddingVertical: 8,
//         backgroundColor: '#F4FBF8',
//     },
//     tagText: {
//         fontSize: 13,
//         fontFamily: Fonts.PoppinsMedium,
//         color: Colors.primaryColor,
//     },
//     emptyText: {
//         marginTop: 12,
//         color: '#94A3B8',
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     reviewHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         marginBottom: 4,
//     },
//     viewAll: {
//         fontSize: 13,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: Colors.primaryColor,
//     },
//     reviewCard: {
//         marginTop: 12,
//         padding: 14,
//         borderRadius: 16,
//         backgroundColor: '#F8FBF9',
//         borderWidth: 1,
//         borderColor: '#EAF3EF',
//     },
//     reviewTop: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         justifyContent: 'space-between',
//     },
//     userRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//         minWidth: 0,
//     },
//     userInfo: {
//         flex: 1,
//         minWidth: 0,
//     },
//     userImage: {
//         width: 44,
//         height: 44,
//         borderRadius: 22,
//         marginRight: 12,
//     },
//     avatarPlaceholder: {
//         width: 44,
//         height: 44,
//         marginRight: 12,
//         borderRadius: 22,
//         backgroundColor: '#E7F5EF',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     avatarText: {
//         fontSize: 16,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: Colors.primaryColor,
//     },
//     userName: {
//         fontSize: 14,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#0F172A',
//     },
//     ratingRow: {
//         flexDirection: 'row',
//         marginTop: 4,
//         gap: 2,
//     },
//     time: {
//         fontSize: 11,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#94A3B8',
//         marginLeft: 10,
//     },
//     reviewText: {
//         marginTop: 10,
//         fontSize: 13,
//         lineHeight: 21,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#64748B',
//     },
//     photosLabel: {
//         marginTop: 14,
//         marginBottom: 8,
//         fontSize: 13,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#64748B',
//     },
//     reviewMediaStrip: {
//         flexDirection: 'row',
//         gap: 8,
//         marginBottom: 4,
//     },
//     stripThumbWrap: {
//         width: 72,
//         height: 72,
//         borderRadius: 14,
//         overflow: 'hidden',
//         backgroundColor: '#E8F2EE',
//     },
//     stripThumb: {
//         width: '100%',
//         height: '100%',
//     },
//     stripVideoBadge: {
//         position: 'absolute',
//         top: 6,
//         left: 6,
//         width: 20,
//         height: 20,
//         borderRadius: 10,
//         backgroundColor: 'rgba(0,0,0,0.55)',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     stripOverlay: {
//         ...StyleSheet.absoluteFillObject,
//         backgroundColor: 'rgba(15,23,42,0.55)',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     stripOverlayText: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     reviewMediaRow: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         gap: 8,
//         marginTop: 10,
//     },
//     reviewMediaThumbWrap: {
//         width: 64,
//         height: 64,
//         borderRadius: 12,
//         overflow: 'hidden',
//         backgroundColor: '#E8F2EE',
//     },
//     reviewMediaThumb: {
//         width: '100%',
//         height: '100%',
//     },
//     reviewMediaVideoBadge: {
//         position: 'absolute',
//         top: 4,
//         left: 4,
//         width: 18,
//         height: 18,
//         borderRadius: 9,
//         backgroundColor: 'rgba(0,0,0,0.55)',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     doctorReplyBox: {
//         marginTop: 10,
//         padding: 10,
//         borderRadius: 12,
//         backgroundColor: '#FFFFFF',
//         borderWidth: 1,
//         borderColor: '#E8F2EE',
//     },
//     doctorReplyLabel: {
//         fontSize: 11,
//         color: Colors.primaryColor,
//         fontFamily: Fonts.PoppinsSemiBold,
//         marginBottom: 4,
//     },
//     doctorReplyText: {
//         fontSize: 13,
//         lineHeight: 20,
//         color: '#475569',
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     footer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingTop: 12,
//         paddingHorizontal: 16,
//         borderTopWidth: 1,
//         borderTopColor: '#E8F2EE',
//         backgroundColor: '#FFFFFF',
//     },
//     priceContainer: {
//         marginRight: 14,
//         minWidth: 96,
//     },
//     feeText: {
//         fontSize: 12,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#94A3B8',
//     },
//     price: {
//         fontSize: 24,
//         fontFamily: Fonts.PoppinsBold,
//         color: Colors.primaryColor,
//     },
//     bookBtn: {
//         flex: 1,
//         minHeight: 54,
//         borderRadius: 16,
//         backgroundColor: Colors.primaryColor,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingHorizontal: 12,
//     },
//     bookBtnLocked: {
//         backgroundColor: '#64748B',
//     },
//     bookText: {
//         marginLeft: 8,
//         fontSize: 15,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#FFFFFF',
//         flexShrink: 1,
//     },
//     errorContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     errorText: {
//         marginTop: 16,
//         fontSize: 16,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#64748B',
//         textAlign: 'center',
//     },
//     retryBtn: {
//         marginTop: 20,
//         paddingHorizontal: 24,
//         paddingVertical: 12,
//         backgroundColor: Colors.primaryColor,
//         borderRadius: 12,
//     },
//     retryText: {
//         color: '#FFFFFF',
//         fontFamily: Fonts.PoppinsSemiBold,
//         fontSize: 14,
//     },
// });

import React, { memo, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Dimensions,
    RefreshControl,
    Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '../../common/Vector';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { getDoctorSlots } from '../../services/ConsultServce';
import * as _CONSULT_SERVICES from '../../services/ConsultServce';
import { getReviewsAll } from '../../services/ProductServices';
import BackIconButton from '../../components/BackIconButton';
import { requireAuth } from '../../services/guestAuth';
import { showSuccessToast } from '../../config/Key';
import FavouriteButton from '../../components/FavouriteButton';
import TablerIcon from '../../components/TablerIcon';
import { RupeeAmount } from '../../utils/currencyUtils';
import {
    collectReviewImageUrls,
    isReviewVideoUrl,
    normalizeReviewMediaUrls,
    normalizeReviewsForDisplay,
} from '../../utils/reviewUtils';
import {
    getDoctorId,
    getDoctorFavoriteState,
    getFavoriteStateFromToggleResponse,
} from '../../utils/doctorUtils';

const { width } = Dimensions.get('window');

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface DoctorData {
    id: Number;
    full_name?: string;
    is_favorite: boolean;
    designation?: string;
    about?: string;
    profile_image?: { url: string };
    total_patients?: number;
    total_reviews?: number;
    experience_display?: string;
    consultation_fee?: number;
    doctor_specialization?: string[] | string;
    specializations?: string[] | string;
    specialization?: string[] | string;
    specialization_name?: string;
}

interface StatItem {
    id: string;
    value: string | number;
    label: string;
}

/* -------------------------------------------------------------------------- */
/*                              REUSABLE COMPONENTS                           */
/* -------------------------------------------------------------------------- */

const StatBar = memo(({ stats }: { stats: StatItem[] }) => {
    if (!stats.length) return null;

    return (
        <View style={styles.statsContainer}>
            {stats.map((item, index) => (
                <React.Fragment key={item.id}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{item.value}</Text>
                        <Text style={styles.statLabel}>{item.label}</Text>
                    </View>
                    {index !== stats.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
            ))}
        </View>
    );
});

const ReviewCard = memo(
    ({
        review,
        onOpenMedia,
    }: {
        review: any;
        onOpenMedia: (urls: string[], index: number) => void;
    }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewTop}>
                <View style={styles.userRow}>
                    {review.image ? (
                        <Image source={review.image} style={styles.userImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {review.name?.charAt(0)?.toUpperCase()}
                            </Text>
                        </View>
                    )}

                    <View style={styles.userInfo}>
                        <Text numberOfLines={1} style={styles.userName}>
                            {review.name}
                        </Text>
                        <View style={styles.ratingRow}>
                            {Array.from({ length: 5 }).map((_, star) => (
                                <Ionicons
                                    key={star}
                                    name={star < Number(review.rating || 0) ? 'star' : 'star-outline'}
                                    size={12}
                                    color="#F59E0B"
                                />
                            ))}
                        </View>
                    </View>
                </View>
                <Text style={styles.time}>{review.time}</Text>
            </View>
            {!!review.review && (
                <Text style={styles.reviewText}>"{review.review}"</Text>
            )}
            {!!review.mediaUrls?.length && (
                <View style={styles.reviewMediaRow}>
                    {review.mediaUrls.slice(0, 4).map((uri: string, index: number) => (
                        <TouchableOpacity
                            key={`${review.id}-media-${index}`}
                            activeOpacity={0.85}
                            onPress={() => onOpenMedia(review.mediaUrls, index)}
                            style={styles.reviewMediaThumbWrap}
                        >
                            <Image source={{ uri }} style={styles.reviewMediaThumb} />
                            {isReviewVideoUrl(uri) ? (
                                <View style={styles.reviewMediaVideoBadge}>
                                    <TablerIcon name="video" size={10} color="#FFFFFF" />
                                </View>
                            ) : null}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            {!!review.doctorReply && (
                <View style={styles.doctorReplyBox}>
                    <Text style={styles.doctorReplyLabel}>Doctor replied</Text>
                    <Text style={styles.doctorReplyText}>{review.doctorReply}</Text>
                </View>
            )}
        </View>
    ),
);

const toSpecializationLabels = (value: any): string[] => {
    if (value == null || value === '') return [];
    if (Array.isArray(value)) {
        return value
            .map(item => {
                if (typeof item === 'string') return item.trim();
                if (item?.name) return String(item.name).trim();
                if (item?.title) return String(item.title).trim();
                if (item?.label) return String(item.label).trim();
                return '';
            })
            .filter(Boolean);
    }
    if (typeof value === 'string') {
        return value
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
    }
    return [];
};

/** Doctor specialization only — never specialized_therapies */
const resolveDoctorSpecializations = (doctor: any): string[] => {
    const candidates = [
        doctor?.doctor_specialization,
        doctor?.specializations,
        doctor?.specialization,
        doctor?.specialization_name,
        doctor?.speciality,
        doctor?.specialty,
    ];
    for (const c of candidates) {
        const list = toSpecializationLabels(c);
        if (list.length) return list;
    }
    return [];
};


const resolveDoctorHealthDiseases = (doctor: any): string[] => {
  const diseases = doctor?.health_diseases;

  if (!Array.isArray(diseases)) return [];

  return diseases
    .map((item: any) =>
      typeof item === 'string' ? item : item?.name
    )
    .filter(Boolean);
};
const SpecializationTags = memo(({ items }: { items: string[] }) => {
    if (!items?.length) {
        return (
            <Text style={styles.emptyText}>
                No specializations listed
            </Text>
        );
    }

    return (
        <View style={styles.tagsWrapper}>
            {items.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.tag}>
                    <Text style={styles.tagText}>{item}</Text>
                </View>
            ))}
        </View>
    );
});

/* -------------------------------------------------------------------------- */
/*                                MAIN SCREEN                                 */
/* -------------------------------------------------------------------------- */

const DoctorProfile = ({ navigation, route }: any) => {
    const { doctorData } = route?.params;
    const insets = useSafeAreaInsets();
    const footerBottomPad = Math.max(insets.bottom, 12);

    console.log("docororpf", doctorData);

    const [refreshing, setRefreshing] = useState(false);
    const [showFullAbout, setShowFullAbout] = useState(false);
    const [isFavourite, setIsFavourite] = useState(
        getDoctorFavoriteState(doctorData),
    );

    const [doctorDetails, setDoctorDetails] = useState<any>(null);
    const [patientReviews, setPatientReviews] = useState<any[] | null>(null);

    const doctor = useMemo(
        () => ({
            ...doctorData,
            ...doctorDetails,
        }),
        [doctorData, doctorDetails]
    );

    // Memoized Values
    const stats = useMemo(() => [
        {
            id: "1",
            value: doctor?.patients_display || doctor?.total_patients || 0,
            label: "PATIENTS",
        },
        {
            id: "2",
            value: doctor?.total_reviews || 0,
            label: "REVIEWS",
        },
        {
            id: "3",
            value: doctor?.experience_display || `${doctor?.experience_years || 0}+`,
            label: "EXPERIENCE",
        },
    ], [doctor]);

    const specializations = useMemo(
        () => resolveDoctorSpecializations(doctor),
        [doctor],
    );
    const healthDiseasesText = useMemo(
        () => resolveDoctorHealthDiseases(doctor),
        [doctor],
    );

    const reviews = useMemo(
        () =>
            normalizeReviewsForDisplay(
                patientReviews !== null
                    ? patientReviews
                    : doctor?.reviews || [],
            ),
        [patientReviews, doctor?.reviews],
    );
    const formattedReviews = useMemo(
        () =>
            reviews?.map((review: any) => ({
                id: review.id,
                name: review.reviewer_name || review.patient_name || 'Patient',
                review: review.review,
                time: review.time_ago
                    || (review.created_at
                        ? new Date(review.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })
                        : ''),
                rating: Number(review.rating || 0),
                image: review.reviewer_profile_image
                    ? { uri: review.reviewer_profile_image }
                    : null,
                mediaUrls: normalizeReviewMediaUrls(review),
                doctorReply: review.doctor_reply || '',
            })),
        [reviews]
    );

    const allReviewMedia = useMemo(
        () => collectReviewImageUrls(reviews),
        [reviews],
    );

    const MAX_VISIBLE_REVIEW_MEDIA = 4;
    const visibleReviewMedia = allReviewMedia.slice(0, MAX_VISIBLE_REVIEW_MEDIA);
    const remainingReviewMedia =
        allReviewMedia.length - MAX_VISIBLE_REVIEW_MEDIA;

    const openReviewGallery = useCallback(
        (images: string[], selectedIndex = 0) => {
            if (!images?.length) return;
            navigation.navigate('ReviewGalleryScreen', {
                images,
                selectedIndex,
            });
        },
        [navigation],
    );

    const openAllReviews = useCallback(() => {
        navigation.navigate('ReviewPage', {
            reviews,
            entityType: 'doctor',
            doctorId: doctorData?.id || doctorData?.doctor_id,
        });
    }, [navigation, reviews, doctorData?.id, doctorData?.doctor_id]);


    const aboutText = useMemo(
        () => doctor?.bio || '',
        [doctor?.bio]
    );
    const shouldTruncate = aboutText.length > 150;

    const truncatedAbout = useMemo(() => {
        if (!shouldTruncate || showFullAbout) return aboutText;
        return `${aboutText.substring(0, 150)}`;
    }, [aboutText, shouldTruncate, showFullAbout]);


    const getDoctorDetails = useCallback(async () => {
        try {
            const res = await getDoctorSlots({
                id: doctorData?.id
            }
            );
            console.log("dattaaa", res?.data);
            if (res?.data) {
                setDoctorDetails(res?.data
                );
            }
        } catch (error) {
            console.log(
                'DOCTOR DETAILS ERROR =>',
                error
            );
        }
    }, [doctorData?.id]);

    const fetchDoctorReviews = useCallback(async () => {
        const id = doctorData?.id || doctorData?.doctor_id;
        if (!id) return;
        try {
            const res = await getReviewsAll({
                entity_type: 'doctor',
                doctor_id: String(id),
            });
            const list =
                res?.data?.results ||
                res?.data?.reviews ||
                res?.data ||
                [];
            setPatientReviews(Array.isArray(list) ? list : []);
        } catch (error) {
            console.log('DOCTOR REVIEWS ERROR =>', error);
        }
    }, [doctorData?.id, doctorData?.doctor_id]);

    useEffect(() => {
        if (doctorData?.id || doctorData?.doctor_id) {
            getDoctorDetails();
            fetchDoctorReviews();
        }
    }, [doctorData?.id, doctorData?.doctor_id, getDoctorDetails, fetchDoctorReviews]);


    const handleFavourite = async () => {
        const doctorId = getDoctorId(doctor);
        if (!doctorId) {
            showSuccessToast('Doctor unavailable', 'error');
            return;
        }
        if (!(await requireAuth('Please login to save favourite doctors'))) {
            return;
        }

        const prev = isFavourite;
        setIsFavourite(!prev);

        try {
            const response = await _CONSULT_SERVICES.ToggleFavDoctor(
                doctorId,
                'POST',
            );

            if (!response?.success) {
                setIsFavourite(prev);
                showSuccessToast(
                    response?.message || 'Failed to update favourite',
                    'error',
                );
                return;
            }

            const next = getFavoriteStateFromToggleResponse(response);
            if (next !== undefined) {
                setIsFavourite(next);
            } else {
                showSuccessToast(response?.message || 'Favourite updated', 'success');
            }
        } catch {
            setIsFavourite(prev);
            showSuccessToast('Failed to update favourite status', 'error');
        }
    };

    const handleRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await Promise.all([getDoctorDetails(), fetchDoctorReviews()]);
        } finally {
            setRefreshing(false);
        }
    }, [getDoctorDetails, fetchDoctorReviews]);

    useEffect(() => {
        setIsFavourite(getDoctorFavoriteState(doctor));
    }, [
        doctor?.is_favorite,
        doctor?.is_favourite,
        doctor?.id,
        doctor?.doctor_id,
    ]);


    // Handlers
    const handleBookAppointment = useCallback(async () => {
        if (!(await requireAuth('Please login to book an appointment'))) return;
        if (doctorDetails) {
            navigation.navigate('DoctorSlot', { doctorDetails });
        }
    }, [navigation, doctorDetails]);


    const handleToggleAbout = useCallback(() => {
        setShowFullAbout(prev => !prev);
    }, []);




    // Main Render
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar backgroundColor="#F7FBF9" barStyle="dark-content" />

            <View style={styles.headerTop}>
                <BackIconButton
                    onPress={() => navigation.goBack()}
                    style={styles.iconBtn}
                />
                <Text style={styles.headerTitle}>Doctor Profile</Text>
                <FavouriteButton
                    isFavourite={isFavourite}
                    onPress={handleFavourite}
                    style={styles.iconBtn}
                />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors.primaryColor]}
                        tintColor={Colors.primaryColor}
                    />
                }
            >
                <View style={styles.heroCard}>
                    <View style={styles.avatarRing}>
                        <View style={styles.avatarWrapper}>
                            {doctor?.profile_image ? (
                                <Image
                                    source={{ uri: doctor?.profile_image }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <Text style={styles.avatarLetter}>
                                        {doctor?.full_name?.charAt(0)?.toUpperCase() || ''}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <Text numberOfLines={2} style={styles.doctorName}>
                        {doctor?.full_name || 'Doctor'}
                    </Text>

                    {!!(doctor?.designation || specializations[0]) && (
                        <View style={styles.designationChip}>
                            <TablerIcon name="stethoscope" size={14} color={Colors.primaryColor} />
                            <Text numberOfLines={1} style={styles.speciality}>
                                {doctor?.designation || specializations[0]}
                            </Text>
                        </View>
                    )}

                    {!!doctor?.consultation_fee && (
                        <View style={styles.heroFeeHintRow}>
                            <Text style={styles.heroFeeHint}>Consultation from </Text>
                            <RupeeAmount
                                value={doctor?.consultation_fee}
                                style={styles.heroFeeValue}
                                iconSize={14}
                                iconColor={Colors.primaryColor}
                            />
                        </View>
                    )}
                </View>

                <StatBar stats={stats} />

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.aboutText}>
                        {truncatedAbout || 'No bio available yet.'}
                        {shouldTruncate && (
                            <Text onPress={handleToggleAbout} style={styles.readMore}>
                                {showFullAbout ? ' Read Less' : '... Read More'}
                            </Text>
                        )}
                    </Text>
                </View>

                {/* {specializations?.length > 0 && ( */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Specializations</Text>
                        <SpecializationTags items={specializations} />
                    </View>
                    {/* )} */}

                      {/* {specializations?.length > 0 && ( */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Health Conditions</Text>
                        <SpecializationTags items={healthDiseasesText} />
                    </View>
                    {/* )} */}

                <View style={styles.sectionCard}>
                    <TouchableOpacity style={styles.reviewHeader} onPress={openAllReviews}>
                        <Text style={styles.sectionTitle}>Patient Reviews</Text>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>

                    {allReviewMedia.length > 0 ? (
                        <>
                            <Text style={styles.photosLabel}>Patient photos & videos</Text>
                            <View style={styles.reviewMediaStrip}>
                                {visibleReviewMedia.map((uri, index) => {
                                    const isLastVisible =
                                        index === MAX_VISIBLE_REVIEW_MEDIA - 1 &&
                                        remainingReviewMedia > 0;
                                    return (
                                        <TouchableOpacity
                                            key={`${uri}-${index}`}
                                            activeOpacity={0.85}
                                            style={styles.stripThumbWrap}
                                            onPress={() =>
                                                openReviewGallery(
                                                    allReviewMedia,
                                                    index,
                                                )
                                            }
                                        >
                                            <Image source={{ uri }} style={styles.stripThumb} />
                                            {isReviewVideoUrl(uri) ? (
                                                <View style={styles.stripVideoBadge}>
                                                    <TablerIcon name="video" size={11} color="#FFFFFF" />
                                                </View>
                                            ) : null}
                                            {isLastVisible ? (
                                                <View style={styles.stripOverlay}>
                                                    <Text style={styles.stripOverlayText}>
                                                        +{remainingReviewMedia}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </>
                    ) : null}

                    {reviews?.length > 0 ? (
                        formattedReviews.slice(0, 3).map((review: any, index: number) => (
                            <ReviewCard
                                key={String(review?.id ?? `review-${index}`)}
                                review={review}
                                onOpenMedia={openReviewGallery}
                            />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No reviews yet</Text>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: footerBottomPad }]}>
                <View style={styles.priceContainer}>
                    <Text style={styles.feeText}>Consult Fee</Text>
                    <RupeeAmount
                        value={doctor?.consultation_fee}
                        style={styles.price}
                        iconSize={16}
                        iconColor={Colors.primaryColor}
                    />
                </View>

                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleBookAppointment}
                    style={styles.bookBtn}
                >
                    <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                    <Text numberOfLines={1} style={styles.bookText}>
                        Book Appointment
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default DoctorProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FBF9',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 52,
        marginTop: 4,
        paddingHorizontal: 16,
        backgroundColor: '#F7FBF9',
    },
    iconBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5EFEC',
    },
    backIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginHorizontal: 12,
    },
    heroCard: {
        marginHorizontal: 16,
        marginTop: 8,
        paddingTop: 28,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8F2EE',
    },
    avatarRing: {
        padding: 4,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#C8E6DC',
        marginBottom: 4,
    },
    avatarWrapper: {
        width: width * 0.28,
        height: width * 0.28,
        maxWidth: 112,
        maxHeight: 112,
        minWidth: 92,
        minHeight: 92,
        borderRadius: 24,
        backgroundColor: '#F0F7F4',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
        resizeMode: 'cover',
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
        backgroundColor: Colors.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: {
        fontSize: 34,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsBold,
    },
    doctorName: {
        marginTop: 14,
        fontSize: 24,
        lineHeight: 32,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    designationChip: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        maxWidth: '92%',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: '#ECF8F3',
    },
    speciality: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: Colors.primaryColor,
        flexShrink: 1,
    },
    heroFeeHint: {
        marginTop: 12,
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    heroFeeHintRow: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    heroFeeValue: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        marginHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8F2EE',
        overflow: 'hidden',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    divider: {
        width: 1,
        height: 36,
        backgroundColor: '#E8F2EE',
    },
    statValue: {
        fontSize: 20,
        fontFamily: Fonts.PoppinsBold,
        color: '#0F172A',
    },
    statLabel: {
        marginTop: 2,
        fontSize: 10,
        letterSpacing: 0.4,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        textAlign: 'center',
    },
    sectionCard: {
        marginTop: 14,
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8F2EE',
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    aboutText: {
        marginTop: 10,
        fontSize: 14,
        lineHeight: 23,
        fontFamily: Fonts.PoppinsRegular,
        color: '#64748B',
    },
    readMore: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    tagsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
        gap: 8,
    },
    tag: {
        borderWidth: 1,
        borderColor: '#D7EBE3',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#F4FBF8',
    },
    tagText: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: Colors.primaryColor,
    },
    emptyText: {
        marginTop: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    viewAll: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
    },
    reviewCard: {
        marginTop: 12,
        padding: 14,
        borderRadius: 16,
        backgroundColor: '#F8FBF9',
        borderWidth: 1,
        borderColor: '#EAF3EF',
    },
    reviewTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
    },
    userInfo: {
        flex: 1,
        minWidth: 0,
    },
    userImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        marginRight: 12,
        borderRadius: 22,
        backgroundColor: '#E7F5EF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
    },
    userName: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    ratingRow: {
        flexDirection: 'row',
        marginTop: 4,
        gap: 2,
    },
    time: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        marginLeft: 10,
    },
    reviewText: {
        marginTop: 10,
        fontSize: 13,
        lineHeight: 21,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    photosLabel: {
        marginTop: 14,
        marginBottom: 8,
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#64748B',
    },
    reviewMediaStrip: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
    },
    stripThumbWrap: {
        width: 72,
        height: 72,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#E8F2EE',
    },
    stripThumb: {
        width: '100%',
        height: '100%',
    },
    stripVideoBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stripOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15,23,42,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stripOverlayText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    reviewMediaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    reviewMediaThumbWrap: {
        width: 64,
        height: 64,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#E8F2EE',
    },
    reviewMediaThumb: {
        width: '100%',
        height: '100%',
    },
    reviewMediaVideoBadge: {
        position: 'absolute',
        top: 4,
        left: 4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    doctorReplyBox: {
        marginTop: 10,
        padding: 10,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8F2EE',
    },
    doctorReplyLabel: {
        fontSize: 11,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 4,
    },
    doctorReplyText: {
        fontSize: 13,
        lineHeight: 20,
        color: '#475569',
        fontFamily: Fonts.PoppinsMedium,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#E8F2EE',
        backgroundColor: '#FFFFFF',
    },
    priceContainer: {
        marginRight: 14,
        minWidth: 96,
    },
    feeText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },
    price: {
        fontSize: 24,
        fontFamily: Fonts.PoppinsBold,
        color: Colors.primaryColor,
    },
    bookBtn: {
        flex: 1,
        minHeight: 54,
        borderRadius: 16,
        backgroundColor: Colors.primaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    bookBtnLocked: {
        backgroundColor: '#64748B',
    },
    bookText: {
        marginLeft: 8,
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
        flexShrink: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        textAlign: 'center',
    },
    retryBtn: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: Colors.primaryColor,
        borderRadius: 12,
    },
    retryText: {
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14,
    },
});