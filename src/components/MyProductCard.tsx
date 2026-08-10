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

type Props = {
    item: any;
    type: 'cart' | 'prescribed';
    isSelected: boolean;
    navigation: any;
    toggleItemSelection: (id: string) => void;
    updateQuantity: (variantId: string, action: 'plus' | 'minus') => void;
};

const MyProductCard = ({
    item,
    type,
    isSelected,
    navigation,
    toggleItemSelection,
    updateQuantity,
}: Props) => {
    const lineTotal = Math.round(Number(item.price || 0) * Number(item.quantity || 1));
    const imageUri =
        resolveImageUri(item?.image) || resolveCartItemImage(item);

    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() =>
                navigation.navigate('ProductDetails', {
                    varientID: item?.variant_id,
                })
            }
        >
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleItemSelection(item.id)}
                style={[styles.checkbox, isSelected && styles.checkboxActive]}
            >
                {isSelected && (
                    <TablerIcon name="check" size={12} color="#FFF" />
                )}
            </TouchableOpacity>

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

             <View style={{flexDirection:'row', justifyContent:'flex-start', alignItems:'center', gap:5}}>
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
                    <Text style={styles.price}>₹{Math.round(item.price)}</Text>
                    <Text style={styles.lineTotal}>₹{lineTotal}</Text>
                </View>

                {type === 'prescribed' && !!item.doctorName && (
                    <View style={styles.prescribedPill}>
                        <TablerIcon name="stethoscope" size={12} color="#047857" />
                        <Text numberOfLines={1} style={styles.prescribedText}>
                            {/^dr\.?\s/i.test(String(item.doctorName).trim())
                                ? item.doctorName
                                : `Dr. ${item.doctorName}`}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.qtyWrap}>
                <BlinkitAddButton
                    quantity={item.quantity}
                    compact
                    onAdd={() => updateQuantity(item.variant_id, 'plus')}
                    onIncrement={() => updateQuantity(item.variant_id, 'plus')}
                    onDecrement={() => updateQuantity(item.variant_id, 'minus')}
                />
            </View>
        </Pressable>
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
        gap: 8,
        // marginTop: 4,
    },
    price: {
        fontSize: 15,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    lineTotal: {
        fontSize: 12,
        color: '#64748B',
        textDecorationLine:'line-through',
        fontFamily: Fonts.PoppinsMedium,
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
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
});
