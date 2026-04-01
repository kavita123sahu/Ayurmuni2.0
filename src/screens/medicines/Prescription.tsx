import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Header } from '@react-navigation/elements'
import AppHeader from '../../components/AppHeader'
import { Images } from '../../common/Images'
import { Fonts } from '../../common/Fonts';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const Prescription = () => {
    const recentData = [
        {
            id: '1',
            image: Images.doc1,
            date: 'Oct 24, 2023',
        },
        {
            id: '2',
            image: Images.doc1,
            date: 'Sep 12, 2023',
        },
        {
            id: '3',
            image: Images.doc1,
            date: 'Aug 05, 2023',
        },
    ];

    const openCamera = () => {
        launchCamera({ mediaType: 'photo' }, (res) => {
            console.log(res);
        });
    };

    const openGallery = () => {
        launchImageLibrary({ mediaType: 'photo' }, (res) => {
            console.log(res);
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Product Details"
                leftIcon={Images.backIcon}
                onRightPress={() => console.log("Share clicked")}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
            >
                <View style={styles.header}>
                    <Text style={styles.stepText}>Step 1: Documents Upload</Text>
                    <Text style={styles.count}>1 / 3</Text>
                </View>

                <View style={styles.progressBg}>
                    <View style={styles.progressFill} />
                </View>

                <View style={styles.card}>
                    <View style={styles.iconBox}>
                        <Image
                            source={Images.prescriptionIcon}
                            style={styles.icon}
                        />
                    </View>

                    <Text style={styles.title}>Upload Prescription</Text>

                    <Text style={styles.subtitle}>
                        Please provide a clear photo of your doctor's prescription for quick processing.
                    </Text>

                    <View style={styles.row}>
                        <TouchableOpacity style={styles.btn} onPress={openCamera}>
                            <Image source={Images.camera} style={styles.btnIcon} />
                            <Text style={styles.btnText}>CAMERA</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btn} onPress={openGallery}>
                            <Image source={Images.galary} style={styles.btnIcon} />
                            <Text style={styles.btnText}>GALLERY</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>HOW TO TAKE A PHOTO</Text>

                {[
                    {
                        title: 'Bright Lighting',
                        desc: 'Ensure the paper is well-lit and avoid harsh shadows.',
                    },
                    {
                        title: 'Perfect Alignment',
                        desc: 'Align all four corners within the frame for scanning.',
                    },
                    {
                        title: 'Sharp Text',
                        desc: 'Hold the camera steady so that the text is readable.',
                    },
                ].map((item, index) => (
                    <View key={index} style={styles.tipRow}>
                        <View style={styles.tickBox}>
                            <Image
                                source={Images.tick}
                                style={styles.tickIcon}
                            />
                        </View>
                        <View>
                            <Text style={styles.tipTitle}>{item.title}</Text>
                            <Text style={styles.tipDesc}>{item.desc}</Text>
                        </View>
                    </View>
                ))}

                {/* 🔥 RECENT */}
                <View style={styles.recentHeader}>
                    <Text style={styles.sectionTitle}>RECENT UPLOADS</Text>
                    <Text style={styles.seeAll}>See All</Text>
                </View>

                {/* 🔥 FLATLIST FIXED */}
                <FlatList
                    data={recentData}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                    contentContainerStyle={{ paddingRight: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.recentCard}>
                            <Image source={item.image} style={styles.recentImg} />
                            <Text style={styles.date}>{item.date}</Text>
                            <Text style={styles.verified}>Verified</Text>
                        </View>
                    )}
                />

            </ScrollView>

            <TouchableOpacity style={styles.checkout}>
                <View style={styles.checkoutRow}>
                    <Text style={styles.checkoutText}>Proceed to Details</Text>
                    <Image source={Images.arrowRight} style={styles.checkoutIcon} />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default Prescription

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFB',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    stepText: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    count: {
        fontSize: 14,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold
    },

    progressBg: {
        height: 8,
        backgroundColor: '#0D614E33',
        borderRadius: 10,
        marginVertical: 10,
    },

    progressFill: {
        width: '33%',
        height: 8,
        backgroundColor: '#0D614E',
        borderRadius: 10,
    },

    card: {
        backgroundColor: '#0D614E0D',
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#0D614E33',
        marginBottom: 24
    },

    iconBox: {
        height: 80,
        width: 80,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },

    icon: {
        height: 40,
        width: 40,
        tintColor: '#0D614E'
    },

    title: {
        fontSize: 24,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
        marginTop: 10
    },

    subtitle: {
        fontSize: 13,
        textAlign: 'center',
        color: '#475569',
        marginVertical: 10,
        lineHeight: 20,
        fontFamily: Fonts.PoppinsMedium
    },

    row: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 20
    },

    btn: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 46,
        borderRadius: 12,
    },

    btnIcon: {
        height: 24,
        width: 24,
        tintColor: '#0D614E',
        marginBottom: 10
    },

    btnText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    sectionTitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
        fontFamily: Fonts.PoppinsSemiBold
    },

    tipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },

    tickBox: {
        height: 24,
        width: 24,
        borderRadius: 6,
        backgroundColor: '#0F766E1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginTop: 2,
    },

    tickIcon: {
        height: 12,
        width: 12,
        tintColor: '#0D614E',
    },

    tipTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    tipDesc: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
        top: -4
    },

    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },

    seeAll: {
        fontSize: 12,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsMedium,
    },

    recentCard: {
        width: 138,
    },

    recentImg: {
        width: 138,
        height: 184,
        borderRadius: 12,
    },

    date: {
        fontSize: 12,
        marginTop: 4,
        fontFamily: Fonts.PoppinsSemiBold
    },

    verified: {
        fontSize: 10,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium
    },

    checkout: {
        backgroundColor: '#0D614E',
        marginTop: 20,
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginHorizontal: 20
    },

    checkoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    checkoutText: {
        color: '#ffff',
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
    },

    checkoutIcon: {
        width: 24,
        height: 24,
        marginLeft: 8,
        tintColor: '#fff',
        top: -2
    },
});