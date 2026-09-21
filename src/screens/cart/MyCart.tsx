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
    Image,
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
import {
    addToCart,
    fetchCart,
    queueCartLineSync,
} from '../../store/slices/cartSlice';
import { getProductData, resolveCartItemImage, SectionType } from '../../common/DataInterface';
import MyProductCard from '../../components/MyProductCard';
import { Colors } from '../../common/Colors';
import { SCREEN_THEME } from '../../constants/screenTheme';
import { MyProductCardSkeleton } from '../../simmerScreen/ShimmerHook';
import TablerIcon from '../../components/TablerIcon';
import { navigateToCheckout } from '../../navigation/productNavigation';
import { showSuccessToast } from '../../config/Key';
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
import { getOrderFeeQuote } from '../../services/OrderService';
import {
    calculateOrderFees,
    feeRateLabel,
    parseFeeQuoteConfig,
    type FeeQuoteConfig,
} from '../../utils/feeQuote';
import CommonModal from '../../components/LogoutModal';
import { isCartLineOutOfStock } from '../../services/CartService';
import {
    getAddQtyBlockMessage,
    getCartInventoryQty,
} from '../../utils/productStockUtils';
import { resolveImageUri } from '../../utils/imageUtils';
import {
    formatPrescriptionDate,
    getStatusLabel,
    isPrescriptionApproved,
    isPrescriptionRejected,
} from '../../services/PrescriptionRequestService';

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

const rxStatusTone = (item: any) => {
    const status = String(item?.status || '').toLowerCase();
    if (isPrescriptionApproved(item)) {
        return { label: 'Approved', color: '#166534', bg: '#DCFCE7' };
    }
    if (isPrescriptionRejected(item)) {
        return { label: 'Rejected', color: '#991B1B', bg: '#FEE2E2' };
    }
    if (status === 'sent') {
        return { label: 'Sent', color: '#0D614E', bg: '#E8F6F2' };
    }
    return {
        label: getStatusLabel(item) || 'Waiting for approval',
        color: '#92400E',
        bg: '#FEF3C7',
    };
};

const groupRxLines = (lines: any[]) => {
    const groups = new Map<string, { meta: any; items: any[] }>();
    lines.forEach((item: any) => {
        const key = String(item?.rx_group_id || item?.id);
        const existing = groups.get(key);
        if (existing) {
            existing.items.push(item);
            return;
        }
        groups.set(key, { meta: item?.rx_group || {}, items: [item] });
    });
    return [...groups.values()];
};

const previewItemsFor = (group: { meta: any; items: any[] }) => {
    const raw = Array.isArray(group.meta?.items) ? group.meta.items : [];
    return raw.length ? raw : group.items;
};

