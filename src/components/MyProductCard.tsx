import React, { memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Pressable,
} from 'react-native';
import TablerIcon from './TablerIcon';
import BlinkitAddButton from './BlinkitAddButton';
import { Fonts } from '../common/Fonts';
import { CARD_SURFACE } from '../constants/cardStyles';
import { resolveImageUri } from '../utils/imageUtils';
import { resolveCartItemImage } from '../common/DataInterface';
import { isPrescriptionRequired } from '../utils/prescriptionUtils';
import {
    resolveCartItemMrp,
    resolveCartItemSellingPrice,
} from '../utils/cartPriceUtils';
import { RupeeAmount } from '../utils/currencyUtils';

type Props = {
    item: any;
    type: 'cart' | 'prescribed';
    isSelected: boolean;
    navigation: any;
    toggleItemSelection: (id: string) => void;
    updateQuantity: (itemId: string, action: 'plus' | 'minus' | 'remove') => void;
};

const MyProductCard = ({
    item,
    type,
    isSelected,
    navigation,
    toggleItemSelection,
    updateQuantity,
}: Props) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const displayQty = qty;

    const unitSelling = resolveCartItemSellingPrice(item) || Number(item.price) || 0;
    const unitMrp = resolveCartItemMrp(item);
    const sellingLineTotal = Math.round(unitSelling * displayQty);
    const mrpLineTotal = Math.round(unitMrp * displayQty);
    const showMrp =
        unitMrp > 0 && unitSelling > 0 && unitMrp > unitSelling;

    const imageUri =
        resolveImageUri(item?.image) || resolveCartItemImage(item);

    const rxRequired = isPrescriptionRequired(item);
    const isPrescribed = type === 'prescribed';

    // prescription_required true → locked qty (no increase / remove)
    // prescription_required false on prescribed → increase OK, min qty 1, no remove
    // regular cart → normal controls (increase still blocked in handler if Rx)
    const showLockedQty = isPrescribed && rxRequired;
    const showPrescribedAdjust = isPrescribed && !rxRequired;
    const showNormalControls = !isPrescribed;

    return (
        <View style={styles.card}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleItemSelection(item.id)}
                style={[styles.checkbox, isSelected && styles.checkboxActive]}
            >
                {isSelected && (
                    <TablerIcon name="check" size={12} color="#FFF" />
                )}
            </TouchableOpacity>

            <Pressable
                style={({ pressed }) => [
                    styles.cardMain,
                    pressed && styles.cardPressed,
                ]}
                onPress={() =>
                    navigation.navigate('ProductDetails', {
                        varientID: item?.variant_id,
                    })
                }
            >
                <View style={styles.imageWrap}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <TablerIcon name="package" size={28} color="#CBD5E1" />
                        </View>
                    )}
                </View>

                <View style={styles.info}>
                    <Text numberOfLines={2} style={styles.name}>
                        {item.name}
                    </Text>

                    <View style={styles.metaRow}>
                        {!!item.brand_name && (
                            <Text numberOfLines={1} style={styles.brand}>
                                {item.brand_name}
                            </Text>
                        )}

                        {!!item.size && (
                            <Text style={styles.size}>({item.size})</Text>
                        )}
                    </View>

                    <View style={styles.priceRow}>
                        <RupeeAmount
                            value={Math.round(sellingLineTotal)}
                            style={styles.sellingPrice}
                        />
                        {showMrp ? (
                            <RupeeAmount
                                value={mrpLineTotal}
                                style={styles.mrpStrike}
                                prefix="MRP "
                            />
                        ) : null}
                    </View>

                    {isPrescribed && !!item.doctorName && (
                        <View style={styles.prescribedPill}>
                            <TablerIcon name="stethoscope" size={12} color="#047857" />
                            <Text numberOfLines={1} style={styles.prescribedText}>
                                {/^dr\.?\s/i.test(String(item.doctorName).trim())
                                    ? item.doctorName
                                    : `${item.doctorName}`}
                            </Text>
                        </View>
                    )}
                </View>
            </Pressable>

            <View
                style={styles.qtyWrap}
                onStartShouldSetResponder={() => true}
            >
                {showLockedQty ? (
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() =>
                            updateQuantity(String(item.id), 'plus')
                        }
                        style={styles.prescribedQtyBox}
                    >
                        <Text style={styles.prescribedQtyValue}>{qty}</Text>
                        <Text style={styles.prescribedQtyLabel}>Rx locked</Text>
                    </TouchableOpacity>
                ) : null}

                {showPrescribedAdjust ? (
                    <BlinkitAddButton
                        quantity={displayQty}
                        compact
                        minQuantity={1}
                        onAdd={() => updateQuantity(String(item.id), 'plus')}
                        onIncrement={() =>
                            updateQuantity(String(item.id), 'plus')
                        }
                        onDecrement={() =>
                            updateQuantity(String(item.id), 'minus')
                        }
                    />
                ) : null}

                {showNormalControls ? (
                    <>
                        <BlinkitAddButton
                            quantity={qty}
                            compact
                            onAdd={() => updateQuantity(String(item.id), 'plus')}
                            onIncrement={() =>
                                updateQuantity(String(item.id), 'plus')
                            }
                            onDecrement={() =>
                                updateQuantity(String(item.id), 'minus')
                            }
                        />
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() =>
                                updateQuantity(String(item.id), 'remove')
                            }
                            style={styles.removeBtn}
                        >
                            <TablerIcon name="trash" size={14} color="#B91C1C" />
                            <Text style={styles.removeBtnText}>Remove</Text>
                        </TouchableOpacity>
                    </>
                ) : null}
            </View>
        </View>
    );
};

export default memo(MyProductCard);

const styles = StyleSheet.create({
    card: {
        ...CARD_SURFACE,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        padding: 10,
        marginBottom: 10,
        gap: 10,
    },
    cardMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
        gap: 10,
    },
    cardPressed: {
        opacity: 0.96,
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
        backgroundColor: '#0D614E',
        borderColor: '#0D614E',
    },
    imageWrap: {
        width: 72,
        height: 72,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F8FAFC',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
        minWidth: 0,
        gap: 2,
    },
    name: {
        fontSize: 14,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        lineHeight: 18,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 5,
    },
    brand: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },
    size: {
        fontSize: 11,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: 6,
    },
    sellingPrice: {
        fontSize: 15,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    mrpStrike: {
        fontSize: 12,
        color: '#94A3B8',
        textDecorationLine: 'line-through',
        fontFamily: Fonts.PoppinsMedium,
    },
    lineTotal: {
        fontSize: 12,
        color: '#334155',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    mrpLineHint: {
        fontSize: 10,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
    },
    prescribedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        marginTop: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: '#ECFDF5',
        maxWidth: '100%',
    },
    prescribedText: {
        flexShrink: 1,
        fontSize: 10,
        color: '#047857',
        fontFamily: Fonts.PoppinsMedium,
    },
    qtyWrap: {
        alignItems: 'center',
        gap: 6,
    },
    prescribedQtyBox: {
        minWidth: 52,
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
    },
    prescribedQtyValue: {
        fontSize: 14,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    prescribedQtyLabel: {
        fontSize: 9,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },
    removeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginTop: 2,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
        minWidth: 84,
    },
    removeBtnText: {
        fontSize: 11,
        color: '#B91C1C',
        fontFamily: Fonts.PoppinsSemiBold,
    },
});
