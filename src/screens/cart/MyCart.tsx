import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    TextInput,
    RefreshControl,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from 'react-redux';
import AppHeader from '../../components/AppHeader';
import { Fonts } from '../../common/Fonts';
import { useAllCartData } from '../../hooks/Cart';
import { useAppDispatch } from '../../store/hooks';
import type { RootState } from '../../store/store';
import { queueCartLineSync } from '../../store/slices/cartSlice';
import { getProductData, SectionType } from '../../common/DataInterface';
import MyProductCard from '../../components/MyProductCard';
import { Colors } from '../../common/Colors';
import { SCREEN_THEME } from '../../constants/screenTheme';
import { MyProductCardSkeleton } from '../../simmerScreen/ShimmerHook';
import TablerIcon from '../../components/TablerIcon';
import { navigateToCheckout } from '../../navigation/productNavigation';
import SegmentTabs from '../../components/SegmentTabs';
import { getScreenBottomPadding } from '../../constants/layout';
import {
    canAddProductWithoutPrescription,
    isPrescriptionRequired,
} from '../../utils/prescriptionUtils';
import {
    resolveCartItemSellingPrice,
} from '../../utils/cartPriceUtils';

/** Skip incomplete API rows (no variant / name) so empty shells never render. */
const isRenderableCartProduct = (product: {
    variant_id?: string;
    name?: string;
    quantity?: number;
}) => {
    const variantId = String(product?.variant_id ?? '').trim();
    const name = String(product?.name ?? '').trim();
    const qty = Number(product?.quantity) || 0;
    return Boolean(variantId && name && qty > 0);
};




