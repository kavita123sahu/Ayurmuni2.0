// // screens/ProductDetails/ProductDetails.tsx
// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   ActivityIndicator,
//   Modal,
//   Pressable,
// } from 'react-native';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import AppHeader from '../../components/AppHeader';
// import Detailimages from '../../components/Detailimages';
// import ReviewSection from '../../components/ReviewSecton';
// import QuantityControl from '../../components/QuantityControl';
// import { useProductData } from '../../hooks/useProductData';
// import { Fonts } from '../../common/Fonts';
// import { useCartActions } from '../../hooks/Cart';
// import { requireAuth } from '../../services/guestAuth';
// import { showSuccessToast } from '../../config/Key';
// import { Colors } from '../../common/Colors';
// import { handleShareAction } from '../../hooks/DownloadFuction';
// import { ProductDetailShimmer } from '../../simmerScreen/ShimmerHook';
// import TablerIcon from '../../components/TablerIcon';

// const Divider = () => <View style={styles.divider} />;

// const SectionHeader = ({ title }: { title: string }) => (
//   <Text style={styles.sectionHeader}>{title}</Text>
// );

// const InfoRow = ({ title, value }: { title: string; value?: string | null }) => {
//   if (!value) return null;
//   return (
//     <>
//       <View style={styles.infoRow}>
//         <Text style={styles.infoLabel}>{title}</Text>
//         <Text style={styles.infoValue}>{value}</Text>
//       </View>
//       <Divider />
//     </>
//   );
// };

// type DetailSheetKey =
//   | 'description'
//   | 'info'
//   | 'benefits'
//   | 'composition'
//   | 'howToUse'
//   | 'safety'
//   | null;

// const DETAIL_SHEET_META: Record<
//   Exclude<DetailSheetKey, null>,
//   { title: string; icon: string }
// > = {
//   description: { title: 'Product Description', icon: 'notes' },
//   info: { title: 'Product Information', icon: 'clipboard-list' },
//   benefits: { title: 'Benefits', icon: 'circle-check' },
//   composition: { title: 'Composition', icon: 'ingredient' },
//   howToUse: { title: 'How To Use', icon: 'list' },
//   safety: { title: 'Safety Information', icon: 'shield' },
// };

// const ProductDetails = (props: any) => {
//   const { varientID } = props?.route?.params;
//   const { ProductData, loading, ReviewAll } = useProductData(varientID);
//   const { isAdding, addToCart } = useCartActions();
//   const insets = useSafeAreaInsets();

//   const variants = ProductData?.variants || [];
//   console.log('produdetailvarinstt', variants);

//   const defaultVariant =
//     variants.find((v: any) => v?.is_default) || variants[0];
//   const [selectedVariant, setSelectedVariant] = useState<any>(defaultVariant);
//   const [quantity, setQuantity] = useState(1);
//   const [descExpanded, setDescExpanded] = useState(false);
//   const [activeSheet, setActiveSheet] = useState<DetailSheetKey>(null);

//   useEffect(() => {
//     if (defaultVariant) setSelectedVariant(defaultVariant);
//   }, [ProductData]);

//   useEffect(() => {
//     setQuantity(1);
//   }, [selectedVariant?.id]);

//   const increaseQty = () => setQuantity((q: number) => q + 1);
//   const decreaseQty = () => setQuantity((q: number) => (q > 1 ? q - 1 : 1));

//   const handleAddToCart = async () => {
//     if (!(await requireAuth('Please login to add items to cart'))) return;
//     const success = await addToCart(selectedVariant?.id, quantity);
//     if (success) {
//       props.navigation.navigate('MyCart');
//     } else {
//       showSuccessToast('Try again to add into cart', 'error');
//     }
//   };

//   const stockQty = Number(selectedVariant?.quantity ?? 0);
//   const isOutOfStock = stockQty <= 0;
//   const stockLabel = isOutOfStock
//     ? 'Out of Stock'
//     : stockQty > 10
//       ? 'In Stock'
//       : `Only ${stockQty} Left`;
//   const stockColor = isOutOfStock
//     ? '#DC2626'
//     : stockQty > 10
//       ? '#16A34A'
//       : '#D97706';

//   const totalPrice = (selectedVariant?.selling_price || 0) * quantity;
//   const saveAmount = Math.max(
//     0,
//     (Number(selectedVariant?.mrp) || 0) -
//       (Number(selectedVariant?.selling_price) || 0),
//   );

//   const fullDescription = String(ProductData?.full_description || '').trim();
//   const shortDescription =
//     fullDescription.length > 140 && !descExpanded
//       ? `${fullDescription.slice(0, 140).trim()}…`
//       : fullDescription;

//   const sheetBody = useMemo(() => {
//     switch (activeSheet) {
//       case 'description':
//         return fullDescription || 'No description available.';
//       case 'benefits':
//         return ProductData?.benifits || '';
//       case 'composition':
//         return ProductData?.compositions || '';
//       case 'howToUse':
//         return ProductData?.how_to_use || '';
//       case 'safety':
//         return ProductData?.safety_information || '';
//       default:
//         return '';
//     }
//   }, [activeSheet, fullDescription, ProductData]);

//   const detailLinks = useMemo(() => {
//     const links: Array<{
//       key: Exclude<DetailSheetKey, null>;
//       label: string;
//       preview?: string;
//       show: boolean;
//     }> = [
//       {
//         key: 'description',
//         label: 'Product Description',
//         preview: fullDescription,
//         show: Boolean(fullDescription),
//       },
//       {
//         key: 'info',
//         label: 'Product Information',
//         preview: [
//           ProductData?.manufacturer,
//           ProductData?.origin,
//           ProductData?.treatment_type,
//         ]
//           .filter(Boolean)
//           .join(' · '),
//         show: Boolean(
//           ProductData?.manufacturer ||
//             ProductData?.origin ||
//             ProductData?.treatment_type ||
//             ProductData?.dosages,
//         ),
//       },
//       {
//         key: 'benefits',
//         label: 'Benefits',
//         preview: ProductData?.benifits,
//         show: Boolean(ProductData?.benifits),
//       },
//       {
//         key: 'composition',
//         label: 'Composition',
//         preview: ProductData?.compositions,
//         show: Boolean(ProductData?.compositions),
//       },
//       {
//         key: 'howToUse',
//         label: 'How To Use',
//         preview: ProductData?.how_to_use,
//         show: Boolean(ProductData?.how_to_use),
//       },
//       {
//         key: 'safety',
//         label: 'Safety Information',
//         preview: ProductData?.safety_information,
//         show: Boolean(ProductData?.safety_information),
//       },
//     ];
//     return links.filter(l => l.show);
//   }, [ProductData, fullDescription]);

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <AppHeader
//           title="Product Details"
//           onLeftPress={() => props.navigation.goBack()}
//         />
//         <ProductDetailShimmer />
//       </SafeAreaView>
//     );
//   }

