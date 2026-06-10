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




const MyCart = ({ navigation }: any) => {

    const { CartData, loading } =
        useAllCartData();

    const insets = useSafeAreaInsets();
    const [sections, setSections] =
        useState<SectionType[]>([]);

    const [selectedItems, setSelectedItems] =
        useState<string[]>([]);


    console.log('CartDataCartDataCartDataCartData', CartData);

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

            console.log("varinttid", variantId)

            let newQty = 1;
            let oldQty = 1;

            setSections(prev =>
                prev.map(section => ({
                    ...section,
                    items: section.items.map(item => {

                        if (
                            item.variant_id !==
                            variantId
                        ) {
                            return item;
                        }

                        oldQty = item.quantity;

                        newQty =
                            action === 'plus'
                                ? item.quantity + 1
                                : Math.max(
                                    1,
                                    item.quantity - 1,
                                );

                        return {
                            ...item,
                            quantity: newQty,
                        };
                    }),
                })),
            );

            console.log("newwquanttiy", newQty);

            try {

                const resposne = await _CART_SERVICES.AddupdateCart({
                    variant_id: variantId,
                    quantity: newQty,
                });
                console.log("myacrdpluminus", resposne)

            } catch (error) {

                setSections(prev =>
                    prev.map(section => ({
                        ...section,
                        items: section.items.map(item => {

                            if (
                                item.variant_id !==
                                variantId
                            ) {
                                return item;
                            }

                            return {
                                ...item,
                                quantity: oldQty,
                            };
                        }),
                    })),
                );
            }
        },
        [],
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



    const handleCheckout = () => {

        if (selectedProducts.length === 0) {
            return;
        }

        navigation.navigate(
            'Checkout',
            {
                selectedProducts,
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

            {loading ? laodingCart() :

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
                                value={`Rs. ${subtotal}`}
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
                                value={`Rs. ${total}`}
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
            }


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