const MyCart = ({ navigation }: any) => {

    const dispatch = useAppDispatch();
    const store = useStore<RootState>();

    const { CartData, loading, fetchAllData, hasCachedCart } =
        useAllCartData();
    const [refreshing, setRefreshing] = useState(false);
    
    const onRefresh = useCallback(async () => {

        setRefreshing(true);
        try {
            await fetchAllData({ force: true, silent: true });
        } finally {
            setRefreshing(false);
        }
    }, [fetchAllData]);

    const insets = useSafeAreaInsets();
    const [selectedItems, setSelectedItems] =
        useState<string[]>([]);

    const [activeTab, setActiveTab] = useState<'cart' | 'prescribed'>('cart');
    const [showDetails, setShowDetails] =
        useState(false);
    /** On each visit (and when new lines appear), select all — user can uncheck after. */
    const selectAllPendingRef = useRef(true);
    const knownItemIdsRef = useRef<Set<string>>(new Set());
    const didSetInitialTabRef = useRef(false);
    const [focusTick, setFocusTick] = useState(0);

    const sections = useMemo<SectionType[]>(() => {
        const next: SectionType[] = [];

        if (CartData?.my_cart?.items?.length) {
            const cartItems = CartData.my_cart.items
                .map((item: any) => ({
                    ...getProductData(item),
                    source: 'cart' as const,
                }))
                .filter(isRenderableCartProduct);

            if (cartItems.length) {
                next.push({
                    id: 'cart',
                    title: 'My Cart',
                    type: 'cart',
                    items: cartItems,
                });
            }
        }

        // Only line items inside prescription groups that have products
        // API: prescription_cart.items[].items[].id → cart_item_ids
        const prescribedLineItems = (
            CartData?.prescription_cart?.items ?? []
        ).flatMap((prescription: any) => {
            const lineItems = Array.isArray(prescription?.items)
                ? prescription.items
                : [];
            return lineItems
                .filter((item: any) => item?.id)
                .map((item: any) => {
                    const lineId = String(item.id);
                    const product = getProductData(
                        item,
                        prescription?.doctor_name,
                    );

                    return {
                        ...product,
                        id: lineId,
                        cart_item_id: lineId,
                        source: 'prescribed' as const,
                        prescription_id: prescription?.prescription_id,
                        prescription_cart_id: prescription?.id,
                        // Ensure qty / prices stay in sync with cart API patches
                        quantity: Number(item?.quantity ?? product.quantity) || 0,
                        price:
                            resolveCartItemSellingPrice(item) ||
                            Number(product.price) ||
                            0,
                        prescription_required: isPrescriptionRequired(item),
                    };
                })
                .filter(isRenderableCartProduct);
        });

        if (prescribedLineItems.length > 0) {
            next.push({
                id: 'prescribed',
                title: 'Prescribed Medicines',
                type: 'prescribed',
                items: prescribedLineItems,
            });
        }

        return next;
    }, [CartData]);

    const allItemIds = useMemo(
        () =>
            sections.flatMap(section =>
                section.items.map(item => String(item.id)),
            ),
        [sections],
    );

    const cartItemCount = allItemIds.length;
    const hasCartItems = cartItemCount > 0;

    useFocusEffect(
        useCallback(() => {
            selectAllPendingRef.current = true;
            setFocusTick(tick => tick + 1);
            fetchAllData({ force: true, silent: hasCachedCart });
        }, [fetchAllData, hasCachedCart]),
    );

    useEffect(() => {
        if (!hasCartItems) {
            selectAllPendingRef.current = true;
            didSetInitialTabRef.current = false;
            knownItemIdsRef.current = new Set();
            setSelectedItems([]);
            return;
        }

        if (selectAllPendingRef.current) {
            selectAllPendingRef.current = false;
            knownItemIdsRef.current = new Set(allItemIds);
            setSelectedItems(allItemIds);
            return;
        }

        // Newly added lines while staying on cart → auto-select them
        const newIds = allItemIds.filter(
            id => !knownItemIdsRef.current.has(id),
        );
        knownItemIdsRef.current = new Set(allItemIds);

        if (newIds.length) {
            setSelectedItems(prev => [...new Set([...prev, ...newIds])]);
            return;
        }

        // Drop selections for removed lines
        setSelectedItems(prev =>
            prev.filter(id => knownItemIdsRef.current.has(id)),
        );
    }, [allItemIds, hasCartItems, focusTick]);

    const toggleSectionSelection =
        useCallback(
            (section: SectionType) => {
                const sectionIds = section.items.map(item =>
                    String(item.id),
                );

                const isSelected = sectionIds.every(id =>
                    selectedItems.includes(id),
                );

                if (isSelected) {
                    setSelectedItems(prev =>
                        prev.filter(id => !sectionIds.includes(id)),
                    );
                    return;
                }

                setSelectedItems(prev => [
                    ...new Set([...prev, ...sectionIds]),
                ]);
            },
            [selectedItems],
        );

    /* ========================================================= */

    const toggleItemSelection = useCallback((id: string) => {
        const itemId = String(id);
        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(item => item !== itemId);
            }
            return [...prev, itemId];
        });
    }, []);


    const findLineInCartData = useCallback(
        (itemId: string) => {
            const cartData = store.getState().cart.cartData;
            const id = String(itemId);

            const myCartItem = (cartData?.my_cart?.items ?? []).find(
                (item: any) => String(item?.id ?? item?.cart_item_id) === id,
            );
            if (myCartItem) {
                return {
                    variant_id: String(
                        myCartItem.variant_id ??
                            myCartItem.variant?.variant_id ??
                            myCartItem.variant?.id ??
                            '',
                    ),
                    quantity: Number(myCartItem.quantity) || 0,
                    source: 'cart' as const,
                    cart_item_id: id,
                    prescription_required: isPrescriptionRequired(myCartItem),
                };
            }

            for (const prescription of cartData?.prescription_cart?.items ?? []) {
                const prescribedItem = (prescription?.items ?? []).find(
                    (item: any) => String(item?.id) === id,
                );
                if (prescribedItem) {
                    return {
                        variant_id: String(
                            prescribedItem.variant_id ??
                                prescribedItem.variant?.variant_id ??
                                prescribedItem.variant?.id ??
                                '',
                        ),
                        quantity: Number(prescribedItem.quantity) || 0,
                        source: 'prescribed' as const,
                        cart_item_id: id,
                        prescription_required:
                            isPrescriptionRequired(prescribedItem),
                    };
                }
            }

            return null;
        },
        [store],
    );

    const updateQuantity = useCallback(
        (itemId: string, action: 'plus' | 'minus' | 'remove') => {
            const line = findLineInCartData(itemId);
            if (!line?.variant_id) {
                return;
            }

            const rxRequired = isPrescriptionRequired(line);
            const isPrescribed = line.source === 'prescribed';

            /**
             * Prescribed list:
             * - prescription_required true → alert, cannot increase / add / remove
             * - prescription_required false → can increase; cannot remove; floor qty = 1
             * - same cart API as my_cart (variant_id + quantity + cart_item_id)
             */
            if (isPrescribed) {
                if (action === 'remove') {
                    return;
                }

                if (rxRequired) {
                    canAddProductWithoutPrescription(line);
                    return;
                }

                const oldQty = Math.max(1, Number(line.quantity) || 1);

                if (action === 'plus') {
                    dispatch(
                        queueCartLineSync({
                            variantId: line.variant_id,
                            quantity: oldQty + 1,
                            source: 'prescribed',
                            cartItemId: line.cart_item_id,
                            currentQuantity: oldQty,
                            prescriptionRequired: false,
                        }),
                    );
                    return;
                }

                if (action === 'minus') {
                    if (oldQty <= 1) {
                        return;
                    }
                    dispatch(
                        queueCartLineSync({
                            variantId: line.variant_id,
                            quantity: oldQty - 1,
                            source: 'prescribed',
                            cartItemId: line.cart_item_id,
                            currentQuantity: oldQty,
                            prescriptionRequired: false,
                        }),
                    );
                }
                return;
            }

            // Regular my_cart: Rx products cannot increase qty / add more
            if (rxRequired && action === 'plus') {
                canAddProductWithoutPrescription(line);
                return;
            }

            const oldQty = line.quantity;
            const newQty =
                action === 'remove'
                    ? 0
                    : action === 'minus' && oldQty === 1
                    ? 0
                    : action === 'plus'
                        ? oldQty + 1
                        : oldQty - 1;

            dispatch(
                queueCartLineSync({
                    variantId: line.variant_id,
                    quantity: newQty,
                    source: line.source,
                    cartItemId: String(line.cart_item_id ?? itemId),
                    currentQuantity: oldQty,
                    prescriptionRequired: rxRequired,
                }),
            );
        },
        [findLineInCartData, dispatch],
    );

    const selectedProducts =
        useMemo(() => {
            return sections
                .flatMap(
                    section =>
                        section.items,
                )
                .filter(item =>
                    selectedItems.includes(String(item.id)),
                );
        }, [sections, selectedItems]);




    const totalItems =
        selectedProducts.length;

    const deliveryFee = 0;

    const subtotal = useMemo(() => {
        const selected = selectedProducts as any[];

        return Math.round(
            selected.reduce((sum, item) => {
                const unitPrice =
                    resolveCartItemSellingPrice(item) ||
                    Number(item.price) ||
                    0;
                const qty = Number(item.quantity) || 0;
                return sum + unitPrice * qty;
            }, 0),
        );
    }, [selectedProducts]);

    const total = subtotal + deliveryFee;

    const totalSubtotal = subtotal;

    const cartSection = sections.find(item => item.type === 'cart');
    const prescribedSection = sections.find(item => item.type === 'prescribed');
    const cartCount = cartSection?.items.length ?? 0;
    const prescribedCount = prescribedSection?.items.length ?? 0;
    const showTabs = hasCartItems;

    const cartTabs = useMemo(
        () => [
            {
                key: 'cart',
                label: cartCount > 0 ? `My Cart (${cartCount})` : 'My Cart',
            },
            {
                key: 'prescribed',
                label:
                    prescribedCount > 0
                        ? `Prescribed (${prescribedCount})`
                        : 'Prescribed',
            },
        ],
        [cartCount, prescribedCount],
    );

    const currentSection = sections.find(
        item =>
            item.type ===
            (activeTab === 'cart' ? 'cart' : 'prescribed'),
    );

    useEffect(() => {
        if (!hasCartItems) {
            return;
        }

        if (!didSetInitialTabRef.current) {
            didSetInitialTabRef.current = true;
            if (cartCount > 0) {
                setActiveTab('cart');
            } else if (prescribedCount > 0) {
                setActiveTab('prescribed');
            }
            return;
        }

        if (activeTab === 'cart' && !cartCount && prescribedCount) {
            setActiveTab('prescribed');
            return;
        }

        if (activeTab === 'prescribed' && !prescribedCount && cartCount) {
            setActiveTab('cart');
        }
    }, [activeTab, cartCount, prescribedCount, hasCartItems]);

    const handleCheckout = () => {
        if (selectedProducts.length === 0) {
            return;
        }

        navigateToCheckout(navigation, selectedProducts, totalSubtotal);
    };


    // Tab MyCart needs space for bottom bar; stack MyCart (from product flow) does not
    const navState = navigation.getState?.();
    const isTabCart =
        navState?.type === 'tab' ||
        (Array.isArray(navState?.routeNames) &&
            navState.routeNames.includes('Home') &&
            navState.routeNames.includes('Products'));
    const listBottomPad = isTabCart
        ? getScreenBottomPadding(insets)
        : Math.max(insets.bottom, 12) + 24;
    const footerBottomPad = isTabCart
        ? getScreenBottomPadding(insets)
        : Math.max(insets.bottom, 12);

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top', 'left', 'right']}
        >

            <StatusBar
                barStyle={SCREEN_THEME.statusBarStyle}
                backgroundColor={SCREEN_THEME.statusBarBackground}
            />

            <AppHeader
                title="My Cart"
                onLeftPress={() =>
                    navigation.goBack()
                }
                onRefreshPress={onRefresh}
            />

            {/* {!isLoggedIn ? (
                <View style={styles.emptyContainer}>
                    <TablerIcon name="shopping-cart" size={64} color={Colors.primaryColor} />

                    <Text style={styles.emptyTitle}>
                        Login to use your cart
                    </Text>

                    <Text style={styles.emptySubTitle}>
                        Sign in to add products, save items and place orders.
                    </Text>

                    <TouchableOpacity
                        style={styles.shopNowBtn}
                        onPress={() => navigateToLogin()}
                    >
                        <Text style={styles.shopNowText}>
                            Login / Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            ) :  */}
            {loading ? (
                <MyProductCardSkeleton />
            ) : !hasCartItems ? (
                <View style={styles.emptyContainer}>
                    <TablerIcon name="shopping-cart" size={64} color={Colors.primaryColor} />

                    <Text style={styles.emptyTitle}>
                        Your Cart is Empty
                    </Text>

                    <Text style={styles.emptySubTitle}>
                        Looks like you haven't added any products yet.
                    </Text>

                    <TouchableOpacity
                        style={styles.shopNowBtn}
                        onPress={() => navigation.replace('HomeStack', { screen: 'Home' })}
                    >
                        <Text style={styles.shopNowText}>
                            Shop Now
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[Colors.primaryColor]}
                                tintColor={Colors.primaryColor}
                            />
                        }
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: listBottomPad },
                        ]}
                    >

                        {showTabs ? (
                            <SegmentTabs
                                tabs={cartTabs}
                                activeKey={activeTab}
                                onChange={key => {
                                    const nextTab = key as 'cart' | 'prescribed';
                                    if (nextTab === 'cart' && cartCount === 0) {
                                        return;
                                    }
                                    if (nextTab === 'prescribed' && prescribedCount === 0) {
                                        return;
                                    }
                                    setActiveTab(nextTab);
                                }}
                                variant="underline"
                                style={styles.tabContainer}
                            />
                        ) : null}


                        <View style={styles.infoCard}>
                            <Text style={styles.infoTitle}>
                                You have {totalItems} items in your cart
                            </Text>

                            <Text style={styles.infoSubTitle}>
                                Complete your order and enjoy wellness.
                            </Text>
                        </View>

                        {currentSection?.items.length ? (() => {

                            const sectionIds =
                                currentSection.items.map(item =>
                                    String(item.id),
                                );

                            const isSectionSelected =
                                sectionIds.every(id =>
                                    selectedItems.includes(id),
                                );

                            return (

                                <View style={styles.sectionCard}>


                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>
                                            {activeTab === 'cart'
                                                ? `My Cart (${currentSection.items.length})`
                                                : `Prescribed (${currentSection.items.length})`}
                                        </Text>

                                        <TouchableOpacity
                                            onPress={() =>
                                                toggleSectionSelection(
                                                    currentSection,
                                                )
                                            }
                                            style={[
                                                styles.checkbox,
                                                isSectionSelected &&
                                                styles.checkboxActive,
                                            ]}>
                                            {isSectionSelected && (
                                                <TablerIcon name="check" size={15} color={'#FFF'} />
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {currentSection.items.map((item, idx) => (
                                        <MyProductCard
                                            key={String(item.id ?? item.variant_id ?? idx)}
                                            item={item}
                                            navigation={navigation}
                                            type={currentSection.type}
                                            isSelected={selectedItems.includes(
                                                String(item.id),
                                            )}
                                            toggleItemSelection={
                                                toggleItemSelection
                                            }
                                            updateQuantity={
                                                updateQuantity
                                            }
                                        />
                                    ))}
                                </View>
                            );
                        })() : null}



                        {/* <View style={styles.promoCard}>

                            <Text style={styles.promoTitle}>
                                Got a promo code?
                            </Text>

                            <View style={styles.promoInputRow}>

                                <TextInput
                                    placeholder="Enter promo code"
                                    style={styles.promoInput}
                                    placeholderTextColor="#9CA3AF"
                                />

                                <TouchableOpacity
                                    style={styles.applyBtn}>
                                    <Text style={styles.applyText}>
                                        Apply
                                    </Text>
                                </TouchableOpacity>

                            </View>

                        </View> */}

                        <View style={styles.billBox}>

                            <View style={styles.orderHeader}>
                                <Text style={styles.orderTitle}>
                                    ORDER SUMMARY
                                </Text>

                                <TouchableOpacity
                                    onPress={() =>
                                        setShowDetails(!showDetails)
                                    }>
                                    <Text style={styles.viewDetails}>
                                        {showDetails
                                            ? 'Hide Details'
                                            : 'View Details'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {showDetails && (
                                <>
                                    <BillRow
                                        label="Subtotal"
                                          value={`Rs. ${Math.round(subtotal)}`}
                                        // value={`Rs. ${subtotal}`}
                                    />

                                    <BillRow
                                        label="Delivery Fee"
                                        value={`Rs. ${deliveryFee}`}
                                    />

                                    <BillRow
                                        label="Discount"
                                        value="Rs. 0"
                                    />

                                    <View style={styles.divider} />
                                </>
                            )}

                            <BillRow
                                label="Total"
                                value={`Rs. ${Math.round(total)}`}
                                isTotal
                            />
                        </View>


                    </ScrollView>

                    <View
                        style={[
                            styles.checkoutFooter,
                            {
                                paddingBottom: isTabCart
                                    ? footerBottomPad
                                    : Math.max(insets.bottom, 10),
                            },
                        ]}
                    >
                        <TouchableOpacity
                            activeOpacity={0.9}
                            disabled={
                                selectedProducts.length ===
                                0
                            }
                            onPress={handleCheckout}
                            style={[
                                styles.checkoutBtn,
                                selectedProducts.length === 0 && styles.checkoutBtnDisabled,
                            ]}
                        >

                            <Text
                                style={
                                    styles.checkoutText} >
                                Proceed
                            </Text>

                            <View
                                style={{
                                    minWidth: 70,
                                    alignItems: 'flex-end',
                                }}
                            >

                                <Text style={styles.checkoutPrice}>
                                    Rs. {Math.round(total)}
                                </Text>

                            </View>
                        </TouchableOpacity>
                    </View>
                </>
            )}


        </SafeAreaView>
    );
};

