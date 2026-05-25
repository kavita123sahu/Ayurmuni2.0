import React, {
    memo,
    useCallback,
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
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../../components/AppHeader';

import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type ProductItem = {
    id: string;
    name: string;
    weight: string;
    price: number;
    quantity: number;
    image: any;
    doctorName?: string;
};

type SectionType = {
    id: string;
    title: string;
    type: 'cart' | 'prescribed';
    items: ProductItem[];
};

const INITIAL_DATA: SectionType[] = [
    {
        id: 'cart',
        title: 'My Cart',
        type: 'cart',

        items: [
            {
                id: '1',
                name: 'Foxtail Millet',
                weight: '500g Pack',
                price: 149,
                quantity: 1,
                image: Images.detailimage,
            },

            {
                id: '2',
                name: 'Foxtail Millet',
                weight: '500g Pack',
                price: 149,
                quantity: 1,
                image: Images.detailimage,
            },
        ],
    },

    {
        id: 'prescribed',
        title: 'Prescribed Medicines',
        type: 'prescribed',

        items: [
            {
                id: '3',
                name: 'Foxtail Millet',
                weight: '500g Pack',
                price: 149,
                quantity: 1,
                image: Images.detailimage,
                doctorName: 'Dr. Arjun R Nair',
            },

            {
                id: '4',
                name: 'Foxtail Millet',
                weight: '500g Pack',
                price: 149,
                quantity: 1,
                image: Images.detailimage,
                doctorName: 'Dr. Arjun R Nair',
            },
        ],
    },
];

const MyCart = ({ navigation }: any) => {

    const [sections, setSections] =
        useState<SectionType[]>(INITIAL_DATA);

    /*
        SELECTED IDS
    */


    const insets = useSafeAreaInsets();

    const [selectedItems, setSelectedItems] =
        useState<string[]>([]);

    /* ========================================================= */

    const allIds = useMemo(() => {

        return sections.flatMap(section =>
            section.items.map(item => item.id),
        );

    }, [sections]);

    /* ========================================================= */

    const isAllSelected =
        allIds.length > 0 &&
        selectedItems.length === allIds.length;

    /* ========================================================= */

    const toggleAllSelection =
        useCallback(() => {

            if (isAllSelected) {

                setSelectedItems([]);

                return;
            }

            setSelectedItems(allIds);

        }, [allIds, isAllSelected]);

    /* ========================================================= */

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

    /* ========================================================= */

    const increaseQty = useCallback(
        (id: string) => {

            setSections(prev =>
                prev.map(section => ({
                    ...section,

                    items: section.items.map(
                        item =>
                            item.id === id
                                ? {
                                    ...item,
                                    quantity:
                                        item.quantity +
                                        1,
                                }
                                : item,
                    ),
                })),
            );
        },
        [],
    );

    /* ========================================================= */

    const decreaseQty = useCallback(
        (id: string) => {

            setSections(prev =>
                prev.map(section => ({
                    ...section,

                    items: section.items
                        .map(item => {

                            if (
                                item.id === id
                            ) {

                                return {
                                    ...item,

                                    quantity:
                                        item.quantity >
                                            1
                                            ? item.quantity -
                                            1
                                            : 1,
                                };
                            }

                            return item;
                        })
                        .filter(
                            item =>
                                item.quantity > 0,
                        ),
                })),
            );
        },
        [],
    );

    /* ========================================================= */

    const selectedProducts =
        useMemo(() => {

            return sections
                .flatMap(section =>
                    section.items,
                )
                .filter(item =>
                    selectedItems.includes(
                        item.id,
                    ),
                );

        }, [sections, selectedItems]);

    /* ========================================================= */

    const subtotal = useMemo(() => {

        return selectedProducts.reduce(
            (sum, item) =>
                sum +
                item.price * item.quantity,

            0,
        );

    }, [selectedProducts]);

    /* ========================================================= */

    const totalItems =
        selectedProducts.length;

    const deliveryFee = 40;

    const total =
        subtotal > 0
            ? subtotal + deliveryFee
            : 0;

    /* ========================================================= */

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

    /* ========================================================= */

    const renderProduct = ({
        item,
        type,
    }: {
        item: ProductItem;
        type: 'cart' | 'prescribed';
    }) => {

        const isSelected =
            selectedItems.includes(
                item.id,
            );

        return (
            <View style={styles.productCard}>

                {/* LEFT */}

                <View
                    style={styles.leftWrapper}
                >

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                            toggleItemSelection(
                                item.id,
                            )
                        }
                        style={[
                            styles.checkbox,

                            isSelected &&
                            styles.checkboxActive,
                        ]}
                    >
                        {
                            isSelected && (

                                <Image source={Images.tick} style={{ height: 15, width: 15, tintColor: '#FFFFFF', resizeMode: 'contain' }} />
                            )
                        }
                    </TouchableOpacity>

                    <Image
                        source={item.image}
                        style={styles.image}
                    />
                </View>

                {/* CENTER */}

                <View
                    style={{ flex: 1 }}
                >

                    <Text
                        style={styles.name}
                    >
                        {item.name}
                    </Text>

                    <Text
                        style={styles.weight}
                    >
                        {item.weight}
                    </Text>

                    <Text
                        style={styles.price}
                    >
                        Rs. {item.price}.00
                    </Text>

                </View>


                {/* QTY */}

                <View style={styles.qtyBox}>

                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                            increaseQty(
                                item.id,
                            )
                        }
                    >
                        <Text
                            style={
                                styles.qtyBtnText
                            }
                        >
                            +
                        </Text>
                    </TouchableOpacity>

                    <Text
                        style={styles.qtyText}
                    >
                        {item.quantity}
                    </Text>

                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                            decreaseQty(
                                item.id,
                            )
                        }
                    >
                        <Text
                            style={
                                styles.qtyBtnText
                            }
                        >
                            −
                        </Text>
                    </TouchableOpacity>
                </View>

                
            </View>
        );
    };

    /* ========================================================= */

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

            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={{
                    paddingBottom: 180,
                    paddingHorizontal: 20,
                }}
            >

              

                {/* SECTIONS */}

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
                                        section.items.map(
                                            item =>
                                                renderProduct(
                                                    {
                                                        item,

                                                        type: section.type,
                                                    },
                                                ),
                                        )
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

            {/* CHECKOUT */}

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

                <Text
                    style={
                        styles.checkoutPrice
                    }
                >
                    Rs. {total}
                </Text>
            </TouchableOpacity>
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
        marginTop:20,
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 14,
        marginBottom: 14,
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

    prescribedTag: {
        marginTop: 10,
        alignSelf: 'flex-start',
        backgroundColor: '#0D614E',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    prescribedText: {
        fontSize: 10,
        color: '#FFF',
        fontFamily:
            Fonts.PoppinsMedium,
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