import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';

const { width } = Dimensions.get('window');

const MedicalReceipt = (props: any) => {
    return (
        <SafeAreaView style={styles.container}>

            <StatusBar barStyle='dark-content' backgroundColor={'#FFFFFF'} />

            <AppHeader
                title="Medical Receipt"
                leftIcon={Images.backIcon}
                onLeftPress={() => props.navigation.goBack()}

            />


            <ScrollView contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false} >

                <View style={styles.cardWrapper}>
                    <View style={styles.card}>

                        <View style={styles.iconBox}>
                            <Image source={Images.PlusBag} style={{ height: 30, width: 30, tintColor: Colors.primaryColor }} />
                        </View>


                        <Text style={styles.title}>HealthConnect Clinic</Text>
                        <Text style={styles.subtitle}>DIGITAL CONSULTATION RECEIPT</Text>

                        {/* INFO ROWS */}
                        <View style={styles.infoRow}>
                            <View>
                                <Text style={styles.label}>Receipt No.</Text>
                                <Text style={styles.value} numberOfLines={1}>#RC-983421</Text>
                            </View>

                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.label}>Date</Text>
                                <Text style={styles.value} numberOfLines={1}>12 May, 2023</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View>
                                <Text style={styles.label}>Patient Name</Text>
                                <Text style={styles.value} numberOfLines={1}>John Doe</Text>
                            </View>

                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.label}>Payment Method</Text>
                                <Text style={[styles.value, { color: Colors.primaryColor }]}>
                                    Credit Card
                                </Text>
                            </View>
                        </View>


                        <View style={styles.dashed} />

                        <View style={styles.doctorRow}>
                            <Image
                                source={Images.doctorImage}
                                style={styles.docImg}
                            />
                            <View style={{ paddingLeft: 5, }}>
                                <Text style={styles.docName}>Dr. Arjun R Nair</Text>
                                <Text style={styles.docSpec}>Cardiologist</Text>
                            </View>
                        </View>

                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Consultation Fee</Text>
                            <Text style={styles.priceValue}>$120.00</Text>
                        </View>

                        <View style={styles.priceRow1}>
                            <Text style={styles.priceLabel}>Administrative Charges</Text>
                            <Text style={styles.priceValue}>$15.00</Text>
                        </View>

                        <View style={styles.priceRow1}>
                            <Text style={styles.priceLabel}>Digital Report Access</Text>
                            <Text style={styles.priceValue}>$5.00</Text>
                        </View>


                        <View style={styles.dashed} />

                        {/* TOTAL */}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalText}>Total Paid</Text>
                            <Text style={styles.totalAmount}>$140.00</Text>
                        </View>

                        <View style={styles.noteBox}>
                            <Text style={styles.noteText}>
                                THIS IS A COMPUTER GENERATED RECEIPT. NO SIGNATURE IS REQUIRED.
                            </Text>
                        </View>

                    </View>
                </View>

            </ScrollView>

            <TouchableOpacity style={styles.downloadBtn}>
                <Image source={Images.pdfIcon} style={{ height: 15, width: 15, tintColor: '#FFFFFF' }} />
                <Text style={styles.downloadText}> Download PDF</Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
};

export default MedicalReceipt;


const styles = StyleSheet.create({
    container: {
        flex: 1,

        backgroundColor: '#FFFFFF',
    },

    scroll: {

        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: Colors.background
    },

    cardWrapper: {
        borderRadius: 30,
        marginBottom: 10,
        backgroundColor: Colors.primaryColor,
        paddingTop: 3,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: width * 0.045,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    iconBox: {
        alignSelf: 'center',
        backgroundColor: '#E6F4F1',
        padding: 20,
        borderRadius: 16,
        marginTop: 20,
        marginBottom: 10,
    },

    title: {
        textAlign: 'center',
        fontSize: 18,
        marginTop: 8,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
        marginBottom: -4
    },

    subtitle: {
        textAlign: 'center',
        fontSize: 12,
        color: '#94A3B8',
        textTransform: 'uppercase',
        lineHeight: 16,
        // marginBottom: 40,
        marginBottom: 28,
        fontFamily: Fonts.PoppinsMedium,
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        flexWrap: 'wrap',
    },

    label: {
        fontSize: 14,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },

    value: {
        fontSize: 14,
        color: '#1E293B',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    dashed: {
        borderStyle: 'dashed',
        borderWidth: 1.2,
        borderColor: '#E2E8F0',
        marginVertical: 12,
    },

    doctorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },

    docImg: {
        width: 50,
        height: 50,
        borderRadius: 12,
        marginRight: 10,
    },

    docName: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
        marginBottom: -3
    },

    docSpec: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        marginTop: 10
    },

    priceRow1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        // marginTop:5
    },
    priceLabel: {
        fontSize: 14,
        flex: 1,
        paddingRight: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#475569',
    },

    priceValue: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
        marginBottom: 5,

    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },

    totalText: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    totalAmount: {
        fontSize: 22,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
    },

    noteBox: {
        backgroundColor: '#F1F5F9',
        padding: 12,
        borderRadius: 10,
        marginTop: 12,
    },

    noteText: {
        fontSize: 10,
        textAlign: 'center',
        color: '#94A3B8',
    },

    downloadBtn: {
        // position: 'absolute',
        // // bottom: 0,
        // left: 16,
        // right: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 5,
        marginHorizontal: 20,
        bottom: 5,
        height: 55,
        backgroundColor: '#0D614E',
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
    },

    downloadText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
    },
});