import React, { memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import TablerIcon from './TablerIcon';

const MyProductCard = ({
    item,
    type,
    isSelected, navigation,
    toggleItemSelection,
    updateQuantity,
    styles,
}: any) => {
    console.log('itemitemitemitem', item);
    return (
        <TouchableOpacity
            style={styles.productCard}
            activeOpacity={0.9}
            onPress={() =>
                navigation.navigate('ProductDetails', {
                    varientID: item?.variant_id,
                })
            }>

            <View style={styles.productTopRow}>

                <View style={styles.leftWrapper}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => toggleItemSelection(item.id)}
                        style={[
                            styles.checkbox,
                            isSelected && styles.checkboxActive,
                        ]}>
                        {isSelected && (
                            <TablerIcon name="check" size={12} color="#FFF" />
                        )}
                    </TouchableOpacity>

                    <Image
                        source={{
                            uri: item?.image,
                        }}
                        style={styles.image}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                        {item.name}
                    </Text>

                    <Text style={styles.weight}>
                        {item.brand_name}
                    </Text>

                    <Text style={styles.size}>
                        {item.size} g
                    </Text>

                    <Text style={styles.price}>
                        Rs. {Math.round(item.price)}
                    </Text>

                    {type === 'prescribed' && (
                        <Text style={styles.prescribedDoctorName}>
                            Prescribed by {item?.doctorName}
                        </Text>
                    )}
                </View>

                <View style={styles.qtyBox}>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                            updateQuantity(
                                item.variant_id,
                                'plus',
                            )
                        }>
                        <Text style={styles.qtyBtnText}>+</Text>
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
                        }>
                        <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default memo(MyProductCard);
