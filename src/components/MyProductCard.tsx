import React, { memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Images } from '../common/Images';

const MyProductCard = ({
    item,
    type,
    isSelected,
    toggleItemSelection,
    updateQuantity,
    styles,
}: any) => {
    console.log('MyProductCard rendered', item);
    return (
        <View style={styles.productCard}>
            <View style={styles.productTopRow}>
                <View style={styles.leftWrapper}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                            toggleItemSelection(item.id)
                        }
                        style={[
                            styles.checkbox,
                            isSelected &&
                            styles.checkboxActive,
                        ]}
                    >
                        {isSelected && (
                            <Image
                                source={Images.tick}
                                style={{
                                    height: 15,
                                    width: 15,
                                    tintColor: '#FFF',
                                    resizeMode: 'contain',
                                }}
                            />
                        )}
                    </TouchableOpacity>

                    <Image
                        source={{
                            uri: item.image,
                        }}
                        style={styles.image}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                        {item.name}
                    </Text>

                    <Text style={styles.weight}>
                        {item.weight}
                    </Text>

                    <Text style={styles.price}>
                        Rs. {item.price}.00
                    </Text>
                </View>

                <View style={styles.qtyBox}>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                            updateQuantity(
                                item.variant_id,
                                'plus',
                            )
                        }
                    >
                        <Text style={styles.qtyBtnText}>
                            +
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.qtyText}>
                        {item.quantity}
                    </Text>

                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                            updateQuantity(
                                item.variant_id,
                                'minus',
                            )
                        }
                    >
                        <Text style={styles.qtyBtnText}>
                            −
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {type === 'prescribed' && (
                <View
                    style={
                        styles.prescribedWrapper
                    }
                >
                    <Image
                        source={
                            Images.doctorImage
                        }
                        style={
                            styles.prescribedDoctorImage
                        }
                    />

                    <Text
                        numberOfLines={1}
                        style={
                            styles.prescribedText
                        }
                    >
                        Prescribed by{' '}
                        <Text
                            style={
                                styles.prescribedDoctorName
                            }
                        >
                            {item.doctorName}
                        </Text>
                    </Text>
                </View>
            )}
        </View>
    );
};

export default memo(MyProductCard);