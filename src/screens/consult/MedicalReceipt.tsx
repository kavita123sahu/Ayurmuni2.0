import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import * as _CONSULT_SERVICE from '../../services/ConsultServce';
import TablerIcon from '../../components/TablerIcon';
import { showSuccessToast } from '../../config/Key';
import { downloadPdfToDevice } from '../../utils/fileDownloadUtils';
import { createMedicalReceiptPdfBytes } from '../../utils/buildConsultationDocumentPdf';
import { formatDate } from '../../common/DataInterface';
import { RupeeAmount } from '../../utils/currencyUtils';
import { formatDisplayIdHash, formatReceiptId } from '../../utils/formatDisplayId';
const { width } = Dimensions.get('window');

interface ReceiptData {
    payment_id: string;
    paid_at: string;
    consultation_id: string;
    consultation_fees: number;
    administrative_charges: number;
    digital_report_access: number;
    total_amount: number;
    date: string;
    doctor_name: string;
    patient_name: string;
    payment_method?: string;
    payment_type?: string;

    patient: {
        name: string;
        email: string;
        phone: string;
    };

    info: {
        doctor_name: string;
        doctor_id: string;
        doctor_image: string | null;
        doctor_specialization: string | string[] | null;
    };

    amount: number;
}

const MedicalReceipt = (props: any) => {

    const consultationId =
        props?.route?.params
            ?.consultationId;
    const [loading, setLoading] =
        useState(true);

    const [receipt, setReceipt] =
        useState<ReceiptData | null>(
            null,
        );


    const fetchReceipt =
        async () => {

            try {

                setLoading(true);

                const response = await _CONSULT_SERVICE.getMedicalReceipt(consultationId);

                console.log("Receipt Response", response);
                setReceipt(
                    response?.data,
                );

            } catch (error) {

                console.log(
                    'Receipt Error',
                    error,
                );

            } finally {

                setLoading(false);
            }
        };

    const downloadReceiptPDF = async () => {
        if (!receipt) {
            showSuccessToast('Receipt data not loaded yet', 'error');
            return;
        }
        try {
            const pdfBytes = await createMedicalReceiptPdfBytes(receipt);
            const fileName = `Medical_Receipt_${formatReceiptId(receipt?.consultation_id ?? receipt?.payment_id).replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
            await downloadPdfToDevice({
                fileName,
                pdfBytes,
            });
        } catch (error: any) {
            console.log('RECEIPT SAVE ERROR:', error);
            showSuccessToast(
                error?.message || 'Unable to save receipt on device',
                'error',
            );
        }
    };


    useEffect(() => {
        if (consultationId) {
            fetchReceipt();
        }
    }, [consultationId]);

    const specialization =
        Array.isArray(receipt?.info?.doctor_specialization)
            ? receipt.info.doctor_specialization.join(', ')
            : receipt?.info?.doctor_specialization || '';


    return (
        <SafeAreaView style={styles.container}>

            <StatusBar barStyle='dark-content' backgroundColor={'#FFFFFF'} />

            <AppHeader
                title="Medical Receipt"
                onLeftPress={() => props.navigation.goBack()}

            />

            {loading ?

                (<SafeAreaView
                    style={{
                        flex: 1,
                        justifyContent:
                            'center',
                        alignItems:
                            'center',
                    }}>
                    <ActivityIndicator
                        size="large"
                        color={
                            Colors.primaryColor
                        }
                    />
                </SafeAreaView>)
                :
                (
                    <>
                        <ScrollView contentContainerStyle={styles.scroll}
                            showsVerticalScrollIndicator={false} >

                            <View style={styles.cardWrapper}>
                                <View style={styles.card}>

                                    <View style={styles.iconBox}>
                                        <TablerIcon name="plus-bag" size={30} color={Colors.primaryColor} />
                                    </View>

                                    <Text style={styles.title}>TruIndyaWellness Private Limited</Text>
                                    <Text style={styles.subtitle}>DIGITAL CONSULTATION RECEIPT</Text>

                                    {/* INFO ROWS */}
                                    <View style={styles.infoRow}>
                                        <View>
                                            <Text style={styles.label}>Receipt No.</Text>
                                            <Text style={styles.value} numberOfLines={1}>
                                                {formatDisplayIdHash(
                                                    'RCP',
                                                    receipt?.payment_id ?? receipt?.consultation_id,
                                                )}
                                            </Text>
                                        </View>

                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.label}>Date</Text>
                                            <Text style={styles.value} numberOfLines={1}>{formatDate(receipt?.date ?? '')}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <View>
                                            <Text style={styles.label}>Patient Name</Text>
                                            <Text style={styles.value} numberOfLines={1}>{receipt?.patient_name}</Text>
                                        </View>

                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.label}>Payment Method</Text>
                                            <Text style={[styles.value, { color: Colors.primaryColor }]}>
                                                {receipt?.payment_method ?? receipt?.payment_type ?? '—'}
                                            </Text>
                                        </View>
                                    </View>


                                    <View style={styles.dashed} />

                                    <View style={styles.doctorRow}>
                                        <Image
                                            source={
                                                receipt?.info?.doctor_image
                                                    ? { uri: receipt.info.doctor_image }
                                                    : Images.doctorImage
                                            }
                                            style={styles.docImg}
                                        />
                                        <View style={styles.docMeta}>
                                            <Text style={styles.docLabel}>Consulting Doctor</Text>
                                            <Text style={styles.docName} numberOfLines={2}>
                                                {receipt?.info?.doctor_name ||
                                                    receipt?.doctor_name ||
                                                    'Doctor'}
                                            </Text>
                                            {!!specialization && (
                                                <Text style={styles.docSpec} numberOfLines={2}>
                                                    {specialization}
                                                </Text>
                                            )}
                                            {!!receipt?.info?.doctor_id && (
                                                <Text style={styles.docId} numberOfLines={1}>
                                                    ID: {String(receipt.info.doctor_id).slice(0, 8)}…
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.priceRow}>
                                        <Text style={styles.priceLabel}>Consultation Fee</Text>
                                        <RupeeAmount
                                            value={receipt?.consultation_fees ?? 0}
                                            style={styles.priceValue}
                                            iconSize={14}
                                            iconColor={Colors.primaryColor}
                                        />
                                    </View>

                                    <View style={styles.priceRow1}>
                                        <Text style={styles.priceLabel}>Administrative Charges</Text>
                                        <RupeeAmount
                                            value={receipt?.administrative_charges ?? 0}
                                            style={styles.priceValue}
                                            iconSize={14}
                                            iconColor={Colors.primaryColor}
                                        />
                                    </View>

                                    <View style={styles.priceRow1}>
                                        <Text style={styles.priceLabel}>Digital Report Access</Text>
                                        <RupeeAmount
                                            value={receipt?.digital_report_access ?? 0}
                                            style={styles.priceValue}
                                            iconSize={14}
                                            iconColor={Colors.primaryColor}
                                        />
                                    </View>


                                    <View style={styles.dashed} />

                                    {/* TOTAL */}
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalText}>Total Paid</Text>
                                        <RupeeAmount
                                            value={
                                                receipt?.total_amount ??
                                                receipt?.consultation_fees ??
                                                0
                                            }
                                            style={styles.totalAmount}
                                            iconSize={16}
                                            iconColor={Colors.primaryColor}
                                        />
                                    </View>

                                    <View style={styles.noteBox}>
                                        <Text style={styles.noteText}>
                                            THIS IS A COMPUTER GENERATED RECEIPT. NO SIGNATURE IS REQUIRED.
                                        </Text>
                                    </View>

                                </View>
                            </View>

                        </ScrollView>

                        <TouchableOpacity style={styles.downloadBtn} onPress={downloadReceiptPDF}>
                            <TablerIcon name="file" size={15} color={'#FFFFFF'} />
                            <Text style={styles.downloadText}> Download Receipt</Text>
                        </TouchableOpacity>
                    </>
                )
            }

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
        padding: 12,
        borderRadius: 14,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E8EEF2',
        gap: 12,
    },

    docImg: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#E2E8F0',
    },

    docMeta: {
        flex: 1,
        minWidth: 0,
    },

    docLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    docName: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
    },

    docSpec: {
        marginTop: 2,
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },

    docId: {
        marginTop: 4,
        fontSize: 11,
        fontFamily: Fonts.PoppinsRegular,
        color: '#94A3B8',
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