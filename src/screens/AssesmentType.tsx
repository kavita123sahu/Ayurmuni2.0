import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Platform,
} from 'react-native';

import { Ionicons } from '../common/Vector';
import { Colors } from '../common/Colors';
import * as _ASSESS_SERVICE from '../services/AssesmentService';
import { Fonts } from '../common/Fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showSuccessToast } from '../config/Key';

const { width, height } = Dimensions.get('window');

// ✅ Controlled Responsive Scale
const scale = (size: number) => {
    const newSize = (width / 375) * size;
    return Math.min(Math.max(newSize, size * 0.92), size * 1.15);
};

const AssessmentType = (props: any) => {

    // ✅ DEFAULT CONDITION
    const { form = 'all' } = props?.route?.params || {};

    // ✅ SHOW CONDITIONS
    const showMedical =
        form === 'medical' || form === 'all';

    const showPrakriti =
        form === 'prakriti' || form === 'all';

    const SkipHandleAPI = async () => {
        try {
            const payload = {
                is_skipped: true,
            };

            const response: any =
                await _ASSESS_SERVICE.SkipAssesment(
                    payload,
                );

            console.log(
                'PRAKRITI_SKIP_RESPONSE =>',
                response,
            );

            if (!response?.success) {
                showSuccessToast(
                    response?.message ||
                    'Something went wrong',
                    'error',
                );
                return;
            }

            showSuccessToast(
                'Assessment skipped successfully',
                'success',
            );

            props?.navigation.replace(
                'Home',
            );

        } catch (error) {
            console.log(
                'PRAKRITI_SKIP_ERROR =>',
                error,
            );

            showSuccessToast(
                'Network Error',
                'error',
            );
        }
    };

    // ✅ SKIP
    const handleSkip = () => {
        SkipHandleAPI()
        props.navigation.replace('HomeStack', {
            screen: 'Home',
        });
    };

    // ✅ CARD COMPONENT
    const RenderCard = ({
        title,
        subtitle,
        icon,
        iconBg,
        iconColor,
        onPress,
    }: any) => (
        <TouchableOpacity
            activeOpacity={0.8}
            style={styles.card}
            onPress={onPress}
        >
            <View style={styles.row}>

                {/* ICON */}
                <View
                    style={[
                        styles.iconBox,
                        { backgroundColor: iconBg },
                    ]}
                >
                    <Ionicons
                        name={icon}
                        size={scale(22)}
                        color={iconColor}
                    />
                </View>

                {/* TEXT */}
                <View style={styles.textContainer}>
                    <Text
                        numberOfLines={1}
                        style={styles.cardTitle}
                    >
                        {title}
                    </Text>

                    <Text style={styles.cardSubtitle}>
                        {subtitle}
                    </Text>
                </View>

                {/* ARROW */}
                <Ionicons
                    name="chevron-forward"
                    size={scale(20)}
                    color="#6B7280"
                />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            Personalize Your Experience
                        </Text>

                        <Text style={styles.subtitle}>
                            Choose how you want us to understand you
                        </Text>
                    </View>

                    {/* CARDS */}
                    <View style={styles.cardsWrapper}>

                        {/* PRAKRITI */}
                        {showPrakriti && (
                            <RenderCard
                                title="Prakriti"
                                subtitle="Know your body type (Vata, Pitta, Kapha)"
                                icon="leaf-outline"
                                iconBg="#E6F4F1"
                                iconColor={Colors.primaryColor}
                                onPress={() =>
                                    props.navigation.navigate('PatientFAQ')
                                }
                            />
                        )}

                        {/* MEDICAL */}
                        {showMedical && (
                            <RenderCard
                                title="Medical History"
                                subtitle="Add past health conditions & reports"
                                icon="medkit-outline"
                                iconBg="#E8F7F0"
                                iconColor={Colors.questionGreen}
                                onPress={() =>
                                    props.navigation.navigate('MedicalHistory')
                                }
                            />
                        )}
                    </View>

                </ScrollView>

                {/* SKIP BUTTON */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.skipBtn}
                    onPress={handleSkip}
                >
                    <Text style={styles.skipText}>
                        Skip
                    </Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
};

export default AssessmentType;

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: '#F7F8F7',
    },

    container: {
        flex: 1,
        paddingHorizontal: 20,
    },

    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },

    header: {
        marginTop: height * 0.07,
        marginBottom: 32,
        alignItems: 'center',
    },

    title: {
        fontSize: scale(24),
        lineHeight: scale(34),
        textAlign: 'center',
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#111827',
        paddingHorizontal: 10,
    },

    subtitle: {
        fontSize: scale(14),
        lineHeight: scale(22),
        marginTop: 8,
        textAlign: 'center',
        color: '#6B7280',
        fontFamily: Fonts.PoppinsMedium,
        paddingHorizontal: 20,
    },

    cardsWrapper: {
        flex: 1,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,

        borderWidth: 1,
        borderColor: Colors.borderColor,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,

        elevation: 2,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconBox: {
        width: scale(52),
        height: scale(52),
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,

        // ✅ prevents shrinking
        flexShrink: 0,
    },

    textContainer: {
        flex: 1,
        paddingRight: 10,
    },

    cardTitle: {
        fontSize: scale(16),
        lineHeight: scale(24),
        color: '#111827',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    cardSubtitle: {
        marginTop: 4,
        fontSize: scale(13),
        lineHeight: scale(20),
        color: '#6B7280',
        fontFamily: Fonts.PoppinsMedium,

        // ✅ prevents overflow
        flexShrink: 1,
    },

    skipBtn: {
        marginBottom:
            Platform.OS === 'ios' ? 20 : 16,

        paddingVertical: 16,
        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',

        borderWidth: 1,
        borderColor: Colors.questionGreen,
        backgroundColor: '#FFFFFF',
    },

    skipText: {
        color: Colors.questionGreen,
        fontSize: scale(15),
        fontFamily: Fonts.PoppinsSemiBold,
    },
});