//   const sheetMeta = activeSheet ? DETAIL_SHEET_META[activeSheet] : null;

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

//       <AppHeader
//         title="Product Details"
//         rightIconName="share"
//         onLeftPress={() => props.navigation.goBack()}
//         onRightPress={() =>
//           handleShareAction({
//             type: 'whatsapp',
//             message: selectedVariant?.media?.[0]?.media_url,
//           })
//         }
//       />

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         {/* Keep Detailimages untouched */}
//         <Detailimages
//           itemHeight={300}
//           DynamicResize="contain"
//           images={
//             selectedVariant?.media?.length ? selectedVariant.media : []
//           }
//         />

//         {/* Title + price (commerce-style) */}
//         <View style={styles.heroCard}>
//           <View style={styles.topRow}>
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>PREMIUM QUALITY</Text>
//             </View>
//             <View style={styles.ratingPill}>
//               <TablerIcon name="star" size={14} color="#FFFFFF" />
//               <Text style={styles.ratingText}>
//                 {selectedVariant?.avg_rating || 0}
//               </Text>
//             </View>
//           </View>

//           <Text style={styles.brandName}>{ProductData?.brand_name}</Text>
//           <Text style={styles.productName}>{ProductData?.name}</Text>

//           {!!shortDescription && (
//             <View>
//               <Text style={styles.description}>{shortDescription}</Text>
//               {fullDescription.length > 140 ? (
//                 <TouchableOpacity
//                   onPress={() =>
//                     descExpanded
//                       ? setDescExpanded(false)
//                       : setActiveSheet('description')
//                   }
//                   hitSlop={8}
//                 >
//                   <Text style={styles.readMore}>
//                     {descExpanded ? 'Show less' : 'Read more'}
//                   </Text>
//                 </TouchableOpacity>
//               ) : null}
//             </View>
//           )}

//           <View style={styles.priceBlock}>
//             <View style={styles.priceRow}>
//               <Text style={styles.sellingPrice}>
//                 ₹{selectedVariant?.selling_price}
//               </Text>
//               <Text style={styles.mrpPrice}>₹{selectedVariant?.mrp}</Text>
//               {!!selectedVariant?.discount && (
//                 <View style={styles.discountBadge}>
//                   <Text style={styles.discountText}>
//                     {selectedVariant.discount}% OFF
//                   </Text>
//                 </View>
//               )}
//             </View>
//             {saveAmount > 0 ? (
//               <Text style={styles.saveText}>
//                 You save ₹{saveAmount.toFixed(0)}
//               </Text>
//             ) : null}
//             <Text style={styles.taxNote}>Inclusive of all taxes</Text>
//             <View style={styles.stockRow}>
//               <View style={[styles.stockDot, { backgroundColor: stockColor }]} />
//               <Text style={[styles.stockLabel, { color: stockColor }]}>
//                 {stockLabel}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Trust strip */}
//         <View style={styles.trustStrip}>
//           <View style={styles.trustItem}>
//             <TablerIcon name="truck" size={16} color={Colors.primaryColor} />
//             <Text style={styles.trustText}>
//               {selectedVariant?.is_free_shipping ? 'Free delivery' : 'Fast delivery'}
//             </Text>
//           </View>
//           <View style={styles.trustDivider} />
//           <View style={styles.trustItem}>
//             <TablerIcon name="cash" size={16} color={Colors.primaryColor} />
//             <Text style={styles.trustText}>
//               {selectedVariant?.pay_on_delivery ? 'COD available' : 'Online pay'}
//             </Text>
//           </View>
//           <View style={styles.trustDivider} />
//           <View style={styles.trustItem}>
//             <TablerIcon name="refresh" size={16} color={Colors.primaryColor} />
//             <Text style={styles.trustText}>
//               {selectedVariant?.returnable_days
//                 ? `${selectedVariant.returnable_days}D return`
//                 : 'Easy returns'}
//             </Text>
//           </View>
//         </View>

//         {/* Variants */}
//         {variants.length > 0 && (
//           <View style={styles.card}>
//             <SectionHeader title="Select Size / Variant" />
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.variantRow}
//             >
//               {variants.map((item: any) => {
//                 const selected = selectedVariant?.id === item?.id;
//                 return (
//                   <TouchableOpacity
//                     key={item?.id}
//                     activeOpacity={0.75}
//                     onPress={() => setSelectedVariant(item)}
//                     style={[
//                       styles.variantChip,
//                       selected && styles.variantChipSelected,
//                     ]}
//                   >
//                     <Text
//                       numberOfLines={1}
//                       style={[
//                         styles.variantChipText,
//                         selected && styles.variantChipTextSelected,
//                       ]}
//                     >
//                       {item?.size} {item?.weightage || ''}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//           </View>
//         )}

//         {/* Quantity */}
//         <View style={styles.card}>
//           <SectionHeader title="Quantity" />
//           <View style={styles.qtySection}>
//             <QuantityControl
//               quantity={quantity}
//               onIncrease={increaseQty}
//               onDecrease={decreaseQty}
//             />
//             <View style={styles.qtyRight}>
//               <Text style={styles.qtyTotalLabel}>Total</Text>
//               <Text style={styles.qtyTotalPrice}>₹{totalPrice.toFixed(0)}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Delivery summary */}
//         <View style={styles.card}>
//           <SectionHeader title="Delivery & Services" />
//           <InfoRow
//             title="Free Delivery"
//             value={
//               selectedVariant?.is_free_shipping ? 'Available' : 'Charges Apply'
//             }
//           />
//           <InfoRow
//             title="Return Policy"
//             value={
//               selectedVariant?.returnable_days
//                 ? `${selectedVariant.returnable_days} Days`
//                 : null
//             }
//           />
//           <InfoRow
//             title="Cash On Delivery"
//             value={
//               selectedVariant?.pay_on_delivery ? 'Available' : 'Not Available'
//             }
//           />
//         </View>

