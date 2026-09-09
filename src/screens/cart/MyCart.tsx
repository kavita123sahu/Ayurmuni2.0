import React, {
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
    ScrollView,
    StatusBar,
    RefreshControl,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
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
import { formatRupee, RupeeAmount } from '../../utils/currencyUtils';
import CommonModal from '../../components/LogoutModal';

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
    const [qtyConfirm, setQtyConfirm] = useState<{
        itemId: string;
        variantId: string;
        cartItemId: string;
        oldQty: number;
        nextQty: number;
    } | null>(null);
    const qtyConfirmBusyRef = useRef(false);

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

        // Variant / line ids already shown under Prescribed — never duplicate in My Cart
        const prescribedVariantIds = new Set<string>();
        const prescribedLineIds = new Set<string>();
        (CartData?.prescription_cart?.items ?? []).forEach((prescription: any) => {
            const lineItems = Array.isArray(prescription?.items)
                ? prescription.items
                : [];
            lineItems.forEach((item: any) => {
                const lineId = String(item?.id ?? '').trim();
                if (lineId) prescribedLineIds.add(lineId);
                const variantId = String(
                    item?.variant_id ??
                        item?.variant?.variant_id ??
                        item?.variant?.id ??
                        '',
                ).trim();
                if (variantId) prescribedVariantIds.add(variantId);
            });
        });

        if (CartData?.my_cart?.items?.length) {
            const cartItems = CartData.my_cart.items
                .map((item: any) => ({
                    ...getProductData(item),
                    source: 'cart' as const,
                }))
                .filter(isRenderableCartProduct)
                .filter(item => {
                    const id = String(item.id ?? '').trim();
                    const variantId = String(item.variant_id ?? '').trim();
                    // Qty bumps on prescribed lines must not surface a second card here
                    if (id && prescribedLineIds.has(id)) return false;
                    if (variantId && prescribedVariantIds.has(variantId)) {
                        return false;
                    }
                    return true;
                });

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
                        extra_qty: 0,
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
            // Use cache when available — only force on pull-to-refresh
            fetchAllData({
                force: !hasCachedCart,
                silent: true,
            });
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
             * - prescription_required false → confirm then +1 only (never double)
             * - never remove prescribed line (qty 0)
             */
            if (isPrescribed) {
                if (action === 'remove') {
                    return;
                }

                if (rxRequired) {
                    canAddProductWithoutPrescription(line);
                    return;
                }

                const oldQty = Math.max(0, Number(line.quantity) || 0);

                if (action === 'plus') {
                    // Ask before bumping — prevents accidental / double adds
                    if (qtyConfirmBusyRef.current || qtyConfirm) {
                        return;
                    }
                    setQtyConfirm({
                        itemId: String(itemId),
                        variantId: line.variant_id,
                        cartItemId: String(line.cart_item_id ?? itemId),
                        oldQty,
                        nextQty: oldQty + 1,
                    });
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

            const oldQty = Math.max(0, Number(line.quantity) || 0);
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
        [findLineInCartData, dispatch, qtyConfirm],
    );

    const confirmPrescribedQtyIncrease = useCallback(() => {
        if (!qtyConfirm || qtyConfirmBusyRef.current) return;
        qtyConfirmBusyRef.current = true;

        const { variantId, cartItemId, oldQty, nextQty } = qtyConfirm;
        // Absolute SET to oldQty + 1 only — never oldQty + oldQty
        dispatch(
            queueCartLineSync({
                variantId,
                quantity: nextQty,
                source: 'prescribed',
                cartItemId,
                currentQuantity: oldQty,
                prescriptionRequired: false,
            }),
        );

        setQtyConfirm(null);
        setTimeout(() => {
            qtyConfirmBusyRef.current = false;
        }, 500);
    }, [qtyConfirm, dispatch]);

    const cancelPrescribedQtyIncrease = useCallback(() => {
        setQtyConfirm(null);
        qtyConfirmBusyRef.current = false;
    }, []);

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

    const selectedUnits = useMemo(
        () =>
            selectedProducts.reduce(
                (sum, item) => sum + (Number(item.quantity) || 0),
                0,
            ),
        [selectedProducts],
    );

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

    const sectionIds = currentSection?.items.map(item => String(item.id)) ?? [];
    const isSectionSelected =
        sectionIds.length > 0 &&
        sectionIds.every(id => selectedItems.includes(id));
    const canCheckout = selectedProducts.length > 0;

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
                onLeftPress={() => navigation.goBack()}
                onRefreshPress={onRefresh}
            />

            {loading ? (
                <View style={styles.skeletonWrap}>
                    <MyProductCardSkeleton />
                </View>
            ) : !hasCartItems ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <TablerIcon
                            name="shopping-cart"
                            size={36}
                            color={Colors.primaryColor}
                        />
                    </View>

                    <Text style={styles.emptyTitle}>Your cart is empty</Text>

                    <Text style={styles.emptySubTitle}>
                        Add products from the store to start your wellness order.
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.shopNowBtn}
                        onPress={() =>
                            navigation.replace('ProductsScreen', {
                                screen: 'Home',
                            })
                        }
                    >
                        <Text style={styles.shopNowText}>Shop Now</Text>
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
                            { paddingBottom: listBottomPad + 88 },
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
                                    if (
                                        nextTab === 'prescribed' &&
                                        prescribedCount === 0
                                    ) {
                                        return;
                                    }
                                    setActiveTab(nextTab);
                                }}
                                variant="pill"
                                style={styles.tabContainer}
                            />
                        ) : null}

                        <View style={styles.trustStrip}>
                            <View style={styles.trustItem}>
                                <View
                                    style={[
                                        styles.trustIcon,
                                        { backgroundColor: '#E0F2FE' },
                                    ]}
                                >
                                    <TablerIcon
                                        name="lock"
                                        size={14}
                                        color="#0369A1"
                                    />
                                </View>
                                <Text style={styles.trustText}>Secure pay</Text>
                            </View>
                            <View style={styles.trustDivider} />
                            <View style={styles.trustItem}>
                                <View
                                    style={[
                                        styles.trustIcon,
                                        { backgroundColor: '#EAF8F4' },
                                    ]}
                                >
                                    <TablerIcon
                                        name="leaf"
                                        size={14}
                                        color={Colors.primaryColor}
                                    />
                                </View>
                                <Text style={styles.trustText}>
                                    Genuine products
                                </Text>
                            </View>
                            <View style={styles.trustDivider} />
                            <View style={styles.trustItem}>
                                <View
                                    style={[
                                        styles.trustIcon,
                                        { backgroundColor: '#FEF3C7' },
                                    ]}
                                >
                                    <TablerIcon
                                        name="message"
                                        size={14}
                                        color="#B45309"
                                    />
                                </View>
                                <Text style={styles.trustText}>Easy support</Text>
                            </View>
                        </View>

                        {currentSection?.items.length ? (
                            <>
                                <View style={styles.selectAllRow}>
                                    <Text style={styles.selectAllText}>
                                        {currentSection.items.length} items ·{' '}
                                        {totalItems} selected
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            toggleSectionSelection(currentSection)
                                        }
                                        style={[
                                            styles.checkbox,
                                            isSectionSelected &&
                                                styles.checkboxActive,
                                        ]}
                                    >
                                        {isSectionSelected ? (
                                            <TablerIcon
                                                name="check"
                                                size={14}
                                                color="#FFF"
                                            />
                                        ) : null}
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.productsWrap}>
                                    {currentSection.items.map((item, idx) => (
                                        <MyProductCard
                                            key={String(
                                                item.id ??
                                                    item.variant_id ??
                                                    idx,
                                            )}
                                            item={item}
                                            navigation={navigation}
                                            type={currentSection.type}
                                            isSelected={selectedItems.includes(
                                                String(item.id),
                                            )}
                                            toggleItemSelection={
                                                toggleItemSelection
                                            }
                                            updateQuantity={updateQuantity}
                                        />
                                    ))}
                                </View>
                            </>
                        ) : null}

                        <View style={styles.billBox}>
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderTitle}>
                                    Order summary
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowDetails(!showDetails)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Text style={styles.viewDetails}>
                                        {showDetails
                                            ? 'Hide details'
                                            : 'View details'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <BillRow
                                label="Subtotal"
                                value={formatRupee(Math.round(subtotal))}
                            />

                            {showDetails ? (
                                <>
                                    <BillRow
                                        label="Delivery Fee"
                                        value={formatRupee(deliveryFee)}
                                    />
                                    <BillRow
                                        label="Discount"
                                        value={formatRupee(0)}
                                    />
                                    <View style={styles.divider} />
                                </>
                            ) : null}

                            <BillRow
                                label="Total"
                                value={formatRupee(Math.round(total))}
                                isTotal
                            />
                        </View>
                    </ScrollView>

                    <View
                        style={[
                            styles.checkoutFooter,
                            { paddingBottom: footerBottomPad },
                        ]}
                    >
                        <View style={styles.footerPriceBox}>
                            <RupeeAmount
                                value={Math.round(total)}
                                style={styles.footerTotal}
                            />
                            <Text style={styles.footerHint}>
                                {selectedUnits}{' '}
                                {selectedUnits === 1 ? 'item' : 'items'}
                            </Text>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            disabled={!canCheckout}
                            onPress={handleCheckout}
                            style={[
                                styles.checkoutBtnWrap,
                                !canCheckout && styles.checkoutBtnDisabled,
                            ]}
                        >
                            <LinearGradient
                                colors={
                                    canCheckout
                                        ? ['#0D614E', '#14937A']
                                        : ['#94A3B8', '#94A3B8']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.checkoutBtn}
                            >
                                <Text style={styles.checkoutText}>Checkout</Text>
                                <TablerIcon
                                    name="chevron-right"
                                    size={18}
                                    color="#FFF"
                                />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            <CommonModal
                visible={Boolean(qtyConfirm)}
                title="Update quantity?"
                subtitle={
                    qtyConfirm
                        ? `1 more item will be added to your cart (total ${qtyConfirm.nextQty}). Continue?`
                        : ''
                }
                icon="🛒"
                cancelText="No"
                confirmText="Yes"
                onClose={cancelPrescribedQtyIncrease}
                onConfirm={confirmPrescribedQtyIncrease}
            />
        </SafeAreaView>
    );
};

