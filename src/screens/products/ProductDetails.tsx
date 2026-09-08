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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import Detailimages from '../../components/Detailimages';
import ReviewSection from '../../components/ReviewSecton';
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
    canAddProductQty,
    getProductStockDisplay,
    getProductStockQty,
    isProductLowStock,
    isProductOutOfStock,
} from '../../utils/productStockUtils';
import { formatRupee, RupeeAmount } from '../../utils/currencyUtils';
import { SCREEN } from '../../constants/responsive';
import LinearGradient from 'react-native-linear-gradient';

const GALLERY_H = Math.round(Math.min(SCREEN.width * 0.7, 248));

const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

const CompactQtyStepper = ({
    quantity,
    onIncrease,
    onDecrease,
    disabled,
}: {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    disabled?: boolean;
}) => (
    <View style={[styles.qtyStepper, disabled && styles.qtyStepperDisabled]}>
        <TouchableOpacity
            onPress={onDecrease}
            disabled={disabled || quantity <= 1}
            style={styles.qtyBtn}
            hitSlop={8}
        >
            <TablerIcon
                name="minus"
                size={14}
                color={disabled || quantity <= 1 ? 'rgba(255,255,255,0.4)' : '#FFFFFF'}
                strokeWidth={2.6}
            />
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{quantity}</Text>
        <TouchableOpacity
            onPress={onIncrease}
            disabled={disabled}
            style={styles.qtyBtn}
            hitSlop={8}
        >
            <TablerIcon
                name="plus"
                size={14}
                color={disabled ? 'rgba(255,255,255,0.4)' : '#FFFFFF'}
                strokeWidth={2.6}
            />
        </TouchableOpacity>
    </View>
);

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
    const [pendingCta, setPendingCta] = useState<'add' | 'buy' | null>(null);
    const cartVariantId = String(
        selectedVariant?.variant_id ?? selectedVariant?.id ?? varientID ?? '',
    );
    const { addToCart } = useCartActions();
    const isAdding = useAppSelector(selectIsAddingVariant(cartVariantId));
    const existingCartQty = useVariantCartQuantity(cartVariantId);
    const insets = useSafeAreaInsets();
    const [descExpanded, setDescExpanded] = useState(false);
    const [expandedDetail, setExpandedDetail] = useState<DetailSheetKey>(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistBusy, setWishlistBusy] = useState(false);

    useEffect(() => {
        if (defaultVariant) setSelectedVariant(defaultVariant);
    }, [ProductData]);

    useEffect(() => {
        setQuantity(1);
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

    const stockQty = getProductStockQty(selectedVariant);
    const maxQty = stockQty != null && stockQty > 0 ? stockQty : 1;

    const increaseQty = () =>
        setQuantity((q: number) => Math.min(q + 1, maxQty));
    const decreaseQty = () => setQuantity((q: number) => (q > 1 ? q - 1 : 1));

    const handleAddToCart = async (goToCart = false) => {
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

        if (selectedVariant?.id && coverImageUri) {
            cacheVariantImage(selectedVariant.id, coverImageUri);
        } else {
            resolveProductImageUri(selectedVariant);
        }

        const addQty = Math.max(1, Number(quantity) || 1);
        const nextQty = existingCartQty + addQty;
        if (!canAddProductQty(selectedVariant, nextQty)) {
            showSuccessToast('Only limited stock left', 'error');
            return;
        }

        setPendingCta(goToCart ? 'buy' : 'add');
        const success = await addToCart(cartVariantId, nextQty, {
            currentQuantity: existingCartQty,
            prescriptionRequired: isPrescriptionRequired(productForRx),
        });
        setPendingCta(null);

        if (!success) {
            showSuccessToast('Try again to add into cart', 'error');
            return;
        }
        if (goToCart) {
            props.navigation.navigate('MyCart');
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
                prev ? { ...prev, is_wishlist_item: !previous } : prev,
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
    const rxRequired = isPrescriptionRequired({
        ...ProductData,
        ...selectedVariant,
    });

    const totalPrice = (selectedVariant?.selling_price || 0) * quantity;
    const saveAmount = Math.max(
        0,
        (Number(selectedVariant?.mrp) || 0) -
        (Number(selectedVariant?.selling_price) || 0),
    );

    const ratingValue = Number(
        selectedVariant?.avg_rating || ProductData?.avg_rating || 0,
    );
    const reviewCount = ReviewAll?.length || 0;

    const bestDealVariantId = useMemo(() => {
        if (!Array.isArray(variants) || variants.length < 2) return null;
        let bestId: any = null;
        let bestDisc = 0;
        variants.forEach((v: any) => {
            const disc = Number(v?.discount) || 0;
            if (disc > bestDisc) {
                bestDisc = disc;
                bestId = v?.id;
            }
        });
        return bestDisc > 0 ? bestId : null;
    }, [variants]);

    const deliveryBy = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    }, []);

    const fullDescription = String(
        ProductData?.full_description || ProductData?.description || '',
    ).trim();
    const shortDescription = String(ProductData?.short_description || '').trim();
    const highlightSource = ProductData?.benifits || ProductData?.highlights || '';
    const highlightLines = useMemo(
        () => splitHighlightLines(highlightSource),
        [highlightSource],
    );
    const aboutPreview =
        fullDescription.length > 140 && !descExpanded
            ? `${fullDescription.slice(0, 140).trim()}…`
            : fullDescription;

    const getDetailBody = (key: Exclude<DetailSheetKey, null>) => {
        switch (key) {
            case 'description':
                return fullDescription || 'No description available.';
            case 'benefits':
                return String(ProductData?.benifits || '').trim();
            case 'composition':
                return String(ProductData?.compositions || '').trim();
            case 'howToUse':
                return String(ProductData?.how_to_use || '').trim();
            case 'safety':
                return String(ProductData?.safety_information || '').trim();
            default:
                return '';
        }
    };

    const specItems = useMemo(
        () =>
            [
                { label: 'Brand', value: ProductData?.brand_name },
                {
                    label: 'Pack size',
                    value: (selectedVariant?.size || selectedVariant?.title) + " " + selectedVariant?.weightage,
                },
                { label: 'Manufacturer', value: ProductData?.manufacturer },
                { label: 'Origin', value: ProductData?.origin },
                { label: 'Treatment', value: ProductData?.treatment_type },
                { label: 'Dosage', value: ProductData?.dosages },
            ].filter(item => Boolean(item.value)),
        [ProductData, selectedVariant],
    );

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

    const accordionLinks = detailLinks.filter(l => l.key !== 'info');
    const ctaBusy = isAdding || pendingCta != null;
    const addBusy = pendingCta === 'add' || (isAdding && pendingCta !== 'buy');
    const buyBusy = pendingCta === 'buy';

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <AppHeader
                title="Product Details"
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
                <View style={styles.galleryWrap}>
                    <Detailimages
                        itemHeight={GALLERY_H}
                        DynamicResize="contain"
                        fullBleed
                        showPreviewChip={false}
                        images={galleryImages}
                    />
                    <TouchableOpacity
                        style={styles.wishFab}
                        onPress={handleToggleWishlist}
                        activeOpacity={0.85}
                        disabled={wishlistBusy}
                    >
                        <TablerIcon
                            name={isWishlisted ? 'heart-filled' : 'heart'}
                            size={18}
                            color={isWishlisted ? '#0D614E' : '#0F172A'}
                        />
                    </TouchableOpacity>
                    {!!selectedVariant?.discount && (
                        <LinearGradient
                            colors={['#15803D', '#22C55E']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.discountOverlay}
                        >
                            <Text style={styles.discountOverlayText}>
                                {selectedVariant.discount}% OFF
                            </Text>
                        </LinearGradient>
                    )}
                </View>

                <View style={styles.heroCard}>
                    <View style={styles.metaRow}>
                        {!!ProductData?.brand_name && (
                            <Text style={styles.brandName} numberOfLines={1}>
                                {ProductData.brand_name}
                            </Text>
                        )}
                        {rxRequired ? (
                            <View style={styles.rxBadge}>
                                <TablerIcon name="prescription" size={11} color="#B45309" />
                                <Text style={styles.rxText}>Rx</Text>
                            </View>
                        ) : null}
                        {ratingValue > 0 ? (
                            <View style={styles.ratingPill}>
                                <TablerIcon name="star-filled" size={10} color="#FFFFFF" />
                                <Text style={styles.ratingText}>
                                    {ratingValue.toFixed(1)}
                                </Text>
                            </View>
                        ) : null}
                        {reviewCount > 0 ? (
                            <Text style={styles.reviewCount}>
                                {reviewCount} {reviewCount === 1 ? 'rating' : 'ratings'}
                            </Text>
                        ) : null}
                    </View>

                    <Text style={styles.productName}>{ProductData?.name}</Text>

                    {!!(selectedVariant?.size || selectedVariant?.title) && (
                        <Text style={styles.packLine} numberOfLines={1}>
                            {[selectedVariant?.title, selectedVariant?.size]
                                .filter(Boolean)
                                .join(' · ')}
                            {" "}
                            {selectedVariant?.weightage + " " + selectedVariant?.physical_state}
                        </Text>
                    )}

                    {!!shortDescription && (
                        <Text style={styles.shortDescription} numberOfLines={2}>
                            {shortDescription}
                        </Text>
                    )}

                    <View style={styles.priceRow}>
                        <View style={styles.priceLeft}>
                            {saveAmount > 0 ? (
                                <Text style={styles.specialLabel}>Special price</Text>
                            ) : null}
                            <View style={styles.priceLine}>
                                <RupeeAmount
                                    value={selectedVariant?.selling_price}
                                    style={styles.sellingPrice}
                                />
                                <RupeeAmount
                                    value={selectedVariant?.mrp}
                                    style={styles.mrpPrice}
                                />
                                {!!selectedVariant?.discount && (
                                    <Text style={styles.discountInline}>
                                        {selectedVariant.discount}% off
                                    </Text>
                                )}
                            </View>
                            {/* Add stock display here */}
                            {isLowStock ? (
                                <View style={styles.hurryStrip}>
                                    <TablerIcon name="flame" size={14} color="#C2410C" />
                                    <Text style={styles.hurryText}>
                                        Hurry! Only {stockDisplay.qty} left at this price
                                    </Text>
                                </View>
                            ) : (
                                <View
                                    style={[
                                        styles.stockChip,
                                        { backgroundColor: stockDisplay.backgroundColor },
                                    ]}
                                >
                                    <View style={[styles.stockDot, { backgroundColor: stockDisplay.color }]} />
                                    <Text style={[styles.stockLabel, { color: stockDisplay.color }]}>
                                        {stockDisplay.label}
                                    </Text>
                                </View>
                            )}
                            {/* <Text style={styles.taxNote}>Inclusive of all taxes</Text> */}
                        </View>
                        <CompactQtyStepper
                            quantity={quantity}
                            onIncrease={increaseQty}
                            onDecrease={decreaseQty}
                            disabled={isOutOfStock}
                        />
                        {/* Add stock display here */}
                    </View>

                    {saveAmount > 0 ? (
                        <LinearGradient
                            colors={['#ECFDF5', '#D1FAE5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.offerStrip}
                        >
                            <View style={styles.offerIcon}>
                                <TablerIcon name="bolt" size={13} color="#15803D" />
                            </View>
                            <Text style={styles.offerText}>
                                You save {formatRupee(saveAmount)} on this pack
                            </Text>
                        </LinearGradient>
                    ) : null}



                    {/* <View style={styles.deliveryRow}>
                        <View style={styles.deliveryIcon}>
                            <TablerIcon name="truck" size={14} color={Colors.primaryColor} />
                        </View>
                        <Text style={styles.deliveryText}>
                            Get it by <Text style={styles.deliveryStrong}>{deliveryBy}</Text>
                        </Text>
                        {selectedVariant?.is_free_shipping ? (
                            <View style={styles.freeTag}>
                                <Text style={styles.freeTagText}>FREE</Text>
                            </View>
                        ) : null}
                    </View> */}
                </View>
                {variants.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionHeader}>Select pack</Text>
                            {existingCartQty > 0 ? (
                                <Text style={styles.inCartHint}>{existingCartQty} in cart</Text>
                            ) : null}
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.variantRow}
                        >
                            {variants.map((item: any) => {
                                const selected = selectedVariant?.id === item?.id;
                                const isBest = bestDealVariantId === item?.id;
                                const details = [item?.size, item?.weightage, item?.physical_state]
                                    .filter(Boolean)
                                    .join(' ');
                                return (
                                    <TouchableOpacity
                                        key={item?.id}
                                        activeOpacity={0.8}
                                        onPress={() => setSelectedVariant(item)}
                                        style={[
                                            styles.variantCard,
                                            selected && styles.variantCardSelected,
                                        ]}
                                    >
                                        {isBest ? (
                                            <View style={styles.bestPill}>
                                                <Text style={styles.bestPillText}>BEST</Text>
                                            </View>
                                        ) : null}
                                        {selected ? (
                                            <View style={styles.variantCheck}>
                                                <TablerIcon name="check" size={10} color="#FFFFFF" />
                                            </View>
                                        ) : null}
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.variantName,
                                                selected && styles.variantNameSelected,
                                            ]}
                                        >
                                            {item?.title || item?.size || 'Pack'}
                                        </Text>
                                        {!!details && details !== item?.title && (
                                            <Text
                                                numberOfLines={1}
                                                style={[
                                                    styles.variantDetails,
                                                    selected && styles.variantDetailsSelected,
                                                ]}
                                            >
                                                {details}
                                            </Text>
                                        )}
                                        <RupeeAmount
                                            value={item?.selling_price}
                                            style={[
                                                styles.variantPrice,
                                                selected && styles.variantPriceSelected,
                                            ]}
                                        />
                                        {!!item?.discount && (
                                            <Text
                                                style={[
                                                    styles.variantOff,
                                                    selected && styles.variantOffSelected,
                                                ]}
                                            >
                                                {item.discount}% off
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}
                <View style={styles.trustStrip}>
                    <View style={styles.trustItem}>
                        <View style={[styles.trustIcon, { backgroundColor: '#E0F2FE' }]}>
                            <TablerIcon name="truck" size={15} color="#0369A1" />
                        </View>
                        <Text style={styles.trustText}>
                            {selectedVariant?.is_free_shipping ? 'Free delivery' : 'Fast delivery'}
                        </Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}>
                        <View style={[styles.trustIcon, { backgroundColor: '#FEF3C7' }]}>
                            <TablerIcon name="cash" size={15} color="#B45309" />
                        </View>
                        <Text style={styles.trustText}>
                            {selectedVariant?.pay_on_delivery ? 'COD available' : 'Online pay'}
                        </Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}>
                        <View style={[styles.trustIcon, { backgroundColor: '#EAF8F4' }]}>
                            {
                                selectedVariant?.is_returnable ? (
                                    <TablerIcon name="refresh" size={15} color={Colors.primaryColor} />
                                ) : (
                                    <TablerIcon name="circle-x" size={15} color={Colors.primaryColor} style={{ backgroundColor: '#EAF8F4' }} />
                                )
                            }
                        </View>
                        <Text style={styles.trustText}>
                            {selectedVariant?.returnable_days
                                ? `${selectedVariant.returnable_days}D return`
                                : selectedVariant?.is_returnable ? 'Easy returns' : 'Non-returnable'}
                        </Text>
                    </View>
                </View>



                {(highlightLines.length > 0 || !!fullDescription) && (
                    <View style={styles.card}>
                        {highlightLines.length > 0 ? (
                            <>
                                <SectionHeader title="Highlights" />
                                <View style={styles.highlightList}>
                                    {highlightLines.map((line, index) => (
                                        <View key={`hl-${index}`} style={styles.highlightRow}>
                                            <TablerIcon
                                                name="circle-check"
                                                size={14}
                                                color={Colors.primaryColor}
                                            />
                                            <Text style={styles.highlightText}>{line}</Text>
                                        </View>
                                    ))}
                                </View>
                            </>
                        ) : null}

                        {!!fullDescription && (
                            <View
                                style={highlightLines.length > 0 ? styles.aboutBlock : undefined}
                            >
                                <SectionHeader title="About this item" />
                                <Text style={styles.description}>{aboutPreview}</Text>
                                {fullDescription.length > 140 ? (
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

                {(specItems.length > 0 || accordionLinks.length > 0) && (
                    <View style={styles.card}>
                        <View style={styles.detailsHead}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.detailsTitle}>Product details</Text>
                                <Text style={styles.detailsSub}>
                                    {specItems.length > 0
                                        ? `${specItems.length} specifications`
                                        : 'Key information about this product'}
                                </Text>
                            </View>
                        </View>

                        {specItems.length > 0 ? (
                            <View style={styles.specGrid}>
                                {specItems.map((item, index) => (
                                    <View
                                        key={item.label}
                                        style={[
                                            styles.specCell,
                                            index % 2 === 0 && styles.specCellLeft,
                                        ]}
                                    >
                                        <Text style={styles.specLabel}>{item.label}</Text>
                                        <Text style={styles.specValue} numberOfLines={2}>
                                            {item.value}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ) : null}

                        {accordionLinks.length > 0 ? (
                            <View style={specItems.length > 0 ? styles.accordionWrap : undefined}>
                                {accordionLinks.map((link, index) => {
                                    const open = expandedDetail === link.key;
                                    const body = getDetailBody(link.key);
                                    return (
                                        <View
                                            key={link.key}
                                            style={[
                                                styles.accordionItem,
                                                index === accordionLinks.length - 1 &&
                                                styles.accordionItemLast,
                                            ]}
                                        >
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                style={styles.accordionHeader}
                                                onPress={() =>
                                                    setExpandedDetail(open ? null : link.key)
                                                }
                                            >
                                                <View style={styles.detailIconWrap}>
                                                    <TablerIcon
                                                        name={DETAIL_SHEET_META[link.key].icon as any}
                                                        size={15}
                                                        color={Colors.primaryColor}
                                                    />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.detailLinkTitle}>
                                                        {link.label}
                                                    </Text>
                                                    {!open && !!link.preview ? (
                                                        <Text
                                                            style={styles.detailLinkPreview}
                                                            numberOfLines={1}
                                                        >
                                                            {link.preview}
                                                        </Text>
                                                    ) : null}
                                                </View>
                                                <TablerIcon
                                                    name={open ? 'chevron-up' : 'chevron-down'}
                                                    size={16}
                                                    color="#94A3B8"
                                                />
                                            </TouchableOpacity>
                                            {open ? (
                                                <Text style={styles.accordionBody}>{body}</Text>
                                            ) : null}
                                        </View>
                                    );
                                })}
                            </View>
                        ) : null}
                    </View>
                )}

                <View style={styles.card}>
                    <ReviewSection
                        navigation={props.navigation}
                        reviews={ReviewAll}
                        entityType="product"
                        variantId={String(varientID || '')}
                        title="Ratings & reviews"
                    />
                </View>

                {!!discoveryProductId && (
                    <View style={styles.discoveryWrap}>
                        <ProductDetailsDiscovery
                            productId={discoveryProductId}
                            navigation={props.navigation}
                            excludeVariantId={varientID}
                        />
                    </View>
                )}

                <View style={{ height: 108 }} />
            </ScrollView>

            <View
                style={[
                    styles.stickyBar,
                    { paddingBottom: Math.max(insets.bottom, 8) },
                ]}
            >
                <View style={styles.stickyRow}>
                    <View style={styles.stickyPriceBox}>
                        <RupeeAmount
                            value={totalPrice.toFixed(0)}
                            style={styles.stickyPrice}
                        />
                        {existingCartQty > 0 ? (
                            <Text style={styles.stickyHint}>{existingCartQty} in cart</Text>
                        ) : saveAmount > 0 ? (
                            <Text style={styles.stickySave}>
                                Save {formatRupee(saveAmount * quantity)}
                            </Text>
                        ) : (
                            <Text style={styles.stickyHint}>Total</Text>
                        )}
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.secondaryBtn,
                            (isOutOfStock || ctaBusy) && styles.btnDisabled,
                        ]}
                        onPress={() => handleAddToCart(false)}
                        activeOpacity={0.85}
                        disabled={isOutOfStock || ctaBusy}
                    >
                        {addBusy ? (
                            <ActivityIndicator size="small" color={Colors.primaryColor} />
                        ) : (
                            <View style={styles.ctaInner}>
                                <TablerIcon
                                    name="shopping-cart"
                                    size={15}
                                    color={isOutOfStock ? '#94A3B8' : Colors.primaryColor}
                                />
                                <Text style={styles.secondaryBtnText}>
                                    {isOutOfStock ? 'Sold out' : 'Add'}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            existingCartQty > 0
                                ? props.navigation.navigate('MyCart')
                                : handleAddToCart(true)
                        }
                        activeOpacity={0.85}
                        disabled={(existingCartQty <= 0 && isOutOfStock) || ctaBusy}
                        style={styles.primaryBtnWrap}
                    >
                        <LinearGradient
                            colors={
                                (existingCartQty <= 0 && isOutOfStock) || ctaBusy
                                    ? ['#6c9180', '#6c9180']
                                    : ['#0D614E', '#14937A']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.primaryBtn}
                        >
                            {buyBusy ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.primaryBtnText}>
                                    {existingCartQty > 0 ? 'Go to cart' : 'Buy now'}
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default ProductDetails;

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F7F6' },
    scrollContent: { paddingBottom: 8 },
    discoveryWrap: {
        marginTop: 6,
        marginHorizontal: -4,
        gap: 2,
    },

    galleryWrap: {
        backgroundColor: '#FFFFFF',
        position: 'relative',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#EEF2F0',
    },
    discountOverlay: {
        position: 'absolute',
        left: 0,
        top: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        zIndex: 4,
    },
    discountOverlayText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        letterSpacing: 0.3,
    },
    wishFab: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 4,
    },

    heroCard: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        marginTop: 6,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sectionHeader: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginBottom: 8,
        includeFontPadding: false,
    },
    inCartHint: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: Colors.primaryColor,
        marginBottom: 8,
    },

    detailsHead: {
        marginBottom: 10,
    },
    detailsTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        includeFontPadding: false,
    },
    detailsSub: {
        marginTop: 1,
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    specGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderWidth: 1,
        borderColor: '#EEF2F0',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F8FAF9',
    },
    specCell: {
        width: '50%',
        paddingHorizontal: 10,
        paddingVertical: 9,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#EEF2F0',
    },
    specCellLeft: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: '#EEF2F0',
    },
    specLabel: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        marginBottom: 2,
        includeFontPadding: false,
    },
    specValue: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        lineHeight: 16,
    },
    accordionWrap: {
        marginTop: 8,
    },
    accordionItem: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#EEF2F0',
    },
    accordionItemLast: {
        borderBottomWidth: 0,
    },
    accordionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 8,
    },
    accordionBody: {
        paddingLeft: 36,
        paddingRight: 4,
        paddingBottom: 10,
        fontSize: 12,
        lineHeight: 18,
        color: '#475569',
        fontFamily: Fonts.PoppinsRegular,
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    brandName: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        flexShrink: 1,
    },
    rxBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    rxText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#B45309',
    },
    ratingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#15803D',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 3,
    },
    ratingText: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFF',
        includeFontPadding: false,
    },
    reviewCount: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    productName: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        lineHeight: 22,
        marginBottom: 2,
    },
    packLine: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        marginBottom: 4,
    },
    shortDescription: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsRegular,
        color: '#64748B',
        lineHeight: 17,
        marginBottom: 8,
    },
    description: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsRegular,
        color: '#475569',
        lineHeight: 18,
    },
    readMore: {
        marginTop: 4,
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
    },
    highlightList: { gap: 6 },
    highlightRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    highlightText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 14,
        color: '#334155',
        fontFamily: Fonts.PoppinsRegular,
    },
    aboutBlock: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E2E8F0',
    },
    aPlusBlock: { marginBottom: 10 },
    aPlusImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        marginBottom: 8,
    },
    aPlusTitle: {
        fontSize: 13,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 2,
    },
    aPlusBody: {
        fontSize: 12,
        lineHeight: 18,
        color: '#475569',
        fontFamily: Fonts.PoppinsRegular,
    },

    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    priceLeft: { flex: 1 },
    priceLine: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    sellingPrice: {
        fontSize: 24,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        includeFontPadding: false,
    },
    mrpPrice: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        textDecorationLine: 'line-through',
        includeFontPadding: false,
    },
    discountInline: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#16A34A',
    },
    specialLabel: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#16A34A',
        marginBottom: 1,
        includeFontPadding: false,
    },
    taxNote: {
        marginTop: 2,
        fontSize: 11,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },
    offerStrip: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    offerIcon: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    offerText: {
        flex: 1,
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#15803D',
        includeFontPadding: false,
    },
    hurryStrip: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    hurryText: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#C2410C',
        includeFontPadding: false,
    },
    deliveryRow: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    deliveryIcon: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#EAF8F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deliveryText: {
        flex: 1,
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#475569',
        includeFontPadding: false,
    },
    deliveryStrong: {
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    freeTag: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 5,
    },
    freeTagText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#15803D',
    },
    stockChip: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 5,
        marginTop: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    stockDot: { width: 6, height: 6, borderRadius: 3 },
    stockLabel: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        includeFontPadding: false,
    },

    qtyStepper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: Colors.primaryColor,
        overflow: 'hidden',
        height: 34,
        minWidth: 86,
    },
    qtyStepperDisabled: {
        backgroundColor: '#94A3B8',
    },
    qtyBtn: {
        width: 28,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyValue: {
        minWidth: 22,
        textAlign: 'center',
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
        includeFontPadding: false,
    },

    trustStrip: {
        marginTop: 6,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    trustItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    trustIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#EAF8F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trustText: {
        fontSize: 10,
        color: '#334155',
        fontFamily: Fonts.PoppinsMedium,
        textAlign: 'center',
    },
    trustDivider: {
        width: StyleSheet.hairlineWidth,
        height: 28,
        backgroundColor: '#E2E8F0',
    },

    variantRow: { paddingVertical: 2, gap: 8, paddingRight: 4 },
    variantCard: {
        minWidth: 96,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 10,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    variantCardSelected: {
        backgroundColor: '#F0FBF7',
        borderColor: Colors.primaryColor,
        borderWidth: 1.5,
    },
    bestPill: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#F59E0B',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderBottomRightRadius: 8,
    },
    bestPillText: {
        fontSize: 8,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    variantCheck: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    variantName: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
    },
    variantNameSelected: {
        color: Colors.primaryColor,
    },
    variantDetails: {
        marginTop: 1,
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    variantDetailsSelected: {
        color: '#3D7A6C',
    },
    variantPrice: {
        marginTop: 4,
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    variantPriceSelected: {
        color: Colors.primaryColor,
    },
    variantOff: {
        marginTop: 1,
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#16A34A',
    },
    variantOffSelected: {
        color: '#15803D',
    },

    detailIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#EAF8F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailLinkTitle: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    detailLinkPreview: {
        marginTop: 1,
        fontSize: 11,
        fontFamily: Fonts.PoppinsRegular,
        color: '#94A3B8',
    },

    stickyBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E2E8F0',
        paddingHorizontal: 12,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 10,
    },
    stickyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stickyPriceBox: {
        minWidth: 72,
        marginRight: 2,
    },
    stickyPrice: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        includeFontPadding: false,
    },
    stickySave: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#16A34A',
        includeFontPadding: false,
    },
    stickyHint: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: Colors.primaryColor,
        includeFontPadding: false,
    },
    secondaryBtn: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        borderWidth: 1.4,
        borderColor: Colors.primaryColor,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryBtnText: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
    },
    ctaInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    primaryBtnWrap: {
        flex: 1.15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    primaryBtn: {
        height: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtnDisabled: { backgroundColor: '#6c9180' },
    primaryBtnText: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
    },
    btnDisabled: { opacity: 0.55 },
});