const markCartProductStock = (product: any, sourceItem: any) => {
    const outOfStock =
        isCartLineOutOfStock(sourceItem) ||
        isCartLineOutOfStock(product) ||
        (getCartInventoryQty(sourceItem) != null &&
            Number(getCartInventoryQty(sourceItem)) <= 0);
    return {
        ...product,
        _isOutOfStock: outOfStock,
        variant: product?.variant ?? sourceItem?.variant,
        available_quantity: getCartInventoryQty(sourceItem),
    };
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
        doctorQty: number;
        productName: string;
    } | null>(null);
    const qtyConfirmBusyRef = useRef(false);
    /** Baseline doctor-prescribed qty per prescribed cart line id */
    const doctorQtyByLineRef = useRef<Record<string, number>>({});

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
    const [expandedRxIds, setExpandedRxIds] = useState<Record<string, boolean>>({});

    const sections = useMemo<SectionType[]>(() => {
        const next: SectionType[] = [];

        // Only skip a My Cart line if it is the exact same cart line already
        // listed under a prescription. Same product can exist in both with
        // different ids and quantities.
        const prescribedLineIds = new Set<string>();
        (CartData?.prescription_cart?.items ?? []).forEach((prescription: any) => {
            const lineItems = Array.isArray(prescription?.items)
                ? prescription.items
                : [];
            lineItems.forEach((item: any) => {
                const lineId = String(item?.id ?? '').trim();
                if (lineId) prescribedLineIds.add(lineId);
            });
        });

        if (CartData?.my_cart?.items?.length) {
            const cartItems = CartData.my_cart.items
                .map((item: any) =>
                    markCartProductStock(
                        {
                            ...getProductData(item),
                            source: 'cart' as const,
                        },
                        item,
                    ),
                )
                .filter(isRenderableCartProduct)
                .filter(item => {
                    const id = String(item.id ?? '').trim();
                    return !(id && prescribedLineIds.has(id));
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
            const isUpload =
                String(prescription?.source || '').toLowerCase() === 'upload';
            return lineItems
                .filter((item: any) => item?.id)
                .map((item: any) => {
                    const lineId = String(item.id);
                    const product = getProductData(
                        item,
                        prescription?.doctor_name,
                    );
                    const qtyNow = Math.max(1, Number(item?.quantity) || 1);
                    const prescribedBaseline = Math.max(
                        1,
                        Number(
                            item?.prescribed_quantity ??
                                item?.doctor_quantity ??
                                item?.prescription_quantity ??
                                doctorQtyByLineRef.current[lineId] ??
                                qtyNow,
                        ) || qtyNow,
                    );
                    if (doctorQtyByLineRef.current[lineId] == null) {
                        doctorQtyByLineRef.current[lineId] = prescribedBaseline;
                    }
                    return markCartProductStock(
                        {
                            ...product,
                            id: lineId,
                            cart_item_id: lineId,
                            source: 'prescribed' as const,
                            prescription_source: isUpload ? 'upload' : 'doctor',
                            rx_group_id: String(prescription?.id || lineId),
                            rx_group: prescription,
                            prescription_id: prescription?.prescription_id,
                            prescription_cart_id: prescription?.id,
                            extra_qty: 0,
                            doctor_qty: doctorQtyByLineRef.current[lineId],
                        },
                        item,
                    );
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
            // Auto-select only in-stock items
            const selectableIds = sections.flatMap(section =>
                section.items
                    .filter((it: any) => !it?._isOutOfStock)
                    .map((it: any) => String(it.id)),
            );
            knownItemIdsRef.current = new Set(allItemIds);
            setSelectedItems(selectableIds);
            return;
        }

        // Newly added lines while staying on cart → auto-select them (only if in-stock)
        const selectableAllIds = sections.flatMap(section =>
            section.items
                .filter((it: any) => !it?._isOutOfStock)
                .map((it: any) => String(it.id)),
        );
        const newIds = selectableAllIds.filter(id => !knownItemIdsRef.current.has(id));
        knownItemIdsRef.current = new Set(allItemIds);

        if (newIds.length) {
            setSelectedItems(prev =>
                [...new Set([...prev, ...newIds])].filter(id =>
                    selectableAllIds.includes(id),
                ),
            );
            return;
        }

        // Drop selections for removed / out-of-stock lines
        setSelectedItems(prev =>
            prev.filter(id => selectableAllIds.includes(id)),
        );
    }, [allItemIds, hasCartItems, focusTick, sections]);

    const toggleSectionSelection =
        useCallback(
            (section: SectionType) => {
                const sectionIds = section.items
                    .filter((item: any) => !item?._isOutOfStock)
                    .map(item => String(item.id));

                if (!sectionIds.length) {
                    return;
                }

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

    const toggleItemSelection = useCallback((id: string, outOfStock?: boolean) => {
        if (outOfStock) return;
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

            // Prefer prescribed match first so qty bumps never hit my_cart as qty=0
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
                    const source =
                        sections
                            .flatMap(s => s.items)
                            .find(it => String(it.id) === String(itemId)) ??
                        line;
                    const stockMsg = getAddQtyBlockMessage(
                        source,
                        oldQty + 1,
                        { cartLine: true },
                    );
                    if (stockMsg) {
                        showSuccessToast(stockMsg, 'error');
                        return;
                    }
                    // Ask before bumping — doctor prescribed a fixed qty
                    if (qtyConfirmBusyRef.current || qtyConfirm) {
                        return;
                    }
                    const doctorQty =
                        doctorQtyByLineRef.current[String(itemId)] ??
                        oldQty;
                    const productName = String(
                        sections
                            .flatMap(s => s.items)
                            .find(it => String(it.id) === String(itemId))
                            ?.name ?? 'this medicine',
                    );
                    setQtyConfirm({
                        itemId: String(itemId),
                        variantId: line.variant_id,
                        cartItemId: String(line.cart_item_id ?? itemId),
                        oldQty,
                        nextQty: oldQty + 1,
                        doctorQty,
                        productName,
                    });
                    return;
                }

                if (action === 'minus') {
                    if (oldQty <= 1) {
                        return;
                    }
                    // Direct cart API for prescribed qty change (variant + cart_item_id)
                    void (async () => {
                        try {
                            const result: any = await dispatch(
                                addToCart({
                                    variantId: String(line.variant_id),
                                    quantity: oldQty - 1,
                                    source: 'prescribed',
                                    cartItemId: String(
                                        line.cart_item_id ?? itemId,
                                    ),
                                    skipOptimistic: false,
                                    currentQuantity: oldQty,
                                    prescriptionRequired: false,
                                    suppressAddedToast: true,
                                }),
                            ).unwrap();
                            await dispatch(fetchCart({ force: true, silent: true }));
                            showSuccessToast(
                                result?.message || 'Cart quantity updated',
                                'success',
                            );
                        } catch (error: any) {
                            showSuccessToast(
                                typeof error === 'string'
                                    ? error
                                    : error?.message || 'Unable to update quantity',
                                'error',
                            );
                            await dispatch(fetchCart({ force: true, silent: true }));
                        }
                    })();
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

            if (action === 'plus') {
                const source =
                    sections
                        .flatMap(s => s.items)
                        .find(it => String(it.id) === String(itemId)) ?? line;
                const stockMsg = getAddQtyBlockMessage(source, newQty, {
                    cartLine: true,
                });
                if (stockMsg) {
                    showSuccessToast(stockMsg, 'error');
                    return;
                }
            }

            dispatch(
                queueCartLineSync({
                    variantId: line.variant_id,
                    quantity: newQty,
                    source: line.source,
                    cartItemId: String(line.cart_item_id ?? itemId),
                    currentQuantity: oldQty,
                    prescriptionRequired: rxRequired,
                    suppressAddedToast: true,
                }),
            );
        },
        [findLineInCartData, dispatch, qtyConfirm, sections],
    );

    const confirmPrescribedQtyIncrease = useCallback(async () => {
        if (!qtyConfirm || qtyConfirmBusyRef.current) return;
        qtyConfirmBusyRef.current = true;

        const { itemId, variantId, cartItemId, oldQty, nextQty } = qtyConfirm;
        setQtyConfirm(null);

        try {
            // Re-resolve from live cart so we never send qty=0 / wrong variant
            const live = findLineInCartData(itemId);
            const safeVariantId = String(
                live?.variant_id || variantId || '',
            ).trim();
            const safeCartItemId = String(
                live?.cart_item_id || cartItemId || itemId || '',
            ).trim();
            const safeNextQty = Math.max(
                1,
                Math.floor(Number(live?.quantity ?? oldQty) + 1) || nextQty,
            );

            if (!safeVariantId || !safeCartItemId) {
                showSuccessToast(
                    'Unable to update this item. Please refresh cart.',
                    'error',
                );
                return;
            }

            // Hit add/update cart API immediately (variant_id + quantity + cart_item_id)
            const result: any = await dispatch(
                addToCart({
                    variantId: safeVariantId,
                    quantity: safeNextQty,
                    source: 'prescribed',
                    cartItemId: safeCartItemId,
                    skipOptimistic: false,
                    currentQuantity: Number(live?.quantity ?? oldQty) || oldQty,
                    prescriptionRequired: false,
                    suppressAddedToast: true,
                }),
            ).unwrap();

            await dispatch(fetchCart({ force: true, silent: true }));
            showSuccessToast(
                result?.message || 'Cart quantity updated',
                'success',
            );
        } catch (error: any) {
            const msg =
                typeof error === 'string'
                    ? error
                    : error?.message || 'Unable to update quantity';
            showSuccessToast(msg, 'error');
            await dispatch(fetchCart({ force: true, silent: true }));
        } finally {
            setTimeout(() => {
                qtyConfirmBusyRef.current = false;
            }, 500);
        }
    }, [qtyConfirm, dispatch, findLineInCartData]);

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
                )
                .filter((item: any) => !item?._isOutOfStock);
        }, [sections, selectedItems]);

    const outOfStockItems = useMemo(
        () =>
            sections.flatMap(section =>
                section.items.filter((item: any) => item?._isOutOfStock),
            ),
        [sections],
    );
    const outOfStockCount = outOfStockItems.length;

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

    const cartItemIds = useMemo(
        () =>
            (selectedProducts as any[])
                .map(item =>
                    String(item.cart_item_id || item.id || '').trim(),
                )
                .filter(Boolean),
        [selectedProducts],
    );

    const [feeConfig, setFeeConfig] = useState<FeeQuoteConfig | null>(null);
    const [feeQuoteLoading, setFeeQuoteLoading] = useState(false);

    useEffect(() => {
        if (!cartItemIds.length) {
            setFeeConfig(null);
            setFeeQuoteLoading(false);
            return;
        }
        let active = true;
        setFeeQuoteLoading(true);
        (async () => {
            try {
                const response = await getOrderFeeQuote({
                    cart_item_ids: cartItemIds,
                });
                if (!active) return;
                const quoteData = response?.data ?? response;
                const hasRates = Boolean(
                    quoteData?.configurations?.gst ||
                        quoteData?.configurations?.platform_fee ||
                        quoteData?.configurations?.delivery ||
                        (Array.isArray(quoteData?.items) && quoteData.items.length),
                );
                setFeeConfig(
                    hasRates
                        ? parseFeeQuoteConfig(quoteData, subtotal, {
                              ignoreConsultationFee: true,
                          })
                        : null,
                );
            } catch {
                if (active) setFeeConfig(null);
            } finally {
                if (active) setFeeQuoteLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [cartItemIds, subtotal]);

    const feeBreakdown = useMemo(
        () =>
            calculateOrderFees({
                quote: feeConfig,
                fallbackSubtotal: subtotal,
            }),
        [feeConfig, subtotal],
    );

    const total = feeConfig ? feeBreakdown.total : subtotal;

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

    const visibleSectionItems = useMemo(
        () =>
            (currentSection?.items ?? []).filter(
                (item: any) => !item?._isOutOfStock,
            ),
        [currentSection],
    );

    const prescribedLines = prescribedSection?.items ?? [];

    const doctorRxGroups = useMemo(
        () =>
            groupRxLines(
                prescribedLines.filter(
                    (item: any) => item?.prescription_source === 'doctor',
                ),
            ),
        [prescribedLines],
    );

    const uploadRxGroups = useMemo(
        () =>
            groupRxLines(
                prescribedLines.filter(
                    (item: any) => item?.prescription_source === 'upload',
                ),
            ),
        [prescribedLines],
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

        // Ensure only in-stock items are sent to checkout
        const checkoutProducts = selectedProducts.filter(item => !item?._isOutOfStock);
        if (checkoutProducts.length === 0) {
            showSuccessToast(
                'Out of stock. Remove it and continue with in-stock items.',
                'error',
            );
            return;
        }

        const overStock = checkoutProducts.find((item: any) => {
            const msg = getAddQtyBlockMessage(item, Number(item.quantity) || 0, {
                cartLine: true,
            });
            return Boolean(msg);
        });
        if (overStock) {
            const msg = getAddQtyBlockMessage(
                overStock,
                Number(overStock.quantity) || 0,
                { cartLine: true },
            );
            showSuccessToast(
                msg || 'Some items are out of stock. Please update quantities.',
                'error',
            );
            return;
        }

        const checkoutSubtotal = Math.round(
            checkoutProducts.reduce((sum: number, item: any) => {
                const unitPrice = resolveCartItemSellingPrice(item) || Number(item.price) || 0;
                const qty = Number(item.quantity) || 0;
                return sum + unitPrice * qty;
            }, 0),
        );

        navigateToCheckout(navigation, checkoutProducts, checkoutSubtotal);
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

    const sectionIds = visibleSectionItems.map(item => String(item.id));
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

                        {outOfStockCount > 0 ? (
                            <View style={styles.oosPanel}>
                                <View style={styles.oosPanelHeader}>
                                    <View style={styles.oosPanelIcon}>
                                        <TablerIcon
                                            name="alert-circle"
                                            size={18}
                                            color="#FFFFFF"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.oosPanelTitle}>
                                            {outOfStockCount === 1
                                                ? '1 product is out of stock'
                                                : `${outOfStockCount} products are out of stock`}
                                        </Text>
                                        <Text style={styles.oosPanelSub}>
                                            Increase is disabled. These items are excluded from payment.
                                        </Text>
                                    </View>
                                </View>

                                {outOfStockItems.map((item: any, idx: number) => {
                                    const thumb =
                                        resolveImageUri(item?.image) ||
                                        resolveCartItemImage(item);
                                    const units = Number(item?.quantity) || 1;
                                    const size = String(item?.size || '').trim();
                                    const meta = [
                                        `${units} unit${units === 1 ? '' : 's'}`,
                                        size || null,
                                    ]
                                        .filter(Boolean)
                                        .join(' • ');

                                    return (
                                        <View
                                            key={String(
                                                item.id ?? item.variant_id ?? idx,
                                            )}
                                            style={styles.oosItemRow}
                                        >
                                            {thumb ? (
                                                <Image
                                                    source={{ uri: thumb }}
                                                    style={styles.oosThumb}
                                                />
                                            ) : (
                                                <View
                                                    style={[
                                                        styles.oosThumb,
                                                        styles.oosThumbFallback,
                                                    ]}
                                                >
                                                    <TablerIcon
                                                        name="package"
                                                        size={18}
                                                        color="#CBD5E1"
                                                    />
                                                </View>
                                            )}
                                            <View style={styles.oosItemCopy}>
                                                <Text
                                                    style={styles.oosItemName}
                                                    numberOfLines={2}
                                                >
                                                    {item.name}
                                                    {meta ? `, ${meta}` : ''}
                                                </Text>
                                                <Text style={styles.oosItemHint}>
                                                    Out of stock
                                                </Text>
                                            </View>
                                            {item?.source !== 'prescribed' ? (
                                                <TouchableOpacity
                                                    style={styles.oosRemoveBtn}
                                                    onPress={() =>
                                                        updateQuantity(
                                                            String(item.id),
                                                            'remove',
                                                        )
                                                    }
                                                    hitSlop={{
                                                        top: 8,
                                                        bottom: 8,
                                                        left: 8,
                                                        right: 8,
                                                    }}
                                                >
                                                    <TablerIcon
                                                        name="trash"
                                                        size={14}
                                                        color="#B91C1C"
                                                    />
                                                </TouchableOpacity>
                                            ) : null}
                                        </View>
                                    );
                                })}
                            </View>
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

                        {visibleSectionItems.length ? (
                            <>
                                <View style={styles.selectAllRow}>
                                    <Text style={styles.selectAllText}>
                                        {visibleSectionItems.length} items ·{' '}
                                        {totalItems} selected
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            currentSection &&
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
                                    {(currentSection?.type === 'prescribed'
                                        ? []
                                        : visibleSectionItems
                                    ).map((item, idx) => (
                                        <MyProductCard
                                            key={String(
                                                item.id ??
                                                    item.variant_id ??
                                                    idx,
                                            )}
                                            item={item}
                                            navigation={navigation}
                                            type={
                                                currentSection?.type ?? 'cart'
                                            }
                                            isSelected={selectedItems.includes(
                                                String(item.id),
                                            )}
                                            toggleItemSelection={id =>
                                                toggleItemSelection(
                                                    id,
                                                    Boolean(item?._isOutOfStock),
                                                )
                                            }
                                            updateQuantity={updateQuantity}
                                        />
                                    ))}
                                    {currentSection?.type === 'prescribed'
                                        ? doctorRxGroups.map(group => {
                                              const meta = group.meta || {};
                                              const groupKey = String(
                                                  meta.id || group.items[0]?.rx_group_id,
                                              );
                                              const open = expandedRxIds[groupKey] !== false;
                                              const tone = rxStatusTone(meta);
                                              const groupIds = group.items
                                                  .filter((line: any) => !line?._isOutOfStock)
                                                  .map((line: any) => String(line.id));
                                              const groupSelected =
                                                  groupIds.length > 0 &&
                                                  groupIds.every(id => selectedItems.includes(id));
                                              const itemCount =
                                                  Number(meta.items_count) || group.items.length;
                                              const subtotal =
                                                  meta.subtotal == null || meta.subtotal === ''
                                                      ? null
                                                      : Number(meta.subtotal);
                                              const symptom = String(
                                                  meta.symptom_description || '',
                                              ).trim();
                                              return (
                                                  <View key={groupKey} style={styles.doctorCard}>
                                                      <View style={styles.uploadTop}>
                                                          <TouchableOpacity
                                                              onPress={() => {
                                                                  if (groupSelected) {
                                                                      setSelectedItems(prev =>
                                                                          prev.filter(id => !groupIds.includes(id)),
                                                                      );
                                                                      return;
                                                                  }
                                                                  setSelectedItems(prev => [
                                                                      ...new Set([...prev, ...groupIds]),
                                                                  ]);
                                                              }}
                                                              style={[
                                                                  styles.checkbox,
                                                                  groupSelected && styles.checkboxActive,
                                                              ]}
                                                          >
                                                              {groupSelected ? (
                                                                  <TablerIcon name="check" size={14} color="#FFF" />
                                                              ) : null}
                                                          </TouchableOpacity>
                                                          <View style={{ flex: 1 }}>
                                                              <Text style={styles.doctorKicker}>Doctor prescription</Text>
                                                              <Text style={styles.uploadTitle} numberOfLines={1}>
                                                                  {meta.doctor_name || 'Doctor'}
                                                              </Text>
                                                              <Text style={styles.uploadMeta} numberOfLines={1}>
                                                                  {[
                                                                      meta.patient_name,
                                                                      formatPrescriptionDate(meta.created_at) || null,
                                                                      itemCount
                                                                          ? `${itemCount} item${itemCount === 1 ? '' : 's'}`
                                                                          : null,
                                                                      subtotal != null && Number.isFinite(subtotal)
                                                                          ? formatRupee(subtotal, { decimals: 2 })
                                                                          : null,
                                                                  ]
                                                                      .filter(Boolean)
                                                                      .join(' · ')}
                                                              </Text>
                                                          </View>
                                                          <View style={[styles.uploadStatus, { backgroundColor: tone.bg }]}>
                                                              <Text style={[styles.uploadStatusText, { color: tone.color }]}>
                                                                  {tone.label}
                                                              </Text>
                                                          </View>
                                                      </View>
                                                      {symptom ? (
                                                          <Text style={styles.doctorSymptom} numberOfLines={1}>
                                                              {symptom}
                                                          </Text>
                                                      ) : null}
                                                      {open ? (
                                                          <View style={styles.uploadItemList}>
                                                              {group.items.map((item: any, idx: number) => {
                                                                  const lineId = String(item.id);
                                                                  const outOfStock = Boolean(item?._isOutOfStock);
                                                                  const checked =
                                                                      !outOfStock &&
                                                                      selectedItems.includes(lineId);
                                                                  const thumb =
                                                                      resolveImageUri(item?.image) ||
                                                                      resolveCartItemImage(item);
                                                                  return (
                                                                      <View key={lineId || idx} style={styles.uploadItemRow}>
                                                                          <TouchableOpacity
                                                                              disabled={outOfStock}
                                                                              onPress={() =>
                                                                                  toggleItemSelection(lineId, outOfStock)
                                                                              }
                                                                              style={[
                                                                                  styles.lineCheck,
                                                                                  checked && styles.checkboxActive,
                                                                                  outOfStock && styles.lineCheckDisabled,
                                                                              ]}
                                                                          >
                                                                              {checked ? (
                                                                                  <TablerIcon name="check" size={12} color="#FFF" />
                                                                              ) : null}
                                                                          </TouchableOpacity>
                                                                          {thumb ? (
                                                                              <Image source={{ uri: thumb }} style={styles.uploadThumb} />
                                                                          ) : (
                                                                              <View style={[styles.uploadThumb, styles.uploadThumbFallback]}>
                                                                                  <TablerIcon name="package" size={14} color="#CBD5E1" />
                                                                              </View>
                                                                          )}
                                                                          <View style={{ flex: 1 }}>
                                                                              <Text style={styles.uploadItemName} numberOfLines={1}>
                                                                                  {item.name}
                                                                              </Text>
                                                                              <Text style={styles.uploadItemMeta}>
                                                                                  {outOfStock
                                                                                      ? 'Out of stock'
                                                                                      : `×${item.quantity || 1}`}
                                                                              </Text>
                                                                          </View>
                                                                      </View>
                                                                  );
                                                              })}
                                                          </View>
                                                      ) : (
                                                          <View style={styles.uploadThumbRow}>
                                                              {group.items.slice(0, 5).map((item: any, idx: number) => {
                                                                  const lineId = String(item.id);
                                                                  const outOfStock = Boolean(item?._isOutOfStock);
                                                                  const checked =
                                                                      !outOfStock &&
                                                                      selectedItems.includes(lineId);
                                                                  const thumb =
                                                                      resolveImageUri(item?.image) ||
                                                                      resolveCartItemImage(item);
                                                                  return (
                                                                      <TouchableOpacity
                                                                          key={lineId || idx}
                                                                          disabled={outOfStock}
                                                                          onPress={() =>
                                                                              toggleItemSelection(lineId, outOfStock)
                                                                          }
                                                                          style={styles.uploadThumbWrap}
                                                                      >
                                                                          {thumb ? (
                                                                              <Image source={{ uri: thumb }} style={styles.uploadThumb} />
                                                                          ) : (
                                                                              <View style={[styles.uploadThumb, styles.uploadThumbFallback]}>
                                                                                  <TablerIcon name="package" size={14} color="#CBD5E1" />
                                                                              </View>
                                                                          )}
                                                                          <View
                                                                              style={[
                                                                                  styles.thumbCheck,
                                                                                  checked && styles.checkboxActive,
                                                                                  outOfStock && styles.lineCheckDisabled,
                                                                              ]}
                                                                          >
                                                                              {checked ? (
                                                                                  <TablerIcon name="check" size={9} color="#FFF" />
                                                                              ) : null}
                                                                          </View>
                                                                      </TouchableOpacity>
                                                                  );
                                                              })}
                                                          </View>
                                                      )}
                                                      <View style={styles.uploadActions}>
                                                          <TouchableOpacity
                                                              style={styles.uploadCollapse}
                                                              onPress={() =>
                                                                  setExpandedRxIds(prev => ({
                                                                      ...prev,
                                                                      [groupKey]: prev[groupKey] === false,
                                                                  }))
                                                              }
                                                          >
                                                              <Text style={styles.uploadCollapseText}>
                                                                  {open ? 'Hide items' : 'Items'}
                                                              </Text>
                                                              <TablerIcon
                                                                  name={open ? 'chevron-up' : 'chevron-down'}
                                                                  size={14}
                                                                  color="#64748B"
                                                              />
                                                          </TouchableOpacity>
                                                          <TouchableOpacity
                                                              style={styles.uploadDetails}
                                                              onPress={() =>
                                                                  navigation.navigate('PrescriptionDetail', {
                                                                      appointment_id: meta.appointment_id,
                                                                      prescription_id: meta.prescription_id,
                                                                      PrisData: meta,
                                                                      doctorData: {
                                                                          doctor_name: meta.doctor_name,
                                                                          id: meta.doctor_id,
                                                                          doctor_id: meta.doctor_id,
                                                                      },
                                                                  })
                                                              }
                                                          >
                                                              <Text style={styles.uploadDetailsText}>View details</Text>
                                                              <TablerIcon name="chevron-right" size={14} color={Colors.primaryColor} />
                                                          </TouchableOpacity>
                                                      </View>
                                                  </View>
                                              );
                                          })
                                        : null}
                                    {currentSection?.type === 'prescribed'
                                        ? uploadRxGroups.map(group => {
                                              const meta = group.meta || {};
                                              const groupKey = String(
                                                  meta.id || group.items[0]?.rx_group_id,
                                              );
                                              const open = expandedRxIds[groupKey] !== false;
                                              const tone = rxStatusTone(meta);
                                              const groupIds = group.items
                                                  .filter((line: any) => !line?._isOutOfStock)
                                                  .map((line: any) => String(line.id));
                                              const groupSelected =
                                                  groupIds.length > 0 &&
                                                  groupIds.every(id =>
                                                      selectedItems.includes(id),
                                                  );
                                              const itemCount =
                                                  Number(meta.items_count) || group.items.length;
                                              const subtotal =
                                                  meta.subtotal == null || meta.subtotal === ''
                                                      ? null
                                                      : Number(meta.subtotal);
                                              return (
                                                  <View key={groupKey} style={styles.uploadCard}>
                                                      <View style={styles.uploadTop}>
                                                          <TouchableOpacity
                                                              onPress={() => {
                                                                  if (groupSelected) {
                                                                      setSelectedItems(prev =>
                                                                          prev.filter(id => !groupIds.includes(id)),
                                                                      );
                                                                      return;
                                                                  }
                                                                  setSelectedItems(prev => [
                                                                      ...new Set([...prev, ...groupIds]),
                                                                  ]);
                                                              }}
                                                              style={[
                                                                  styles.checkbox,
                                                                  groupSelected && styles.checkboxActive,
                                                              ]}
                                                          >
                                                              {groupSelected ? (
                                                                  <TablerIcon
                                                                      name="check"
                                                                      size={14}
                                                                      color="#FFF"
                                                                  />
                                                              ) : null}
                                                          </TouchableOpacity>
                                                          <View style={{ flex: 1 }}>
                                                              <Text style={styles.uploadTitle} numberOfLines={1}>
                                                                  Uploaded prescription
                                                              </Text>
                                                              <Text style={styles.uploadMeta} numberOfLines={1}>
                                                                  {[
                                                                      itemCount
                                                                          ? `${itemCount} item${itemCount === 1 ? '' : 's'}`
                                                                          : null,
                                                                      subtotal != null && Number.isFinite(subtotal)
                                                                          ? formatRupee(subtotal, { decimals: 2 })
                                                                          : null,
                                                                  ]
                                                                      .filter(Boolean)
                                                                      .join(' · ')}
                                                              </Text>
                                                          </View>
                                                          <View style={[styles.uploadStatus, { backgroundColor: tone.bg }]}>
                                                              <Text style={[styles.uploadStatusText, { color: tone.color }]}>
                                                                  {tone.label}
                                                              </Text>
                                                          </View>
                                                      </View>
                                                      {open ? (
                                                          <View style={styles.uploadItemList}>
                                                              {group.items.map((item: any, idx: number) => {
                                                                  const lineId = String(item.id);
                                                                  const outOfStock = Boolean(item?._isOutOfStock);
                                                                  const checked =
                                                                      !outOfStock &&
                                                                      selectedItems.includes(lineId);
                                                                  const thumb =
                                                                      resolveImageUri(item?.image) ||
                                                                      resolveCartItemImage(item);
                                                                  return (
                                                                      <View
                                                                          key={lineId || idx}
                                                                          style={styles.uploadItemRow}
                                                                      >
                                                                          <TouchableOpacity
                                                                              disabled={outOfStock}
                                                                              onPress={() =>
                                                                                  toggleItemSelection(lineId, outOfStock)
                                                                              }
                                                                              style={[
                                                                                  styles.lineCheck,
                                                                                  checked && styles.checkboxActive,
                                                                                  outOfStock && styles.lineCheckDisabled,
                                                                              ]}
                                                                          >
                                                                              {checked ? (
                                                                                  <TablerIcon name="check" size={12} color="#FFF" />
                                                                              ) : null}
                                                                          </TouchableOpacity>
                                                                          {thumb ? (
                                                                              <Image
                                                                                  source={{ uri: thumb }}
                                                                                  style={styles.uploadThumb}
                                                                              />
                                                                          ) : (
                                                                              <View style={[styles.uploadThumb, styles.uploadThumbFallback]}>
                                                                                  <TablerIcon name="package" size={14} color="#CBD5E1" />
                                                                              </View>
                                                                          )}
                                                                          <View style={{ flex: 1 }}>
                                                                              <Text style={styles.uploadItemName} numberOfLines={1}>
                                                                                  {item.name}
                                                                              </Text>
                                                                              <Text style={styles.uploadItemMeta} numberOfLines={1}>
                                                                                  {outOfStock
                                                                                      ? 'Out of stock'
                                                                                      : `×${item.quantity || 1}`}
                                                                              </Text>
                                                                          </View>
                                                                          {!outOfStock ? (
                                                                              <Text style={styles.uploadItemPrice}>
                                                                                  {formatRupee(
                                                                                      (resolveCartItemSellingPrice(item) ||
                                                                                          Number(item.price) ||
                                                                                          0) * (Number(item.quantity) || 1),
                                                                                      { decimals: 2 },
                                                                                  )}
                                                                              </Text>
                                                                          ) : null}
                                                                      </View>
                                                                  );
                                                              })}
                                                          </View>
                                                      ) : (
                                                          <View style={styles.uploadThumbRow}>
                                                              {group.items.slice(0, 5).map((item: any, idx: number) => {
                                                                  const lineId = String(item.id);
                                                                  const outOfStock = Boolean(item?._isOutOfStock);
                                                                  const checked =
                                                                      !outOfStock &&
                                                                      selectedItems.includes(lineId);
                                                                  const thumb =
                                                                      resolveImageUri(item?.image) ||
                                                                      resolveCartItemImage(item);
                                                                  const extra =
                                                                      idx === 4 && group.items.length > 5
                                                                          ? group.items.length - 5
                                                                          : 0;
                                                                  return (
                                                                      <TouchableOpacity
                                                                          key={lineId || idx}
                                                                          disabled={outOfStock}
                                                                          onPress={() =>
                                                                              toggleItemSelection(lineId, outOfStock)
                                                                          }
                                                                          style={styles.uploadThumbWrap}
                                                                      >
                                                                          {thumb ? (
                                                                              <Image source={{ uri: thumb }} style={styles.uploadThumb} />
                                                                          ) : (
                                                                              <View style={[styles.uploadThumb, styles.uploadThumbFallback]}>
                                                                                  <TablerIcon name="package" size={14} color="#CBD5E1" />
                                                                              </View>
                                                                          )}
                                                                          <View
                                                                              style={[
                                                                                  styles.thumbCheck,
                                                                                  checked && styles.checkboxActive,
                                                                                  outOfStock && styles.lineCheckDisabled,
                                                                              ]}
                                                                          >
                                                                              {checked ? (
                                                                                  <TablerIcon name="check" size={9} color="#FFF" />
                                                                              ) : null}
                                                                          </View>
                                                                          {extra ? (
                                                                              <View style={styles.uploadMore}>
                                                                                  <Text style={styles.uploadMoreText}>+{extra}</Text>
                                                                              </View>
                                                                          ) : null}
                                                                      </TouchableOpacity>
                                                                  );
                                                              })}
                                                          </View>
                                                      )}
                                                      <View style={styles.uploadActions}>
                                                          <TouchableOpacity
                                                              style={styles.uploadCollapse}
                                                              activeOpacity={0.85}
                                                              onPress={() =>
                                                                  setExpandedRxIds(prev => ({
                                                                      ...prev,
                                                                      [groupKey]: prev[groupKey] === false,
                                                                  }))
                                                              }
                                                          >
                                                              <Text style={styles.uploadCollapseText}>
                                                                  {open ? 'Hide items' : 'Items'}
                                                              </Text>
                                                              <TablerIcon
                                                                  name={open ? 'chevron-up' : 'chevron-down'}
                                                                  size={14}
                                                                  color="#64748B"
                                                              />
                                                          </TouchableOpacity>
                                                          <TouchableOpacity
                                                              style={styles.uploadDetails}
                                                              onPress={() =>
                                                                  navigation.navigate('VerifyPresciption', {
                                                                      requestId:
                                                                          meta.prescription_request_id || meta.id,
                                                                      fileUri: meta.file_url,
                                                                      fileName: meta.file_name || 'prescription',
                                                                      fileType: meta.file_type || 'image',
                                                                      existingRequest: {
                                                                          ...meta,
                                                                          items: previewItemsFor(group),
                                                                      },
                                                                      previewItems: previewItemsFor(group),
                                                                  })
                                                              }
                                                          >
                                                              <Text style={styles.uploadDetailsText}>View details</Text>
                                                              <TablerIcon
                                                                  name="chevron-right"
                                                                  size={14}
                                                                  color={Colors.primaryColor}
                                                              />
                                                          </TouchableOpacity>
                                                      </View>
                                                  </View>
                                              );
                                          })
                                        : null}
                                </View>
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={styles.viewMoreBtn}
                                    onPress={() => navigation.navigate('ProductsScreen')}
                                >
                                    <Text style={styles.viewMoreText}>View more products</Text>
                                    <TablerIcon
                                        name="chevron-right"
                                        size={16}
                                        color={Colors.primaryColor}
                                    />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.tabEmptyWrap}>
                                <Text style={styles.tabEmptyText}>
                                    {outOfStockCount > 0
                                        ? 'In-stock items will appear here'
                                        : 'No items in this list'}
                                </Text>
                            </View>
                        )}

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
                                label="Item total"
                                value={formatRupee(feeConfig ? feeBreakdown.baseAmount : subtotal, {
                                    decimals: feeConfig ? 2 : 0,
                                })}
                            />

                            {showDetails ? (
                                feeQuoteLoading ? (
                                    <Text style={styles.feeNote}>Calculating fees</Text>
                                ) : !feeConfig ? (
                                    <Text style={styles.feeNoteMuted}>
                                        Fee details unavailable
                                    </Text>
                                ) : (
                                    <>
                                        <BillRow
                                            label={
                                                feeBreakdown.freeDelivery &&
                                                feeBreakdown.freeDeliveryMinimum > 0
                                                    ? `Delivery · free above ${formatRupee(
                                                          feeBreakdown.freeDeliveryMinimum,
                                                      )}`
                                                    : 'Delivery'
                                            }
                                            value={
                                                feeBreakdown.freeDelivery
                                                    ? 'FREE'
                                                    : formatRupee(feeBreakdown.shipping, {
                                                          decimals: 2,
                                                      })
                                            }
                                            success={feeBreakdown.freeDelivery}
                                        />
                                        {feeBreakdown.freeDeliveryNote ? (
                                            <Text style={styles.feeNote}>
                                                {feeBreakdown.freeDeliveryNote}
                                            </Text>
                                        ) : null}
                                        {feeBreakdown.platformFee > 0 ? (
                                            <BillRow
                                                label={feeRateLabel(
                                                    'Platform fee',
                                                    feeBreakdown.platformRate,
                                                )}
                                                value={formatRupee(feeBreakdown.platformFee, {
                                                    decimals: 2,
                                                })}
                                            />
                                        ) : null}
                                        {feeBreakdown.gst > 0 ? (
                                            <BillRow
                                                label={feeRateLabel(
                                                    'GST',
                                                    feeBreakdown.gstRate,
                                                )}
                                                value={formatRupee(feeBreakdown.gst, {
                                                    decimals: 2,
                                                })}
                                            />
                                        ) : null}
                                        {feeBreakdown.discount > 0 ? (
                                            <BillRow
                                                label="Discount"
                                                value={`− ${formatRupee(feeBreakdown.discount, {
                                                    decimals: 2,
                                                })}`}
                                                success
                                            />
                                        ) : null}
                                        {feeBreakdown.discount > 0 ? (
                                            <BillRow
                                                label="After coupon"
                                                value={formatRupee(total, { decimals: 2 })}
                                            />
                                        ) : null}
                                    </>
                                )
                            ) : null}

                            <BillRow
                                label="Total"
                                value={formatRupee(total, { decimals: feeConfig ? 2 : 0 })}
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
                                value={total}
                                decimals={feeConfig ? 2 : 0}
                                style={styles.footerTotal}
                            />
                            <Text style={styles.footerHint}>
                                {selectedUnits}{' '}
                                {selectedUnits === 1 ? 'item' : 'items'}
                                {outOfStockCount > 0
                                    ? ` · ${outOfStockCount} out of stock`
                                    : ''}
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
                title="Add extra quantity?"
                subtitle={
                    qtyConfirm
                        ? `Doctor prescribed ${qtyConfirm.doctorQty} ${
                              qtyConfirm.doctorQty === 1 ? 'unit' : 'units'
                          } of ${qtyConfirm.productName}. Are you sure you want to add 1 more to your cart (total ${qtyConfirm.nextQty})?`
                        : ''
                }
                icon="💊"
                cancelText="No"
                confirmText="Yes, add"
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
    success,
}: {
    label: string;
    value: string;
    isTotal?: boolean;
    success?: boolean;
}) => (
    <View style={[styles.billRow, isTotal && styles.billRowTotal]}>
        <Text style={[styles.billLabel, isTotal && styles.billLabelTotal]}>
            {label}
        </Text>
        <Text
            style={[
                styles.billValue,
                isTotal && styles.billValueTotal,
                success && styles.billValueSuccess,
            ]}
        >
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

    outOfStockBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#DC2626',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 11,
        marginBottom: 10,
    },
    outOfStockBannerIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    outOfStockBannerTextWrap: {
        flex: 1,
        minWidth: 0,
    },
    outOfStockBannerTitle: {
        fontSize: 13,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 1,
    },
    outOfStockBannerSub: {
        fontSize: 11,
        lineHeight: 15,
        color: 'rgba(255,255,255,0.88)',
        fontFamily: Fonts.PoppinsRegular,
    },

    oosPanel: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FECACA',
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 8,
        marginBottom: 10,
    },
    oosPanelHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 10,
    },
    oosPanelIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#DC2626',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    oosPanelTitle: {
        fontSize: 14,
        lineHeight: 20,
        color: '#B91C1C',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    oosPanelSub: {
        marginTop: 2,
        fontSize: 11,
        lineHeight: 15,
        color: '#7F1D1D',
        fontFamily: Fonts.PoppinsRegular,
    },
    oosItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#F1F5F9',
    },
    oosThumb: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
    },
    oosThumbFallback: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    oosItemCopy: {
        flex: 1,
        minWidth: 0,
    },
    oosItemName: {
        fontSize: 13,
        lineHeight: 18,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsMedium,
    },
    oosItemHint: {
        marginTop: 2,
        fontSize: 11,
        color: '#B91C1C',
        fontFamily: Fonts.PoppinsMedium,
    },
    oosRemoveBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
    },
    tabEmptyWrap: {
        paddingVertical: 28,
        alignItems: 'center',
    },
    tabEmptyText: {
        fontSize: 13,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
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
    lineCheck: {
        width: 18,
        height: 18,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: '#CAD5D1',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    lineCheckDisabled: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
    },
    thumbCheck: {
        position: 'absolute',
        right: -3,
        bottom: -3,
        width: 14,
        height: 14,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#CAD5D1',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },

    viewMoreBtn: {
        marginTop: 4,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D7E8E3',
        paddingVertical: 12,
    },
    viewMoreText: {
        fontSize: 13,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    doctorCard: {
        backgroundColor: '#F7FBFA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#B7D9D0',
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 8,
    },
    doctorKicker: {
        fontSize: 10,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    doctorSymptom: {
        marginTop: 6,
        fontSize: 11,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
    },
    uploadCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D7E8E3',
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 8,
    },
    uploadTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    uploadTitle: {
        fontSize: 13,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    uploadMeta: {
        marginTop: 1,
        fontSize: 11,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
    },
    uploadStatus: {
        borderRadius: 999,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    uploadStatusText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    uploadThumbRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    uploadThumbWrap: {
        width: 36,
        height: 36,
    },
    uploadThumb: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
    },
    uploadThumbFallback: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadMore: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        borderRadius: 8,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadMoreText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    uploadItemList: {
        marginTop: 6,
        gap: 6,
    },
    uploadItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    uploadItemName: {
        fontSize: 12,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsMedium,
    },
    uploadItemMeta: {
        fontSize: 10,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
    },
    uploadItemPrice: {
        fontSize: 12,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    uploadActions: {
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    uploadCollapse: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    uploadCollapseText: {
        fontSize: 12,
        color: '#475569',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    uploadDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    uploadDetailsText: {
        fontSize: 12,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
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
    billValueSuccess: {
        color: '#15803D',
    },
    feeNote: {
        marginTop: -4,
        marginBottom: 8,
        fontSize: 11,
        lineHeight: 15,
        color: '#15803D',
        fontFamily: Fonts.PoppinsMedium,
    },
    feeNoteMuted: {
        marginTop: -4,
        marginBottom: 8,
        fontSize: 11,
        lineHeight: 15,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
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
