// screens/ProductDetails/ProductDetails.tsx
import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, Image,
    TouchableOpacity, StatusBar, Share, ActivityIndicator,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import Detailimages from '../../components/Detailimages';
import DashboardCard from '../../components/DashboardCard';
import ReviewSection from '../../components/ReviewSecton';
import QuantityControl from '../../components/QuantityControl';
import { useProductData } from '../../hooks/useProductData';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { reviews } from '../../common/DataInterface';
import { useCartActions } from '../../hooks/Cart';
import { showSuccessToast } from '../../config/Key';

// ── Small reusable pieces ─────────────────────────────────────────────────────
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

const NutritionRow = ({
    label, value, last,
}: { label: string; value: string; last?: boolean }) => (
    <>
        <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>{label}</Text>
            <Text style={styles.nutritionValue}>{value}</Text>
        </View>
        {!last && <Divider />}
    </>
);

const Card = ({ children, style }: { children: React.ReactNode; style?: object }) => (
    <View style={[styles.card, style]}>{children}</View>
);

const Badge = ({
    label, color = '#0D614E', bg = '#E6F4F0',
}: { label: string; color?: string; bg?: string }) => (
    <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────
const ProductDetails = (props: any) => {
    const { varientID } = props?.route?.params;
    const { ProductData } = useProductData(varientID);
    const { isAdding, addToCart } = useCartActions();
    const { width } = useWindowDimensions();

    const variants = ProductData?.variants || [];
    const defaultVariant = variants.find((v: any) => v?.is_default) || variants[0];
    const [selectedVariant, setSelectedVariant] = useState<any>(defaultVariant);

    // ── LOCAL quantity — no API, just counter ────────────────────────────────
    const [quantity, setQuantity] = useState(1);

    // reset qty when variant changes
    useEffect(() => {
        if (defaultVariant) setSelectedVariant(defaultVariant);
    }, [ProductData]);

    useEffect(() => {
        setQuantity(1);
    }, [selectedVariant?.id]);

    const increaseQty = () => setQuantity(q => q + 1);
    const decreaseQty = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    // ── Add to Cart: fires API with selected qty ─────────────────────────────
    const handleAddToCart = async () => {
        const success = await addToCart(selectedVariant?.id, quantity);
        if (success) {
            props.navigation.navigate('MyCart');
        }
        else {
            showSuccessToast("try again to add into cart", 'error')
        }
    };

    const handleShare = async () => {
        try { await Share.share({ message: `Check out ${ProductData?.name}` }); } catch (_) { }
    };

    // stock
    const stockLabel = !selectedVariant?.stock ? 'Out of Stock'
        : selectedVariant.stock > 10 ? 'In Stock'
            : `Only ${selectedVariant.stock} Left`;
    const stockColor = !selectedVariant?.stock ? '#DC2626'
        : selectedVariant.stock > 10 ? '#16A34A' : '#D97706';

    const totalPrice = (selectedVariant?.selling_price || 0) * quantity;

    const nutritionData = [
        { label: 'Energy', value: '331 kcal' },
        { label: 'Protein', value: '12.3 g' },
        { label: 'Dietary Fiber', value: '8 g' },
        { label: 'Iron', value: '2.8 mg' },
    ];

    const highlights = [
        { image: Images.organic, label: '100% Organic' },
        { image: Images.glutenFree, label: 'Gluten Free' },
        { image: Images.highFiber, label: 'High Fiber' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <AppHeader
                title="Product Details"
                leftIcon={Images.backIcon}
                rightIcon={Images.share}
                onLeftPress={() => props.navigation.goBack()}
                onRightPress={handleShare}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. Images */}
                <Detailimages
                    images={selectedVariant?.media?.length ? selectedVariant.media : [Images.detailimage]}
                />

                {/* 2. Title */}
                <Card style={styles.cardNoTop}>
                    <View style={styles.topRow}>
                        <Badge label="PREMIUM QUALITY" />
                        <View style={styles.ratingPill}>
                            <Image source={Images.star} style={styles.starIcon} />
                            <Text style={styles.ratingText}>4.8</Text>
                        </View>
                    </View>
                    <Text style={styles.brandName}>{ProductData?.brand_name}</Text>
                    <Text style={styles.productName}>{ProductData?.name}</Text>
                    <Text style={styles.description}>{ProductData?.full_description}</Text>
                </Card>

                {/* 3. Price */}
                <Card>
                    <View style={styles.priceRow}>
                        <Text style={styles.sellingPrice}>₹{selectedVariant?.selling_price}</Text>
                        <Text style={styles.mrpPrice}>₹{selectedVariant?.mrp}</Text>
                        {!!selectedVariant?.discount && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>{selectedVariant.discount}% OFF</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.taxNote}>Inclusive of all taxes</Text>
                    <View style={styles.stockRow}>
                        <View style={[styles.stockDot, { backgroundColor: stockColor }]} />
                        <Text style={[styles.stockLabel, { color: stockColor }]}>{stockLabel}</Text>
                    </View>
                </Card>

                {/* 4. Variant Selector */}
                {variants.length > 0 && (
                    <Card>
                        <SectionHeader title="Select Variant" />
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
                                        style={[styles.variantChip, selected && styles.variantChipSelected]}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={[styles.variantChipText, selected && styles.variantChipTextSelected]}
                                        >
                                            {item?.weight || item?.size || item?.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </Card>
                )}

                {/* ── 5. Quantity Selector (local only, no API) ── */}
                <Card>
                    <SectionHeader title="Select Quantity" />
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
                </Card>

                {/* 6. Delivery */}
                <Card>
                    <SectionHeader title="Delivery & Services" />
                    <InfoRow title="Free Delivery" value={selectedVariant?.is_free_shipping ? 'Available' : 'Charges Apply'} />
                    <InfoRow title="Return Policy" value={selectedVariant?.returnable_days ? `${selectedVariant.returnable_days} Days` : null} />
                    <InfoRow title="Cash On Delivery" value={selectedVariant?.pay_on_delivery ? 'Available' : 'Not Available'} />
                </Card>

                {/* 7. Product Info */}
                <Card>
                    <SectionHeader title="Product Information" />
                    <InfoRow title="Manufacturer" value={ProductData?.manufacturer} />
                    <InfoRow title="Origin" value={ProductData?.origin} />
                    <InfoRow title="Treatment Type" value={ProductData?.treatment_type} />
                    <InfoRow title="Dosage" value={ProductData?.dosages} />
                </Card>

                {/* 8. Benefits */}
                {!!ProductData?.benifits && (
                    <Card>
                        <SectionHeader title="Benefits" />
                        <Text style={styles.bodyText}>{ProductData.benifits}</Text>
                    </Card>
                )}

                {/* 9. Highlights */}
                <Card>
                    <SectionHeader title="Product Highlights" />
                    <DashboardCard data={highlights} />
                </Card>

                {/* 10. Composition */}
                {!!ProductData?.compositions && (
                    <Card>
                        <SectionHeader title="Composition" />
                        <Text style={styles.bodyText}>{ProductData.compositions}</Text>
                    </Card>
                )}

                {/* 11. Nutrition */}
                <Card>
                    <View style={styles.nutritionHeader}>
                        <Image source={Images.nutritionIcon} style={styles.nutritionIcon} />
                        <SectionHeader title="Nutritional Facts" />
                    </View>
                    {nutritionData.map((item, i) => (
                        <NutritionRow key={item.label} label={item.label} value={item.value} last={i === nutritionData.length - 1} />
                    ))}
                </Card>

                {/* 12. How To Use */}
                {!!ProductData?.how_to_use && (
                    <Card>
                        <SectionHeader title="How To Use" />
                        <Text style={styles.bodyText}>{ProductData.how_to_use}</Text>
                    </Card>
                )}

                {/* 13. Safety */}
                {!!ProductData?.safety_information && (
                    <Card>
                        <SectionHeader title="Safety Information" />
                        <Text style={styles.bodyText}>{ProductData.safety_information}</Text>
                    </Card>
                )}

                {/* 14. Reviews */}
                <View style={styles.card1}>
                    <ReviewSection navigation={props.navigation} reviews={reviews} />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* ── Sticky Bottom Bar: wishlist + qty display + Add to Cart ── */}
            <View style={styles.stickyBar}>

                {/* Wishlist */}
                <TouchableOpacity style={styles.wishlistBtn} activeOpacity={0.75}>
                    <Image source={Images.wishlist} style={styles.wishlistIcon} />
                </TouchableOpacity>

                {/* Qty indicator */}
                {/* <View style={styles.stickyQtyBox}>
                    <Text style={styles.stickyQtyLabel}>Qty</Text>
                    <Text style={styles.stickyQtyValue}>{quantity}</Text>
                </View> */}

                {/* Add to Cart — fires API with current qty */}
                <TouchableOpacity
                    style={[styles.addToCartBtn, isAdding && styles.addToCartBtnDisabled]}
                    onPress={handleAddToCart}
                    activeOpacity={0.85}
                    disabled={isAdding || !selectedVariant?.stock}
                >
                    {isAdding ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <View style={styles.addToCartInner}>
                            <Image source={Images.shopCart} style={styles.cartIcon} />
                            <View>
                                <Text style={styles.addToCartText}>Add to Cart</Text>
                                {/* <Text style={styles.addToCartPrice}>₹{totalPrice.toFixed(0)}</Text> */}
                            </View>
                        </View>
                    )}
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
};

export default ProductDetails;

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
    scrollContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 20 },

    card: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginTop: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    },

    card1: {
        backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginTop: 12,

    },
    cardNoTop: { marginTop: 10, borderTopLeftRadius: 0, borderTopRightRadius: 0 },

    sectionHeader: { fontSize: 15, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A', marginBottom: 12 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 2 },

    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 10, fontFamily: Fonts.PoppinsSemiBold, letterSpacing: 0.5 },

    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    ratingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D614E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4 },
    starIcon: { width: 13, height: 13, tintColor: '#FFF' },
    ratingText: { fontSize: 13, fontFamily: Fonts.PoppinsSemiBold, color: '#FFF' },

    brandName: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
    productName: { fontSize: 20, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A', lineHeight: 28, marginBottom: 8 },
    description: { fontSize: 13, fontFamily: Fonts.PoppinsMedium, color: '#64748B', lineHeight: 20 },

    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
    sellingPrice: { fontSize: 26, fontFamily: Fonts.PoppinsSemiBold, color: '#0D614E' },
    mrpPrice: { fontSize: 15, fontFamily: Fonts.PoppinsMedium, color: '#94A3B8', textDecorationLine: 'line-through' },
    discountBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    discountText: { fontSize: 12, fontFamily: Fonts.PoppinsSemiBold, color: '#16A34A' },
    taxNote: { fontSize: 11, color: '#94A3B8', fontFamily: Fonts.PoppinsMedium, marginBottom: 10 },
    stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    stockDot: { width: 8, height: 8, borderRadius: 4 },
    stockLabel: { fontSize: 13, fontFamily: Fonts.PoppinsSemiBold },

    variantRow: { paddingVertical: 4, gap: 10 },
    variantChip: { minWidth: 80, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, backgroundColor: '#F8FAFC' },
    variantChipSelected: { backgroundColor: '#0D614E', borderColor: '#0D614E' },
    variantChipText: { fontSize: 13, fontFamily: Fonts.PoppinsMedium, color: '#334155' },
    variantChipTextSelected: { color: '#FFFFFF', fontFamily: Fonts.PoppinsSemiBold },

    // Qty section inside card
    qtySection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    qtyRight: { alignItems: 'flex-end' },
    qtyTotalLabel: { fontSize: 11, fontFamily: Fonts.PoppinsMedium, color: '#94A3B8' },
    qtyTotalPrice: { fontSize: 18, fontFamily: Fonts.PoppinsSemiBold, color: '#0D614E' },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, alignItems: 'flex-start' },
    infoLabel: { fontSize: 13, fontFamily: Fonts.PoppinsMedium, color: '#64748B', flex: 1 },
    infoValue: { fontSize: 13, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A', flex: 1, textAlign: 'right' },

    bodyText: { fontSize: 13, fontFamily: Fonts.PoppinsMedium, color: '#475569', lineHeight: 22 },

    nutritionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    nutritionIcon: { width: 22, height: 22, resizeMode: 'contain' },
    nutritionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
    nutritionLabel: { fontSize: 13, fontFamily: Fonts.PoppinsMedium, color: '#64748B' },
    nutritionValue: { fontSize: 13, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },

    // Sticky bar
    stickyBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 10, paddingBottom: 18,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1, borderTopColor: '#E2E8F0',
        gap: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08, shadowRadius: 8, elevation: 12,
    },
    wishlistBtn: {
        width: 48, height: 48, borderRadius: 14,
        borderWidth: 1.5, borderColor: '#E2E8F0',
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#FFF8F8',
    },
    wishlistIcon: { width: 22, height: 22, resizeMode: 'contain', tintColor: '#EF4444' },

    stickyQtyBox: {
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#F1F5F9', borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 6, minWidth: 48,
    },
    stickyQtyLabel: { fontSize: 10, fontFamily: Fonts.PoppinsMedium, color: '#94A3B8' },
    stickyQtyValue: { fontSize: 16, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },

    addToCartBtn: {
        flex: 1, height: 52, borderRadius: 16,
        backgroundColor: '#0D614E',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#0D614E', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
    },
    addToCartBtnDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0 },
    addToCartInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cartIcon: { width: 22, height: 22, resizeMode: 'contain', tintColor: '#FFFFFF' },
    addToCartText: { fontSize: 15, fontFamily: Fonts.PoppinsSemiBold, color: '#FFFFFF' },
    addToCartPrice: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: '#A7F3D0' },
});