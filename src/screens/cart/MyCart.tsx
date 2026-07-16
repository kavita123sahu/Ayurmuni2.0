import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
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
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { useAllCartData } from '../../hooks/Cart';
import { useAppDispatch } from '../../store/hooks';
import { addToCart, fetchCart, setVariantQuantity } from '../../store/slices/cartSlice';
import { getProductData, ProductItem, SectionType } from '../../common/DataInterface';
import MyProductCard from '../../components/MyProductCard';
import { Colors } from '../../common/Colors';
import { MyProductCardSkeleton } from '../../simmerScreen/ShimmerHook';
import TablerIcon from '../../components/TablerIcon';
import { navigateToLogin } from '../../services/guestAuth';
import { useAuth } from '../../hooks/useAuth';




const MyCart = ({ navigation }: any) => {

    const { isLoggedIn } = useAuth();
    const dispatch = useAppDispatch();

    const { CartData, loading, fetchAllData } =
        useAllCartData();

    useFocusEffect(
        useCallback(() => {
            if (isLoggedIn) {
                fetchAllData(true);
            }
        }, [fetchAllData, isLoggedIn]),
    );

    const insets = useSafeAreaInsets();
    const [sections, setSections] =
        useState<SectionType[]>([]);

    const [selectedItems, setSelectedItems] =
        useState<string[]>([]);

    const [activeTab, setActiveTab] = useState<'cart' | 'prescribed'>('cart');
    const [showDetails, setShowDetails] =
        useState(false);
    console.log('CartDataCartData', CartData);

    const mappedSections = useMemo<SectionType[]>(() => {
        const sections: SectionType[] = [];

        if (CartData?.my_cart?.items?.length) {
            sections.push({
                id: 'cart',
                title: 'My Cart',
                type: 'cart',
                items: CartData.my_cart.items.map((item: any) => getProductData(item)),
            });
        }

        if (CartData?.prescription_cart?.items?.length) {
            sections.push({
                id: 'prescribed',
                title: 'Prescribed Medicines',
                type: 'prescribed',
                items: CartData.prescription_cart.items.flatMap(
                    (prescription: any) =>
                        prescription.items.map((item: any) =>
                            getProductData(
                                item,
                                prescription.doctor_name,
                            ),
                        ),
                ),
            });
        }

        return sections;
    }, [CartData]);


    useEffect(() => {

        setSections(mappedSections);
    }, [mappedSections]);

    useEffect(() => {
        if (
            sections.length &&
            selectedItems.length === 0
        ) {
            setSelectedItems(
                sections.flatMap(section =>
                    section.items.map(
                        item => item.id,
                    ),
                ),
            );
        }
    }, [sections]);

    const toggleSectionSelection =
        useCallback(
            (section: SectionType) => {

                const sectionIds =
                    section.items.map(
                        item => item.id,
                    );

                const isSelected =
                    sectionIds.every(id =>
                        selectedItems.includes(id),
                    );

                if (isSelected) {

                    setSelectedItems(prev =>
                        prev.filter(
                            id =>
                                !sectionIds.includes(id),
                        ),
                    );

                    return;
                }

                setSelectedItems(prev => [
                    ...new Set([
                        ...prev,
                        ...sectionIds,
                    ]),
                ]);
            },
            [selectedItems],
        );

    /* ========================================================= */

    const toggleItemSelection =
        useCallback((id: string) => {

            setSelectedItems(prev => {

                if (prev.includes(id)) {

                    return prev.filter(
                        item => item !== id,
                    );
                }

                return [...prev, id];
            });

        }, []);


    const updateQuantity = useCallback(
        async (
            variantId: string,
            action: 'plus' | 'minus',
        ) => {
            const selectedItem = sections
                .flatMap(s => s.items)
                .find(i => i.variant_id === variantId);

            if (!selectedItem) return;

            const oldQty = selectedItem.quantity;
            const newQty =
                action === 'minus' && oldQty === 1
                    ? 0
                    : action === 'plus'
                        ? oldQty + 1
                        : oldQty - 1;

            if (newQty === 0) {
                setSections(prev =>
                    prev.map(section => ({
                        ...section,
                        items: section.items.filter(
                            item => item.variant_id !== variantId,
                        ),
                    })),
                );
            } else {
                setSections(prev =>
                    prev.map(section => ({
                        ...section,
                        items: section.items.map(item =>
                            item.variant_id === variantId
                                ? { ...item, quantity: newQty }
                                : item,
                        ),
                    })),
                );
            }

            dispatch(setVariantQuantity({ variantId, quantity: newQty }));

            const result = await dispatch(
                addToCart({ variantId, quantity: newQty }),
            );

            if (addToCart.rejected.match(result)) {
                await dispatch(fetchCart(true));
                fetchAllData();
            }
        },
        [sections, dispatch, fetchAllData],
    );

    const selectedProducts =
        useMemo(() => {
            return sections
                .flatMap(
                    section =>
                        section.items,
                )
                .filter(item =>
                    selectedItems.includes(
                        item.id,
                    ),
                );
        }, [sections, selectedItems]);




    const totalItems =
        selectedProducts.length;

    const deliveryFee = 0;

    const subtotal = useMemo(() => {
        return Number(
            selectedProducts
                .reduce(
                    (sum, item) =>
                        sum +
                        item.price * item.quantity,
                    0,
                )
                .toFixed(2),
        );
    }, [selectedProducts]);

    const total = Number(
        (subtotal + deliveryFee).toFixed(2),
    );

    const totalSubtotal =
        Math.round(Number(CartData?.my_cart?.subtotal || 0) +
            Number(CartData?.prescription_cart?.subtotal || 0));

    const currentSection = sections.find(
        item =>
            item.type ===
            (activeTab === 'cart'
                ? 'cart'
                : 'prescribed'),
    );

    const handleCheckout = () => {

        console.log("selctedproduct", selectedProducts);

        if (selectedProducts.length === 0) {
            return;
        }

        navigation.navigate(
            'Checkout',
            {
                selectedProducts,
                totalSubtotal
            },
        );
    };


    return (
        <SafeAreaView
            style={styles.container}
        >

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />

            <AppHeader
                title="My Cart"
                onLeftPress={() =>
                    navigation.goBack()
                }
            />

            {!isLoggedIn ? (
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
            ) : loading ? (
                <MyProductCardSkeleton />
            ) : sections.length === 0 ? (
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
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.shopNowText}>
                            Shop Now
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    (
                    <ScrollView
                        showsVerticalScrollIndicator={
                            false
                        }
                        contentContainerStyle={{
                            paddingBottom: 180,
                            // paddingHorizontal: 20,
                        }}
                    >

                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={styles.tabBtn}
                                onPress={() => setActiveTab('cart')}>
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === 'cart' &&
                                        styles.activeTabText,
                                    ]}>
                                    My Cart
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.tabBtn}
                                onPress={() =>
                                    setActiveTab('prescribed')
                                }>
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === 'prescribed' &&
                                        styles.activeTabText,
                                    ]}>
                                    Prescribed
                                </Text>
                            </TouchableOpacity>
                        </View>


                        <View style={styles.infoCard}>
                            <Text style={styles.infoTitle}>
                                You have {totalItems} items in your cart
                            </Text>

                            <Text style={styles.infoSubTitle}>
                                Complete your order and enjoy wellness.
                            </Text>
                        </View>

                        {currentSection && (() => {

                            const sectionIds =
                                currentSection.items.map(
                                    item => item.id,
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

                                    {currentSection.items.map(item => (
                                        <MyProductCard
                                            key={item.id}
                                            item={item}
                                            navigation={navigation}
                                            type={currentSection.type}
                                            isSelected={selectedItems.includes(
                                                item.id,
                                            )}
                                            toggleItemSelection={
                                                toggleItemSelection
                                            }
                                            updateQuantity={
                                                updateQuantity
                                            }
                                            styles={styles}
                                        />
                                    ))}
                                </View>
                            );
                        })()}



                        <View style={styles.promoCard}>

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

                        </View>
                        {/* BILL */}

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
                                        value={`Rs. ${subtotal}`}
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

                    <TouchableOpacity
                        activeOpacity={0.9}
                        disabled={
                            selectedProducts.length ===
                            0
                        }
                        onPress={handleCheckout}
                        style={[
                            styles.checkoutBtn,
                            {
                                bottom: insets.bottom > 0
                                    ? insets.bottom : 10,
                            },
                        ]}
                    >

                        <Text
                            style={
                                styles.checkoutText} >
                            Proceed To Checkout
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
                    )
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

        paddingHorizontal: 20,
        backgroundColor: '#F8FAF8',
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
        // backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },

    sectionTitle: {
        fontSize: 20,
        color: '#1E293B',
        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    productCard: {
        // flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 10,
        marginBottom: 10,
    },

    productTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    prescribedWrapper: {
        marginTop: 14,
        paddingTop: 12,

        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',

        flexDirection: 'row',
        alignItems: 'center',
    },
    leftWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
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
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 20,
    },

    tabBtn: {
        flex: 1,
        alignItems: 'center',
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#E5E7EB',
    },

    tabText: {
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },

    activeTabText: {
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
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
        backgroundColor: '#F8FAF8',
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

    checkoutBtn: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 20,
        height: 62,
        borderRadius: 18,
        backgroundColor: '#0D614E',
        flexDirection: 'row',
        justifyContent:
            'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
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