export default MyCart;

/* ========================================================= */

const BillRow = ({
    label,
    value,
    isTotal,
}: any) => {

    return (
        <View style={styles.billRow}>

            <Text
                style={[
                    styles.billLabel,

                    isTotal && {
                        fontSize: 18,
                    },
                ]}
            >
                {label}
            </Text>

            <Text
                style={[
                    styles.billValue,

                    isTotal && {
                        fontSize: 20,
                    },
                ]}
            >
                {value}
            </Text>
        </View>
    );
};

/* ========================================================= */

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: SCREEN_THEME.contentPaddingHorizontal,
        // backgroundColor: SCREEN_THEME.screenBackground,
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
    },

    size: {
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 12
    },
    selectAllRow: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },

    selectAllText: {
        fontSize: 16,
        color: '#0F172A',
        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    sectionCard: {
        marginBottom: SCREEN_THEME.sectionGap,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 2,
        paddingVertical: 4,
    },

    sectionTitle: {
        fontSize: 16,
        color: '#1E293B',
        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#CAD5D1',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },

    checkboxActive: {
        backgroundColor: '#0D614E',
        borderColor: '#0D614E',
    },

    innerDot: {
        width: 10,
        height: 10,
        borderRadius: 3,
        backgroundColor: '#FFF',
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    emptyImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        marginBottom: 20,
    },

    emptyTitle: {
        fontSize: 22,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    emptySubTitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
        fontFamily: Fonts.PoppinsRegular,
    },

    shopNowBtn: {
        marginTop: 24,
        backgroundColor: '#0D614E',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },

    shopNowText: {
        color: '#FFF',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    tabContainer: {
        marginTop: 4,
        marginBottom: 12,
    },

    infoCard: {
        backgroundColor: '#ECFDF5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 15,
    },

    infoTitle: {
        color: '#166534',
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    infoSubTitle: {
        color: '#6B7280',
        fontSize: 12,
    },

    image: {
        width: 74,
        height: 74,
        borderRadius: 18,
        backgroundColor: Colors.bgcolor,
        marginLeft: 12,
    },

    name: {
        fontSize: 16,
        color: '#0F172A',
        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    weight: {
        fontSize: 13,
        color: '#64748B',
        fontFamily:
            Fonts.PoppinsMedium,
    },

    price: {
        marginTop: 8,
        fontSize: 18,
        color: '#0D614E',
        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    qtyBox: {
        width: 42,
        height: 110,
        backgroundColor: '#EDF2F1',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent:
            'space-between',
        paddingVertical: 4,
        marginLeft: 10,
    },

    qtyBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    qtyBtnText: {
        fontSize: 20,
        color: '#0D614E',
        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    qtyText: {
        fontSize: 14,
        color: '#0F172A',
        fontFamily:
            Fonts.PoppinsSemiBold,
    },


    prescribedDoctorImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },

    prescribedText: {
        flex: 1,
        fontSize: 11,
        color: '#065F46',
        fontFamily: Fonts.PoppinsMedium,
    },

    prescribedDoctorName: {
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#047857',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: SCREEN_THEME.screenBackground,
    },

    loaderCard: {

        paddingVertical: 30,
        paddingHorizontal: 40,
        borderRadius: 20,
        alignItems: 'center',


    },

    loadingTitle: {
        marginTop: 16,
        fontSize: 18,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    loadingSubTitle: {
        marginTop: 6,
        fontSize: 13,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
    },

    promoCard: {
        backgroundColor: '#FFF',
        borderRadius: 18,
        padding: 16,
        marginBottom: 15,
    },

    promoTitle: {
        fontSize: 18,
        color: '#111827',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 12,
    },

    promoInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    promoInput: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginRight: 10,
    },

    applyBtn: {
        height: 48,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#0D614E',
        justifyContent: 'center',
        alignItems: 'center',
    },

    applyText: {
        color: '#FFF',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },

    orderTitle: {
        fontSize: 13,
        color: '#6B7280',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    viewDetails: {
        fontSize: 13,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    billBox: {
        backgroundColor: '#FFF',
        borderRadius: 22,
        padding: 18,
    },

    billRow: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },

    billLabel: {
        fontSize: 14,
        color: '#64748B',
        fontFamily:
            Fonts.PoppinsMedium,
    },

    billValue: {
        fontSize: 15,
        color: '#0F172A',
        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 12,
    },

    checkoutFooter: {
        paddingTop: 12,
        backgroundColor: SCREEN_THEME.screenBackground,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },

    checkoutBtn: {
        height: 62,
        borderRadius: 18,
        backgroundColor: '#0D614E',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    checkoutBtnDisabled: {
        opacity: 0.5,
    },

    checkoutText: {
        fontSize: 16,
        color: '#FFF',
        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    checkoutPrice: {
        fontSize: 18,
        color: '#FFF',
        fontFamily:
            Fonts.PoppinsSemiBold,
    },
});