export default MyCart;

/* ========================================================= */

const BillRow = ({
    label,
    value,
    isTotal,
}: {
    label: string;
    value: string;
    isTotal?: boolean;
}) => (
    <View style={[styles.billRow, isTotal && styles.billRowTotal]}>
        <Text style={[styles.billLabel, isTotal && styles.billLabelTotal]}>
            {label}
        </Text>
        <Text style={[styles.billValue, isTotal && styles.billValueTotal]}>
            {value}
        </Text>
    </View>
);

/* ========================================================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F7F6',
    },

    skeletonWrap: {
        flex: 1,
    },

    scrollView: {
        flex: 1,
        paddingHorizontal: 12,
    },

    scrollContent: {
        flexGrow: 1,
        paddingTop: 4,
    },

    tabContainer: {
        marginTop: 4,
        marginBottom: 10,
    },

    trustStrip: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 6,
        marginBottom: 10,
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

    selectAllRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 2,
    },
    selectAllText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: '#CAD5D1',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    checkboxActive: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },

    productsWrap: {
        marginBottom: 8,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyIconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#EAF8F4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        textAlign: 'center',
    },
    emptySubTitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 18,
        fontFamily: Fonts.PoppinsRegular,
    },
    shopNowBtn: {
        marginTop: 20,
        backgroundColor: Colors.primaryColor,
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 12,
    },
    shopNowText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    orderTitle: {
        fontSize: 13,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    viewDetails: {
        fontSize: 12,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    billBox: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    billRowTotal: {
        marginBottom: 0,
        marginTop: 2,
        paddingTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E2E8F0',
    },
    billLabel: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },
    billLabelTotal: {
        fontSize: 14,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    billValue: {
        fontSize: 13,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    billValueTotal: {
        fontSize: 16,
        color: Colors.primaryColor,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E2E8F0',
        marginVertical: 6,
    },

    checkoutFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 10,
        paddingHorizontal: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 10,
    },
    footerPriceBox: {
        minWidth: 72,
        flexShrink: 0,
    },
    footerTotal: {
        fontSize: 16,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        includeFontPadding: false,
    },
    footerHint: {
        marginTop: 1,
        fontSize: 11,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
        includeFontPadding: false,
    },
    checkoutBtnWrap: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    checkoutBtnDisabled: {
        opacity: 0.55,
    },
    checkoutBtn: {
        height: 48,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
    },
    checkoutText: {
        fontSize: 15,
        color: '#FFF',
        fontFamily: Fonts.PoppinsSemiBold,
    },
});
