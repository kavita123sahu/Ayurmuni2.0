import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '../common/Vector';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

const { width, height } = Dimensions.get('window');
const scale = (size: number) => (width / 375) * size;

const AssessmentType = (props: any) => {

    // ✅ FIXED PARAM ACCESS
    const { form } = props?.route?.params;

    console.log('AssessmentTypeScreenfrom:', props?.route?.params?.form,);

    // ✅ LOGIC
    const showMedical = form === 'medical';
    const showPrakriti = form === 'prakriti';

    const handleSkip = () => {
        props.navigation.replace('HomeStack', { screen: 'Home' });
    };

    return (
        <View style={styles.container}>

            {/* HEADER TEXT */}
            <View style={styles.header}>
                <Text style={styles.title}>Personalize Your Experience</Text>
                <Text style={styles.subtitle}>
                    Choose how you want us to understand you
                </Text>
            </View>

            {/* ✅ PRAKRITI CARD */}
            {showMedical && (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => props.navigation.navigate('PatientFAQ')}
                >
                    <View style={styles.row}>

                        {/* ICON */}
                        <View style={styles.iconBox}>
                            <Ionicons
                                name="leaf-outline"
                                size={22}
                                color={Colors.primaryColor}
                            />
                        </View>

                        {/* TEXT */}
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>Prakriti</Text>
                            <Text style={styles.cardSubtitle}>
                                Know your body type{"\n"}(Vata, Pitta, Kapha)
                            </Text>
                        </View>

                        {/* ARROW */}
                        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                    </View>
                </TouchableOpacity>
            )}

            {/* ✅ MEDICAL HISTORY CARD */}
            {showPrakriti && (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => props.navigation.navigate('MedicalHistory')}
                >
                    <View style={styles.row}>

                        {/* ICON */}
                        <View style={[styles.iconBox, { backgroundColor: '#E8F7F0' }]}>
                            <Ionicons
                                name="medkit-outline"
                                size={22}
                                color={Colors.questionGreen}
                            />
                        </View>

                        {/* TEXT */}
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>Medical History</Text>
                            <Text style={styles.cardSubtitle}>
                                Add past health{"\n"}conditions & Reports
                            </Text>
                        </View>

                        {/* ARROW */}
                        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                    </View>
                </TouchableOpacity>
            )}



            {/* ✅ SKIP BUTTON */}
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

        </View>
    );
};

export default AssessmentType;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8F7', // 🔥 better bg
        paddingHorizontal: 20,
    },

    header: {
        marginTop: height * 0.1,
        marginBottom: 30,
        alignItems: 'center',
    },

    title: {
        fontSize: 24,
        textAlign: 'center',
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#111827',
    },

    subtitle: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        color: '#6B7280',
        fontFamily: Fonts.PoppinsMedium,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,

        // 🔥 shadow improve
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,

        borderWidth: 1,
        borderColor: '#E5EAF0',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#E6F4F1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    textContainer: {
        flex: 1,
    },

    cardTitle: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#111827',
    },

    cardSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
        lineHeight: 18,
        fontFamily: Fonts.PoppinsMedium,
    },

    skipBtn: {
        marginTop: 50, // 🔥 bottom stick
        paddingVertical: height * 0.02,
        borderWidth: 1,
        borderRadius: 16,
        alignItems: 'center',
        borderColor: Colors.questionGreen,
        backgroundColor: '#fff',
        marginBottom: 20,
    },

    skipText: {
        color: Colors.questionGreen,
        fontSize: scale(15),
        fontFamily: Fonts.PoppinsMedium,
    },
});