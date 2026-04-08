import React, { useCallback } from 'react';
import {
    FlatList,
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';

const { width } = Dimensions.get('window');

// 🔥 Dynamic sizing (5 items visible approx)
const ITEM_SIZE = width / 5;

interface Category {
    id: string;
    name: string;
    icon: any;
}

const HomeCategory = ({ data = [], navigation }: any) => {

    const handlePress = useCallback((item: Category) => {
        switch (item.name) {
            case 'Doctors':
                // navigation.navigate('Consult');
                break;

            case 'Medicine':
                navigation.navigate('MedicineScreen');
                break;

            case 'Products':
                navigation.navigate('ProductsScreen');
                break;

            default:
                navigation.navigate('TopCategories');
        }
    }, [navigation]);



    const renderItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={[styles.item, { width: ITEM_SIZE }]}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.circle, { width: ITEM_SIZE - 10, height: ITEM_SIZE - 10 }]}>
                <Image source={item.icon} style={styles.icon} />
            </View>

            <Text numberOfLines={1} style={styles.text}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <FlatList
            horizontal
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            getItemLayout={(_, index) => ({
                length: ITEM_SIZE,
                offset: ITEM_SIZE * index,
                index,
            })}
        />
    );
};

export default React.memo(HomeCategory);

const styles = StyleSheet.create({
    container: {
        // paddingHorizontal: 8,
        marginHorizontal:0,
        paddingLeft:-20
        
    },

    item: {
        alignItems: 'center',
        marginHorizontal: 6,
    },

    circle: {
        borderRadius: 20,
        backgroundColor: '#0D614E1A',
        justifyContent: 'center',
        alignItems: 'center',
    },

    icon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },

    text: {
        marginTop: 6,
        fontSize: 12,
        color: Colors.textColor,
        fontFamily : Fonts.PoppinsMedium
    },
});