//         {/* Complete details — tap opens modal (Flipkart-style) */}
//         {detailLinks.length > 0 && (
//           <View style={styles.card}>
//             <SectionHeader title="Product Details" />
//             {detailLinks.map((link, index) => (
//               <TouchableOpacity
//                 key={link.key}
//                 activeOpacity={0.8}
//                 style={[
//                   styles.detailLink,
//                   index === detailLinks.length - 1 && styles.detailLinkLast,
//                 ]}
//                 onPress={() => setActiveSheet(link.key)}
//               >
//                 <View style={styles.detailLinkLeft}>
//                   <View style={styles.detailIconWrap}>
//                     <TablerIcon
//                       name={DETAIL_SHEET_META[link.key].icon as any}
//                       size={16}
//                       color={Colors.primaryColor}
//                     />
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.detailLinkTitle}>{link.label}</Text>
//                     {!!link.preview && (
//                       <Text style={styles.detailLinkPreview} numberOfLines={1}>
//                         {link.preview}
//                       </Text>
//                     )}
//                   </View>
//                 </View>
//                 <TablerIcon name="chevron-right" size={18} color="#94A3B8" />
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}

//         {/* Reviews */}
//         <View style={styles.card}>
//           <ReviewSection
//             navigation={props.navigation}
//             reviews={ReviewAll}
//           />
//         </View>

//         <View style={{ height: 110 }} />
//       </ScrollView>

//       {/* Sticky commerce bar */}
//       <View
//         style={[
//           styles.stickyBar,
//           { paddingBottom: Math.max(insets.bottom, 10) },
//         ]}
//       >
//         <View style={styles.stickyPriceBox}>
//           <Text style={styles.stickyPriceLabel}>Total</Text>
//           <Text style={styles.stickyPriceValue}>₹{totalPrice.toFixed(0)}</Text>
//         </View>
//         <TouchableOpacity
//           style={[
//             styles.addToCartBtn,
//             isOutOfStock && styles.addToCartBtnDisabled,
//           ]}
//           onPress={handleAddToCart}
//           activeOpacity={0.85}
//           disabled={isAdding || isOutOfStock}
//         >
//           {isAdding ? (
//             <ActivityIndicator size="small" color="#FFFFFF" />
//           ) : (
//             <View style={styles.addToCartInner}>
//               <TablerIcon name="shopping-cart" size={18} color="#FFFFFF" />
//               <Text style={styles.addToCartText}>
//                 {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
//               </Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Detail bottom sheet modal */}
//       <Modal
//         visible={Boolean(activeSheet)}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setActiveSheet(null)}
//       >
//         <Pressable
//           style={styles.sheetOverlay}
//           onPress={() => setActiveSheet(null)}
//         >
//           <Pressable style={styles.sheetCard} onPress={e => e.stopPropagation()}>
//             <View style={styles.sheetHandle} />
//             <View style={styles.sheetHeader}>
//               <View style={styles.sheetTitleRow}>
//                 {sheetMeta ? (
//                   <TablerIcon
//                     name={sheetMeta.icon as any}
//                     size={18}
//                     color={Colors.primaryColor}
//                   />
//                 ) : null}
//                 <Text style={styles.sheetTitle}>
//                   {sheetMeta?.title || 'Details'}
//                 </Text>
//               </View>
//               <TouchableOpacity
//                 onPress={() => setActiveSheet(null)}
//                 style={styles.sheetClose}
//                 hitSlop={10}
//               >
//                 <TablerIcon name="x" size={18} color="#64748B" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               style={styles.sheetScroll}
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
//             >
//               {activeSheet === 'info' ? (
//                 <View>
//                   <InfoRow
//                     title="Manufacturer"
//                     value={ProductData?.manufacturer}
//                   />
//                   <InfoRow title="Origin" value={ProductData?.origin} />
//                   <InfoRow
//                     title="Treatment Type"
//                     value={ProductData?.treatment_type}
//                   />
//                   <InfoRow title="Dosage" value={ProductData?.dosages} />
//                   <InfoRow
//                     title="Brand"
//                     value={ProductData?.brand_name}
//                   />
//                   <InfoRow title="Size" value={selectedVariant?.size} />
//                 </View>
//               ) : (
//                 <Text style={styles.sheetBody}>{sheetBody}</Text>
//               )}
//             </ScrollView>
//           </Pressable>
//         </Pressable>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default ProductDetails;

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#F4F7F6' },
//   scrollContent: { paddingBottom: 20 },

//   heroCard: {
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 16,
//     paddingTop: 14,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEF2F0',
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     marginTop: 10,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderTopWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: '#EEF2F0',
//   },

//   sectionHeader: {
//     fontSize: 15,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#0F172A',
//     marginBottom: 12,
//   },
//   divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 2 },

//   badge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//     backgroundColor: '#E6F4F0',
//   },
//   badgeText: {
//     fontSize: 10,
//     fontFamily: Fonts.PoppinsSemiBold,
//     letterSpacing: 0.5,
//     color: '#0D614E',
//   },
//   topRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   ratingPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#0D614E',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//     gap: 4,
//   },
//   ratingText: {
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#FFF',
//   },

//   brandName: {
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#64748B',
//     textTransform: 'uppercase',
//     letterSpacing: 0.6,
//     marginBottom: 4,
//   },
//   productName: {
//     fontSize: 20,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#0F172A',
//     lineHeight: 28,
//     marginBottom: 8,
//   },
//   description: {
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsRegular,
//     color: '#64748B',
//     lineHeight: 20,
//   },
//   readMore: {
//     marginTop: 4,
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: Colors.primaryColor,
//   },

