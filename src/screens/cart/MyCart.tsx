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
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../../components/AppHeader';

import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import * as _CART_SERVICES from '../../services/CartService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAllCartData } from '../../hooks/Cart';
import { getProductData, MyCartData, ProductItem, SectionType } from '../../common/DataInterface';
import MyProductCard from '../../components/MyProductCard';
import { Colors } from '../../common/Colors';
import { MyProductCardSkeleton } from '../../simmerScreen/ShimmerHook';




const MyCart = ({ navigation }: any) => {

    const { CartData, loading } =
        useAllCartData();

    const insets = useSafeAreaInsets();
    const [sections, setSections] =
        useState<SectionType[]>([]);

    const [selectedItems, setSelectedItems] =
        useState<string[]>([]);

    console.log('CartDataCartData', CartData);

    const mappedSections = useMemo<SectionType[]>(() => {
        const sections: SectionType[] = [];

        if (CartData?.my_cart?.items?.length) {
            sections.push({
                id: 'cart',
                title: 'My Cart',
                type: 'cart',
                items: CartData.my_cart.items.map(getProductData),
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

            let newQty = 1;
            let oldQty = 1;

            const selectedItem = sections
                .flatMap(s => s.items)
                .find(i => i.variant_id === variantId);

            if (!selectedItem) return;

            oldQty = selectedItem.quantity;

            // Remove item if qty is 1 and user presses minus
            if (
                action === 'minus' &&
                selectedItem.quantity === 1
            ) {
                setSections(prev =>
                    prev.map(section => ({
                        ...section,
                        items: section.items.filter(
                            item => item.variant_id !== variantId,
                        ),
                    })),
                );

                try {
                    await _CART_SERVICES.AddupdateCart({
                        variant_id: variantId,
                        quantity: 0,
                    });
                } catch (error) {
                    fetchCartData(); // reload cart
                }

                return;
            }

            newQty =
                action === 'plus'
                    ? oldQty + 1
                    : oldQty - 1;

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

            try {
                await _CART_SERVICES.AddupdateCart({
                    variant_id: variantId,
                    quantity: newQty,
                });
            } catch (error) {
                fetchCartData();
            }
        },
        [sections],
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


    const laodingCart = () => {
        return (
            <SafeAreaView style={styles.loaderContainer}>
                <View style={styles.loaderCard}>
                    <ActivityIndicator
                        size="large"
                        color={Colors.primaryColor}
                    />

                    <Text style={styles.loadingTitle}>
                        Loading Cart
                    </Text>

                    <Text style={styles.loadingSubTitle}>
                        Please wait a moment...
                    </Text>
                </View>
            </SafeAreaView>
        )
    }


    return (
        <SafeAreaView
            style={styles.container}
        >

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#F8FAF8"
            />

            <AppHeader
                title="My Cart"
                leftIcon={
                    Images.backIcon
                }
                onLeftPress={() =>
                    navigation.goBack()
                }
            />

            {loading ? (
                <MyProductCardSkeleton />
            ) : sections.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Image
                        source={Images.shopCart} // ya koi cart icon
                        style={styles.emptyImage}
                    />

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
                            paddingHorizontal: 20,
                        }}
                    >

                        {
                            sections.map(
                                section => {

                                    const sectionIds =
                                        section.items.map(
                                            item =>
                                                item.id,
                                        );

                                    const isSectionSelected =
                                        sectionIds.every(
                                            id =>
                                                selectedItems.includes(
                                                    id,
                                                ),
                                        );

                                    return (
                                        <View
                                            key={
                                                section.id
                                            }
                                            style={
                                                styles.sectionCard
                                            }
                                        >

                                            {/* HEADER */}

                                            <View
                                                style={
                                                    styles.sectionHeader
                                                }
                                            >

                                                <Text
                                                    style={
                                                        styles.sectionTitle
                                                    }
                                                >
                                                    {
                                                        section.title
                                                    }
                                                </Text>

                                                <TouchableOpacity
                                                    onPress={() =>
                                                        toggleSectionSelection(
                                                            section,
                                                        )
                                                    }
                                                    style={[
                                                        styles.checkbox,

                                                        isSectionSelected &&
                                                        styles.checkboxActive,
                                                    ]}
                                                >
                                                    {
                                                        isSectionSelected && (
                                                            <Image source={Images.tick} style={{ height: 15, width: 15, tintColor: '#FFFFFF', resizeMode: 'contain' }} />
                                                        )
                                                    }
                                                </TouchableOpacity>
                                            </View>


                                            {
                                                section.items.map(item => (
                                                    <MyProductCard
                                                        key={item.id}
                                                        item={item}
                                                        navigation={navigation}
                                                        type={section.type}
                                                        isSelected={selectedItems.includes(
                                                            item.id,
                                                        )}

                                                        toggleItemSelection={
                                                            toggleItemSelection
                                                        }
                                                        updateQuantity={updateQuantity}
                                                        styles={styles}
                                                    />
                                                ))
                                            }
                                        </View>
                                    );
                                },
                            )
                        }

                        {/* BILL */}

                        <View style={styles.billBox}>

                            <BillRow
                                label="Items"
                                value={`${totalItems}`}
                            />

                            <BillRow
                                label="Subtotal"
                                value={`Rs. ${Math.round(Number(subtotal))}`}
                            />

                            <BillRow
                                label="Delivery"
                                value={`Rs. ${deliveryFee}`}
                            />

                            <View
                                style={
                                    styles.divider
                                }
                            />

                            <BillRow
                                label="Total"
                                value={`Rs. ${Math.round(Number(total))}`}
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
                                    ? insets.bottom + 10
                                    : 20,
                            },
                        ]}
                    >

                        <Text
                            style={
                                styles.checkoutText
                            }
                        >
                            Proceed To Checkout
                        </Text>

                        <View
                            style={{
                                minWidth: 70,
                                alignItems: 'flex-end',
                            }}
                        >
                            {/* {loading ? (
                        <ActivityIndicator
                            color="#FFF"
                            size="small"
                        />
                    ) : ( */}
                            <Text style={styles.checkoutPrice}>
                                Rs. {Math.round(total)}
                            </Text>
                            {/* )} */}
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
        backgroundColor: '#F8FAF8',
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
        backgroundColor: '#EEF3F1',
        borderRadius: 28,
        padding: 14,
        marginTop: 20,
        marginBottom: 20,
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
        padding: 14,
        marginBottom: 14,
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