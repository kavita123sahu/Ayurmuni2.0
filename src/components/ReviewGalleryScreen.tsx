import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../common/Vector';
import AppHeader from './AppHeader';
import { Images } from '../common/Images';
import ImageView from 'react-native-image-viewing';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

const { width } = Dimensions.get('window');

const ITEM_SIZE = (width - 36) / 2;

export const ReviewGalleryScreen = ({
    route,
    navigation,
}: any) => {
    const [showViewer, setShowViewer] =
        useState(false);

    const [selectedIndex, setSelectedIndex] =
        useState(0);
    const { images } = route.params;

    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER */}


            <AppHeader title='Customer Reviews' leftIcon={Images.backIcon} onLeftPress={() => navigation.goBack()} />

            {/* COUNT */}

            <Text style={styles.countText}>
                {images?.length} Photos
            </Text>

            {/* GRID */}

            <FlatList
                data={images}
                numColumns={2}
                contentContainerStyle={{
                    padding: 12,
                }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(_, index) =>
                    index.toString()
                }
                columnWrapperStyle={{
                    justifyContent: 'space-between',
                }}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.card}
                        onPress={() => {
                            setSelectedIndex(index);
                            setShowViewer(true);
                        }}
                    >
                        <Image
                            source={{ uri: item }}
                            style={styles.image}
                        />
                    </TouchableOpacity>
                )}
            />
            <ImageView
                images={images.map(item => ({
                    uri: item,
                }))}
                imageIndex={selectedIndex}
                visible={showViewer}
                onRequestClose={() =>
                    setShowViewer(false)
                }
            />
        </SafeAreaView>
    );
};

export default ReviewGalleryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    header: {
        height: 60,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
    },

    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    countText: {
        fontSize: 18,
        color: '#6B7280',
        marginLeft: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 10,
    },

    card: {
        width: ITEM_SIZE,
        backgroundColor: '#FFF',
        borderRadius: 18,
        marginBottom: 12,

        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 3,
    },

    image: {
        width: '100%',
        height: ITEM_SIZE,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
    },
});