//   priceBlock: { marginTop: 14 },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     marginBottom: 4,
//   },
//   sellingPrice: {
//     fontSize: 26,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#0D614E',
//   },
//   mrpPrice: {
//     fontSize: 15,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#94A3B8',
//     textDecorationLine: 'line-through',
//   },
//   discountBadge: {
//     backgroundColor: '#DCFCE7',
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 8,
//   },
//   discountText: {
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#16A34A',
//   },
//   saveText: {
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#16A34A',
//     marginBottom: 2,
//   },
//   taxNote: {
//     fontSize: 11,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsMedium,
//     marginBottom: 8,
//   },
//   stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   stockDot: { width: 8, height: 8, borderRadius: 4 },
//   stockLabel: { fontSize: 13, fontFamily: Fonts.PoppinsSemiBold },

//   trustStrip: {
//     marginTop: 10,
//     backgroundColor: '#FFFFFF',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     borderTopWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: '#EEF2F0',
//   },
//   trustItem: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//   },
//   trustText: {
//     fontSize: 11,
//     color: '#334155',
//     fontFamily: Fonts.PoppinsMedium,
//   },
//   trustDivider: {
//     width: 1,
//     height: 22,
//     backgroundColor: '#E2E8F0',
//   },

//   variantRow: { paddingVertical: 4, gap: 10 },
//   variantChip: {
//     minWidth: 80,
//     height: 44,
//     borderRadius: 22,
//     borderWidth: 1.5,
//     borderColor: '#CBD5E1',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 14,
//     backgroundColor: '#F8FAFC',
//   },
//   variantChipSelected: {
//     backgroundColor: '#0D614E',
//     borderColor: '#0D614E',
//   },
//   variantChipText: {
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#334155',
//   },
//   variantChipTextSelected: {
//     color: '#FFFFFF',
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   qtySection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   qtyRight: { alignItems: 'flex-end' },
//   qtyTotalLabel: {
//     fontSize: 11,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#94A3B8',
//   },
//   qtyTotalPrice: {
//     fontSize: 18,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#0D614E',
//   },

//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 10,
//     alignItems: 'flex-start',
//   },
//   infoLabel: {
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#64748B',
//     flex: 1,
//   },
//   infoValue: {
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#0F172A',
//     flex: 1,
//     textAlign: 'right',
//   },

//   detailLink: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//     gap: 8,
//   },
//   detailLinkLast: { borderBottomWidth: 0 },
//   detailLinkLeft: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   detailIconWrap: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     backgroundColor: '#EAF8F4',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   detailLinkTitle: {
//     fontSize: 14,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#0F172A',
//   },
//   detailLinkPreview: {
//     marginTop: 2,
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsRegular,
//     color: '#94A3B8',
//   },

//   stickyBar: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 14,
//     paddingTop: 10,
//     backgroundColor: '#FFFFFF',
//     borderTopWidth: 1,
//     borderTopColor: '#E2E8F0',
//     gap: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -3 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 12,
//   },
//   stickyPriceBox: { minWidth: 72 },
//   stickyPriceLabel: {
//     fontSize: 11,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsMedium,
//   },
//   stickyPriceValue: {
//     fontSize: 18,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsSemiBold,
//   },
//   addToCartBtn: {
//     flex: 1,
//     height: 50,
//     borderRadius: 14,
//     backgroundColor: '#0D614E',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   addToCartBtnDisabled: { backgroundColor: '#6c9180' },
//   addToCartInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   addToCartText: {
//     fontSize: 15,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#FFFFFF',
//   },

//   sheetOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(15, 23, 42, 0.45)',
//     justifyContent: 'flex-end',
//   },
//   sheetCard: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 22,
//     borderTopRightRadius: 22,
//     maxHeight: '78%',
//     paddingHorizontal: 18,
//     paddingTop: 8,
//   },
//   sheetHandle: {
//     alignSelf: 'center',
//     width: 40,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: '#CBD5E1',
//     marginBottom: 10,
//   },
//   sheetHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   sheetTitleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     flex: 1,
//   },
//   sheetTitle: {
//     fontSize: 16,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#0F172A',
//   },
//   sheetClose: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#F1F5F9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   sheetScroll: { maxHeight: 420 },
//   sheetBody: {
//     fontSize: 14,
//     lineHeight: 22,
//     color: '#475569',
//     fontFamily: Fonts.PoppinsRegular,
//     paddingBottom: 8,
//   },
// });



// screens/ProductDetails/ProductDetails.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Modal,
    Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import Detailimages from '../../components/Detailimages';
import ReviewSection from '../../components/ReviewSecton';
import QuantityControl from '../../components/QuantityControl';
import { useProductData } from '../../hooks/useProductData';
import { Fonts } from '../../common/Fonts';
import { useCartActions, useVariantCartQuantity } from '../../hooks/Cart';
import { useAppSelector } from '../../store/hooks';
import { selectIsAddingVariant } from '../../store/slices/cartSlice';
import { requireAuth } from '../../services/guestAuth';
import { showSuccessToast } from '../../config/Key';
import { Colors } from '../../common/Colors';
import { handleShareAction } from '../../hooks/DownloadFuction';
import { getProductShareMessage } from '../../helper/shareMessage';
import { ProductDetailShimmer } from '../../simmerScreen/ShimmerHook';
import TablerIcon from '../../components/TablerIcon';
import ProductDetailsDiscovery from '../../components/ProductDetailsDiscovery';
import { TogglewishlistProduct } from '../../services/ProductServices';
import {
    buildProductGallery,
    cacheVariantImage,
    extractAPlusBlocks,
    resolveProductImageUri,
    splitHighlightLines,
} from '../../utils/imageUtils';
import {
    canAddProductWithoutPrescription,
    isPrescriptionRequired,
} from '../../utils/prescriptionUtils';
import {
    getProductStockDisplay,
    isProductLowStock,
    isProductOutOfStock,
} from '../../utils/productStockUtils';

const Divider = () => <View style={styles.divider} />;

const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

const InfoRow = ({ title, value }: { title: string; value?: string | null }) => {
    if (!value) return null;
    return (
        <>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{title}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
            <Divider />
        </>
    );
};

type DetailSheetKey =
    | 'description'
    | 'info'
    | 'benefits'
    | 'composition'
    | 'howToUse'
    | 'safety'
    | null;

const DETAIL_SHEET_META: Record<
    Exclude<DetailSheetKey, null>,
    { title: string; icon: string }
> = {
    description: { title: 'Product Description', icon: 'notes' },
    info: { title: 'Product Information', icon: 'clipboard-list' },
    benefits: { title: 'Benefits', icon: 'circle-check' },
    composition: { title: 'Composition', icon: 'ingredient' },
    howToUse: { title: 'How To Use', icon: 'list' },
    safety: { title: 'Safety Information', icon: 'shield' },
};

const ProductDetails = (props: any) => {
    const { varientID } = props?.route?.params;
    const { ProductData, loading, ReviewAll } = useProductData(varientID);

    const variants = ProductData?.variants || [];
    const defaultVariant =
        variants.find((v: any) => v?.is_default) || variants[0];
    const [selectedVariant, setSelectedVariant] = useState<any>(defaultVariant);
    const [quantity, setQuantity] = useState(1);
    const cartVariantId = String(
        selectedVariant?.variant_id ?? selectedVariant?.id ?? varientID ?? '',
    );
    const { addToCart } = useCartActions();
    const isAdding = useAppSelector(selectIsAddingVariant(cartVariantId));
    const existingCartQty = useVariantCartQuantity(cartVariantId);
    const insets = useSafeAreaInsets();
    const [descExpanded, setDescExpanded] = useState(false);
    const [activeSheet, setActiveSheet] = useState<DetailSheetKey>(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistBusy, setWishlistBusy] = useState(false);

    console.log("selectedVariantselectedVariantselectedVariant", selectedVariant)
    useEffect(() => {
        if (defaultVariant) setSelectedVariant(defaultVariant);
    }, [ProductData]);

    useEffect(() => {
        // Quantity picker is "how many to add", not absolute cart qty.
        setQuantity(parseInt(selectedVariant?.cart_quantity));
    }, [selectedVariant?.id]);

    useEffect(() => {
        const wishlisted = Boolean(
            selectedVariant?.is_wishlist_item ??
            ProductData?.is_wishlist_item ??
            false,
        );
        setIsWishlisted(wishlisted);
    }, [
        selectedVariant?.id,
        selectedVariant?.is_wishlist_item,
        ProductData?.is_wishlist_item,
    ]);

    const galleryImages = useMemo(
        () => buildProductGallery(selectedVariant, ProductData),
        [selectedVariant, ProductData],
    );

    const aPlusBlocks = useMemo(
        () => extractAPlusBlocks(ProductData),
        [ProductData],
    );

    const coverImageUri = useMemo(
        () => resolveProductImageUri(selectedVariant) || resolveProductImageUri(ProductData),
        [selectedVariant, ProductData],
    );

    /** Catalog product id for related/similar discovery rails */
    const discoveryProductId = useMemo(() => {
        const id =
            ProductData?.product_id ??
            ProductData?.id ??
            selectedVariant?.product_id ??
            null;
        return id ? String(id) : null;
    }, [ProductData?.product_id, ProductData?.id, selectedVariant?.product_id]);

    useEffect(() => {
        if (selectedVariant?.id && coverImageUri) {
            cacheVariantImage(selectedVariant.id, coverImageUri);
        }
    }, [selectedVariant?.id, coverImageUri]);

    const increaseQty = () => setQuantity((q: number) => q + 1);
    const decreaseQty = () => setQuantity((q: number) => (q > 1 ? q - 1 : 1));

    const handleAddToCart = async () => {
        if (!(await requireAuth('Please login to add items to cart'))) return;

        const productForRx = {
            ...ProductData,
            ...selectedVariant,
            prescription_required:
                selectedVariant?.prescription_required ??
                ProductData?.prescription_required,
        };
        if (!canAddProductWithoutPrescription(productForRx)) {
            return;
        }

        // Cache real cover before cart API returns placeholder image_url
        if (selectedVariant?.id && coverImageUri) {
            cacheVariantImage(selectedVariant.id, coverImageUri);
        } else {
            resolveProductImageUri(selectedVariant);
        }
        const addQty = Math.max(1, Number(quantity) || 1);
        const nextQty = existingCartQty + addQty;
        const success = await addToCart(cartVariantId, nextQty, {
            currentQuantity: existingCartQty,
            prescriptionRequired: isPrescriptionRequired(productForRx),
        });
        if (!success) {
            showSuccessToast('Try again to add into cart', 'error');
        }
    };

    const handleToggleWishlist = async () => {
        if (wishlistBusy) return;
        if (!(await requireAuth('Please login to save wishlist items'))) return;

        const variantId = String(
            selectedVariant?.variant_id ??
            selectedVariant?.id ??
            varientID ??
            '',
        );
        if (!variantId) {
            showSuccessToast('Product variant unavailable', 'error');
            return;
        }

        const previous = isWishlisted;
        setIsWishlisted(!previous);
        setWishlistBusy(true);

        try {
            const response = await TogglewishlistProduct(variantId as any, 'POST');
            if (response?.success === false) {
                throw new Error(response?.message || 'Wishlist update failed');
            }

            setSelectedVariant((prev: any) =>
                prev
                    ? { ...prev, is_wishlist_item: !previous }
                    : prev,
            );
            showSuccessToast(
                previous ? 'Removed from wishlist' : 'Added to wishlist',
                'success',
            );
        } catch {
            setIsWishlisted(previous);
            showSuccessToast('Unable to update wishlist', 'error');
        } finally {
            setWishlistBusy(false);
        }
    };

    const stockDisplay = getProductStockDisplay(selectedVariant);
    const isOutOfStock = isProductOutOfStock(selectedVariant);
    const isLowStock = isProductLowStock(selectedVariant);
    const stockLabel = stockDisplay.label;
    const stockColor = stockDisplay.color;

    const totalPrice = (selectedVariant?.selling_price || 0) * quantity;
    const saveAmount = Math.max(
        0,
        (Number(selectedVariant?.mrp) || 0) -
        (Number(selectedVariant?.selling_price) || 0),
    );

    const fullDescription = String(
        ProductData?.full_description || ProductData?.description || '',
    ).trim();
    const shortDescription = String(
        ProductData?.short_description || '',
    ).trim();
    const highlightSource =
        ProductData?.benifits || ProductData?.highlights || '';
    const highlightLines = useMemo(
        () => splitHighlightLines(highlightSource),
        [highlightSource],
    );
    const aboutPreview =
        fullDescription.length > 180 && !descExpanded
            ? `${fullDescription.slice(0, 180).trim()}…`
            : fullDescription;

    const sheetBody = useMemo(() => {
        switch (activeSheet) {
            case 'description':
                return fullDescription || 'No description available.';
            case 'benefits':
                return ProductData?.benifits || '';
            case 'composition':
                return ProductData?.compositions || '';
            case 'howToUse':
                return ProductData?.how_to_use || '';
            case 'safety':
                return ProductData?.safety_information || '';
            default:
                return '';
        }
    }, [activeSheet, fullDescription, ProductData]);

    const detailLinks = useMemo(() => {
        const links: Array<{
            key: Exclude<DetailSheetKey, null>;
            label: string;
            preview?: string;
            show: boolean;
        }> = [
                {
                    key: 'description',
                    label: 'Product Description',
                    preview: fullDescription,
                    show: Boolean(fullDescription),
                },
                {
                    key: 'info',
                    label: 'Product Information',
                    preview: [
                        ProductData?.manufacturer,
                        ProductData?.origin,
                        ProductData?.treatment_type,
                    ]
                        .filter(Boolean)
                        .join(' · '),
                    show: Boolean(
                        ProductData?.manufacturer ||
                        ProductData?.origin ||
                        ProductData?.treatment_type ||
                        ProductData?.dosages,
                    ),
                },
                {
                    key: 'benefits',
                    label: 'Benefits',
                    preview: ProductData?.benifits,
                    show: Boolean(ProductData?.benifits),
                },
                {
                    key: 'composition',
                    label: 'Composition',
                    preview: ProductData?.compositions,
                    show: Boolean(ProductData?.compositions),
                },
                {
                    key: 'howToUse',
                    label: 'How To Use',
                    preview: ProductData?.how_to_use,
                    show: Boolean(ProductData?.how_to_use),
                },
                {
                    key: 'safety',
                    label: 'Safety Information',
                    preview: ProductData?.safety_information,
                    show: Boolean(ProductData?.safety_information),
                },
            ];
        return links.filter(l => l.show);
    }, [ProductData, fullDescription]);

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <AppHeader
                    title="Product Details"
                    onLeftPress={() => props.navigation.goBack()}
                />
                <ProductDetailShimmer />
            </SafeAreaView>
        );
    }

    const sheetMeta = activeSheet ? DETAIL_SHEET_META[activeSheet] : null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <AppHeader
                title="Product Details"
                secondaryRightIconName={isWishlisted ? 'heart-filled' : 'heart'}
                secondaryRightIconColor={
                    isWishlisted ? Colors.primaryColor : Colors.primaryColor
                }
                onSecondaryRightPress={handleToggleWishlist}
                rightIconName="share"
                onLeftPress={() => props.navigation.goBack()}
                onRightPress={() =>
                    handleShareAction({
                        type: 'native',
                        message: getProductShareMessage({
                            name: ProductData?.name,
                            size: selectedVariant?.size,
                            price:
                                selectedVariant?.selling_price ??
                                ProductData?.selling_price,
                            url:
                                coverImageUri ||
                                galleryImages[0]?.media_url ||
                                '',
                        }),
                    })
                }
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Detailimages
                    itemHeight={300}
                    DynamicResize="contain"
                    images={galleryImages}
                />

                {isLowStock ? (
                    <View style={styles.lowStockBanner}>
                        <TablerIcon name="alert-circle" size={18} color="#B45309" />
                        <View style={styles.lowStockTextWrap}>
                            <Text style={styles.lowStockTitle}>Low stock</Text>
                            <Text style={styles.lowStockSubtitle}>
                                Only {stockDisplay.qty} left — order soon before it runs out.
                            </Text>
                        </View>
                    </View>
                ) : null}

                {/* Title + price (commerce-style) */}
                <View style={styles.heroCard}>
                    <View style={styles.topRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>PREMIUM QUALITY</Text>
                        </View>
                        <View style={styles.ratingPill}>
                            <TablerIcon name="star" size={14} color="#FFFFFF" />
                            <Text style={styles.ratingText}>
                                {selectedVariant?.avg_rating || 0}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.brandName}>{ProductData?.brand_name}</Text>
                    <Text style={styles.productName}>{ProductData?.name}</Text>

                    {!!shortDescription && (
                        <Text style={styles.shortDescription}>{shortDescription}</Text>
                    )}

                    <View style={styles.priceBlock}>
                        <View style={styles.priceRow}>
                            <Text style={styles.sellingPrice}>
                                ₹{selectedVariant?.selling_price}
                            </Text>
                            <Text style={styles.mrpPrice}>₹{selectedVariant?.mrp}</Text>
                            {!!selectedVariant?.discount && (
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>
                                        {selectedVariant.discount}% OFF
                                    </Text>
                                </View>
                            )}
                        </View>
                        {saveAmount > 0 ? (
                            <Text style={styles.saveText}>
                                You save ₹{saveAmount.toFixed(0)}
                            </Text>
                        ) : null}
                        <Text style={styles.taxNote}>Inclusive of all taxes</Text>
                        <View
                            style={[
                                styles.stockRow,
                                {
                                    backgroundColor: stockDisplay.backgroundColor,
                                },
                            ]}
                        >
                            <View style={[styles.stockDot, { backgroundColor: stockColor }]} />
                            <Text style={[styles.stockLabel, { color: stockColor }]}>
                                {stockLabel}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Trust strip */}
                <View style={styles.trustStrip}>
                    <View style={styles.trustItem}>
                        <TablerIcon name="truck" size={16} color={Colors.primaryColor} />
                        <Text style={styles.trustText}>
                            {selectedVariant?.is_free_shipping ? 'Free delivery' : 'Fast delivery'}
                        </Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}>
                        <TablerIcon name="cash" size={16} color={Colors.primaryColor} />
                        <Text style={styles.trustText}>
                            {selectedVariant?.pay_on_delivery ? 'COD available' : 'Online pay'}
                        </Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}>
                        <TablerIcon name="refresh" size={16} color={Colors.primaryColor} />
                        <Text style={styles.trustText}>
                            {selectedVariant?.returnable_days
                                ? `${selectedVariant.returnable_days}D return`
                                : 'Easy returns'}
                        </Text>
                    </View>
                </View>

                {/* Variants */}
                {variants.length > 0 && (
                    <View style={styles.card}>
                        <SectionHeader title="Select Size / Variant" />
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.variantRow}
                        >
                            {variants.map((item: any) => {
                                const selected = selectedVariant?.id === item?.id;
                                return (
                                    <TouchableOpacity
                                        key={item?.id}
                                        activeOpacity={0.75}
                                        onPress={() => setSelectedVariant(item)}
                                        style={[
                                            styles.variantChip,
                                            selected && styles.variantChipSelected,
                                        ]}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.variantChipText,
                                                selected && styles.variantChipTextSelected,
                                            ]}
                                        >
                                            {item?.size}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Quantity */}
                <View style={styles.card}>
                    <SectionHeader title="Quantity" />
                    <View style={styles.qtySection}>
                        <QuantityControl
                            quantity={quantity}
                            onIncrease={increaseQty}
                            onDecrease={decreaseQty}
                        />
                        <View style={styles.qtyRight}>
                            <Text style={styles.qtyTotalLabel}>Total</Text>
                            <Text style={styles.qtyTotalPrice}>₹{totalPrice.toFixed(0)}</Text>
                        </View>
                    </View>
                </View>

                {/* Delivery summary */}
                {/* <View style={styles.card}>
                    <SectionHeader title="Delivery & Services" />
                    <InfoRow
                        title="Free Delivery"
                        value={
                            selectedVariant?.is_free_shipping ? 'Available' : 'Charges Apply'
                        }
                    />
                    <InfoRow
                        title="Return Policy"
                        value={
                            selectedVariant?.returnable_days
                                ? `${selectedVariant.returnable_days} Days`
                                : null
                        }
                    />
                    <InfoRow
                        title="Cash On Delivery"
                        value={
                            selectedVariant?.pay_on_delivery ? 'Available' : 'Not Available'
                        }
                    />
                </View> */}

                {/* Flipkart/Amazon-style highlights + about */}
                {(highlightLines.length > 0 || !!fullDescription) && (
                    <View style={styles.card}>
                        {highlightLines.length > 0 ? (
                            <>
                                <SectionHeader title="Highlights" />
                                <View style={styles.highlightList}>
                                    {highlightLines.map((line, index) => (
                                        <View key={`hl-${index}`} style={styles.highlightRow}>
                                            <View style={styles.highlightBullet} />
                                            <Text style={styles.highlightText}>{line}</Text>
                                        </View>
                                    ))}
                                </View>
                            </>
                        ) : null}

                        {!!fullDescription && (
                            <View
                                style={
                                    highlightLines.length > 0
                                        ? styles.aboutBlock
                                        : undefined
                                }
                            >
                                <SectionHeader title="About this item" />
                                <Text style={styles.description}>{aboutPreview}</Text>
                                {fullDescription.length > 180 ? (
                                    <TouchableOpacity
                                        onPress={() => setDescExpanded(prev => !prev)}
                                        hitSlop={8}
                                    >
                                        <Text style={styles.readMore}>
                                            {descExpanded ? 'Show less' : 'Read more'}
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        )}
                    </View>
                )}

                {/* A+ / enriched product content */}
                {aPlusBlocks.length > 0 && (
                    <View style={styles.card}>
                        <SectionHeader title="From the brand" />
                        {aPlusBlocks.map(block => (
                            <View key={block.id} style={styles.aPlusBlock}>
                                {!!block.imageUri && (
                                    <Image
                                        source={{ uri: block.imageUri }}
                                        style={styles.aPlusImage}
                                        resizeMode="cover"
                                    />
                                )}
                                {!!block.title && (
                                    <Text style={styles.aPlusTitle}>{block.title}</Text>
                                )}
                                {!!block.body && (
                                    <Text style={styles.aPlusBody}>{block.body}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Complete details — tap opens modal (Flipkart-style) */}
                {detailLinks.length > 0 && (
                    <View style={styles.card}>
                        <SectionHeader title="Product Details" />
                        {detailLinks.map((link, index) => (
                            <TouchableOpacity
                                key={link.key}
                                activeOpacity={0.8}
                                style={[
                                    styles.detailLink,
                                    index === detailLinks.length - 1 && styles.detailLinkLast,
                                ]}
                                onPress={() => setActiveSheet(link.key)}
                            >
                                <View style={styles.detailLinkLeft}>
                                    <View style={styles.detailIconWrap}>
                                        <TablerIcon
                                            name={DETAIL_SHEET_META[link.key].icon as any}
                                            size={16}
                                            color={Colors.primaryColor}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.detailLinkTitle}>{link.label}</Text>
                                        {!!link.preview && (
                                            <Text style={styles.detailLinkPreview} numberOfLines={1}>
                                                {link.preview}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <TablerIcon name="chevron-right" size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Reviews */}
                <View style={styles.card}>
                    <ReviewSection
                        navigation={props.navigation}
                        reviews={ReviewAll}
                        entityType="product"
                        variantId={String(varientID || '')}
                        title="Product Reviews"
                    />
                </View>

                {/* Discovery rails — sequential API, horizontal scroll, auto load-more */}
                {!!discoveryProductId && (
                    <View style={styles.discoveryWrap}>
                        <ProductDetailsDiscovery
                            productId={discoveryProductId}
                            navigation={props.navigation}
                            excludeVariantId={varientID}
                        />
                    </View>
                )}

                <View style={{ height: 110 }} />
            </ScrollView>

            {/* Sticky commerce bar */}
            <View
                style={[
                    styles.stickyBar,
                    { paddingBottom: Math.max(insets.bottom, 10) },
                ]}
            >
                <View style={styles.stickyPriceBox}>
                    <Text style={styles.stickyPriceLabel}>Total</Text>
                    <Text style={styles.stickyPriceValue}>₹{totalPrice.toFixed(0)}</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.addToCartBtn,
                        (isOutOfStock || isAdding) && styles.addToCartBtnDisabled,
                    ]}
                    onPress={handleAddToCart}
                    activeOpacity={0.85}
                    disabled={isOutOfStock || isAdding}
                >
                    {isAdding ? (
                        <View style={styles.addToCartInner}>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.addToCartText}>Adding…</Text>
                        </View>
                    ) : (
                        <View style={styles.addToCartInner}>
                            <TablerIcon name="shopping-cart" size={18} color="#FFFFFF" />
                            <Text style={styles.addToCartText}>
                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Detail bottom sheet modal */}
            <Modal
                visible={Boolean(activeSheet)}
                animationType="slide"
                transparent
                onRequestClose={() => setActiveSheet(null)}
            >
                <Pressable
                    style={styles.sheetOverlay}
                    onPress={() => setActiveSheet(null)}
                >
                    <Pressable style={styles.sheetCard} onPress={e => e.stopPropagation()}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <View style={styles.sheetTitleRow}>
                                {sheetMeta ? (
                                    <TablerIcon
                                        name={sheetMeta.icon as any}
                                        size={18}
                                        color={Colors.primaryColor}
                                    />
                                ) : null}
                                <Text style={styles.sheetTitle}>
                                    {sheetMeta?.title || 'Details'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setActiveSheet(null)}
                                style={styles.sheetClose}
                                hitSlop={10}
                            >
                                <TablerIcon name="x" size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.sheetScroll}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                        >
                            {activeSheet === 'info' ? (
                                <View>
                                    <InfoRow
                                        title="Manufacturer"
                                        value={ProductData?.manufacturer}
                                    />
                                    <InfoRow title="Origin" value={ProductData?.origin} />
                                    <InfoRow
                                        title="Treatment Type"
                                        value={ProductData?.treatment_type}
                                    />
                                    <InfoRow title="Dosage" value={ProductData?.dosages} />
                                    <InfoRow
                                        title="Brand"
                                        value={ProductData?.brand_name}
                                    />
                                    <InfoRow title="Size" value={selectedVariant?.size} />
                                </View>
                            ) : (
                                <Text style={styles.sheetBody}>{sheetBody}</Text>
                            )}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

export default ProductDetails;

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F7F6' },
    scrollContent: { paddingBottom: 20 },
    discoveryWrap: {
        marginTop: 8,
        marginHorizontal: -4,
        gap: 4,
    },

    heroCard: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF2F0',
    },
    card: {
        backgroundColor: '#FFFFFF',
        marginTop: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#EEF2F0',
    },

    sectionHeader: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginBottom: 12,
    },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 2 },

    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: '#E6F4F0',
    },
    badgeText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        letterSpacing: 0.5,
        color: '#0D614E',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    ratingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0D614E',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFF',
    },

    brandName: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 4,
    },
    productName: {
        fontSize: 20,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        lineHeight: 28,
        marginBottom: 8,
    },
    shortDescription: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsRegular,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsRegular,
        color: '#64748B',
        lineHeight: 20,
    },
    readMore: {
        marginTop: 4,
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
    },
    highlightList: {
        gap: 8,
        marginBottom: 4,
    },
    highlightRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    highlightBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 7,
        backgroundColor: Colors.primaryColor,
    },
    highlightText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
        color: '#334155',
        fontFamily: Fonts.PoppinsRegular,
    },
    aboutBlock: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E2E8F0',
    },
    aPlusBlock: {
        marginBottom: 14,
    },
    aPlusImage: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        marginBottom: 10,
    },
    aPlusTitle: {
        fontSize: 15,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 4,
    },
    aPlusBody: {
        fontSize: 13,
        lineHeight: 20,
        color: '#475569',
        fontFamily: Fonts.PoppinsRegular,
    },

    priceBlock: { marginTop: 14 },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
    },
    sellingPrice: {
        fontSize: 26,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',
    },
    mrpPrice: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    discountText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#16A34A',
    },
    saveText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#16A34A',
        marginBottom: 2,
    },
    taxNote: {
        fontSize: 11,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 8,
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    stockDot: { width: 8, height: 8, borderRadius: 4 },
    stockLabel: { fontSize: 13, fontFamily: Fonts.PoppinsSemiBold },
    lowStockBanner: {
        marginHorizontal: 16,
        marginBottom: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FCD34D',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    lowStockTextWrap: {
        flex: 1,
        gap: 2,
    },
    lowStockTitle: {
        fontSize: 14,
        color: '#92400E',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    lowStockSubtitle: {
        fontSize: 12,
        lineHeight: 17,
        color: '#B45309',
        fontFamily: Fonts.PoppinsRegular,
    },

    trustStrip: {
        marginTop: 10,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#EEF2F0',
    },
    trustItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    trustText: {
        fontSize: 11,
        color: '#334155',
        fontFamily: Fonts.PoppinsMedium,
    },
    trustDivider: {
        width: 1,
        height: 22,
        backgroundColor: '#E2E8F0',
    },

    variantRow: { paddingVertical: 4, gap: 10 },
    variantChip: {
        minWidth: 80,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 14,
        backgroundColor: '#F8FAFC',
    },
    variantChipSelected: {
        backgroundColor: '#0D614E',
        borderColor: '#0D614E',
    },
    variantChipText: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#334155',
    },
    variantChipTextSelected: {
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    qtySection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    qtyRight: { alignItems: 'flex-end' },
    qtyTotalLabel: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },
    qtyTotalPrice: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        alignItems: 'flex-start',
    },
    infoLabel: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        flex: 1,
    },
    infoValue: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        flex: 1,
        textAlign: 'right',
    },

    detailLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        gap: 8,
    },
    detailLinkLast: { borderBottomWidth: 0 },
    detailLinkLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#EAF8F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailLinkTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    detailLinkPreview: {
        marginTop: 2,
        fontSize: 12,
        fontFamily: Fonts.PoppinsRegular,
        color: '#94A3B8',
    },

    stickyBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingTop: 10,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 12,
    },
    stickyPriceBox: { minWidth: 72 },
    stickyPriceLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },
    stickyPriceValue: {
        fontSize: 18,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    addToCartBtn: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        backgroundColor: '#0D614E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addToCartBtnDisabled: { backgroundColor: '#6c9180' },
    addToCartInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    addToCartText: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
    },

    sheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        justifyContent: 'flex-end',
    },
    sheetCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        maxHeight: '78%',
        paddingHorizontal: 18,
        paddingTop: 8,
    },
    sheetHandle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
        marginBottom: 10,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sheetTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    sheetTitle: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    sheetClose: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetScroll: { maxHeight: 420 },
    sheetBody: {
        fontSize: 14,
        lineHeight: 22,
        color: '#475569',
        fontFamily: Fonts.PoppinsRegular,
        paddingBottom: 8,
    },
});
